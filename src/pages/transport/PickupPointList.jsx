import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../utils/include_files.js';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';
import api from '../../services/api';

const PickupPointList = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    // State for mock data
    const [pickupPoints, setPickupPoints] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        latitude: '',
        longitude: ''
    });

    const [searchTerm, setSearchTerm] = useState('');

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

        // Mock initial data
        setPickupPoints([
            { id: 1, name: 'Central Station', latitude: '12.9716', longitude: '77.5946' },
            { id: 2, name: 'North Avenue', latitude: '13.0827', longitude: '80.2707' },
            { id: 3, name: 'South Garden', latitude: '12.9141', longitude: '74.8560' }
        ]);
    }, []);

    const filteredPoints = pickupPoints.filter(point =>
        point.name.toLowerCase().includes(searchTerm.toLowerCase())
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

    // Corrected sidebar menu with icons based on user request mapping
    const sidebarMenus = [
        { id: 1, icon: 'helpdesk.png', label: 'Help Desk', url: '/admin/enquiry' },
        { id: 2, icon: 'sis.png', label: 'SIS', url: '/student/search' },
        { id: 3, icon: 'Fees.png', label: 'Fees', url: '#' },
        { id: 4, icon: 'attendance.png', label: 'Attendance', url: '/student-attendance' },
        { id: 5, icon: 'state_examination.png', label: 'State Examinations', url: '#' },
        { id: 6, icon: 'courses.png', label: 'Courses', url: '#' },
        { id: 7, icon: 'homework.png', label: 'Homework', url: '#' },
        { id: 8, icon: 'transport.png', label: 'Transport', url: '/admin/route', active: true },
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

    const openAddModal = () => {
        setIsEditing(false);
        setFormData({ name: '', latitude: '', longitude: '' });
        setCurrentId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (point) => {
        setIsEditing(true);
        setFormData({ name: point.name, latitude: point.latitude, longitude: point.longitude });
        setCurrentId(point.id);
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            alert('Name is required');
            return;
        }

        if (isEditing) {
            setPickupPoints(pickupPoints.map(p =>
                p.id === currentId ? { ...p, ...formData } : p
            ));
            alert('Record Updated Successfully');
        } else {
            const newPoint = {
                id: pickupPoints.length + 1,
                ...formData
            };
            setPickupPoints([...pickupPoints, newPoint]);
            alert('Record Saved Successfully');
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            setPickupPoints(prevPoints => prevPoints.filter(p => p.id !== id));
        }
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
                currentUrl="/admin/pickuppoint"
            />

            <div className="content-wrapper">
                <section className="content-header">
                    <h1> <i className="fa fa-bus"></i> Transport</h1>
                </section>
                <section className="content">
                    <div className="row" style={{ marginTop: '20px' }}>
                        <div className="col-md-12">
                            <div className="box box-primary" id="route">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Pickup Point List</h3>
                                    <div className="box-tools pull-right">
                                        <div className="btn-group pull-right ml-lg-1">
                                            <button onClick={() => navigate(-1)} className="btn btn-primary btn-sm">
                                                <i className="fa fa-arrow-left"></i> Back
                                            </button>
                                        </div>
                                        <button type="button" onClick={openAddModal} className="btn btn-primary btn-sm checkbox-toggle" style={{ marginLeft: '4px' }}>
                                            <i className="fa fa-plus"></i> Add
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="mailbox-controls">
                                        <div className="pull-right">
                                        </div>
                                    </div>
                                    <div className="mailbox-messages">
                                        <div className="download_label">Pickup Point List</div>
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
                                            <table className="table table-striped table-bordered table-hover list">
                                                <thead>
                                                    <tr>
                                                        <th>Pickup Point</th>
                                                        <th className="text-right">Latitude</th>
                                                        <th className="text-right">Longitude</th>
                                                        <th className="text-right noExport">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredPoints.length === 0 ? (
                                                        <tr><td colSpan="4" className="text-center">No Record Found</td></tr>
                                                    ) : (
                                                        filteredPoints.map((point) => (
                                                            <tr key={point.id}>
                                                                <td>
                                                                    <a href="#" className="pickup_map" onClick={(e) => { e.preventDefault(); alert('Map modal not implemented'); }}>
                                                                        {point.name}
                                                                    </a>
                                                                </td>
                                                                <td className="text-right">{point.latitude}</td>
                                                                <td className="text-right">{point.longitude}</td>
                                                                <td className="text-right noExport">
                                                                    <a className="btn btn-default btn-xs" data-toggle="tooltip" title="Edit" onClick={() => openEditModal(point)}>
                                                                        <i className="fa fa-pencil"></i>
                                                                    </a>
                                                                    <a className="btn btn-default btn-xs" data-toggle="tooltip" title="Delete" onClick={() => handleDelete(point.id)}>
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

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <>
                    <div className="modal fade in" id="add" role="dialog" style={{ display: 'block', paddingRight: '17px' }}>
                        <div className="modal-dialog modal-dialog2 modal-md">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <button type="button" className="close" onClick={() => setIsModalOpen(false)}>&times;</button>
                                    <h4 className="box-title" id="modal-title">{isEditing ? 'Edit Pickup Point' : 'Add Pickup Point'}</h4>
                                </div>
                                <form id="form1" name="employeeform" onSubmit={handleSubmit} acceptCharset="utf-8">
                                    <div className="modal-body">
                                        <div className="form-group">
                                            <label htmlFor="name">Pickup Point</label> <small className="req"> *</small>
                                            <input type="text" name="name" id="name" className="form-control" value={formData.name} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group">
                                            <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">Click here to get latitude and longitude</a>
                                            <div style={{ marginTop: '5px' }}>
                                                <label htmlFor="latitude">Latitude</label>
                                                <small className="req"> *</small>
                                                <input type="text" name="latitude" id="latitude" className="form-control" value={formData.latitude} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="longitude">Longitude</label> <small className="req"> *</small>
                                            <input type="text" name="longitude" id="longitude" className="form-control" value={formData.longitude} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="submit" className="btn btn-info pull-right" id="submit">Save</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade in"></div>
                </>
            )}
        </div>
    );
};

export default PickupPointList;
