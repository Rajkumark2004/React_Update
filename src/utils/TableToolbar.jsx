import React, { useState, useEffect } from 'react';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable } from './tableExport';

/**
 * TableToolbar — Reusable toolbar for data tables.
 *
 * Props:
 *   searchTerm          (string)    Current search value
 *   onSearchChange      (fn)        (value) => {} handler
 *   recordsPerPage      (number)    Current records-per-page value
 *   onRecordsPerPageChange (fn)     (value) => {} handler
 *   columns             (array)     [{ key, label }] column definitions
 *   visibleColumns      (Set)       Set of visible column keys
 *   onToggleColumn      (fn)        (key) => {} toggle handler
 *   getExportData       (fn)        Returns { headers, rows }
 *   exportFileName      (string)    Base filename for exports (e.g. 'hostel_room_list')
 *   exportTitle         (string)    Title for PDF/Print (e.g. 'Hostel Room List')
 *   showRecordsPerPage  (bool)      Whether to show the records selector (default: true)
 *   showColumnToggle    (bool)      Whether to show column visibility button (default: true)
 */
const TableToolbar = ({
    searchTerm = '',
    onSearchChange,
    recordsPerPage = 100,
    onRecordsPerPageChange,
    columns = [],
    visibleColumns,
    onToggleColumn,
    getExportData,
    exportFileName = 'export',
    exportTitle = 'Export',
    showRecordsPerPage = true,
    showColumnToggle = true
}) => {
    const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!showColumnsDropdown) return;
        const handleClickOutside = (e) => {
            if (!e.target.closest('.table-toolbar-colvis')) {
                setShowColumnsDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showColumnsDropdown]);

    const handleExport = (type) => {
        if (!getExportData) return;
        const { headers, rows } = getExportData();
        switch (type) {
            case 'copy':
                copyToClipboard(headers, rows);
                break;
            case 'excel':
                downloadExcel(headers, rows, `${exportFileName}.xls`);
                break;
            case 'csv':
                downloadCSV(headers, rows, `${exportFileName}.csv`);
                break;
            case 'pdf':
                downloadPDF(headers, rows, `${exportFileName}.pdf`, exportTitle);
                break;
            case 'print':
                printTable(headers, rows, exportTitle);
                break;
            default:
                break;
        }
    };

    return (
        <>
            <style>{`
                @media (max-width: 767px) {
                    .table-toolbar-wrapper {
                        flex-direction: column !important;
                        gap: 15px !important;
                    }
                    .table-toolbar-left {
                        justify-content: center !important;
                        width: 100% !important;
                    }
                    .table-toolbar-left .dataTables_filter input {
                        width: 100% !important;
                        text-align: center !important;
                    }
                    .table-toolbar-right {
                        justify-content: center !important;
                        width: 100% !important;
                    }
                    .table-toolbar-right .dt-buttons {
                        display: flex !important;
                        justify-content: center !important;
                        width: 100% !important;
                    }
                }
            `}</style>
            <div
                className="table-toolbar-wrapper"
                style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'center' : 'flex-start',
                    gap: isMobile ? '15px' : '10px',
                    marginBottom: '10px',
                    flexWrap: 'wrap'
                }}
            >
                {/* Left side: Records per page + Search */}
                <div
                    className="table-toolbar-left"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        flexWrap: 'wrap',
                        justifyContent: isMobile ? 'center' : 'flex-start'
                    }}
                >
                    {showRecordsPerPage && onRecordsPerPageChange && (
                        <div className="dataTables_length">
                            <label style={{ fontWeight: 'normal', display: 'flex', alignItems: 'center', margin: 0 }}>
                                Records:
                                <select
                                    value={recordsPerPage}
                                    onChange={(e) => onRecordsPerPageChange(Number(e.target.value))}
                                    className="form-control input-sm"
                                    style={{ width: '80px', margin: '0 10px' }}
                                >
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                    <option value="-1">All</option>
                                </select>
                            </label>
                        </div>
                    )}

                    {onSearchChange && (
                        <div className="dataTables_filter">
                            <input
                                type="search"
                                className="form-control input-sm"
                                placeholder="bug"
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                style={{
                                    display: 'inline-block',
                                    width: isMobile ? '100%' : '180px',
                                    border: 'none',
                                    borderBottom: '1px solid #ccc',
                                    borderRadius: '0',
                                    boxShadow: 'none',
                                    backgroundColor: 'transparent',
                                    paddingLeft: '0',
                                    outline: 'none',
                                    textAlign: isMobile ? 'center' : 'left',
                                    fontSize: '13px'
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Right side: Export buttons + Column toggle */}
                <div
                    className="table-toolbar-right"
                    style={{
                        display: 'flex',
                        justifyContent: isMobile ? 'center' : 'flex-end',
                        alignItems: 'center'
                    }}
                >
                    <div
                        className="dt-buttons btn-group"
                        style={{
                            display: isMobile ? 'flex' : 'inline-flex',
                            width: isMobile ? '100%' : 'auto',
                            justifyContent: 'center',
                            gap: 0
                        }}
                    >
                        <button
                            className="btn btn-default btn-sm buttons-copy buttons-html5"
                            title="Copy"
                            onClick={() => handleExport('copy')}
                            style={{ borderTopLeftRadius: '20px', borderBottomLeftRadius: '20px' }}
                        >
                            <i className="fa fa-files-o"></i>
                        </button>
                        <button
                            className="btn btn-default btn-sm buttons-excel buttons-html5"
                            title="Excel"
                            onClick={() => handleExport('excel')}
                        >
                            <i className="fa fa-file-excel-o"></i>
                        </button>
                        <button
                            className="btn btn-default btn-sm buttons-csv buttons-html5"
                            title="CSV"
                            onClick={() => handleExport('csv')}
                        >
                            <i className="fa fa-file-text-o"></i>
                        </button>
                        <button
                            className="btn btn-default btn-sm buttons-pdf buttons-html5"
                            title="PDF"
                            onClick={() => handleExport('pdf')}
                        >
                            <i className="fa fa-file-pdf-o"></i>
                        </button>
                        <button
                            className="btn btn-default btn-sm buttons-print"
                            title="Print"
                            onClick={() => handleExport('print')}
                            style={!showColumnToggle ? { borderTopRightRadius: '20px', borderBottomRightRadius: '20px' } : {}}
                        >
                            <i className="fa fa-print"></i>
                        </button>

                        {showColumnToggle && visibleColumns && onToggleColumn && columns.length > 0 && (
                            <div className="btn-group table-toolbar-colvis" style={{ position: 'relative' }}>
                                <button
                                    className="btn btn-default btn-sm buttons-collection buttons-colvis"
                                    title="Columns"
                                    onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}
                                    style={{ borderTopRightRadius: '20px', borderBottomRightRadius: '20px' }}
                                >
                                    <i className="fa fa-columns"></i>
                                </button>
                                {showColumnsDropdown && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '100%',
                                            right: 0,
                                            zIndex: 1000,
                                            background: '#fff',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            padding: '8px 10px',
                                            minWidth: '180px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                        }}
                                    >
                                        {columns.map(col => (
                                            <label
                                                key={col.key}
                                                style={{
                                                    display: 'block',
                                                    cursor: 'pointer',
                                                    padding: '2px 0',
                                                    fontSize: '13px',
                                                    fontWeight: 'normal',
                                                    textAlign: 'left',
                                                    margin: 0
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={visibleColumns.has(col.key)}
                                                    onChange={() => onToggleColumn(col.key)}
                                                    style={{ marginRight: '6px' }}
                                                />
                                                {col.label}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default TableToolbar;
