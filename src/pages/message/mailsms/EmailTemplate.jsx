import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import toast from 'react-hot-toast';

const EmailTemplate = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ id: '', title: '', message: '' });

    useEffect(() => {
        // Mock data - replace with API call
        setTemplates([
            { id: 1, title: 'Welcome Email', message: '<p>Welcome to our school!</p>' },
            { id: 2, title: 'Fee Reminder', message: '<p>Please pay your fees by end of month.</p>' }
        ]);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAdd = () => {
        setFormData({ id: '', title: '', message: '' });
        setShowAddModal(true);
    };

    const handleEdit = (template) => {
        setFormData({ id: template.id, title: template.title, message: template.message });
        setShowEditModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            setTemplates(prev => prev.filter(t => t.id !== id));
            toast.success('Template deleted');
        }
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.message) {
            toast.error('Title and Message are required');
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setTemplates(prev => [...prev, { id: Date.now(), title: formData.title, message: formData.message }]);
            toast.success('Template added');
            setShowAddModal(false);
            setLoading(false);
        }, 500);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.message) {
            toast.error('Title and Message are required');
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setTemplates(prev => prev.map(t => t.id === formData.id ? { ...t, title: formData.title, message: formData.message } : t));
            toast.success('Template updated');
            setShowEditModal(false);
            setLoading(false);
        }, 500);
    };

    const sidebarLinks = [
        { icon: 'fa fa-bullhorn', label: 'Notice Board', path: '/admin/notification' },
        { icon: 'fa fa-envelope', label: 'Send Email', path: '/admin/mailsms/compose' },
        { icon: 'fa fa-mobile', label: 'Send SMS', path: '/admin/mailsms/compose_sms' },
        { icon: 'fa fa-list', label: 'Email/SMS Log', path: '/admin/mailsms' },
        { icon: 'fa fa-clock-o', label: 'Schedule Log', path: '/admin/mailsms/schedule' },
        { icon: 'fa fa-file-text-o', label: 'Email Template', path: '/admin/mailsms/email_template', active: true },
        { icon: 'fa fa-file-o', label: 'SMS Template', path: '/admin/mailsms/sms_template' }
    ];

    return (
        <>
            <Header />
            <Sidebar />
            <div className="content-wrapper">
                <section className="content">
                    <div className="row">
                        <div className="col-md-3">
                            <div className="box box-solid">
                                <div className="box-header with-border"><h3 className="box-title">Communicate</h3></div>
                                <div className="box-body no-padding">
                                    <ul className="nav nav-pills nav-stacked">
                                        {sidebarLinks.map((link, i) => (
                                            <li key={i} className={link.active ? 'active' : ''}>
                                                <Link to={link.path}><i className={link.icon}></i> {link.label}</Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-9">
                            <div className="box box-info">
                                <div className="box-header">
                                    <h3 className="box-title">Email Template List</h3>
                                    <div className="box-tools pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-sm" style={{ marginRight: '5px' }}>
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                        <button className="btn btn-primary btn-sm" onClick={handleAdd}>
                                            <i className="fa fa-plus"></i> Add
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="table-responsive">
                                        <table className="table table-striped table-bordered table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Title</th>
                                                    <th>Message</th>
                                                    <th className="text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {templates.map(t => (
                                                    <tr key={t.id}>
                                                        <td>{t.title}</td>
                                                        <td dangerouslySetInnerHTML={{ __html: t.message }}></td>
                                                        <td className="text-right">
                                                            <button className="btn btn-default btn-xs" onClick={() => handleEdit(t)} title="Edit">
                                                                <i className="fa fa-pencil"></i>
                                                            </button>
                                                            <button className="btn btn-default btn-xs" onClick={() => handleDelete(t.id)} title="Delete">
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
                </section>
            </div>
            <Footer />

            {/* Add Modal */}
            {showAddModal && (
                <div className="modal fade in" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" onClick={() => setShowAddModal(false)}>&times;</button>
                                <h4 className="modal-title">Add Email Template</h4>
                            </div>
                            <form onSubmit={handleAddSubmit}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Title <small className="text-danger">*</small></label>
                                        <input type="text" className="form-control" name="title" value={formData.title} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Attachment</label>
                                        <input type="file" className="form-control" multiple />
                                    </div>
                                    <div className="form-group">
                                        <label>Message <small className="text-danger">*</small></label>
                                        <textarea className="form-control" rows="10" name="message" value={formData.message} onChange={handleInputChange}></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="submit" className="btn btn-info" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="modal fade in" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" onClick={() => setShowEditModal(false)}>&times;</button>
                                <h4 className="modal-title">Edit Email Template</h4>
                            </div>
                            <form onSubmit={handleEditSubmit}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Title <small className="text-danger">*</small></label>
                                        <input type="text" className="form-control" name="title" value={formData.title} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Attachment</label>
                                        <input type="file" className="form-control" multiple />
                                    </div>
                                    <div className="form-group">
                                        <label>Message <small className="text-danger">*</small></label>
                                        <textarea className="form-control" rows="10" name="message" value={formData.message} onChange={handleInputChange}></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="submit" className="btn btn-info" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EmailTemplate;
