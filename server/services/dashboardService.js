// Builds the role-specific dashboard payloads by combining other services.
const users = require('../data/users');
const courses = require('../data/courses');
const departments = require('../data/departments');
const assignmentsData = require('../data/assignments');
const submissions = require('../data/submissions');
const courseService = require('./courseService');
const assignmentService = require('./assignmentService');
const testService = require('./testService');
const gradeService = require('./gradeService');
const announcementService = require('./announcementService');
const activityService = require('./activityService');
const progressService = require('./progressService');
const materialService = require('./materialService');

function student(user) {
  const myCourses = courseService.list(user, { status: 'active' }).map((c) => ({
    ...c,
    progress: progressService.studentProgress(c, user.id),
  }));

  const allAssignments = assignmentService.list(user);
  const dueSoon = allAssignments.filter((a) => a.status === 'pending').slice(0, 6);
  const overdue = allAssignments.filter((a) => a.status === 'overdue');

  const allTests = testService.list(user);
  const openTests = allTests.filter((t) => ['available', 'in-progress', 'upcoming'].includes(t.state)).slice(0, 5);

  const recentGrades = [
    ...allAssignments
      .filter((a) => a.status === 'graded')
      .map((a) => ({ kind: 'assignment', id: a.id, title: a.title, courseCode: a.courseCode, marks: a.submission.marks, maxMarks: a.maxMarks, date: a.submission.gradedAt })),
    ...allTests
      .filter((t) => t.state === 'completed')
      .map((t) => ({ kind: 'test', id: t.id, title: t.title, courseCode: t.courseCode, marks: t.attempt.score, maxMarks: t.totalMarks, date: t.attempt.submittedAt })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  const grades = gradeService.forStudent(user, {});

  return {
    courses: myCourses,
    dueSoon,
    overdueCount: overdue.length,
    tests: openTests,
    availableTestCount: allTests.filter((t) => t.state === 'available' || t.state === 'in-progress').length,
    recentGrades,
    performance: {
      sgpa: grades.sgpa,
      rows: grades.rows.map(({ courseId, code, title, total, letter, standing }) => ({ courseId, code, title, total, letter, standing })),
    },
    announcements: announcementService.list(user, { limit: 5 }),
  };
}

function teacher(user) {
  const myCourses = courseService.list(user, { status: 'active' });
  const courseIds = new Set(myCourses.map((c) => c.id));

  const allAssignments = assignmentService.list(user);
  const activeAssignments = allAssignments.filter((a) => !a.isClosed);

  const toGrade = submissions
    .filter((s) => s.status === 'submitted')
    .map((s) => ({ s, a: assignmentsData.find((a) => a.id === s.assignmentId) }))
    .filter(({ a }) => a && courseIds.has(a.courseId))
    .map(({ s, a }) => {
      const st = users.find((u) => u.id === s.studentId);
      const course = courses.find((c) => c.id === a.courseId);
      return {
        submissionId: s.id,
        assignmentId: a.id,
        assignmentTitle: a.title,
        courseCode: course.code,
        studentName: st ? st.name : '',
        universityId: st ? st.universityId : '',
        submittedAt: s.submittedAt,
        late: new Date(s.submittedAt) > new Date(a.dueDate),
      };
    })
    .sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));

  const allTests = testService.list(user);
  const upcomingTests = allTests.filter((t) => new Date(t.availableUntil) > new Date()).slice(0, 6);

  const coursesWithStats = myCourses.map((c) => {
    const perf = gradeService.coursePerformance(user, c.id);
    return {
      ...c,
      materialCount: materialService.list(user, { courseId: c.id }).length,
      activeAssignments: activeAssignments.filter((a) => a.courseId === c.id).length,
      awaitingGrading: toGrade.filter((g) => g.courseCode === c.code).length,
      averageTotal: perf.averageTotal,
      atRisk: perf.atRisk,
    };
  });

  return {
    courses: coursesWithStats,
    activeAssignments,
    toGrade,
    upcomingTests,
    recentActivity: activityService.list(user, { limit: 8 }),
  };
}

function admin(user) {
  const students = users.filter((u) => u.role === 'student');
  const teachers = users.filter((u) => u.role === 'teacher');

  const departmentRows = departments
    .filter((d) => d.code !== 'ADMIN')
    .map((d) => {
      const head = users.find((u) => u.id === d.headId);
      return {
        code: d.code,
        name: d.name,
        head: head ? head.name : '—',
        students: students.filter((s) => s.department === d.code && s.status === 'active').length,
        teachers: teachers.filter((t) => t.department === d.code && t.status === 'active').length,
        courses: courses.filter((c) => c.department === d.code && c.status === 'active').length,
      };
    });

  const unassigned = courses.filter((c) => c.status === 'active' && !teachers.some((t) => t.id === c.teacherId && t.status === 'active'));

  return {
    counts: {
      students: students.filter((s) => s.status === 'active').length,
      teachers: teachers.filter((t) => t.status === 'active').length,
      disabledUsers: users.filter((u) => u.status === 'disabled').length,
      activeCourses: courses.filter((c) => c.status === 'active').length,
      archivedCourses: courses.filter((c) => c.status === 'archived').length,
      departments: departmentRows.length,
    },
    departments: departmentRows,
    attention: unassigned.map((c) => ({ id: c.id, code: c.code, title: c.title, issue: 'Assigned teacher account is disabled' })),
    recentActivity: activityService.list(user, { limit: 10 }),
    term: courses.TERM,
  };
}

function forUser(user) {
  if (user.role === 'student') return student(user);
  if (user.role === 'teacher') return teacher(user);
  return admin(user);
}

module.exports = { forUser };
