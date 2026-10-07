// Sidebar navigation per role. `end` marks links that should only be active on an exact match.
const navigation = {
  student: [
    { section: 'Overview', links: [{ to: '/student', label: 'Dashboard', end: true }] },
    {
      section: 'Learning',
      links: [
        { to: '/student/courses', label: 'My Courses' },
        { to: '/student/assignments', label: 'Assignments' },
        { to: '/student/tests', label: 'Online Tests' },
        { to: '/student/grades', label: 'Grades' },
      ],
    },
    { section: 'Account', links: [{ to: '/student/profile', label: 'Profile' }] },
  ],
  teacher: [
    { section: 'Overview', links: [{ to: '/teacher', label: 'Dashboard', end: true }] },
    {
      section: 'Teaching',
      links: [
        { to: '/teacher/courses', label: 'My Courses' },
        { to: '/teacher/materials', label: 'Study Materials' },
        { to: '/teacher/assignments', label: 'Assignments' },
        { to: '/teacher/tests', label: 'Tests' },
        { to: '/teacher/performance', label: 'Student Performance' },
      ],
    },
    { section: 'Account', links: [{ to: '/teacher/profile', label: 'Profile' }] },
  ],
  admin: [
    { section: 'Overview', links: [{ to: '/admin', label: 'Dashboard', end: true }] },
    {
      section: 'Administration',
      links: [
        { to: '/admin/users', label: 'Users' },
        { to: '/admin/courses', label: 'Courses' },
      ],
    },
    { section: 'Account', links: [{ to: '/admin/profile', label: 'Profile' }] },
  ],
};

export default navigation;

export const CURRENT_TERM = 'Odd Semester 2026–27';
