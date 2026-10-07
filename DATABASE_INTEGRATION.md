# Database Integration (MongoDB)

The API currently runs on in-memory arrays. Controllers and the React app do not touch data directly, so MongoDB can be added by changing the **data** and **services** layers only.

## Where mock data lives

`server/data/` — one file per entity:

| File | Becomes collection |
| --- | --- |
| `users.js` | `users` |
| `departments.js` | `departments` (or keep as static config) |
| `courses.js` | `courses` |
| `materials.js` | `materials` |
| `assignments.js` | `assignments` |
| `submissions.js` | `submissions` |
| `tests.js` | `tests` (questions embedded) |
| `testAttempts.js` | `testattempts` |
| `announcements.js` | `announcements` |
| `activity.js` | `activitylogs` |

Seed dates are built with `utils/dates.js#daysFromNow`; a seed script can reuse these files to populate MongoDB once.

## Services to replace

Each file in `server/services/` imports the arrays above. Replace those array operations with Mongoose queries and make the functions `async` (controllers already work with async functions under Express 5).

| Service | Notes |
| --- | --- |
| `userService.js` | CRUD, `findByLogin` (email or universityId), `updateProfile`. Hash passwords. |
| `authService.js` | Replace base64 token with `jsonwebtoken`; compare with bcrypt. |
| `courseService.js` | Access checks (`canAccess`, `canManage`) and cascade delete. |
| `materialService.js` | Also add real file storage (GridFS / S3). |
| `assignmentService.js` | |
| `submissionService.js` | Upsert one submission per (assignment, student). |
| `testService.js` | Start/save/submit attempts; never return `correctIndex` to students. |
| `gradeService.js` | Computes grades from submissions + attempts (no stored grades needed). |
| `announcementService.js`, `activityService.js` | |
| `dashboardService.js`, `notificationService.js`, `progressService.js` | Compose other services; change only if queries need optimising. |

Also update: `server/middleware/auth.js` (verify JWT), `server/server.js` (connect before `listen`), `server/utils/ids.js` (remove; use ObjectIds).

Search the code for `TODO` to find every integration point.

## Suggested collections and relationships

```
User         { universityId (unique), name, email (unique), passwordHash, role: student|teacher|admin,
               department, semester?, program?, batch?, designation?, office?, phone, status: active|disabled, joinedOn }
Course       { code, title, department, semester, term, credits, teacherId -> User, studentIds [-> User],
               status: active|archived, weights { assignments, tests }, description, schedule [], syllabus [] }
Material     { courseId -> Course, week, title, type, description, fileName?, fileSize?, fileRef?, url?, uploadedBy -> User, uploadedAt }
Assignment   { courseId -> Course, title, description, issueDate, dueDate, maxMarks, attachment?, createdBy -> User }
Submission   { assignmentId -> Assignment, studentId -> User, fileName, fileSize, comment, submittedAt,
               status: submitted|graded, marks?, feedback, gradedAt?, gradedBy -> User }      unique (assignmentId, studentId)
Test         { courseId -> Course, title, instructions, durationMinutes, availableFrom, availableUntil,
               status: draft|published, showAnswers, questions [{ text, options [], correctIndex, marks }], createdBy -> User }
TestAttempt  { testId -> Test, studentId -> User, answers { questionId: optionIndex }, startedAt, submittedAt?,
               status: in-progress|submitted, score, totalMarks, correctCount, incorrectCount, unansweredCount }   unique (testId, studentId)
Announcement { courseId? -> Course (null = university-wide), title, body, postedBy -> User, postedAt }
ActivityLog  { actorId -> User, action, detail, courseId?, at }
Grade        optional cache of gradeService output, keyed by (studentId, courseId)
```

Enrolment is stored as `Course.studentIds`. If enrolment grows complex (sections, drops, history), move it to an `enrollments` collection.

## Environment variables

Already used: `PORT`, `CLIENT_ORIGIN`, `MOCK_LATENCY_MS` (remove after integration).

Needed for integration (listed in `server/.env.example`):

```
MONGODB_URI=mongodb://127.0.0.1:27017/campuscore
JWT_SECRET=<long random string>
JWT_EXPIRES_IN=1d
```

Add `dotenv` (or use `node --env-file=.env`) to load them.

## Existing endpoints

The full list with permissions is in `README.md` → *API overview*. Response shapes must stay the same so the frontend keeps working; in particular keep the `id` field (map `_id` to `id` with a `toJSON` transform) and the `{ message, fields }` validation error format.
