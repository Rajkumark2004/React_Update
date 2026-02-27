import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import '../../utils/include_files';

const NotificationAddEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    // Form states
    const [formData, setFormData] = useState({
        title: '',
        date: new Date().toISOString().split('T')[0],
        publish_date: new Date().toISOString().split('T')[0],
        class_id: '',
        section_id: '',
        message: '',
        file: null
    });

    // Data states
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(false);

    // Initialize data
    useEffect(() => {
        const initializeData = async () => {
            setLoading(true);
            try {
                // Fetch Classes
                const classResponse = await api.getClasses();
                if (classResponse && (classResponse.classsectionlist || classResponse.data)) {
                    const classesData = classResponse.classsectionlist || classResponse.data || [];
                    setClasses(Array.isArray(classesData) ? classesData : []);
                }

                if (isEditMode) {
                    // Extract role ID from user login response to fetch the notice board list
                    const userStr = localStorage.getItem('user');
                    let roleId = '7'; // Default
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        const roles = user.roles || {};
                        const extractedRoleId = Object.values(roles)[0];
                        if (extractedRoleId) roleId = extractedRoleId;
                    }

                    // Fetch the List and find the notification by ID
                    const response = await api.getNoticeBoardList(roleId);
                    if (response && response.status && response.data) {
                        const list = response.data.notification_list || response.data.notificationlist || [];
                        const notification = list.find(n => n.id === id);

                        if (notification) {
                            // Strip HTML tags if message contains <p> but we might be rendering raw, wait, we are using textarea, so basic clean up
                            // or just assign as is if wait, 'message' textarea might show <p> tags. We'll assign directly as in response for now
                            setFormData({
                                title: notification.title || '',
                                date: notification.date || new Date().toISOString().split('T')[0],
                                publish_date: notification.publish_date || new Date().toISOString().split('T')[0],
                                class_id: notification.class_id || '',
                                section_id: notification.section_id || '',
                                message: notification.message || '',
                                file: null // We do not set the file object from an existing URL natively with <input type="file">
                            });

                            // Pre-fetch sections if class is set
                            if (notification.class_id) {
                                const sectionRes = await api.getSectionsByClass(notification.class_id);
                                if (sectionRes && sectionRes.status === 'success' && sectionRes.data) {
                                    setSections(sectionRes.data);
                                } else if (Array.isArray(sectionRes)) {
                                    setSections(sectionRes);
                                } else if (sectionRes && sectionRes.sections) {
                                    setSections(sectionRes.sections);
                                } else {
                                    setSections(sectionRes.data || []);
                                }
                            }
                        } else {
                            toast.error('Notification not found!');
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
                toast.error('Failed to load edit information');
            } finally {
                setLoading(false);
            }
        };

        initializeData();
    }, [id, isEditMode]);

    const handleClassChange = async (e) => {
        const classId = e.target.value;
        setFormData({ ...formData, class_id: classId, section_id: '' });
        setSections([]);

        if (classId) {
            try {
                const response = await api.getSectionsByClass(classId);
                if (response && response.status === 'success' && response.data) {
                    setSections(response.data);
                } else if (Array.isArray(response)) {
                    setSections(response);
                } else if (response && response.sections) {
                    setSections(response.sections);
                } else {
                    setSections(response.data || []);
                }
            } catch (error) {
                console.error('Error fetching sections:', error);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, file: e.target.files[0] });
    };

    const handleDelete = async () => {
        if (!id) return;
        if (window.confirm('Are you sure you want to delete this circular?')) {
            try {
                const response = await api.deleteNotification(id);
                if (response.status === true || response.status === 'success') {
                    toast.success('Circular deleted successfully');
                    navigate('/admin/notification_class/index');
                } else {
                    toast.error(response.message || 'Failed to delete circular');
                }
            } catch (error) {
                console.error('Error deleting circular:', error);
                toast.error('An error occurred while deleting');
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            console.log('Form Submitted:', formData);
            setLoading(false);
            alert(`Circular ${isEditMode ? 'updated' : 'added'} successfully!`);
            navigate('/admin/notification');
        }, 1000);
    };

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '658px', marginTop: '0px' }}>
                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <form id="form1" onSubmit={handleSubmit} className="form-horizontal">
                                <div className="box box-primary">
                                    <div className="box-header with-border">
                                        <h3 className="box-title">
                                            <i className="fa fa-commenting-o"></i> {isEditMode ? 'Edit Circular' : 'New Circular'}
                                        </h3>
                                        <div className="box-tools pull-right">
                                            <button type="button" onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                                <i className="fa fa-arrow-left"></i> Back
                                            </button>
                                        </div>
                                    </div>
                                    <div className="box-body">
                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <label className="col-sm-2 control-label">Title <small className="req">*</small></label>
                                                    <div className="col-sm-10">
                                                        <input
                                                            type="text"
                                                            name="title"
                                                            className="form-control"
                                                            value={formData.title}
                                                            onChange={handleInputChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="col-sm-4 control-label">Circular Date <small className="req">*</small></label>
                                                    <div className="col-sm-8">
                                                        <input
                                                            type="date"
                                                            name="date"
                                                            className="form-control"
                                                            value={formData.date}
                                                            onChange={handleInputChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="col-sm-4 control-label">Publish On <small className="req">*</small></label>
                                                    <div className="col-sm-8">
                                                        <input
                                                            type="date"
                                                            name="publish_date"
                                                            className="form-control"
                                                            value={formData.publish_date}
                                                            onChange={handleInputChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="col-sm-4 control-label">Class <small className="req">*</small></label>
                                                    <div className="col-sm-8">
                                                        <select
                                                            name="class_id"
                                                            className="form-control"
                                                            value={formData.class_id}
                                                            onChange={handleClassChange}
                                                            required
                                                        >
                                                            <option value="">Select</option>
                                                            {classes.map(c => (
                                                                <option key={c.id} value={c.id}>{c.class}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label className="col-sm-4 control-label">Section <small className="req">*</small></label>
                                                    <div className="col-sm-8">
                                                        <select
                                                            name="section_id"
                                                            className="form-control"
                                                            value={formData.section_id}
                                                            onChange={handleInputChange}
                                                            required
                                                        >
                                                            <option value="">Select</option>
                                                            {sections.map(s => (
                                                                <option key={s.section_id || s.id} value={s.section_id || s.id}>{s.section}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <label className="col-sm-2 control-label">Attachment</label>
                                                    <div className="col-sm-10">
                                                        <input
                                                            type="file"
                                                            className="form-control"
                                                            onChange={handleFileChange}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <label className="col-sm-2 control-label">Message <small className="req">*</small></label>
                                                    <div className="col-sm-10">
                                                        <textarea
                                                            name="message"
                                                            className="form-control"
                                                            style={{ height: '200px' }}
                                                            value={formData.message}
                                                            onChange={handleInputChange}
                                                            required
                                                        ></textarea>
                                                        <p className="help-block">You can use a WYSIWYG editor here in the future.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <div className="pull-right">
                                            {isEditMode && (
                                                <button
                                                    type="button"
                                                    onClick={handleDelete}
                                                    className="btn btn-default"
                                                    style={{ marginRight: '5px' }}
                                                >
                                                    <i className="fa fa-trash-o"></i> Delete
                                                </button>
                                            )}
                                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                                <i className="fa fa-envelope-o"></i> {loading ? 'Sending...' : (isEditMode ? 'Update' : 'Send')}
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

export default NotificationAddEdit;
