// Notifications are derived from current data instead of being stored.
// TODO: Move to a `notifications` collection if read/unread state must persist.
const assignmentService = require('./assignmentService');
const testService = require('./testService');
const announcementService = require('./announcementService');
const activityService = require('./activityService');
const dashboardService = require('./dashboardService');

const DAY = 86400000;
const within = (iso, days) => Math.abs(Date.now() - new Date(iso).getTime()) <= days * DAY;

function forUser(user) {
  const items = [];

  if (user.role === 'student') {
    for (const a of assignmentService.list(user)) {
      if (a.status === 'pending' && new Date(a.dueDate) - Date.now() < 3 * DAY) {
        items.push({ id: `due-${a.id}`, type: 'deadline', text: `${a.courseCode}: “${a.title}” is due soon`, link: `/student/assignments/${a.id}`, at: a.dueDate });
      }
      if (a.status === 'graded' && within(a.submission.gradedAt, 5)) {
        items.push({ id: `grade-${a.id}`, type: 'grade', text: `${a.courseCode}: “${a.title}” has been graded`, link: `/student/assignments/${a.id}`, at: a.submission.gradedAt });
      }
    }
    for (const t of testService.list(user)) {
      if (t.state === 'available') {
        items.push({ id: `test-${t.id}`, type: 'test', text: `${t.courseCode}: ${t.title} is open`, link: '/student/tests', at: t.availableFrom });
      }
    }
  }

  if (user.role === 'teacher') {
    const { toGrade, upcomingTests } = dashboardService.forUser(user);
    const byAssignment = {};
    for (const s of toGrade) {
      byAssignment[s.assignmentId] = byAssignment[s.assignmentId] || { ...s, count: 0 };
      byAssignment[s.assignmentId].count += 1;
    }
    for (const g of Object.values(byAssignment)) {
      items.push({ id: `grade-${g.assignmentId}`, type: 'grading', text: `${g.count} submission${g.count > 1 ? 's' : ''} to grade for “${g.assignmentTitle}”`, link: `/teacher/assignments/${g.assignmentId}/submissions`, at: g.submittedAt });
    }
    for (const t of upcomingTests.filter((x) => x.status === 'draft')) {
      items.push({ id: `draft-${t.id}`, type: 'test', text: `${t.courseCode}: “${t.title}” is still a draft`, link: `/teacher/tests/${t.id}/edit`, at: t.availableFrom });
    }
  }

  if (user.role === 'admin') {
    for (const a of activityService.list(user, { limit: 5 })) {
      items.push({ id: `act-${a.id}`, type: 'activity', text: `${a.actorName}: ${a.detail}`, link: '/admin', at: a.at });
    }
  }

  if (user.role !== 'admin') {
    for (const a of announcementService.list(user, { limit: 10 }).filter((x) => within(x.postedAt, 3))) {
      items.push({
        id: `ann-${a.id}`,
        type: 'announcement',
        text: `${a.courseCode ? a.courseCode + ': ' : ''}${a.title}`,
        link: user.role === 'student' && a.courseId ? `/student/courses/${a.courseId}?tab=announcements` : user.role === 'teacher' && a.courseId ? `/teacher/courses/${a.courseId}?tab=announcements` : null,
        at: a.postedAt,
      });
    }
  }

  return items.sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 12);
}

module.exports = { forUser };
