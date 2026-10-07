// TODO: Replace mock array access with an ActivityLog model.
const activity = require('../data/activity');
const users = require('../data/users');
const courses = require('../data/courses');
const { createId } = require('../utils/ids');

function record(actorId, action, detail, courseId = null) {
  activity.unshift({ id: createId('ac-'), actorId, action, detail, courseId, at: new Date().toISOString() });
}

function withActor(entry) {
  const actor = users.find((u) => u.id === entry.actorId);
  const course = entry.courseId ? courses.find((c) => c.id === entry.courseId) : null;
  return {
    ...entry,
    actorName: actor ? actor.name : 'Unknown user',
    actorRole: actor ? actor.role : null,
    courseCode: course ? course.code : null,
  };
}

function list(user, { limit = 20 } = {}) {
  let rows = activity;
  if (user.role === 'teacher') {
    const mine = new Set(courses.filter((c) => c.teacherId === user.id).map((c) => c.id));
    rows = rows.filter((a) => a.actorId === user.id || (a.courseId && mine.has(a.courseId)));
  } else if (user.role !== 'admin') {
    return [];
  }
  return [...rows]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, Number(limit))
    .map(withActor);
}

module.exports = { record, list };
