// Sample data. Seeds the MongoDB `users` collection (npm run seed).
// because this is mock data — hash them (bcrypt) when real auth is added.
const DEMO_PASSWORD = 'westmere2026';

const CSE_PROGRAM = 'B.Tech Computer Science and Engineering';
const ECE_PROGRAM = 'B.Tech Electronics and Communication Engineering';

// Roll number format: 1601-YY-BBB-NNN (college code, year of joining, branch code, serial)
function batchFor(universityId) {
  const start = 2000 + Number(universityId.slice(5, 7));
  return `${start}–${start + 4}`;
}

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
    batch: batchFor(universityId),
    phone: '',
    status: 'active',
    joinedOn: `20${universityId.slice(5, 7)}-08-01`,
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

  teacher('u-t1', 'WUF1042', 'Dr. B. Veera Jyothi', 'veerajyothi_it@cbit.ac.in', 'CSE', 'Associate Professor', {
    office: 'CSE Block, Room 312',
    joinedOn: '2015-07-20',
  }),
  teacher('u-t2', 'WUF1017', 'Dr. T. Prathima', 'tprathima_it@cbit.ac.in', 'CSE', 'Professor', {
    office: 'CSE Block, Room 301',
    joinedOn: '2009-08-03',
  }),
  teacher('u-t3', 'WUF1056', 'Dr. P. Ramesh Babu', 'prameshbabu_it@cbit.ac.in', 'CSE', 'Assistant Professor', {
    office: 'CSE Block, Room 318',
    joinedOn: '2019-07-15',
  }),
  teacher('u-t4', 'WUF1023', 'Ms. T. Madhuri', 'tmadhuri_it@cbit.ac.in', 'CSE', 'Associate Professor', {
    office: 'CSE Block, Room 309',
    joinedOn: '2012-01-09',
  }),
  teacher('u-t8', 'WUF1071', 'Dr. R M Krishna Sureddi', 'rmkrishnasureddi_it@cbit.ac.in', 'CSE', 'Associate Professor', {
    office: 'CSE Block, Room 314',
    joinedOn: '2011-07-04',
  }),
  teacher('u-t9', 'WUF1078', 'Mr. R. Sai Venkat', 'saivenkatr_it@cbit.ac.in', 'CSE', 'Assistant Professor', {
    office: 'CSE Block, Room 320',
    joinedOn: '2020-07-13',
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

  student('u-s1', '1601-24-737-039', 'Joel Thomas', 'joel.thomas@westmere.edu.in', 'CSE', 5, CSE_PROGRAM, { phone: '+91 98450 22714' }),
  student('u-s2', '1601-24-737-002', 'Aarav Mehta', 'aarav.mehta@westmere.edu.in', 'CSE', 5, CSE_PROGRAM),
  student('u-s3', '1601-24-737-031', 'Neha Reddy', 'neha.reddy@westmere.edu.in', 'CSE', 5, CSE_PROGRAM),
  student('u-s4', '1601-24-737-027', 'Rohan Kapoor', 'rohan.kapoor@westmere.edu.in', 'CSE', 5, CSE_PROGRAM),
  student('u-s5', '1601-24-737-036', 'Priya Nair', 'priya.nair@westmere.edu.in', 'CSE', 5, CSE_PROGRAM),
  student('u-s6', '1601-24-737-019', 'Karthik Iyer', 'karthik.iyer@westmere.edu.in', 'CSE', 5, CSE_PROGRAM),
  student('u-s7', '1601-24-737-041', 'Sneha Kulkarni', 'sneha.kulkarni@westmere.edu.in', 'CSE', 5, CSE_PROGRAM),
  student('u-s8', '1601-24-737-005', 'Arjun Menon', 'arjun.menon@westmere.edu.in', 'CSE', 5, CSE_PROGRAM),
  student('u-s9', '1601-24-737-012', 'Fatima Sheikh', 'fatima.sheikh@westmere.edu.in', 'CSE', 5, CSE_PROGRAM),
  student('u-s10', '1601-24-737-048', 'Vivek Bhat', 'vivek.bhat@westmere.edu.in', 'CSE', 5, CSE_PROGRAM),
  student('u-s11', '1601-25-735-007', 'Ishita Verma', 'ishita.verma@westmere.edu.in', 'ECE', 3, ECE_PROGRAM),
  student('u-s12', '1601-25-735-015', 'Siddharth Joshi', 'siddharth.joshi@westmere.edu.in', 'ECE', 3, ECE_PROGRAM),
  student('u-s13', '1601-25-735-022', 'Meera Pillai', 'meera.pillai@westmere.edu.in', 'ECE', 3, ECE_PROGRAM),
  student('u-s14', '1601-25-735-030', 'Aditya Kulkarni', 'aditya.kulkarni@westmere.edu.in', 'ECE', 3, ECE_PROGRAM, { status: 'disabled' }),
];

module.exports = users;
module.exports.DEMO_PASSWORD = DEMO_PASSWORD;
