import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import api from '../../services/api';

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
    const [itemsPerPage] = useState(10);


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
            if (prev.includes(vehicleId)) {
                return prev.filter(id => id !== vehicleId);
            } else {
                return [...prev, vehicleId];
            }
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!selectedRoute) {
            toast.error('The Route field is required.');
            return;
        }

        if (selectedVehicles.length === 0) {
            toast.error('At least one vehicle must be selected.');
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

        try {
            let response;
            if (isEditMode) {
                response = await api.updateAssignVehicleRouteList(id, payload);
            } else {
                response = await api.addAssignVehicleRouteList(payload);
            }

            if (response.status === 'success' || response.status === true) {
                toast.success(response.message || 'Record Saved Successfully');
                if (isEditMode) {
                    // Wait for toast to be dismissed (if browser sync) or just navigate
                    // Better to refetch list IF staying on same page, but we navigate
                    navigate('/admin/vehroute');
                } else {
                    fetchData(); // Refresh list only on create
                    resetForm();
                }
            } else {
                toast.error(response.message || 'Failed to save record');
            }
        } catch (error) {
            console.error('Error saving vehicle route:', error);
            toast.error('An error occurred while saving the record');
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
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredList.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);


    return (
        <div className="wrapper">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '658px', marginTop: '0px' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-credit-card"></i> Transport
                    </h1>
                </section>

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
                                                onChange={(e) => setSelectedRoute(e.target.value)}
                                            >
                                                <option value="">Select</option>
                                                {routeList.map((route) => (
                                                    <option key={route.id} value={route.id}>
                                                        {route.route_title}
                                                    </option>
                                                ))}
                                            </select>
                                            <span className="text-danger"></span>
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
                                            <span className="text-danger"></span>
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <button type="submit" className="btn btn-info pull-right">Save</button>
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
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                                                    <div className="dataTables_filter" style={{ textAlign: 'left' }}>
                                                        <label>Search:
                                                            <input
                                                                type="search"
                                                                placeholder=""
                                                                value={searchTerm}
                                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                                style={{ marginLeft: '0.5em', display: 'inline-block', width: 'auto' }}
                                                            />
                                                        </label>
                                                    </div>
                                                    <div className="dt-buttons btn-group">
                                                        <a className="btn btn-default buttons-copy buttons-html5 btn-sm" title="Copy"><span><i className="fa fa-files-o"></i></span></a>
                                                        <a className="btn btn-default buttons-csv buttons-html5 btn-sm" title="CSV"><span><i className="fa fa-file-text-o"></i></span></a>
                                                        <a className="btn btn-default buttons-excel buttons-html5 btn-sm" title="Excel"><span><i className="fa fa-file-excel-o"></i></span></a>
                                                        <a className="btn btn-default buttons-pdf buttons-html5 btn-sm" title="PDF"><span><i className="fa fa-file-pdf-o"></i></span></a>
                                                        <a className="btn btn-default buttons-print btn-sm" title="Print"><span><i className="fa fa-print"></i></span></a>
                                                        <a className="btn btn-default buttons-collection buttons-colvis btn-sm" title="Columns"><span><i className="fa fa-columns"></i></span></a>
                                                    </div>
                                                </div>

                                                <table className="table table-striped table-bordered table-hover example">
                                                    <thead>
                                                        <tr>
                                                            <th>Route</th>
                                                            <th>Vehicle</th>
                                                            <th className="text-right noExport">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {currentItems.map((item) => (
                                                            <tr key={item.id}>
                                                                <td className="mailbox-name">{item.route_title}</td>
                                                                <td>
                                                                    {item.vehicles.map((v) => (
                                                                        <div key={v.id}>
                                                                            <b>{v.vehicle_no}</b>
                                                                        </div>
                                                                    ))}
                                                                </td>
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

                                                <div className="row">
                                                    <div className="col-sm-5">
                                                        <div className="dataTables_info" role="status" aria-live="polite">
                                                            Records {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredList.length)} of {filteredList.length}
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-7">
                                                        <div className="dataTables_paginate paging_simple_numbers">
                                                            <ul className="pagination" style={{ margin: '0', float: 'right' }}>
                                                                <li className={`paginate_button previous ${currentPage === 1 ? 'disabled' : ''}`}>
                                                                    <a href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) paginate(currentPage - 1); }}>
                                                                        <i className="fa fa-angle-left"></i>
                                                                    </a>
                                                                </li>
                                                                {[...Array(totalPages)].map((_, i) => (
                                                                    <li key={i} className={`paginate_button ${currentPage === i + 1 ? 'active' : ''}`}>
                                                                        <a href="#" onClick={(e) => { e.preventDefault(); paginate(i + 1); }}>{i + 1}</a>
                                                                    </li>
                                                                ))}
                                                                <li className={`paginate_button next ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                                                                    <a href="#" onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) paginate(currentPage + 1); }}>
                                                                        <i className="fa fa-angle-right"></i>
                                                                    </a>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
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
