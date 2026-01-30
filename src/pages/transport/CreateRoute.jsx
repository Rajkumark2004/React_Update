import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import '../../../utils/include_files.js';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import { useSession } from '../../../context/SessionContext';
import api from '../../../services/api';

const CreateRoute = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentSession, clearSession } = useSession();

    // State for mock data
    const [routes, setRoutes] = useState([]);
    const [formData, setFormData] = useState({
        route_title: ''
    });

    const sessionYear = currentSession?.session || '2024-25';

    // User data for Header
    const [loggedInUser, setLoggedInUser] = useState(null);
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setLoggedInUser(JSON.parse(storedUser));
            } catch (e) { }
        }

        // Mock initial route data
        setRoutes([
            { id: 1, route_title: 'Route 1 - City Center' },
            { id: 2, route_title: 'Route 2 - North Park' },
            { id: 3, route_title: 'Route 3 - South Gate' }
        ]);
    }, []);

    const [searchTerm, setSearchTerm] = useState('');
    const filteredRoutes = routes.filter(route =>
        route.route_title.toLowerCase().includes(searchTerm.toLowerCase())
    );


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

    const handleLogout = async () => {
        try { await api.logout(); } catch (e) { }
        clearSession();
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Search');
    };

    const sidebarMenus = [
        { id: 1, icon: 'helpdesk.png', label: 'Help Desk', url: '/admin/enquiry' },
        { id: 2, icon: 'sis.png', label: 'SIS', url: '/student/search' },
        { id: 3, icon: 'Fees.png', label: 'Fees', url: '#' },
        { id: 4, icon: 'attendance.png', label: 'Attendance', url: '/student-attendance' },
        { id: 5, icon: 'state_examination.png', label: 'State Examinations', url: '#' },
        { id: 6, icon: 'courses.png', label: 'Courses', url: '#' },
        { id: 7, icon: 'homework.png', label: 'Homework', url: '#' },
        { id: 8, icon: 'transport.png', label: 'Transport', url: '#', active: true },
        { id: 9, icon: 'messages.png', label: 'Messages', url: '#' },
        { id: 10, icon: 'hr.png', label: 'Human Resource', url: '#' },
        { id: 11, icon: 'download_resouces.png', label: 'Download Center', url: '#' },
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.route_title.trim()) {
            alert('Route Title is required');
            return;
        }

        if (isEditing) {
            setRoutes(routes.map(route =>
                route.id === editId ? { ...route, route_title: formData.route_title } : route
            ));
            setIsEditing(false);
            setEditId(null);
            alert('Record Updated Successfully');
        } else {
            const newRoute = {
                id: routes.length + 1,
                route_title: formData.route_title
            };
            setRoutes([...routes, newRoute]);
            alert('Record Saved Successfully');
        }
        setFormData({ route_title: '' });
    };

    const handleEdit = (route) => {
        setFormData({ route_title: route.route_title });
        setIsEditing(true);
        setEditId(route.id);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            setRoutes(routes.filter(r => r.id !== id));
        }
    };

    // Helper for active menu class in sub-sidebar
    const getActiveMenu = (path) => {
        return location.pathname.includes(path) ? 'active' : '';
    };

    return (
        <div className="wrapper">
            <Header
                appName="School Management System"
                userData={userData}
                pendingTasks={[]}
                handleLogout={handleLogout}
            />

            <Sidebar
                sidebarMenus={sidebarMenus}
                mobileNavItems={mobileNavItems}
                handleSearch={handleSearch}
                sessionYear={sessionYear}
                currentUrl="/admin/route"
            />

            <div className="content-wrapper">
                <section className="content-header">
                    <h1><i className="fa fa-bus"></i> Transport</h1>
                </section>
                <section className="content">
                    <div className="row" style={{ marginTop: '20px' }}>
                        {/* Sub-Sidebar */}
                        <div className="col-md-2">
                            <div className="box border0">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Transport</h3>
                                </div>
                                <ul className="tablists">
                                    <li className={getActiveMenu('/admin/route')}>
                                        <Link to="/admin/route" className={getActiveMenu('/admin/route')}>
                                            <i className="fa fa-map-signs" style={{ width: '20px' }}></i> Routes
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/vehicle">
                                            <i className="fa fa-bus" style={{ width: '20px' }}></i> Vehicles
                                        </Link>
                                    </li>
                                    <li><a href="#"><i className="fa fa-exchange" style={{ width: '20px' }}></i> Assign Vehicle</a></li>
                                    <li><a href="#"><i className="fa fa-map-marker" style={{ width: '20px' }}></i> Pickup Point</a></li>
                                    <li><a href="#"><i className="fa fa-location-arrow" style={{ width: '20px' }}></i> Route Pickup Point</a></li>
                                    <li><a href="#"><i className="fa fa-money" style={{ width: '20px' }}></i> Fees Master</a></li>
                                    <li><a href="#"><i className="fa fa-user" style={{ width: '20px' }}></i> Student Transport Fees</a></li>
                                </ul>
                            </div>
                        </div>

                        {/* Create Route Form */}
                        <div className="col-md-4">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Create Route</h3>
                                </div>
                                <form id="form1" onSubmit={handleSubmit} name="employeeform" acceptCharset="utf-8">
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label htmlFor="exampleInputEmail1">Route Title</label><small className="req"> *</small>
                                            <input autoFocus="" id="route_title" name="route_title" placeholder="" type="text" className="form-control" value={formData.route_title} onChange={handleInputChange} />
                                            <span className="text-danger"></span>
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <button type="submit" className="btn btn-info pull-right">Save</button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Route List */}
                        <div className="col-md-6">
                            <div className="box box-primary" id="route">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Route List</h3>
                                </div>
                                <div className="box-body">
                                    <div className="mailbox-controls">
                                        <div className="pull-right">
                                        </div>
                                    </div>
                                    <div className="mailbox-messages">
                                        <div className="download_label">Route List</div>
                                        <div className="row" style={{ marginBottom: '10px' }}>
                                            <div className="col-sm-6">
                                                <div className="pull-left">
                                                    <label>Search:
                                                        <input
                                                            type="search"
                                                            className="form-control input-sm"
                                                            placeholder=""
                                                            aria-controls="DataTables_Table_0"
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                            style={{ display: 'inline-block', width: 'auto', marginLeft: '10px' }}
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="dt-buttons btn-group pull-right">
                                                    <button className="btn btn-default btn-xs" title="Copy" style={{ border: '0', background: 'transparent' }}>
                                                        <i className="fa fa-file-text-o"></i>
                                                    </button>
                                                    <button className="btn btn-default btn-xs" title="CSV" style={{ border: '0', background: 'transparent' }}>
                                                        <i className="fa fa-file-text-o"></i>
                                                    </button>
                                                    <button className="btn btn-default btn-xs" title="Excel" style={{ border: '0', background: 'transparent' }}>
                                                        <i className="fa fa-file-excel-o"></i>
                                                    </button>
                                                    <button className="btn btn-default btn-xs" title="Print" style={{ border: '0', background: 'transparent' }}>
                                                        <i className="fa fa-print"></i>
                                                    </button>
                                                    <button className="btn btn-default btn-xs" title="PDF" style={{ border: '0', background: 'transparent' }}>
                                                        <i className="fa fa-file-pdf-o"></i>
                                                    </button>
                                                    <button className="btn btn-default btn-xs" title="Columns" style={{ border: '0', background: 'transparent' }}>
                                                        <i className="fa fa-columns"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="table-responsive overflow-visible">
                                            <table className="table table-striped table-bordered table-hover example">
                                                <thead>
                                                    <tr>
                                                        <th>Route Title</th>
                                                        <th className="text-right noExport">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredRoutes.length === 0 ? (
                                                        <tr><td colSpan="2" className="text-center">No Record Found</td></tr>
                                                    ) : (
                                                        filteredRoutes.map((data) => (
                                                            <tr key={data.id}>
                                                                <td className="mailbox-name"> {data.route_title}</td>
                                                                <td className="mailbox-date pull-right no-print">
                                                                    <a className="btn btn-default btn-xs" data-toggle="tooltip" title="Edit" onClick={() => handleEdit(data)}>
                                                                        <i className="fa fa-pencil"></i>
                                                                    </a>
                                                                    <a className="btn btn-default btn-xs" data-toggle="tooltip" title="Delete" onClick={() => handleDelete(data.id)}>
                                                                        <i className="fa fa-remove"></i>
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
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

export default CreateRoute;
