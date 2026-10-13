const users = require('../data/users');
const courses = require('../data/courses');
const departments = require('../data/departments');
const { createId } = require('../utils/ids');
const { hashPassword } = require('../utils/password');
const { notFound, conflict, badRequest } = require('../utils/httpError');
const { check, isBlank, isEmail } = require('../utils/validate');
const activity = require('./activityService');

const ROLES = ['student', 'teacher', 'admin'];

function toPublic(user) {
  if (!user) return null;
  const { password, passwordHash, ...rest } = user;
  const dept = departments.find((d) => d.code === user.department);
  return { ...rest, departmentName: dept ? dept.name : user.department };
}

function findRaw(id) {
  return users.find((u) => u.id === id);
}

function findByLogin(identifier) {
  const key = String(identifier || '').trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === key || u.universityId.toLowerCase() === key);
}

function list({ role, department, status, search } = {}) {
  const term = String(search || '').trim().toLowerCase();
  return users
    .filter((u) => !role || u.role === role)
    .filter((u) => !department || u.department === department)
    .filter((u) => !status || u.status === status)
    .filter(
      (u) =>
        !term ||
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.universityId.toLowerCase().includes(term)
    )
    .map(toPublic);
}

function getById(id) {
  const user = findRaw(id);
  if (!user) throw notFound('User');
  return toPublic(user);
}

function validateUser(data, existingId) {
  const role = data.role;
  const semester = Number(data.semester);
  const uid = String(data.universityId || '').trim().toUpperCase();
  const email = String(data.email || '').trim().toLowerCase();

  check([
    ['name', isBlank(data.name) && 'Name is required.'],
    ['universityId', isBlank(uid) && 'University ID is required.'],
    ['universityId', !isBlank(uid) && !/^[A-Z0-9-]{5,20}$/.test(uid) && 'Use 5–20 letters, digits or hyphens, e.g. 1601-24-737-039.'],
    ['universityId', users.some((u) => u.id !== existingId && u.universityId === uid) && 'This university ID is already in use.'],
    ['email', !isEmail(email) && 'Enter a valid email address.'],
    ['email', users.some((u) => u.id !== existingId && u.email.toLowerCase() === email) && 'This email is already registered.'],
    ['role', !ROLES.includes(role) && 'Select a role.'],
    ['department', !departments.some((d) => d.code === data.department) && 'Select a department.'],
    ['semester', role === 'student' && !(semester >= 1 && semester <= 8) && 'Semester must be between 1 and 8.'],
    ['program', role === 'student' && isBlank(data.program) && 'Program is required for students.'],
    ['status', data.status && !['active', 'disabled'].includes(data.status) && 'Invalid status.'],
  ]);

  return {
    universityId: uid,
    name: String(data.name).trim(),
    email,
    role,
    department: data.department,
    semester: role === 'student' ? semester : undefined,
    program: role === 'student' ? String(data.program).trim() : undefined,
    designation: role !== 'student' ? String(data.designation || '').trim() : undefined,
    status: data.status || 'active',
  };
}

function create(data, actor) {
  const clean = validateUser(data);
  const user = {
    id: createId('u-'),
    ...clean,
    // TODO: generate a temporary password and email it once real auth exists.
    passwordHash: hashPassword(users.DEMO_PASSWORD),
    phone: '',
    joinedOn: new Date().toISOString().slice(0, 10),
  };
  if (user.role === 'student') user.batch = '';
  users.push(user);
  activity.record(actor.id, 'user.created', `Created ${user.role} account ${user.universityId} (${user.name})`);
  return toPublic(user);
}

function update(id, data, actor) {
  const user = findRaw(id);
  if (!user) throw notFound('User');

  const merged = { ...user, ...data };
  const clean = validateUser(merged, id);

  if (user.id === actor.id && (clean.status === 'disabled' || clean.role !== 'admin')) {
    throw badRequest('You cannot disable your own account or remove your own administrator role.');
  }
  if (user.role === 'teacher' && clean.role !== 'teacher' && courses.some((c) => c.teacherId === id && c.status === 'active')) {
    throw conflict('This teacher is assigned to active courses. Reassign those courses before changing the role.');
  }

  const statusChanged = user.status !== clean.status;
  Object.assign(user, clean);
  if (user.role !== 'student') {
    delete user.semester;
    delete user.program;
  }

  activity.record(
    actor.id,
    statusChanged ? `user.${user.status === 'active' ? 'enabled' : 'disabled'}` : 'user.updated',
    `${statusChanged ? (user.status === 'active' ? 'Enabled' : 'Disabled') : 'Updated'} account ${user.universityId} (${user.name})`
  );
  return toPublic(user);
}

function remove(id, actor) {
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) throw notFound('User');
  const user = users[index];

  if (user.id === actor.id) throw badRequest('You cannot delete your own account.');
  const taught = courses.filter((c) => c.teacherId === id);
  if (taught.length) {
    throw conflict(`This teacher is assigned to ${taught.map((c) => c.code).join(', ')}. Reassign or delete those courses first.`);
  }

  users.splice(index, 1);
  for (const course of courses) {
    course.studentIds = course.studentIds.filter((sid) => sid !== id);
  }
  // Submissions and attempts are kept as historical records.
  activity.record(actor.id, 'user.deleted', `Deleted account ${user.universityId} (${user.name})`);
}

const PROFILE_FIELDS = { student: ['phone'], teacher: ['phone', 'office'], admin: ['phone'] };

function updateProfile(id, data) {
  const user = findRaw(id);
  if (!user) throw notFound('User');
  const phone = String(data.phone ?? user.phone ?? '').trim();
  check([['phone', phone && !/^\+?[0-9 ()-]{7,20}$/.test(phone) && 'Enter a valid phone number.']]);

  for (const field of PROFILE_FIELDS[user.role]) {
    if (data[field] !== undefined) user[field] = String(data[field]).trim();
  }
  return toPublic(user);
}

module.exports = { toPublic, findRaw, findByLogin, list, getById, create, update, remove, updateProfile, PROFILE_FIELDS };
