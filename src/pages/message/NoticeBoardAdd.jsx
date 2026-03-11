
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
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        publish_date: '',
        message: '',
        visible_student: false, // Checkbox state
        visible_parent: false, // Checkbox state
        roles: [], // Array of role IDs for dynamic roles
    });
    const [roles, setRoles] = useState([]); // To store fetched roles

    // Fetch roles on mount
    React.useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    if (user.roles && typeof user.roles === 'object') {
                        const extractedRoleId = Object.values(user.roles)[0];
                        if (extractedRoleId) {
                            const response = await api.getNoticeBoardList(extractedRoleId);
                            if (response && (response.status === true || response.status === 'success')) {
                                setRoles(response.roles || []);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        };
        fetchInitialData();
    }, []);


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

            // File Attachment
            if (selectedFile) {
                formPayload.append('file', selectedFile);
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
                                        <div className="box-tools pull-right">
                                            <button type="button" onClick={() => navigate(-1)} className="btn btn-primary btn-sm">
                                                <i className="fa fa-arrow-left"></i> Back
                                            </button>
                                        </div>
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
                                                            <div
                                                                style={{
                                                                    border: isDragging ? '2px dashed #3c8dbc' : '1px dashed #ccc',
                                                                    borderRadius: '4px',
                                                                    padding: '10px 15px',
                                                                    textAlign: 'center',
                                                                    cursor: 'pointer',
                                                                    background: isDragging ? '#f0f8ff' : '#fafafa',
                                                                    transition: 'all 0.2s',
                                                                    fontSize: '13px',
                                                                    color: '#888',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    gap: '8px'
                                                                }}
                                                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                                                onDragLeave={() => setIsDragging(false)}
                                                                onDrop={(e) => {
                                                                    e.preventDefault();
                                                                    setIsDragging(false);
                                                                    if (e.dataTransfer.files[0]) setSelectedFile(e.dataTransfer.files[0]);
                                                                }}
                                                                onClick={() => document.getElementById('notice-file-input').click()}
                                                            >
                                                                <input
                                                                    id="notice-file-input"
                                                                    type="file"
                                                                    style={{ display: 'none' }}
                                                                    onChange={(e) => { if (e.target.files[0]) setSelectedFile(e.target.files[0]); }}
                                                                />
                                                                {selectedFile ? (
                                                                    <>
                                                                        <i className="fa fa-paperclip" style={{ color: '#3c8dbc' }}></i>
                                                                        <span style={{ color: '#333' }}>{selectedFile.name}</span>
                                                                        <i
                                                                            className="fa fa-times-circle"
                                                                            style={{ color: '#d9534f', cursor: 'pointer', marginLeft: '4px' }}
                                                                            onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                                                                        ></i>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <i className="fa fa-cloud-upload"></i>
                                                                        <span>Drag & drop a file here or click to browse</span>
                                                                    </>
                                                                )}
                                                            </div>
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
