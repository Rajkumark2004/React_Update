
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';
import '../../utils/include_files';
import { api } from '../../services/api';
import FileUpload from '../../components/FileUpload';

const StudentDiaryList = () => {
    const navigate = useNavigate();

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

    // Modal states
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [evaluateModalOpen, setEvaluateModalOpen] = useState(false);
    const [docsModalOpen, setDocsModalOpen] = useState(false);

    // Add Modal Form Data
    const [addFormData, setAddFormData] = useState({
        class_id: '',
        section_id: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        file: null
    });

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
                if (response && (response.data || response.class_sections)) {
                    const classList = response.data?.class_sections || response.class_sections || [];
                    setClasses(classList);
                }
            } catch (error) {
                console.error("Failed to fetch classes", error);
            } finally {
                setInitialLoading(false);
            }
        };
        fetchClasses();
    }, []);

    const fetchSections = async (classId) => {
        try {
            const response = await api.getSections();
            if (response && response.data) {
                setSections(response.data);
            } else if (Array.isArray(response)) {
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
        }

        if (name === 'class_id') {
            // Logic to populate sections for modal
            setAddFormData(prev => ({ ...prev, section_id: '' }));
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
            // assigned_by is required. Using a static value or fetching from session if available.
            // Postman example: "Super Admin(9000)"
            // For now, hardcoding or using a placeholder. Ideally should come from user session.
            submitData.append('assigned_by', 'Super Admin(9000)');

            if (addFormData.file) {
                submitData.append('userfile', addFormData.file);
            }

            await api.createStudentDiary(submitData);

            alert('Student diary saved successfully');
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
            // Match the body carefully as requested by user
            // User Postman body has: id, class_id, section_id, date, description
            // Check if file is selected
            if (editFormData.file) {
                const submitData = new FormData();
                submitData.append('id', editFormData.id);
                submitData.append('class_id', editFormData.class_id);
                submitData.append('section_id', editFormData.section_id);
                submitData.append('date', editFormData.date); // Standard HTML5 date is YYYY-MM-DD
                submitData.append('description', editFormData.description);
                submitData.append('userfile', editFormData.file);

                await api.updateStudentDiary(submitData);
            } else {
                // If no file, send exact JSON body as shown in user's Postman example
                const jsonBody = {
                    id: editFormData.id,
                    class_id: editFormData.class_id,
                    section_id: editFormData.section_id,
                    date: editFormData.date, // format: 2026-01-20
                    description: editFormData.description
                };
                await api.updateStudentDiary(jsonBody);
            }

            alert('Student diary updated successfully');
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

    const handleBack = () => {
        navigate(-1);
    }

    return (
        <div className="wrapper theme-white-skin">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '828px' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-flask"></i> Student Diary
                    </h1>
                </section>
                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            {initialLoading ? (
                                <Loader />
                            ) : (
                                <div className="box box-primary">
                                    <div className="box-header with-border">
                                        <h3 className="box-title"><i className="fa fa-search"></i> Select Criteria</h3>
                                        <div className="btn-group pull-right">
                                            <button onClick={handleBack} className="btn btn-primary btn-xs">
                                                <i className="fa fa-arrow-left"></i> Back
                                            </button>
                                        </div>
                                    </div>
                                    <form className="assign_teacher_form" onSubmit={handleSearch}>
                                        <div className="box-body">
                                            <div className="row">
                                                <div className="col-md-6 col-lg-6 col-sm-6">
                                                    <div className="form-group">
                                                        <label>Class</label><small className="req"> *</small>
                                                        <select
                                                            autoFocus=""
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
                                                <div className="col-md-6 col-lg-6 col-sm-6">
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
                                                                <option key={sec.section_id || sec.id} value={sec.section_id || sec.id}>{sec.section}</option>
                                                            ))}
                                                        </select>
                                                        <span className="section_id_error text-danger"></span>
                                                    </div>
                                                </div>
                                                {/* Hidden fields as per PHP */}
                                                <div className="col-md-3 col-lg-3 col-sm-6" style={{ display: 'none' }}>
                                                    <div className="form-group">
                                                        <label>Subject Group</label>
                                                        <select id="subject_group_id" name="subject_group_id" className="form-control">
                                                            <option value="">Select</option>
                                                        </select>
                                                        <span className="section_id_error text-danger"></span>
                                                    </div>
                                                </div>
                                                <div className="col-md-3 col-lg-3 col-sm-6" style={{ display: 'none' }}>
                                                    <div className="form-group">
                                                        <label>Subject</label>
                                                        <select id="subid" name="subject_id" className="form-control">
                                                            <option value="">Select</option>
                                                        </select>
                                                        <span className="section_id_error text-danger"></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button type="submit" id="search_filter" name="search" value="search_filter" className="btn btn-primary btn-sm checkbox-toggle pull-right">
                                                <i className="fa fa-search"></i> Search
                                            </button>
                                        </div>
                                    </form>
                                    <div>
                                        <div className="nav-tabs-custom theme-shadow">
                                            <div className="box-header with-border">
                                                <h3 className="box-title"><i className="fa fa-users"></i> Class wise assessment List</h3>
                                                <div className="box-tools pull-right">
                                                    <button onClick={openAddModal} type="button" className="btn btn-sm btn-primary modal_form">
                                                        <i className="fa fa-plus"></i> Add
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="box-body table-responsive">
                                                <div className="download_label"> Student Diary List</div>
                                                <div>
                                                    <table className="table table-striped table-bordered table-hover studentdairy-list">
                                                        <thead>
                                                            <tr>
                                                                <th>Class</th>
                                                                <th>Section</th>
                                                                <th>Date</th>
                                                                <th>Created By</th>
                                                                <th className="text-right noExport">Action</th>
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
                                                                diaryList.map(item => (
                                                                    <tr key={item.id}>
                                                                        <td>{item.class}</td>
                                                                        <td>{item.section}</td>
                                                                        <td>{item.date}</td>
                                                                        <td>{item.assigned_by}</td>
                                                                        <td className="text-right">
                                                                            <button className="btn btn-default btn-xs" title="Edit" onClick={() => handleEdit(item.id)}>
                                                                                <i className="fa fa-pencil"></i>
                                                                            </button>
                                                                            <button className="btn btn-default btn-xs" title="Delete" onClick={() => handleDelete(item.id)}>
                                                                                <i className="fa fa-remove"></i>
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                            <div className="box-footer">
                                                <div className="mailbox-controls">
                                                    <div className="pull-left">
                                                        {diaryList.length === 0 ? "Records 0 to 0 of 0" : `Records 1 to ${diaryList.length} of ${diaryList.length} `}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
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
                                                            <span id="name_add_error" className="text-danger"></span>
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
                                                                    <option key={sec.section_id || sec.id} value={sec.section_id || sec.id}>{sec.section}</option>
                                                                ))}
                                                            </select>
                                                            <span id="name_add_error" className="text-danger"></span>
                                                        </div>
                                                    </div>

                                                    <div className="col-sm-4">
                                                        <div className="form-group">
                                                            <label>Date</label><small className="req"> *</small>
                                                            <input
                                                                type="date" // Using basic date input for now
                                                                name="date"
                                                                className="form-control"
                                                                id="date"
                                                                value={addFormData.date}
                                                                readOnly
                                                            />
                                                            <span id="date_add_error" className="text-danger"></span>
                                                        </div>
                                                    </div>

                                                    <div className="col-sm-4">
                                                        <div className="form-group">
                                                            <FileUpload
                                                                label="Attach Document"
                                                                name="userfile"
                                                                onChange={handleAddInputChange}
                                                                selectedFile={addFormData.file}
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
                                                                    <option key={sec.section_id || sec.id} value={sec.section_id || sec.id}>{sec.section}</option>
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
                                                                onChange={handleEditInputChange}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-4">
                                                        <div className="form-group">
                                                            <FileUpload
                                                                label="Attach Document"
                                                                name="userfile"
                                                                onChange={handleEditInputChange}
                                                                selectedFile={editFormData.file}
                                                                existingFile={editFormData.existing_file}
                                                            />
                                                            {editFormData.existing_file && (
                                                                <small className="help-block">Current: {editFormData.existing_file}</small>
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
            <Footer />
        </div>
    );
};

export default StudentDiaryList;
