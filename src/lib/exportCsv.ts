/**
 * Export an array of objects to a CSV file and trigger a browser download.
 * When `anonymize` is true, columns named `nombre` and `legajo` are dropped.
 */
export function exportToCsv(
  data: object[],
  filename: string,
  opts?: { anonymize?: boolean }
): void {
  if (data.length === 0) return;

  const anonymize = opts?.anonymize ?? false;

  // Collect all unique keys across all rows
  const allKeys = new Set<string>();
  for (const row of data) {
    for (const key of Object.keys(row)) {
      if (anonymize && (key === 'nombre' || key === 'legajo')) continue;
      allKeys.add(key);
    }
  }

  const headers = Array.from(allKeys);

  const csvRows: string[] = [];

  // Header row
  csvRows.push(headers.map(escapeCsvField).join(','));

  // Data rows
  for (const row of data) {
    const record = row as Record<string, unknown>;
    const values = headers.map((h) => {
      const raw = record[h];
      if (raw === null || raw === undefined) return '';
      if (typeof raw === 'boolean') return raw ? 'true' : 'false';
      return escapeCsvField(String(raw));
    });
    csvRows.push(values.join(','));
  }

  const csvContent = csvRows.join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}
