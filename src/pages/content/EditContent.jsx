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

    const [formData, setFormData] = useState({
        title: '',
        class: '',
        section: [],
        type: '',
        date: '',
        description: '',
        file: null
    });

    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [isSectionOpen, setIsSectionOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch content details by ID
            const response = await api.getContentById(id);

            if (response && response.status && response.data) {
                const item = response.data;
                console.log('Fetched content item:', item);
                setFormData({
                    title: item.title || '',
                    class: item.class_id || '',
                    // Note: API returns cls_sec_id, mapping it to section array
                    section: item.cls_sec_id ? (String(item.cls_sec_id).split(',').map(s => s.trim())) : [],
                    type: item.type || '',
                    date: item.date || '',
                    description: item.note || '',
                    file: null
                });

                // Fetch sections for the class
                if (item.class_id) {
                    try {
                        const sectionResponse = await api.getSectionsByClass(item.class_id);
                        setSectionList(sectionResponse.data || []);
                    } catch (err) {
                        console.error('Error fetching sections for edit:', err);
                    }
                }
            }

            // Also need classList for the dropdown
            const listResponse = await api.getContentList();
            if (listResponse.data && listResponse.data.classlist) {
                setClassList(listResponse.data.classlist);
            }

        } catch (error) {
            console.error('Error fetching data for edit:', error);
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

            // Get user info from localStorage
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                submitData.append('created_by', user.id || '1');
            }

            submitData.append('content_available[]', 'student'); // Hardcoded based on prev example/requirement
            submitData.append('content_available[]', 'Super Admin');
            // Additional roles? "student", "parent" mentioned in prompt
            // submitData.append('content_available[]', 'parent');

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
            <Header />
            <Sidebar />

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
                                                <option value="work_sheet">Worksheets</option>
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
