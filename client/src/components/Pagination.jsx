export default function Pagination({ page, pageSize, total, onChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <nav className="pagination" aria-label="Pagination">
      <span>
        Showing {from}–{to} of {total}
      </span>
      <div className="btn-row">
        <button type="button" className="btn btn--secondary btn--sm" onClick={() => onChange(page - 1)} disabled={page <= 1}>
          Previous
        </button>
        <span>
          Page {page} of {pages}
        </span>
        <button type="button" className="btn btn--secondary btn--sm" onClick={() => onChange(page + 1)} disabled={page >= pages}>
          Next
        </button>
      </div>
    </nav>
  );
}
