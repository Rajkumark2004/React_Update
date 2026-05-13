import React, { useState, useEffect } from 'react';
import Loader from '../../../components/Loader';
import { api } from '../../../services/api';
import LeaveModal from './LeaveModal';
import AttendanceLayout from '../AttendanceLayout';
import { buildExportData } from '../../../utils/tableExport';
import PremiumTableToolbar from '../../../utils/PremiumTableToolbar';
import toast from 'react-hot-toast';
import '../../../utils/include_files';

const ApproveLeave = () => {
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [leaveList, setLeaveList] = useState([]);
    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [filter, setFilter] = useState({ class_id: '', section_id: '', search_text: '' });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedLeave, setSelectedLeave] = useState(null);

    // Column Visibility State
    const columns = [
        { key: 'student_name', label: 'Student Name' },
        { key: 'class', label: 'Class' },
        { key: 'section', label: 'Section' },
        { key: 'apply_date', label: 'Apply Date' },
        { key: 'from_date', label: 'From Date' },
        { key: 'to_date', label: 'To Date' },
        { key: 'status', label: 'Status' },
        { key: 'approve_by', label: 'Approve By' }
    ];
    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));

    const toggleColumn = (key) => {
        setVisibleColumns(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    useEffect(() => {
        const init = async () => {
            try {
                await fetchLeaveData();
            } catch (error) {
                console.error("Initialization error:", error);
            } finally {
                setInitialLoading(false);
            }
        };
        init();
    }, []);

    const fetchLeaveData = async () => {
        setLoading(true);
        try {
            const response = await api.getApproveLeaveList();
            if (response && response.status) {
                setLeaveList(Array.isArray(response.results) ? response.results : []);
                if (Array.isArray(response.classlist)) {
                    setClassList(response.classlist);
                }
            }
        } catch (error) {
            console.error("Error fetching leave list", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClassChange = async (e) => {
        const classId = e.target.value;
        setFilter(prev => ({ ...prev, class_id: classId, section_id: '' }));
        setSectionList([]);
        if (classId) {
            try {
                const response = await api.getSectionsByClass(classId);
                if (response && response.status && Array.isArray(response.data)) {
                    setSectionList(response.data);
                } else {
                    setSectionList([]);
                }
            } catch (error) {
                console.error("Error fetching sections", error);
                setSectionList([]);
            }
        }
    };

    const handleAdd = () => {
        setModalMode('add');
        setSelectedLeave(null);
        setShowModal(true);
    };

    const handleEdit = async (leave) => {
        try {
            const data = await api.getLeaveDetails({
                id: leave.id,
                class_id: leave.class_id,
                section_id: leave.section_id
            });
            setModalMode('edit');
            setSelectedLeave(data);
            setShowModal(true);
        } catch (error) {
            console.error("Error fetching leave details", error);
            toast.error("Failed to fetch leave details");
        }
    };

    const getInitials = (name) => {
        if (!name) return '';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const getAvatarColor = (name) => {
        const colors = [
            { bg: '#e0f2fe', text: '#0284c7' },
            { bg: '#f3e8ff', text: '#9333ea' },
            { bg: '#dcfce7', text: '#16a34a' },
            { bg: '#fef3c7', text: '#d97706' },
            { bg: '#ffe4e6', text: '#e11d48' },
        ];
        let hash = 0;
        if (name) {
            for (let i = 0; i < name.length; i++) {
                hash = name.charCodeAt(i) + ((hash << 5) - hash);
            }
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const handleDelete = async (id, classId, sectionId) => {
        if (window.confirm('Are you sure you want to delete this leave request?')) {
            try {
                await api.deleteApproveLeave({ id, class_id: classId, section_id: sectionId });
                toast.success('Leave deleted successfully');
                fetchLeaveData();
            } catch (error) {
                toast.error('Error deleting leave: ' + error.message);
            }
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        if (dateStr.includes('/')) return dateStr;
        if (dateStr.includes('-')) {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                if (parts[0].length === 4) return `${parts[2]}/${parts[1]}/${parts[0]}`;
                return `${parts[0]}/${parts[1]}/${parts[2]}`;
            }
        }
        return dateStr;
    };

    const getStatusLabel = (status, date) => {
        if (status == 1) return <span className="label label-success" style={{ borderRadius: '4px', padding: '2px 8px' }}>Approved {date ? `(${formatDate(date)})` : ''}</span>;
        if (status == 2) return <span className="label label-danger" style={{ borderRadius: '4px', padding: '2px 8px' }}>Disapproved</span>;
        return <span className="label label-warning" style={{ borderRadius: '4px', padding: '2px 8px' }}>Pending</span>;
    };

    const formatCell = (leave, key) => {
        switch (key) {
            case 'student_name': return `${leave.firstname} ${leave.lastname} (${leave.admission_no})`;
            case 'apply_date': return formatDate(leave.apply_date);
            case 'from_date': return formatDate(leave.from_date);
            case 'to_date': return formatDate(leave.to_date);
            case 'status': {
                if (leave.status == 1) return `Approved (${formatDate(leave.approve_date)})`;
                if (leave.status == 2) return "Disapproved";
                return "Pending";
            }
            case 'approve_by': return `${leave.staff_name || ''} ${leave.surname || ''} ${leave.staff_id ? `(${leave.staff_id})` : ''}`.trim() || 'N/A';
            default: return leave[key] || '';
        }
    };

    const filteredLeaveList = leaveList.filter(leave => {
        if (filter.class_id && leave.class_id != filter.class_id) return false;
        if (filter.section_id && leave.section_id != filter.section_id) return false;
        
        const searchText = filter.search_text.toLowerCase();
        if (!searchText) return true;

        const studentName = `${leave.firstname || ''} ${leave.lastname || ''} (${leave.admission_no || ''})`.toLowerCase();
        const className = (leave.class || '').toLowerCase();
        const sectionName = (leave.section || '').toLowerCase();
        const staffName = `${leave.staff_name || ''} ${leave.surname || ''} ${leave.staff_id ? `(${leave.staff_id})` : ''}`.toLowerCase();
        const statusStr = (leave.status == 1 ? `Approved (${formatDate(leave.approve_date)})` : leave.status == 2 ? "Disapproved" : "Pending").toLowerCase();

        return studentName.includes(searchText) ||
            className.includes(searchText) ||
            sectionName.includes(searchText) ||
            staffName.includes(searchText) ||
            statusStr.includes(searchText);
    });

    const totalItems = filteredLeaveList.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentRecords = filteredLeaveList.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(totalItems / safeRecordsPerPage);
    const getExportData = () => buildExportData(columns, visibleColumns, filteredLeaveList, formatCell);

    return (
        <AttendanceLayout activeTab="approve">
            <div className="sis-search-bar-container" style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <div className="sis-search-bar-header">
                    <h3 className="sis-search-title" style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600', color: '#1e293b' }}>Select Criteria</h3>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); fetchLeaveData(); }}>
                    <div className="sis-filter-row" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div className="sis-filter-col" style={{ flex: '1', minWidth: '200px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>Class</label>
                            <select
                                className="form-control sis-filter-select"
                                value={filter.class_id}
                                onChange={handleClassChange}
                                style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }}
                            >
                                <option value="">Select</option>
                                {classList.map(cls => (
                                    <option key={cls.id} value={cls.id}>{cls.class}</option>
                                ))}
                            </select>
                        </div>
                        <div className="sis-filter-col" style={{ flex: '1', minWidth: '200px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>Section</label>
                            <select
                                className="form-control sis-filter-select"
                                value={filter.section_id}
                                onChange={(e) => setFilter(prev => ({ ...prev, section_id: e.target.value }))}
                                style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }}
                            >
                                <option value="">Select</option>
                                {sectionList.map(sec => (
                                    <option key={sec.section_id || sec.id} value={sec.section_id || sec.id}>{sec.section}</option>
                                ))}
                            </select>
                        </div>
                        <div className="sis-filter-col" style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: '40px', padding: '0 24px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className={`fa ${loading ? 'fa-spinner fa-spin' : 'fa-search'}`}></i> {loading ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div className="sis-list-container" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div className="sis-list-header" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>Leave List ({totalItems})</h3>
                    <button
                        onClick={handleAdd}
                        className="btn btn-primary"
                        style={{ borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <i className="fa fa-plus"></i> Add
                    </button>
                </div>

                <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <i className="fa fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                        <input
                            type="text"
                            placeholder="Search..."
                            className="form-control"
                            value={filter.search_text}
                            onChange={(e) => { setFilter(prev => ({ ...prev, search_text: e.target.value })); setCurrentPage(1); }}
                            style={{ paddingLeft: '36px', borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }}
                        />
                    </div>
                    <PremiumTableToolbar
                        columns={columns}
                        visibleColumns={visibleColumns}
                        onToggleColumn={toggleColumn}
                        getExportData={getExportData}
                        exportFileName="approve_leave_list"
                        exportTitle="Approve Leave List"
                        recordsPerPage={recordsPerPage}
                        onRecordsPerPageChange={(val) => { setRecordsPerPage(val); setCurrentPage(1); }}
                    />
                </div>

                <div className="table-responsive">
                    <table className="table table-hover" style={{ margin: 0 }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                {visibleColumns.has('student_name') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Student Name</th>}
                                {visibleColumns.has('class') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Class</th>}
                                {visibleColumns.has('section') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Section</th>}
                                {visibleColumns.has('apply_date') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Apply Date</th>}
                                {visibleColumns.has('from_date') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>From Date</th>}
                                {visibleColumns.has('to_date') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>To Date</th>}
                                {visibleColumns.has('status') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Status</th>}
                                {visibleColumns.has('approve_by') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Approve By</th>}
                                <th className="text-right" style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {initialLoading ? (
                                <tr><td colSpan={visibleColumns.size + 1} className="text-center p-4"><Loader /></td></tr>
                            ) : currentRecords.length > 0 ? (
                                currentRecords.map((leave) => (
                                    <tr key={leave.id}>
                                        {visibleColumns.has('student_name') && (
                                            <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ 
                                                        width: '32px', height: '32px', borderRadius: '50%', 
                                                        backgroundColor: getAvatarColor(`${leave.firstname} ${leave.lastname}`).bg, 
                                                        color: getAvatarColor(`${leave.firstname} ${leave.lastname}`).text,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontWeight: '600', fontSize: '13px', flexShrink: 0
                                                    }}>
                                                        {getInitials(`${leave.firstname} ${leave.lastname}`)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '500' }}>{leave.firstname} {leave.lastname}</div>
                                                        <div style={{ fontSize: '12px', color: '#64748b' }}>{leave.admission_no}</div>
                                                    </div>
                                                </div>
                                            </td>
                                        )}
                                        {visibleColumns.has('class') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{leave.class}</td>}
                                        {visibleColumns.has('section') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{leave.section}</td>}
                                        {visibleColumns.has('apply_date') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{formatDate(leave.apply_date)}</td>}
                                        {visibleColumns.has('from_date') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{formatDate(leave.from_date)}</td>}
                                        {visibleColumns.has('to_date') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{formatDate(leave.to_date)}</td>}
                                        {visibleColumns.has('status') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{getStatusLabel(leave.status, leave.approve_date)}</td>}
                                        {visibleColumns.has('approve_by') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{leave.staff_name} {leave.surname} {leave.staff_id ? `(${leave.staff_id})` : ''}</td>}
                                        <td className="text-right" style={{ padding: '12px 24px', borderBottom: '1px solid #f1f5f9' }}>
                                            <div className="btn-group">
                                                {leave.docs && (
                                                    <a href={`https://newlayout.wisibles.com/admin/approve_leave/download/${leave.id}`} className="btn btn-default btn-xs" title="Download" target="_blank" rel="noopener noreferrer" style={{ marginRight: '4px', borderRadius: '4px' }}>
                                                        <i className="fa fa-download"></i>
                                                    </a>
                                                )}
                                                <button className="btn btn-default btn-xs" title="Edit" onClick={() => handleEdit(leave)} style={{ marginRight: '4px', borderRadius: '4px' }}>
                                                    <i className="fa fa-pencil"></i>
                                                </button>
                                                <button className="btn btn-default btn-xs" title="Delete" onClick={() => handleDelete(leave.id, leave.class_id, leave.section_id)} style={{ borderRadius: '4px' }}>
                                                    <i className="fa fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={visibleColumns.size + 1} className="text-center p-4 text-muted">No data available in table</td></tr>
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
            <LeaveModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                onSuccess={() => { fetchLeaveData(); }}
                initialData={selectedLeave}
                isEdit={modalMode === 'edit'}
                classList={classList}
            />
        </AttendanceLayout>
    );
};

export default ApproveLeave;
