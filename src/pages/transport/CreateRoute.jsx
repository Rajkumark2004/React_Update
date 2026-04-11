import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import '../../utils/include_files.js';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';
import api from '../../services/api';
import { buildExportData } from '../../utils/tableExport';
import TableToolbar from '../../utils/TableToolbar';
import Pagination from '../../utils/Pagination';

const CreateRoute = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentSession, clearSession } = useSession();

    // State for mock data
    const [routes, setRoutes] = useState([]);
    const [formData, setFormData] = useState({
        route_title: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

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
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);

    const filteredRoutes = routes.filter(route =>
        route.route_title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalItems = filteredRoutes.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentItems = filteredRoutes.slice(indexOfFirstItem, indexOfLastItem);


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

    const columns = [
        { key: 'route_title', label: 'Route Title' }
    ];
    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));

    const handleToggleColumn = (key) => {
        setVisibleColumns(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const formatCell = (row, key) => row[key] || '';
    const getExportData = () => buildExportData(columns, visibleColumns, filteredRoutes, formatCell);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const val = value.slice(0, 100);
        setFormData(prev => ({
            ...prev,
            [name]: val
        }));
        if (errors[name]) {
            setErrors(prev => {
                const n = { ...prev };
                delete n[name];
                return n;
            });
        }
    };

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
 
        if (!formData.route_title.trim()) {
            setErrors({ route_title: 'The Route Title field is required.' });
            return;
        }
 
        setSubmitting(true);
        try {
            if (isEditing) {
                const response = await api.updateRoute(editId, { route_title: formData.route_title });
                if (response.status === 'success' || response.status === true) {
                    toast.success('Record Updated Successfully');
                    fetchRoutes(); // Refresh the list
                    setFormData({ route_title: '' });
                    setIsEditing(false);
                    setEditId(null);
                } else if (response.status === 'fail') {
                    if (response.errors) setErrors(response.errors);
                    const errorMsg = response.message || (response.errors ? Object.values(response.errors)[0] : 'Failed to update route');
                    toast.error(errorMsg);
                } else {
                    toast.error(response.message || 'Failed to update route');
                }
            } else {
                const response = await api.createRoute({ route_title: formData.route_title });
                if (response.status === 'success' || response.status === true) {
                    toast.success('Record Saved Successfully');
                    fetchRoutes(); // Refresh the list
                    setFormData({ route_title: '' });
                } else if (response.status === 'fail') {
                    if (response.errors) setErrors(response.errors);
                    const errorMsg = response.message || (response.errors ? Object.values(response.errors)[0] : 'Failed to create route');
                    toast.error(errorMsg);
                } else {
                    toast.error(response.message || 'Failed to create route');
                }
            }
        } catch (error) {
            console.error('Error saving route:', error);
            toast.error(error.message || 'An error occurred while saving route');
        } finally {
            setSubmitting(false);
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
                toast.error('Failed to fetch route details');
            }
        } catch (error) {
            console.error('Error fetching route details:', error);
            toast.error('An error occurred while fetching route details');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                const response = await api.deleteRoute(id);
                if (response.status === 'success' || response.status === true) {
                    toast.success('Record Deleted Successfully');
                    fetchRoutes(); // Refresh the list
                } else {
                    toast.error(response.message || 'Failed to delete route');
                }
            } catch (error) {
                console.error('Error deleting route:', error);
                toast.error('An error occurred while deleting route');
            }
        }
    };

    // Helper for active menu class in sub-sidebar
    const getActiveMenu = (path) => {
        return location.pathname.includes(path) ? 'active' : '';
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <style>
                {`
                @media (max-width: 767px) {
                    .mobile-stack {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 15px;
                    }
                    .mobile-stack > div {
                        width: 100% !important;
                        text-align: center !important;
                    }
                    .mobile-stack .pull-right, .mobile-stack .pull-left {
                        float: none !important;
                    }
                    .mobile-stack .dt-buttons {
                        justify-content: center;
                    }
                }
                `}
            </style>
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

            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content-header">
                    <h1><i className="fa fa-bus"></i> Transport</h1>
                </section>
                <section className="content">
                    <div className="row" style={{ marginTop: '0px' }}>
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
                                    {/*<li>
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
                                    </li>*/}
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
                                            <input autoFocus="" id="route_title" name="route_title" placeholder="" type="text" className="form-control" value={formData.route_title} onChange={handleInputChange} maxLength={100} />
                                            {errors.route_title && <span className="text-danger" style={{ fontSize: '12px' }}>{errors.route_title}</span>}
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <button type="submit" className="btn btn-info pull-right" disabled={submitting}>
                                            {submitting ? 'Saving...' : 'Save'}
                                        </button>
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
                                    {/* Toolbar: Records, Search, Export Buttons */}
                                    <div style={{ padding: '8px 10px', borderBottom: '1px solid #f4f4f4' }}>
                                        <TableToolbar
                                            searchTerm={searchTerm}
                                            onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
                                            recordsPerPage={recordsPerPage}
                                            onRecordsPerPageChange={(val) => { setRecordsPerPage(val); setCurrentPage(1); }}
                                            columns={columns}
                                            visibleColumns={visibleColumns}
                                            onToggleColumn={handleToggleColumn}
                                            getExportData={getExportData}
                                            exportFileName="route_list"
                                            exportTitle="Route List"
                                        />
                                    </div>
                                        <div className="table-responsive overflow-visible">
                                            <table className="table table-striped table-bordered table-hover example">
                                                <thead>
                                                    <tr>
                                                        {visibleColumns.has('route_title') && <th style={{ width: '70%' }}>Route Title</th>}
                                                        <th className="text-right noExport">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentItems.length === 0 ? (
                                                        <tr><td colSpan="2" className="text-center">No Record Found</td></tr>
                                                    ) : (
                                                        currentItems.map((data) => (
                                                            <tr key={data.id}>
                                                                {visibleColumns.has('route_title') && <td className="mailbox-name" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}> {data.route_title}</td>}
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
                                        <div className="pt15 pb15" style={{ padding: '15px 0' }}>
                                            <Pagination 
                                                totalItems={totalItems} 
                                                itemsPerPage={recordsPerPage} 
                                                currentPage={currentPage}
                                                onPageChange={(page) => setCurrentPage(page)}
                                            />
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
