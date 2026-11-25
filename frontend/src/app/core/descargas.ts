/**
 * Utility to download CSV files, sanitizing formulas to prevent CSV injection in Excel.
 */
export function downloadCsv(filename: string, rows: unknown[][]): void {
  const sanitizeCell = (val: unknown): string => {
    let str = String(val ?? '');
    if (/^[\s]*[=+@-]/.test(str) && typeof val !== 'number') {
      str = "'" + str;
    }
    return '"' + str.replace(/"/g, '""') + '"';
  };

  const csvContent = '\uFEFF' + rows.map(row => row.map(sanitizeCell).join(';')).join('\r\n') + '\r\n';
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const objectUrl = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();

  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

/** Compatibility alias */
export const descargarCsv = downloadCsv;
