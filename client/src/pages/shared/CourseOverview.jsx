import DataTable from '../../components/DataTable';

export default function CourseOverview({ course, children }) {
  return (
    <div className="overview-grid">
      <div>
        <section className="panel">
          <div className="panel__head">
            <h2>About this course</h2>
          </div>
          <div className="panel__body">
            <p className="prose">{course.description || 'No description has been added yet.'}</p>
          </div>
        </section>

        <section className="panel">
          <div className="panel__head">
            <h2>Syllabus</h2>
          </div>
          {course.syllabus && course.syllabus.length > 0 ? (
            <ol className="syllabus">
              {course.syllabus.map((u) => (
                <li key={u.unit}>
                  <span className="syllabus__unit">Unit {u.unit}</span>
                  <div>
                    <div className="table__primary">{u.title}</div>
                    <div className="small text-secondary">{u.topics}</div>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="panel__body muted">Syllabus has not been published yet.</div>
          )}
        </section>
        {children}
      </div>

      <div>
        <section className="panel">
          <div className="panel__head">
            <h2>Course information</h2>
          </div>
          <div className="panel__body">
            <dl className="dl">
              <dt>Course code</dt>
              <dd className="mono">{course.code}</dd>
              <dt>Department</dt>
              <dd>{course.departmentName}</dd>
              <dt>Semester</dt>
              <dd>Semester {course.semester}</dd>
              <dt>Credits</dt>
              <dd>{course.credits}</dd>
              <dt>Term</dt>
              <dd>{course.term}</dd>
              <dt>Assessment</dt>
              <dd>
                Assignments {course.weights.assignments}%, tests {course.weights.tests}%
              </dd>
            </dl>
          </div>
        </section>

        <section className="panel">
          <div className="panel__head">
            <h2>Instructor</h2>
          </div>
          <div className="panel__body">
            {course.teacher ? (
              <>
                <div className="table__primary">{course.teacher.name}</div>
                <div className="small">
                  <a href={`mailto:${course.teacher.email}`}>{course.teacher.email}</a>
                </div>
                {course.teacher.office && <div className="small muted">{course.teacher.office}</div>}
              </>
            ) : (
              <span className="muted">To be assigned</span>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel__head">
            <h2>Weekly schedule</h2>
          </div>
          {course.schedule && course.schedule.length > 0 ? (
            <DataTable
              compact
              stack={false}
              rowKey={(r) => `${r.day}-${r.time}`}
              rows={course.schedule}
              columns={[
                { key: 'day', header: 'Day' },
                { key: 'time', header: 'Time', className: 'nowrap' },
                { key: 'room', header: 'Room' },
              ]}
            />
          ) : (
            <div className="panel__body muted">Timetable not yet published.</div>
          )}
        </section>
      </div>
    </div>
  );
}
