/**
 * Table Export Utilities
 * Reusable functions for Copy, CSV, Excel, PDF, and Print.
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


/**
 * Copy table data to clipboard as tab-separated values.
 * @param {string[]} headers
 * @param {string[][]} rows
 */
export const copyToClipboard = (headers, rows) => {
    const content = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
    navigator.clipboard.writeText(content);
    alert('Copied to clipboard');
};

/**
 * Download table data as a CSV file.
 * @param {string[]} headers
 * @param {string[][]} rows
 * @param {string} filename
 */
export const downloadCSV = (headers, rows, filename = 'export.csv') => {
    const csvRows = rows.map(row =>
        row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, filename);
};

/**
 * Download table data as an Excel (.xls) file.
 * @param {string[]} headers
 * @param {string[][]} rows
 * @param {string} filename
 */
export const downloadExcel = (headers, rows, filename = 'export.xls') => {
    const csvRows = rows.map(row =>
        row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    triggerDownload(blob, filename);
};

/**
 * Download table data as a PDF file.
 * @param {string[]} headers
 * @param {string[][]} rows
 * @param {string} filename
 * @param {string} title
 */
export const downloadPDF = (headers, rows, filename = 'export.pdf', title = 'Export') => {
    const doc = new jsPDF();

    // Add Title
    doc.setFontSize(14);
    doc.text(title, 14, 15);

    // Add Table
    autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 20,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [200, 200, 200], textColor: 20 },
        theme: 'grid'
    });

    doc.save(filename);
};

/**
 * Print only the table (headings + rows) in a new window.
 * @param {string[]} headers
 * @param {string[][]} rows
 * @param {string} title
 */
export const printTable = (headers, rows, title = '') => {
    const printWindow = window.open('', '_blank');
    const tableHTML = `
        <html>
        <head>
            <title>${title || 'Print'}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #333; padding: 8px 10px; text-align: left; font-size: 12px; }
                th { background-color: #f2f2f2; font-weight: bold; }
                h2 { text-align: center; margin-bottom: 5px; }
                @media print { body { margin: 0; } }
            </style>
        </head>
        <body>
            ${title ? `<h2>${title}</h2>` : ''}
            <table>
                <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                <tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell ?? ''}</td>`).join('')}</tr>`).join('')}</tbody>
            </table>
        </body>
        </html>
    `;
    printWindow.document.write(tableHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 300);
};

/**
 * Helper: Build { headers, rows } from data, respecting visible columns.
 * @param {Array<{key: string, label: string}>} columns - All column definitions
 * @param {Set<string>} visibleColumns - Set of visible column keys
 * @param {Object[]} data - Array of data objects
 * @param {Function} formatCell - (row, columnKey) => string
 * @returns {{ headers: string[], rows: string[][] }}
 */
export const buildExportData = (columns, visibleColumns, data, formatCell) => {
    const visibleCols = columns.filter(col => visibleColumns.has(col.key));
    const headers = visibleCols.map(col => col.label);
    const rows = data.map(row => visibleCols.map(col => String(formatCell(row, col.key) ?? '')));
    return { headers, rows };
};

/* ---- internal helper ---- */
function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
