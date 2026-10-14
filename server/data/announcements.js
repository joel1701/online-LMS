// Sample data. Seeds the MongoDB `announcements` collection (npm run seed).
// a university-wide notice posted by the administration.
const { daysFromNow } = require('../utils/dates');

const ann = (id, courseId, title, body, postedBy, daysAgo, hour = 10) => ({
  id,
  courseId,
  title,
  body,
  postedBy,
  // clamp so "today" notices are never dated in the future
  postedAt: new Date(Math.min(new Date(daysFromNow(-daysAgo, hour, 15)).getTime(), Date.now() - 20 * 60000)).toISOString(),
});

const announcements = [
  ann('an-01', null, 'Mid-semester examination schedule published',
    'The schedule for mid-semester examinations of the V Semester 2026–27 is available on the Examinations notice board and the department offices. Students must carry their ID cards to every examination.',
    'u-a1', 18, 11),
  ann('an-02', null, 'Library hours extended during examinations',
    'The Central Library will remain open from 8:00 AM to 11:00 PM on all working days until the end of the semester.',
    'u-a2', 4, 9),
  ann('an-03', null, 'Course feedback window',
    'Mid-semester course feedback will open next week. Responses are anonymous and are shared with faculty only in aggregate.',
    'u-a1', 1, 16),

  ann('an-11', 'c-flat', 'NFA to DFA exercise – submissions closed',
    'Submissions for the NFA to DFA conversion exercise are now closed. Grading is in progress and marks will be released by the end of the week.',
    'u-t8', 0, 18),
  ann('an-12', 'c-flat', 'Quiz 2 is now open',
    'Quiz 2 on regular languages is open on the portal. You have 20 minutes once you start. Make sure you have a stable connection before you begin.',
    'u-t8', 1, 9),
  ann('an-13', 'c-flat', 'Thursday class moved to N-210',
    'This Thursday’s class will be held in N-210 (second floor) because of projector maintenance in N-108.',
    'u-t8', 6, 12),
  ann('an-14', 'c-flat', 'Mid-semester test results',
    'Results of the mid-semester test are now visible under Grades. Answer scripts can be reviewed during office hours on Tuesday and Wednesday.',
    'u-t8', 12, 15),

  ann('an-21', 'c-ml', 'Problem set clarification',
    'For problem 6 of the decision tree problem set, use entropy (not the Gini index) as the impurity measure.',
    'u-t2', 2, 17),
  ann('an-22', 'c-ml', 'Extra class on gradient descent',
    'An additional session on gradient descent and regularization will be held on Saturday from 10:00 to 12:00 in N-204. Attendance is optional.',
    'u-t2', 7, 13),

  ann('an-31', 'c-cn', 'Quiz on IP addressing next week',
    'The quiz on IP addressing and subnetting will be held next week on the portal. Revise the subnetting worksheet before the quiz.',
    'u-t3', 2, 11),

  ann('an-41', 'c-os', 'CPU scheduling simulator grades released',
    'Grades for the scheduling simulator are available. Those who did not submit should meet me before Friday.',
    'u-t4', 1, 14),

  ann('an-51', 'c-se', 'Team project – mid-review dates',
    'Mid-semester project reviews will be held in the second week of next month. Each team gets 15 minutes including questions. The schedule will be shared by the class representative.',
    'u-t1', 3, 10),

  ann('an-71', 'c-oscn-lab', 'Lab record submission',
    'Bring your updated lab records to the Wednesday session. Records will be evaluated in the lab.',
    'u-t4', 2, 12),

  ann('an-81', 'c-internship', 'Internship report deadline',
    'Internship-II reports and completion certificates must be uploaded on the portal by the deadline. Presentation slots will be shared after the deadline.',
    'u-t2', 6, 11),

  ann('an-61', 'c-ec303', 'MATLAB licence for DSP lab',
    'Campus MATLAB licences have been renewed. Python with NumPy and SciPy is also accepted for the FIR filter assignment.',
    'u-t5', 5, 10),
];

module.exports = announcements;
