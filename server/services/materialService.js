// TODO: Replace mockMaterialService with a MongoDB/Mongoose Material model
// and real file storage (GridFS, S3, etc.).
const materials = require('../data/materials');
const users = require('../data/users');
const { createId } = require('../utils/ids');
const { notFound, forbidden } = require('../utils/httpError');
const { check, isBlank } = require('../utils/validate');
const courseService = require('./courseService');
const activity = require('./activityService');

const TYPES = ['pdf', 'slides', 'notes', 'link', 'video'];

function withDetails(material) {
  const course = courseService.findRaw(material.courseId);
  const uploader = users.find((u) => u.id === material.uploadedBy);
  return {
    ...material,
    courseCode: course ? course.code : '',
    courseTitle: course ? course.title : '',
    uploadedByName: uploader ? uploader.name : '',
  };
}

function list(user, { courseId, search } = {}) {
  const allowed = new Set(courseService.accessibleCourseIds(user));
  if (courseId && !allowed.has(courseId)) throw forbidden('You do not have access to this course.');
  const term = String(search || '').trim().toLowerCase();

  return materials
    .filter((m) => allowed.has(m.courseId) && (!courseId || m.courseId === courseId))
    .filter((m) => !term || m.title.toLowerCase().includes(term) || (m.description || '').toLowerCase().includes(term))
    .sort((a, b) => b.week - a.week || new Date(b.uploadedAt) - new Date(a.uploadedAt))
    .map(withDetails);
}

function validate(data) {
  const week = Number(data.week);
  check([
    ['courseId', isBlank(data.courseId) && 'Select a course.'],
    ['title', isBlank(data.title) && 'Title is required.'],
    ['type', !TYPES.includes(data.type) && 'Select a material type.'],
    ['week', !(Number.isInteger(week) && week >= 1 && week <= 18) && 'Week must be between 1 and 18.'],
    ['url', data.type === 'link' && !/^https?:\/\/\S+$/.test(String(data.url || '')) && 'Enter a full URL starting with http:// or https://.'],
    ['fileName', data.type !== 'link' && isBlank(data.fileName) && 'Choose a file to upload.'],
  ]);
  return {
    courseId: data.courseId,
    title: String(data.title).trim(),
    type: data.type,
    week,
    description: String(data.description || '').trim(),
    fileName: data.type === 'link' ? null : String(data.fileName).trim(),
    fileSize: data.type === 'link' ? null : data.fileSize || null,
    url: data.type === 'link' ? String(data.url).trim() : null,
  };
}

function create(user, data) {
  const clean = validate(data);
  const course = courseService.requireManage(user, clean.courseId);
  const material = { id: createId('m-'), ...clean, uploadedAt: new Date().toISOString(), uploadedBy: user.id };
  materials.push(material);
  activity.record(user.id, 'material.added', `Added ${material.title}`, course.id);
  return withDetails(material);
}

function update(user, id, data) {
  const material = materials.find((m) => m.id === id);
  if (!material) throw notFound('Material');
  courseService.requireManage(user, material.courseId);
  const clean = validate({ ...material, ...data });
  courseService.requireManage(user, clean.courseId);
  Object.assign(material, clean);
  return withDetails(material);
}

function remove(user, id) {
  const index = materials.findIndex((m) => m.id === id);
  if (index === -1) throw notFound('Material');
  const material = materials[index];
  courseService.requireManage(user, material.courseId);
  materials.splice(index, 1);
  activity.record(user.id, 'material.removed', `Removed ${material.title}`, material.courseId);
}

module.exports = { list, create, update, remove, TYPES };
