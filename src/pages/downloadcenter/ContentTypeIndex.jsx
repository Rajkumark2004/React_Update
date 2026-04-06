import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../utils/include_files.js';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';
import api from '../../services/api';

const ContentTypeIndex = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    // State for List Data
    const [contentTypes, setContentTypes] = useState([
        { id: 1, name: 'Assignment', description: 'Regular class assignments' },
        { id: 2, name: 'Syllabus', description: 'Yearly course syllabus' },
        { id: 3, name: 'Other Download', description: 'Miscellaneous downloads' }
    ]);

    // Search State
    const [searchTerm, setSearchTerm] = useState('');

    const filteredContentTypes = contentTypes.filter(type =>
        type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // State for Form Data
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Mock User Data
    const [loggedInUser, setLoggedInUser] = useState(null);
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setLoggedInUser(JSON.parse(storedUser));
            } catch (e) { }
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

    const sessionYear = currentSession?.session || '2024-25';

    // Main Sidebar Menus
    const sidebarMenus = [
        { id: 1, icon: 'helpdesk.png', label: 'Help Desk', url: '/admin/enquiry' },
        { id: 2, icon: 'sis.png', label: 'SIS', url: '/student/search' },
        { id: 3, icon: 'Fees.png', label: 'Fees Collection', url: '#' },
        { id: 4, icon: 'attendance.png', label: 'Attendance', url: '/student-attendance' },
        { id: 5, icon: 'state_examination.png', label: 'State Examinations', url: '#' },
        { id: 6, icon: 'courses.png', label: 'Courses', url: '#' },
        { id: 7, icon: 'homework.png', label: 'Homework', url: '#' },
        { id: 8, icon: 'transport.png', label: 'Transport', url: '#', active: false },
        { id: 9, icon: 'messages.png', label: 'Messages', url: '#' },
        { id: 10, icon: 'hr.png', label: 'Human Resource', url: '#' },
        { id: 11, icon: 'download_resouces.png', label: 'Download Center', url: '/admin/contenttype' },
        { id: 12, icon: 'certificate.png', label: 'Certificate', url: '#' },
        { id: 13, icon: 'income.png', label: 'Income', url: '#' },
        { id: 14, icon: 'expenses.png', label: 'Expenses', url: '#' },
        { id: 15, icon: 'hostle.png', label: 'Hostel', url: '#' },
        { id: 16, icon: 'reports.png', label: 'Reports', url: '#' },
        { id: 17, icon: 'settings.png', label: 'System Settings', url: '/settings' }
    ];

    const mobileNavItems = [
        { id: 1, icon: 'sis.png', label: 'SIS', url: '/student/search' },
        { id: 2, icon: 'Fees.png', label: 'Fees', url: '#' },
        { id: 3, icon: 'attendance.png', label: 'Attendance', url: '/student-attendance' },
        { id: 4, icon: 'settings.png', label: 'More', url: '/settings' },
        { id: 5, icon: 'logout', label: 'Logout', url: '#', isLogout: true }
    ];

    const handleLogout = async () => {
        try { await api.logout(); } catch (e) { }
        clearSession();
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Search triggered');
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        // Validation
        if (!formData.name) {
            setErrors({ name: 'The Name field is required.' });
            setLoading(false);
            return;
        }

        // Simulate API Save
        setTimeout(() => {
            setContentTypes([...contentTypes, { id: Date.now(), name: formData.name, description: formData.description }]);
            setFormData({ name: '', description: '' });
            setErrors({});
            setLoading(false);
        }, 500);
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <style>{`
                .content-wrapper { min-height: 90vh; background-color: #f4f6f9; }
                .box { position: relative; border-radius: 3px; background: #ffffff; border-top: 3px solid #d2d6de; margin-bottom: 20px; width: 100%; box-shadow: 0 1px 1px rgba(0,0,0,0.1); }
                .box.box-primary { border-top-color: #3c8dbc; }
                .box-header { color: #444; display: block; padding: 10px; position: relative; }
                .box-header.with-border { border-bottom: 1px solid #f4f4f4; }
                .box-title { display: inline-block; font-size: 18px; margin: 0; line-height: 1; }
                .box-body { border-top-left-radius: 0; border-top-right-radius: 0; border-bottom-right-radius: 3px; border-bottom-left-radius: 3px; padding: 10px; }
                .box-footer { border-top-left-radius: 0; border-top-right-radius: 0; border-bottom-right-radius: 3px; border-bottom-left-radius: 3px; border-top: 1px solid #f4f4f4; padding: 10px; background-color: #fff; }
                .form-group { margin-bottom: 15px; }
                label { display: inline-block; max-width: 100%; margin-bottom: 5px; font-weight: 700; }
                .form-control { display: block; width: 100%; height: 34px; padding: 6px 12px; font-size: 14px; line-height: 1.42857143; color: #555; background-color: #fff; background-image: none; border: none; border-bottom: 1px solid #ccc; border-radius: 0; box-shadow: none; transition: border-color ease-in-out .15s; }
                .form-control:focus { border-color: #3c8dbc; outline: none; }
                textarea.form-control { height: auto; }
                .btn-info { background-color: #00c0ef; border-color: #00acd6; color: #fff; }
                .pull-right { float: right!important; }
                .table-striped>tbody>tr:nth-of-type(odd) { background-color: #f9f9f9; }
                .table-bordered { border: 1px solid #f4f4f4; }
                .box.border0 { border-top: 0 !important; }
                .tablists { margin: 0; padding: 0; list-style: none; }
                .tablists li { display: block; border-bottom: 1px solid #f4f4f4; }
                .tablists li a { color: #444; display: block; padding: 10px 15px; text-decoration: none; }
                .tablists li a:hover { background: #f4f4f4; color: #333; }
                .tablists li.active a { background: #f4f4f4; border-left: 2px solid #3c8dbc; color: #333; }
                .req { color: red; }
                /* Icons */
                .fa-pencil, .fa-remove { cursor: pointer; color: #666; font-size: 14px; margin-right: 5px; }
                
                /* Toolbar Styles */
                .dt-buttons .btn { border: none; background: transparent; box-shadow: none; border-bottom: 1px solid #ccc; border-radius: 0; }
                .dt-buttons .btn:hover { background: #f0f0f0; }
                .mailbox-messages input[type="search"] { border: none; border-bottom: 1px solid #ccc; box-shadow: none; border-radius: 0; outline: none; }
                .mailbox-messages input[type="search"]:focus { border-bottom: 1px solid #3c8dbc; }
            `}</style>

            <Header appName="School Management System" userData={userData} pendingTasks={[]} handleLogout={handleLogout} />
            <Sidebar sidebarMenus={sidebarMenus} mobileNavItems={mobileNavItems} handleSearch={handleSearch} sessionYear={sessionYear} currentUrl="/admin/contenttype" />

            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-credit-card"></i> Expenses <small>Student Fee</small>
                    </h1>
                </section>

                <section className="content">
                    <div className="row" style={{ marginTop: '20px' }}>
                        {/* Sidebar Menu Column */}
                        <div className="col-md-2">
                            <div className="box border0">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Download Center</h3>
                                </div>
                                <ul className="tablists">
                                    <li>
                                        <Link to="/admin/contenttype" className="active" style={{ background: '#f4f4f4', borderLeft: '2px solid #3c8dbc' }}>
                                            <i className="fa fa-file-text-o" style={{ width: '20px' }}></i> Content Type
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/content/list">
                                            <i className="fa fa-share-alt" style={{ width: '20px' }}></i> Content Share List
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/content/upload">
                                            <i className="fa fa-upload" style={{ width: '20px' }}></i> Upload Content
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/video_tutorial">
                                            <i className="fa fa-video-camera" style={{ width: '20px' }}></i> Video Tutorial
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Add Content Type Form Column */}
                        <div className="col-md-4">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Add Content Type</h3>
                                </div>
                                <form id="form1" onSubmit={handleSubmit} acceptCharset="utf-8" encType="multipart/form-data">
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label htmlFor="name">Name</label> <small className="req">*</small>
                                            <input
                                                id="name"
                                                name="name"
                                                placeholder=""
                                                type="text"
                                                className="form-control"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                            />
                                            <span className="text-danger">{errors.name}</span>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="description">Description</label>
                                            <textarea
                                                className="form-control"
                                                id="description"
                                                name="description"
                                                rows="3"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                            ></textarea>
                                            <span className="text-danger"></span>
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <button type="submit" className="btn btn-info pull-right" id="submitbtn" disabled={loading}>
                                            {loading ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Content Type List Column */}
                        <div className="col-md-6">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Content Type List</h3>
                                    <div className="box-tools pull-right">
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="mailbox-messages">
                                        <div className="download_label">Content Type List</div>

                                        {/* Toolbar */}
                                        <div style={{ padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'inline-block' }}>
                                                <label style={{ margin: 0, fontWeight: 'normal' }}>Search: <input type="search" className="form-control input-sm" placeholder="" aria-controls="example" style={{ display: 'inline-block', width: 'auto' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></label>
                                            </div>

                                            <div className="dt-buttons btn-group" style={{ marginBottom: '0' }}>
                                                <button className="btn btn-default btn-sm" title="Copy"><i className="fa fa-copy"></i></button>
                                                <button className="btn btn-default btn-sm" title="Excel"><i className="fa fa-file-excel-o"></i></button>
                                                <button className="btn btn-default btn-sm" title="CSV"><i className="fa fa-file-text-o"></i></button>
                                                <button className="btn btn-default btn-sm" title="PDF"><i className="fa fa-file-pdf-o"></i></button>
                                                <button className="btn btn-default btn-sm" title="Print"><i className="fa fa-print"></i></button>
                                                <div className="btn-group">
                                                    <button className="btn btn-default btn-sm dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="Columns">
                                                        <i className="fa fa-columns"></i>
                                                    </button>
                                                    <ul className="dropdown-menu">
                                                        <li><a href="#">Name</a></li>
                                                        <li><a href="#">Description</a></li>
                                                        <li><a href="#">Action</a></li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="table-responsive overflow-visible">
                                            <table className="table table-striped table-bordered table-hover expense-list">
                                                <thead>
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Description</th>
                                                        <th className="text-right noExport">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredContentTypes.map((type) => (
                                                        <tr key={type.id}>
                                                            <td>{type.name}</td>
                                                            <td>{type.description}</td>
                                                            <td className="text-right noExport">
                                                                <a href="#" className="btn btn-default btn-xs" title="Edit" onClick={(e) => e.preventDefault()}>
                                                                    <i className="fa fa-pencil"></i>
                                                                </a>
                                                                <a href="#" className="btn btn-default btn-xs" title="Delete" onClick={(e) => e.preventDefault()}>
                                                                    <i className="fa fa-remove"></i>
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div style={{ padding: '5px' }}>
                                            Records: {filteredContentTypes.length > 0 ? 1 : 0} to {filteredContentTypes.length} of {filteredContentTypes.length}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <Footer />
            <div className="control-sidebar-bg"></div>
        </div>
    );
};

export default ContentTypeIndex;
