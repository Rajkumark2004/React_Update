import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';

const VehicleRoute = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Form States
    const [selectedRoute, setSelectedRoute] = useState('');
    const [selectedVehicles, setSelectedVehicles] = useState([]);

    // Data States
    const [routeList, setRouteList] = useState([]);
    const [vehicleList, setVehicleList] = useState([]);
    const [vehRouteList, setVehRouteList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);


    // Initialize mock data
    useEffect(() => {
        const mockRoutes = [
            { id: 1, route_title: 'Route 1' },
            { id: 2, route_title: 'Route 2' },
            { id: 3, route_title: 'Route 3' },
            { id: 4, route_title: 'Route 4' }
        ];
        const mockVehicles = [
            { id: 1, vehicle_no: 'MH01-1234' },
            { id: 2, vehicle_no: 'MH01-5678' },
            { id: 3, vehicle_no: 'MH01-9012' },
            { id: 4, vehicle_no: 'MH01-3456' },
        ];
        const mockVehRouteList = [
            {
                id: 1,
                route_id: 1,
                route_title: 'Route A',
                vehicles: [
                    { id: 1, vehicle_no: 'MH01-1234' },
                    { id: 2, vehicle_no: 'MH01-5678' }
                ]
            },
            {
                id: 2,
                route_id: 2,
                route_title: 'Route B',
                vehicles: [
                    { id: 3, vehicle_no: 'MH01-9012' }
                ]
            },
        ];

        setRouteList(mockRoutes);
        setVehicleList(mockVehicles);
        setVehRouteList(mockVehRouteList);
    }, []);

    // Handle Edit Mode
    useEffect(() => {
        if (id && vehRouteList.length > 0) {
            const itemToEdit = vehRouteList.find(item => item.id === parseInt(id));
            if (itemToEdit) {
                setIsEditMode(true);
                setSelectedRoute(itemToEdit.route_id.toString());
                setSelectedVehicles(itemToEdit.vehicles.map(v => v.id));
            }
        } else {
            setIsEditMode(false);
            resetForm();
        }
    }, [id, vehRouteList]);

    const resetForm = () => {
        setSelectedRoute('');
        setSelectedVehicles([]);
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

    const handleSave = (e) => {
        e.preventDefault();

        if (!selectedRoute) {
            alert('The Route field is required.');
            return;
        }

        if (selectedVehicles.length === 0) {
            alert('At least one vehicle must be selected.');
            return;
        }

        const routeData = routeList.find(r => r.id === parseInt(selectedRoute));
        const chosenVehicles = vehicleList.filter(v => selectedVehicles.includes(v.id));

        const newEntry = {
            id: isEditMode ? parseInt(id) : Date.now(),
            route_id: parseInt(selectedRoute),
            route_title: routeData.route_title,
            vehicles: chosenVehicles
        };

        if (isEditMode) {
            setVehRouteList(prev => prev.map(item => item.id === newEntry.id ? newEntry : item));
            alert('Record Updated Successfully');
            navigate('/admin/vehroute');
        } else {
            setVehRouteList(prev => [...prev, newEntry]);
            alert('Record Saved Successfully');
            resetForm();
        }
    };

    const handleDelete = (deleteId) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            setVehRouteList(prev => prev.filter(item => item.id !== deleteId));
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
            <div className="content-wrapper" style={{ minHeight: '658px', marginTop: '17px' }}>
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
