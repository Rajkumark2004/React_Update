import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';
import AttendanceReportNav from './AttendanceReportNav';
import { api } from '../../services/api';
import '../../utils/include_files';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable, buildExportData } from '../../utils/tableExport';
import { useRef } from 'react';

/**
 * Reusable Column Visibility Dropdown Component
 */
const ColumnVisibility = ({ columns, visibleColumns, toggleColumn }) => {
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

const DailyAttendanceReport = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
    const [searchTerm, setSearchTerm] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [resultList, setResultList] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Column Visibility State
    const columns = [
        { key: 'class_section', label: 'Class (Section)' },
        { key: 'total_present', label: 'Total Present' },
        { key: 'total_absent', label: 'Total Absent' },
        { key: 'present_percent', label: 'Present %' },
        { key: 'absent_percent', label: 'Absent %' }
    ];
    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));

    const toggleColumn = (columnKey) => {
        const newVisible = new Set(visibleColumns);
        if (newVisible.has(columnKey)) {
            if (newVisible.size > 1) {
                newVisible.delete(columnKey);
            }
        } else {
            newVisible.add(columnKey);
        }
        setVisibleColumns(newVisible);
    };


    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setInitialLoading(true);
            const response = await api.getDailyAttendanceReport();
            if (response && response.status && response.data) {
                const list = Array.isArray(response.data)
                    ? response.data
                    : (response.data.result || response.data.list || []);
                setResultList(list);
            }
        } catch (error) {
            console.error('Error loading daily attendance report:', error);
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setErrors({});
        setMessage({ type: '', text: '' });

        if (!date) {
            setErrors({ date: 'The Date field is required' });
            return;
        }

        setLoading(true);
        try {
            // Convert YYYY-MM-DD → DD-MM-YYYY for the API (same as StudentAttendance)
            const formattedDate = date.split('-').reverse().join('-');
            const response = await api.searchDailyAttendanceReport({ date: formattedDate });

            if (response && response.status) {
                const list = Array.isArray(response.data)
                    ? response.data
                    : (response.data?.result || response.data?.list || []);
                setResultList(list);
                if (list.length === 0) {
                    setMessage({ type: 'info', text: 'No attendance data found for this date.' });
                }
            } else {
                setMessage({ type: 'error', text: response?.message || 'No data found for this date' });
                setResultList([]);
            }
        } catch (error) {
            console.error('Search error:', error);
            setMessage({ type: 'error', text: error.message || 'Search failed' });
        } finally {
            setLoading(false);
        }
    };

    // Filter logic
    const filteredList = resultList.filter(item =>
        (item.class_section || item.class || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate totals based on filtered data
    const totals = filteredList.reduce((acc, curr) => ({
        all_present: acc.all_present + parseInt(curr.total_present || 0),
        all_absent: acc.all_absent + parseInt(curr.total_absent || 0),
    }), { all_present: 0, all_absent: 0 });

    const totalStudents = totals.all_present + totals.all_absent;
    const all_present_percent = totalStudents ? ((totals.all_present / totalStudents) * 100).toFixed(2) : '0.00';
    const all_absent_percent = totalStudents ? ((totals.all_absent / totalStudents) * 100).toFixed(2) : '0.00';

    // Helper to read class section label from various API response shapes
    const getClassSection = (item) => item.class_section || `${item.class || ''} ${item.section ? `(${item.section})` : ''}`.trim();

    const formatCell = (row, key) => {
        if (key === 'class_section') return getClassSection(row);
        return row[key] || '0';
    };

    const handleCopy = () => {
        const { headers, rows } = buildExportData(columns, visibleColumns, [...filteredList, { 
            class_section: 'Total', 
            total_present: totals.all_present, 
            total_absent: totals.all_absent, 
            present_percent: all_present_percent, 
            absent_percent: all_absent_percent 
        }], formatCell);
        copyToClipboard(headers, rows);
    };

    const handleCSV = () => {
        const { headers, rows } = buildExportData(columns, visibleColumns, [...filteredList, { 
            class_section: 'Total', 
            total_present: totals.all_present, 
            total_absent: totals.all_absent, 
            present_percent: all_present_percent, 
            absent_percent: all_absent_percent 
        }], formatCell);
        downloadCSV(headers, rows, 'daily_attendance_report.csv');
    };

    const handleExcel = () => {
        const { headers, rows } = buildExportData(columns, visibleColumns, [...filteredList, { 
            class_section: 'Total', 
            total_present: totals.all_present, 
            total_absent: totals.all_absent, 
            present_percent: all_present_percent, 
            absent_percent: all_absent_percent 
        }], formatCell);
        downloadExcel(headers, rows, 'daily_attendance_report.xls');
    };

    const handlePDF = () => {
        const { headers, rows } = buildExportData(columns, visibleColumns, [...filteredList, { 
            class_section: 'Total', 
            total_present: totals.all_present, 
            total_absent: totals.all_absent, 
            present_percent: all_present_percent, 
            absent_percent: all_absent_percent 
        }], formatCell);
        downloadPDF(headers, rows, 'daily_attendance_report.pdf', 'Daily Attendance Report');
    };

    const handlePrint = () => {
        const { headers, rows } = buildExportData(columns, visibleColumns, [...filteredList, { 
            class_section: 'Total', 
            total_present: totals.all_present, 
            total_absent: totals.all_absent, 
            present_percent: all_present_percent, 
            absent_percent: all_absent_percent 
        }], formatCell);
        printTable(headers, rows, 'Daily Attendance Report');
    };


    return (
        <div className="wrapper theme-white-skin">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '946px' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-calendar-check-o"></i> Attendance <small> By Date</small>
                    </h1>
                </section>
                <section className="content">
                    {initialLoading ? (
                        <Loader />
                    ) : (
                        <div className="row">
                            <div className="col-md-12">
                                <div className="box removeboxmius">
                                    <div className="box-header ptbnull"></div>
                                    <div className="box-header with-border">
                                        <h3 className="box-title"><i className="fa fa-search"></i> Select Criteria</h3>
                                    </div>
                                    <form id='form1' onSubmit={handleSearch}>
                                        <div className="box-body">
                                            <div className="row">
                                                {message.text && (
                                                    <div className={`col-md-12 alert alert-${message.type === 'error' ? 'danger' : message.type === 'info' ? 'info' : 'success'}`}>
                                                        {message.text}
                                                    </div>
                                                )}
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Date</label><small className="req"> *</small>
                                                        <div className="input-group" style={{ position: 'relative', width: '100%', borderBottom: '1px solid #ccc' }}>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                value={date}
                                                                onChange={(e) => setDate(e.target.value)}
                                                                max={new Date().toISOString().split('T')[0]}
                                                                style={{ width: '100%', border: 'none', background: 'transparent', boxShadow: 'none', paddingLeft: 0, paddingBottom: '4px' }}
                                                            />
                                                        </div>
                                                        {errors.date && <span className="text-danger">{errors.date}</span>}
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="form-group">
                                                        <button
                                                            type="submit"
                                                            name="search"
                                                            value="search"
                                                            className="btn btn-primary btn-sm pull-right checkbox-toggle"
                                                            disabled={loading}
                                                        >
                                                            {loading
                                                                ? <><i className="fa fa-spinner fa-spin"></i> Searching...</>
                                                                : <><i className="fa fa-search"></i> Search</>
                                                            }
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </form>

                                    <div className="">
                                        <div className="box-header ptbnull"></div>
                                        <div className="box-header ptbnull">
                                            <h3 className="box-title titlefix"><i className="fa fa-money"></i> Daily Attendance Report</h3>
                                        </div>

                                        {/* Desktop View */}
                                        <div className="box-body table-responsive hide-mobile">
                                            <div className="download_label">Daily Attendance Report</div>

                                            {/* Search and Export Controls */}
                                            <div className="row mb-3" style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div className="col-sm-6">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Search..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        style={{ maxWidth: '300px' }}
                                                    />
                                                </div>
                                                <div className="col-sm-6 text-right">
                                                    <div className="dt-buttons btn-group">
                                                        <button className="btn btn-default btn-sm dt-button" onClick={handleCopy} title="Copy">
                                                            <i className="fa fa-files-o"></i>
                                                        </button>
                                                        <button className="btn btn-default btn-sm dt-button" onClick={handleExcel} title="Excel">
                                                            <i className="fa fa-file-excel-o"></i>
                                                        </button>
                                                        <button className="btn btn-default btn-sm dt-button" onClick={handleCSV} title="CSV">
                                                            <i className="fa fa-file-text-o"></i>
                                                        </button>
                                                        <button className="btn btn-default btn-sm dt-button" onClick={handlePDF} title="PDF">
                                                            <i className="fa fa-file-pdf-o"></i>
                                                        </button>
                                                        <button className="btn btn-default btn-sm dt-button" onClick={handlePrint} title="Print">
                                                            <i className="fa fa-print"></i>
                                                        </button>
                                                        <ColumnVisibility columns={columns} visibleColumns={visibleColumns} toggleColumn={toggleColumn} />
                                                    </div>
                                                </div>
                                            </div>

                                            <table className="table table-striped table-bordered table-hover example">
                                                <thead>
                                                    <tr>
                                                        {visibleColumns.has('class_section') && <th>Class (Section)</th>}
                                                        {visibleColumns.has('total_present') && <th>Total Present</th>}
                                                        {visibleColumns.has('total_absent') && <th>Total Absent</th>}
                                                        {visibleColumns.has('present_percent') && <th>Present %</th>}
                                                        {visibleColumns.has('absent_percent') && <th>Absent %</th>}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredList.length > 0 ? (
                                                        filteredList.map((value, index) => (
                                                            <tr key={index}>
                                                                {visibleColumns.has('class_section') && <td>{getClassSection(value)}</td>}
                                                                {visibleColumns.has('total_present') && <td>{value.total_present}</td>}
                                                                {visibleColumns.has('total_absent') && <td>{value.total_absent}</td>}
                                                                {visibleColumns.has('present_percent') && <td>{value.present_percent}</td>}
                                                                {visibleColumns.has('absent_percent') && <td>{value.absent_percent}</td>}
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="5" className="text-center text-danger">No data available</td>
                                                        </tr>
                                                    )}
                                                    {filteredList.length > 0 && (
                                                        <tr style={{ fontWeight: 'bold' }}>
                                                            {visibleColumns.has('class_section') && <td>Total</td>}
                                                            {visibleColumns.has('total_present') && <td>{totals.all_present}</td>}
                                                            {visibleColumns.has('total_absent') && <td>{totals.all_absent}</td>}
                                                            {visibleColumns.has('present_percent') && <td>{all_present_percent}</td>}
                                                            {visibleColumns.has('absent_percent') && <td>{all_absent_percent}</td>}
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Mobile View */}
                                        <div className="box-body hide-desktop">
                                            <div className="col-md-12">
                                                {filteredList.length > 0 ? (
                                                    filteredList.map((value, index) => (
                                                        <div key={index} className="bgtgray">
                                                            {visibleColumns.has('class_section') && (
                                                                <div className="col-sm-3 col-lg-2 col-md-3">
                                                                    <div className="description-block">
                                                                        <h5 className="description-header">Class (Section) : <span className="description-text">{getClassSection(value)}</span></h5>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {visibleColumns.has('total_present') && (
                                                                <div className="col-sm-1 pull">
                                                                    <div className="description-block">
                                                                        <h5 className="description-header">Total Present : <span className="description-text">{value.total_present}</span></h5>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {visibleColumns.has('total_absent') && (
                                                                <div className="col-sm-1 pull">
                                                                    <div className="description-block">
                                                                        <h5 className="description-header">Total Absent : <span className="description-text">{value.total_absent}</span></h5>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {visibleColumns.has('present_percent') && (
                                                                <div className="col-sm-4 col-lg-4 col-md-4 border-right">
                                                                    <div className="description-block">
                                                                        <h5 className="description-header">Present % : <span className="description-text">{value.present_percent}</span></h5>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {visibleColumns.has('absent_percent') && (
                                                                <div className="col-sm-2 col-lg-2 col-md-2 border-right">
                                                                    <div className="description-block">
                                                                        <h5 className="description-header">Absent % : <span className="description-text">{value.absent_percent}</span></h5>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="alert alert-danger text-center">No data available</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default DailyAttendanceReport;
