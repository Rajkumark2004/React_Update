import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import ContentSidebar from './ContentSidebar';
import { useSession } from '../../context/SessionContext';
import { api } from '../../services/api';

const EditContent = () => {
    const { id } = useParams();
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
        section: '',
        type: '',
        date: '',
        description: '',
        file: null
    });

    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch content list and class list from the same endpoint used in CreateContent
            const response = await api.getContentList();

            if (response.data && response.data.list) {
                const item = response.data.list.find(c => c.id == id);
                if (item) {
                    console.log('Found item:', item);
                    setFormData({
                        title: item.title,
                        class: item.class_id,
                        section: item.section || '', // Use section if available directly, or might need to be derived
                        type: item.type,
                        date: item.date, // Assuming date is in YYYY-MM-DD
                        description: item.note || '',
                        file: null // Files usually not pre-filled in file input
                    });

                    // Fetch sections for the valid class
                    if (item.class_id) {
                        try {
                            const sectionResponse = await api.getSectionsByClass(item.class_id);
                            setSectionList(sectionResponse.data || []);
                        } catch (err) {
                            console.error('Error fetching sections for edit:', err);
                        }
                    }
                }
            }

            if (response.data && response.data.classlist) {
                setClassList(response.data.classlist);
            }

        } catch (error) {
            console.error('Error fetching data for edit:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClassChange = async (e) => {
        const classId = e.target.value;
        setFormData({ ...formData, class: classId, section: '' });

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
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
            submitData.append('id', id);
            submitData.append('content_title', formData.title);
            submitData.append('content_type', formData.type);
            submitData.append('content_available[]', 'student'); // Hardcoded based on prev example/requirement
            // Additional roles? "student", "parent" mentioned in prompt
            // submitData.append('content_available[]', 'parent');

            submitData.append('class_id', formData.class);

            // Section logic might differ if multiple allowed, assuming single for now based on UI
            // If multiple sections were selected in original data (cls_sec_id), we might need to handle that.
            // For now, mapping simple single section selection.
            submitData.append('section', formData.section);

            // Format date to DD-MM-YYYY
            const dateObj = new Date(formData.date);
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const year = dateObj.getFullYear();
            const formattedDate = `${day}-${month}-${year}`;

            submitData.append('upload_date', formattedDate);
            submitData.append('note', formData.description);

            if (formData.file) {
                submitData.append('file', formData.file);
            }

            await api.updateContent(submitData);
            alert('Content Updated Successfully');
            navigate('/admin/content/createcontent');
        } catch (error) {
            console.error('Error updating content:', error);
            alert('Failed to update content: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="wrapper">
            <Header appName="School Management System" userData={userData} handleLogout={handleLogout} />
            <Sidebar sessionYear={sessionYear} currentUrl="/admin/content/edit" />

            <div className="content-wrapper">
                <section className="content-header">
                    <h1>
                        <i className="fa fa-download"></i> Edit Content
                    </h1>
                </section>

                <section className="content">
                    <div className="row">
                        <div className="col-md-3">
                            <ContentSidebar />
                        </div>
                        <div className="col-md-9">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Edit Content</h3>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label>Content Title</label> <small className="req"> *</small>
                                            <input type="text" className="form-control" name="title" value={formData.title} onChange={handleInputChange} required />
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
                                            <select className="form-control" name="section" value={formData.section} onChange={handleInputChange}>
                                                <option value="">Select</option>
                                                {sectionList.map((sec) => (
                                                    <option key={sec.section_id} value={sec.section_id}>{sec.section}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Content Type</label> <small className="req"> *</small>
                                            <select className="form-control" name="type" value={formData.type} onChange={handleInputChange} required>
                                                <option value="">Select</option>
                                                <option value="Assignments">Assignments</option>
                                                <option value="Study Material">Study Material</option>
                                                <option value="Syllabus">Syllabus</option>
                                                <option value="Other Download">Other Download</option>
                                                <option value="Worksheets">Worksheets</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Upload Date</label> <small className="req"> *</small>
                                            <input type="date" className="form-control" name="date" value={formData.date} onChange={handleInputChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Description</label>
                                            <textarea className="form-control" name="description" value={formData.description} onChange={handleInputChange} rows="3"></textarea>
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
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default EditContent;
