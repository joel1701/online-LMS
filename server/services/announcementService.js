// TODO: Replace mockAnnouncementService with a MongoDB/Mongoose Announcement model.
const announcements = require('../data/announcements');
const users = require('../data/users');
const { createId } = require('../utils/ids');
const { notFound, forbidden } = require('../utils/httpError');
const { check, isBlank } = require('../utils/validate');
const courseService = require('./courseService');
const activity = require('./activityService');

function withDetails(a) {
  const author = users.find((u) => u.id === a.postedBy);
  const course = a.courseId ? courseService.findRaw(a.courseId) : null;
  return {
    ...a,
    authorName: author ? author.name : 'Administration',
    courseCode: course ? course.code : null,
    courseTitle: course ? course.title : null,
  };
}

function list(user, { courseId, scope, limit } = {}) {
  const allowed = new Set(courseService.accessibleCourseIds(user));
  if (courseId && !allowed.has(courseId)) throw forbidden('You do not have access to this course.');

  let rows = announcements.filter((a) => {
    if (courseId) return a.courseId === courseId;
    if (scope === 'general') return a.courseId === null;
    return a.courseId === null || allowed.has(a.courseId);
  });
  rows = [...rows].sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
  if (limit) rows = rows.slice(0, Number(limit));
  return rows.map(withDetails);
}

function create(user, data) {
  check([
    ['title', isBlank(data.title) && 'Title is required.'],
    ['title', !isBlank(data.title) && String(data.title).length > 140 && 'Keep the title under 140 characters.'],
    ['body', isBlank(data.body) && 'Write the announcement text.'],
  ]);

  const courseId = data.courseId || null;
  if (courseId) courseService.requireManage(user, courseId);
  else if (user.role !== 'admin') throw forbidden('Only administrators can post university-wide notices.');

  const announcement = {
    id: createId('an-'),
    courseId,
    title: String(data.title).trim(),
    body: String(data.body).trim(),
    postedBy: user.id,
    postedAt: new Date().toISOString(),
  };
  announcements.push(announcement);
  activity.record(user.id, 'announcement.posted', `Posted ${courseId ? 'announcement' : 'notice'}: ${announcement.title}`, courseId);
  return withDetails(announcement);
}

function remove(user, id) {
  const index = announcements.findIndex((a) => a.id === id);
  if (index === -1) throw notFound('Announcement');
  const a = announcements[index];
  const allowed = user.role === 'admin' || (a.courseId && courseService.canManage(user, courseService.findRaw(a.courseId)));
  if (!allowed) throw forbidden();
  announcements.splice(index, 1);
}

module.exports = { list, create, remove };
