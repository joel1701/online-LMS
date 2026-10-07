// Plain table with an optional stacked layout on small screens (stack=true).
// columns: [{ key, header, render?, className?, headerClassName?, stackTitle? }]
export default function DataTable({ columns, rows, rowKey = 'id', stack = true, caption, rowClassName, footer, compact }) {
  return (
    <div className="table-wrap">
      <table className={`table ${stack ? 'table--stack' : ''} ${compact ? 'table--compact' : ''}`}>
        {caption && <caption className="visually-hidden">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} scope="col" className={col.headerClassName || col.className}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={typeof rowKey === 'function' ? rowKey(row) : row[rowKey]} className={rowClassName ? rowClassName(row) : undefined}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={[col.className, col.stackTitle ? 'stack-title' : ''].filter(Boolean).join(' ') || undefined}
                  data-label={typeof col.header === 'string' ? col.header : ''}
                >
                  {col.render ? col.render(row, index) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer}
      </table>
    </div>
  );
}
