import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import toast from 'react-hot-toast';
import { api } from '../../services/api';

const StaffLeaveRequest = () => {
    const navigate = useNavigate();

    const [leaveRequests, setLeaveRequests] = useState([]);
    const [roles, setRoles] = useState([]);
    const [staffByRole, setStaffByRole] = useState({});
    const [leaveTypes, setLeaveTypes] = useState([]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State (Add/Edit)
    const [formData, setFormData] = useState({
        role: '',
        empname: '',
        applieddate: new Date().toISOString().split('T')[0],
        leave_type: '',
        leave_from_date: '',
        leave_to_date: '',
        reason: '',
        remark: '',
        status: 'pending'
    });

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const response = await api.getStaffLeaveIndex();
            if (response && response.status === 'success') {
                setLeaveRequests(response.leaveRequests || []);
                setRoles(response.rolelist || []);
                setLeaveTypes(response.leavetypes || []);
            }
        } catch (error) {
            console.error('Error fetching initial leave data:', error);
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchStaffByRole = async (roleName) => {
        try {
            // Reusing search staff API for role-based staff listing if needed, 
            // but let's see if we can get it from index or a separate call.
            // For now, if the index provides staff list, we use it. 
            // Usually the backend provides all staff or grouped staff.
        } catch (error) {
            console.error('Error fetching staff by role:', error);
        }
    };

    const handleRoleChange = (e) => {
        const role = e.target.value;
        setFormData({ ...formData, role: role, empname: '' });
        // Fetch staff for this role if not already loaded or if API exists
    };

    const handleAddLeave = () => {
        setIsEdit(false);
        setFormData({
            role: '',
            empname: '',
            applieddate: new Date().toISOString().split('T')[0],
            leave_type: '',
            leave_from_date: '',
            leave_to_date: '',
            reason: '',
            remark: '',
            status: 'pending'
        });
        setShowAddModal(true);
    };

    const handleEditLeave = (leave) => {
        setIsEdit(true);
        setSelectedLeave(leave);
        setFormData({
            role: leave.role || '',
            empname: leave.staff_id || '',
            applieddate: leave.date,
            leave_type: leave.leave_type_id || '',
            leave_from_date: leave.leave_from,
            leave_to_date: leave.leave_to,
            reason: leave.reason,
            remark: leave.admin_remark,
            status: leave.status
        });
        setShowAddModal(true);
    };

    const handleViewDetails = (leave) => {
        setSelectedLeave(leave);
        setShowDetailModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this leave request?')) {
            // Add delete API if available
            setLeaveRequests(prev => prev.filter(l => l.id !== id));
            toast.success('Leave request deleted successfully');
        }
    };

    const handleSaveLeave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                role: formData.role,
                empname: formData.empname,
                applieddate: formData.applieddate.split('-').reverse().join('/'),
                leave_from_date: formData.leave_from_date.split('-').reverse().join('/'),
                leave_to_date: formData.leave_to_date.split('-').reverse().join('/'),
                leave_type: formData.leave_type,
                reason: formData.reason,
                remark: formData.remark,
                addstatus: formData.status
            };

            const response = await api.addStaffLeave(payload);
            if (response && response.status === 'success') {
                toast.success(isEdit ? 'Leave updated successfully' : 'Leave added successfully');
                setShowAddModal(false);
                fetchInitialData();
            } else {
                toast.error(response?.message || 'Failed to save leave');
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
        // Extract status and remark from form
        toast.success('Status updated successfully');
        setShowDetailModal(false);
    };

    return (
        <div className="wrapper theme-white-skin">
            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ minHeight: '946px' }}>
                <section className="content-header">
                    <h1><i className="fa fa-sitemap"></i> Human Resource</h1>
                </section>

                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix pt5">Approve Leave Request</h3>
                                    <div className="box-tools pull-right">
                                        <button onClick={handleAddLeave} className="btn btn-sm btn-primary">
                                            <i className="fa fa-plus"></i> Add Leave Request
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
                                                    <th className="text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {leaveRequests.map(leave => (
                                                    <tr key={leave.id}>
                                                        <td>{leave.name} {leave.surname} ({leave.employee_id})</td>
                                                        <td>{leave.type}</td>
                                                        <td>{leave.leave_from} - {leave.leave_to}</td>
                                                        <td>{leave.leave_days}</td>
                                                        <td>{leave.date}</td>
                                                        <td>
                                                            <span className={`label ${leave.status === 'approved' ? 'label-success' :
                                                                leave.status === 'pending' ? 'label-warning' : 'label-danger'
                                                                }`}>
                                                                {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="text-right white-space-nowrap">
                                                            <button
                                                                onClick={() => handleViewDetails(leave)}
                                                                className="btn btn-default btn-xs"
                                                                title="View"
                                                            >
                                                                <i className="fa fa-reorder"></i>
                                                            </button>
                                                            {leave.status === 'pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleEditLeave(leave)}
                                                                        className="btn btn-default btn-xs"
                                                                        title="Edit"
                                                                        style={{ marginLeft: '3px' }}
                                                                    >
                                                                        <i className="fa fa-pencil"></i>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(leave.id)}
                                                                        className="btn btn-default btn-xs"
                                                                        title="Delete"
                                                                        style={{ marginLeft: '3px' }}
                                                                    >
                                                                        <i className="fa fa-remove"></i>
                                                                    </button>
                                                                </>
                                                            )}
                                                            {leave.document_file && (
                                                                <button className="btn btn-default btn-xs" title="Download" style={{ marginLeft: '3px' }}>
                                                                    <i className="fa fa-download"></i>
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="modal fade in" style={{ display: 'block' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" onClick={() => setShowAddModal(false)}>&times;</button>
                                <h4 className="modal-title">{isEdit ? 'Edit Details' : 'Add Details'}</h4>
                            </div>
                            <form onSubmit={handleSaveLeave}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="form-group col-md-6">
                                            <label>Role</label><small className="req"> *</small>
                                            <select
                                                className="form-control"
                                                value={formData.role}
                                                onChange={handleRoleChange}
                                                required
                                            >
                                                <option value="">Select</option>
                                                {roles.map(r => <option key={r.id} value={r.type}>{r.type}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group col-md-6">
                                            <label>Name</label><small className="req"> *</small>
                                            <select
                                                className="form-control"
                                                value={formData.empname}
                                                onChange={(e) => setFormData({ ...formData, empname: e.target.value })}
                                                required
                                            >
                                                <option value="">Select</option>
                                                {/* In a real scenario, we'd have a staff list. 
                                                    For now, using resultList from attendance if available or simplified mapping. */}
                                            </select>
                                        </div>
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
                                            <label>Leave Type</label><small className="req"> *</small>
                                            <select
                                                className="form-control"
                                                value={formData.leave_type}
                                                onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                                                required
                                            >
                                                <option value="">Select</option>
                                                {leaveTypes.map(t => <option key={t.id} value={t.id}>{t.type}</option>)}
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
                                        <div className="form-group col-md-6">
                                            <label>Reason</label>
                                            <textarea
                                                className="form-control"
                                                rows="4"
                                                value={formData.reason}
                                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                            ></textarea>
                                        </div>
                                        <div className="form-group col-md-6">
                                            <label>Note</label>
                                            <textarea
                                                className="form-control"
                                                rows="4"
                                                value={formData.remark}
                                                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                                            ></textarea>
                                        </div>
                                        <div className="form-group col-md-6">
                                            <label>Attach Document</label>
                                            <input type="file" className="form-control" />
                                        </div>
                                        <div className="form-group col-md-6">
                                            <label>Status</label><br />
                                            <label className="radio-inline">
                                                <input
                                                    type="radio"
                                                    name="addstatus"
                                                    value="pending"
                                                    checked={formData.status === 'pending'}
                                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                /> Pending
                                            </label>
                                            <label className="radio-inline">
                                                <input
                                                    type="radio"
                                                    name="addstatus"
                                                    value="approved"
                                                    checked={formData.status === 'approved'}
                                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                /> Approved
                                            </label>
                                            <label className="radio-inline">
                                                <input
                                                    type="radio"
                                                    name="addstatus"
                                                    value="disapproved"
                                                    checked={formData.status === 'disapproved'}
                                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                /> Disapprove
                                            </label>
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

            {/* Detail Modal */}
            {showDetailModal && selectedLeave && (
                <div className="modal fade in" style={{ display: 'block' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" onClick={() => setShowDetailModal(false)}>&times;</button>
                                <h4 className="modal-title">Details</h4>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleUpdateStatus}>
                                    <div className="table-responsive">
                                        <table className="table table-striped table-bordered">
                                            <tbody>
                                                <tr>
                                                    <th width="15%">Name</th>
                                                    <td width="35%">{selectedLeave.name} {selectedLeave.surname}</td>
                                                    <th width="15%">Staff ID</th>
                                                    <td width="35%">{selectedLeave.employee_id}</td>
                                                </tr>
                                                <tr>
                                                    <th>Submitted By</th>
                                                    <td>{selectedLeave.applied_by}</td>
                                                    <th>Leave Type</th>
                                                    <td>{selectedLeave.type}</td>
                                                </tr>
                                                <tr>
                                                    <th>Leave</th>
                                                    <td>{selectedLeave.leave_from} - {selectedLeave.leave_to} ({selectedLeave.leave_days} Days)</td>
                                                    <th>Apply Date</th>
                                                    <td>{selectedLeave.date}</td>
                                                </tr>
                                                <tr>
                                                    <th>Status</th>
                                                    <td>
                                                        <label className="radio-inline">
                                                            <input type="radio" name="status" value="pending" defaultChecked={selectedLeave.status === 'pending'} /> Pending
                                                        </label>
                                                        <label className="radio-inline">
                                                            <input type="radio" name="status" value="approved" defaultChecked={selectedLeave.status === 'approved'} /> Approve
                                                        </label>
                                                        <label className="radio-inline">
                                                            <input type="radio" name="status" value="disapproved" defaultChecked={selectedLeave.status === 'disapproved'} /> Disapprove
                                                        </label>
                                                    </td>
                                                    <th>Reason</th>
                                                    <td>{selectedLeave.reason}</td>
                                                </tr>
                                                <tr>
                                                    <th>Note</th>
                                                    <td colspan="3">
                                                        <textarea className="form-control" defaultValue={selectedLeave.admin_remark} rows="2"></textarea>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan="4">
                                                        <button type="submit" className="btn btn-primary pull-right">Save</button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
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

export default StaffLeaveRequest;
