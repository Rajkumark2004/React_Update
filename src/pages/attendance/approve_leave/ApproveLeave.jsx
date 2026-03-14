import React, { useState, useEffect } from 'react';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import Loader from '../../../components/Loader';
import api from '../../../services/api';
import LeaveModal from './LeaveModal';
import '../../../utils/include_files'; // Importing global scripts/styles

const API_BASE = 'https://newlayout.wisibles.com/api_admin';

const ApproveLeave = () => {
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [leaveList, setLeaveList] = useState([]);
    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [filter, setFilter] = useState({ class_id: '', section_id: '', search: '' });

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [selectedLeave, setSelectedLeave] = useState(null);

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
        setLoading(true);
        try {
            const response = await api.searchApproveLeave(filter);
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

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />

            <div className="content-wrapper">
                <section className="content-header">
                    <h1><i className="fa fa-flask"></i> Approve Leave</h1>
                </section>

                <section className="content">
                    {initialLoading ? (
                        <Loader />
                    ) : (
                        <div className="row">
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
                                                            onChange={handleClassChange}
                                                            autoFocus
                                                        >
                                                            <option value="">Select</option>
                                                            {classList.map(cls => (
                                                                <option key={cls.id} value={cls.id}>{cls.class}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-md-3 col-lg-3 col-sm-6">
                                                    <div className="form-group">
                                                        <label>Section</label><small className="req"> *</small>
                                                        <select
                                                            className="form-control"
                                                            value={filter.section_id}
                                                            onChange={(e) => setFilter(prev => ({ ...prev, section_id: e.target.value }))}
                                                        >
                                                            <option value="">Select</option>
                                                            {sectionList.map(sec => (
                                                                <option key={sec.section_id || sec.id} value={sec.section_id}>{sec.section}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-md-3 col-lg-3 col-sm-6">
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
                                                </div>
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
                                            <div className="box-body table-responsive overflow-visible-lg">
                                                <table className="table table-hover table-striped table-bordered example">
                                                    <thead>
                                                        <tr>
                                                            <th>Student Name</th>
                                                            <th>Class</th>
                                                            <th>Section</th>
                                                            <th>Apply Date</th>
                                                            <th>From Date</th>
                                                            <th>To Date</th>
                                                            <th>Status</th>
                                                            <th>Approve/Disapprove By</th>
                                                            <th className="text-right noExport">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {loading ? (
                                                            <tr><td colSpan="9" className="text-center">Loading...</td></tr>
                                                        ) : leaveList.length > 0 ? (
                                                            leaveList.map(leave => (
                                                                <tr key={leave.id}>
                                                                    <td>{leave.firstname} {leave.lastname} ({leave.admission_no})</td>
                                                                    <td>{leave.class}</td>
                                                                    <td>{leave.section}</td>
                                                                    <td>{formatDate(leave.apply_date)}</td>
                                                                    <td>{formatDate(leave.from_date)}</td>
                                                                    <td>{formatDate(leave.to_date)}</td>
                                                                    <td>{getStatusLabel(leave.status, leave.approve_date)}</td>
                                                                    <td>{leave.staff_name} {leave.surname} {leave.staff_id ? `(${leave.staff_id})` : ''}</td>
                                                                    <td className="text-right white-space-nowrap">
                                                                        {leave.docs && (
                                                                            <a href={`${API_BASE}/admin/approve_leave/download/${leave.id}`} className="btn btn-default btn-xs" title="Download" target="_blank" rel="noopener noreferrer">
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
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            <Footer />

            <LeaveModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                onSuccess={() => { fetchLeaveData(); }}
                initialData={selectedLeave}
                isEdit={modalMode === 'edit'}
                classList={classList}
            />
        </div>
    );
};

export default ApproveLeave;
