import React, { useState, useEffect } from 'react';
import AttendanceLayout from './AttendanceLayout';
import { api } from '../../services/api';
import { useAttendanceCounts } from '../../context/AttendanceCountContext';
import toast from 'react-hot-toast';
import PremiumTableToolbar from '../../utils/PremiumTableToolbar';
import { buildExportData } from '../../utils/tableExport';

const LateEntries = () => {
    const { updateCount } = useAttendanceCounts();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [admissionNo, setAdmissionNo] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);
    const [searchTerm, setSearchTerm] = useState('');
    const [searched, setSearched] = useState(false);

    const columns = [
        { key: 'sno', label: 'S.No' },
        { key: 'name', label: 'Name' },
        { key: 'admission_no', label: 'Admission No' },
        { key: 'class_section', label: 'Class (Section)' },
        { key: 'date', label: 'Date' },
        { key: 'time', label: 'Time' },
        { key: 'roll_no', label: 'Roll No' }
    ];
    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));

    useEffect(() => {
        // Removed fetchInitialData to comply with "box has to open on search not has to be directly shown"
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const response = await api.getLateEntriesReport();
            if (response) {
                const lateData = Array.isArray(response) ? response : (response.data || []);
                setData(lateData);
                updateCount('lateEntries', lateData.length);
            }
        } catch (error) {
            console.error('Error fetching late entries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const payload = { admission_no: admissionNo };
            const response = await api.searchLateEntriesReport(payload);
            if (response) {
                const lateData = Array.isArray(response) ? response : (response.data || []);
                setData(lateData);
                setSearched(true);
                setCurrentPage(1);
                toast.success('Search completed');
            }
        } catch (error) {
            toast.error('Search failed');
        } finally {
            setLoading(false);
        }
    };

    const filteredList = data.filter(r => {
        if (!searchTerm) return true;
        const s = searchTerm.toLowerCase();
        return (
            `${r.firstname} ${r.lastname}`.toLowerCase().includes(s) ||
            (r.admission_no || '').toLowerCase().includes(s) ||
            (r.class || '').toLowerCase().includes(s) ||
            (r.section || '').toLowerCase().includes(s) ||
            (r.roll_no || '').toLowerCase().includes(s)
        );
    });

    const totalItems = filteredList.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentData = filteredList.slice(indexOfFirstItem, indexOfLastItem);

    const formatCell = (r, key) => {
        switch (key) {
            case 'sno': return data.indexOf(r) + 1;
            case 'name': return `${r.firstname} ${r.lastname}`;
            case 'class_section': return `${r.class} (${r.section})`;
            default: return r[key] || '';
        }
    };

    const totalPages = Math.ceil(totalItems / safeRecordsPerPage);
    const getExportData = () => buildExportData(columns, visibleColumns, filteredList, formatCell);

    return (
        <AttendanceLayout activeTab="late">
            <div className="sis-search-bar-container" style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <div className="sis-search-bar-header">
                    <h3 className="sis-search-title" style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600', color: '#1e293b' }}>Select Criteria</h3>
                </div>
                <form onSubmit={handleSearch}>
                    <div className="sis-filter-row" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div className="sis-filter-col" style={{ flex: '1', minWidth: '200px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>Admission No</label>
                            <input
                                type="text"
                                className="form-control sis-filter-select"
                                value={admissionNo}
                                onChange={(e) => setAdmissionNo(e.target.value)}
                                placeholder="Enter Admission No"
                                style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }}
                            />
                        </div>
                        <div className="sis-filter-col" style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <button type="submit" className="btn btn-primary sis-apply-btn" disabled={loading} style={{ height: '40px', padding: '0 24px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className={`fa ${loading ? 'fa-spinner fa-spin' : 'fa-search'}`}></i> {loading ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {searched && (
                <div className="sis-list-container" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div className="sis-list-header" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>Late Entry List ({totalItems})</h3>
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
                        exportFileName="late_entries"
                        exportTitle="Late Entries Report"
                        recordsPerPage={recordsPerPage}
                        onRecordsPerPageChange={(val) => { setRecordsPerPage(val); setCurrentPage(1); }}
                    />
                </div>

                <div className="table-responsive">
                    <table className="table table-hover" style={{ margin: 0 }}>
                        <thead>
                            <tr className="modern-table-header">
                                {visibleColumns.has('sno') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>S.No</th>}
                                {visibleColumns.has('name') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Name</th>}
                                {visibleColumns.has('admission_no') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Admission No</th>}
                                {visibleColumns.has('class_section') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Class (Section)</th>}
                                {visibleColumns.has('date') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Date</th>}
                                {visibleColumns.has('time') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Time</th>}
                                {visibleColumns.has('roll_no') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Roll No</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.length > 0 ? (
                                currentData.map((r, i) => (
                                    <tr key={indexOfFirstItem + i} className="modern-table-row">
                                        {visibleColumns.has('sno') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{indexOfFirstItem + i + 1}</td>}
                                        {visibleColumns.has('name') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{r.firstname} {r.lastname}</td>}
                                        {visibleColumns.has('admission_no') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{r.admission_no}</td>}
                                        {visibleColumns.has('class_section') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{r.class} ({r.section})</td>}
                                        {visibleColumns.has('date') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{r.date}</td>}
                                        {visibleColumns.has('time') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{r.time}</td>}
                                        {visibleColumns.has('roll_no') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{r.roll_no}</td>}
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={visibleColumns.size} className="text-center p-4 text-muted">No data available</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalItems > 0 && (
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
            </div>)}
        </AttendanceLayout>
    );
};

export default LateEntries;
