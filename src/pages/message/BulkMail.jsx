import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import '../../utils/include_files';

const BulkMail = () => {
    const navigate = useNavigate();

    // Form states
    const [classId, setClassId] = useState('');
    const [sectionId, setSectionId] = useState('');
    const [messageTo, setMessageTo] = useState('');
    const [notificationType, setNotificationType] = useState('');
    const [showResult, setShowResult] = useState(false);

    // Data states
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [checkAll, setCheckAll] = useState(false);

    // Search and Pagination states
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Mock data initialization
    useEffect(() => {
        setClasses([
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

        setSections([
            { id: 1, section: 'A' },
            { id: 2, section: 'B' },
            { id: 3, section: 'C' },
        ]);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        // Mock student data
        setStudents([
            { id: 1, admission_no: '18001', firstname: 'John', middlename: '', lastname: 'Doe', class: 'Class 1', section: 'A', dob: '2010-05-15', gender: 'Male', mobileno: '9876543210' },
            { id: 2, admission_no: '18002', firstname: 'Jane', middlename: '', lastname: 'Smith', class: 'Class 1', section: 'A', dob: '2010-08-20', gender: 'Female', mobileno: '9876543211' },
            { id: 3, admission_no: '18003', firstname: 'Robert', middlename: 'J', lastname: 'Wilson', class: 'Class 1', section: 'A', dob: '2010-03-10', gender: 'Male', mobileno: '9876543212' },
            { id: 4, admission_no: '18004', firstname: 'Alice', middlename: '', lastname: 'Brown', class: 'Class 1', section: 'A', dob: '2010-11-25', gender: 'Female', mobileno: '9876543213' },
            { id: 5, admission_no: '18005', firstname: 'Michael', middlename: '', lastname: 'Davis', class: 'Class 1', section: 'A', dob: '2010-06-12', gender: 'Male', mobileno: '9876543214' },
        ]);
        setShowResult(true);
    };

    const handleCheckAll = () => {
        const newCheckAll = !checkAll;
        setCheckAll(newCheckAll);
        if (newCheckAll) {
            setSelectedStudents(filteredStudents.map(s => s.id));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleStudentCheck = (id) => {
        if (selectedStudents.includes(id)) {
            setSelectedStudents(selectedStudents.filter(sid => sid !== id));
            setCheckAll(false);
        } else {
            const nextSelected = [...selectedStudents, id];
            setSelectedStudents(nextSelected);
            if (nextSelected.length === filteredStudents.length) {
                setCheckAll(true);
            }
        }
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (selectedStudents.length === 0) {
            alert('Atleast one student should be select');
            return;
        }
        if (!messageTo) {
            alert('Please select Message To');
            return;
        }
        if (!notificationType) {
            alert('Please select Notification Type');
            return;
        }

        alert('Mail/SMS sent successfully!');
    };

    // Filter and Pagination logic
    const filteredStudents = students.filter(s =>
        s.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.admission_no.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '658px', marginTop: '16px' }}>
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
                                <div className="box-body">
                                    <form onSubmit={handleSearch}>
                                        <div className="row">
                                            <div className="col-sm-6">
                                                <div className="form-group">
                                                    <label>Class <small className="req"> *</small></label>
                                                    <select
                                                        autoFocus
                                                        id="class_id"
                                                        className="form-control"
                                                        value={classId}
                                                        onChange={(e) => setClassId(e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Select</option>
                                                        {classes.map(c => (
                                                            <option key={c.id} value={c.id}>{c.class}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="form-group">
                                                    <label>Section</label>
                                                    <select
                                                        id="section_id"
                                                        className="form-control"
                                                        value={sectionId}
                                                        onChange={(e) => setSectionId(e.target.value)}
                                                    >
                                                        <option value="">Select</option>
                                                        {sections.map(s => (
                                                            <option key={s.id} value={s.id}>{s.section}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-sm-12">
                                                <div className="form-group">
                                                    <button type="submit" className="btn btn-primary btn-sm pull-right">
                                                        <i className="fa fa-search"></i> Search
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                {showResult && (
                                    <div className="box-body bordertop">
                                        <div className="row">
                                            <div className="col-md-12 col-sm-12">
                                                <form onSubmit={handleSend}>
                                                    <div className="row">
                                                        <div className="col-md-12 col-sm-12">
                                                            <div className="col-sm-2">
                                                                <div className="form-group">
                                                                    <label>Select All </label><br />
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={checkAll}
                                                                        onChange={handleCheckAll}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-sm-3">
                                                                <div className="form-group">
                                                                    <label>Message To <small className="req"> *</small></label>
                                                                    <select
                                                                        id="message_to"
                                                                        className="form-control"
                                                                        value={messageTo}
                                                                        onChange={(e) => setMessageTo(e.target.value)}
                                                                    >
                                                                        <option value="">Select</option>
                                                                        <option value="student">Student</option>
                                                                        <option value="parent">Parent</option>
                                                                        <option value="both">Both</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="col-sm-3">
                                                                <div className="form-group">
                                                                    <label>Notification Type <small className="req"> *</small></label>
                                                                    <select
                                                                        id="notification_type"
                                                                        className="form-control"
                                                                        value={notificationType}
                                                                        onChange={(e) => setNotificationType(e.target.value)}
                                                                    >
                                                                        <option value="">Select</option>
                                                                        <option value="email">Student Admission</option>
                                                                        <option value="sms">Login Credential</option>
                                                                        <option value="both">Both</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div style={{ overflow: 'visible' }}>
                                                        <div className="download_label">Bulk Mail</div>
                                                        <div style={{ overflow: 'visible' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                                                                <div className="dataTables_filter" style={{ textAlign: 'left', width: '300px' }}>
                                                                    <input
                                                                        type="search"
                                                                        placeholder="Search..."
                                                                        className="form-control"
                                                                        value={searchTerm}
                                                                        onChange={(e) => {
                                                                            setSearchTerm(e.target.value);
                                                                            setCurrentPage(1);
                                                                        }}
                                                                        style={{ border: '0', borderBottom: '1px solid #f4f4f4', background: 'transparent', boxShadow: 'none' }}
                                                                    />
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

                                                            <div style={{ overflow: 'visible' }}>
                                                                <table className="table table-striped table-bordered table-hover" style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '0' }}>
                                                                    <thead>
                                                                        <tr>
                                                                            <th>#</th>
                                                                            <th>Admission No.</th>
                                                                            <th>Student Name</th>
                                                                            <th>Class</th>
                                                                            <th>Date of Birth</th>
                                                                            <th>Gender</th>
                                                                            <th>Mobile Number</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {currentItems.map((student) => (
                                                                            <tr key={student.id}>
                                                                                <td>
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={selectedStudents.includes(student.id)}
                                                                                        onChange={() => handleStudentCheck(student.id)}
                                                                                    />
                                                                                </td>
                                                                                <td>{student.admission_no}</td>
                                                                                <td>
                                                                                    <a href="#">{`${student.firstname} ${student.middlename ? student.middlename + ' ' : ''}${student.lastname}`}</a>
                                                                                </td>
                                                                                <td>{`${student.class} (${student.section})`}</td>
                                                                                <td>{student.dob}</td>
                                                                                <td>{student.gender}</td>
                                                                                <td>{student.mobileno}</td>
                                                                            </tr>
                                                                        ))}
                                                                        {currentItems.length === 0 && (
                                                                            <tr>
                                                                                <td colSpan="7" className="text-center">No record found</td>
                                                                            </tr>
                                                                        )}
                                                                    </tbody>
                                                                </table>
                                                            </div>

                                                            <div className="row" style={{ marginTop: '10px' }}>
                                                                <div className="col-sm-5">
                                                                    <div className="dataTables_info" role="status" aria-live="polite" style={{ fontSize: '11px', color: '#666' }}>
                                                                        Records: {filteredStudents.length === 0 ? '0 to 0 of 0' : `${indexOfFirstItem + 1} to ${Math.min(indexOfLastItem, filteredStudents.length)} of ${filteredStudents.length}`}
                                                                    </div>
                                                                </div>
                                                                <div className="col-sm-7">
                                                                    <div className="pull-right">
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

                                                            {filteredStudents.length > 0 && (
                                                                <button type="submit" className="btn btn-primary pull-right btn-sm mt10">
                                                                    Send
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default BulkMail;
