import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import TableToolbar from '../../utils/TableToolbar';
import Pagination from '../../utils/Pagination';
import '../../utils/include_files';

const COLUMNS = [
    { key: 'staff', label: 'Staff' },
    { key: 'leave_type', label: 'Leave Type' },
    { key: 'leave_date', label: 'Leave Date' },
    { key: 'days', label: 'Days' },
    { key: 'apply_date', label: 'Apply Date' },
    { key: 'status', label: 'Status' },
    { key: 'action', label: 'Action' }
];

const LeaveRequest = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isEdit, setIsEdit] = useState(false);

    // TableToolbar state
    const [searchTerm, setSearchTerm] = useState('');
    const [recordsPerPage, setRecordsPerPage] = useState(100);
    const [currentPage, setCurrentPage] = useState(1);
    const [visibleColumns, setVisibleColumns] = useState(new Set(COLUMNS.map(c => c.key)));

    // Form states
    const [formData, setFormData] = useState({
        id: '',
        applieddate: new Date().toISOString().split('T')[0],
        leave_type: '',
        leave_from_date: '',
        leave_to_date: '',
        reason: '',
        file: null
    });

    const [statusData, setStatusData] = useState({
        leave_request_id: '',
        status: '',
        remark: ''
    });

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const response = await api.getStaffLeaveIndex();
            if (response && response.status === 'success') {
                // Get staff_id from localStorage
                let staffId = null;
                try {
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        const user = JSON.parse(storedUser);
                        if (user.id) staffId = String(user.id);
                    }
                } catch (e) {
                    console.error('Failed to parse user data:', e);
                }

                const allLeaves = response.leave_request || [];
                // Filter leaves for the logged-in staff; show none if no valid staffId is found
                const filteredLeaves = staffId
                    ? allLeaves.filter(leave => String(leave.staff_id) === String(staffId))
                    : [];

                setLeaveRequests(filteredLeaves);

                if (staffId) {
                    try {
                        const countResponse = await api.countLeave(staffId);
                        if (countResponse && countResponse.status === 'success') {
                            setLeaveTypes(countResponse.data || []);
                        } else {
                            setLeaveTypes(response.leavetype || []);
                        }
                    } catch (e) {
                        console.error('Failed to get leave counts:', e);
                        setLeaveTypes(response.leavetype || []);
                    }
                } else {
                    setLeaveTypes(response.leavetype || []);
                }
            }
        } catch (error) {
            console.error('Error fetching leave list:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    // Initialize Dropify
    useEffect(() => {
        if (showAddModal) {
            const timer = setTimeout(() => {
                try {
                    const $ = window.jQuery;
                    if ($ && $.fn && typeof $.fn.dropify === 'function') {
                        $('.dropify').dropify();
                    }
                } catch (error) {
                    console.error('Dropify initialization error:', error);
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [showAddModal]);

    const handleAddLeave = () => {
        setIsEdit(false);
        setFormData({
            id: '',
            applieddate: new Date().toISOString().split('T')[0],
            leave_type: '',
            leave_from_date: '',
            leave_to_date: '',
            reason: '',
            file: null
        });
        setShowAddModal(true);
    };

    const handleViewDetails = async (id) => {
        setLoading(true);
        try {
            const data = new FormData();
            data.append('id', id);
            const response = await api.getStaffLeaveRecord(data);
            if (response) {
                setSelectedRecord(response);
                setStatusData({
                    leave_request_id: response.id,
                    status: response.status || 'pending',
                    remark: response.admin_remark || ''
                });
                setShowDetailModal(true);
            }
        } catch (error) {
            console.error('Error fetching record:', error);
            toast.error('Failed to fetch details');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, staff_id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            setLoading(true);
            try {
                const response = await api.deleteStaffLeave(id, staff_id);
                if (response && response.status === 'success') {
                    toast.success('Record deleted successfully');
                    fetchInitialData();
                } else {
                    toast.error(response?.message || 'Failed to delete');
                }
            } catch (error) {
                console.error('Error deleting record:', error);
                toast.error('An error occurred while deleting');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSaveLeave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            data.append('applieddate', formData.applieddate.split('-').reverse().join('/'));
            data.append('leave_type', formData.leave_type);
            data.append('leave_from_date', formData.leave_from_date.split('-').reverse().join('/'));
            data.append('leave_to_date', formData.leave_to_date.split('-').reverse().join('/'));
            data.append('reason', formData.reason);
            data.append('leaverequestid', formData.id);
            if (formData.file) {
                data.append('userfile', formData.file);
            }

            const response = await api.addStaffLeaveRequest(data);
            if (response && response.status === 'success') {
                toast.success('Leave saved successfully');
                setShowAddModal(false);
                fetchInitialData();
            } else {
                toast.error(response?.message || 'Failed to save');
            }
        } catch (error) {
            console.error('Error saving leave:', error);
            toast.error('An error occurred while saving');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            data.append('leave_request_id', statusData.leave_request_id);
            data.append('status', statusData.status);
            data.append('remark', statusData.remark);

            const response = await api.updateStaffLeaveStatus(data);
            if (response && response.status === 'success') {
                toast.success('Status updated successfully');
                setShowDetailModal(false);
                fetchInitialData();
            } else {
                toast.error(response?.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('An error occurred while updating status');
        } finally {
            setLoading(false);
        }
    };

    // Filtered + paginated data
    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return leaveRequests;
        const term = searchTerm.toLowerCase();
        return leaveRequests.filter(v =>
            `${v.name} ${v.surname}`.toLowerCase().includes(term) ||
            (v.type || '').toLowerCase().includes(term) ||
            (v.status || '').toLowerCase().includes(term) ||
            (v.employee_id || '').toLowerCase().includes(term)
        );
    }, [leaveRequests, searchTerm]);

    const paginatedData = useMemo(() => {
        if (recordsPerPage === -1) return filteredData;
        const start = (currentPage - 1) * recordsPerPage;
        return filteredData.slice(start, start + recordsPerPage);
    }, [filteredData, currentPage, recordsPerPage]);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, recordsPerPage]);

    const handleToggleColumn = (key) => {
        setVisibleColumns(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key); else next.add(key);
            return next;
        });
    };

    const getExportData = () => {
        const exportCols = COLUMNS.filter(c => c.key !== 'action' && visibleColumns.has(c.key));
        const colMap = {
            staff: v => `${v.name} ${v.surname}`,
            leave_type: v => v.type || '',
            leave_date: v => `${v.leave_from} - ${v.leave_to}`,
            days: v => v.leave_days || '',
            apply_date: v => v.date || '',
            status: v => v.status || ''
        };
        return {
            headers: exportCols.map(c => c.label),
            rows: filteredData.map(v => exportCols.map(c => (colMap[c.key] ? colMap[c.key](v) : '')))
        };
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content-header">
                    <h1><i className="fa fa-sitemap"></i> Human Resource</h1>
                </section>

                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Leaves</h3>
                                    <div className="box-tools pull-right">
                                        <button onClick={handleAddLeave} className="btn btn-primary btn-sm edit_setting">
                                            Apply Leave
                                        </button>
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-sm" style={{ marginLeft: '5px' }}>
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <TableToolbar
                                        searchTerm={searchTerm}
                                        onSearchChange={setSearchTerm}
                                        recordsPerPage={recordsPerPage}
                                        onRecordsPerPageChange={setRecordsPerPage}
                                        columns={COLUMNS}
                                        visibleColumns={visibleColumns}
                                        onToggleColumn={handleToggleColumn}
                                        getExportData={getExportData}
                                        exportFileName="leave_request_list"
                                        exportTitle="Leave Request List"
                                    />
                                    <div className="table-responsive no-padding">
                                        <table className="table table-striped table-bordered table-hover">
                                            <thead>
                                                <tr>
                                                    {visibleColumns.has('staff') && <th>Staff</th>}
                                                    {visibleColumns.has('leave_type') && <th>Leave Type</th>}
                                                    {visibleColumns.has('leave_date') && <th>Leave Date</th>}
                                                    {visibleColumns.has('days') && <th>Days</th>}
                                                    {visibleColumns.has('apply_date') && <th>Apply Date</th>}
                                                    {visibleColumns.has('status') && <th>Status</th>}
                                                    {visibleColumns.has('action') && <th className="text-right noExport">Action</th>}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedData.map((value, index) => {
                                                    let label = 'label label-warning';
                                                    let statusText = value.status;
                                                    if (value.status === 'approve' || value.status === 'approved') {
                                                        label = 'label label-success';
                                                        statusText = 'Approve';
                                                    } else if (value.status === 'pending') {
                                                        label = 'label label-warning';
                                                        statusText = 'Pending';
                                                    } else if (value.status === 'disapproved') {
                                                        label = 'label label-danger';
                                                        statusText = 'Disapprove';
                                                    }

                                                    return (
                                                        <tr key={index}>
                                                            {visibleColumns.has('staff') && (
                                                                <td>
                                                                    <span title={`Staff ID: ${value.employee_id}`}>
                                                                        {value.name} {value.surname}
                                                                    </span>
                                                                </td>
                                                            )}
                                                            {visibleColumns.has('leave_type') && <td>{value.type}</td>}
                                                            {visibleColumns.has('leave_date') && <td>{value.leave_from} - {value.leave_to}</td>}
                                                            {visibleColumns.has('days') && <td>{value.leave_days}</td>}
                                                            {visibleColumns.has('apply_date') && <td>{value.date}</td>}
                                                            {visibleColumns.has('status') && (
                                                                <td>
                                                                    <span className={label} title={value.applied_by ? `Submitted By: ${value.applied_by}` : ''}>
                                                                        {statusText}
                                                                    </span>
                                                                </td>
                                                            )}
                                                            {visibleColumns.has('action') && (
                                                                <td className="text-right">
                                                                    <button
                                                                        onClick={() => handleViewDetails(value.id)}
                                                                        className="btn btn-default btn-xs"
                                                                        title="View"
                                                                    >
                                                                        <i className="fa fa-reorder"></i>
                                                                    </button>
                                                                    {value.status === 'pending' && (
                                                                        <button
                                                                            onClick={() => handleDelete(value.id, value.staff_id)}
                                                                            className="btn btn-default btn-xs"
                                                                            title="Delete"
                                                                            style={{ marginLeft: '3px' }}
                                                                        >
                                                                            <i className="fa fa-remove"></i>
                                                                        </button>
                                                                    )}
                                                                    {value.document_file && (
                                                                        <a
                                                                            href={`https://newlayout.wisibles.com/admin/leaverequest/downloadleaverequestdoc/${value.staff_id}/${value.id}`}
                                                                            className="btn btn-default btn-xs"
                                                                            title="Download"
                                                                            style={{ marginLeft: '3px' }}
                                                                        >
                                                                            <i className="fa fa-download"></i>
                                                                        </a>
                                                                    )}
                                                                </td>
                                                            )}
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Pagination
                                        totalItems={filteredData.length}
                                        itemsPerPage={recordsPerPage}
                                        currentPage={currentPage}
                                        onPageChange={setCurrentPage}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Add Leave Modal */}
            {showAddModal && (
                <div className="modal fade in" style={{ display: 'block' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" onClick={() => setShowAddModal(false)}>&times;</button>
                                <h4 className="modal-title">Add Details</h4>
                            </div>
                            <form onSubmit={handleSaveLeave}>
                                <div className="modal-body hide-scrollbar" style={{ maxHeight: 'calc(100vh - 150px)', overflowY: 'auto', overflowX: 'hidden' }}>
                                    <div className="row">
                                        <div className="form-group col-md-6">
                                            <label>Apply Date</label><small className="req"> *</small>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={formData.applieddate}
                                                onChange={(e) => setFormData({ ...formData, applieddate: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group col-md-6">
                                            <label>Available Leave</label><small className="req"> *</small>
                                            <select
                                                className="form-control"
                                                value={formData.leave_type}
                                                onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                                                required
                                            >
                                                <option value="">Select</option>
                                                {leaveTypes.map((type, idx) => (
                                                    <option key={idx} value={type.id}>
                                                        {type.type} {type.available != null ? `(${type.available})` : (type.alloted_leave ? `(${type.alloted_leave})` : '')}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group col-md-6">
                                            <label>Leave From Date</label><small className="req"> *</small>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={formData.leave_from_date}
                                                onChange={(e) => setFormData({ ...formData, leave_from_date: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group col-md-6">
                                            <label>Leave To Date</label><small className="req"> *</small>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={formData.leave_to_date}
                                                onChange={(e) => setFormData({ ...formData, leave_to_date: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group col-md-12">
                                            <label>Reason</label>
                                            <textarea
                                                className="form-control"
                                                rows="4"
                                                style={{ resize: 'none' }}
                                                value={formData.reason}
                                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                            ></textarea>
                                        </div>
                                        <div className="form-group col-md-12">
                                            <label>Attach Document</label>
                                            <input
                                                type="file"
                                                className="dropify"
                                                data-height="92"
                                                onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="submit" className="btn btn-primary pull-right">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Details and Update Status Modal */}
            {/* Details and Update Status Modal */}
            {showDetailModal && selectedRecord && (
                <div className="modal fade in" style={{ display: 'block' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">

                            {/* Header */}
                            <div className="modal-header">
                                <button
                                    type="button"
                                    className="close"
                                    onClick={() => setShowDetailModal(false)}
                                >
                                    &times;
                                </button>
                                <h4 className="modal-title">Details</h4>
                            </div>

                            {/* Body */}
                            <div className="modal-body hide-scrollbar" style={{ maxHeight: 'calc(100vh - 150px)', overflowY: 'auto', overflowX: 'hidden' }}>
                                <div className="row">
                                    <div className="col-md-12 table-responsive">
                                        <table className="table mb0 table-striped table-bordered">
                                            <tbody>
                                                <tr>
                                                    <th width="15%">Name</th>
                                                    <td width="35%">
                                                        {selectedRecord.name} {selectedRecord.surname}
                                                    </td>
                                                    <th width="15%">Staff ID</th>
                                                    <td width="35%">
                                                        {selectedRecord.employee_id}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>Submitted By</th>
                                                    <td>{selectedRecord.applied_by}</td>
                                                    <th>Leave Type</th>
                                                    <td>{selectedRecord.type}</td>
                                                </tr>
                                                <tr>
                                                    <th>Leave</th>
                                                    <td>
                                                        {selectedRecord.leavefrom} - {selectedRecord.leaveto} ({selectedRecord.leave_days} Days)
                                                    </td>
                                                    <th>Apply Date</th>
                                                    <td>{selectedRecord.date}</td>
                                                </tr>
                                                <tr>
                                                    <th>Reason</th>
                                                    <td>{selectedRecord.employee_remark}</td>
                                                    <th>Download</th>
                                                    <td>
                                                        {selectedRecord.document_file && (
                                                            <a
                                                                href={`https://newlayout.wisibles.com/admin/leaverequest/downloadleaverequestdoc/${selectedRecord.staff_id}/${selectedRecord.id}`}
                                                                className="btn btn-default btn-xs"
                                                                title="Download"
                                                            >
                                                                <i className="fa fa-download"></i>
                                                            </a>
                                                        )}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>Note</th>
                                                    <td colSpan="3">
                                                        {selectedRecord.admin_remark}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Status Update Form */}
                                <hr />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Backdrop */}
            {(showAddModal || showDetailModal) && (
                <div
                    className="modal-backdrop fade in"
                    onClick={() => {
                        setShowAddModal(false);
                        setShowDetailModal(false);
                    }}
                ></div>
            )}
            <Footer />
        </div>
    );
};

export default LeaveRequest;
