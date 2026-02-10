import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import '../../utils/include_files.js';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';
import api from '../../services/api';

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

        // Fetch route list from API
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        try {
            const response = await api.getRouteList();
            if (response && response.listroute) {
                setRoutes(response.listroute);
            }
        } catch (error) {
            console.error('Error fetching routes:', error);
        }
    };

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



    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.route_title.trim()) {
            alert('Route Title is required');
            return;
        }

        if (isEditing) {
            try {
                const response = await api.updateRoute(editId, { route_title: formData.route_title });
                if (response.status === 'success' || response.status === true) {
                    alert('Record Updated Successfully');
                    fetchRoutes(); // Refresh the list
                    setFormData({ route_title: '' });
                    setIsEditing(false);
                    setEditId(null);
                } else {
                    alert(response.message || 'Failed to update route');
                }
            } catch (error) {
                console.error('Error updating route:', error);
                alert('An error occurred while updating route');
            }
        } else {
            try {
                const response = await api.createRoute({ route_title: formData.route_title });
                if (response.status === 'success' || response.status === true) {
                    alert('Record Saved Successfully');
                    fetchRoutes(); // Refresh the list
                    setFormData({ route_title: '' });
                } else {
                    alert(response.message || 'Failed to create route');
                }
            } catch (error) {
                console.error('Error creating route:', error);
                alert('An error occurred while creating route');
            }
        }
    };

    const handleEdit = async (route) => {
        try {
            const response = await api.getRouteDetails(route.id);
            if (response.status === true && response.data && response.data.editroute) {
                setFormData({ route_title: response.data.editroute.route_title });
                setIsEditing(true);
                setEditId(route.id);
            } else {
                alert('Failed to fetch route details');
            }
        } catch (error) {
            console.error('Error fetching route details:', error);
            alert('An error occurred while fetching route details');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                const response = await api.deleteRoute(id);
                if (response.status === 'success' || response.status === true) {
                    alert('Record Deleted Successfully');
                    fetchRoutes(); // Refresh the list
                } else {
                    alert(response.message || 'Failed to delete route');
                }
            } catch (error) {
                console.error('Error deleting route:', error);
                alert('An error occurred while deleting route');
            }
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
                                            <img src="https://newlayout.wisibles.com//backend/images/sidebar/submenu/transport/3.png" style={{ width: '20px', marginRight: '5px' }} /> Routes
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/vehicle">
                                            <img src="https://newlayout.wisibles.com//backend/images/sidebar/submenu/transport/4.png" style={{ width: '20px', marginRight: '5px' }} /> Vehicles
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/vehroute" className={getActiveMenu('/admin/vehroute')}>
                                            <img src="https://newlayout.wisibles.com//backend/images/sidebar/submenu/transport/5.png" style={{ width: '20px', marginRight: '5px' }} /> Assign Vehicle
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/pickuppoint" className={getActiveMenu('/admin/pickuppoint')}>
                                            <img src="https://newlayout.wisibles.com//backend/images/sidebar/submenu/transport/2.png" style={{ width: '20px', marginRight: '5px' }} /> Pickup Point
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/routepickuppoint" className={getActiveMenu('/admin/routepickuppoint')}>
                                            <img src="https://newlayout.wisibles.com//backend/images/sidebar/submenu/transport/6.png" style={{ width: '20px', marginRight: '5px' }} /> Route Pickup Point
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/transportFeeMaster" className={getActiveMenu('/admin/transportFeeMaster')}>
                                            <img src="https://newlayout.wisibles.com//backend/images/sidebar/submenu/transport/6.png" style={{ width: '20px', marginRight: '5px' }} /> Fees Master
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/studenttransportfee" className={getActiveMenu('/admin/studenttransportfee')}>
                                            <img src="https://newlayout.wisibles.com//backend/images/sidebar/submenu/transport/7.png" style={{ width: '20px', marginRight: '5px' }} /> Student Transport Fees
                                        </Link>
                                    </li>
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
