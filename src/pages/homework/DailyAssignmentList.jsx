import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import '../../utils/include_files';

const DailyAssignmentList = () => {
    const navigate = useNavigate();

    // Search form state
    const [formData, setFormData] = useState({
        class_id: '',
        section_id: '',
        subject_group_id: '',
        subject_id: '',
        date: new Date().toISOString().split('T')[0]
    });

    // Dropdown options
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [subjectGroups, setSubjectGroups] = useState([]);
    const [subjects, setSubjects] = useState([]);

    // Table data
    const [assignmentList, setAssignmentList] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal states
    const [evaluationModalOpen, setEvaluationModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [reportModalOpen, setReportModalOpen] = useState(false);

    // Evaluation modal form data
    const [evaluationFormData, setEvaluationFormData] = useState({
        assigment_id: '',
        remark: '',
        evaluation_date: new Date().toISOString().split('T')[0]
    });

    // Assignment details data
    const [assignmentDetails, setAssignmentDetails] = useState(null);

    // Error/Success messages
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Mock data for classes
    useEffect(() => {
        setClasses([
            { id: 'Nursery', class: 'Nursery' },
            { id: 'LKG', class: 'LKG' },
            { id: 'UKG', class: 'UKG' },
            { id: '1', class: 'Class 1' },
            { id: '2', class: 'Class 2' },
            { id: '3', class: 'Class 3' },
            { id: '4', class: 'Class 4' },
            { id: '5', class: 'Class 5' },
            { id: '6', class: 'Class 6' },
            { id: '7', class: 'Class 7' },
            { id: '8', class: 'Class 8' },
            { id: '9', class: 'Class 9' },
            { id: '10', class: 'Class 10' },
            { id: '11', class: '11' },
        ]);
    }, []);

    // Handle search form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Cascading dropdown logic
        if (name === 'class_id') {
            setSections([]);
            setSubjectGroups([]);
            setSubjects([]);
            setFormData(prev => ({ ...prev, section_id: '', subject_group_id: '', subject_id: '' }));
            if (value) {
                // Mock sections based on class
                setSections([
                    { section_id: '1', section: 'A' },

                ]);
            }
        } else if (name === 'section_id') {
            setSubjectGroups([]);
            setSubjects([]);
            setFormData(prev => ({ ...prev, subject_group_id: '', subject_id: '' }));
            if (value && formData.class_id) {
                // Mock subject groups
                setSubjectGroups([
                    { subject_group_id: '1', name: 'Science Group' },
                    { subject_group_id: '2', name: 'Arts Group' },
                    { subject_group_id: '3', name: 'Commerce Group' }
                ]);
            }
        } else if (name === 'subject_group_id') {
            setSubjects([]);
            setFormData(prev => ({ ...prev, subject_id: '' }));
            if (value) {
                // Mock subjects
                setSubjects([
                    { id: '1', name: 'Mathematics', code: 'MATH' },
                    { id: '2', name: 'Science', code: 'SCI' },
                    { id: '3', name: 'English', code: 'ENG' },
                    { id: '4', name: 'Hindi', code: 'HIN' }
                ]);
            }
        }
    };

    // Handle search submit
    const handleSearch = (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.class_id) {
            setError('Please select a class');
            document.getElementById('error_class_id').textContent = 'The Class field is required';
            return;
        }
        if (!formData.section_id) {
            setError('Please select a section');
            document.getElementById('error_section_id').textContent = 'The Section field is required';
            return;
        }
        if (!formData.subject_group_id) {
            setError('Please select a subject group');
            document.getElementById('error_subject_group_id').textContent = 'The Subject Group field is required';
            return;
        }
        if (!formData.subject_id) {
            setError('Please select a subject');
            document.getElementById('error_subject_id').textContent = 'The Subject field is required';
            return;
        }
        if (!formData.date) {
            setError('Please select a date');
            document.getElementById('error_date').textContent = 'The Date field is required';
            return;
        }

        // Clear all error messages
        document.querySelectorAll('[id^=error_]').forEach(el => el.textContent = '');

        setLoading(true);

        // Mock assignment data
        setTimeout(() => {
            setAssignmentList([
                {
                    id: '1',
                    student_name: 'John Doe',
                    class: 'Class 1',
                    section: 'Section A',
                    subject: 'Mathematics',
                    title: 'Chapter 1 Assignment',
                    submission_date: '20/01/2026',
                    evaluation_date: '22/01/2026',
                    evaluated_by: 'Admin'
                },
                {
                    id: '2',
                    student_name: 'Jane Smith',
                    class: 'Class 1',
                    section: 'Section A',
                    subject: 'Mathematics',
                    title: 'Chapter 1 Assignment',
                    submission_date: '20/01/2026',
                    evaluation_date: '',
                    evaluated_by: ''
                },
                {
                    id: '3',
                    student_name: 'Bob Johnson',
                    class: 'Class 1',
                    section: 'Section A',
                    subject: 'Mathematics',
                    title: 'Chapter 1 Assignment',
                    submission_date: '19/01/2026',
                    evaluation_date: '21/01/2026',
                    evaluated_by: 'Teacher1'
                }
            ]);
            setLoading(false);
        }, 500);
    };

    // Open evaluation modal
    const openEvaluationModal = (assignmentId) => {
        setEvaluationFormData({
            assigment_id: assignmentId,
            remark: '',
            evaluation_date: new Date().toISOString().split('T')[0]
        });

        // Mock fetching existing evaluation data
        // In real app, would call API: homework/getdailyassignmentdetails
        const existingData = assignmentList.find(a => a.id === assignmentId);
        if (existingData && existingData.evaluation_date) {
            setEvaluationFormData({
                assigment_id: assignmentId,
                remark: 'Good work!',
                evaluation_date: '2026-01-22'
            });
        }

        setEvaluationModalOpen(true);
    };

    // Close evaluation modal
    const closeEvaluationModal = () => {
        setEvaluationModalOpen(false);
        setEvaluationFormData({
            assigment_id: '',
            remark: '',
            evaluation_date: new Date().toISOString().split('T')[0]
        });
    };

    // Handle evaluation form submit
    const handleEvaluationSubmit = (e) => {
        e.preventDefault();

        if (!evaluationFormData.evaluation_date) {
            setError('Evaluation date is required');
            return;
        }

        // Mock save
        setSuccess('Evaluation saved successfully');
        closeEvaluationModal();
        setTimeout(() => setSuccess(''), 3000);
    };

    // Handle evaluation form input change
    const handleEvaluationInputChange = (e) => {
        const { name, value } = e.target;
        setEvaluationFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Open assignment details modal
    const openDetailsModal = (assignmentId) => {
        // Mock fetching assignment details
        // In real app, would call API: homework/assignmentdetails
        setAssignmentDetails({
            id: assignmentId,
            student_name: 'John Doe',
            admission_no: 'STU001',
            class: 'Class 1',
            section: 'Section A',
            subject: 'Mathematics',
            title: 'Chapter 1 Assignment',
            description: 'Complete exercises 1-10 from Chapter 1',
            submission_date: '20/01/2026',
            file: 'assignment_john.pdf',
            status: 'Submitted'
        });
        setDetailsModalOpen(true);
    };

    // Close details modal
    const closeDetailsModal = () => {
        setDetailsModalOpen(false);
        setAssignmentDetails(null);
    };

    // Go back
    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="wrapper theme-white-skin">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '828px' }}>
                {/* Content Header */}
                <section className="content-header">
                    <h1>
                        <i className="fa fa-flask"></i> Daily Assignment
                    </h1>
                </section>

                {/* Main Content */}
                <section className="content">
                    <div className="box removeboxmius">
                        <div className="box-header ptbnull"></div>
                        <div className="box-header with-border">
                            <h3 className="box-title"><i className="fa fa-search"></i> Select Criteria</h3>
                            <div className="btn-group pull-right">
                                <button onClick={handleBack} className="btn btn-primary btn-xs">
                                    <i className="fa fa-arrow-left"></i> Back
                                </button>
                            </div>
                        </div>

                        <form className="search_daily_assignment_form" onSubmit={handleSearch}>
                            <div className="box-body">
                                <div className="row">
                                    <div className="col-md-12">
                                        {error && <div className="alert alert-danger">{error}</div>}
                                        {success && <div className="alert alert-success">{success}</div>}
                                    </div>
                                    <div className="col-md-2 col-lg-2 col-sm-6">
                                        <div className="form-group">
                                            <label>Class<small className="req"> *</small></label>
                                            <select
                                                autoFocus
                                                id="searchclassid"
                                                name="class_id"
                                                className="form-control"
                                                value={formData.class_id}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select</option>
                                                {classes.map(cls => (
                                                    <option key={cls.id} value={cls.id}>{cls.class}</option>
                                                ))}
                                            </select>
                                            <span className="text-danger" id="error_class_id"></span>
                                        </div>
                                    </div>
                                    <div className="col-md-2 col-lg-2 col-sm-6">
                                        <div className="form-group">
                                            <label>Section<small className="req"> *</small></label>
                                            <select
                                                id="secid"
                                                name="section_id"
                                                className="form-control"
                                                value={formData.section_id}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select</option>
                                                {sections.map(sec => (
                                                    <option key={sec.section_id} value={sec.section_id}>{sec.section}</option>
                                                ))}
                                            </select>
                                            <span className="text-danger" id="error_section_id"></span>
                                        </div>
                                    </div>
                                    <div className="col-md-3 col-lg-3 col-sm-6">
                                        <div className="form-group">
                                            <label>Subject Group<small className="req"> *</small></label>
                                            <select
                                                id="subject_group_id"
                                                name="subject_group_id"
                                                className="form-control"
                                                value={formData.subject_group_id}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select</option>
                                                {subjectGroups.map(sg => (
                                                    <option key={sg.subject_group_id} value={sg.subject_group_id}>{sg.name}</option>
                                                ))}
                                            </select>
                                            <span className="text-danger" id="error_subject_group_id"></span>
                                        </div>
                                    </div>
                                    <div className="col-md-3 col-lg-3 col-sm-6">
                                        <div className="form-group">
                                            <label>Subject<small className="req"> *</small></label>
                                            <select
                                                id="subid"
                                                name="subject_id"
                                                className="form-control"
                                                value={formData.subject_id}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select</option>
                                                {subjects.map(sub => (
                                                    <option key={sub.id} value={sub.id}>
                                                        {sub.name} {sub.code && `(${sub.code})`}
                                                    </option>
                                                ))}
                                            </select>
                                            <span className="text-danger" id="error_subject_id"></span>
                                        </div>
                                    </div>
                                    <div className="col-md-2 col-lg-2 col-sm-4">
                                        <div className="form-group">
                                            <label>Date<small className="req"> *</small></label>
                                            <input
                                                type="date"
                                                name="date"
                                                className="form-control"
                                                value={formData.date}
                                                onChange={handleInputChange}
                                            />
                                            <span className="text-danger" id="error_date"></span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    id="search_filter"
                                    name="search"
                                    value="search_filter"
                                    className="btn btn-primary btn-sm checkbox-toggle pull-right"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <><i className="fa fa-spinner fa-spin"></i> Searching...</>
                                    ) : (
                                        <><i className="fa fa-search"></i> Search</>
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="col-md-12" id="errorinfo"></div>

                        {/* Daily Assignment List */}
                        <div id="box_display">
                            <div className="box-header ptbnull"></div>
                            <div className="box-header with-border">
                                <h3 className="box-title"><i className="fa fa-users"></i> Daily Assignment List</h3>
                            </div>
                            <div className="box-body table-responsive">
                                <table className="table table-striped table-bordered table-hover dailyassignmentlist">
                                    <thead>
                                        <tr>
                                            <th>Student Name</th>
                                            <th>Class</th>
                                            <th>Section</th>
                                            <th>Subject</th>
                                            <th>Title</th>
                                            <th>Submission Date</th>
                                            <th>Evaluation Date</th>
                                            <th>Evaluated By</th>
                                            <th className="noExport">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assignmentList.length === 0 ? (
                                            <tr>
                                                <td colSpan="9" className="text-center">
                                                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                                                        <div style={{ color: 'red', fontFamily: 'Roboto-Bold', fontSize: '10px' }}>No data available in table</div>
                                                        <img src="/images/addnewitem.svg" alt="No Data" style={{ marginBottom: 0, width: '150px' }} />
                                                        <div style={{ color: 'green', fontFamily: 'Roboto-Bold', fontSize: '10px' }}>&lt;- Search with different criteria</div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            assignmentList.map(assignment => (
                                                <tr key={assignment.id}>
                                                    <td>{assignment.student_name}</td>
                                                    <td>{assignment.class}</td>
                                                    <td>{assignment.section}</td>
                                                    <td>{assignment.subject}</td>
                                                    <td>{assignment.title}</td>
                                                    <td>{assignment.submission_date}</td>
                                                    <td>{assignment.evaluation_date || '-'}</td>
                                                    <td>{assignment.evaluated_by || '-'}</td>
                                                    <td className="text-right">
                                                        <button
                                                            className="btn btn-default btn-xs"
                                                            title="View Details"
                                                            onClick={() => openDetailsModal(assignment.id)}
                                                        >
                                                            <i className="fa fa-eye"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-default btn-xs"
                                                            title="Evaluate"
                                                            data-toggle="modal"
                                                            data-target="#assignmentevaluation"
                                                            onClick={() => openEvaluationModal(assignment.id)}
                                                        >
                                                            <i className="fa fa-check-square-o"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Evaluation Modal */}
            {evaluationModalOpen && (
                <div className="modal fade in" id="assignmentevaluation" style={{ display: 'block' }}>
                    <div className="modal-dialog modal-lg" role="document">
                        <form id="evaluation_data" onSubmit={handleEvaluationSubmit}>
                            <div className="modal-content modal-media-content">
                                <div className="modal-header modal-media-header">
                                    <button type="button" className="close" onClick={closeEvaluationModal}>×</button>
                                    <h4 className="box-title">Daily Assignment Evaluation</h4>
                                </div>
                                <div className="modal-body ptt10 pb0">
                                    <div className="form-group">
                                        <label>Remark</label>
                                        <textarea
                                            name="remark"
                                            id="remark"
                                            rows="5"
                                            className="form-control"
                                            value={evaluationFormData.remark}
                                            onChange={handleEvaluationInputChange}
                                        ></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label>Evaluation Date<small className="req"> *</small></label>
                                        <input
                                            type="date"
                                            name="evaluation_date"
                                            id="evaluation_date"
                                            className="form-control"
                                            value={evaluationFormData.evaluation_date}
                                            onChange={handleEvaluationInputChange}
                                        />
                                        <input
                                            type="hidden"
                                            name="assigment_id"
                                            id="assigment_id"
                                            value={evaluationFormData.assigment_id}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="submit" className="btn btn-info pull-right" id="submit">
                                        Save
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div className="modal-backdrop fade in"></div>
                </div>
            )}

            {/* Report Modal */}
            {reportModalOpen && (
                <div className="modal fade in" id="report" style={{ display: 'block' }}>
                    <div className="modal-dialog modal-lg" role="document">
                        <div className="modal-content modal-media-content">
                            <div className="modal-header modal-media-header">
                                <button type="button" className="close" onClick={() => setReportModalOpen(false)}>×</button>
                                <h4 className="box-title" id="modal_head">Report</h4>
                            </div>
                            <div className="modal-body pt0 pb0">
                                {/* Report content */}
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade in"></div>
                </div>
            )}

            {/* Assignment Details Modal */}
            {detailsModalOpen && (
                <div className="modal fade in" id="assignmentdetails" style={{ display: 'block' }}>
                    <div className="modal-dialog modal-lg" role="document">
                        <div className="modal-content modal-media-content">
                            <div className="modal-header modal-media-header">
                                <button type="button" className="close" onClick={closeDetailsModal}>×</button>
                                <h4 className="box-title">Assignment Detail</h4>
                            </div>
                            <div className="modal-body pt0 pb0 pr0 pl-sm-0">
                                <div className="scroll-area-inside">
                                    <div id="assigndata">
                                        {assignmentDetails && (
                                            <div className="row">
                                                <div className="col-md-12">
                                                    <table className="table table-bordered">
                                                        <tbody>
                                                            <tr>
                                                                <th style={{ width: '30%' }}>Student Name</th>
                                                                <td>{assignmentDetails.student_name}</td>
                                                            </tr>
                                                            <tr>
                                                                <th>Admission No</th>
                                                                <td>{assignmentDetails.admission_no}</td>
                                                            </tr>
                                                            <tr>
                                                                <th>Class</th>
                                                                <td>{assignmentDetails.class}</td>
                                                            </tr>
                                                            <tr>
                                                                <th>Section</th>
                                                                <td>{assignmentDetails.section}</td>
                                                            </tr>
                                                            <tr>
                                                                <th>Subject</th>
                                                                <td>{assignmentDetails.subject}</td>
                                                            </tr>
                                                            <tr>
                                                                <th>Title</th>
                                                                <td>{assignmentDetails.title}</td>
                                                            </tr>
                                                            <tr>
                                                                <th>Description</th>
                                                                <td>{assignmentDetails.description}</td>
                                                            </tr>
                                                            <tr>
                                                                <th>Submission Date</th>
                                                                <td>{assignmentDetails.submission_date}</td>
                                                            </tr>
                                                            <tr>
                                                                <th>Status</th>
                                                                <td>
                                                                    <span className={`label ${assignmentDetails.status === 'Submitted' ? 'label-success' : 'label-warning'}`}>
                                                                        {assignmentDetails.status}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                            {assignmentDetails.file && (
                                                                <tr>
                                                                    <th>Attachment</th>
                                                                    <td>
                                                                        <a href="#" className="btn btn-default btn-xs">
                                                                            <i className="fa fa-download"></i> {assignmentDetails.file}
                                                                        </a>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade in"></div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default DailyAssignmentList;
