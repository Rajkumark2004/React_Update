import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams, Link } from 'react-router-dom';
import '../../../utils/include_files.js';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import { useSession } from '../../../context/SessionContext';
import { api } from '../../../services/api';

const ReferenceEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { currentSession, clearSession } = useSession();

    // Stats/Session info
    const sessionYear = currentSession?.session || '2024-25';
    const appName = 'School Management System';

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

    // Form State
    const [formData, setFormData] = useState({
        reference: '',
        description: ''
    });

    // List State
    const [reference_list, setReferenceList] = useState([]);

    useEffect(() => {
        fetchReferenceList();
    }, []);

    const fetchReferenceList = async () => {
        try {
            const data = await api.getReferenceList();
            if (data.status && data.data) {
                setReferenceList(data.data);
            }
        } catch (error) {
            console.error('Error fetching reference list:', error);
        }
    };

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (reference_list.length > 0) {
            const referenceToEdit = reference_list.find(item => item.id.toString() === id);
            if (referenceToEdit) {
                setFormData({
                    reference: referenceToEdit.reference,
                    description: referenceToEdit.description
                });
            }
        }
    }, [id, reference_list]);

    // Handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.updateReference(id, formData);
            if (response.status) {
                navigate('/admin/reference');
            }
        } catch (error) {
            console.error('Error updating reference:', error);
            alert('Failed to update reference');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                const response = await api.deleteReference(id);
                if (response.status) {
                    toast.success('Reference deleted successfully');
                    await fetchReferenceList(); // Refresh list
                }
            } catch (error) {
                console.error('Error deleting reference:', error);
                toast.error('Failed to delete reference');
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

    useEffect(() => {
        if (window.$ && window.$.fn && window.$.fn.popover) {
            window.$('.detail_popover').popover({
                placement: 'right',
                trigger: 'hover',
                container: 'body',
                html: true,
                content: function () {
                    return window.$(this).closest('td').find('.fee_detail_popover').html();
                }
            });
        }
    }, [reference_list]);

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
                currentUrl="/admin/reference"
            />

            <div className="content-wrapper" style={{ minHeight: '710px', display: 'block' }}>
                <section className="content-header" style={{ display: 'block', padding: '15px 15px 0 15px' }}>

                </section>
                <section className="content" style={{ paddingBottom: '80px' }}>
                    <div className="row">
                        <div className="col-md-2">
                            <div className="box border0">
                                <ul className="tablists">
                                    <li><Link to="#">Purpose</Link></li>
                                    <li><Link to="#">Complaint Type</Link></li>
                                    <li><Link to="/admin/source">Source</Link></li>
                                    <li><Link to="/admin/reference" className="active">Reference</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Edit Reference</h3>
                                    <div className="box-tools pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <form id="form1" onSubmit={handleSubmit} method="post" acceptCharset="utf-8" encType="multipart/form-data">
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label htmlFor="pwd">Reference</label> <small className="req"> *</small>
                                            <input
                                                className="form-control"
                                                id="description"
                                                name="reference"
                                                value={formData.reference}
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
                                        <button type="submit" className="btn btn-info pull-right">Save</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Reference List</h3>
                                    <div className="box-tools pull-right">
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="download_label">Reference List</div>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="pull-left mb10">
                                                <div className="input-group">
                                                    <input
                                                        type="text"
                                                        className="form-control input-sm"
                                                        placeholder="Search..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        style={{ width: '200px' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="table-responsive mailbox-messages overflow-visible">
                                        <table className="table table-hover table-striped table-bordered example">
                                            <thead>
                                                <tr>
                                                    <th>Reference</th>
                                                    <th>Description</th>
                                                    <th className="text-right noExport">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reference_list
                                                    .filter(item =>
                                                        item.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                        item.description.toLowerCase().includes(searchTerm.toLowerCase())
                                                    )
                                                    .map((value, key) => (
                                                        <tr key={key}>
                                                            <td className="mailbox-name">{value.reference}</td>
                                                            <td className="mailbox-name">{value.description}</td>
                                                            <td className="mailbox-date pull-right">
                                                                <Link to={`/admin/reference/edit/${value.id}`} className="btn btn-default btn-xs" data-toggle="tooltip" title="Edit">
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

export default ReferenceEdit;
