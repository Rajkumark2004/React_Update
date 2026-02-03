import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../utils/include_files.js';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';
import api from '../../services/api';

const VehicleList = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    // State for mock data (replicating listVehicle)
    const [vehicles, setVehicles] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        vehicle_no: '',
        vehicle_model: '',
        manufacture_year: '',
        registration_number: '',
        chasis_number: '',
        max_seating_capacity: '',
        driver_name: '',
        driver_licence: '',
        driver_contact: '',
        vehicle_photo: null,
        note: ''
    });

    // Mock session year
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

        // Fetch vehicle list from API
        fetchVehicleList();
    }, []);

    const fetchVehicleList = async () => {
        try {
            const response = await api.getVehicleList();
            if (response && response.data) {
                setVehicles(response.data);
            } else if (response && response.vehiclelist) {
                setVehicles(response.vehiclelist);
            } else if (Array.isArray(response)) {
                // Handle if response is just an array
                setVehicles(response);
            }
        } catch (error) {
            console.error('Error fetching vehicle list:', error);
        }
    };

    // Search state
    const [searchTerm, setSearchTerm] = useState('');

    // Filter vehicles logic
    const filteredVehicles = vehicles.filter(vehicle =>
        Object.values(vehicle).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
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
        { id: 3, icon: 'Fees.png', label: 'Fees Collection', url: '#' },
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
        const { name, value, type, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'file' ? files[0] : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response;
            if (editingId) {
                response = await api.updateVehicle(editingId, formData);
            } else {
                response = await api.addVehicle(formData);
            }

            if (response.status) {
                alert(editingId ? 'Vehicle Updated Successfully' : 'Vehicle Added Successfully');
                handleCloseModal();
                fetchVehicleList(); // Refresh list
            } else {
                alert(response.message || 'Failed to save vehicle');
            }
        } catch (error) {
            console.error('Error saving vehicle:', error);
            alert('Error saving vehicle');
        }
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setEditingId(null);
        setFormData({
            vehicle_no: '',
            vehicle_model: '',
            manufacture_year: '',
            registration_number: '',
            chasis_number: '',
            max_seating_capacity: '',
            driver_name: '',
            driver_licence: '',
            driver_contact: '',
            vehicle_photo: null,
            note: ''
        });
    };

    const handleEdit = async (id) => {
        try {
            setEditingId(id);
            const response = await api.getVehicleDetails(id);
            if (response && response.status && response.data) {
                const data = response.data;
                setFormData({
                    vehicle_no: data.vehicle_no || '',
                    vehicle_model: data.vehicle_model || '',
                    manufacture_year: data.manufacture_year || '',
                    registration_number: data.registration_number || '',
                    chasis_number: data.chasis_number || '',
                    max_seating_capacity: data.max_seating_capacity || '',
                    driver_name: data.driver_name || '',
                    driver_licence: data.driver_licence || '',
                    driver_contact: data.driver_contact || '',
                    vehicle_photo: null,
                    note: data.note || ''
                });
                setIsAddModalOpen(true);
            } else {
                alert('Failed to fetch vehicle details');
                setEditingId(null);
            }
        } catch (error) {
            console.error('Error fetching vehicle details:', error);
            alert('Error fetching vehicle details');
            setEditingId(null);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this vehicle?')) {
            try {
                const response = await api.deleteVehicle(id);
                if (response.status) {
                    alert('Vehicle Deleted Successfully');
                    fetchVehicleList();
                } else {
                    alert(response.message || 'Failed to delete vehicle');
                }
            } catch (error) {
                console.error('Error deleting vehicle:', error);
                alert('Error deleting vehicle');
            }
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
                currentUrl="/admin/vehicle"
            />

            <div className="content-wrapper">
                <section className="content">
                    <div className="row" style={{ marginTop: '20px' }}>
                        <div className="col-md-12">
                            <div className="box box-info">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix"> Vehicle List</h3>
                                    <div className="box-tools pull-right">
                                        <button type="button" className="btn btn-sm btn-primary" onClick={() => { setEditingId(null); setIsAddModalOpen(true); }}>
                                            <i className="fa fa-plus"></i> Add
                                        </button>
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs mright5" style={{ marginLeft: '5px' }}>
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body table-responsive">
                                    <div >
                                        <div className="download_label">Vehicle List</div>
                                        <div className="row" style={{ marginBottom: '10px' }}>
                                            <div className="col-sm-12">
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
                                        </div>
                                        <table className="table table-hover table-striped table-bordered example">
                                            <thead>
                                                <tr>
                                                    <th>Vehicle Number</th>
                                                    <th>Vehicle Model</th>
                                                    <th>Year Made</th>
                                                    <th>Registration Number</th>
                                                    <th>Chasis Number</th>
                                                    <th>Max Seating Capacity</th>
                                                    <th>Driver Name</th>
                                                    <th>Driver License</th>
                                                    <th>Driver Contact</th>
                                                    <th className="text-right noExport" width="10%">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredVehicles.map((data) => (
                                                    <tr key={data.id}>
                                                        <td className="mailbox-name">
                                                            <a href="#" data-toggle="popover" className="detail_popover" >{data.vehicle_no}</a>
                                                        </td>
                                                        <td className="mailbox-name"> {data.vehicle_model}</td>
                                                        <td className="mailbox-name"> {data.manufacture_year}</td>
                                                        <td className="mailbox-name"> {data.registration_number}</td>
                                                        <td className="mailbox-name"> {data.chasis_number}</td>
                                                        <td className="mailbox-name"> {data.max_seating_capacity}</td>
                                                        <td className="mailbox-name"> {data.driver_name}</td>
                                                        <td className="mailbox-name"> {data.driver_licence}</td>
                                                        <td className="mailbox-name"> {data.driver_contact}</td>
                                                        <td className="mailbox-date pull-right no-print white-space-nowrap">
                                                            <a className="btn btn-default btn-xs vehicledetails" data-toggle="tooltip" title="View"><i className="fa fa-reorder"></i></a>
                                                            <a className="btn btn-default btn-xs editvehicle" data-toggle="tooltip" title="Edit" onClick={() => handleEdit(data.id)}><i className="fa fa-pencil"></i></a>
                                                            <a className="btn btn-default btn-xs" data-toggle="tooltip" title="Delete" onClick={() => handleDelete(data.id)}><i className="fa fa-remove"></i></a>
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
            <div className="control-sidebar-bg"></div>

            {/* Modal for Add Vehicle */}
            {isAddModalOpen && (
                <>
                    <div className="modal fade in" id="myModal" role="dialog" aria-labelledby="myModalLabel" style={{ display: 'block', paddingRight: '17px' }}>
                        <div className="modal-dialog modal-lg" role="document">
                            <div className="modal-content modal-media-content">
                                <div className="modal-header modal-media-header">
                                    <button type="button" className="close" onClick={handleCloseModal}>&times;</button>
                                    <h4 className="box-title">{editingId ? 'Edit Vehicle' : 'Add Vehicle'}</h4>
                                </div>

                                <form id="addvehicleform" onSubmit={handleSubmit} encType="multipart/form-data">
                                    <div className="modal-body pb0 ptt10">
                                        <div className="row">
                                            <div className="col-lg-12 col-md-12 col-sm-12">
                                                <div className="row">
                                                    <div className="col-sm-4">
                                                        <div className="form-group">
                                                            <label>Vehicle Number</label><small className="req"> *</small>
                                                            <input autoFocus="" name="vehicle_no" placeholder="" type="text" className="form-control" value={formData.vehicle_no} onChange={handleInputChange} required />
                                                            <span className="text-danger"></span>
                                                        </div>
                                                    </div>

                                                    <div className="col-sm-4">
                                                        <div className="form-group">
                                                            <label>Vehicle Model</label>
                                                            <input name="vehicle_model" placeholder="" type="text" className="form-control" value={formData.vehicle_model} onChange={handleInputChange} />
                                                            <span className="text-danger"></span>
                                                        </div>
                                                    </div>

                                                    <div className="col-sm-4">
                                                        <div className="form-group">
                                                            <label>Year Made</label>
                                                            <input name="manufacture_year" placeholder="" type="text" className="form-control" value={formData.manufacture_year} onChange={handleInputChange} />
                                                            <span className="text-danger"></span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-sm-4">
                                                        <div className="form-group">
                                                            <label>Registration Number</label>
                                                            <input name="registration_number" placeholder="" type="text" className="form-control" value={formData.registration_number} onChange={handleInputChange} />
                                                            <span className="text-danger"></span>
                                                        </div>
                                                    </div>

                                                    <div className="col-sm-4">
                                                        <div className="form-group">
                                                            <label>Chassis Number</label>
                                                            <input name="chasis_number" placeholder="" type="text" className="form-control" value={formData.chasis_number} onChange={handleInputChange} />
                                                            <span className="text-danger"></span>
                                                        </div>
                                                    </div>

                                                    <div className="col-sm-4">
                                                        <div className="form-group">
                                                            <label>Max Seating Capacity</label>
                                                            <input name="max_seating_capacity" placeholder="" type="text" className="form-control" value={formData.max_seating_capacity} onChange={handleInputChange} />
                                                            <span className="text-danger"></span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-sm-4">
                                                        <div className="form-group">
                                                            <label>Driver Name</label>
                                                            <input name="driver_name" placeholder="" type="text" className="form-control" value={formData.driver_name} onChange={handleInputChange} />
                                                            <span className="text-danger"></span>
                                                        </div>
                                                    </div>

                                                    <div className="col-sm-4">
                                                        <div className="form-group">
                                                            <label>Driver License</label>
                                                            <input name="driver_licence" placeholder="" type="text" className="form-control" value={formData.driver_licence} onChange={handleInputChange} />
                                                            <span className="text-danger"></span>
                                                        </div>
                                                    </div>

                                                    <div className="col-sm-4">
                                                        <div className="form-group">
                                                            <label>Driver Contact</label>
                                                            <input name="driver_contact" placeholder="" type="text" className="form-control" value={formData.driver_contact} onChange={handleInputChange} />
                                                            <span className="text-danger"></span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-sm-4">
                                                        <div className="form-group">
                                                            <label >Vehicle Photo</label>
                                                            <input name="vehicle_photo" placeholder="" type="file" className="filestyle form-control" data-height="30" onChange={handleInputChange} />
                                                            <span className="text-danger"></span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-sm-12">
                                                        <div className="form-group">
                                                            <label>Note</label>
                                                            <textarea className="form-control" name="note" placeholder="" rows="3" value={formData.note} onChange={handleInputChange}></textarea>
                                                            <span className="text-danger"></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="box-footer">
                                        <div className="paddA10">
                                            <button type="submit" className="btn btn-info pull-right">Save</button>
                                            {/* Added Cancel button for UX since we're using a full controlled modal */}
                                        </div>
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

export default VehicleList;
