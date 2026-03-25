import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import '../../utils/include_files';

const LeaveRequest = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isEdit, setIsEdit] = useState(false);

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
                setLeaveRequests(response.leave_request || []);
                setLeaveTypes(response.leavetype || []);
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

    return (
        <div className="wrapper theme-white-skin">
            <Header />
            <Sidebar />

            <div className="content-wrapper">
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
                                        <div className="btn-group pull-right ml-lg-1">
                                            <button onClick={() => navigate(-1)} className="btn btn-primary btn-sm">
                                                <i className="fa fa-arrow-left"></i> Back
                                            </button>
                                        </div>
                                        <button onClick={handleAddLeave} className="btn btn-primary btn-sm pull-right edit_setting">
                                            Apply Leave
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="table-responsive no-padding">
                                        <table className="table table-striped table-bordered table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Staff</th>
                                                    <th>Leave Type</th>
                                                    <th>Leave Date</th>
                                                    <th>Days</th>
                                                    <th>Apply Date</th>
                                                    <th>Status</th>
                                                    <th className="text-right noExport">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {leaveRequests.map((value, index) => {
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
                                                            <td>
                                                                <span title={`Staff ID: ${value.employee_id}`}>
                                                                    {value.name} {value.surname}
                                                                </span>
                                                            </td>
                                                            <td>{value.type}</td>
                                                            <td>{value.leave_from} - {value.leave_to}</td>
                                                            <td>{value.leave_days}</td>
                                                            <td>{value.date}</td>
                                                            <td>
                                                                <span className={label} title={value.applied_by ? `Submitted By: ${value.applied_by}` : ''}>
                                                                    {statusText}
                                                                </span>
                                                            </td>
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
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
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
                                <div className="modal-body">
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
                                                        {type.type} {type.alloted_leave ? `(${type.alloted_leave})` : ''}
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
            {showDetailModal && selectedRecord && (
                <div className="modal fade in" style={{ display: 'block' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" onClick={() => setShowDetailModal(false)}>&times;</button>
                                <h4 className="modal-title">Details</h4>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-12 table-responsive">
                                        <table className="table mb0 table-striped table-bordered">
                                            <tbody>
                                                <tr>
                                                    <th width="15%">Name</th>
                                                    <td width="35%">{selectedRecord.name} {selectedRecord.surname}</td>
                                                    <th width="15%">Staff ID</th>
                                                    <td width="35%">{selectedRecord.employee_id}</td>
                                                </tr>
                                                <tr>
                                                    <th>Submitted By</th>
                                                    <td>{selectedRecord.applied_by}</td>
                                                    <th>Leave Type</th>
                                                    <td>{selectedRecord.type}</td>
                                                </tr>
                                                <tr>
                                                    <th>Leave</th>
                                                    <td>{selectedRecord.leavefrom} - {selectedRecord.leaveto} ({selectedRecord.leave_days} Days)</td>
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
                                                    <td colSpan="3">{selectedRecord.admin_remark}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Status Update Form (As indicated by JS in PHP) */}
                                <hr />
                                <form onSubmit={handleUpdateStatus}>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <label>Status</label><br />
                                            <label className="radio-inline">
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    value="pending"
                                                    checked={statusData.status === 'pending'}
                                                    onChange={(e) => setStatusData({ ...statusData, status: e.target.value })}
                                                /> Pending
                                            </label>
                                            <label className="radio-inline">
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    value="approve"
                                                    checked={statusData.status === 'approve' || statusData.status === 'approved'}
                                                    onChange={(e) => setStatusData({ ...statusData, status: e.target.value })}
                                                /> Approve
                                            </label>
                                            <label className="radio-inline">
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    value="disapprove"
                                                    checked={statusData.status === 'disapprove' || statusData.status === 'disapproved'}
                                                    onChange={(e) => setStatusData({ ...statusData, status: e.target.value })}
                                                /> Disapprove
                                            </label>
                                        </div>
                                        <div className="col-md-12" style={{ marginTop: '10px' }}>
                                            <label>Admin Note</label>
                                            <textarea
                                                className="form-control"
                                                rows="2"
                                                value={statusData.remark}
                                                onChange={(e) => setStatusData({ ...statusData, remark: e.target.value })}
                                            ></textarea>
                                        </div>
                                        <div className="col-md-12" style={{ marginTop: '15px' }}>
                                            <button type="submit" className="btn btn-primary pull-right">Save Status</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Backdrop */}
            {(showAddModal || showDetailModal) && (
                <div className="modal-backdrop fade in" onClick={() => { setShowAddModal(false); setShowDetailModal(false); }}></div>
            )}

            <Footer />
        </div>
    );
};

export default LeaveRequest;
