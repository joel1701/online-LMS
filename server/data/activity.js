// Sample data. Seeds the MongoDB `activitylogs` collection (npm run seed).
const { daysFromNow } = require('../utils/dates');

const log = (id, actorId, action, detail, courseId, daysAgo, hour) => ({
  id,
  actorId,
  action,
  detail,
  courseId,
  at: daysFromNow(-daysAgo, hour, 20),
});

const activity = [
  log('ac-01', 'u-a1', 'user.disabled', 'Disabled account WUF1061 (Dr. Farhan Qureshi) – on sabbatical leave', null, 9, 11),
  log('ac-02', 'u-a2', 'user.disabled', 'Disabled account 1601-25-735-030 (Aditya Kulkarni) – semester break approved', null, 7, 15),
  log('ac-03', 'u-a1', 'course.archived', 'Archived CS215 Object Oriented Programming (III Semester 2025–26)', null, 6, 10),
  log('ac-04', 'u-a2', 'course.updated', 'Updated schedule for MA201 Probability and Statistics', 'c-ma201', 5, 12),
  log('ac-05', 'u-t1', 'test.published', 'Published Quiz 2: Regular Languages', 'c-flat', 1, 9),
  log('ac-06', 'u-t8', 'assignment.created', 'Created JFLAP Exercise – Regular Expressions to NFA', 'c-flat', 2, 9),
  log('ac-07', 'u-t2', 'assignment.created', 'Created Decision Tree Problem Set', 'c-ml', 5, 9),
  log('ac-08', 'u-t4', 'grades.released', 'Graded CPU Scheduling Simulator', 'c-os', 1, 14),
  log('ac-09', 'u-t1', 'material.added', 'Added JFLAP – Download and Tutorials', 'c-flat', 3, 10),
  log('ac-10', 'u-a1', 'announcement.posted', 'Posted notice: Course feedback window', null, 1, 16),
];

module.exports = activity;
