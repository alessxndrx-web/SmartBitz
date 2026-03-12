import type { ReactNode } from 'react';

type Column<T> = {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], row: T) => ReactNode;
};

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  emptyText = 'No hay datos para mostrar.',
}: {
  columns: Array<Column<T>>;
  rows: T[];
  emptyText?: string;
}) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="data-table-empty-cell">
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => {
                  const value = row[column.key];
                  return (
                    <td key={String(column.key)}>
                      {column.render ? column.render(value, row) : String(value ?? '')}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
