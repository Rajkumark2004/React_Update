
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import api from '../../services/api';
import toast from 'react-hot-toast';

const NoticeBoardEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        publish_date: '',
        message: '',
        visible_student: false,
        visible_parent: false,
        roles: [],
        class_id: '',
        section_id: '',
        prev_roles: [] // To store previously assigned roles from API
    });
    const [roles, setRoles] = useState([]);
    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);

    // Fetch initial data and existing notice data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // 1. Fetch Add Data (Roles, ClassList) - using getNoticeBoardAdd as per discussion
                const addResponse = await api.getNoticeBoardAdd();
                if (addResponse && addResponse.status === true) {
                    const addData = addResponse.data || {};
                    setClassList(addData.classlist || []);
                    setRoles(addData.roles || []);
                }

                // 2. Fetch Existing Notice Data
                if (id) {
                    // Get roleId from localStorage
                    const userStr = localStorage.getItem('user');
                    let roleId = '7'; // Default to Super Admin (7) if not found
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        // User roles is an object like {"Super Admin": "7"}
                        // We need to take the first value
                        if (user.roles && typeof user.roles === 'object') {
                            const roleValues = Object.values(user.roles);
                            if (roleValues.length > 0) {
                                roleId = roleValues[0];
                            }
                        }
                    }

                    const response = await api.getNoticeBoard(id, roleId); // Pass roleId
                    if (response && response.status === true) {
                        const data = response.data;
                        const notification = data.notification;
                        // Helper to format date YYYY-MM-DD from API date
                        const formatDateForInput = (dateStr) => {
                            if (!dateStr) return '';
                            // Assuming API might return YYYY-MM-DD directly or formatted.
                            // Adjust based on actual API response if needed.
                            // PHP Code uses: date($this->customlib->getSchoolDateFormat(), $this->customlib->dateyyyymmddTodateformat($notification['date']))
                            // We need YYYY-MM-DD for input type="date"
                            return dateStr;
                        };

                        setFormData({
                            title: notification.title || '',
                            date: notification.date || '', // Assign directly if YYYY-MM-DD
                            publish_date: notification.publish_date || '', // Assign directly if YYYY-MM-DD
                            message: notification.message || '',
                            visible_student: notification.visible_student === 'Yes',
                            visible_parent: notification.visible_parent === 'Yes',
                            roles: notification.roles ? notification.roles.split(',') : [],
                            // Note: API response might not return class_id/section_id if not stored directly effectively
                            // But roles are stored as comma separated string
                            prev_roles: notification.roles ? notification.roles.split(',') : []
                        });
                    }
                }

            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load data');
            }
        };
        fetchInitialData();
    }, [id]);


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCheckboxChange = (roleId) => {
        setFormData(prev => {
            // Check if roleId is in prev.roles array (handling both string/number types safely)
            const roleIdStr = String(roleId);
            const isSelected = prev.roles.some(r => String(r) === roleIdStr);

            const newRoles = isSelected
                ? prev.roles.filter(id => String(id) !== roleIdStr)
                : [...prev.roles, roleIdStr];
            return { ...prev, roles: newRoles };
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Get user info and roleId from localStorage
            const userStr = localStorage.getItem('user');
            let createdBy = 'Super Admin';
            let createdId = '1';
            let roleId = '7'; // Default to Super Admin (7)

            if (userStr) {
                const user = JSON.parse(userStr);
                createdBy = user.username || 'Super Admin';
                createdId = user.id || '1';

                if (user.roles && typeof user.roles === 'object') {
                    const roleValues = Object.values(user.roles);
                    if (roleValues.length > 0) {
                        roleId = roleValues[0];
                    }
                }
            }

            const formatDate = (dateStr) => {
                if (!dateStr) return '';
                const [year, month, day] = dateStr.split('-');
                return `${day}-${month}-${year}`;
            };


            const formPayload = new FormData();
            formPayload.append('title', formData.title);
            formPayload.append('date', formatDate(formData.date));
            formPayload.append('publish_date', formatDate(formData.publish_date));
            formPayload.append('message', formData.message);
            formPayload.append('created_by', createdBy);
            formPayload.append('created_id', createdId);

            // Previous roles (hidden inputs in PHP)
            formData.prev_roles.forEach(roleId => {
                formPayload.append('prev_roles[]', roleId);
            });

            // Visibility
            if (formData.visible_student) {
                formPayload.append('visible[]', 'student');
            }
            if (formData.visible_parent) {
                formPayload.append('visible[]', 'parent');
            }
            // Add other roles
            formData.roles.forEach(roleId => {
                formPayload.append('visible[]', roleId);
            });

            // File Attachment
            const fileInput = document.querySelector('input[name="file"]');
            if (fileInput && fileInput.files[0]) {
                formPayload.append('file', fileInput.files[0]);
            }

            const response = await api.updateNoticeBoard(id, roleId, formPayload);

            if (response && (response.status === true || response.status === 'success')) {
                toast.success('Message updated successfully');
                navigate('/admin/notification');
            } else {
                toast.error(response?.message || 'Failed to update message');
            }

        } catch (error) {
            console.error('Error updating notice:', error);
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
                        <i className="fa fa-commenting-o"></i> Edit Message
                    </h1>
                </section>

                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <form onSubmit={handleSubmit}>
                                <div className="box box-primary">
                                    <div className="box-header with-border">
                                        <h3 className="box-title">Edit Message</h3>
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
                                                    {/* Note: Edit Notification PHP does not show Class/Section dropdowns, only Title, Dates, File, Message and Roles */}

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
                                                                    checked={formData.roles.some(r => String(r) === String(role.id))}
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

export default NoticeBoardEdit;
