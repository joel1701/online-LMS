// Course selector shared by the teacher's materials, assignments and tests pages.
export default function CourseFilter({ courses, value, onChange, id = 'course-filter', allowAll = true }) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>Course</label>
      <select id={id} className="select" value={value} onChange={(e) => onChange(e.target.value)}>
        {allowAll && <option value="">All my courses</option>}
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.code} – {c.title}{c.status === 'archived' ? ' (archived)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
