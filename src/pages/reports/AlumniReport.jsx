import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import '../../styles/reports.css';

const AlumniReport = () => {
    const navigate = useNavigate();

    // Form states
    const [sessionId, setSessionId] = useState('');
    const [classId, setClassId] = useState('');
    const [sectionId, setSectionId] = useState('');

    // Validation errors
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    // Data states
    const [sectionOptions, setSectionOptions] = useState([]);
    const [resultList, setResultList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    // Table controls
    const [tableSearch, setTableSearch] = useState('');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState({
        student_id: '',
        id: '',
        current_phone: '',
        current_email: '',
        occupation: '',
        address: '',
        file: null,
    });

    // Mock Data - Sessions
    const sessionList = [
        { id: 1, session: '2016-17' },
        { id: 2, session: '2017-18' },
        { id: 3, session: '2018-19' },
        { id: 4, session: '2019-20' },
        { id: 5, session: '2020-21' },
        { id: 6, session: '2021-22' },
        { id: 7, session: '2022-23' },
        { id: 8, session: '2023-24' },
        { id: 9, session: '2024-25' },
        { id: 10, session: '2025-26' },
    ];

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

    // Mock Data - Alumni students
    const mockAlumniData = [
        { id: 101, admission_no: '18001', firstname: 'Rahul', middlename: '', lastname: 'Kumar', class: 'Class 10', gender: 'Male', current_email: 'rahul.kumar@gmail.com', dob: '2005-05-15', current_address: '123 Main Street', city: 'Delhi', occupation: 'Software Engineer', current_phone: '9876543210' },
        { id: 102, admission_no: '18002', firstname: 'Priya', middlename: '', lastname: 'Sharma', class: 'Class 10', gender: 'Female', current_email: 'priya.sharma@gmail.com', dob: '2005-08-20', current_address: '456 Park Avenue', city: 'Mumbai', occupation: 'Doctor', current_phone: '9876543212' },
        { id: 103, admission_no: '18003', firstname: 'Amit', middlename: 'Kumar', lastname: 'Singh', class: 'Class 10', gender: 'Male', current_email: 'amit.singh@gmail.com', dob: '2005-01-10', current_address: '789 Gandhi Road', city: 'Chennai', occupation: 'Teacher', current_phone: '9876543214' },
        { id: 104, admission_no: '18004', firstname: 'Sneha', middlename: '', lastname: 'Patel', class: 'Class 10', gender: 'Female', current_email: 'sneha.patel@gmail.com', dob: '2005-11-25', current_address: '321 Lake View', city: 'Bangalore', occupation: 'Business', current_phone: '9876543216' },
        { id: 105, admission_no: '18005', firstname: 'Vikram', middlename: '', lastname: 'Reddy', class: 'Class 10', gender: 'Male', current_email: '', dob: '2005-03-08', current_address: '654 Hill Top', city: 'Hyderabad', occupation: '', current_phone: '' },
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

    // Get full name
    const getFullName = (firstname, middlename, lastname) => {
        let name = firstname || '';
        if (middlename) name += ' ' + middlename;
        if (lastname) name += ' ' + lastname;
        return name.trim();
    };

    // Format date
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Build title
    const getTitle = () => {
        let title = 'Alumni Report';
        if (sessionId) {
            const session = sessionList.find(s => s.id === parseInt(sessionId));
            if (session) title += ` - ${session.session}`;
        }
        if (classId) {
            const cls = classList.find(c => c.id === parseInt(classId));
            if (cls) title += ` - ${cls.class}`;
        }
        if (sectionId) {
            const sec = sectionOptions.find(s => s.section_id === parseInt(sectionId));
            if (sec) title += ` (${sec.section})`;
        }
        return title;
    };

    // Handle Search
    const handleSearch = (e) => {
        e.preventDefault();

        // Validate
        const newErrors = {};
        if (!sessionId) {
            newErrors.session_id = 'The Pass Out Session field is required.';
        }
        if (!classId) {
            newErrors.class_id = 'The Class field is required.';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        setLoading(true);
        setSearched(true);

        // Simulate API call
        setTimeout(() => {
            setResultList(mockAlumniData);
            setLoading(false);
        }, 500);
    };

    // Table search filter
    const filteredResults = resultList.filter(s =>
        Object.values(s).some(val =>
            String(val).toLowerCase().includes(tableSearch.toLowerCase())
        )
    );

    // Handle Add Alumni (open modal)
    const handleAddAlumni = (studentId) => {
        // Find student data
        const student = resultList.find(s => s.id === studentId);
        if (student) {
            setModalData({
                student_id: student.id,
                id: student.id,
                current_phone: student.current_phone || '',
                current_email: student.current_email || '',
                occupation: student.occupation || '',
                address: student.current_address || '',
                file: null,
            });
        }
        setShowModal(true);
    };

    // Handle modal input change
    const handleModalChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setModalData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setModalData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Handle modal submit
    const handleModalSubmit = (e) => {
        e.preventDefault();

        // Simulate save
        setSuccessMessage('Alumni details saved successfully.');
        setShowModal(false);

        // Update the result list with new data
        setResultList(prev => prev.map(s => {
            if (s.id === modalData.student_id) {
                return {
                    ...s,
                    current_phone: modalData.current_phone,
                    current_email: modalData.current_email,
                    occupation: modalData.occupation,
                    current_address: modalData.address,
                };
            }
            return s;
        }));

        setTimeout(() => setSuccessMessage(''), 3000);
    };

    // Table action handlers
    const handleCopy = () => {
        const headers = 'Admission No\tStudent Name\tClass\tGender\tCurrent Email\tDate of Birth\tCurrent Address\tOccupation\tCurrent Phone';
        const text = filteredResults.map(s =>
            `${s.admission_no}\t${getFullName(s.firstname, s.middlename, s.lastname)}\t${s.class}\t${s.gender}\t${s.current_email}\t${formatDate(s.dob)}\t${s.current_address} ${s.city}\t${s.occupation}\t${s.current_phone}`
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
                        <h3 className="box-title"><i className="fa fa-user-plus"></i> Alumni Report</h3>
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
                                </div>

                                {/* Search Form */}
                                <div className="box-body">
                                    {successMessage && (
                                        <div className="alert alert-success">{successMessage}</div>
                                    )}

                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="row">
                                                <form role="form" onSubmit={handleSearch}>
                                                    {/* Pass Out Session Dropdown */}
                                                    <div className="col-sm-4">
                                                        <div className="form-group">
                                                            <label>Pass Out Session</label><small className="req"> *</small>
                                                            <select
                                                                autoFocus
                                                                id="session_id"
                                                                name="session_id"
                                                                className="form-control"
                                                                value={sessionId}
                                                                onChange={(e) => setSessionId(e.target.value)}
                                                            >
                                                                <option value="">Select</option>
                                                                {sessionList.map((session) => (
                                                                    <option key={session.id} value={session.id}>{session.session}</option>
                                                                ))}
                                                            </select>
                                                            {errors.session_id && (
                                                                <span className="text-danger">{errors.session_id}</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Class Dropdown */}
                                                    <div className="col-sm-4">
                                                        <div className="form-group">
                                                            <label>Class</label><small className="req"> *</small>
                                                            <select
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
                                                    <div className="col-sm-4">
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

                                                    {/* Search Button */}
                                                    <div className="col-sm-12">
                                                        <div className="form-group">
                                                            <button type="submit" name="search" value="search_filter" className="btn btn-primary btn-sm pull-right checkbox-toggle">
                                                                <i className="fa fa-search"></i> Search
                                                            </button>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                        {/* empty col-md-2 as in original */}
                                        <div className="col-md-2">
                                            <div className="row"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Alumni Report Table - shown after search */}
                                {searched && (
                                    <div className="nav-tabs-custom border0 navnoshadow">
                                        <div className="box-header ptbnull">
                                            <h3 className="box-title titlefix"><i className="fa fa-users"></i> {getTitle()}</h3>
                                        </div>

                                        <div className="tab-content">
                                            <div className="download_label" style={{ display: 'none' }}>{getTitle()}</div>

                                            {/* Table toolbar */}
                                            <div className="row mb10" style={{ padding: '0 10px' }}>
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

                                            <div className="tab-pane active table-responsive no-padding">
                                                <table className="table table-striped table-bordered table-hover" cellSpacing="0" style={{ width: '100%' }}>
                                                    <thead>
                                                        <tr>
                                                            <th>Admission No</th>
                                                            <th>Student Name</th>
                                                            <th>Class</th>
                                                            <th>Gender</th>
                                                            <th>Current Email</th>
                                                            <th>Date of Birth</th>
                                                            <th>Current Address</th>
                                                            <th>Occupation</th>
                                                            <th>Current Phone</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {loading ? (
                                                            <tr><td colSpan="9" className="text-center">Loading...</td></tr>
                                                        ) : filteredResults.length === 0 ? (
                                                            <tr><td colSpan="9" className="text-center">No data available in table</td></tr>
                                                        ) : (
                                                            filteredResults.map((student, index) => (
                                                                <tr key={student.id || index}>
                                                                    <td>{student.admission_no}</td>
                                                                    <td>{getFullName(student.firstname, student.middlename, student.lastname)}</td>
                                                                    <td>{student.class}</td>
                                                                    <td>{student.gender}</td>
                                                                    <td>{student.current_email}</td>
                                                                    <td>{formatDate(student.dob)}</td>
                                                                    <td>{student.current_address} {student.city}</td>
                                                                    <td>{student.occupation}</td>
                                                                    <td>{student.current_phone}</td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Record count and pagination */}
                                            <div className="row" style={{ marginTop: '10px', padding: '0 10px' }}>
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
                                )}
                            </div>{/* ./box box-primary */}
                        </div>
                    </div>
                </section>
            </div>

            {/* Add Alumni Details Modal */}
            {showModal && (
                <div className="modal fade in" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', paddingLeft: '0px', zIndex: 1050 }}>
                    <div className="modal-dialog modal-lg" role="document">
                        <div className="modal-content modal-media-content">
                            <div className="modal-header modal-media-header">
                                <button type="button" className="close" onClick={() => setShowModal(false)}>&times;</button>
                                <h4 className="box-title"> Add Alumni Details</h4>
                            </div>
                            <div className="modal-body pt0 pb0">
                                <form id="formadd" onSubmit={handleModalSubmit} className="ptt10" encType="multipart/form-data">
                                    <div className="row">
                                        <div className="col-lg-12 col-md-12 col-sm-12">
                                            <div className="row">
                                                <input type="hidden" id="student_id" name="student_id" value={modalData.student_id} />
                                                <input type="hidden" id="id" name="id" value={modalData.id} />

                                                {/* Current Phone */}
                                                <div className="col-sm-6">
                                                    <div className="form-group">
                                                        <label htmlFor="current_phone">Current Phone</label><small className="req"> *</small>
                                                        <input
                                                            type="text"
                                                            id="current_phone"
                                                            name="current_phone"
                                                            className="form-control"
                                                            value={modalData.current_phone}
                                                            onChange={handleModalChange}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Current Email */}
                                                <div className="col-sm-6">
                                                    <div className="form-group">
                                                        <label htmlFor="current_email">Current Email</label>
                                                        <input
                                                            type="text"
                                                            id="current_email"
                                                            name="current_email"
                                                            className="form-control"
                                                            value={modalData.current_email}
                                                            onChange={handleModalChange}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Occupation */}
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label htmlFor="occupation">Occupation</label>
                                                        <textarea
                                                            name="occupation"
                                                            id="occupation"
                                                            className="form-control"
                                                            value={modalData.occupation}
                                                            onChange={handleModalChange}
                                                        ></textarea>
                                                    </div>
                                                </div>

                                                {/* Address */}
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label htmlFor="address">Address</label>
                                                        <textarea
                                                            name="address"
                                                            id="address"
                                                            className="form-control"
                                                            value={modalData.address}
                                                            onChange={handleModalChange}
                                                        ></textarea>
                                                    </div>
                                                </div>

                                                {/* Photo */}
                                                <div className="col-sm-12">
                                                    <div className="form-group">
                                                        <label htmlFor="file">Photo</label>
                                                        <input
                                                            type="file"
                                                            id="file"
                                                            name="file"
                                                            className="form-control"
                                                            onChange={handleModalChange}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="box-footer">
                                        <div className="pull-right" style={{ padding: '10px' }}>
                                            <button type="submit" className="btn btn-info" id="submit">Save</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div >
    );
};

export default AlumniReport;
