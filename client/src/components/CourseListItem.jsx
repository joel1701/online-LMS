import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import { formatShortDateTime } from '../utils/format';

// One enrolled course row for the student course list and dashboard.
export default function CourseListItem({ course, compact }) {
  const next = course.progress && course.progress.next;
  return (
    <li className="course-row">
      <div className="course-row__main">
        <div className="course-row__title">
          <span className="course-code">{course.code}</span>
          <Link to={`/student/courses/${course.id}`}>{course.title}</Link>
        </div>
        <div className="course-row__meta">
          {course.teacher ? course.teacher.name : 'Instructor to be assigned'}
          {!compact && (
            <>
              {' · '}
              {course.credits} {course.credits === 1 ? 'credit' : 'credits'} · Semester {course.semester}
            </>
          )}
        </div>
      </div>
      <div className="course-row__progress">
        <span className="course-row__label">Coursework completed</span>
        <ProgressBar value={course.progress ? course.progress.percent : 0} tone="" srLabel={`${course.code} coursework completed`} />
      </div>
      <div className="course-row__next">
        <span className="course-row__label">Next</span>
        {next ? (
          <span>
            <span className="table__primary">{next.title}</span>
            <span className="table__sub">
              {next.kind === 'test' ? (next.upcoming ? 'Test opens ' : 'Test closes ') : 'Due '}
              {formatShortDateTime(next.when)}
            </span>
          </span>
        ) : (
          <span className="muted">Nothing open</span>
        )}
      </div>
    </li>
  );
}
