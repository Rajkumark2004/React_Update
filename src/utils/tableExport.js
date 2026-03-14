import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Copy table data to clipboard as tab-separated values.
 */
export const copyToClipboard = (headers, rows) => {
    try {
        const content = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
        const type = 'text/plain';
        const blob = new Blob([content], { type });
        const data = [new ClipboardItem({ [type]: blob })];
        navigator.clipboard.write(data).then(
            () => alert('Copied to clipboard'),
            () => {
                // Fallback for older browsers
                const textArea = document.createElement("textarea");
                textArea.value = content;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    alert('Copied to clipboard');
                } catch (err) {
                    console.error('Fallback copy failed', err);
                }
                document.body.removeChild(textArea);
            }
        );
    } catch (err) {
        console.error('Clipboard copy failed', err);
    }
};

/**
 * Download table data as a CSV file with UTF-8 BOM for Excel compatibility.
 */
export const downloadCSV = (headers, rows, filename = 'export.csv') => {
    const csvRows = rows.map(row =>
        row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
    );
    // Add UTF-8 BOM (\uFEFF) so Excel opens it with correct encoding
    const csvContent = '\uFEFF' + [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, filename);
};

/**
 * Download table data as an Excel (.xls) file using XML Spreadsheet 2003 format.
 * This is more robust than HTML and supports basic styling.
 */
export const downloadExcel = (headers, rows, filename = 'export.xls') => {
    // Escape XML special characters
    const escapeXml = (unsafe) => {
        return String(unsafe ?? '').replace(/[<>&'"]/g, (c) => {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
                default: return c;
            }
        });
    };

    const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>Wisables</Author>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="headerStyle">
   <Alignment ss:Vertical="Center" ss:Horizontal="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
   </Borders>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#4CAF50" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="cellStyle">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
   </Borders>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="10"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Sheet1">
  <Table>
   <Row ss:AutoFitHeight="1">
    ${headers.map(h => `<Cell ss:StyleID="headerStyle"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`).join('')}
   </Row>
   ${rows.map(row => `
   <Row ss:AutoFitHeight="1">
    ${row.map(cell => `<Cell ss:StyleID="cellStyle"><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`).join('')}
   </Row>`).join('')}
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    // Keep .xls extension but ensure we don't double it
    const finalFilename = filename.toLowerCase().endsWith('.xls') ? filename : `${filename.split('.')[0]}.xls`;
    triggerDownload(blob, finalFilename);
};

/**
 * Download table data as a PDF file with auto-layout.
 */
export const downloadPDF = (headers, rows, filename = 'export.pdf', title = 'Export') => {
    // Auto-determine orientation
    const orientation = headers.length > 8 ? 'l' : 'p';
    const doc = new jsPDF(orientation, 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Add Title
    doc.setFontSize(16);
    doc.text(title, pageWidth / 2, 40, { align: 'center' });

    // Add Table
    autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 60,
        styles: {
            fontSize: orientation === 'l' ? 7 : 8,
            cellPadding: 3,
            halign: 'left' // Default cell alignment
        },
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            halign: 'center' // Center headers as per reference style
        },
        theme: 'grid',
        margin: { top: 40, bottom: 40 },
        didDrawPage: (data) => {
            // Page Number
            doc.setFontSize(8);
            doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - 40, pageHeight - 20, { align: 'right' });
            doc.text(`Exported on: ${new Date().toLocaleString()}`, 40, pageHeight - 20);
        }
    });

    doc.save(filename);
};

/**
 * Print only the table.
 */
export const printTable = (headers, rows, title = '') => {
    const printWindow = window.open('', '_blank');
    const tableHTML = `
        <html>
        <head>
            <title>${title || 'Print'}</title>
            <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
                h1 { text-align: center; color: #2c3e50; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: auto; font-size: 14px; }
                th, td { border: 1px solid #dfe6e9; padding: 10px 8px; text-align: left; }
                th { background-color: #f7f9fa; font-weight: bold; color: #2d3436; text-align: center; }
                tr:nth-child(even) { background-color: #fcfcfc; }
                .footer { margin-top: 20px; font-size: 11px; color: #777; text-align: right; border-top: 1px solid #eee; padding-top: 10px; }
                @media print {
                    body { padding: 0; }
                    .no-print { display: none; }
                    table { page-break-inside: auto; }
                    tr { page-break-inside: avoid; page-break-after: auto; }
                    thead { display: table-header-group; }
                    tfoot { display: table-footer-group; }
                }
            </style>
        </head>
        <body>
            ${title ? `<h1>${title}</h1>` : ''}
            <table>
                <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                <tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell ?? ''}</td>`).join('')}</tr>`).join('')}</tbody>
            </table>
            <div class="footer">
                <p>Printed on: ${new Date().toLocaleString()}</p>
            </div>
        </body>
        </html>
    `;
    printWindow.document.write(tableHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
};

/**
 * Helper: Build { headers, rows } from data, respecting visible columns.
 */
export const buildExportData = (columns, visibleColumns, data, formatCell) => {
    // If visibleColumns is not provided or not a Set, use all columns
    const columnsToExport = (visibleColumns instanceof Set) 
        ? columns.filter(col => visibleColumns.has(col.key))
        : columns;

    const headers = columnsToExport.map(col => col.label);
    const rows = data.map(row => 
        columnsToExport.map(col => {
            const val = formatCell ? formatCell(row, col.key) : (row[col.key] ?? '');
            return String(val ?? '');
        })
    );
    return { headers, rows };
};

/**
 * Reusable Column Visibility Dropdown Component
 */
export const ColumnVisibility = ({ columns, visibleColumns, toggleColumn }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showDropdown]);

    return (
        <div className="btn-group" ref={dropdownRef} style={{ position: 'relative' }}>
            <button 
                className="btn btn-default btn-sm" 
                title="Columns" 
                onClick={() => setShowDropdown(!showDropdown)}
            >
                <i className="fa fa-columns"></i>
            </button>
            {showDropdown && (
                <div style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    right: 0, 
                    zIndex: 1000, 
                    background: '#fff', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px', 
                    padding: '8px 10px', 
                    minWidth: '180px', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    marginTop: '2px'
                }}>
                    {columns.map(col => (
                        <label key={col.key} style={{ display: 'block', cursor: 'pointer', padding: '2px 0', margin: 0, fontWeight: 'normal', color: '#333' }}>
                            <input
                                type="checkbox"
                                checked={visibleColumns.has(col.key)}
                                onChange={() => toggleColumn(col.key)}
                                style={{ marginRight: '8px', verticalAlign: 'middle' }}
                            />
                            {col.label}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
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
