import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const VehicleList = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    // State for mock data (replicating listVehicle)
    const [vehicles, setVehicles] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewVehicleData, setViewVehicleData] = useState(null);
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
        existing_photo: '',
        note: ''
    });


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
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);

    const columns = [
        { key: 'vehicle_no', label: 'Vehicle Number' },
        { key: 'vehicle_model', label: 'Vehicle Model' },
        { key: 'manufacture_year', label: 'Year Made' },
        { key: 'registration_number', label: 'Registration Number' },
        { key: 'chasis_number', label: 'Chasis Number' },
        { key: 'max_seating_capacity', label: 'Max Seating Capacity' },
        { key: 'driver_name', label: 'Driver Name' },
        { key: 'driver_licence', label: 'Driver License' },
        { key: 'driver_contact', label: 'Driver Contact' }
    ];

    // Filter vehicles logic
    const filteredVehicles = vehicles.filter(vehicle =>
        Object.values(vehicle).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const totalItems = filteredVehicles.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentItems = filteredVehicles.slice(indexOfFirstItem, indexOfLastItem);

    {/*} const userData = loggedInUser ? {
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
    };*/}

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Search');
    };

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
    const getExportData = () => buildExportData(columns, visibleColumns, filteredVehicles, formatCell);

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
            const submitData = { ...formData };
            delete submitData.existing_photo;

            if (editingId) {
                response = await api.updateVehicle(editingId, submitData);
            } else {
                response = await api.addVehicle(submitData);
            }

            if (response.status) {
                toast.success(editingId ? 'Vehicle Updated Successfully' : 'Vehicle Added Successfully');
                handleCloseModal();
                fetchVehicleList(); // Refresh list
            } else {
                toast.error(response.message || 'Failed to save vehicle');
            }
        } catch (error) {
            console.error('Error saving vehicle:', error);
            toast.error('Error saving vehicle');
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
            existing_photo: '',
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
                    existing_photo: data.vehicle_photo || '',
                    note: data.note || ''
                });
                setIsAddModalOpen(true);
            } else {
                toast.error('Failed to fetch vehicle details');
                setEditingId(null);
            }
        } catch (error) {
            console.error('Error fetching vehicle details:', error);
            toast.error('Error fetching vehicle details');
            setEditingId(null);
        }
    };

    const handleView = async (id) => {
        try {
            const response = await api.getVehicleDetails(id);
            if (response && response.status && response.data) {
                setViewVehicleData(response.data);
                setIsViewModalOpen(true);
            } else {
                toast.error('Failed to fetch vehicle details');
            }
        } catch (error) {
            console.error('Error fetching vehicle details:', error);
            toast.error('Error fetching vehicle details');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this vehicle?')) {
            try {
                const response = await api.deleteVehicle(id);
                if (response.status) {
                    toast.success('Vehicle Deleted Successfully');
                    fetchVehicleList();
                } else {
                    toast.error(response.message || 'Failed to delete vehicle');
                }
            } catch (error) {
                console.error('Error deleting vehicle:', error);
                toast.error('Error deleting vehicle');
            }
        }
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <style>{`
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
                .modal-body-scroll::-webkit-scrollbar {
                    display: none;
                }
                .modal-body-scroll {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
            `}</style>
            <Header />

            <Sidebar />

            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content">
                    <div className="row" style={{ marginTop: '0px' }}>
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
                                <div className="box-body">
                                    <div >
                                        <div className="download_label">Vehicle List</div>
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
                                                exportFileName="vehicle_list"
                                                exportTitle="Vehicle List"
                                            />
                                        </div>
                                        <div className="table-responsive overflow-visible-lg">
                                            <table className="table table-hover table-striped table-bordered example">
                                                <thead>
                                                    <tr>
                                                        {visibleColumns.has('vehicle_no') && <th>Vehicle Number</th>}
                                                        {visibleColumns.has('vehicle_model') && <th>Vehicle Model</th>}
                                                        {visibleColumns.has('manufacture_year') && <th>Year Made</th>}
                                                        {visibleColumns.has('registration_number') && <th>Registration Number</th>}
                                                        {visibleColumns.has('chasis_number') && <th style={{ width: '15%' }}>Chasis Number</th>}
                                                        {visibleColumns.has('max_seating_capacity') && <th>Max Seating Capacity</th>}
                                                        {visibleColumns.has('driver_name') && <th>Driver Name</th>}
                                                        {visibleColumns.has('driver_licence') && <th>Driver License</th>}
                                                        {visibleColumns.has('driver_contact') && <th>Driver Contact</th>}
                                                        <th className="text-right noExport" width="10%">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentItems.length === 0 ? (
                                                        <tr><td colSpan="10" className="text-center">No Result Found</td></tr>
                                                    ) : (
                                                        currentItems.map((data) => (
                                                            <tr key={data.id}>
                                                                {visibleColumns.has('vehicle_no') && (
                                                                    <td className="mailbox-name">
                                                                        <a href="#" data-toggle="popover" className="detail_popover" >{data.vehicle_no}</a>
                                                                    </td>
                                                                )}
                                                                {visibleColumns.has('vehicle_model') && <td className="mailbox-name"> {data.vehicle_model}</td>}
                                                                {visibleColumns.has('manufacture_year') && <td className="mailbox-name"> {data.manufacture_year}</td>}
                                                                {visibleColumns.has('registration_number') && <td className="mailbox-name"> {data.registration_number}</td>}
                                                                {visibleColumns.has('chasis_number') && <td className="mailbox-name" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}> {data.chasis_number}</td>}
                                                                {visibleColumns.has('max_seating_capacity') && <td className="mailbox-name"> {data.max_seating_capacity}</td>}
                                                                {visibleColumns.has('driver_name') && <td className="mailbox-name"> {data.driver_name}</td>}
                                                                {visibleColumns.has('driver_licence') && <td className="mailbox-name"> {data.driver_licence}</td>}
                                                                {visibleColumns.has('driver_contact') && <td className="mailbox-name"> {data.driver_contact}</td>}
                                                                <td className="mailbox-date pull-right no-print white-space-nowrap">
                                                                    <a className="btn btn-default btn-xs vehicledetails" data-toggle="tooltip" title="View" onClick={() => handleView(data.id)}><i className="fa fa-reorder"></i></a>
                                                                    <a className="btn btn-default btn-xs editvehicle" data-toggle="tooltip" title="Edit" onClick={() => handleEdit(data.id)}><i className="fa fa-pencil"></i></a>
                                                                    <a className="btn btn-default btn-xs" data-toggle="tooltip" title="Delete" onClick={() => handleDelete(data.id)}><i className="fa fa-remove"></i></a>
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
                                    <div className="modal-body pb0 ptt10 modal-body-scroll" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
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
                                                            <input name="chasis_number" placeholder="" type="text" className="form-control" value={formData.chasis_number} onChange={handleInputChange} maxLength={100} />
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
                                                    <div className="col-sm-12">
                                                        <div className="form-group">
                                                            <label>Vehicle Photo</label>
                                                            <div
                                                                style={{
                                                                    border: '2px dashed #d1d5db',
                                                                    borderRadius: '8px',
                                                                    padding: '20px',
                                                                    textAlign: 'center',
                                                                    backgroundColor: '#f9fafb',
                                                                    cursor: 'pointer',
                                                                    position: 'relative'
                                                                }}
                                                                onClick={() => document.getElementById('vehicle_photo_input').click()}
                                                                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                                onDrop={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                                                        handleInputChange({ target: { name: 'vehicle_photo', type: 'file', files: e.dataTransfer.files } });
                                                                    }
                                                                }}
                                                            >
                                                                <input
                                                                    id="vehicle_photo_input"
                                                                    name="vehicle_photo"
                                                                    type="file"
                                                                    accept="image/*"
                                                                    style={{ display: 'none' }}
                                                                    onChange={handleInputChange}
                                                                />

                                                                {formData.vehicle_photo ? (
                                                                    <div style={{ position: 'relative', display: 'inline-block' }}>
                                                                        <img
                                                                            src={URL.createObjectURL(formData.vehicle_photo)}
                                                                            alt="Preview"
                                                                            style={{ maxHeight: '150px', maxWidth: '100%', borderRadius: '4px' }}
                                                                        />
                                                                        <div style={{ marginTop: '10px', color: '#4f46e5', fontWeight: '500' }}>{formData.vehicle_photo.name}</div>
                                                                    </div>
                                                                ) : formData.existing_photo ? (
                                                                    <div>
                                                                        <img
                                                                            src={formData.existing_photo.includes('http') ? formData.existing_photo : `https://newlayout.wisibles.com//uploads/vehicle_photo/${formData.existing_photo}?${new Date().getTime()}`}
                                                                            alt="Current Photo"
                                                                            style={{ maxHeight: '150px', maxWidth: '100%', borderRadius: '4px', marginBottom: '10px' }}
                                                                        />
                                                                        <div style={{ color: '#6b7280' }}>Click or drag a new image to replace</div>
                                                                    </div>
                                                                ) : (
                                                                    <div style={{ padding: '20px 0' }}>
                                                                        <i className="fa fa-cloud-upload" style={{ fontSize: '48px', color: '#9ca3af', marginBottom: '10px' }}></i>
                                                                        <div style={{ color: '#4b5563', fontSize: '16px', fontWeight: '500' }}>Drop a file here or click to upload</div>
                                                                        <div style={{ color: '#9ca3af', fontSize: '14px', marginTop: '5px' }}>Allowed formats: JPG, PNG, JPEG</div>
                                                                    </div>
                                                                )}
                                                            </div>
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

            {/* Modal for View Vehicle */}
            {isViewModalOpen && viewVehicleData && (
                <>
                    <div className="modal fade in" role="dialog" style={{ display: 'block', paddingRight: '17px' }}>
                        <div className="modal-dialog modal-lg" role="document">
                            <div className="modal-content modal-media-content">
                                <div className="modal-header modal-media-header">
                                    <button type="button" className="close" onClick={() => setIsViewModalOpen(false)}>&times;</button>
                                    <h4 className="box-title">Vehicle Details</h4>
                                </div>
                                <div className="modal-body pt0 pb0 modal-body-scroll" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                    <div className="row" style={{ padding: '15px' }}>
                                        <div className="col-md-3 col-sm-6" style={{ marginBottom: '15px' }}>
                                            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Vehicle Photo</div>
                                            <div style={{ border: '1px solid #e3e3e3', padding: '5px', borderRadius: '4px', textAlign: 'center', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                                {viewVehicleData.vehicle_photo ? (
                                                    <img
                                                        src={viewVehicleData.vehicle_photo.includes('http') ? viewVehicleData.vehicle_photo : `https://newlayout.wisibles.com//uploads/vehicle_photo/${viewVehicleData.vehicle_photo}?${new Date().getTime()}`}
                                                        alt="Vehicle"
                                                        style={{ maxWidth: '100%', height: 'auto', maxHeight: '100px' }}
                                                    />
                                                ) : (
                                                    <i className="fa fa-bus" style={{ fontSize: '60px', color: '#666', padding: '20px 0' }}></i>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-3 col-sm-6">
                                            <div style={{ marginBottom: '8px' }}><b>Vehicle Number:</b> {viewVehicleData.vehicle_no || ''}</div>
                                            <div style={{ marginBottom: '8px' }}><b>Registration Number:</b> {viewVehicleData.registration_number || ''}</div>
                                            <div style={{ marginBottom: '8px' }}><b>Driver Name:</b> {viewVehicleData.driver_name || ''}</div>
                                        </div>

                                        <div className="col-md-3 col-sm-6">
                                            <div style={{ marginBottom: '8px' }}><b>Vehicle Model:</b> {viewVehicleData.vehicle_model || ''}</div>
                                            <div style={{ marginBottom: '8px' }}><b>Chassis Number:</b> {viewVehicleData.chasis_number || ''}</div>
                                            <div style={{ marginBottom: '8px' }}><b>Driver License:</b> {viewVehicleData.driver_licence || ''}</div>
                                        </div>

                                        <div className="col-md-3 col-sm-6">
                                            <div style={{ marginBottom: '8px' }}><b>Year Made:</b> {viewVehicleData.manufacture_year || ''}</div>
                                            <div style={{ marginBottom: '8px' }}><b>Max Seating Capacity:</b> {viewVehicleData.max_seating_capacity || ''}</div>
                                            <div style={{ marginBottom: '8px' }}><b>Driver Contact:</b> {viewVehicleData.driver_contact || ''}</div>
                                        </div>
                                    </div>
                                    <div className="row" style={{ padding: '0 15px 15px 15px' }}>
                                        <div className="col-md-12">
                                            <div><b>Note:</b> {viewVehicleData.note || ''}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="box-footer">
                                    <button type="button" className="btn btn-default pull-right" onClick={() => setIsViewModalOpen(false)}>Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade in"></div>
                </>
            )
            }
        </div >
    );
};

export default VehicleList;
