
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import api from '../../services/api';
import toast from 'react-hot-toast';

const NoticeBoardAdd = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        publish_date: '',
        message: '',
        visible_student: false, // Checkbox state
        visible_parent: false, // Checkbox state
        roles: [], // Array of role IDs for dynamic roles
        class_id: '',
        section_id: ''
    });
    const [roles, setRoles] = useState([]); // To store fetched roles
    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);

    // Fetch roles and classes on mount
    React.useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await api.getNoticeBoardAdd();
                if (response && response.status === true) {
                    const data = response.data || {};
                    // Set classlist from response
                    setClassList(data.classlist || []);
                    // Set roles from response
                    setRoles(data.roles || []);
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        };
        fetchInitialData();
    }, []);

    const handleClassChange = async (e) => {
        const classId = e.target.value;
        setFormData(prev => ({ ...prev, class_id: classId, section_id: '' }));
        setSectionList([]);

        if (classId) {
            try {
                const response = await api.getSectionsByClass(classId);
                if (response && response.status === 'success') {
                    const sections = response.data || [];
                    setSectionList(sections);
                }
            } catch (error) {
                console.error('Error fetching sections:', error);
                toast.error('Failed to fetch sections');
            }
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            if (name === 'visible[]') {
                // Handle dynamic roles checkbox array if implemented later
            } else {
                setFormData(prev => ({ ...prev, [name]: checked }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCheckboxChange = (roleId) => {
        setFormData(prev => {
            const newRoles = prev.roles.includes(roleId)
                ? prev.roles.filter(id => id !== roleId)
                : [...prev.roles, roleId];
            return { ...prev, roles: newRoles };
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Get user info from localStorage
            const userStr = localStorage.getItem('user');
            let createdBy = 'Super Admin';
            let createdId = '1';

            if (userStr) {
                const user = JSON.parse(userStr);
                createdBy = user.username || 'Super Admin';
                createdId = user.id || '1';
            }

            const formatDate = (dateStr) => {
                if (!dateStr) return '';
                const [year, month, day] = dateStr.split('-');
                return `${day}-${month}-${year}`;
            };

            // Create FormData
            const formPayload = new FormData();
            formPayload.append('title', formData.title);
            formPayload.append('date', formatDate(formData.date)); // Notice Date formatted as dd-mm-yyyy
            formPayload.append('publish_date', formatDate(formData.publish_date)); // Publish Date formatted as dd-mm-yyyy
            formPayload.append('message', formData.message);
            formPayload.append('created_by', createdBy);
            formPayload.append('created_id', createdId);

            if (formData.class_id) formPayload.append('class_id', formData.class_id);
            if (formData.section_id) formPayload.append('section_id', formData.section_id);

            // Visibility
            if (formData.visible_student) {
                formPayload.append('visible[]', 'student');
            }
            if (formData.visible_parent) {
                formPayload.append('visible[]', 'parent');
            }
            // Add other roles if needed
            formData.roles.forEach(roleId => {
                formPayload.append('visible[]', roleId);
            });

            // File Attachment if any (Assuming input name="file" is ref'd or controlled)
            // Note: In React controlled components, file input is tricky. 
            // Better to use a ref or uncontrolled input for file.
            const fileInput = document.querySelector('input[name="file"]');
            if (fileInput && fileInput.files[0]) {
                formPayload.append('file', fileInput.files[0]);
            }

            const response = await api.addNoticeBoard(formPayload);

            if (response && (response.status === true || response.status === 'success')) {
                toast.success('Message sent successfully');
                navigate('/admin/notification');
            } else {
                toast.error(response?.message || 'Failed to send message');
            }

        } catch (error) {
            console.error('Error adding notice:', error);
            toast.error('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '946px' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-commenting-o"></i> Compose New Message
                    </h1>
                </section>

                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <form onSubmit={handleSubmit}>
                                <div className="box box-primary">
                                    <div className="box-header with-border">
                                        <h3 className="box-title">Compose New Message</h3>
                                    </div>
                                    <div className="box-body">
                                        <div className="row">
                                            <div className="col-lg-9 col-md-9 col-sm-12">
                                                <div className="row">
                                                    <div className="col-md-12">
                                                        <div className="form-group">
                                                            <label>Title <small className="req">*</small></label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                name="title"
                                                                value={formData.title}
                                                                onChange={handleChange}
                                                                required
                                                                autoFocus
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Notice Date <small className="req">*</small></label>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                name="date"
                                                                value={formData.date}
                                                                onChange={handleChange}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Publish On <small className="req">*</small></label>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                name="publish_date"
                                                                value={formData.publish_date}
                                                                onChange={handleChange}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12">
                                                        <div className="form-group">
                                                            <label>Attachment</label>
                                                            <input type="file" className="form-control" name="file" />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Class <small className="req">*</small></label>
                                                            <select
                                                                className="form-control"
                                                                name="class_id"
                                                                value={formData.class_id || ''}
                                                                onChange={handleClassChange}
                                                                required
                                                            >
                                                                <option value="">Select</option>
                                                                {classList.map(cls => (
                                                                    <option key={cls.id} value={cls.id}>{cls.class}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Section <small className="req">*</small></label>
                                                            <select
                                                                className="form-control"
                                                                name="section_id"
                                                                value={formData.section_id || ''}
                                                                onChange={handleChange}
                                                                required
                                                            >
                                                                <option value="">Select</option>
                                                                {sectionList.map(sec => (
                                                                    <option key={sec.section_id} value={sec.section_id}>{sec.section}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12">
                                                        <div className="form-group">
                                                            <label>Message <small className="req">*</small></label>
                                                            <textarea
                                                                className="form-control"
                                                                name="message"
                                                                style={{ height: '300px' }}
                                                                value={formData.message}
                                                                onChange={handleChange}
                                                                required
                                                            ></textarea>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-3 col-md-3 col-sm-12">
                                                <div className="form-horizontal">
                                                    <label>Message To</label>
                                                    <div className="checkbox">
                                                        <label>
                                                            <input
                                                                type="checkbox"
                                                                name="visible_student"
                                                                checked={formData.visible_student}
                                                                onChange={handleChange}
                                                            /> <b>Student</b>
                                                        </label>
                                                    </div>
                                                    <div className="checkbox">
                                                        <label>
                                                            <input
                                                                type="checkbox"
                                                                name="visible_parent"
                                                                checked={formData.visible_parent}
                                                                onChange={handleChange}
                                                            /> <b>Parent</b>
                                                        </label>
                                                    </div>
                                                    {/* Dynamic Roles from API */}
                                                    {roles.map(role => (
                                                        <div key={role.id} className="checkbox">
                                                            <label>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={formData.roles.includes(role.id)}
                                                                    onChange={() => handleCheckboxChange(role.id)}
                                                                /> <b>{role.name}</b>
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <div className="pull-right">
                                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                                <i className="fa fa-envelope-o"></i> {loading ? 'Sending...' : 'Send'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default NoticeBoardAdd;
