
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';

import FollowUpModal from '../../components/FollowUpModal';

import { api } from '../../services/api';
import toast from 'react-hot-toast';

const OnlineStudentList = () => {
    // State
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [showFollowUpModal, setShowFollowUpModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const [printModalOpen, setPrintModalOpen] = useState(false);
    const [reviewData, setReviewData] = useState(null);
    const [printLoading, setPrintLoading] = useState(false);

    // Mock settings (replace with actual context/API later)
    const sch_setting = {
        father_name: 1,
        mobile_no: 1,
        online_admission_payment: 'yes'
    };

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await api.getOnlineStudentList();
                if (response && response.data) {
                    const formattedStudents = response.data.map(student => ({
                        id: student.id,
                        ref_no: student.reference_no,
                        name: student.name,
                        class_name: `${student.class} (${student.section})`,
                        father_name: student.father_name,
                        dob: student.dob,
                        gender: student.gender,
                        category: student.category,
                        mobile: student.mobile,
                        form_status: student.form_status,
                        payment_status: student.payment_status,
                        enrolled: student.is_enrolled ? 'Yes' : 'No',
                        created_at: student.created_at,
                    }));
                    setStudents(formattedStudents);
                } else {
                    // Fallback if data is not in expected format
                    console.error("Invalid response format", response);
                }
            } catch (error) {
                console.error("Error fetching online student list", error);
            } finally {
                setInitialLoading(false);
            }
        };

        fetchStudents();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                const response = await api.deleteOnlineStudent(id);
                if (response && response.status) {
                    toast.success(response.message || 'Record deleted successfully');
                    setStudents(prev => prev.filter(student => student.id !== id));
                } else {
                    toast.error('Failed to delete record');
                }
            } catch (error) {
                console.error("Error deleting record", error);
                toast.error('An error occurred while deleting');
            }
        }
    };

    const handlePrint = async (refNo) => {
        setPrintLoading(true);
        try {
            const response = await api.getOnlineAdmissionReview(refNo);
            if (response && response.status) {
                setReviewData(response);
                setPrintModalOpen(true);
            } else {
                toast.error('Failed to fetch admission review');
            }
        } catch (error) {
            console.error("Error fetching admission review", error);
            toast.error('An error occurred while fetching details');
        } finally {
            setPrintLoading(false);
        }
    };

    const handleOpenFollowUp = (student) => {
        setSelectedStudent(student);
        setShowFollowUpModal(true);
    };

    const handleCloseFollowUp = () => {
        setShowFollowUpModal(false);
        setSelectedStudent(null);
    };

    // Sorting Logic
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedStudents = React.useMemo(() => {
        let sortableStudents = [...students];
        if (sortConfig.key) {
            sortableStudents.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableStudents;
    }, [students, sortConfig]);

    // Filtering Logic
    const filteredStudents = sortedStudents.filter(student =>
        Object.values(student).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const getSortIcon = (columnName) => {
        if (sortConfig.key !== columnName) {
            return <i className="fa fa-sort pull-right" style={{ color: '#ccc', opacity: 0.5 }}></i>;
        }
        return sortConfig.direction === 'ascending' ?
            <i className="fa fa-sort-asc pull-right"></i> :
            <i className="fa fa-sort-desc pull-right"></i>;
    };

    return (
        <div className="wrapper theme-white-skin">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '828px' }}>
                <section className="content">
                    {initialLoading ? (
                        <Loader />
                    ) : (
                        <div className="row">
                            <div className="col-md-12">
                                <div className="box box-primary">
                                    <div className="box-header with-border">
                                        <h3 className="box-title">Student List</h3>
                                        <div className="box-tools pull-right"></div>
                                        <div className="btn-group pull-right">
                                            <button onClick={() => window.history.back()} className="btn btn-primary btn-sm">
                                                <i className="fa fa-arrow-left"></i> Back
                                            </button>
                                        </div>
                                    </div>
                                    <div className="box-body">
                                        <div className="table-responsive mailbox-messages overflow-visible">

                                            {/* DataTables Search Simulation */}
                                            <div className="row mb-10">
                                                <div className="row mb-10">
                                                    <div className="col-sm-12">
                                                        <div className="pull-left">
                                                            <label>Search:
                                                                <input
                                                                    type="search"
                                                                    className="form-control input-sm"
                                                                    placeholder=""
                                                                    aria-controls="student-list"
                                                                    value={searchTerm}
                                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                                    style={{ marginLeft: '10px', display: 'inline-block', width: 'auto' }}
                                                                />
                                                            </label>
                                                        </div>
                                                        <div className="dt-buttons btn-group pull-right">
                                                            <button className="btn btn-default btn-xs" title="Copy">
                                                                <i className="fa fa-files-o"></i>
                                                            </button>
                                                            <button className="btn btn-default btn-xs" title="Excel">
                                                                <i className="fa fa-file-excel-o"></i>
                                                            </button>
                                                            <button className="btn btn-default btn-xs" title="CSV">
                                                                <i className="fa fa-file-text-o"></i>
                                                            </button>
                                                            <button className="btn btn-default btn-xs" title="PDF">
                                                                <i className="fa fa-file-pdf-o"></i>
                                                            </button>
                                                            <button className="btn btn-default btn-xs" title="Print">
                                                                <i className="fa fa-print"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <table className="table table-striped table-bordered table-hover student-list">
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: '5%', cursor: 'pointer' }} onClick={() => handleSort('ref_no')}>
                                                            Reference No {getSortIcon('ref_no')}
                                                        </th>
                                                        <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                                                            Student Name {getSortIcon('name')}
                                                        </th>
                                                        <th className="white-space-nowrap" style={{ cursor: 'pointer' }} onClick={() => handleSort('class_name')}>
                                                            Class {getSortIcon('class_name')}
                                                        </th>
                                                        {sch_setting.father_name && (
                                                            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('father_name')}>
                                                                Father Name {getSortIcon('father_name')}
                                                            </th>
                                                        )}
                                                        <th style={{ cursor: 'pointer' }} onClick={() => handleSort('dob')}>
                                                            Date Of Birth {getSortIcon('dob')}
                                                        </th>
                                                        <th style={{ cursor: 'pointer' }} onClick={() => handleSort('gender')}>
                                                            Gender {getSortIcon('gender')}
                                                        </th>
                                                        <th style={{ cursor: 'pointer' }} onClick={() => handleSort('category')}>
                                                            Category {getSortIcon('category')}
                                                        </th>
                                                        {sch_setting.mobile_no && (
                                                            <th style={{ width: '10%', cursor: 'pointer' }} onClick={() => handleSort('mobile')}>
                                                                Student Mobile Number {getSortIcon('mobile')}
                                                            </th>
                                                        )}
                                                        <th style={{ cursor: 'pointer' }} onClick={() => handleSort('form_status')}>
                                                            Form Status {getSortIcon('form_status')}
                                                        </th>

                                                        <th style={{ cursor: 'pointer' }} onClick={() => handleSort('enrolled')}>
                                                            Enrolled {getSortIcon('enrolled')}
                                                        </th>
                                                        <th style={{ cursor: 'pointer' }} onClick={() => handleSort('created_at')}>
                                                            Created At {getSortIcon('created_at')}
                                                        </th>
                                                        <th className="text-right noExport">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredStudents.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="13" className="dataTables_empty text-center">No data available in table</td>
                                                        </tr>
                                                    ) : (
                                                        filteredStudents.map(student => (
                                                            <tr key={student.id}>
                                                                <td>{student.ref_no}</td>
                                                                <td>{student.name}</td>
                                                                <td className="white-space-nowrap">{student.class_name}</td>
                                                                {sch_setting.father_name && <td>{student.father_name}</td>}
                                                                <td>{student.dob}</td>
                                                                <td>{student.gender}</td>
                                                                <td>{student.category}</td>
                                                                {sch_setting.mobile_no && <td>{student.mobile}</td>}
                                                                <td>
                                                                    <span className={`label ${student.form_status === 'submitted' ? 'label-success' : 'label-danger'}`}>
                                                                        {student.form_status ? student.form_status.replace(/_/g, ' ') : ''}
                                                                    </span>
                                                                </td>

                                                                <td>
                                                                    <i className={`fa ${student.enrolled === 'Yes' ? 'fa-check' : 'fa-times'}`} style={{ color: student.enrolled === 'Yes' ? 'green' : 'red' }}></i>
                                                                </td>
                                                                <td>{student.created_at}</td>
                                                                <td className="text-right white-space-nowrap">
                                                                    <button className="btn btn-default btn-xs" data-toggle="tooltip" title="Print" style={{ marginRight: '3px' }} onClick={() => handlePrint(student.ref_no)} disabled={printLoading}>
                                                                        <i className="fa fa-print"></i>
                                                                    </button>
                                                                    <a href="#" className="btn btn-default btn-xs" data-toggle="tooltip" title="Delete" onClick={(e) => { e.preventDefault(); handleDelete(student.id); }}>
                                                                        <i className="fa fa-remove"></i>
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>

                                            <div className="row">
                                                <div className="col-sm-5">
                                                    <div className="dataTables_info" role="status" aria-live="polite">
                                                        Records {filteredStudents.length > 0 ? 1 : 0} to {filteredStudents.length} of {filteredStudents.length} entries
                                                    </div>
                                                </div>
                                                <div className="col-sm-7">
                                                    {/* Pagination controls can go here if pagination is implemented */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* Print/Admission Review Modal */}
                {printModalOpen && reviewData && (
                    <div className="modal show" style={{ display: 'block', paddingRight: '15px' }}>
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <button type="button" className="close" onClick={() => setPrintModalOpen(false)}>&times;</button>
                                    <h4 className="modal-title">Online Admission Review</h4>
                                </div>
                                <div className="modal-body" id="print-content">
                                    <div className="text-center mb-3">
                                        <h4><strong>{reviewData.student?.firstname} {reviewData.student?.middlename || ''} {reviewData.student?.lastname || ''}</strong></h4>
                                        <p>Reference No: <strong>{reviewData.reference_no}</strong></p>
                                    </div>

                                    <table className="table table-bordered">
                                        <tbody>
                                            <tr>
                                                <td><strong>Class</strong></td>
                                                <td>{reviewData.class?.class_name || '-'}</td>
                                                <td><strong>Gender</strong></td>
                                                <td>{reviewData.student?.gender || '-'}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Date of Birth</strong></td>
                                                <td>{reviewData.student?.dob || '-'}</td>
                                                <td><strong>Blood Group</strong></td>
                                                <td>{reviewData.student?.blood_group || '-'}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Mobile</strong></td>
                                                <td>{reviewData.contact?.mobile || '-'}</td>
                                                <td><strong>Email</strong></td>
                                                <td>{reviewData.contact?.email || '-'}</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <h5 className="mt-3"><strong>Guardian Details</strong></h5>
                                    <table className="table table-bordered">
                                        <tbody>
                                            <tr>
                                                <td><strong>Name</strong></td>
                                                <td>{reviewData.guardian?.name || '-'}</td>
                                                <td><strong>Relation</strong></td>
                                                <td>{reviewData.guardian?.relation || '-'}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Phone</strong></td>
                                                <td>{reviewData.guardian?.phone || '-'}</td>
                                                <td><strong>Email</strong></td>
                                                <td>{reviewData.guardian?.email || '-'}</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <h5 className="mt-3"><strong>Father Details</strong></h5>
                                    <table className="table table-bordered">
                                        <tbody>
                                            <tr>
                                                <td><strong>Name</strong></td>
                                                <td>{reviewData.father?.name || '-'}</td>
                                                <td><strong>Phone</strong></td>
                                                <td>{reviewData.father?.phone || '-'}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Occupation</strong></td>
                                                <td colSpan="3">{reviewData.father?.occupation || '-'}</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <h5 className="mt-3"><strong>Mother Details</strong></h5>
                                    <table className="table table-bordered">
                                        <tbody>
                                            <tr>
                                                <td><strong>Name</strong></td>
                                                <td>{reviewData.mother?.name || '-'}</td>
                                                <td><strong>Phone</strong></td>
                                                <td>{reviewData.mother?.phone || '-'}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Occupation</strong></td>
                                                <td colSpan="3">{reviewData.mother?.occupation || '-'}</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <h5 className="mt-3"><strong>Transaction Details</strong></h5>
                                    <table className="table table-bordered">
                                        <tbody>
                                            <tr>
                                                <td><strong>Transaction ID</strong></td>
                                                <td>{reviewData.transaction?.transaction_id || '-'}</td>
                                                <td><strong>Paid Amount</strong></td>
                                                <td>{reviewData.transaction?.paid_amount || '0'}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Form Status</strong></td>
                                                <td><span className={`label ${reviewData.form_status === '1' ? 'label-success' : 'label-danger'}`}>{reviewData.form_status === '1' ? 'Submitted' : 'Not Submitted'}</span></td>
                                                <td><strong>Payment Status</strong></td>
                                                <td><span className={`label ${reviewData.paid_status === '1' ? 'label-success' : 'label-warning'}`}>{reviewData.paid_status === '1' ? 'Paid' : 'Unpaid'}</span></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-primary" onClick={() => window.print()}>
                                        <i className="fa fa-print"></i> Print
                                    </button>
                                    <button type="button" className="btn btn-default" onClick={() => setPrintModalOpen(false)}>Close</button>
                                </div>
                            </div>
                        </div>
                        <div className="modal-backdrop fade in" style={{ zIndex: -1 }} onClick={() => setPrintModalOpen(false)}></div>
                    </div>
                )}

                <FollowUpModal
                    isOpen={showFollowUpModal}
                    onClose={handleCloseFollowUp}
                    studentId={selectedStudent?.id}
                    studentName={selectedStudent?.name}
                />
            </div>
        </div>
    );
};

export default OnlineStudentList;
