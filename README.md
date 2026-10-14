# CampusCore – Learning Management System

CampusCore is the learning management portal of Chaitanya Bharathi Institute of Technology, built on the MERN stack: a React frontend, an Express REST API and a MongoDB database (via Mongoose).

## Problem statement

A university needs a Learning Management System where:

- Teachers upload study materials, create assignments, conduct online tests and monitor student performance.
- Students access courses, submit assignments, take online tests and view grades.
- Administrators manage users and courses.

## Roles and features

**Student**
- Dashboard: assignments due, open and upcoming tests, recent grades, per-course standing, provisional SGPA, announcements
- Course list with coursework progress and the next open item
- Course page with Overview, Materials, Assignments, Tests, Announcements and Grades tabs
- Assignments filtered by All / Pending / Submitted / Graded / Overdue; submit or update a file and comment before the deadline
- Timed MCQ tests with question navigation, answered/flagged states, auto-save, resume after refresh, auto-submit when time runs out, confirmation before submitting, score and answer review
- Grades table with weighted totals, letter grades and per-item breakdown
- Profile with editable contact number

**Teacher (Faculty)**
- Dashboard: submissions awaiting grading, course overview, open assignments, tests, recent activity
- Course management: overview, enrolled students, announcements, materials, assignments, tests
- Study materials: add, edit, remove (PDF, slides, notes, video or link)
- Assignments: create, edit, delete; view the full class roster of submissions; enter marks (validated against maximum marks) and feedback
- Test builder: course, instructions, duration, availability window, MCQ questions with options, correct answer, marks, reordering and removal; save as draft or publish; questions are locked once a student has attempted
- Test results with per-student scores and per-question analysis
- Student performance: marks register, grade distribution, at-risk students and unsubmitted assignments

**Administrator**
- Dashboard: active students, faculty, courses, departments, disabled accounts, recent activity, university-wide notices
- Users: search, filter by role/department/status, add, edit, enable/disable, delete with confirmation
- Courses: search, filter, add, edit, archive/restore, delete with confirmation, assign teacher, department, semester and credits

Access is enforced twice: React routes are guarded by role, and every API endpoint checks the user's role and course membership.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, React Router 7, Vite, plain CSS with design tokens |
| Backend | Node.js, Express 5, REST |
| Database | MongoDB with Mongoose (see `DATABASE_INTEGRATION.md`) |

No UI framework or chart library is used.

## Folder structure

```
.
├── client/                    React app
│   ├── public/favicon.svg
│   └── src/
│       ├── components/        Sidebar, Header, PageHeader, DataTable, FormField, Tabs,
│       │                      StatusBadge, ConfirmDialog, Drawer, FilePicker, States, ...
│       ├── context/           AuthContext (demo login), ToastContext
│       ├── data/              navigation config
│       ├── hooks/             useApi, useDocumentTitle, useDismiss
│       ├── layouts/           PortalLayout (sidebar + header + content)
│       ├── pages/
│       │   ├── auth/          Login
│       │   ├── student/       Dashboard, Courses, Assignments, Tests, Grades, ...
│       │   ├── teacher/       Dashboard, Courses, Materials, Assignments, Tests, Performance, ...
│       │   ├── admin/         Dashboard, Users, Courses, CourseForm
│       │   └── shared/        Profile, NotFound, Forbidden, course overview, lists
│       ├── services/api.js    all HTTP calls
│       ├── styles/            tokens.css, base.css, layout.css, components.css, pages.css
│       └── utils/             formatting, mock file download
├── server/                    Express API
│   ├── controllers/
│   ├── config/db.js           MongoDB connection
│   ├── data/                  sample data used to seed the database
│   ├── db/                    loads MongoDB on startup and saves changes
│   ├── middleware/            auth, error handling, optional latency
│   ├── routes/
│   ├── models/                Mongoose schemas (one per collection)
│   ├── scripts/seed.js        resets the database to the sample data
│   ├── services/              business logic
│   ├── utils/
│   ├── app.js
│   └── server.js
├── DATABASE_INTEGRATION.md
└── package.json               convenience scripts
```

## Installation

Requires **Node.js 20.19+ or 22.12+** (needed by Vite 7) and npm.

```bash
npm run install:all
```

This runs `npm install` in both `server/` and `client/`.

### MongoDB

Install and start MongoDB Community Server locally (macOS with Homebrew):

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

Or create a free cluster on MongoDB Atlas and copy its connection string.

Then configure the API:

```bash
cp server/.env.example server/.env    # edit MONGODB_URI if you use Atlas
npm run seed --prefix server          # loads the sample data into MongoDB
```

