import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, percent } from '../../utils/format';

function ItemTable({ title, items, dateKey, link }) {
  return (
    <div className="table-wrap">
      <table className="table table--compact table--stack">
        <caption className="table-caption">{title}</caption>
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col">Date</th>
            <th scope="col">Status</th>
            <th scope="col" className="num">Marks</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={4} className="muted">None yet.</td>
            </tr>
          )}
          {items.map((i) => (
            <tr key={i.id}>
              <td className="stack-title">{link ? <Link to={link(i)}>{i.title}</Link> : i.title}</td>
              <td data-label="Date" className="nowrap">{formatDate(i[dateKey])}</td>
              <td data-label="Status"><StatusBadge status={i.state} /></td>
              <td data-label="Marks" className="num nowrap">
                {i.marks === null ? <span className="muted">— / {i.maxMarks}</span> : `${i.marks} / ${i.maxMarks}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CourseGradeBreakdown({ grade }) {
  return (
    <section className="panel">
      <div className="grade-summary">
        <div>
          <div className="summary-strip__label">Assignments ({grade.weights.assignments}%)</div>
          <div className="grade-summary__value">{percent(grade.assignmentPct)}</div>
        </div>
        <div>
          <div className="summary-strip__label">Tests ({grade.weights.tests}%)</div>
          <div className="grade-summary__value">{percent(grade.testPct)}</div>
        </div>
        <div>
          <div className="summary-strip__label">Weighted total</div>
          <div className="grade-summary__value">{percent(grade.total)}</div>
        </div>
        <div>
          <div className="summary-strip__label">Grade</div>
          <div className="grade-summary__value">{grade.letter}</div>
        </div>
        <div>
          <div className="summary-strip__label">Standing</div>
          <div style={{ marginTop: 6 }}><StatusBadge status={grade.standing} /></div>
        </div>
      </div>
      <ItemTable title="Assignments" items={grade.assignments} dateKey="dueDate" link={(i) => `/student/assignments/${i.id}`} />
      <ItemTable title="Tests" items={grade.tests} dateKey="date" />
      <div className="panel__foot muted">
        Percentages include only graded work; missed assignments and tests count as zero. Pending items are not included until graded.
      </div>
    </section>
  );
}
