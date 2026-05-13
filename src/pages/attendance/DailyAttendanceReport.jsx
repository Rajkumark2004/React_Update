import React, { useState, useEffect } from 'react';
import Loader from '../../components/Loader';
import { api } from '../../services/api';
import '../../utils/include_files';
import PremiumTableToolbar from '../../utils/PremiumTableToolbar';
import { buildExportData } from '../../utils/tableExport';
import AttendanceLayout from './AttendanceLayout';

const DailyAttendanceReport = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [resultList, setResultList] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);

    const columns = [
        { key: 'class_section', label: 'Class (Section)' },
        { key: 'total_present', label: 'Total Present' },
        { key: 'total_absent', label: 'Total Absent' },
        { key: 'present_percent', label: 'Present %' },
        { key: 'absent_percent', label: 'Absent %' }
    ];
    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));

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
            const formattedDate = date.split('-').reverse().join('-');
            const response = await api.searchDailyAttendanceReport({ date: formattedDate });

            if (response && response.status) {
                const list = Array.isArray(response.data)
                    ? response.data
                    : (response.data?.result || response.data?.list || []);
                setResultList(list);
                setCurrentPage(1);
                if (list.length === 0) {
                    setMessage({ type: 'info', text: 'No attendance data found for this date.' });
                }
            } else {
                setMessage({ type: 'error', text: response?.message || 'No data found for this date' });
                setResultList([]);
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Search failed' });
        } finally {
            setLoading(false);
        }
    };

    const filteredList = resultList.filter(item =>
        (item.class_section || item.class || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalItems = filteredList.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const totalPages = Math.ceil(totalItems / safeRecordsPerPage);
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentData = filteredList.slice(indexOfFirstItem, indexOfLastItem);

    const totals = filteredList.reduce((acc, curr) => ({
        all_present: acc.all_present + parseInt(curr.total_present || 0),
        all_absent: acc.all_absent + parseInt(curr.total_absent || 0),
    }), { all_present: 0, all_absent: 0 });

    const totalStudents = totals.all_present + totals.all_absent;
    const all_present_percent = totalStudents ? ((totals.all_present / totalStudents) * 100).toFixed(2) : '0.00';
    const all_absent_percent = totalStudents ? ((totals.all_absent / totalStudents) * 100).toFixed(2) : '0.00';

    const getClassSection = (item) => item.class_section || `${item.class || ''} ${item.section ? `(${item.section})` : ''}`.trim();

    const formatCell = (row, key) => {
        if (key === 'class_section') return getClassSection(row);
        return row[key] || '0';
    };

    const getExportData = () => {
        const dataForExport = [...filteredList, { 
            class_section: 'Total', 
            total_present: totals.all_present, 
            total_absent: totals.all_absent, 
            present_percent: all_present_percent, 
            absent_percent: all_absent_percent 
        }];
        return buildExportData(columns, visibleColumns, dataForExport, formatCell);
    };

    return (
        <AttendanceLayout activeTab="date">
            <div className="sis-search-bar-container" style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <div className="sis-search-bar-header">
                    <h3 className="sis-search-title" style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600', color: '#1e293b' }}>Select Criteria</h3>
                </div>
                <form onSubmit={handleSearch}>
                    <div className="sis-filter-row" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div className="sis-filter-col" style={{ flex: '1', minWidth: '200px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>Date <span className="req">*</span></label>
                            <input
                                type="date"
                                className="form-control sis-filter-select"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }}
                            />
                            {errors.date && <span className="text-danger" style={{ fontSize: '11px' }}>{errors.date}</span>}
                        </div>
                        <div className="sis-filter-col" style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <button type="submit" className="btn btn-primary sis-apply-btn" disabled={loading} style={{ height: '40px', padding: '0 24px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className={`fa ${loading ? 'fa-spinner fa-spin' : 'fa-search'}`}></i> {loading ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {initialLoading ? (
                <div className="text-center p-5"><Loader /></div>
            ) : (
                <div className="sis-list-container" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div className="sis-list-header" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>Daily Attendance Report</h3>
                    </div>

                    <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
                        <div style={{ position: 'relative', width: '300px' }}>
                            <i className="fa fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="form-control"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                style={{ paddingLeft: '36px', borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }}
                            />
                        </div>
                        <PremiumTableToolbar
                            columns={columns}
                            visibleColumns={visibleColumns}
                            onToggleColumn={(key) => setVisibleColumns(prev => {
                                const next = new Set(prev);
                                if (next.has(key)) next.delete(key); else next.add(key);
                                return next;
                            })}
                            getExportData={getExportData}
                            exportFileName="daily_attendance_report"
                            exportTitle="Daily Attendance Report"
                            recordsPerPage={recordsPerPage}
                            onRecordsPerPageChange={(val) => { setRecordsPerPage(val); setCurrentPage(1); }}
                        />
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover" style={{ margin: 0 }}>
                            <thead>
                                <tr className="modern-table-header">
                                    {visibleColumns.has('class_section') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Class (Section)</th>}
                                    {visibleColumns.has('total_present') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Total Present</th>}
                                    {visibleColumns.has('total_absent') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Total Absent</th>}
                                    {visibleColumns.has('present_percent') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Present %</th>}
                                    {visibleColumns.has('absent_percent') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Absent %</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.length > 0 ? (
                                    <>
                                        {currentData.map((value, index) => (
                                            <tr key={index} className="modern-table-row">
                                                {visibleColumns.has('class_section') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{getClassSection(value)}</td>}
                                                {visibleColumns.has('total_present') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{value.total_present}</td>}
                                                {visibleColumns.has('total_absent') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{value.total_absent}</td>}
                                                {visibleColumns.has('present_percent') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{value.present_percent}</td>}
                                                {visibleColumns.has('absent_percent') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{value.absent_percent}</td>}
                                            </tr>
                                        ))}
                                        {currentPage === totalPages && (
                                            <tr style={{ background: '#f8fafc', fontWeight: '700' }}>
                                                {visibleColumns.has('class_section') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b' }}>Total</td>}
                                                {visibleColumns.has('total_present') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b' }}>{totals.all_present}</td>}
                                                {visibleColumns.has('total_absent') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b' }}>{totals.all_absent}</td>}
                                                {visibleColumns.has('present_percent') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b' }}>{all_present_percent}%</td>}
                                                {visibleColumns.has('absent_percent') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b' }}>{all_absent_percent}%</td>}
                                            </tr>
                                        )}
                                    </>
                                ) : (
                                    <tr><td colSpan={visibleColumns.size} className="text-center p-4 text-muted">No data available</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {!initialLoading && totalItems > 0 && (
                        <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
                            <div style={{ color: '#64748b', fontSize: '14px' }}>
                                Showing {(currentPage - 1) * safeRecordsPerPage + 1} to {Math.min(currentPage * safeRecordsPerPage, totalItems)} of {totalItems} entries
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                    className="btn btn-default btn-sm" 
                                    disabled={currentPage === 1} 
                                    onClick={() => setCurrentPage(prev => prev - 1)} 
                                    style={{ borderRadius: '6px', border: '1px solid #e2e8f0', background: '#ffffff', color: currentPage === 1 ? '#cbd5e1' : '#475569' }}
                                >
                                    <i className="fa fa-angle-left"></i>
                                </button>
                                <button 
                                    className="btn btn-sm" 
                                    style={{ borderRadius: '6px', background: '#7c3aed', color: '#ffffff', minWidth: '32px', fontWeight: '600' }}
                                >
                                    {currentPage}
                                </button>
                                <button 
                                    className="btn btn-default btn-sm" 
                                    disabled={currentPage >= totalPages} 
                                    onClick={() => setCurrentPage(prev => prev + 1)} 
                                    style={{ borderRadius: '6px', border: '1px solid #e2e8f0', background: '#ffffff', color: currentPage >= totalPages ? '#cbd5e1' : '#475569' }}
                                >
                                    <i className="fa fa-angle-right"></i>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </AttendanceLayout>
    );
};

export default DailyAttendanceReport;
