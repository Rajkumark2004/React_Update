import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import '../../../utils/include_files.js';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import { useSession } from '../../../context/SessionContext';
import { api } from '../../../services/api';

const SourceEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { currentSession, clearSession } = useSession();

    // Stats/Session info
    const sessionYear = currentSession?.session || '2024-25';
    const appName = 'School Management System';

    // Form State
    const [formData, setFormData] = useState({
        source: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // List State
    const [source_list, setSourceList] = useState([]);

    const fetchSourceList = async () => {
        try {
            const data = await api.getSourceList();
            setSourceList(data.data || []);
        } catch (error) {
            console.error('Fetch Error:', error);
            setMessage({ type: 'danger', text: 'Failed to fetch source list' });
        }
    };

    useEffect(() => {
        fetchSourceList();
    }, []);

    useEffect(() => {
        const sourceToEdit = source_list.find(item => item.id.toString() === id);
        if (sourceToEdit) {
            setFormData({
                source: sourceToEdit.source,
                description: sourceToEdit.description
            });
        }
    }, [id, source_list]);

    // Mock User Data
    const [loggedInUser, setLoggedInUser] = useState(null);
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setLoggedInUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse user data:', e);
            }
        }
    }, []);

    const userData = loggedInUser ? {
        name: loggedInUser.username,
        role: Object.keys(loggedInUser.roles || {})[0] || 'User',
        id: loggedInUser.id,
        avatar: loggedInUser.image || '/uploads/staff_images/default_male.jpg'
    } : {
        name: 'Admin User',
        role: 'Super Admin',
        id: 1,
        avatar: '/uploads/staff_images/default_male.jpg'
    };

    const pendingTasks = [];

    // Handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setLoading(true);

        try {
            const response = await api.updateSource(id, formData);
            setMessage({ type: 'success', text: response.message || 'Source updated successfully' });
            setTimeout(() => {
                navigate('/admin/source');
            }, 1000);
        } catch (error) {
            console.error('Update Error:', error);
            setMessage({ type: 'danger', text: error.message || 'An error occurred' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (deleteId) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            setMessage({ type: '', text: '' });
            setLoading(true);
            try {
                const response = await api.deleteSource(deleteId);
                setMessage({ type: 'success', text: response.message || 'Source deleted successfully' });
                // If we deleted the item we are currently editing, navigate back
                if (deleteId.toString() === id) {
                    setTimeout(() => navigate('/admin/source'), 1500);
                } else {
                    fetchSourceList();
                }
            } catch (error) {
                console.error('Delete Error:', error);
                setMessage({ type: 'danger', text: error.message || 'Failed to delete source' });
            } finally {
                setLoading(false);
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        clearSession();
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Searching...');
    };

    return (
        <div className="wrapper">
            <Header
                appName={appName}
                userData={userData}
                pendingTasks={pendingTasks}
                handleLogout={handleLogout}
            />

            <Sidebar
                handleSearch={handleSearch}
                sessionYear={sessionYear}
                currentUrl="/admin/source"
            />

            <div className="content-wrapper" style={{ minHeight: '710px', display: 'block' }}>
                <section className="content-header" style={{ display: 'block', padding: '15px 15px 0 15px' }}>
                </section>
                <section className="content" style={{ paddingBottom: '80px' }}>
                    <div className="row">
                        <div className="col-md-3">
                            <div className="box border0">
                                <ul className="tablists">
                                    <li><Link to="/admin/source" className="active">Source</Link></li>
                                    <li><Link to="/admin/reference">Reference</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Edit Source</h3>
                                    <div className="box-tools pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <form id="form1" onSubmit={handleSubmit} method="post" acceptCharset="utf-8" encType="multipart/form-data">
                                    <div className="box-body">
                                        {message.text && (
                                            <div className={`alert alert-${message.type} alert-dismissible`}>
                                                {message.text}
                                            </div>
                                        )}
                                        <div className="form-group">
                                            <label htmlFor="pwd">Source</label> <small className="req"> *</small>
                                            <input
                                                className="form-control"
                                                id="description"
                                                name="source"
                                                value={formData.source}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="pwd">Description</label>
                                            <textarea
                                                className="form-control"
                                                id="description"
                                                name="description"
                                                rows="3"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <button type="submit" className="btn btn-info pull-right" disabled={loading}>
                                            {loading ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-default pull-right"
                                            style={{ marginRight: '10px' }}
                                            onClick={() => navigate('/admin/source')}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="col-md-5">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Source List</h3>
                                </div>
                                <div className="box-body">
                                    <div className="mailbox-controls">
                                        <div className="pull-left">
                                            Records: 1 to {source_list.length} of {source_list.length}
                                        </div>
                                        <div className="pull-right">
                                            <div className="btn-group">
                                                <button type="button" className="btn btn-default btn-sm" title="Previous"><i className="fa fa-chevron-left"></i></button>
                                                <button type="button" className="btn btn-default btn-sm" title="Next"><i className="fa fa-chevron-right"></i></button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="download_label">Source List</div>
                                    <div className="table-responsive mailbox-messages overflow-visible">
                                        <table className="table table-hover table-striped table-bordered example">
                                            <thead>
                                                <tr>
                                                    <th>Source</th>
                                                    <th>Description</th>
                                                    <th className="text-right noExport">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {source_list.map((value, key) => (
                                                    <tr key={key}>
                                                        <td className="mailbox-name">{value.source}</td>
                                                        <td className="mailbox-name">{value.description}</td>
                                                        <td className="mailbox-date pull-right">
                                                            <Link to={`/admin/source/edit/${value.id}`} className="btn btn-default btn-xs" data-toggle="tooltip" title="Edit">
                                                                <i className="fa fa-pencil"></i>
                                                            </Link>
                                                            <Link to="#" onClick={() => handleDelete(value.id)} className="btn btn-default btn-xs" data-toggle="tooltip" title="Delete">
                                                                <i className="fa fa-remove"></i>
                                                            </Link>
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
        </div>
    );
};

export default SourceEdit;
