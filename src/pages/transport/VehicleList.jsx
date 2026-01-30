import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../utils/include_files.js';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import { useSession } from '../../../context/SessionContext';
import api from '../../../services/api';

const VehicleList = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    // State for mock data (replicating listVehicle)
    const [vehicles, setVehicles] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

        // Mock initial vehicle data since we don't have the backend connected for this yet
        // In a real scenario, this would be an API call
        setVehicles([
            {
                id: 1,
                vehicle_no: 'VH-001',
                vehicle_model: 'Tata Starbus',
                manufacture_year: '2020',
                registration_number: 'MH-12-AB-1234',
                chasis_number: 'CH-888999',
                max_seating_capacity: '40',
                driver_name: 'Ram Singh',
                driver_licence: 'DL-999888777',
                driver_contact: '9876543210',
            },
            {
                id: 2,
                vehicle_no: 'VH-002',
                vehicle_model: 'Ashok Leyland',
                manufacture_year: '2021',
                registration_number: 'MH-14-CD-5678',
                chasis_number: 'CH-777666',
                max_seating_capacity: '50',
                driver_name: 'Suresh Kumar',
                driver_licence: 'DL-555444333',
                driver_contact: '9988776655',
            },
            {
                id: 3,
                vehicle_no: 'VH-003',
                vehicle_model: 'Force Traveller',
                manufacture_year: '2022',
                registration_number: 'MH-12-EF-9012',
                chasis_number: 'CH-222333',
                max_seating_capacity: '20',
                driver_name: 'Rajesh Patil',
                driver_licence: 'DL-111222333',
                driver_contact: '9123456789',
            },
            {
                id: 4,
                vehicle_no: 'VH-004',
                vehicle_model: 'Eicher Skyline',
                manufacture_year: '2019',
                registration_number: 'MH-12-GH-3456',
                chasis_number: 'CH-444555',
                max_seating_capacity: '35',
                driver_name: 'Amit Sharma',
                driver_licence: 'DL-666777888',
                driver_contact: '9876509876',
            }
        ]);
    }, []);

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
        const { name, value, type, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'file' ? files[0] : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mimic save
        const newVehicle = {
            id: vehicles.length + 1,
            ...formData,
            vehicle_photo: formData.vehicle_photo ? formData.vehicle_photo.name : ''
        };
        setVehicles([...vehicles, newVehicle]);
        setIsAddModalOpen(false);
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
        alert('Vehicle Added Successfully (Mock)');
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
                                        <button type="button" className="btn btn-sm btn-primary" onClick={() => setIsAddModalOpen(true)}>
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
                                                            <a className="btn btn-default btn-xs editvehicle" data-toggle="tooltip" title="Edit"><i className="fa fa-pencil"></i></a>
                                                            <a className="btn btn-default btn-xs" data-toggle="tooltip" title="Delete" onClick={() => { if (window.confirm('Are you sure you want to delete this?')) { alert('Delete logic'); } }}><i className="fa fa-remove"></i></a>
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
                                    <button type="button" className="close" onClick={() => setIsAddModalOpen(false)}>&times;</button>
                                    <h4 className="box-title">Add Vehicle</h4>
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
