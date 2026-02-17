import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import '../../styles/reports.css';

const StudentTransportDetails = () => {
    const navigate = useNavigate();

    // Currency symbol
    const currencySymbol = '₹';

    // Form states
    const [classId, setClassId] = useState('');
    const [sectionId, setSectionId] = useState('');
    const [transportRouteId, setTransportRouteId] = useState('');
    const [pickupPointId, setPickupPointId] = useState('');
    const [vehicleId, setVehicleId] = useState('');

    // Validation errors
    const [errors, setErrors] = useState({});

    // Data states
    const [sectionOptions, setSectionOptions] = useState([]);
    const [pickupPointOptions, setPickupPointOptions] = useState([]);
    const [vehicleOptions, setVehicleOptions] = useState([]);
    const [resultList, setResultList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    // Table controls
    const [tableSearch, setTableSearch] = useState('');

    // Mock Data - Classes
    const classList = [
        { id: 1, class: 'Class 1' },
        { id: 2, class: 'Class 2' },
        { id: 3, class: 'Class 3' },
        { id: 4, class: 'Class 4' },
        { id: 5, class: 'Class 5' },
        { id: 6, class: 'Class 6' },
        { id: 7, class: 'Class 7' },
        { id: 8, class: 'Class 8' },
        { id: 9, class: 'Class 9' },
        { id: 10, class: 'Class 10' },
    ];

    // Mock Data - Sections per class
    const sectionsMap = {
        1: [{ section_id: 1, section: 'A' }, { section_id: 2, section: 'B' }],
        2: [{ section_id: 1, section: 'A' }, { section_id: 2, section: 'B' }, { section_id: 3, section: 'C' }],
        3: [{ section_id: 1, section: 'A' }],
        4: [{ section_id: 1, section: 'A' }, { section_id: 2, section: 'B' }],
        5: [{ section_id: 1, section: 'A' }, { section_id: 2, section: 'B' }],
        6: [{ section_id: 1, section: 'A' }, { section_id: 2, section: 'B' }, { section_id: 3, section: 'C' }],
        7: [{ section_id: 1, section: 'A' }],
        8: [{ section_id: 1, section: 'A' }, { section_id: 2, section: 'B' }],
        9: [{ section_id: 1, section: 'A' }, { section_id: 2, section: 'B' }],
        10: [{ section_id: 1, section: 'A' }, { section_id: 2, section: 'B' }, { section_id: 3, section: 'C' }],
    };

    // Mock Data - Vehicle Route List
    const vehRouteList = [
        { id: 1, route_title: 'Route 1 - Main Road' },
        { id: 2, route_title: 'Route 2 - Highway' },
        { id: 3, route_title: 'Route 3 - Ring Road' },
        { id: 4, route_title: 'Route 4 - Market Area' },
    ];

    // Mock Data - Pickup Points per route
    const pickupPointsMap = {
        1: [{ pickup_point_id: 1, pickup_point: 'Stop A - Main Gate' }, { pickup_point_id: 2, pickup_point: 'Stop B - Park Road' }, { pickup_point_id: 3, pickup_point: 'Stop C - Circle' }],
        2: [{ pickup_point_id: 4, pickup_point: 'Stop D - Highway Junction' }, { pickup_point_id: 5, pickup_point: 'Stop E - Toll Plaza' }],
        3: [{ pickup_point_id: 6, pickup_point: 'Stop F - Ring Road Start' }, { pickup_point_id: 7, pickup_point: 'Stop G - Flyover' }, { pickup_point_id: 8, pickup_point: 'Stop H - Ring Road End' }],
        4: [{ pickup_point_id: 9, pickup_point: 'Stop I - Market Gate' }, { pickup_point_id: 10, pickup_point: 'Stop J - Bus Stand' }],
    };

    // Mock Data - Vehicles per route
    const vehiclesMap = {
        1: [{ id: 1, vehicle_no: 'KA-01-AB-1234' }, { id: 2, vehicle_no: 'KA-01-CD-5678' }],
        2: [{ id: 3, vehicle_no: 'KA-02-EF-9012' }],
        3: [{ id: 4, vehicle_no: 'KA-03-GH-3456' }, { id: 5, vehicle_no: 'KA-03-IJ-7890' }],
        4: [{ id: 6, vehicle_no: 'KA-04-KL-2345' }],
    };

    // Mock Data - Students for table
    const mockStudentData = [
        { class: 'Class 1', section: 'A', admission_no: '18001', firstname: 'Rahul', middlename: '', lastname: 'Kumar', id: 101, mobileno: '9876543210', father_name: 'Rajesh Kumar', route_title: 'Route 1 - Main Road', vehicle_no: 'KA-01-AB-1234', pickup_name: 'Stop A - Main Gate', driver_name: 'Suresh', driver_contact: '9988776655', fees: '2500.00' },
        { class: 'Class 1', section: 'A', admission_no: '18002', firstname: 'Priya', middlename: '', lastname: 'Sharma', id: 102, mobileno: '9876543212', father_name: 'Sanjay Sharma', route_title: 'Route 1 - Main Road', vehicle_no: 'KA-01-AB-1234', pickup_name: 'Stop B - Park Road', driver_name: 'Suresh', driver_contact: '9988776655', fees: '2500.00' },
        { class: 'Class 2', section: 'B', admission_no: '18003', firstname: 'Amit', middlename: 'Kumar', lastname: 'Singh', id: 103, mobileno: '9876543214', father_name: 'Vijay Singh', route_title: 'Route 2 - Highway', vehicle_no: 'KA-02-EF-9012', pickup_name: 'Stop D - Highway Junction', driver_name: 'Ramesh', driver_contact: '9988776644', fees: '3000.00' },
        { class: 'Class 3', section: 'A', admission_no: '18004', firstname: 'Sneha', middlename: '', lastname: 'Patel', id: 104, mobileno: '9876543216', father_name: 'Dinesh Patel', route_title: 'Route 3 - Ring Road', vehicle_no: 'KA-03-GH-3456', pickup_name: 'Stop F - Ring Road Start', driver_name: 'Mohan', driver_contact: '9988776633', fees: '3500.00' },
        { class: 'Class 1', section: 'B', admission_no: '18005', firstname: 'Vikram', middlename: '', lastname: 'Reddy', id: 105, mobileno: '9876543218', father_name: 'Krishna Reddy', route_title: 'Route 4 - Market Area', vehicle_no: 'KA-04-KL-2345', pickup_name: 'Stop I - Market Gate', driver_name: 'Ganesh', driver_contact: '9988776622', fees: '2000.00' },
    ];

    // When class changes, load sections
    useEffect(() => {
        if (classId) {
            const sections = sectionsMap[classId] || [];
            setSectionOptions(sections);
        } else {
            setSectionOptions([]);
        }
        setSectionId('');
    }, [classId]);

    // When route changes, load pickup points and vehicles
    useEffect(() => {
        if (transportRouteId) {
            const pickups = pickupPointsMap[transportRouteId] || [];
            const vehicles = vehiclesMap[transportRouteId] || [];
            setPickupPointOptions(pickups);
            setVehicleOptions(vehicles);
        } else {
            setPickupPointOptions([]);
            setVehicleOptions([]);
        }
        setPickupPointId('');
        setVehicleId('');
    }, [transportRouteId]);

    // Get full name
    const getFullName = (firstname, middlename, lastname) => {
        let name = firstname || '';
        if (middlename) name += ' ' + middlename;
        if (lastname) name += ' ' + lastname;
        return name.trim();
    };

    // Format amount
    const amountFormat = (amount) => {
        if (!amount) return '0.00';
        return parseFloat(amount).toFixed(2);
    };

    // Handle Search
    const handleSearch = (e) => {
        e.preventDefault();
        setErrors({});

        setLoading(true);
        setSearched(true);

        // Simulate API call
        setTimeout(() => {
            let filteredData = [...mockStudentData];

            // Filter by route if selected
            if (transportRouteId) {
                const route = vehRouteList.find(r => r.id === parseInt(transportRouteId));
                if (route) {
                    filteredData = filteredData.filter(s => s.route_title === route.route_title);
                }
            }

            // Filter by pickup point if selected
            if (pickupPointId) {
                const pickup = pickupPointOptions.find(p => p.pickup_point_id === parseInt(pickupPointId));
                if (pickup) {
                    filteredData = filteredData.filter(s => s.pickup_name === pickup.pickup_point);
                }
            }

            // Filter by vehicle if selected
            if (vehicleId) {
                const vehicle = vehicleOptions.find(v => v.id === parseInt(vehicleId));
                if (vehicle) {
                    filteredData = filteredData.filter(s => s.vehicle_no === vehicle.vehicle_no);
                }
            }

            setResultList(filteredData);
            setLoading(false);
        }, 500);
    };

    // Table search filter
    const filteredResults = resultList.filter(s =>
        Object.values(s).some(val =>
            String(val).toLowerCase().includes(tableSearch.toLowerCase())
        )
    );

    // Table action handlers
    const handleCopy = () => {
        const headers = 'Class\tAdmission No\tStudent Name\tMobile Number\tFather Name\tRoute Title\tVehicle Number\tPickup Point\tDriver Name\tDriver Contact\tFare';
        const text = filteredResults.map(s =>
            `${s.class} - ${s.section}\t${s.admission_no}\t${getFullName(s.firstname, s.middlename, s.lastname)}\t${s.mobileno}\t${s.father_name}\t${s.route_title}\t${s.vehicle_no}\t${s.pickup_name}\t${s.driver_name}\t${s.driver_contact}\t${amountFormat(s.fees)}`
        ).join('\n');
        navigator.clipboard.writeText(headers + '\n' + text);
        alert('Copied to clipboard!');
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ minHeight: '946px' }}>
                <section className="content">
                    <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="box-title"><i className="fa fa-search"></i> Student Transport Details</h3>
                        <button onClick={() => navigate('/admin/reports/student_information')} className="btn btn-primary btn-sm">
                            <i className="fa fa-arrow-left"></i> Back
                        </button>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                {/* Select Criteria Header */}
                                <div className="box-header with-border">
                                    <h3 className="box-title"><i className="fa fa-search"></i> Select Criteria</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => navigate('/admin/reports/student_information')} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>

                                {/* Search Form */}
                                <form role="form" onSubmit={handleSearch}>
                                    <div className="box-body row">
                                        {/* Class Dropdown */}
                                        <div className="col-sm-3 col-md-3">
                                            <div className="form-group">
                                                <label>Class</label>
                                                <select
                                                    autoFocus
                                                    id="class_id"
                                                    name="class_id"
                                                    className="form-control"
                                                    value={classId}
                                                    onChange={(e) => setClassId(e.target.value)}
                                                >
                                                    <option value="">Select</option>
                                                    {classList.map((cls) => (
                                                        <option key={cls.id} value={cls.id}>{cls.class}</option>
                                                    ))}
                                                </select>
                                                {errors.class_id && (
                                                    <span className="text-danger">{errors.class_id}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Section Dropdown */}
                                        <div className="col-sm-3 col-md-3">
                                            <div className="form-group">
                                                <label>Section</label>
                                                <select
                                                    id="section_id"
                                                    name="section_id"
                                                    className="form-control"
                                                    value={sectionId}
                                                    onChange={(e) => setSectionId(e.target.value)}
                                                >
                                                    <option value="">Select</option>
                                                    {sectionOptions.map((sec) => (
                                                        <option key={sec.section_id} value={sec.section_id}>{sec.section}</option>
                                                    ))}
                                                </select>
                                                {errors.section_id && (
                                                    <span className="text-danger">{errors.section_id}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Route List Dropdown */}
                                        <div className="col-sm-3 col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="transport_route_id">Route List</label>
                                                <select
                                                    className="form-control"
                                                    id="transport_route_id"
                                                    name="transport_route_id"
                                                    value={transportRouteId}
                                                    onChange={(e) => setTransportRouteId(e.target.value)}
                                                >
                                                    <option value="">Select</option>
                                                    {vehRouteList.map((route) => (
                                                        <option key={route.id} value={route.id}>{route.route_title}</option>
                                                    ))}
                                                </select>
                                                {errors.transport_fees && (
                                                    <span className="text-danger">{errors.transport_fees}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Pickup Point Dropdown */}
                                        <div className="col-sm-3 col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="pickup_point_id">Pickup Point</label>
                                                <select
                                                    className="form-control"
                                                    id="pickup_point_id"
                                                    name="pickup_point_id"
                                                    value={pickupPointId}
                                                    onChange={(e) => setPickupPointId(e.target.value)}
                                                >
                                                    <option value="">Select</option>
                                                    {pickupPointOptions.map((point) => (
                                                        <option key={point.pickup_point_id} value={point.pickup_point_id}>{point.pickup_point}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Vehicle Dropdown */}
                                        <div className="col-sm-3 col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="vehicle_id">Vehicle</label>
                                                <select
                                                    className="form-control"
                                                    id="vehicle_id"
                                                    name="vehicle_id"
                                                    value={vehicleId}
                                                    onChange={(e) => setVehicleId(e.target.value)}
                                                >
                                                    <option value="">Select</option>
                                                    {vehicleOptions.map((vehicle) => (
                                                        <option key={vehicle.id} value={vehicle.id}>{vehicle.vehicle_no}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Search Button */}
                                        <div className="form-group">
                                            <div className="col-sm-12">
                                                <button type="submit" name="search" value="search_filter" className="btn btn-primary btn-sm checkbox-toggle pull-right">
                                                    <i className="fa fa-search"></i> Search
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>

                                {/* Student Transport Report Table Section */}
                                <div className="">
                                    <div className="box-header ptbnull"></div>
                                    <div className="box-header ptbnull">
                                        <h3 className="box-title titlefix"><i className="fa fa-users"></i> Student Transport Report</h3>
                                    </div>
                                    <div className="box-body table-responsive">
                                        {/* Download Label */}
                                        <div className="download_label" style={{ display: 'none' }}>
                                            Student Transport Report
                                        </div>

                                        {/* Table toolbar */}
                                        <div className="row mb10">
                                            <div className="col-sm-12">
                                                <div className="pull-left">
                                                    <div className="form-group mb0" style={{ paddingBottom: '5px' }}>
                                                        <i className="fa fa-search" style={{ color: '#999', marginRight: '5px' }}></i>
                                                        <input
                                                            type="text"
                                                            className="form-control input-sm"
                                                            placeholder="Search..."
                                                            style={{ width: '200px', border: 'none', display: 'inline-block', background: 'transparent', boxShadow: 'none' }}
                                                            value={tableSearch}
                                                            onChange={(e) => setTableSearch(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="pull-right">
                                                    <div className="dt-buttons btn-group" style={{ paddingBottom: '2px' }}>
                                                        <button className="btn btn-default dt-button" title="Copy" onClick={handleCopy} style={{ border: 'none', padding: '5px 5px', background: 'transparent', boxShadow: 'none' }}><i className="fa fa-copy"></i></button>
                                                        <button className="btn btn-default dt-button" title="Excel" style={{ border: 'none', padding: '5px 5px', background: 'transparent', boxShadow: 'none' }}><i className="fa fa-file-excel-o"></i></button>
                                                        <button className="btn btn-default dt-button" title="CSV" style={{ border: 'none', padding: '5px 5px', background: 'transparent', boxShadow: 'none' }}><i className="fa fa-file-text-o"></i></button>
                                                        <button className="btn btn-default dt-button" title="PDF" style={{ border: 'none', padding: '5px 5px', background: 'transparent', boxShadow: 'none' }}><i className="fa fa-file-pdf-o"></i></button>
                                                        <button className="btn btn-default dt-button" title="Print" onClick={handlePrint} style={{ border: 'none', padding: '5px 5px', background: 'transparent', boxShadow: 'none' }}><i className="fa fa-print"></i></button>
                                                        <button className="btn btn-default dt-button" title="Columns" style={{ border: 'none', padding: '5px 5px', background: 'transparent', boxShadow: 'none' }}><i className="fa fa-columns"></i></button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Data Table */}
                                        <table className="table table-striped table-bordered table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Class</th>
                                                    <th>Admission No</th>
                                                    <th>Student Name</th>
                                                    <th>Mobile Number</th>
                                                    <th>Father Name</th>
                                                    <th>Route Title</th>
                                                    <th>Vehicle Number</th>
                                                    <th>Pickup Point</th>
                                                    <th>Driver Name</th>
                                                    <th>Driver Contact</th>
                                                    <th className="text-right" style={{ width: '8%' }}>Fare ({currencySymbol})</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr><td colSpan="11" className="text-center">Loading...</td></tr>
                                                ) : !searched ? (
                                                    <tr><td colSpan="11" className="text-center">No data available in table</td></tr>
                                                ) : filteredResults.length === 0 ? (
                                                    <tr><td colSpan="11" className="text-center">No data available in table</td></tr>
                                                ) : (
                                                    filteredResults.map((student, index) => (
                                                        <tr key={student.id || index}>
                                                            <td>{student.class} - {student.section}</td>
                                                            <td>{student.admission_no}</td>
                                                            <td>
                                                                <a href={`/student/view/${student.id}`} onClick={(e) => { e.preventDefault(); navigate(`/student/view/${student.id}`); }}>
                                                                    {getFullName(student.firstname, student.middlename, student.lastname)}
                                                                </a>
                                                            </td>
                                                            <td>{student.mobileno}</td>
                                                            <td>{student.father_name}</td>
                                                            <td>{student.route_title}</td>
                                                            <td>{student.vehicle_no}</td>
                                                            <td>{student.pickup_name}</td>
                                                            <td>{student.driver_name}</td>
                                                            <td>{student.driver_contact}</td>
                                                            <td className="text-right">{amountFormat(student.fees)}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>

                                        {/* Record count and pagination */}
                                        <div className="row" style={{ marginTop: '10px' }}>
                                            <div className="col-sm-5">
                                                <div className="dataTables_info" style={{ paddingLeft: '10px', fontSize: '12px' }}>
                                                    Records: {filteredResults.length > 0 ? 1 : 0} to {filteredResults.length} of {filteredResults.length}
                                                    {tableSearch && resultList.length !== filteredResults.length && ` (filtered from ${resultList.length} total)`}
                                                </div>
                                            </div>
                                            <div className="col-sm-7">
                                                <div className="dataTables_paginate paging_simple_numbers" style={{ textAlign: 'right', paddingRight: '10px' }}>
                                                    <ul className="pagination" style={{ margin: '0', float: 'right', fontSize: '12px' }}>
                                                        <li className="paginate_button previous disabled">
                                                            <a href="#" onClick={(e) => e.preventDefault()} style={{ padding: '5px 10px', border: 'none', background: 'transparent' }}>&lt;</a>
                                                        </li>
                                                        <li className="paginate_button active">
                                                            <a href="#" onClick={(e) => e.preventDefault()} style={{ padding: '5px 10px' }}>1</a>
                                                        </li>
                                                        <li className="paginate_button next disabled">
                                                            <a href="#" onClick={(e) => e.preventDefault()} style={{ padding: '5px 10px', border: 'none', background: 'transparent' }}>&gt;</a>
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
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default StudentTransportDetails;
