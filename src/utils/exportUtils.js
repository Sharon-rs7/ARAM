export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return "0s";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    const rem = seconds % 60;
    return `${minutes}m ${rem}s`;
  }
  const hours = Math.floor(minutes / 60);
  const remMin = minutes % 60;
  return `${hours}h ${remMin}m`;
}

export function formatDateTime(dateString) {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    return d.toLocaleString();
  } catch (err) {
    return dateString;
  }
}

export function exportToCSV(filename, rows) {
  if (!rows || !rows.length) return;
  const headers = Object.keys(rows[0]).join(",");
  const dataRows = rows.map((r) =>
    Object.values(r)
      .map((val) => {
        const str = val === null || val === undefined ? "" : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(",")
  );
  
  const csvContent = "data:text/csv;charset=utf-8," + [headers, ...dataRows].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportTableToCSV(filename, columns, rows) {
  if (!rows || !rows.length || !columns || !columns.length) return;
  const headers = columns.map((c) => c.header || c.label).join(",");
  
  const dataRows = rows.map((r) =>
    columns
      .map((col) => {
        const key = col.key || col.accessor;
        const val = r[key];
        const str = val === null || val === undefined ? "" : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(",")
  );

  const csvContent = "data:text/csv;charset=utf-8," + [headers, ...dataRows].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