On the first start the API also seeds any empty collection automatically. Run `npm run seed` again whenever you want to reset the data (the sample dates are relative to the day you seed, so re-seed before a demo). If `MONGODB_URI` is empty, the API runs on the sample data in memory instead.

## Running

Use two terminals from the project root.

**Backend** (http://localhost:5050/api)

```bash
npm run server
```

**Frontend** (http://localhost:5173)

```bash
npm run client
```

The Vite dev server proxies `/api` to the backend, so open http://localhost:5173.

Equivalent commands inside each folder: `cd server && npm run dev` (or `npm start`) and `cd client && npm run dev`. Production build of the frontend: `npm run build` (output in `client/dist`).

Environment variables live in `server/.env` (see `server/.env.example`): `MONGODB_URI`, `PORT` (default 5050), `CLIENT_ORIGIN` (CORS, default http://localhost:5173) and `MOCK_LATENCY_MS` (adds a delay to every API response to demonstrate loading states). If you change `PORT`, update the proxy target in `client/vite.config.js`.

## Demo accounts

The login page has one-click buttons for each role. To sign in manually, all demo accounts use the password `westmere2026`.

| Role | University ID | Email |
| --- | --- | --- |
| Student | 1601-24-737-039 | joel.thomas@westmere.edu.in |
| Faculty | WUF1042 | veerajyothi_it@cbit.ac.in |
| Administrator | WUA0007 | suresh.menon@westmere.edu.in |

Other seeded users (same password) include students 1601-24-737-002 to 1601-24-737-048 (CSE) and 1601-25-735-007 to 1601-25-735-022 (ECE), and faculty WUF1017, WUF1023, WUF1056, WUF1071, WUF1078, WUF2031, WUF3008. WUF1061 and 1601-25-735-030 are disabled accounts.

Dr. B. Veera Jyothi (WUF1042) teaches 22CSC21N Software Engineering and 22CSC49 Software Engineering Lab. Joel Thomas has an open test (CS305 Quiz 2), pending assignments, one overdue assignment and graded work in every course.

## API overview

All routes are under `/api`. Every route except `/auth/login` and `/health` requires `Authorization: Bearer <token>`.

| Method | Endpoint | Who |
| --- | --- | --- |
| POST | /auth/login | anyone |
| GET | /auth/me | signed in |
| GET | /dashboard, /notifications, /departments | signed in (role-specific payload) |
| GET | /activity | teacher, admin |
| GET / POST | /courses | list: by role · create: admin |
| GET / PUT / DELETE | /courses/:id | get: members · update/delete: admin |
| GET / POST | /materials | list: members · create: course teacher, admin |
| PUT / DELETE | /materials/:id | course teacher, admin |
| GET / POST | /assignments | list: members · create: course teacher, admin |
| GET / PUT / DELETE | /assignments/:id | get: members · change: course teacher, admin |
| GET | /submissions | student: own · staff: `?assignmentId=` roster |
| POST | /submissions | student (creates or updates before the deadline) |
| PUT | /submissions/:id/grade | course teacher, admin |
| GET / POST | /tests | list: members (students see published only) · create: staff |
| GET / PUT / DELETE | /tests/:id | get: members · change: course teacher, admin |
| POST | /tests/:id/start | student |
| PUT | /tests/:id/progress | student (auto-save) |
| POST | /tests/:id/submit | student |
| GET | /tests/:id/result | student (own result) |
| GET | /tests/:id/results | course teacher, admin |
| GET | /grades | student: own · staff: `?studentId=` |
| GET | /grades/courses/:courseId | course teacher, admin |
| GET / POST | /announcements | list: members · create: course teacher (course) or admin (university-wide) |
| DELETE | /announcements/:id | author's course teacher, admin |
| PUT | /users/me | signed in (contact details) |
| GET / POST | /users | admin |
| GET / PUT / DELETE | /users/:id | admin |

Validation errors return `400` with `{ message, fields: { fieldName: "error" } }`, which the forms display next to each field.

## Current limitations

- Sample dates are generated relative to the moment the database is seeded. Re-seed (`npm run seed`) before a demo so there is upcoming, due-soon and overdue work.
- Passwords are stored as bcrypt hashes, but the session token is unsigned base64. It should be replaced with a signed JWT.
- File uploads are simulated: only the file name and size are stored. Files picked in the current browser session can be downloaded again; other downloads return a short placeholder text file.
- Notifications are derived from current data; "mark as read" is kept only in the browser session.

## Database

See [`DATABASE_INTEGRATION.md`](DATABASE_INTEGRATION.md) for the collections, schemas and how the API reads and writes MongoDB.
