const MAP = {
  pending: ['Pending', 'warning'],
  submitted: ['Submitted', 'info'],
  graded: ['Graded', 'success'],
  overdue: ['Overdue', 'danger'],
  missing: ['Missing', 'danger'],
  upcoming: ['Upcoming', 'neutral'],
  available: ['Open now', 'warning'],
  'in-progress': ['In progress', 'warning'],
  completed: ['Completed', 'success'],
  missed: ['Missed', 'danger'],
  draft: ['Draft', 'neutral'],
  published: ['Published', 'success'],
  active: ['Active', 'success'],
  disabled: ['Disabled', 'danger'],
  archived: ['Archived', 'neutral'],
  late: ['Late', 'warning'],
  'At risk': ['At risk', 'danger'],
  Satisfactory: ['Satisfactory', 'neutral'],
  'Good standing': ['Good standing', 'success'],
  'No graded work yet': ['No graded work', 'neutral'],
};

export default function StatusBadge({ status, label }) {
  const [text, tone] = MAP[status] || [status, 'neutral'];
  return <span className={`badge badge--${tone}`}>{label || text}</span>;
}
