import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import ContentSidebar from './ContentSidebar';
import { useSession } from '../../context/SessionContext';
import { api } from '../../services/api';

const CreateContent = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();
    const sessionYear = currentSession?.session || '2024-25';

    const handleLogout = () => {
        clearSession();
        localStorage.removeItem('isLoggedIn');
        navigate('/');
    };

    const userData = JSON.parse(localStorage.getItem('user')) || {
        name: 'Admin User',
        role: 'Super Admin',
        avatar: '/uploads/staff_images/default_male.jpg'
    };

    const [formData, setFormData] = useState({
        title: '',
        class: '',
        section: [],
        type: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        file: null
    });

    const [contentList, setContentList] = useState([]);
    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [isSectionOpen, setIsSectionOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.getContentList();
            setContentList(response.data.list || []);
            setClassList(response.data.classlist || []);
        } catch (error) {
            console.error('Error fetching content:', error);
            // toast.error('Failed to fetch content list');
        } finally {
            setLoading(false);
        }
    };

    const handleClassChange = async (e) => {
        const classId = e.target.value;
        setFormData({ ...formData, class: classId, section: [] }); // Reset section when class changes

        if (classId) {
            try {
                const response = await api.getSectionsByClass(classId);
                setSectionList(response.data || []);
            } catch (error) {
                console.error('Error fetching sections:', error);
                setSectionList([]);
            }
        } else {
            setSectionList([]);
        }
    };

    const toggleSection = (id) => {
        setFormData(prev => {
            const sections = prev.section.some(sid => String(sid) === String(id))
                ? prev.section.filter(sid => String(sid) !== String(id))
                : [...prev.section, String(id)];
            return { ...prev, section: sections };
        });
    };

    const toggleSelectAll = () => {
        setFormData(prev => {
            const allIds = sectionList.map(s => String(s.section_id));
            const sections = prev.section.length === sectionList.length ? [] : allIds;
            return { ...prev, section: sections };
        });
    };



    const handleInputChange = (e) => {
        const { name, value } = e.target; // Removed 'options' as it's not used for non-multi-selects
        if (name === 'class') {
            handleClassChange(e);
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, file: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submitData = new FormData();
            submitData.append('content_title', formData.title);
            submitData.append('content_type', formData.type);
            
            // Get user info from localStorage
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                submitData.append('created_by', user.id || '1');
            }

            // Hardcoded as per requirement/API expectation for now, or based on user role? 
            // The payload example showed ["student"].
            submitData.append('content_available[]', 'student');
            submitData.append('content_available[]', 'Super Admin');
            submitData.append('class_id', formData.class);
            if (formData.section && formData.section.length > 0) {
                formData.section.forEach(secId => {
                    submitData.append('section[]', secId);
                });
            }

            // Format date to DD-MM-YYYY
            const dateObj = new Date(formData.date);
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const year = dateObj.getFullYear();
            const formattedDate = `${day}-${month}-${year}`;

            submitData.append('upload_date', formattedDate);
            submitData.append('note', formData.description);
            submitData.append('visibility', 'No'); // Defaulting to No as per payload example

            if (formData.file) {
                submitData.append('file', formData.file);
            }

            await api.saveContent(submitData);
            alert('Content Uploaded Successfully');

            // Reset form
            setFormData({
                title: '',
                class: '',
                section: [],
                type: '',
                date: new Date().toISOString().split('T')[0],
                description: '',
                file: null
            });

            // Refresh list
            fetchData();
        } catch (error) {
            console.error('Error saving content:', error);
            alert('Failed to save content: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (id, title) => {
        try {
            await api.downloadContent(id, title); // Pass title as filename if needed, or api handles it
            // toast.success(`Downloaded ${title}`);
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download content');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this content?')) {
            try {
                await api.deleteContent(id);
                // Refresh the list
                fetchData();
                alert('Content deleted successfully');
            } catch (error) {
                console.error('Delete error:', error);
                alert('Failed to delete content: ' + error.message);
            }
        }
    };

    return (
        <div className="wrapper">
            <Header appName="School Management System" userData={userData} handleLogout={handleLogout} />
            <Sidebar sessionYear={sessionYear} currentUrl="/admin/content/createcontent" />

            <div className="content-wrapper">
                <section className="content-header">
                    <h1>
                        <i className="fa fa-download"></i> Upload Content
                    </h1>
                </section>

                <section className="content">
                    <div className="row">
                        <div className="col-md-3">
                            <ContentSidebar />
                        </div>
                        <div className="col-md-9">
                            <div className="row">
                                <div className="col-md-5">
                                    <div className="box box-primary">
                                        <div className="box-header with-border">
                                            <h3 className="box-title">Upload Content</h3>
                                        </div>
                                        <form onSubmit={handleSubmit} id="upload_form">
                                            <div className="box-body">
                                                <div className="form-group">
                                                    <label>Content Title</label> <small className="req"> *</small>
                                                    <input type="text" className="form-control" name="title" value={formData.title} onChange={handleInputChange} placeholder="Enter Content Title" required />
                                                </div>
                                                <div className="form-group">
                                                    <label>Class</label> <small className="req"> *</small>
                                                    <select className="form-control" name="class" value={formData.class} onChange={handleInputChange} required>
                                                        <option value="">Select</option>
                                                        {classList.map((cls) => (
                                                            <option key={cls.id} value={cls.id}>{cls.class}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label>Section</label>
                                                    <div id="checkbox-dropdown-container">
                                                        <div className="custom-select" id="custom-select" onClick={() => setIsSectionOpen(!isSectionOpen)}>
                                                            {formData.section.length > 0 ? `${formData.section.length} Selected` : "Select"}
                                                        </div>
                                                        {isSectionOpen && (
                                                            <div className="custom-select-option-box" id="custom-select-option-box" style={{ display: 'block' }}>
                                                                <div className="custom-select-option checkbox">
                                                                    <label className="vertical-middle line-h-18">
                                                                        <input
                                                                            className="custom-select-option-checkbox select_all"
                                                                            type="checkbox"
                                                                            name="select_all"
                                                                            id="select_all"
                                                                            checked={sectionList.length > 0 && formData.section.length === sectionList.length}
                                                                            onChange={toggleSelectAll}
                                                                        /> Select All
                                                                    </label>
                                                                </div>
                                                                {sectionList.map(s => (
                                                                    <div key={s.section_id} className="custom-select-option checkbox">
                                                                        <label className="vertical-middle line-h-18">
                                                                            <input
                                                                                className="custom-select-option-checkbox"
                                                                                type="checkbox"
                                                                                name="section[]"
                                                                                checked={formData.section.some(sec => String(sec) === String(s.section_id))}
                                                                                onChange={() => toggleSection(s.section_id)}
                                                                            /> {s.section}
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label>Content Type</label> <small className="req"> *</small>
                                                    <select className="form-control" name="type" value={formData.type} onChange={handleInputChange} required>
                                                        <option value="">Select</option>
                                                        <option value="Assignments">Assignments</option>
                                                        <option value="Study Material">Study Material</option>
                                                        <option value="Syllabus">Syllabus</option>
                                                        <option value="Other Download">Other Download</option>
                                                        <option value="work_sheets">Worksheets</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label>Upload Date</label> <small className="req"> *</small>
                                                    <input type="date" className="form-control" name="date" value={formData.date} onChange={handleInputChange} required />
                                                </div>
                                                <div className="form-group">
                                                    <label>Description</label>
                                                    <textarea className="form-control" name="description" value={formData.description} onChange={handleInputChange} rows="3" placeholder="Enter Description"></textarea>
                                                </div>
                                                <div className="form-group">
                                                    <label>Content File</label>
                                                    <input type="file" className="form-control" name="file" onChange={handleFileChange} />
                                                </div>
                                            </div>
                                            <div className="box-footer">
                                                <button type="submit" className="btn btn-info pull-right">Save</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                <div className="col-md-7">
                                    <div className="box box-primary">
                                        <div className="box-header ptbnull">
                                            <h3 className="box-title titlefix">Content List</h3>
                                        </div>
                                        <div className="box-body">
                                            <div className="table-responsive mailbox-messages">
                                                <div className="download_label">Content List</div>
                                                <table className="table table-striped table-bordered table-hover example">
                                                    <thead>
                                                        <tr>
                                                            <th>Content Title</th>
                                                            <th>Type</th>
                                                            <th>Date</th>
                                                            <th>Class</th>
                                                            <th>Available For</th>
                                                            <th className="text-right">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {contentList.map((item) => (
                                                            <tr key={item.id}>
                                                                <td className="mailbox-name">
                                                                    <a href="#" onClick={(e) => { e.preventDefault(); handleDownload(item.id, item.title); }}>{item.title}</a>
                                                                </td>
                                                                <td className="mailbox-name">{item.type}</td>
                                                                <td className="mailbox-name">{item.date}</td>
                                                                <td className="mailbox-name">{item.class}</td>
                                                                <td className="mailbox-name">{item.role}</td>
                                                                <td className="mailbox-date pull-right">
                                                                    <a href="#" className="btn btn-default btn-xs" data-toggle="tooltip" title="Download" onClick={(e) => { e.preventDefault(); handleDownload(item.id, item.title); }}>
                                                                        <i className="fa fa-download"></i>
                                                                    </a>
                                                                    <a href="#" className="btn btn-default btn-xs" data-toggle="tooltip" title="Edit" onClick={() => navigate(`/admin/content/edit/${item.id}`)}>
                                                                        <i className="fa fa-pencil"></i>
                                                                    </a>
                                                                    <button className="btn btn-default btn-xs" data-toggle="tooltip" title="Delete" onClick={() => handleDelete(item.id)}>
                                                                        <i className="fa fa-remove"></i>
                                                                    </button>
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
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default CreateContent;
