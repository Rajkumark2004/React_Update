import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../utils/include_files.js';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import { useSession } from '../../../context/SessionContext';
import api from '../../../services/api';

const AssignPickupPoint = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    // State for mock data
    const [assignments, setAssignments] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [pickupPointOptions, setPickupPointOptions] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentRouteId, setCurrentRouteId] = useState(null);

    // Form data for Add/Edit
    const [selectedRoute, setSelectedRoute] = useState('');
    const [pointRows, setPointRows] = useState([
        { id: Date.now(), pickup_point_id: '', distance: '', time: '', fees: '' }
    ]);

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

        // Mock Initial Data
        setRoutes([
            { id: 1, route_title: 'Route 1 - City Center' },
            { id: 2, route_title: 'Route 2 - North Park' },
            { id: 3, route_title: 'Route 3 - South Gate' }
        ]);

        setPickupPointOptions([
            { id: 101, name: 'Central Station' },
            { id: 102, name: 'North Avenue' },
            { id: 103, name: 'South Garden' },
            { id: 104, name: 'West End' },
            { id: 105, name: 'East Plaza' }
        ]);

        setAssignments([
            {
                transport_route_id: 1,
                route_title: 'Route 1 - City Center',
                point_list: [
                    { id: 101, pickup_point: 'Central Station', fees: '1500.00', destination_distance: '5.0', pickup_time: '07:30 AM' },
                    { id: 105, pickup_point: 'East Plaza', fees: '1200.00', destination_distance: '3.5', pickup_time: '07:45 AM' }
                ]
            },
            {
                transport_route_id: 2,
                route_title: 'Route 2 - North Park',
                point_list: [
                    { id: 102, pickup_point: 'North Avenue', fees: '1800.00', destination_distance: '8.0', pickup_time: '08:00 AM' }
                ]
            }
        ]);
    }, []);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    let filteredAssignments = assignments.filter(assignment =>
        assignment.route_title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig.key) {
        filteredAssignments.sort((a, b) => {
            let aValue, bValue;

            // Handle special cases because data is nested
            switch (sortConfig.key) {
                case 'route_title':
                    aValue = a.route_title;
                    bValue = b.route_title;
                    break;
                case 'pickup_point':
                    // Sort by first pickup point name for simplicity in nested structures
                    aValue = a.point_list[0]?.pickup_point || '';
                    bValue = b.point_list[0]?.pickup_point || '';
                    break;
                case 'fees':
                    // Sort by sum of fees? or first fee? Let's do first fee.
                    aValue = parseFloat(a.point_list[0]?.fees || 0);
                    bValue = parseFloat(b.point_list[0]?.fees || 0);
                    break;
                case 'distance':
                    aValue = parseFloat(a.point_list[0]?.destination_distance || 0);
                    bValue = parseFloat(b.point_list[0]?.destination_distance || 0);
                    break;
                case 'time':
                    aValue = a.point_list[0]?.pickup_time || '';
                    bValue = b.point_list[0]?.pickup_time || '';
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) {
            return <i className="fa fa-sort pull-right" style={{ color: '#ccc' }}></i>;
        }
        if (sortConfig.direction === 'asc') {
            return <i className="fa fa-sort-asc pull-right"></i>;
        }
        return <i className="fa fa-sort-desc pull-right"></i>;
    };


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

    // Modal Handlers
    const openAddModal = () => {
        setIsEditing(false);
        setSelectedRoute('');
        setPointRows([{ id: Date.now(), pickup_point_id: '', distance: '', time: '', fees: '' }]);
        setIsModalOpen(true);
    };

    const openEditModal = (assignment) => {
        setIsEditing(true);
        setSelectedRoute(assignment.transport_route_id);
        setCurrentRouteId(assignment.transport_route_id);

        // Map existing points to form rows
        const rows = assignment.point_list.map((p, index) => ({
            id: Date.now() + index,
            pickup_point_id: p.id, // Assuming mapping back via ID logic or name if needed. For mock, using name match or ID if available. 
            // In real app, point_list should have pickup_point_id. Here using existing logic.
            // Let's assume for mock we just map what we can.
            distance: p.destination_distance,
            time: p.pickup_time,
            fees: p.fees
        }));
        setPointRows(rows);
        setIsModalOpen(true);
    };

    const addPointRow = () => {
        setPointRows([...pointRows, { id: Date.now(), pickup_point_id: '', distance: '', time: '', fees: '' }]);
    };

    const removePointRow = (id) => {
        if (pointRows.length > 1) {
            setPointRows(pointRows.filter(row => row.id !== id));
        } else {
            alert('At least one pickup point is required');
        }
    };

    const handlePointChange = (id, field, value) => {
        setPointRows(pointRows.map(row =>
            row.id === id ? { ...row, [field]: value } : row
        ));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedRoute) {
            alert('Route is required');
            return;
        }

        // Mock save
        const routeName = routes.find(r => String(r.id) === String(selectedRoute))?.route_title || 'Unknown Route';
        const newAssignment = {
            transport_route_id: selectedRoute,
            route_title: routeName,
            point_list: pointRows.map(row => {
                const pPoint = pickupPointOptions.find(opt => String(opt.id) === String(row.pickup_point_id));
                return {
                    id: row.pickup_point_id, // using pickup ID as reference
                    pickup_point: pPoint ? pPoint.name : 'Unknown Point',
                    fees: row.fees || '0.00',
                    destination_distance: row.distance || '0',
                    pickup_time: row.time || '12:00 PM'
                };
            })
        };

        if (isEditing) {
            setAssignments(assignments.map(a =>
                String(a.transport_route_id) === String(currentRouteId) ? newAssignment : a
            ));
            alert('Record Updated Successfully');
        } else {
            // Check if route already assigned? (Mock skip)
            setAssignments([...assignments, newAssignment]);
            alert('Record Saved Successfully');
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            setAssignments(assignments.filter(a => a.transport_route_id !== id));
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
                currentUrl="/admin/vehroute"
            />

            <div className="content-wrapper">
                <section className="content-header">
                    <h1><i className="fa fa-bus"></i> Transport</h1>
                </section>
                <section className="content">
                    <div className="row" style={{ marginTop: '20px' }}>
                        <div className="col-md-12">
                            <div className="box box-primary" id="route">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Route Pickup Point</h3>
                                    <div className="box-tools pull-right">
                                        <div className="btn-group pull-right ml-lg-1">
                                            <button onClick={() => navigate(-1)} className="btn btn-primary btn-sm">
                                                <i className="fa fa-arrow-left"></i> Back
                                            </button>
                                        </div>
                                        <button type="button" onClick={openAddModal} className="btn btn-primary btn-sm checkbox-toggle pull-right" style={{ marginLeft: '4px' }}>
                                            <i className="fa fa-plus"></i> Add
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="mailbox-messages">
                                        <div className="download_label">Route Pickup Point</div>
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
                                            <table className="table table-striped table-bordered table-hover">
                                                <thead>
                                                    <tr>
                                                        <th style={{ cursor: 'pointer' }} onClick={() => requestSort('route_title')}>Route {getSortIcon('route_title')}</th>
                                                        <th style={{ cursor: 'pointer' }} onClick={() => requestSort('pickup_point')}>Pickup Point {getSortIcon('pickup_point')}</th>
                                                        <th className="text-right" style={{ cursor: 'pointer' }} onClick={() => requestSort('fees')}>Monthly Fees ($) <span className="pull-left">{getSortIcon('fees')}</span></th>
                                                        <th style={{ cursor: 'pointer' }} onClick={() => requestSort('distance')}>Distance (Km) {getSortIcon('distance')}</th>
                                                        <th style={{ cursor: 'pointer' }} onClick={() => requestSort('time')}>Pickup Time {getSortIcon('time')}</th>
                                                        <th className="text-right noExport">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredAssignments.length === 0 ? (
                                                        <tr><td colSpan="6" className="text-center">No Record Found</td></tr>
                                                    ) : (
                                                        filteredAssignments.map((data, index) => (
                                                            <tr key={index}>
                                                                <td className="mailbox-name"> {data.route_title}</td>
                                                                <td className="mailbox-name">
                                                                    <ul className="liststyle1" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                                        {data.point_list.map((pt, i) => (
                                                                            <li key={i}>{i + 1}. {pt.pickup_point}</li>
                                                                        ))}
                                                                    </ul>
                                                                </td>
                                                                <td className="mailbox-name text-right">
                                                                    <ul className="liststyle1 text-right" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                                        {data.point_list.map((pt, i) => (
                                                                            <li key={i}>{pt.fees}</li>
                                                                        ))}
                                                                    </ul>
                                                                </td>
                                                                <td>
                                                                    <ul className="liststyle1" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                                        {data.point_list.map((pt, i) => (
                                                                            <li key={i}>{pt.destination_distance}</li>
                                                                        ))}
                                                                    </ul>
                                                                </td>
                                                                <td>
                                                                    <ul className="liststyle1" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                                        {data.point_list.map((pt, i) => (
                                                                            <li key={i}>{pt.pickup_time}</li>
                                                                        ))}
                                                                    </ul>
                                                                </td>
                                                                <td className="mailbox-date pull-right no-print">
                                                                    <a className="btn btn-default btn-xs" data-toggle="tooltip" title="Reorder" onClick={() => setIsReorderModalOpen(true)}>
                                                                        <i className="fa fa-reorder"></i>
                                                                    </a>
                                                                    <a className="btn btn-default btn-xs" data-toggle="tooltip" title="Edit" onClick={() => openEditModal(data)}>
                                                                        <i className="fa fa-pencil"></i>
                                                                    </a>
                                                                    <a className="btn btn-default btn-xs" data-toggle="tooltip" title="Delete" onClick={() => handleDelete(data.transport_route_id)}>
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
                        <div className="modal-dialog modal-dialog2 modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <button type="button" className="close" onClick={() => setIsModalOpen(false)}>&times;</button>
                                    <h4 className="box-title">{isEditing ? 'Edit Route' : 'Add Route'}</h4>
                                </div>
                                <form id="form1" onSubmit={handleSubmit} acceptCharset="utf-8">
                                    <div className="modal-body">
                                        <div className="form-group">
                                            <label>Route List</label><small className="req"> *</small>
                                            <select
                                                className="form-control"
                                                value={selectedRoute}
                                                onChange={(e) => setSelectedRoute(e.target.value)}
                                            >
                                                <option value="">Select</option>
                                                {routes.map(r => (
                                                    <option key={r.id} value={r.id}>{r.route_title}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-12 pb10">
                                                <button type="button" className="btn btn-sm btn-info pull-right" onClick={addPointRow}>Add More</button>
                                            </div>
                                        </div>

                                        <div id="pickuppoint_result">
                                            {pointRows.map((row) => (
                                                <div className="row" key={row.id}>
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label>Pickup Point</label> <small className="req"> *</small>
                                                            <select
                                                                className="form-control"
                                                                value={row.pickup_point_id}
                                                                onChange={(e) => handlePointChange(row.id, 'pickup_point_id', e.target.value)}
                                                                style={{ width: '95%' }}
                                                            >
                                                                <option value="">Select</option>
                                                                {pickupPointOptions.map(opt => (
                                                                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Distance</label>
                                                            <div className="input-group">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    value={row.distance}
                                                                    onChange={(e) => handlePointChange(row.id, 'distance', e.target.value)}
                                                                />
                                                                <span className="input-group-addon">km</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-2">
                                                        <div className="form-group">
                                                            <label>Pickup Time</label> <small className="req"> *</small>
                                                            <div className="input-group">
                                                                <input
                                                                    className="form-control time"
                                                                    value={row.time}
                                                                    onChange={(e) => handlePointChange(row.id, 'time', e.target.value)}
                                                                />
                                                                <div className="input-group-addon"><span className="fa fa-clock-o"></span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-2">
                                                        <div className="form-group">
                                                            <label>Monthly Fees ($)</label> <small className="req"> *</small>
                                                            <input
                                                                className="form-control full-width"
                                                                value={row.fees}
                                                                onChange={(e) => handlePointChange(row.id, 'fees', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-1">
                                                        <div className="form-group text-center">
                                                            <label>&nbsp;</label>
                                                            <div
                                                                className="pt3 text-danger"
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => removePointRow(row.id)}
                                                            >
                                                                &nbsp;<i className="fa fa-remove"></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="modal-footer bg-white relative z-index-1 bordertoplightgray">
                                        <button type="submit" className="btn btn-info pull-right">Save</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade in"></div>
                </>
            )}

            {/* Reorder Modal (Visual only) */}
            {isReorderModalOpen && (
                <>
                    <div className="modal fade in" id="reorder" role="dialog" style={{ display: 'block', paddingRight: '17px' }}>
                        <div className="modal-dialog modal-dialog2 modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <button type="button" className="close" onClick={() => setIsReorderModalOpen(false)}>&times;</button>
                                    <h4 className="box-title">Order from School Location</h4>
                                </div>
                                <div className="scroll-area">
                                    <div className="modal-body">
                                        <div className="table-responsive mailbox-messages">
                                            <table className="table table-hover table-striped table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th>S.No.</th>
                                                        <th>Pickup Point</th>
                                                        <th>Distance (Km)</th>
                                                        <th>Pickup Time</th>
                                                        <th className="text-right">Monthly Fees ($)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {/* Mock Data for visual purpose */}
                                                    <tr>
                                                        <td>1</td>
                                                        <td>Central Station</td>
                                                        <td>5.0</td>
                                                        <td>07:30 AM</td>
                                                        <td className="text-right">1500.00</td>
                                                    </tr>
                                                    <tr>
                                                        <td>2</td>
                                                        <td>East Plaza</td>
                                                        <td>3.5</td>
                                                        <td>07:45 AM</td>
                                                        <td className="text-right">1200.00</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade in"></div>
                </>
            )}
        </div>
    );
};

export default AssignPickupPoint;
