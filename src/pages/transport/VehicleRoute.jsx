import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import api from '../../services/api';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable } from '../../utils/tableExport';
import Pagination from '../../utils/Pagination';

const VehicleRoute = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Form States
    const [selectedRoute, setSelectedRoute] = useState('');
    const [selectedVehicles, setSelectedVehicles] = useState([]);

    // Store original values for edit payload
    const [originalRouteId, setOriginalRouteId] = useState('');
    const [originalVehicleIds, setOriginalVehicleIds] = useState([]);

    // Data States
    const [routeList, setRouteList] = useState([]);
    const [vehicleList, setVehicleList] = useState([]);
    const [vehRouteList, setVehRouteList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});


    // Initialize data
    const fetchData = async () => {
        try {
            const response = await api.getAssignVehicleRouteList();
            if (response.status === 'success' || response.status === true) {
                setRouteList(response.routelist || []);
                setVehicleList(response.vehiclelist || []);

                const vehRoutes = response.vehroutelist;
                let normalizedVehRoutes = [];
                if (Array.isArray(vehRoutes)) {
                    normalizedVehRoutes = vehRoutes;
                } else if (typeof vehRoutes === 'object' && vehRoutes !== null) {
                    normalizedVehRoutes = Object.values(vehRoutes);
                }
                setVehRouteList(normalizedVehRoutes);
            }
        } catch (error) {
            console.error('Error fetching vehicle route list:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle Edit Mode
    useEffect(() => {
        const fetchEditDetails = async () => {
            if (id) {
                try {
                    const response = await api.getAssignVehicleRouteDetails(id);
                    if (response.status === true && response.data && response.data.vehroute) {
                        const vehRoute = response.data.vehroute;
                        setIsEditMode(true);

                        const routeId = vehRoute.route_id ? vehRoute.route_id.toString() : (response.data.route_id ? response.data.route_id.toString() : '');
                        setSelectedRoute(routeId);
                        setOriginalRouteId(routeId); // Store original route ID

                        // Ensure vehicles map properly to simple ID list
                        if (vehRoute.vehicles && Array.isArray(vehRoute.vehicles)) {
                            const vehicleIds = vehRoute.vehicles.map(v => v.id);
                            setSelectedVehicles(vehicleIds);
                            setOriginalVehicleIds(vehicleIds); // Store original vehicle IDs (already strings/numbers)
                        } else {
                            setSelectedVehicles([]);
                            setOriginalVehicleIds([]);
                        }
                    } else {
                        // Fallback or error handling if needed
                        console.warn('Could not fetch edit details');
                    }
                } catch (error) {
                    console.error('Error fetching edit details:', error);
                }
            } else {
                setIsEditMode(false);
                resetForm();
            }
        };

        fetchEditDetails();
    }, [id]);

    const resetForm = () => {
        setSelectedRoute('');
        setSelectedVehicles([]);
        setOriginalRouteId('');
        setOriginalVehicleIds([]);
        setIsEditMode(false); // Ensure edit mode is false on reset
    };

    const handleVehicleChange = (vehicleId) => {
        setSelectedVehicles(prev => {
            const next = prev.includes(vehicleId) ? prev.filter(id => id !== vehicleId) : [...prev, vehicleId];
            if (next.length > 0 && errors.vehicle) {
                setErrors(p => {
                    const n = { ...p };
                    delete n.vehicle;
                    return n;
                });
            }
            return next;
        });
    };

    const handleRouteCHange = (val) => {
        setSelectedRoute(val);
        if (errors.route_id) {
            setErrors(prev => {
                const n = { ...prev };
                delete n.route_id;
                return n;
            });
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setErrors({});

        let hasError = false;
        const newErrors = {};

        if (!selectedRoute) {
            newErrors.route_id = 'The Route field is required.';
            hasError = true;
        }

        if (selectedVehicles.length === 0) {
            newErrors.vehicle = 'At least one vehicle must be selected.';
            hasError = true;
        }

        if (hasError) {
            setErrors(newErrors);
            return;
        }

        let payload = {
            route_id: selectedRoute,
            vehicle: selectedVehicles.map(String) // Ensure IDs are strings
        };

        if (isEditMode) {
            payload = {
                ...payload,
                pre_route_id: originalRouteId,
                prev_vec_route: originalVehicleIds.map(String)
            };
        }

        setSubmitting(true);
        try {
            let response;
            if (isEditMode) {
                response = await api.updateAssignVehicleRouteList(id, payload);
            } else {
                response = await api.addAssignVehicleRouteList(payload);
            }

            if (response.status === 'success' || response.status === true) {
                toast.success(response.message || 'Record Saved Successfully');
                fetchData(); // Refresh list on both create and edit
                if (isEditMode) {
                    navigate('/admin/vehroute');
                } else {
                    resetForm();
                }
            } else if (response.status === 'fail') {
                if (response.errors) setErrors(response.errors);
                const errorMsg = response.message || (response.errors ? Object.values(response.errors)[0] : 'Failed to save record');
                toast.error(errorMsg);
            } else {
                toast.error(response.message || 'Failed to save record');
            }
        } catch (error) {
            console.error('Error saving vehicle route:', error);
            toast.error(error.message || 'An error occurred while saving the record');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (deleteId) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                const response = await api.deleteAssignVehicleRouteList(deleteId);
                if (response.status === 'success' || response.status === true) {
                    toast.success(response.message || 'Record Deleted Successfully');
                    fetchData(); // Refresh list
                } else {
                    toast.error(response.message || 'Failed to delete record');
                }
            } catch (error) {
                console.error('Error deleting vehicle route:', error);
                toast.error('An error occurred while deleting the record');
            }
        }
    };

    const filteredList = vehRouteList.filter(item =>
        item.route_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.vehicles.some(v => v.vehicle_no.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Pagination Logic
    const totalItems = filteredList.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);

    const [hiddenColumns, setHiddenColumns] = useState([]);
    const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

    const toggleColumnVisibility = (colIndex) => {
        setHiddenColumns(prev =>
            prev.includes(colIndex) ? prev.filter(c => c !== colIndex) : [...prev, colIndex]
        );
    };

    const getExportData = () => {
        const headers = [];
        if (!hiddenColumns.includes(0)) headers.push("Route");
        if (!hiddenColumns.includes(1)) headers.push("Vehicle");

        const rows = filteredList.map(item => {
            const row = [];
            if (!hiddenColumns.includes(0)) row.push(item.route_title);
            if (!hiddenColumns.includes(1)) row.push(item.vehicles.map(v => v.vehicle_no).join(', '));
            return row;
        });

        return { headers, rows };
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-credit-card"></i> Transport
                    </h1>
                </section>
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

                <section className="content">
                    <div className="row">
                        {/* Assign Vehicle Form - Left Panel */}
                        <div className="col-md-4">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">{isEditMode ? 'Edit Vehicle On Route' : 'Assign Vehicle On Route'}</h3>
                                </div>
                                <form id="form1" onSubmit={handleSave} acceptCharset="utf-8">
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label>Route</label> <small className="req"> *</small>
                                            <select
                                                autoFocus
                                                className="form-control"
                                                value={selectedRoute}
                                                onChange={(e) => handleRouteCHange(e.target.value)}
                                            >
                                                <option value="">Select</option>
                                                {routeList.map((route) => (
                                                    <option key={route.id} value={route.id}>
                                                        {route.route_title}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.route_id && <span className="text-danger" style={{ fontSize: '12px' }}>{errors.route_id}</span>}
                                        </div>

                                        <div className="form-group">
                                            <label>Vehicle</label> <small className="req"> *</small>
                                            {vehicleList.map((vehicle) => (
                                                <div className="checkbox" key={vehicle.id}>
                                                    <label>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedVehicles.includes(vehicle.id)}
                                                            onChange={() => handleVehicleChange(vehicle.id)}
                                                        />
                                                        {vehicle.vehicle_no}
                                                    </label>
                                                </div>
                                            ))}
                                            {errors.vehicle && <span className="text-danger" style={{ fontSize: '12px' }}>{errors.vehicle}</span>}
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

                        {/* Vehicle Route List Table - Right Panel */}
                        <div className="col-md-8">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Vehicle Route List</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="mailbox-messages">
                                        <div className="download_label">Vehicle Route List</div>
                                        <div className="table-responsive overflow-visible">
                                            {/* DataTables Controls */}
                                            <div className="dataTables_wrapper no-footer">
                                                <div className="row mobile-stack" style={{ marginBottom: '10px' }}>
                                                    <div className="col-md-6 col-sm-12">
                                                        <div className="pull-left" style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                                                            <div className="dataTables_length">
                                                                <label style={{ fontWeight: 'normal', display: 'flex', alignItems: 'center', margin: 0 }}>
                                                                    Records:
                                                                    <select
                                                                        value={recordsPerPage}
                                                                        onChange={(e) => {
                                                                            setRecordsPerPage(Number(e.target.value));
                                                                            setCurrentPage(1);
                                                                        }}
                                                                        className="form-control input-sm"
                                                                        style={{ width: '80px', margin: '0 10px' }}
                                                                    >
                                                                        <option value="10">10</option>
                                                                        <option value="25">25</option>
                                                                        <option value="50">50</option>
                                                                        <option value="100">100</option>
                                                                        <option value="-1">All</option>
                                                                    </select>
                                                                </label>
                                                            </div>
                                                            <input
                                                                type="search"
                                                                placeholder="Search..."
                                                                value={searchTerm}
                                                                onChange={(e) => {
                                                                    setSearchTerm(e.target.value);
                                                                    setCurrentPage(1);
                                                                }}
                                                                style={{ border: 'none', borderBottom: '1px solid #ccc', outline: 'none', padding: '5px 0', background: 'transparent', width: 'auto' }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 col-sm-12">
                                                        <div className="dt-buttons btn-group pull-right">
                                                            <button className="btn btn-default btn-sm buttons-copy buttons-html5" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }}><i className="fa fa-files-o"></i></button>
                                                            <button className="btn btn-default btn-sm buttons-excel buttons-html5" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'Vehicle_Route_List.xls'); }}><i className="fa fa-file-excel-o"></i></button>
                                                            <button className="btn btn-default btn-sm buttons-csv buttons-html5" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'Vehicle_Route_List.csv'); }}><i className="fa fa-file-text-o"></i></button>
                                                            <button className="btn btn-default btn-sm buttons-pdf buttons-html5" title="PDF" onClick={() => { const { headers, rows } = getExportData(); downloadPDF(headers, rows, 'Vehicle_Route_List.pdf', 'Vehicle Route List'); }}><i className="fa fa-file-pdf-o"></i></button>
                                                            <button className="btn btn-default btn-sm buttons-print" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Vehicle Route List'); }}><i className="fa fa-print"></i></button>

                                                            <div className="btn-group">
                                                                <button className="btn btn-default btn-sm buttons-collection buttons-colvis" title="Columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}>
                                                                    <i className="fa fa-columns"></i>
                                                                </button>
                                                                {showColumnsDropdown && (
                                                                    <ul className="dropdown-menu dt-button-collection" style={{ display: 'block', right: 0, left: 'auto' }}>
                                                                        <li><label><input type="checkbox" checked={!hiddenColumns.includes(0)} onChange={() => toggleColumnVisibility(0)} /> Route</label></li>
                                                                        <li><label><input type="checkbox" checked={!hiddenColumns.includes(1)} onChange={() => toggleColumnVisibility(1)} /> Vehicle</label></li>
                                                                    </ul>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <table className="table table-striped table-bordered table-hover example">
                                                    <thead>
                                                        <tr>
                                                            {!hiddenColumns.includes(0) && <th>Route</th>}
                                                            {!hiddenColumns.includes(1) && <th>Vehicle</th>}
                                                            <th className="text-right noExport">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {currentItems.map((item) => (
                                                            <tr key={item.id}>
                                                                {!hiddenColumns.includes(0) && <td className="mailbox-name">{item.route_title}</td>}
                                                                {!hiddenColumns.includes(1) && <td>
                                                                    {item.vehicles.map((v) => (
                                                                        <div key={v.id}>
                                                                            <b>{v.vehicle_no}</b>
                                                                        </div>
                                                                    ))}
                                                                </td>}
                                                                <td className="mailbox-date pull-right">
                                                                    <Link
                                                                        to={`/admin/vehroute/edit/${item.id}`}
                                                                        className="btn btn-default btn-xs"
                                                                        title="Edit"
                                                                    >
                                                                        <i className="fa fa-pencil"></i>
                                                                    </Link>
                                                                    <a
                                                                        href="#"
                                                                        className="btn btn-default btn-xs"
                                                                        title="Delete"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            handleDelete(item.id);
                                                                        }}
                                                                    >
                                                                        <i className="fa fa-remove"></i>
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {currentItems.length === 0 && (
                                                            <tr>
                                                                <td colSpan="3" className="text-center">No Result Found</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>

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
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default VehicleRoute;
