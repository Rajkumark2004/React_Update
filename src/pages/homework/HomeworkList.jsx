import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { Editor, EditorProvider } from 'react-simple-wysiwyg';
import { api } from '../../services/api';
import '../../utils/include_files';

const HomeworkList = () => {
    // Search form state
    const [formData, setFormData] = useState({
        class_id: '',
        section_id: '',
        subject_group_id: '',
        subject_id: ''
    });

    // Dropdown options
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [subjectGroups, setSubjectGroups] = useState([]);
    const [subjects, setSubjects] = useState([]);

    // Table data
    const [homeworkList, setHomeworkList] = useState([]);
    const [closedHomeworkList, setClosedHomeworkList] = useState([]);
    const [loading, setLoading] = useState(false);

    // Tab state
    const [activeTab, setActiveTab] = useState('upcoming');

    // Modal states
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [evaluationModalOpen, setEvaluationModalOpen] = useState(false);
    const [docsModalOpen, setDocsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [editRecordId, setEditRecordId] = useState(null);

    // Modal form data
    const [modalFormData, setModalFormData] = useState({
        modal_class_id: '',
        modal_section_id: '',
        modal_subject_group_id: '',
        modal_subject_id: '',
        homework_date: new Date().toISOString().split('T')[0],
        submit_date: new Date().toISOString().split('T')[0],
        homework_marks: '',
        description: '',
        file: null
    });

    // Modal dropdown options
    const [modalSections, setModalSections] = useState([]);
    const [modalSubjectGroups, setModalSubjectGroups] = useState([]);
    const [modalSubjects, setModalSubjects] = useState([]);

    // Evaluation modal state
    const [evaluationData, setEvaluationData] = useState(null);
    const [evaluationHomeworkId, setEvaluationHomeworkId] = useState(null);

    // Homework docs modal state
    const [homeworkDocs, setHomeworkDocs] = useState([]);

    // Bulk delete
    const [selectedHomework, setSelectedHomework] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    // Error/Success messages
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch initial data
    useEffect(() => {
        fetchHomeworkList();

        // Mock classes data
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

    // Fetch Homework List from API
    const fetchHomeworkList = async () => {
        setLoading(true);
        try {
            const response = await api.getStudentDiaryList();
            if (response.status && response.data) {
                // Map API data to component structure
                // API fields: id, class, section, date, assigned_by
                const mappedData = response.data.map(item => ({
                    id: item.id,
                    class: item.class,
                    section: item.section,
                    subject_group: item.subject_group || '-', // Handle missing field
                    subject: item.subject || '-',           // Handle missing field
                    homework_date: item.date,
                    submission_date: item.submission_date || '-', // Handle missing field
                    evaluation_date: item.evaluation_date || '-',
                    created_by: item.assigned_by
                }));
                setHomeworkList(mappedData);
            }
        } catch (err) {
            console.error('Error fetching homework list:', err);
            // Fallback to empty list or handle error
        } finally {
            setLoading(false);
        }
    };


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
                    // { subject_group_id: '1', name: 'Science Group' },
                    // { subject_group_id: '2', name: 'Arts Group' },
                    // { subject_group_id: '3', name: 'Commerce Group' }
                ]);
            }
        } else if (name === 'subject_group_id') {
            setSubjects([]);
            setFormData(prev => ({ ...prev, subject_id: '' }));
            if (value) {
                // Mock subjects
                setSubjects([
                    // { id: '1', name: 'Mathematics', code: 'MATH' },
                    // { id: '2', name: 'Science', code: 'SCI' },
                    // { id: '3', name: 'English', code: 'ENG' },
                    // { id: '4', name: 'Hindi', code: 'HIN' }
                ]);
            }
        }
    };

    // Handle modal form input change
    const handleModalInputChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file') {
            setModalFormData(prev => ({ ...prev, file: files[0] }));
            return;
        }

        setModalFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Cascading dropdown logic for modal
        if (name === 'modal_class_id') {
            setModalSections([]);
            setModalSubjectGroups([]);
            setModalSubjects([]);
            setModalFormData(prev => ({
                ...prev,
                modal_section_id: '',
                modal_subject_group_id: '',
                modal_subject_id: ''
            }));
            if (value) {
                setModalSections([
                    { section_id: '1', section: 'A' },

                ]);
            }
        } else if (name === 'modal_section_id') {
            setModalSubjectGroups([]);
            setModalSubjects([]);
            setModalFormData(prev => ({ ...prev, modal_subject_group_id: '', modal_subject_id: '' }));
            if (value && modalFormData.modal_class_id) {
                setModalSubjectGroups([
                    { subject_group_id: '1', name: 'Science Group' },
                    { subject_group_id: '2', name: 'Arts Group' },
                    { subject_group_id: '3', name: 'Commerce Group' }
                ]);
            }
        } else if (name === 'modal_subject_group_id') {
            setModalSubjects([]);
            setModalFormData(prev => ({ ...prev, modal_subject_id: '' }));
            if (value) {
                setModalSubjects([
                    { id: '1', name: 'Mathematics', code: 'MATH' },
                    { id: '2', name: 'Science', code: 'SCI' },
                    { id: '3', name: 'English', code: 'ENG' },
                    { id: '4', name: 'Hindi', code: 'HIN' }
                ]);
            }
        }
    };

    // Handle description change (WYSIWYG)
    const handleDescriptionChange = (e) => {
        setModalFormData(prev => ({ ...prev, description: e.target.value }));
    };

    // Handle search submit
    const handleSearch = (e) => {
        e.preventDefault();
        setError('');

        if (!formData.class_id) {
            setError('Please select a class');
            return;
        }

        // Reload data from API (or implement filtering here if API supported params)
        fetchHomeworkList();
    };

    // Open add modal
    const openAddModal = () => {
        setModalMode('add');
        setEditRecordId(null);
        setModalFormData({
            modal_class_id: '',
            modal_section_id: '',
            modal_subject_group_id: '',
            modal_subject_id: '',
            homework_date: new Date().toISOString().split('T')[0],
            submit_date: new Date().toISOString().split('T')[0],
            homework_marks: '',
            description: '',
            file: null
        });
        setModalSections([]);
        setModalSubjectGroups([]);
        setModalSubjects([]);
        setAddModalOpen(true);
    };

    // Open edit modal
    const openEditModal = (record) => {
        setModalMode('edit');
        setEditRecordId(record.id);
        // In real app, would fetch record data here
        setModalFormData({
            modal_class_id: '1',
            modal_section_id: '1',
            modal_subject_group_id: '1',
            modal_subject_id: '1',
            homework_date: '2026-01-20',
            submit_date: '2026-01-25',
            homework_marks: '100',
            description: '<p>Sample homework description</p>',
            file: null
        });
        setModalSections([
            { section_id: '1', section: 'Section A' },
            { section_id: '2', section: 'Section B' }
        ]);
        setModalSubjectGroups([
            { subject_group_id: '1', name: 'Science Group' },
            { subject_group_id: '2', name: 'Arts Group' }
        ]);
        setModalSubjects([
            { id: '1', name: 'Mathematics', code: 'MATH' },
            { id: '2', name: 'Science', code: 'SCI' }
        ]);
        setAddModalOpen(true);
    };

    // Close add modal
    const closeAddModal = () => {
        setAddModalOpen(false);
        setModalMode('add');
        setEditRecordId(null);
    };

    // Handle modal form submit
    // Handle modal form submit
    const handleModalSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!modalFormData.modal_class_id || !modalFormData.modal_section_id ||
            !modalFormData.modal_subject_group_id || !modalFormData.modal_subject_id ||
            !modalFormData.homework_date || !modalFormData.submit_date || !modalFormData.description) {
            setError('Please fill all required fields');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const formData = new FormData();
            formData.append('class_id', modalFormData.modal_class_id);
            formData.append('section_id', modalFormData.modal_section_id);
            formData.append('subject_group_id', modalFormData.modal_subject_group_id);
            formData.append('subject_id', modalFormData.modal_subject_id);

            // Format date to dd-mm-yyyy
            const formatDate = (dateString) => {
                if (!dateString) return '';
                const [year, month, day] = dateString.split('-');
                return `${day}-${month}-${year}`;
            };

            formData.append('date', formatDate(modalFormData.homework_date));
            formData.append('submit_date', formatDate(modalFormData.submit_date));
            formData.append('description', modalFormData.description);
            formData.append('assigned_by', 'Super Admin(9000)'); // static for now as per request

            if (modalFormData.homework_marks) {
                formData.append('marks', modalFormData.homework_marks);
            }

            if (modalFormData.file) {
                formData.append('userfile', modalFormData.file);
            }

            if (modalMode === 'add') {
                const response = await api.createStudentDiary(formData);
                if (response.status) {
                    setSuccess(response.message || 'Homework added successfully');
                    closeAddModal();
                    fetchHomeworkList(); // Refresh list
                } else {
                    setError(response.message || 'Failed to add homework');
                }
            } else {
                // Edit logic to be implemented if API available
                setSuccess('Homework updated successfully');
                closeAddModal();
            }

        } catch (err) {
            console.error('Error saving homework:', err);
            setError(err.message || 'An error occurred while saving');
        } finally {
            setLoading(false);
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    // Open evaluation modal
    const openEvaluationModal = (homeworkId) => {
        setEvaluationHomeworkId(homeworkId);
        // Mock evaluation data
        setEvaluationData({
            students: [
                { id: '1', name: 'John Doe', admission_no: 'STU001', status: 'submitted', marks: '85' },
                { id: '2', name: 'Jane Smith', admission_no: 'STU002', status: 'pending', marks: '' },
                { id: '3', name: 'Bob Johnson', admission_no: 'STU003', status: 'submitted', marks: '90' }
            ]
        });
        setEvaluationModalOpen(true);
    };

    // Close evaluation modal
    const closeEvaluationModal = () => {
        setEvaluationModalOpen(false);
        setEvaluationData(null);
        setEvaluationHomeworkId(null);
    };

    // Open homework docs modal
    const openDocsModal = (homeworkId) => {
        // Mock docs data
        setHomeworkDocs([
            { id: '1', name: 'John Doe', message: 'My homework submission', file: 'homework1.pdf' },
            { id: '2', name: 'Jane Smith', message: 'Please check', file: 'homework2.pdf' }
        ]);
        setDocsModalOpen(true);
    };

    // Close docs modal
    const closeDocsModal = () => {
        setDocsModalOpen(false);
        setHomeworkDocs([]);
    };

    // Handle select all checkbox
    const handleSelectAll = (e) => {
        const checked = e.target.checked;
        setSelectAll(checked);
        if (checked) {
            setSelectedHomework(closedHomeworkList.map(h => h.id));
        } else {
            setSelectedHomework([]);
        }
    };

    // Handle individual checkbox
    const handleSelectHomework = (id) => {
        if (selectedHomework.includes(id)) {
            setSelectedHomework(selectedHomework.filter(h => h !== id));
        } else {
            setSelectedHomework([...selectedHomework, id]);
        }
    };

    // Handle bulk delete
    const handleBulkDelete = (e) => {
        e.preventDefault();
        if (selectedHomework.length === 0) {
            alert('At least one homework should be selected');
            return;
        }
        if (window.confirm('Are you sure you want to delete?')) {
            // Mock delete
            setClosedHomeworkList(closedHomeworkList.filter(h => !selectedHomework.includes(h.id)));
            setSelectedHomework([]);
            setSelectAll(false);
            setSuccess('Homework deleted successfully');
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    return (
        <div className="wrapper theme-white-skin">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '828px', marginTop: '16px' }}>
                {/* Content Header */}
                <section className="content-header">
                    <h1>
                        <i className="fa fa-flask"></i> Homework
                    </h1>
                </section>

                {/* Main Content */}
                <section className="content">
                    <div className="row">
                        {/* Sidebar Menu */}
                        <div className="col-md-2">
                            <div className="box border0">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Homework</h3>
                                </div>
                                <ul className="tablists">
                                    <li className="active">
                                        <a href="#" className="active" onClick={(e) => { e.preventDefault(); openAddModal(); }}>
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/homework/1.png" alt="icon1" className="img-fluid" style={{ width: '20px' }} /> Add Homework
                                        </a>
                                    </li>
                                    <li>
                                        <Link to="/daily-assignment">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/homework/2.png" alt="icon2" className="img-fluid" style={{ width: '20px' }} /> Daily Assignment
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/homework">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/homework/1.png" alt="icon3" className="img-fluid" style={{ width: '20px' }} /> Classwise Assignment
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="col-md-10">
                            {/* Search Criteria Box */}
                            <div className="box box-primary " >
                                <div className="box-header with-border">
                                    <h3 className="box-title"><i className="fa fa-search"></i> Select Criteria</h3>
                                </div>
                                <form onSubmit={handleSearch}>
                                    <div className="box-body">
                                        <div className="row">
                                            <div className="col-md-12">
                                                {error && <div className="alert alert-danger">{error}</div>}
                                                {success && <div className="alert alert-success">{success}</div>}
                                            </div>
                                            <div className="col-md-3 col-lg-3 col-sm-6">
                                                <div className="form-group">
                                                    <label>Class</label><small className="req"> *</small>
                                                    <select
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
                                            <div className="col-md-3 col-lg-3 col-sm-6">
                                                <div className="form-group">
                                                    <label>Section</label>
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
                                                    <span className="section_id_error text-danger"></span>
                                                </div>
                                            </div>
                                            <div className="col-md-3 col-lg-3 col-sm-6">
                                                <div className="form-group">
                                                    <label>Subject Group</label>
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
                                                    <span className="section_id_error text-danger"></span>
                                                </div>
                                            </div>
                                            <div className="col-md-3 col-lg-3 col-sm-6">
                                                <div className="form-group">
                                                    <label>Subject</label>
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
                                                    <span className="section_id_error text-danger"></span>
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

                                {/* Homework List Tabs */}
                                <div className="nav-tabs-custom theme-shadow " style={{ minHeight: '440px' }}>
                                    <div className="box-header with-border">
                                        <h3 className="box-title"><i className="fa fa-users"></i> Homework List</h3>
                                        <div className="box-tools pull-right">
                                            <button
                                                onClick={openAddModal}
                                                type="button"
                                                className="btn btn-sm btn-primary modal_form"
                                            >
                                                <i className="fa fa-plus"></i> Add
                                            </button>
                                        </div>
                                    </div>
                                    <ul className="nav nav-tabs">
                                        <li className={activeTab === 'upcoming' ? 'active' : ''}>
                                            <a
                                                href="#tab_1"
                                                data-toggle="tab"
                                                onClick={() => setActiveTab('upcoming')}
                                            >
                                                Upcoming Homework
                                            </a>
                                        </li>
                                        <li className={activeTab === 'closed' ? 'active' : ''}>
                                            <a
                                                href="#tab_3"
                                                className="closed-exam"
                                                data-toggle="tab"
                                                onClick={() => setActiveTab('closed')}
                                            >
                                                Closed Homework
                                            </a>
                                        </li>
                                    </ul>
                                    <div className="tab-content">
                                        {/* Upcoming Homework Tab */}
                                        <div className={`tab-pane ${activeTab === 'upcoming' ? 'active' : ''}`} id="tab_1">
                                            <div className="box-body table-responsive">
                                                <div className="download_label">Homework List</div>
                                                <table className="table table-striped table-bordered table-hover homework-list">
                                                    <thead>
                                                        <tr>
                                                            <th>Class</th>
                                                            <th>Section</th>
                                                            <th>Subject Group</th>
                                                            <th>Subject</th>
                                                            <th>Homework Date</th>
                                                            <th>Submission Date</th>
                                                            <th>Evaluation Date</th>
                                                            <th>Created By</th>
                                                            <th className="text-right noExport">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {homeworkList.length === 0 ? (
                                                            <tr>
                                                                <td colSpan="9" className="text-center">
                                                                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                                                                        <div style={{ color: 'red', fontFamily: 'Roboto-Bold', fontSize: '10px' }}>No data available in table</div>
                                                                        <img src="/images/addnewitem.svg" alt="No Data" style={{ marginBottom: 0, width: '150px' }} />
                                                                        <div style={{ color: 'green', fontFamily: 'Roboto-Bold', fontSize: '10px' }}>&lt;- Add new record or search with different criteria</div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            homeworkList.map(hw => (
                                                                <tr key={hw.id}>
                                                                    <td>{hw.class}</td>
                                                                    <td>{hw.section}</td>
                                                                    <td>{hw.subject_group}</td>
                                                                    <td>{hw.subject}</td>
                                                                    <td>{hw.homework_date}</td>
                                                                    <td>{hw.submission_date}</td>
                                                                    <td>{hw.evaluation_date || '-'}</td>
                                                                    <td>{hw.created_by}</td>
                                                                    <td className="text-right">
                                                                        <button
                                                                            className="btn btn-default btn-xs"
                                                                            title="Evaluate"
                                                                            onClick={() => openEvaluationModal(hw.id)}
                                                                        >
                                                                            <i className="fa fa-check-square-o"></i>
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-default btn-xs"
                                                                            title="View Documents"
                                                                            onClick={() => openDocsModal(hw.id)}
                                                                        >
                                                                            <i className="fa fa-files-o"></i>
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-default btn-xs"
                                                                            title="Edit"
                                                                            onClick={() => openEditModal(hw)}
                                                                        >
                                                                            <i className="fa fa-pencil"></i>
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Closed Homework Tab */}
                                        <div className={`tab-pane ${activeTab === 'closed' ? 'active' : ''}`} id="tab_3">
                                            <form onSubmit={handleBulkDelete} id="deletebulk">
                                                <div className="">
                                                    <div className="checkbox">
                                                        <label>
                                                            <input
                                                                type="checkbox"
                                                                name="checkAll"
                                                                checked={selectAll}
                                                                onChange={handleSelectAll}
                                                            /> <b>Select All</b>
                                                        </label>
                                                        <button
                                                            type="submit"
                                                            id="delete_btn_id"
                                                            className="btn btn-primary btn-sm pull-right mb10"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="table-responsive overflow-visible-lg">
                                                    <div className="download_label">Homework List</div>
                                                    <table className="table table-striped table-bordered table-hover homework-list-close">
                                                        <thead>
                                                            <tr>
                                                                <th>#</th>
                                                                <th>Class</th>
                                                                <th>Section</th>
                                                                <th>Subject Group</th>
                                                                <th>Subject</th>
                                                                <th>Homework Date</th>
                                                                <th>Submission Date</th>
                                                                <th>Evaluation Date</th>
                                                                <th>Created By</th>
                                                                <th className="text-right noExport">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {closedHomeworkList.length === 0 ? (
                                                                <tr>
                                                                    <td colSpan="10" className="text-center">
                                                                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                                                                            <div style={{ color: 'red', fontFamily: 'Roboto-Bold', fontSize: '10px' }}>No data available in table</div>
                                                                            <img src="/images/addnewitem.svg" alt="No Data" style={{ marginBottom: 0, width: '150px' }} />
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                closedHomeworkList.map(hw => (
                                                                    <tr key={hw.id}>
                                                                        <td>
                                                                            <input
                                                                                type="checkbox"
                                                                                name="delete_homework[]"
                                                                                value={hw.id}
                                                                                checked={selectedHomework.includes(hw.id)}
                                                                                onChange={() => handleSelectHomework(hw.id)}
                                                                            />
                                                                        </td>
                                                                        <td>{hw.class}</td>
                                                                        <td>{hw.section}</td>
                                                                        <td>{hw.subject_group}</td>
                                                                        <td>{hw.subject}</td>
                                                                        <td>{hw.homework_date}</td>
                                                                        <td>{hw.submission_date}</td>
                                                                        <td>{hw.evaluation_date || '-'}</td>
                                                                        <td>{hw.created_by}</td>
                                                                        <td className="text-right">
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-default btn-xs"
                                                                                title="Evaluate"
                                                                                onClick={() => openEvaluationModal(hw.id)}
                                                                            >
                                                                                <i className="fa fa-check-square-o"></i>
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-default btn-xs"
                                                                                title="View Documents"
                                                                                onClick={() => openDocsModal(hw.id)}
                                                                            >
                                                                                <i className="fa fa-files-o"></i>
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-default btn-xs"
                                                                                title="Edit"
                                                                                onClick={() => openEditModal(hw)}
                                                                            >
                                                                                <i className="fa fa-pencil"></i>
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Add/Edit Homework Modal */}
            {addModalOpen && (<>
                <div className="modal fade in" style={{ display: 'block', paddingRight: '17px' }}>
                    <div className="modal-dialog modal-lg" role="document">
                        <div className="modal-content modal-media-content">
                            <div className="modal-header modal-media-header">
                                <button type="button" className="close close_btn" onClick={closeAddModal}>×</button>
                                <h4 className="modal-title box-title">
                                    {modalMode === 'add' ? 'Add Homework' : 'Edit Homework'}
                                </h4>
                            </div>
                            <form onSubmit={handleModalSubmit} id="formadd" className="ptt10" encType="multipart/form-data">
                                <div className="modal-body pt0 pb0">
                                    <div className="row">
                                        <div className="col-lg-12 col-md-12 col-sm-12">
                                            <div className="row">
                                                <input type="hidden" id="modal_record_id" value={editRecordId || 0} name="record_id" />
                                                <div className="col-sm-4">
                                                    <div className="form-group">
                                                        <label>Class</label><small className="req"> *</small>
                                                        <select
                                                            className="form-control modal_class_id"
                                                            name="modal_class_id"
                                                            id="modal_class_id"
                                                            value={modalFormData.modal_class_id}
                                                            onChange={handleModalInputChange}
                                                        >
                                                            <option value="">Select</option>
                                                            {classes.map(cls => (
                                                                <option key={cls.id} value={cls.id}>{cls.class}</option>
                                                            ))}
                                                        </select>
                                                        <span id="name_add_error" className="text-danger"></span>
                                                    </div>
                                                </div>
                                                <div className="col-sm-4">
                                                    <div className="form-group">
                                                        <label>Section</label><small className="req"> *</small>
                                                        <select
                                                            className="form-control modal_section_id"
                                                            name="modal_section_id"
                                                            id="modal_section_id"
                                                            value={modalFormData.modal_section_id}
                                                            onChange={handleModalInputChange}
                                                        >
                                                            <option value="">Select</option>
                                                            {modalSections.map(sec => (
                                                                <option key={sec.section_id} value={sec.section_id}>{sec.section}</option>
                                                            ))}
                                                        </select>
                                                        <span id="name_add_error" className="text-danger"></span>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label>Subject Group</label><small className="req"> *</small>
                                                        <select
                                                            id="modal_subject_group_id"
                                                            name="modal_subject_group_id"
                                                            className="form-control"
                                                            value={modalFormData.modal_subject_group_id}
                                                            onChange={handleModalInputChange}
                                                        >
                                                            <option value="">Select</option>
                                                            {modalSubjectGroups.map(sg => (
                                                                <option key={sg.subject_group_id} value={sg.subject_group_id}>{sg.name}</option>
                                                            ))}
                                                        </select>
                                                        <span className="text-danger"></span>
                                                    </div>
                                                </div>
                                                <div className="col-sm-4">
                                                    <div className="form-group">
                                                        <label>Subject</label><small className="req"> *</small>
                                                        <select
                                                            className="form-control"
                                                            name="modal_subject_id"
                                                            id="modal_subject_id"
                                                            value={modalFormData.modal_subject_id}
                                                            onChange={handleModalInputChange}
                                                        >
                                                            <option value="">Select</option>
                                                            {modalSubjects.map(sub => (
                                                                <option key={sub.id} value={sub.id}>
                                                                    {sub.name} {sub.code && `(${sub.code})`}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <span id="name_add_error" className="text-danger"></span>
                                                    </div>
                                                </div>
                                                <div className="col-sm-4">
                                                    <div className="form-group">
                                                        <label>Homework Date</label><small className="req"> *</small>
                                                        <input
                                                            type="date"
                                                            name="homework_date"
                                                            className="form-control"
                                                            id="homework_date"
                                                            value={modalFormData.homework_date}
                                                            onChange={handleModalInputChange}
                                                        />
                                                        <span id="date_add_error" className="text-danger"></span>
                                                    </div>
                                                </div>
                                                <div className="col-sm-4">
                                                    <div className="form-group">
                                                        <label>Submission Date</label><small className="req"> *</small>
                                                        <input
                                                            type="date"
                                                            id="submit_date"
                                                            name="submit_date"
                                                            className="form-control"
                                                            value={modalFormData.submit_date}
                                                            onChange={handleModalInputChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-sm-4">
                                                    <div className="form-group">
                                                        <label>Max Marks</label>
                                                        <input
                                                            type="text"
                                                            id="homework_marks"
                                                            name="homework_marks"
                                                            className="form-control"
                                                            value={modalFormData.homework_marks}
                                                            onChange={handleModalInputChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-sm-4">
                                                    <div className="form-group">
                                                        <label>Attach Document</label>
                                                        <input
                                                            type="file"
                                                            id="file"
                                                            name="userfile"
                                                            className="form-control"
                                                            onChange={handleModalInputChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-sm-12">
                                                    <div className="form-group">
                                                        <label>Description</label><small className="req"> *</small>
                                                        <EditorProvider>
                                                            <Editor
                                                                value={modalFormData.description}
                                                                onChange={handleDescriptionChange}
                                                                containerProps={{ style: { minHeight: '200px' } }}
                                                            />
                                                        </EditorProvider>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <div className="pull-right">
                                        <button type="submit" className="btn btn-info pull-right" id="submit">
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="modal-backdrop fade in"></div>
            </>
            )}

            {/* Evaluation Modal */}
            {evaluationModalOpen && (
                <div className="modal fade in pr-0" style={{ display: 'block', paddingLeft: '0 !important' }}>
                    <div className="modal-dialog modal-xl" role="document">
                        <div className="modal-content modal-media-content">
                            <div className="modal-header modal-media-header">
                                <button type="button" className="close" onClick={closeEvaluationModal}>×</button>
                                <h4 className="modal-title">Evaluate Homework</h4>
                            </div>
                            <div className="modal-body pt0 pb0" id="evaluation_details">
                                {evaluationData && (
                                    <div className="table-responsive">
                                        <table className="table table-striped table-bordered table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Admission No</th>
                                                    <th>Student Name</th>
                                                    <th>Status</th>
                                                    <th>Marks</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {evaluationData.students.map(student => (
                                                    <tr key={student.id}>
                                                        <td>{student.admission_no}</td>
                                                        <td>{student.name}</td>
                                                        <td>
                                                            <span className={`label ${student.status === 'submitted' ? 'label-success' : 'label-warning'}`}>
                                                                {student.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                defaultValue={student.marks}
                                                                placeholder="Enter marks"
                                                                style={{ width: '100px' }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <button className="btn btn-primary btn-xs">Save</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade in"></div>
                </div>
            )}

            {/* Homework Docs Modal */}
            {docsModalOpen && (
                <div className="modal fade in" style={{ display: 'block', paddingLeft: '0 !important' }}>
                    <div className="modal-dialog modal-lg" role="document">
                        <div className="modal-content modal-media-content">
                            <div className="modal-header modal-media-header">
                                <button type="button" className="close" onClick={closeDocsModal}>×</button>
                                <h4 className="modal-title">Homework Assignments</h4>
                            </div>
                            <div className="modal-body pb0">
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="table-responsive overflow-visible-lg">
                                            <table className="table table-hover table-striped table-bordered all-list">
                                                <thead>
                                                    <tr>
                                                        <th className="white-space-nowrap">Name</th>
                                                        <th>Message</th>
                                                        <th className="text-right noExport">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="homework_docs_result">
                                                    {homeworkDocs.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="3" className="text-center">No documents found</td>
                                                        </tr>
                                                    ) : (
                                                        homeworkDocs.map(doc => (
                                                            <tr key={doc.id}>
                                                                <td>{doc.name}</td>
                                                                <td>{doc.message}</td>
                                                                <td className="text-right">
                                                                    <a href="#" className="btn btn-default btn-xs" title="Download">
                                                                        <i className="fa fa-download"></i>
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
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

export default HomeworkList;
