// TODO: Replace with the `users` collection. Passwords are plain text only
// because this is mock data — hash them (bcrypt) when real auth is added.
const DEMO_PASSWORD = 'westmere2026';

const CSE_PROGRAM = 'B.Tech Computer Science and Engineering';
const ECE_PROGRAM = 'B.Tech Electronics and Communication Engineering';

function student(id, universityId, name, email, department, semester, program, extra = {}) {
  return {
    id,
    universityId,
    name,
    email,
    password: DEMO_PASSWORD,
    role: 'student',
    department,
    semester,
    program,
    batch: universityId.startsWith('WU23') ? '2023–2027' : '2024–2028',
    phone: '',
    status: 'active',
    joinedOn: universityId.startsWith('WU23') ? '2023-08-01' : '2024-08-01',
    ...extra,
  };
}

function teacher(id, universityId, name, email, department, designation, extra = {}) {
  return {
    id,
    universityId,
    name,
    email,
    password: DEMO_PASSWORD,
    role: 'teacher',
    department,
    designation,
    office: '',
    phone: '',
    status: 'active',
    joinedOn: '2016-07-01',
    ...extra,
  };
}

const users = [
  {
    id: 'u-a1',
    universityId: 'WUA0007',
    name: 'Suresh Menon',
    email: 'suresh.menon@westmere.edu.in',
    password: DEMO_PASSWORD,
    role: 'admin',
    department: 'ADMIN',
    designation: 'Deputy Registrar, Academic Systems',
    phone: '+91 80 4120 7700',
    status: 'active',
    joinedOn: '2014-06-02',
  },
  {
    id: 'u-a2',
    universityId: 'WUA0011',
    name: 'Kavita Joshi',
    email: 'kavita.joshi@westmere.edu.in',
    password: DEMO_PASSWORD,
    role: 'admin',
    department: 'ADMIN',
    designation: 'Academic Records Officer',
    phone: '',
    status: 'active',
    joinedOn: '2019-01-14',
  },

  teacher('u-t1', 'WUF1042', 'Dr. Ananya Rao', 'ananya.rao@westmere.edu.in', 'CSE', 'Associate Professor', {
    office: 'CSE Block, Room 312',
    phone: '+91 80 4120 7312',
    joinedOn: '2015-07-20',
  }),
  teacher('u-t2', 'WUF1017', 'Prof. Vikram Shah', 'vikram.shah@westmere.edu.in', 'CSE', 'Professor and Head of Department', {
    office: 'CSE Block, Room 301',
    joinedOn: '2009-08-03',
  }),
  teacher('u-t3', 'WUF1056', 'Dr. Meenakshi Iyer', 'meenakshi.iyer@westmere.edu.in', 'CSE', 'Assistant Professor', {
    office: 'CSE Block, Room 318',
    joinedOn: '2019-07-15',
  }),
  teacher('u-t4', 'WUF1023', 'Prof. Rajesh Kumar', 'rajesh.kumar@westmere.edu.in', 'CSE', 'Associate Professor', {
    office: 'CSE Block, Room 309',
    joinedOn: '2012-01-09',
  }),
  teacher('u-t5', 'WUF2031', 'Dr. Lakshmi Narayanan', 'lakshmi.narayanan@westmere.edu.in', 'ECE', 'Professor and Head of Department', {
    office: 'ECE Block, Room 201',
    joinedOn: '2010-07-01',
  }),
  teacher('u-t6', 'WUF3008', 'Dr. Harish Deshpande', 'harish.deshpande@westmere.edu.in', 'MATH', 'Associate Professor', {
    office: 'Science Block, Room 104',
    joinedOn: '2013-07-22',
  }),
  teacher('u-t7', 'WUF1061', 'Dr. Farhan Qureshi', 'farhan.qureshi@westmere.edu.in', 'CSE', 'Assistant Professor', {
    status: 'disabled',
    joinedOn: '2021-07-12',
  }),

  student('u-s1', 'WU23CS014', 'Joel Thomas', 'joel.thomas@westmere.edu.in', 'CSE', 5, CSE_PROGRAM, { phone: '+91 98450 22714' }),
  student('u-s2', 'WU23CS002', 'Aarav Mehta', 'aarav.mehta@westmere.edu.in', 'CSE', 5, CSE_PROGRAM),
  student('u-s3', 'WU23CS031', 'Neha Reddy', 'neha.reddy@westmere.edu.in', 'CSE', 5, CSE_PROGRAM),
  student('u-s4', 'WU23CS027', 'Rohan Kapoor', 'rohan.kapoor@westmere.edu.in', 'CSE', 5, CSE_PROGRAM),
  student('u-s5', 'WU23CS036', 'Priya Nair', 'priya.nair@westmere.edu.in', 'CSE', 5, CSE_PROGRAM),
  student('u-s6', 'WU23CS019', 'Karthik Iyer', 'karthik.iyer@westmere.edu.in', 'CSE', 5, CSE_PROGRAM),
  student('u-s7', 'WU23CS041', 'Sneha Kulkarni', 'sneha.kulkarni@westmere.edu.in', 'CSE', 5, CSE_PROGRAM),
  student('u-s8', 'WU23CS005', 'Arjun Menon', 'arjun.menon@westmere.edu.in', 'CSE', 5, CSE_PROGRAM),
  student('u-s9', 'WU23CS012', 'Fatima Sheikh', 'fatima.sheikh@westmere.edu.in', 'CSE', 5, CSE_PROGRAM),
  student('u-s10', 'WU23CS048', 'Vivek Bhat', 'vivek.bhat@westmere.edu.in', 'CSE', 5, CSE_PROGRAM),
  student('u-s11', 'WU24EC007', 'Ishita Verma', 'ishita.verma@westmere.edu.in', 'ECE', 3, ECE_PROGRAM),
  student('u-s12', 'WU24EC015', 'Siddharth Joshi', 'siddharth.joshi@westmere.edu.in', 'ECE', 3, ECE_PROGRAM),
  student('u-s13', 'WU24EC022', 'Meera Pillai', 'meera.pillai@westmere.edu.in', 'ECE', 3, ECE_PROGRAM),
  student('u-s14', 'WU24EC030', 'Aditya Kulkarni', 'aditya.kulkarni@westmere.edu.in', 'ECE', 3, ECE_PROGRAM, { status: 'disabled' }),
];

module.exports = users;
module.exports.DEMO_PASSWORD = DEMO_PASSWORD;
