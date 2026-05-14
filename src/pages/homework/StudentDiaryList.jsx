import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';
import '../../utils/include_files';
import { api } from '../../services/api';
// FileUpload removed in favor of Dropify as per user request
import { buildExportData } from '../../utils/tableExport';
import PremiumTableToolbar from '../../utils/PremiumTableToolbar';
import Pagination from '../../utils/Pagination';
import toast from 'react-hot-toast';
import './Homework.css';

const StudentDiaryList = () => {
    const navigate = useNavigate();

    // Static counts for UI
    const [counts] = useState({
        activeAssignments: 24,
        dueToday: 8,
        submissions: 156,
        pendingReviews: 12
    });

    // Column Visibility State
    const columns = [
        { key: 'class', label: 'Class' },
        { key: 'section', label: 'Section' },
        { key: 'date', label: 'Date' },
        { key: 'assigned_by', label: 'Created By' }
    ];
    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));

    const handleToggleColumn = (columnKey) => {
        setVisibleColumns(prev => {
            const next = new Set(prev);
            if (next.has(columnKey)) { next.delete(columnKey); } else { next.add(columnKey); }
            return next;
        });
    };

    const [searchTerm, setSearchTerm] = useState('');

    const getExportData = () => buildExportData(columns, visibleColumns, filteredDiaryList, (row, key) => row[key] || '');

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

    // Hidden fields support state (even if display:none in PHP, we need logic if enabled later or just to match)
    const [subjectGroups, setSubjectGroups] = useState([]);
    const [subjects, setSubjects] = useState([]);

    // Table data
    const [diaryList, setDiaryList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);

    const filteredDiaryList = diaryList.filter(item => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            (item.class || '').toLowerCase().includes(term) ||
            (item.section || '').toLowerCase().includes(term) ||
            (item.date || '').toLowerCase().includes(term) ||
            (item.assigned_by || '').toLowerCase().includes(term)
        );
    });

    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = filteredDiaryList.slice(indexOfFirstRecord, indexOfLastRecord);

    const [errors, setErrors] = useState({});

    // Modal states
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [evaluateModalOpen, setEvaluateModalOpen] = useState(false);
    const [evaluateData, setEvaluateData] = useState(null);
    const [docsModalOpen, setDocsModalOpen] = useState(false);

    // Add Modal Form Data
    const [addFormData, setAddFormData] = useState({
        class_id: '',
        section_id: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        file: null
    });
    const [addErrors, setAddErrors] = useState({});

    // Edit Modal Form Data
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        id: '',
        class_id: '',
        section_id: '',
        date: '',
        description: '',
        file: null,
        existing_file: ''
    });

    // Fetch classes on mount
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                setInitialLoading(true);
                const response = await api.getClasses();
                if (response && response.status === 'success' && response.classsectionlist) {
                    setClasses([...response.classsectionlist].reverse());
                }
            } catch (error) {
                console.error("Failed to fetch classes", error);
            } finally {
                setInitialLoading(false);
            }
        };
        fetchClasses();
    }, []);

    // Initialize Dropify for Modals
    useEffect(() => {
        if (addModalOpen || editModalOpen) {
            const timer = setTimeout(() => {
                try {
                    const $ = window.jQuery;
                    if ($ && $.fn && typeof $.fn.dropify === 'function') {
                        $('.dropify').dropify();
                    }
                } catch (error) {
                    console.error('Dropify initialization error:', error);
                }
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [addModalOpen, editModalOpen]);

    const fetchSections = async (classId) => {
        try {
            const response = await api.getSectionsByClass(classId);
            if (response && response.data) {
                setSections(response.data);
            } else if (response && Array.isArray(response)) {
                setSections(response);
            }
        } catch (error) {
            console.error("Failed to fetch sections", error);
        }
    }

    // Handle search form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'class_id') {
            setSections([]);
            setFormData(prev => ({ ...prev, section_id: '' }));
            setErrors(prev => ({ ...prev, class_id: '' }));
            if (value) {
                fetchSections(value);
            }
        }
    };

    // Handle Add Modal Input Change
    const handleAddInputChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'userfile') {
            setAddFormData(prev => ({
                ...prev,
                file: files[0]
            }));
        } else {
            setAddFormData(prev => ({
                ...prev,
                [name]: value
            }));
            setAddErrors(prev => ({ ...prev, [name]: '' }));
        }

        if (name === 'class_id') {
            // Logic to populate sections for modal
            setAddFormData(prev => ({ ...prev, section_id: '' }));
            setAddErrors(prev => ({ ...prev, class_id: '', section_id: '' }));
            if (value) {
                fetchSections(value);
            }
        }
    };

    // Handle Edit Modal Input Change
    const handleEditInputChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'userfile') {
            setEditFormData(prev => ({
                ...prev,
                file: files[0]
            }));
        } else {
            setEditFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        if (name === 'class_id') {
            setEditFormData(prev => ({ ...prev, section_id: '' }));
            if (value) fetchSections(value);
        }
    };

    // Handle Search Submit
    const handleSearch = async (e) => {
        e.preventDefault();

        let formErrors = {};
        if (!formData.class_id) {
            formErrors.class_id = "The Class field is required";
        }
        setErrors(formErrors);

        if (Object.keys(formErrors).length > 0) {
            return;
        }

        setLoading(true);

        try {
            const params = {
                class_id: formData.class_id,
                section_id: formData.section_id,
                subject_group_id: formData.subject_group_id,
                subject_id: formData.subject_id
            };

            const response = await api.getStudentDiaryList(params);

            if (response && response.status && response.data) {
                setDiaryList(response.data);
                setCurrentPage(1); // Reset page on new search
            } else {
                setDiaryList([]);
            }
        } catch (error) {
            console.error("Failed to fetch diary list:", error);
            setDiaryList([]);
        } finally {
            setLoading(false);
        }
    };

    // Handlers for Modals
    const openAddModal = () => {
        setAddFormData({
            class_id: '',
            section_id: '',
            date: new Date().toISOString().split('T')[0],
            description: '',
            file: null
        });
        setAddModalOpen(true);
    };

    const closeAddModal = () => {
        setAddModalOpen(false);
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();

        let newAddErrors = {};
        if (!addFormData.class_id) {
            newAddErrors.class_id = "The Class field is required";
        }
        if (!addFormData.section_id) {
            newAddErrors.section_id = "The Section field is required";
        }
        if (!addFormData.date) {
            newAddErrors.date = "The Date field is required";
        }
        if (!addFormData.description) {
            newAddErrors.description = "The Description field is required";
        }
        setAddErrors(newAddErrors);

        if (Object.keys(newAddErrors).length > 0) {
            return;
        }

        try {
            const submitData = new FormData();
            submitData.append('class_id', addFormData.class_id);
            submitData.append('section_id', addFormData.section_id);
            // Format date to DD-MM-YYYY as expected by API (Postman body: 20-01-2026)
            const dateObj = new Date(addFormData.date);
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
            const year = dateObj.getFullYear();
            const formattedDate = `${day}-${month}-${year}`;

            submitData.append('date', formattedDate);
            submitData.append('description', addFormData.description);
            // assigned_by is required. Using dynamic value from session if available.
            const storedUser = localStorage.getItem('user');
            let assignedBy = '';
            if (storedUser) {
                try {
                    const user = JSON.parse(storedUser);
                    const name = user.username || user.name;
                    const employeeId = user.staff_id || user.employee_id || user.id;
                    assignedBy = `${name} (${employeeId})`;
                } catch (e) {
                    console.error("Error parsing user for assigned_by:", e);
                }
            }
            submitData.append('assigned_by', assignedBy);

            if (addFormData.file) {
                submitData.append('userfile', addFormData.file);
            }

            await api.createStudentDiary(submitData);

            alert('Student diary saved successfully');
            // Clear Dropify
            try {
                const $ = window.jQuery;
                $('.dropify').each(function () {
                    const dr = $(this).data('dropify');
                    if (dr) {
                        dr.resetPreview();
                        dr.clearElement();
                    }
                });
            } catch (e) { }
            closeAddModal();
            // Refresh list if search criteria matches
            if (formData.class_id && formData.section_id) {
                handleSearch(e);
            }
        } catch (error) {
            console.error("Failed to create student diary:", error);
            alert('Failed to save student diary. Please try again.');
        }
    };



    const handleEdit = async (id) => {
        try {
            const response = await api.getStudentDiary(id);
            if (response && response.status && response.data) {
                const data = response.data;
                setEditFormData({
                    id: data.id,
                    class_id: data.class_id,
                    section_id: data.section_id,
                    date: data.date, // Assuming YYYY-MM-DD from API
                    description: data.description,
                    file: null,
                    existing_file: data.document
                });

                // Ensure sections are loaded for the selected class
                if (data.class_id) {
                    await fetchSections(data.class_id);
                }

                setEditModalOpen(true);
            } else {
                alert('Failed to fetch diary details');
            }
        } catch (error) {
            console.error("Failed to fetch diary details:", error);
            alert('Error fetching details');
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            // assigned_by is required for edit as well
            const storedUser = localStorage.getItem('user');
            let assignedBy = '';
            if (storedUser) {
                try {
                    const user = JSON.parse(storedUser);
                    const name = user.username || user.name || 'Admin';
                    const employeeId = user.staff_id || user.employee_id || user.id || '';
                    assignedBy = `${name} (${employeeId})`;
                } catch (e) {
                    console.error("Error parsing user for assigned_by:", e);
                }
            }

            // Match the body carefully as requested by user
            // User Postman body has: id, class_id, section_id, date, description, assigned_by
            // Check if file is selected
            if (editFormData.file) {
                const submitData = new FormData();
                submitData.append('id', editFormData.id);
                submitData.append('class_id', editFormData.class_id);
                submitData.append('section_id', editFormData.section_id);
                submitData.append('date', editFormData.date); // Standard HTML5 date is YYYY-MM-DD
                submitData.append('description', editFormData.description);
                submitData.append('assigned_by', assignedBy);
                submitData.append('userfile', editFormData.file);

                await api.updateStudentDiary(submitData);
            } else {
                // If no file, send exact JSON body as shown in user's Postman example
                const jsonBody = {
                    id: editFormData.id,
                    class_id: editFormData.class_id,
                    section_id: editFormData.section_id,
                    date: editFormData.date, // format: 2026-01-20
                    description: editFormData.description,
                    assigned_by: assignedBy
                };
                await api.updateStudentDiary(jsonBody);
            }

            alert('Student diary updated successfully');
            // Clear Dropify
            try {
                const $ = window.jQuery;
                $('.dropify').each(function () {
                    const dr = $(this).data('dropify');
                    if (dr) {
                        dr.resetPreview();
                        dr.clearElement();
                    }
                });
            } catch (e) { }
            setEditModalOpen(false);
            if (formData.class_id && formData.section_id) {
                handleSearch(e);
            }
        } catch (error) {
            console.error("Failed to update student diary:", error);
            alert('Failed to update student diary');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                const response = await api.deleteStudentDiary(id);
                if (response && response.status) {
                    alert('Student diary deleted successfully');
                    // Refresh list if search criteria matches
                    if (formData.class_id && formData.section_id) {
                        // Passing a dummy event or just calling the logic directly
                        const dummyEvent = { preventDefault: () => { } };
                        handleSearch(dummyEvent);
                    }
                } else {
                    alert(response.message || 'Failed to delete dairy record');
                }
            } catch (error) {
                console.error("Failed to delete diary record:", error);
                alert('An error occurred while deleting the record');
            }
        }
    };

    const handleEvaluate = async (id) => {
        try {
            const response = await api.getStudentDiary(id);
            if (response && response.status && response.data) {
                const data = response.data;
                // Find class/section names from the diaryList or classes array
                const diaryItem = diaryList.find(d => String(d.id) === String(id));
                setEvaluateData({
                    ...data,
                    class_name: diaryItem?.class || data.class || '',
                    section_name: diaryItem?.section || data.section || '',
                    assigned_by: diaryItem?.assigned_by || data.assigned_by || ''
                });
                setEvaluateModalOpen(true);
            } else {
                toast.error('Failed to fetch diary details');
            }
        } catch (error) {
            console.error('Failed to fetch diary for evaluation:', error);
            toast.error('Error fetching diary details');
        }
    };

    const handleBack = () => {
        navigate(-1);
    }

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)', backgroundColor: '#f8fafc' }}>
                <section className="homework-header-section">
                    <div className="homework-header-content">
                        <div className="homework-titles">
                            <h1>Student Diary</h1>
                            <p>Manage and track class-wise assignments and daily tasks</p>
                        </div>
                    </div>

                    <div className="homework-summary-cards">
                        <div className="homework-card" style={{ border: '1px solid #3b82f6' }}>
                            <div className="homework-card-header">
                                <span className="homework-card-title">Active Assignments</span>
                                <i className="fa fa-book homework-card-icon" style={{ color: '#3b82f6' }}></i>
                            </div>
                            <div className="homework-card-value">{counts.activeAssignments}</div>
                            <div className="homework-card-subtitle">Current open assignments</div>
                        </div>

                        <div className="homework-card" style={{ border: '1px solid #3b82f6' }}>
                            <div className="homework-card-header">
                                <span className="homework-card-title">Due Today</span>
                                <i className="fa fa-clock-o homework-card-icon" style={{ color: '#f59e0b' }}></i>
                            </div>
                            <div className="homework-card-value">{counts.dueToday}</div>
                            <div className="homework-card-subtitle">Assignments ending today</div>
                        </div>

                        <div className="homework-card" style={{ border: '1px solid #3b82f6' }}>
                            <div className="homework-card-header">
                                <span className="homework-card-title">Submissions</span>
                                <i className="fa fa-check-circle homework-card-icon" style={{ color: '#10b981' }}></i>
                            </div>
                            <div className="homework-card-value">{counts.submissions}</div>
                            <div className="homework-card-subtitle">Total received</div>
                        </div>

                        <div className="homework-card" style={{ border: '1px solid #3b82f6' }}>
                            <div className="homework-card-header">
                                <span className="homework-card-title">Pending Reviews</span>
                                <i className="fa fa-exclamation-circle homework-card-icon" style={{ color: '#ef4444' }}></i>
                            </div>
                            <div className="homework-card-value">{counts.pendingReviews}</div>
                            <div className="homework-card-subtitle">Awaiting evaluation</div>
                        </div>
                    </div>
                </section>
                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            {initialLoading ? (
                                <Loader />
                            ) : (
                                <>
                                    <div className="sis-search-bar-container" style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                                        <div className="sis-search-bar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                            <h3 className="sis-search-title" style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#1e293b' }}>Select Criteria</h3>

                                        </div>
                                        <form className="assign_teacher_form" onSubmit={handleSearch}>
                                            <div className="sis-filter-row" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                                                <div className="sis-filter-col" style={{ flex: '1', minWidth: '200px' }}>
                                                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>Class <small className="req"> *</small></label>
                                                    <select
                                                        autoFocus=""
                                                        id="searchclassid"
                                                        name="class_id"
                                                        className="form-control sis-filter-select"
                                                        value={formData.class_id}
                                                        onChange={handleInputChange}
                                                        style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }}
                                                    >
                                                        <option value="">Select</option>
                                                        {classes.map(cls => (
                                                            <option key={cls.id} value={cls.id}>{cls.class}</option>
                                                        ))}
                                                    </select>
                                                    {errors.class_id && <span className="text-danger" id="error_class_id" style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.class_id}</span>}
                                                </div>
                                                <div className="sis-filter-col" style={{ flex: '1', minWidth: '200px' }}>
                                                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>Section</label>
                                                    <select
                                                        id="secid"
                                                        name="section_id"
                                                        className="form-control sis-filter-select"
                                                        value={formData.section_id}
                                                        onChange={handleInputChange}
                                                        style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }}
                                                    >
                                                        <option value="">Select</option>
                                                        {sections.map(sec => (
                                                            <option key={sec.section_id || sec.id} value={sec.section_id}>{sec.section}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {/* Hidden fields as per PHP */}
                                                <div className="sis-filter-col" style={{ display: 'none' }}>
                                                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>Subject Group</label>
                                                    <select id="subject_group_id" name="subject_group_id" className="form-control" style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }}>
                                                        <option value="">Select</option>
                                                    </select>
                                                </div>
                                                <div className="sis-filter-col" style={{ display: 'none' }}>
                                                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>Subject</label>
                                                    <select id="subid" name="subject_id" className="form-control" style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }}>
                                                        <option value="">Select</option>
                                                    </select>
                                                </div>
                                                <div className="sis-filter-col" style={{ display: 'flex', alignItems: 'flex-end', paddingTop: errors.class_id ? '0' : '28px' }}>
                                                    <button type="submit" id="search_filter" name="search" value="search_filter" className="btn btn-primary" style={{ height: '40px', padding: '0 24px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <i className="fa fa-search"></i> Search
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                    <div className="sis-list-container" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                        <div className="sis-list-header" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>Class wise assessment List</h3>
                                            <button onClick={openAddModal} type="button" className="btn btn-primary" style={{ borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <i className="fa fa-plus"></i> Create Assignment
                                            </button>
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
                                                onToggleColumn={handleToggleColumn}
                                                getExportData={getExportData}
                                                exportFileName="Student_Diary_List"
                                                exportTitle="Student Diary List"
                                                recordsPerPage={recordsPerPage}
                                                onRecordsPerPageChange={(val) => { setRecordsPerPage(val); setCurrentPage(1); }}
                                            />
                                        </div>
                                        <div className="table-responsive">
                                            <table className="table table-hover studentdairy-list" style={{ margin: 0 }}>
                                                <thead>
                                                    <tr className="modern-table-header">
                                                        {visibleColumns.has('class') && <th>Class</th>}
                                                        {visibleColumns.has('section') && <th>Section</th>}
                                                        {visibleColumns.has('date') && <th>Date</th>}
                                                        {visibleColumns.has('assigned_by') && <th>Created By</th>}
                                                        <th className="text-right noExport" style={{ minWidth: '120px' }}>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {diaryList.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="5">
                                                                <div className="text-center" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', minHeight: '200px' }}>
                                                                    <div style={{ color: 'red', fontFamily: 'Roboto-Bold', fontSize: '10px' }}>No data available in table</div>
                                                                    <img src="/images/addnewitem.svg" alt="No Data" style={{ marginBottom: 0, width: '150px' }} />
                                                                    <div style={{ color: 'green', fontFamily: 'Roboto-Bold', fontSize: '10px' }}>&lt;- Add new record or search with different criteria</div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        currentRecords.map(item => (
                                                            <tr key={item.id} className="modern-table-row">
                                                                {visibleColumns.has('class') && <td>{item.class}</td>}
                                                                {visibleColumns.has('section') && <td>{item.section}</td>}
                                                                {visibleColumns.has('date') && (
                                                                    <td>
                                                                        <div className="cell-icon-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                            <i className="fa fa-calendar" style={{ color: '#94a3b8' }}></i>
                                                                            <span>{item.date}</span>
                                                                        </div>
                                                                    </td>
                                                                )}
                                                                {visibleColumns.has('assigned_by') && <td>{item.assigned_by}</td>}
                                                                <td className="text-right">
                                                                    <div className="action-btns-wrapper">
                                                                        <button className="action-btn-circle btn-view-circle" title="Evaluation" onClick={() => handleEvaluate(item.id)}>
                                                                            <i className="fa fa-reorder"></i>
                                                                        </button>
                                                                        <button className="action-btn-circle btn-edit-circle" title="Edit" onClick={() => handleEdit(item.id)}>
                                                                            <i className="fa fa-pencil"></i>
                                                                        </button>
                                                                        <button className="action-btn-circle btn-delete-circle" title="Delete" onClick={() => handleDelete(item.id)}>
                                                                            <i className="fa fa-remove"></i>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
                                            <div style={{ color: '#64748b', fontSize: '14px' }}>
                                                Showing {filteredDiaryList.length === 0 ? 0 : (currentPage - 1) * recordsPerPage + 1} to {Math.min(currentPage * recordsPerPage, filteredDiaryList.length)} of {filteredDiaryList.length} entries
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
                                                    disabled={currentPage >= Math.ceil(filteredDiaryList.length / recordsPerPage) || Math.ceil(filteredDiaryList.length / recordsPerPage) === 0}
                                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                                    style={{ borderRadius: '6px', border: '1px solid #e2e8f0', background: '#ffffff', color: currentPage >= Math.ceil(filteredDiaryList.length / recordsPerPage) || Math.ceil(filteredDiaryList.length / recordsPerPage) === 0 ? '#cbd5e1' : '#475569' }}
                                                >
                                                    <i className="fa fa-angle-right"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            {/* Add Student Classwise Homework Modal */}
            {addModalOpen && (
                <>
                    <div className="modal fade in" style={{ display: 'block' }}>
                        <div className="modal-dialog modal-lg" role="document">
                            <div className="modal-content modal-media-content">
                                <div className="modal-header modal-media-header">
                                    <button type="button" className="close" onClick={closeAddModal}>&times;</button>
                                    <h4 className="modal-title box-title">Add Student Classwise Homework</h4>
                                </div>
                                <form id="formadd" method="post" className="ptt10" encType="multipart/form-data" onSubmit={handleAddSubmit}>
                                    <div className="modal-body pt0 pb0">
                                        <div className="row">
                                            <div className="col-lg-12 col-md-12 col-sm-12">
                                                <div className="row">
                                                    <input type="hidden" id="modal_record_id" value="0" name="record_id" />
                                                    <div className="col-sm-4">
                                                        <div className="form-group">
                                                            <label>Class</label><small className="req"> *</small>
                                                            <select
                                                                className="form-control modal_class_id"
                                                                name="class_id"
                                                                id="modal_class_id"
                                                                value={addFormData.class_id}
                                                                onChange={handleAddInputChange}
                                                            >
                                                                <option value="">Select</option>
                                                                {classes.map(cls => (
                                                                    <option key={cls.id} value={cls.id}>{cls.class}</option>
                                                                ))}
                                                            </select>
                                                            {addErrors.class_id && <span id="class_add_error" className="text-danger">{addErrors.class_id}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-4">
                                                        <div className="form-group">
                                                            <label>Section</label><small className="req"> *</small>
                                                            <select
                                                                className="form-control modal_section_id"
                                                                name="section_id"
                                                                id="modal_section_id"
                                                                value={addFormData.section_id}
                                                                onChange={handleAddInputChange}
                                                            >
                                                                <option value="">Select</option>
                                                                {sections.map(sec => (
                                                                    <option key={sec.section_id || sec.id} value={sec.section_id}>{sec.section}</option>
                                                                ))}
                                                            </select>
                                                            {addErrors.section_id && <span id="section_add_error" className="text-danger">{addErrors.section_id}</span>}
                                                        </div>
                                                    </div>

                                                    <div className="col-sm-4">
                                                        <div className="form-group">
                                                            <label>Date</label><small className="req"> *</small>
                                                            <input
                                                                type="date"
                                                                name="date"
                                                                className="form-control"
                                                                id="date"
                                                                value={addFormData.date}
                                                                onChange={handleAddInputChange}
                                                                max={new Date().toISOString().split('T')[0]}
                                                            />
                                                            {addErrors.date && <span id="date_add_error" className="text-danger">{addErrors.date}</span>}
                                                        </div>
                                                    </div>

                                                    <div className="col-sm-4">
                                                        <div className="form-group">
                                                            <label>Attach Document</label>
                                                            <input
                                                                type="file"
                                                                name="userfile"
                                                                className="dropify"
                                                                onChange={handleAddInputChange}
                                                                data-height="95"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-12">
                                                        <div className="form-group">
                                                            <label>Description</label><small className="req"> *</small>
                                                            <textarea
                                                                name="description"
                                                                id="compose-textarea"
                                                                className="form-control"
                                                                value={addFormData.description}
                                                                onChange={handleAddInputChange}
                                                            >
                                                            </textarea>
                                                            {addErrors.description && <span id="description_add_error" className="text-danger">{addErrors.description}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <div className="pull-right">
                                            <button type="submit" className="btn btn-info pull-right" id="submit">Save</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade in"></div>
                </>
            )}

            {/* Edit Student Diary Modal */}
            {editModalOpen && (
                <>
                    <div className="modal fade in" style={{ display: 'block' }}>
                        <div className="modal-dialog modal-lg" role="document">
                            <div className="modal-content modal-media-content">
                                <div className="modal-header modal-media-header">
                                    <button type="button" className="close" onClick={() => setEditModalOpen(false)}>&times;</button>
                                    <h4 className="modal-title box-title">Edit Student Classwise Homework</h4>
                                </div>
                                <form id="formedit" method="post" className="ptt10" encType="multipart/form-data" onSubmit={handleEditSubmit}>
                                    <div className="modal-body pt0 pb0">
                                        <div className="row">
                                            <div className="col-lg-12 col-md-12 col-sm-12">
                                                <div className="row">
                                                    <input type="hidden" name="id" value={editFormData.id} />
                                                    <div className="col-sm-4">
                                                        <div className="form-group">
                                                            <label>Class</label><small className="req"> *</small>
                                                            <select
                                                                className="form-control modal_class_id"
                                                                name="class_id"
                                                                value={editFormData.class_id}
                                                                onChange={handleEditInputChange}
                                                            >
                                                                <option value="">Select</option>
                                                                {classes.map(cls => (
                                                                    <option key={cls.id} value={cls.id}>{cls.class}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-4">
                                                        <div className="form-group">
                                                            <label>Section</label><small className="req"> *</small>
                                                            <select
                                                                className="form-control modal_section_id"
                                                                name="section_id"
                                                                value={editFormData.section_id}
                                                                onChange={handleEditInputChange}
                                                            >
                                                                <option value="">Select</option>
                                                                {sections.map(sec => (
                                                                    <option key={sec.section_id || sec.id} value={sec.section_id}>{sec.section}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-4">
                                                        <div className="form-group">
                                                            <label>Date</label><small className="req"> *</small>
                                                            <input
                                                                type="date"
                                                                name="date"
                                                                className="form-control"
                                                                value={editFormData.date}
                                                                readOnly
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-4">
                                                        <div className="form-group">
                                                            <label>Attach Document</label>
                                                            <input
                                                                type="file"
                                                                name="userfile"
                                                                className="dropify"
                                                                onChange={handleEditInputChange}
                                                                data-height="95"
                                                                data-default-file={editFormData.existing_file ? `${api.baseHost}/uploads/homework/${editFormData.existing_file}` : ''}
                                                            />
                                                            {editFormData.existing_file && (
                                                                <small className="help-block">
                                                                    Current: {(() => {
                                                                        const raw = editFormData.existing_file.split('/').pop();
                                                                        const parts = raw.split('!');
                                                                        return parts.length > 1 ? parts.slice(1).join('!') : raw;
                                                                    })()}
                                                                </small>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-12">
                                                        <div className="form-group">
                                                            <label>Description</label><small className="req"> *</small>
                                                            <textarea
                                                                name="description"
                                                                className="form-control"
                                                                value={editFormData.description}
                                                                onChange={handleEditInputChange}
                                                            >
                                                            </textarea>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <div className="pull-right">
                                            <button type="submit" className="btn btn-info pull-right">Save</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade in"></div>
                </>
            )}

            {/* Evaluation Modal - Full Screen */}
            {evaluateModalOpen && evaluateData && (
                <>
                    <div className="modal fade in" style={{ display: 'block', zIndex: 1050, overflow: 'hidden' }}>
                        <div className="modal-dialog" style={{ width: '98%', maxWidth: '1400px', margin: '20px auto' }} role="document">
                            <div className="homework-card" style={{ border: '1px solid #3b82f6', borderRadius: '4px', overflow: 'hidden', height: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column' }}>
                                <div className="modal-header" style={{ background: '#6f42c1', color: '#fff', padding: '10px 15px 0px 15px', border: '1px solid #6f42c1', flexShrink: 0, minHeight: 0 }}>
                                    <button type="button" className="close" onClick={() => { setEvaluateModalOpen(false); setEvaluateData(null); }} style={{ color: '#fff', opacity: 0.9, fontSize: '22px', fontWeight: '500', marginTop: '0px', marginBottom: '-30px', padding: '0 4px', lineHeight: '1' }}>
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body" style={{ padding: 0, display: 'flex', flex: 1, overflow: 'hidden' }}>
                                    {/* Left Panel - Description */}
                                    <div style={{ flex: 1, padding: '20px', borderRight: '1px solid #eee', overflowY: 'auto' }}>
                                        <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Description:</p>
                                        <div style={{ fontSize: '13px', color: '#333' }} dangerouslySetInnerHTML={{ __html: evaluateData.description || 'No description available' }} />
                                    </div>
                                    {/* Right Panel - Summary */}
                                    <div style={{ width: '320px', minWidth: '280px', padding: '20px', background: '#fafafa', overflowY: 'auto', flexShrink: 0 }}>
                                        <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginTop: 0, marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Summary</h4>
                                        <div style={{ marginBottom: '12px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                                <i className="fa fa-calendar"></i>
                                                <b>Homework Date:</b>{evaluateData.date || '-'}
                                            </span>
                                        </div>
                                        <div style={{ marginBottom: '8px' }}>
                                            <b>Created By: </b>{evaluateData.assigned_by || '-'}
                                        </div>
                                        <div style={{ marginBottom: '8px' }}>
                                            <b>Class: </b>{evaluateData.class_name || '-'}
                                        </div>
                                        <div style={{ marginBottom: '8px' }}>
                                            <b>Section: </b>{evaluateData.section_name || '-'}
                                        </div>
                                        {evaluateData.document && (
                                            <div style={{ marginTop: '12px' }}>
                                                <b>Documents:</b>
                                                <div style={{ marginTop: '6px' }}>
                                                    <span style={{ fontSize: '13px', color: '#555' }}>
                                                        {(() => {
                                                            const raw = evaluateData.document.split('/').pop();
                                                            const parts = raw.split('!');
                                                            return parts.length > 1 ? parts.slice(1).join('!') : raw;
                                                        })()}
                                                    </span>
                                                    <div style={{ marginTop: '4px' }}>
                                                        <a
                                                            href={`https://newlayout.wisibles.com/studentdairy/download/${evaluateData.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="Download"
                                                            style={{ color: '#333', fontSize: '16px', cursor: 'pointer' }}
                                                        >
                                                            <i className="fa fa-download"></i>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade in" style={{ zIndex: 1040 }}></div>
                </>
            )}
            <Footer />
        </div>
    );
};

export default StudentDiaryList;
