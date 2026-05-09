import React, { useState, useEffect, useRef } from 'react';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable } from './tableExport';

const PremiumTableToolbar = ({
    columns = [],
    visibleColumns,
    onToggleColumn,
    getExportData,
    exportFileName = 'export',
    exportTitle = 'Export',
    recordsPerPage = 10,
    onRecordsPerPageChange
}) => {
    const [showExport, setShowExport] = useState(false);
    const [showColumns, setShowColumns] = useState(false);
    const [showRecords, setShowRecords] = useState(false);
    
    const exportRef = useRef(null);
    const columnsRef = useRef(null);
    const recordsRef = useRef(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (exportRef.current && !exportRef.current.contains(event.target)) {
                setShowExport(false);
            }
            if (columnsRef.current && !columnsRef.current.contains(event.target)) {
                setShowColumns(false);
            }
            if (recordsRef.current && !recordsRef.current.contains(event.target)) {
                setShowRecords(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
        setShowExport(false);
    };

    return (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <HoverStyle />
            {/* Records Dropdown */}
            {onRecordsPerPageChange && (
                <div className="dropdown" ref={recordsRef} style={{ position: 'relative' }}>
                    <button 
                        className="btn" 
                        onClick={() => setShowRecords(!showRecords)}
                        style={{ 
                            borderRadius: '50px', 
                            padding: '6px 12px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            background: '#ffffff', 
                            border: '1px solid #c0c2c4', 
                            fontWeight: 600,
                            fontSize: '14px',
                            color: '#475569'
                        }}
                    >
                        Records <span style={{ margin: '0 6px' }}>&bull;</span> {recordsPerPage} <i className="fa fa-angle-down" style={{ marginLeft: '8px', fontSize: '14px', fontWeight: 'bold' }}></i>
                    </button>
                    
                    {showRecords && (
                        <div style={{
                            position: 'absolute', top: '100%', left: 0, marginTop: '8px',
                            background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                            padding: '8px 0', minWidth: '120px', zIndex: 1050
                        }}>
                            {[10, 25, 50, 100].map(num => (
                                <button 
                                    key={num} 
                                    className="dropdown-item premium-dropdown-item" 
                                    onClick={() => {
                                        onRecordsPerPageChange(num);
                                        setShowRecords(false);
                                    }} 
                                    style={{
                                        ...dropdownItemStyle,
                                        background: recordsPerPage === num ? '#f1f5f9' : 'transparent',
                                        fontWeight: recordsPerPage === num ? '600' : '400'
                                    }}
                                >
                                    {num} records
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {/* Export Dropdown */}
            <div className="dropdown" ref={exportRef} style={{ position: 'relative' }}>
                <button 
                    className="btn btn-default" 
                    onClick={() => setShowExport(!showExport)}
                    style={{ borderRadius: '20px', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid #e2e8f0', color: '#475569', fontWeight: 500 }}
                >
                    <i className="fa fa-upload"></i> Export <i className="fa fa-angle-down" style={{ marginLeft: '4px' }}></i>
                </button>
                
                {showExport && (
                    <div style={{
                        position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                        background: 'white', border: '1px solid C', borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                        padding: '8px 0', minWidth: '180px', zIndex: 1050
                    }}>
                        <button className="dropdown-item premium-dropdown-item" onClick={() => handleExport('copy')} style={dropdownItemStyle}>
                            <i className="fa fa-copy" style={{ width: '20px', color: '#1e293b' }}></i> Copy to Clipboard
                        </button>
                        <button className="dropdown-item premium-dropdown-item" onClick={() => handleExport('excel')} style={dropdownItemStyle}>
                            <i className="fa fa-file-excel-o" style={{ width: '20px', color: '#16a34a' }}></i> Export as Excel
                        </button>
                        <button className="dropdown-item premium-dropdown-item" onClick={() => handleExport('csv')} style={dropdownItemStyle}>
                            <i className="fa fa-file-text-o" style={{ width: '20px', color: '#0ea5e9' }}></i> Export as CSV
                        </button>
                        <button className="dropdown-item premium-dropdown-item" onClick={() => handleExport('pdf')} style={dropdownItemStyle}>
                            <i className="fa fa-file-pdf-o" style={{ width: '20px', color: '#dc2626' }}></i> Export as PDF
                        </button>
                        <button className="dropdown-item premium-dropdown-item" onClick={() => handleExport('print')} style={dropdownItemStyle}>
                            <i className="fa fa-print" style={{ width: '20px', color: '#1e293b' }}></i> Print
                        </button>
                    </div>
                )}
            </div>

            {/* Columns Dropdown */}
            <div className="dropdown" ref={columnsRef} style={{ position: 'relative' }}>
                <button 
                    className="btn btn-default" 
                    onClick={() => setShowColumns(!showColumns)}
                    style={{ borderRadius: '20px', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid #e2e8f0', color: '#475569', fontWeight: 500 }}
                >
                    <i className="fa fa-columns"></i> Columns
                </button>
                
                {showColumns && (
                    <div style={{
                        position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                        background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                        padding: '8px 0', minWidth: '180px', zIndex: 1050
                    }}>
                        {columns.map(col => (
                            <label key={col.key} className="premium-column-item" style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                padding: '8px 16px', 
                                margin: 0, 
                                cursor: 'pointer', 
                                fontWeight: 400,
                                transition: 'background-color 0.2s ease'
                            }}>
                                <input 
                                    type="checkbox" 
                                    checked={visibleColumns.has(col.key)} 
                                    onChange={() => onToggleColumn(col.key)}
                                    style={{ marginRight: '10px' }}
                                />
                                {col.label}
                            </label>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const dropdownItemStyle = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '8px 16px',
    border: 'none',
    background: 'none',
    textAlign: 'left',
    color: '#334155',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s ease'
};

// Add hover effect using a simple style tag
const HoverStyle = () => (
    <style>{`
        .premium-dropdown-item:hover,
        .premium-column-item:hover {
            background-color: #f1f5f9 !important;
            color: #1e293b !important;
        }
    `}</style>
);

export default PremiumTableToolbar;
