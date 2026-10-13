// Maps each MongoDB collection to the in-process array the services work with.
const models = require('../models');

module.exports = [
  { name: 'users', model: models.users, data: require('../data/users'), key: 'id' },
  { name: 'departments', model: models.departments, data: require('../data/departments'), key: 'code' },
  { name: 'courses', model: models.courses, data: require('../data/courses'), key: 'id' },
  { name: 'materials', model: models.materials, data: require('../data/materials'), key: 'id' },
  { name: 'assignments', model: models.assignments, data: require('../data/assignments'), key: 'id' },
  { name: 'submissions', model: models.submissions, data: require('../data/submissions'), key: 'id' },
  { name: 'tests', model: models.tests, data: require('../data/tests'), key: 'id' },
  { name: 'testAttempts', model: models.testAttempts, data: require('../data/testAttempts'), key: 'id' },
  { name: 'announcements', model: models.announcements, data: require('../data/announcements'), key: 'id' },
  { name: 'activity', model: models.activity, data: require('../data/activity'), key: 'id' },
];
