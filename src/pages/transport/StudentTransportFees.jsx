import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';

const StudentTransportFees = () => {
    const navigate = useNavigate();

    // Search States
    const [classId, setClassId] = useState('');
    const [sectionId, setSectionId] = useState('');

    // Data States
    const [classlist, setClasslist] = useState([]);
    const [sectionlist, setSectionlist] = useState([]);
    const [students, setStudents] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Modal Data
    const [transportMonths, setTransportMonths] = useState([]);
    const [isAllSelected, setIsAllSelected] = useState(false);

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Mock initial data
    useEffect(() => {
        setClasslist([
            { id: 0, class: 'Nursery' },
            { id: 1, class: 'L.K.G' },
            { id: 2, class: 'U.K.G' },
            { id: 3, class: 'Class 1' },
            { id: 4, class: 'Class 2' },
            { id: 5, class: 'Class 3' },
            { id: 6, class: 'Class 4' },
            { id: 7, class: 'Class 5' },
            { id: 8, class: 'Class 6' },
            { id: 9, class: 'Class 7' },
            { id: 10, class: 'Class 8' },
            { id: 11, class: 'Class 9' },
            { id: 12, class: 'Class 10' },
            { id: 13, class: '11' }
        ]);

        setSectionlist([
            { id: 1, section: 'A', class_id: 1 },
            { id: 2, section: 'B', class_id: 1 },
        ]);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        // Mock student search results
        setStudents([
            {
                id: 1,
                admission_no: '101',
                firstname: 'John',
                middlename: '',
                lastname: 'Doe',
                class: 'Class 1',
                section: 'A',
                father_name: 'Robert Doe',
                dob: '2015-05-20',
                route_title: 'Route A',
                vehicle_no: 'VH-001',
                pickup_point: 'Main Street Gate',
                student_session_id: 501,
                route_pickup_point_id: 10
            },
            {
                id: 2,
                admission_no: '102',
                firstname: 'Jane',
                middlename: '',
                lastname: 'Smith',
                class: 'Class 1',
                section: 'A',
                father_name: 'William Smith',
                dob: '2016-03-12',
                route_title: 'Route B',
                vehicle_no: 'VH-002',
                pickup_point: 'North Gate',
                student_session_id: 502,
                route_pickup_point_id: 11
            }
        ]);
    };

    const handleOpenModal = (student) => {
        setSelectedStudent(student);
        // Mock transport months data
        setTransportMonths([
            { id: 1, month: 'April', due_date: '2024-04-10', fine_type: 'none', fine_amount: 0, fine_percentage: 0, is_assigned: true },
            { id: 2, month: 'May', due_date: '2024-05-10', fine_type: 'fix', fine_amount: 50, fine_percentage: 0, is_assigned: false },
            { id: 3, month: 'June', due_date: '2024-06-10', fine_type: 'percentage', fine_amount: 0, fine_percentage: 5, is_assigned: false },
        ]);
        setShowModal(true);
    };

    const handleToggleMonth = (id) => {
        setTransportMonths(prev => prev.map(m =>
            m.id === id ? { ...m, is_assigned: !m.is_assigned } : m
        ));
    };

    const handleToggleAll = () => {
        const newState = !isAllSelected;
        setIsAllSelected(newState);
        setTransportMonths(prev => prev.map(m => ({ ...m, is_assigned: newState })));
    };

    const handleSaveFees = (e) => {
        e.preventDefault();
        alert('Fees assigned successfully');
        setShowModal(false);
    };

    // Filter Logic
    const filteredStudents = students ? students.filter(student =>
        student.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.admission_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.father_name && student.father_name.toLowerCase().includes(searchTerm.toLowerCase()))
    ) : [];

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '658px', marginTop: '17px' }}>
                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title"><i className="fa fa-search"></i> Select Criteria</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <form onSubmit={handleSearch}>
                                    <div className="box-body">
                                        <div className="row">
                                            <div className="col-lg-6 col-md-6">
                                                <div className="form-group">
                                                    <label>Class</label><small className="req"> *</small>
                                                    <select
                                                        className="form-control"
                                                        value={classId}
                                                        onChange={(e) => setClassId(e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Select</option>
                                                        {classlist.map(c => <option key={c.id} value={c.id}>{c.class}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-lg-6 col-md-6">
                                                <div className="form-group">
                                                    <label>Section</label>
                                                    <select
                                                        className="form-control"
                                                        value={sectionId}
                                                        onChange={(e) => setSectionId(e.target.value)}
                                                    >
                                                        <option value="">Select</option>
                                                        {sectionlist.map(s => <option key={s.id} value={s.id}>{s.section}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-sm-12">
                                                <button type="submit" className="btn btn-primary btn-sm pull-right">
                                                    <i className="fa fa-search"></i> Search
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>

                                {students !== null && (
                                    <div className="ptt10">
                                        <div className="bordertop">
                                            <div className="box-header with-border">
                                                <h3 className="box-title"><i className="fa fa-search"></i> Student Transport Fees</h3>
                                            </div>
                                            <div className="box-body">
                                                <div className="mailbox-messages">
                                                    <div className="download_label">Student Transport Fees</div>

                                                    {/* DataTables Controls */}
                                                    <div className="dataTables_wrapper no-footer">
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                                                            <div className="dataTables_filter" style={{ textAlign: 'left' }}>
                                                                <label>Search:
                                                                    <input
                                                                        type="search"
                                                                        className="form-control input-sm"
                                                                        placeholder=""
                                                                        value={searchTerm}
                                                                        onChange={(e) => {
                                                                            setSearchTerm(e.target.value);
                                                                            setCurrentPage(1);
                                                                        }}
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

                                                        <div className="table-responsive">
                                                            <table className="table table-striped table-bordered table-hover example">
                                                                <thead>
                                                                    <tr>
                                                                        <th>Admission No</th>
                                                                        <th>Student Name</th>
                                                                        <th>Class</th>
                                                                        <th>Father Name</th>
                                                                        <th>Date Of Birth</th>
                                                                        <th>Route Title</th>
                                                                        <th>Vehicle Number</th>
                                                                        <th>Pickup Point</th>
                                                                        <th className="noExport">Action</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {currentItems.map(student => (
                                                                        <tr key={student.id}>
                                                                            <td>{student.admission_no}</td>
                                                                            <td>
                                                                                <span style={{ color: '#337ab7', cursor: 'pointer' }}>
                                                                                    {student.firstname} {student.lastname}
                                                                                </span>
                                                                            </td>
                                                                            <td>{student.class} ({student.section})</td>
                                                                            <td>{student.father_name}</td>
                                                                            <td>{student.dob}</td>
                                                                            <td>{student.route_title}</td>
                                                                            <td>{student.vehicle_no}</td>
                                                                            <td>{student.pickup_point}</td>
                                                                            <td>
                                                                                {student.pickup_point && (
                                                                                    <button
                                                                                        className="btn btn-default btn-xs"
                                                                                        onClick={() => handleOpenModal(student)}
                                                                                        title="Assign Fees"
                                                                                    >
                                                                                        <i className="fa fa-tag"></i>
                                                                                    </button>
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                    {currentItems.length === 0 && (
                                                                        <tr>
                                                                            <td colSpan="9" className="text-center">No Result Found</td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>

                                                        {filteredStudents.length > 0 && (
                                                            <div className="row" style={{ marginTop: '10px' }}>
                                                                <div className="col-sm-5">
                                                                    <div className="dataTables_info" role="status" aria-live="polite">
                                                                        Records {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStudents.length)} of {filteredStudents.length}
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
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Assign Fees Modal */}
            {showModal && selectedStudent && (
                <div className="modal fade in" style={{ display: 'block', paddingRight: '17px' }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <form onSubmit={handleSaveFees}>
                                <div className="modal-header">
                                    <button type="button" className="close" onClick={() => setShowModal(false)}>&times;</button>
                                    <h4 className="modal-title">Assign Fees</h4>
                                </div>
                                <div className="modal-body pb30">
                                    <table className="table table-striped mb0 font13">
                                        <tbody>
                                            <tr>
                                                <th className="bozero">Name</th>
                                                <td className="bozero">{selectedStudent.firstname} {selectedStudent.lastname}</td>
                                                <th className="bozero">Class (Section)</th>
                                                <td className="bozero">{selectedStudent.class} ({selectedStudent.section})</td>
                                            </tr>
                                            <tr>
                                                <th>Father Name</th>
                                                <td>{selectedStudent.father_name}</td>
                                                <th>Admission No</th>
                                                <td>{selectedStudent.admission_no}</td>
                                            </tr>
                                            <tr>
                                                <th>Pickup Point</th>
                                                <td>{selectedStudent.pickup_point}</td>
                                                <th>Fees ($)</th>
                                                <td>500.00</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <hr className="hrexamfirstrow" />

                                    <div className="table-responsive scroll-area" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        <table className="table table-striped table-bordered">
                                            <thead>
                                                <tr>
                                                    <th>
                                                        <div className="chk">
                                                            <input
                                                                type="checkbox"
                                                                checked={isAllSelected}
                                                                onChange={handleToggleAll}
                                                            />
                                                            <label style={{ marginLeft: '5px' }}> Month</label>
                                                        </div>
                                                    </th>
                                                    <th>Due Date</th>
                                                    <th className="text-center">Fine Type</th>
                                                    <th className="text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {transportMonths.map(month => (
                                                    <tr key={month.id}>
                                                        <td>
                                                            <div className="chk">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={month.is_assigned}
                                                                    onChange={() => handleToggleMonth(month.id)}
                                                                />
                                                                <label style={{ marginLeft: '5px' }}> {month.month}</label>
                                                            </div>
                                                        </td>
                                                        <td>{month.due_date}</td>
                                                        <td className="text-center">{month.fine_type}</td>
                                                        <td className="text-right">
                                                            {month.fine_type === 'fix' ? `$${month.fine_amount}` : (month.fine_type === 'percentage' ? `${month.fine_percentage}%` : '-')}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="modal-footer sticky-footer">
                                    <button type="submit" className="btn btn-primary pull-right">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {showModal && <div className="modal-backdrop fade in"></div>}

            <Footer />
        </div>
    );
};

export default StudentTransportFees;
