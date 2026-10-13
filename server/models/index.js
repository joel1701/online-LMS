// All Mongoose models, keyed by the data module that holds the working copy.
module.exports = {
  users: require('./User'),
  departments: require('./Department'),
  courses: require('./Course'),
  materials: require('./Material'),
  assignments: require('./Assignment'),
  submissions: require('./Submission'),
  tests: require('./Test'),
  testAttempts: require('./TestAttempt'),
  announcements: require('./Announcement'),
  activity: require('./ActivityLog'),
};
