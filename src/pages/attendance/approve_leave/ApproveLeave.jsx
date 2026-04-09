import React, { useState, useEffect } from 'react';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import Loader from '../../../components/Loader';
import api from '../../../services/api';
import LeaveModal from './LeaveModal';
import Pagination from '../../../utils/Pagination';
// AttendanceSidebar removed as per request 

import { buildExportData } from '../../../utils/tableExport';
import TableToolbar from '../../../utils/TableToolbar';
import toast from 'react-hot-toast';
import { useRef } from 'react';
import '../../../utils/include_files'; // Importing global scripts/styles



const API_BASE = 'https://newlayout.wisibles.com/api_admin';

const ApproveLeave = () => {
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [leaveList, setLeaveList] = useState([]);
    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [filter, setFilter] = useState({ class_id: '', section_id: '', search_text: '' });
    const [formErrors, setFormErrors] = useState({});

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;


    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [selectedLeave, setSelectedLeave] = useState(null);

    // Column Visibility State
    const columns = [
        { key: 'firstname', label: 'Student Name' },
        { key: 'class', label: 'Class' },
        { key: 'section', label: 'Section' },
        { key: 'apply_date', label: 'Apply Date' },
        { key: 'from_date', label: 'From Date' },
        { key: 'to_date', label: 'To Date' },
        { key: 'status', label: 'Status' },
        { key: 'staff_name', label: 'Approve/Disapprove By' }
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
                await Promise.all([fetchClasses(), fetchLeaveData()]);
            } catch (error) {
                console.error("Initialization error:", error);
            } finally {
                setInitialLoading(false);
            }
        };
        init();
    }, []);

    const fetchClasses = async () => {
        // Class list is now fetched via fetchLeaveData from getApproveLeaveList
    };

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
        if (classId) {
            try {
                const response = await api.getSectionsByClass(classId);
                if (response && response.status && Array.isArray(response.data)) {
                    setSectionList(response.data);
                } else {
                    console.warn("Unexpected section data format", response);
                    setSectionList([]);
                }
            } catch (error) {
                console.error("Error fetching sections", error);
                setSectionList([]);
            }
        } else {
            setSectionList([]);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        
        let errors = {};
        if (!filter.class_id) errors.class_id = 'The Class field is required.';
        if (!filter.section_id) errors.section_id = 'The Section field is required.';

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setFormErrors({});
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('class_id', filter.class_id);
            fd.append('section_id', filter.section_id);

            const response = await api.searchApproveLeave(fd);
            if (response && response.status) {
                setLeaveList(Array.isArray(response.results) ? response.results : []);
            }
        } catch (error) {
            console.error("Error searching leave", error);
        } finally {
            setLoading(false);
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
            // Fallback: try to use the list data if fetch fails, or show error
            // alert("Failed to load leave details");
            // For now, let's allow editing with what we have if API fails? 
            // Better to show error as per PHP behavior (it shows errorMsg).
            alert("Failed to fetch leave details");
        }
    };

    const handleDelete = async (id, classId, sectionId) => {
        if (window.confirm('Are you sure you want to delete this leave request?')) {
            try {
                await api.deleteApproveLeave({ id, class_id: classId, section_id: sectionId });
                fetchLeaveData(); // Refresh list
            } catch (error) {
                alert('Error deleting leave: ' + error.message);
            }
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        // If already has /, just return
        if (dateStr.includes('/')) return dateStr;
        // If contains - (could be YYYY-MM-DD or DD-MM-YYYY)
        if (dateStr.includes('-')) {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                // Check if first part is year
                if (parts[0].length === 4) {
                    return `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
                // Case for DD-MM-YYYY
                return `${parts[0]}/${parts[1]}/${parts[2]}`;
            }
        }
        return dateStr;
    };

    const getStatusLabel = (status, date) => {
        if (status == 1) return <span className="label label-success">Approved {date ? `(${formatDate(date)})` : ''}</span>;
        if (status == 2) return <span className="label label-danger">Disapproved</span>;
        return <span className="label label-warning">Pending</span>;
    };

    const formatCell = (leave, key) => {
        switch (key) {
            case 'firstname': return `${leave.firstname} ${leave.lastname} (${leave.admission_no})`;
            case 'apply_date': return formatDate(leave.apply_date);
            case 'from_date': return formatDate(leave.from_date);
            case 'to_date': return formatDate(leave.to_date);
            case 'status': {
                if (leave.status == 1) return `Approved (${formatDate(leave.approve_date)})`;
                if (leave.status == 2) return "Disapproved";
                return "Pending";
            }
            case 'staff_name': return `${leave.staff_name} ${leave.surname} ${leave.staff_id ? `(${leave.staff_id})` : ''}`;
            default: return leave[key] || '';
        }
    };

    const filteredLeaveList = leaveList.filter(leave => {
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

    // Calculate pagination
    const totalItems = filteredLeaveList.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentItems = filteredLeaveList.slice(indexOfFirstItem, indexOfLastItem);

    // Export helpers
    const getExportData = () => buildExportData(columns, visibleColumns, filteredLeaveList, formatCell);

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content-header">
                    <h1><i className="fa fa-flask"></i> Approve Leave</h1>
                </section>

                <section className="content al-responsive-content">
                    <style>{`
                        @media (max-width: 767px) {
                            .al-responsive-content {
                                padding: 10px !important;
                            }
                            .al-responsive-content > .col-md-12 {
                                padding-left: 0px !important;
                                padding-right: 0px !important;
                            }
                            .al-responsive-content .box-body {
                                padding: 15px !important;
                            }
                            .al-responsive-content .table-responsive {
                                border: 1px solid #f4f4f4 !important;
                                border-radius: 4px;
                            }
                        }
                        @media (min-width: 768px) {
                            .al-responsive-content {
                                padding: 5px !important;
                            }
                        }
                    `}</style>
                    {initialLoading ? (
                        <Loader />
                    ) : (
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title"><i className="fa fa-search"></i> Select Criteria</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => window.history.back()} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <form onSubmit={handleSearch}>
                                    <div className="box-body">
                                        <div className="row">
                                            <div className="col-md-3 col-lg-3 col-sm-6">
                                                <div className="form-group">
                                                    <label>Class</label><small className="req"> *</small>
                                                    <select
                                                        className="form-control"
                                                        value={filter.class_id}
                                                        onChange={(e) => {
                                                            handleClassChange(e);
                                                            if (formErrors.class_id) setFormErrors(prev => ({ ...prev, class_id: '' }));
                                                        }}
                                                        autoFocus
                                                    >
                                                        <option value="">Select</option>
                                                        {classList.map(cls => (
                                                            <option key={cls.id} value={cls.id}>{cls.class}</option>
                                                        ))}
                                                    </select>
                                                    {formErrors.class_id && <span className="text-danger">{formErrors.class_id}</span>}
                                                </div>
                                            </div>
                                            <div className="col-md-3 col-lg-3 col-sm-6">
                                                <div className="form-group">
                                                    <label>Section</label><small className="req"> *</small>
                                                    <select
                                                        className="form-control"
                                                        value={filter.section_id}
                                                        onChange={(e) => {
                                                            setFilter(prev => ({ ...prev, section_id: e.target.value }));
                                                            if (formErrors.section_id) setFormErrors(prev => ({ ...prev, section_id: '' }));
                                                        }}
                                                    >
                                                        <option value="">Select</option>
                                                        {sectionList.map(sec => (
                                                            <option key={sec.section_id || sec.id} value={sec.section_id}>{sec.section}</option>
                                                        ))}
                                                    </select>
                                                    {formErrors.section_id && <span className="text-danger">{formErrors.section_id}</span>}
                                                </div>
                                            </div>
                                            {/* <div className="col-md-3 col-lg-3 col-sm-6">
                                                <div className="form-group">
                                                    <label>Search</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={filter.search}
                                                        onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                                                        placeholder="Search by student name..."
                                                    />
                                                </div>
                                            </div> */}
                                        </div>
                                        <button type="submit" className="btn btn-primary btn-sm checkbox-toggle pull-right">
                                            <i className="fa fa-search"></i> Search
                                        </button>
                                    </div>
                                </form>

                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="box-header with-border">
                                            <h3 className="box-title"><i className="fa fa-users"></i> Approve Leave List</h3>
                                            <div className="box-tools pull-right">
                                                <button type="button" onClick={handleAdd} className="btn btn-sm btn-primary" data-toggle="tooltip" title="Add">
                                                    <i className="fa fa-plus"></i> Add
                                                </button>
                                            </div>
                                        </div>
                                        <div style={{ padding: '8px 10px', borderBottom: '1px solid #f4f4f4' }}>
                                            <TableToolbar
                                                searchTerm={filter.search_text}
                                                onSearchChange={(val) => {
                                                    setFilter(prev => ({ ...prev, search_text: val }));
                                                    setCurrentPage(1);
                                                }}
                                                recordsPerPage={recordsPerPage}
                                                onRecordsPerPageChange={(val) => { setRecordsPerPage(val); setCurrentPage(1); }}
                                                columns={columns}
                                                visibleColumns={visibleColumns}
                                                onToggleColumn={toggleColumn}
                                                getExportData={getExportData}
                                                exportFileName="approve_leave_report"
                                                exportTitle="Approve Leave List"
                                            />
                                        </div>
                                        <div className="box-body">
                                            <div className="table-responsive overflow-visible-lg">
                                                <table className="table table-hover table-striped table-bordered example">
                                                    <thead>
                                                        <tr>
                                                            {visibleColumns.has('firstname') && <th>Student Name</th>}
                                                            {visibleColumns.has('class') && <th>Class</th>}
                                                            {visibleColumns.has('section') && <th>Section</th>}
                                                            {visibleColumns.has('apply_date') && <th>Apply Date</th>}
                                                            {visibleColumns.has('from_date') && <th>From Date</th>}
                                                            {visibleColumns.has('to_date') && <th>To Date</th>}
                                                            {visibleColumns.has('status') && <th>Status</th>}
                                                            {visibleColumns.has('staff_name') && <th>Approve/Disapprove By</th>}
                                                            <th className="text-right noExport">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {loading ? (
                                                            <tr><td colSpan="9" className="text-center">Loading...</td></tr>
                                                        ) : currentItems.length > 0 ? (
                                                            currentItems.map(leave => (
                                                                <tr key={leave.id}>
                                                                    {visibleColumns.has('firstname') && <td>{leave.firstname} {leave.lastname} ({leave.admission_no})</td>}
                                                                    {visibleColumns.has('class') && <td>{leave.class}</td>}
                                                                    {visibleColumns.has('section') && <td>{leave.section}</td>}
                                                                    {visibleColumns.has('apply_date') && <td>{formatDate(leave.apply_date)}</td>}
                                                                    {visibleColumns.has('from_date') && <td>{formatDate(leave.from_date)}</td>}
                                                                    {visibleColumns.has('to_date') && <td>{formatDate(leave.to_date)}</td>}
                                                                    {visibleColumns.has('status') && <td>{getStatusLabel(leave.status, leave.approve_date)}</td>}
                                                                    {visibleColumns.has('staff_name') && <td>{leave.staff_name} {leave.surname} {leave.staff_id ? `(${leave.staff_id})` : ''}</td>}
                                                                    <td className="text-right white-space-nowrap">
                                                                        {leave.docs && (
                                                                            <a href={`https://newlayout.wisibles.com/admin/approve_leave/download/${leave.id}`} className="btn btn-default btn-xs" title="Download" target="_blank" rel="noopener noreferrer">
                                                                                <i className="fa fa-download"></i>
                                                                            </a>
                                                                        )}
                                                                        <button
                                                                            onClick={() => handleEdit(leave)}
                                                                            className="btn btn-default btn-xs"
                                                                            title="Edit"
                                                                            style={{ marginLeft: '3px' }}
                                                                        >
                                                                            <i className="fa fa-pencil"></i>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDelete(leave.id, leave.class_id, leave.section_id)}
                                                                            className="btn btn-default btn-xs"
                                                                            title="Delete"
                                                                            style={{ marginLeft: '3px' }}
                                                                        >
                                                                            <i className="fa fa-trash"></i>
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr><td colSpan="9" className="text-center">No data available in table</td></tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="pt15 pb15" style={{ padding: '15px 0' }}>
                                                <Pagination
                                                    totalItems={totalItems}
                                                    itemsPerPage={recordsPerPage}
                                                    currentPage={currentPage}
                                                    onPageChange={(page) => setCurrentPage(page)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    )}
                </section>
            </div >
            <Footer />
            <LeaveModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                onSuccess={() => { fetchLeaveData(); }}
                initialData={selectedLeave}
                isEdit={modalMode === 'edit'}
                classList={classList}
            />
        </div >
    );
};

export default ApproveLeave;
