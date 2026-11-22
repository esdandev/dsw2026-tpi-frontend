function DataTable({
  columns,
  rows,
  rowKey = (row) => row.id,
  loading = false,
  loadingText = 'Cargando...',
  emptyText = 'No hay registros para mostrar.',
  rowClassName = 'hover:bg-gray-50/70 transition-colors',
}) {
  return (
    <div className="overflow-x-auto">
      <table className="mobile-cards w-full text-left text-sm">
        <thead className="bg-med-primary-50/70 text-[11px] uppercase tracking-wider text-med-text-sub border-b border-med-border">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={column.headerClassName || 'px-6 py-3.5'}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-med-border-subtle">
          {loading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-8 text-center text-med-text-sub"
              >
                {loadingText}
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-8 text-center text-med-text-sub"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={rowKey(row)} className={rowClassName}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    data-label={column.mobileLabel}
                    className={column.cellClassName || 'px-6 py-4'}
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
