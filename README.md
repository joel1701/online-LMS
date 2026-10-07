# CampusCore – Learning Management System

CampusCore is the learning management portal of Westmere University (a fictional institution used for this project). It is built on the MERN stack. The React frontend and the Express REST API are complete; the API currently serves **in-memory mock data** so that MongoDB can be added later without changing the frontend.

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
| Database | MongoDB planned — **not connected yet** (see `DATABASE_INTEGRATION.md`) |

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
│   ├── data/                  ALL mock data lives here
│   ├── middleware/            auth, error handling, optional latency
│   ├── routes/
│   ├── services/              business logic (the layer to replace with MongoDB)
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

Optional environment variables (see `server/.env.example`): `PORT` (default 5050), `CLIENT_ORIGIN` (CORS, default http://localhost:5173), `MOCK_LATENCY_MS` (adds a delay to every API response to demonstrate loading states). Set them in the shell, e.g. `MOCK_LATENCY_MS=600 npm run dev`. If you change `PORT`, update the proxy target in `client/vite.config.js`.

## Demo accounts

The login page has one-click buttons for each role. To sign in manually, all demo accounts use the password `westmere2026`.

| Role | University ID | Email |
| --- | --- | --- |
| Student | WU23CS014 | joel.thomas@westmere.edu.in |
| Faculty | WUF1042 | ananya.rao@westmere.edu.in |
| Administrator | WUA0007 | suresh.menon@westmere.edu.in |

Other seeded users (same password) include students WU23CS002–WU23CS048 and WU24EC007–WU24EC022, and faculty WUF1017, WUF1023, WUF1056, WUF2031, WUF3008. WUF1061 and WU24EC030 are disabled accounts.

Dr. Ananya Rao teaches CS305 (DBMS) and SE311 (Software Engineering). Joel Thomas has an open test (CS305 Quiz 2), pending assignments, one overdue assignment and graded work in every course.

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

## Current limitations (mock data)

- Data is kept in memory. Every change (submissions, grades, new users, tests) lasts until the API server restarts, then the seed data returns.
- Mock dates are generated relative to the moment the server starts, so there is always upcoming, due-soon and overdue work.
- Authentication is a demo: passwords are plain text in `server/data/users.js` and the token is unsigned base64. It is not secure and must be replaced (bcrypt + JWT).
- File uploads are simulated: only the file name and size are stored. Files picked in the current browser session can be downloaded again; other downloads return a short placeholder text file.
- Notifications are derived from current data; "mark as read" is kept only in the browser session.

## Database integration handoff

See [`DATABASE_INTEGRATION.md`](DATABASE_INTEGRATION.md) for where the mock data lives, which services to replace, the proposed collections and relationships, and the environment variables needed.
