# Database (MongoDB)

The API stores all data in MongoDB using Mongoose. The React app is unchanged: it still calls the same REST endpoints and receives the same response shapes.

## Setup

1. Start MongoDB (local Community Server, or a MongoDB Atlas cluster).
2. `cp server/.env.example server/.env` and set `MONGODB_URI`, e.g.
   - local: `mongodb://127.0.0.1:27017/campuscore`
   - Atlas: `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/campuscore`
3. `cd server && npm install && npm run seed`
4. `npm run dev` – the log shows `Connected to MongoDB at …` and `(MongoDB)`.

`GET /api/health` returns `{ "dataSource": "MongoDB" }` when the database is in use.

## Collections

| Collection | Model | Key relationships |
| --- | --- | --- |
| `users` | `models/User.js` | unique `universityId`, `email`; passwords stored as bcrypt `passwordHash` |
| `departments` | `models/Department.js` | `headId` → users |
| `courses` | `models/Course.js` | `teacherId` → users, `studentIds[]` → users (enrolment), `type` theory/practical |
| `materials` | `models/Material.js` | `courseId` → courses, `uploadedBy` → users |
| `assignments` | `models/Assignment.js` | `courseId` → courses, `createdBy` → users |
| `submissions` | `models/Submission.js` | `assignmentId` → assignments, `studentId` → users; unique (assignmentId, studentId) |
| `tests` | `models/Test.js` | `courseId` → courses; questions embedded |
| `testattempts` | `models/TestAttempt.js` | `testId` → tests, `studentId` → users; unique (testId, studentId) |
| `announcements` | `models/Announcement.js` | `courseId` → courses (null = university-wide), `postedBy` → users |
| `activitylogs` | `models/ActivityLog.js` | `actorId` → users, `courseId` → courses |

Every document carries an application `id` (for example `c-ml`, `u-s1`) that the API and frontend use; MongoDB's `_id` stays internal. Grades are not stored: `services/gradeService.js` computes them from submissions and test attempts using the CBIT 10-point scale (S, A, B, C, D, E, F).

## How reads and writes work

`server/db/store.js`:

- **Startup** – connects, builds indexes, seeds any empty collection from `server/data/`, then loads every collection into the working arrays the services use.
- **Every request** – before the response is sent, documents that were created, changed or deleted during the request are written to MongoDB with a single `bulkWrite` per collection (`replaceOne` with upsert, or `deleteOne`). The client only receives a success response after the data is saved.

The services stay synchronous, so business rules (access checks, deadlines, test timing, grading) are unchanged.

## Scripts

| Command (in `server/`) | What it does |
| --- | --- |
| `npm run seed` | Deletes all collections and inserts the sample data again. Dates are relative to today. |
| `npm run dev` | Starts the API with auto-restart. |

## Next steps

- Replace the base64 session token with a signed JWT (`jsonwebtoken`, `JWT_SECRET`).
- Store uploaded files (GridFS or object storage) instead of only the file name and size.
