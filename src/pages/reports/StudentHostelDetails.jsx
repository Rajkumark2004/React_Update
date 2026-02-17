import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import '../../styles/reports.css';

const StudentHostelDetails = () => {
    const navigate = useNavigate();

    // Currency symbol (from school settings)
    const currencySymbol = '$';

    // Form states
    const [classId, setClassId] = useState('');
    const [sectionId, setSectionId] = useState('');
    const [hostelName, setHostelName] = useState('');

    // Validation errors
    const [errors, setErrors] = useState({});

    // Data states
    const [sectionOptions, setSectionOptions] = useState([]);
    const [studentList, setStudentList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    // Table controls
    const [tableSearch, setTableSearch] = useState('');

    // Mock Data - Classes
    const classes = [
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

    // Mock Data - Hostel list
    const hostelList = [
        { hostel_name: 'Boys Hostel' },
        { hostel_name: 'Girls Hostel' },
        { hostel_name: 'Senior Hostel' },
        { hostel_name: 'Junior Hostel' },
    ];

    // Mock Data - Students for table
    const mockStudentData = [
        { class_section: 'Class 1 (A)', admission_no: '18001', student_name: 'Rahul Kumar', mobile_number: '9876543210', guardian_phone: '9876543211', hostel_name: 'Boys Hostel', room_number_name: '101 - Room A', room_type: 'AC', cost_per_bed: '5000.00' },
        { class_section: 'Class 1 (A)', admission_no: '18002', student_name: 'Priya Sharma', mobile_number: '9876543212', guardian_phone: '9876543213', hostel_name: 'Girls Hostel', room_number_name: '201 - Room B', room_type: 'Non AC', cost_per_bed: '3500.00' },
        { class_section: 'Class 1 (B)', admission_no: '18003', student_name: 'Amit Singh', mobile_number: '9876543214', guardian_phone: '9876543215', hostel_name: 'Boys Hostel', room_number_name: '102 - Room C', room_type: 'AC', cost_per_bed: '5000.00' },
        { class_section: 'Class 2 (A)', admission_no: '18004', student_name: 'Sneha Patel', mobile_number: '9876543216', guardian_phone: '9876543217', hostel_name: 'Girls Hostel', room_number_name: '202 - Room D', room_type: 'AC', cost_per_bed: '5500.00' },
        { class_section: 'Class 2 (B)', admission_no: '18005', student_name: 'Vikram Reddy', mobile_number: '9876543218', guardian_phone: '9876543219', hostel_name: 'Senior Hostel', room_number_name: '301 - Room E', room_type: 'Non AC', cost_per_bed: '3000.00' },
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

    // Handle Search
    const handleSearch = (e) => {
        e.preventDefault();

        // Validate
        const newErrors = {};
        if (!classId) {
            newErrors.class_id = 'The Class field is required.';
        }
        if (!sectionId) {
            newErrors.section_id = 'The Section field is required.';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        setLoading(true);
        setSearched(true);

        // Simulate API call
        setTimeout(() => {
            // Filter mock data based on selections
            let filteredData = [...mockStudentData];

            if (hostelName) {
                filteredData = filteredData.filter(s => s.hostel_name === hostelName);
            }

            setStudentList(filteredData);
            setLoading(false);
        }, 500);
    };

    // Table search filter
    const filteredStudents = studentList.filter(s =>
        Object.values(s).some(val =>
            String(val).toLowerCase().includes(tableSearch.toLowerCase())
        )
    );

    // Table action handlers
    const handleCopy = () => {
        const headers = 'Class Section\tAdmission No\tStudent Name\tMobile Number\tGuardian Phone\tHostel Name\tRoom Number/Name\tRoom Type\tCost Per Bed';
        const text = filteredStudents.map(s =>
            `${s.class_section}\t${s.admission_no}\t${s.student_name}\t${s.mobile_number}\t${s.guardian_phone}\t${s.hostel_name}\t${s.room_number_name}\t${s.room_type}\t${s.cost_per_bed}`
        ).join('\n');
        navigator.clipboard.writeText(headers + '\n' + text);
        alert('Copied to clipboard!');
    };

    const handlePrint = () => {
        window.print();
    };

    // Build download label
    const getDownloadLabel = () => {
        let label = 'Student Hostel Report';
        if (classId) {
            const cls = classes.find(c => c.id === parseInt(classId));
            if (cls) label += ` - ${cls.class}`;
        }
        if (sectionId) {
            const sec = sectionOptions.find(s => s.section_id === parseInt(sectionId));
            if (sec) label += ` (${sec.section})`;
        }
        if (hostelName) {
            label += ` - ${hostelName}`;
        }
        return label;
    };

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ minHeight: '946px' }}>
                <section className="content">
                    <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="box-title"><i className="fa fa-search"></i> Student Hostel Details</h3>
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
                                        <button onClick={() => navigate('/admin/reports/student_information')} className="btn btn-primary btn-sm">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>

                                {/* Search Form */}
                                <form role="form" onSubmit={handleSearch} id="class_search_form">
                                    <div className="box-body row">
                                        {/* Class Dropdown */}
                                        <div className="col-sm-4 col-md-4">
                                            <div className="form-group">
                                                <label>Class</label><small className="req"> *</small>
                                                <select
                                                    autoFocus
                                                    id="class_id"
                                                    name="class_id"
                                                    className="form-control"
                                                    value={classId}
                                                    onChange={(e) => setClassId(e.target.value)}
                                                >
                                                    <option value="">Select</option>
                                                    {classes.map((cls) => (
                                                        <option key={cls.id} value={cls.id}>{cls.class}</option>
                                                    ))}
                                                </select>
                                                {errors.class_id && (
                                                    <span className="text-danger" id="error_class_id">{errors.class_id}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Section Dropdown */}
                                        <div className="col-sm-4 col-md-4">
                                            <div className="form-group">
                                                <label>Section</label><small className="req"> *</small>
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
                                                    <span className="text-danger" id="error_section_id">{errors.section_id}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Hostel Name Dropdown */}
                                        <div className="col-sm-4 col-md-4">
                                            <div className="form-group">
                                                <label>Hostel Name</label>
                                                <select
                                                    className="form-control"
                                                    name="hostel_name"
                                                    value={hostelName}
                                                    onChange={(e) => setHostelName(e.target.value)}
                                                >
                                                    <option value="">Select</option>
                                                    {hostelList.map((hostel, index) => (
                                                        <option key={index} value={hostel.hostel_name}>{hostel.hostel_name}</option>
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

                                {/* Student Hostel Report Table Section */}
                                <div className="">
                                    <div className="box-header ptbnull"></div>
                                    <div className="box-header ptbnull">
                                        <h3 className="box-title titlefix"><i className="fa fa-users"></i> Student Hostel Report</h3>
                                    </div>
                                    <div className="box-body table-responsive">
                                        {/* Download Label */}
                                        <div className="download_label" style={{ display: 'none' }}>
                                            {getDownloadLabel()}
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
                                        <table className="table table-striped table-bordered table-hover" data-export-title="Student Hostel Report">
                                            <thead>
                                                <tr>
                                                    <th>Class Section</th>
                                                    <th>Admission No</th>
                                                    <th>Student Name</th>
                                                    <th>Mobile Number</th>
                                                    <th>Guardian Phone</th>
                                                    <th>Hostel Name</th>
                                                    <th>Room Number/Name</th>
                                                    <th>Room Type</th>
                                                    <th className="text-right">Cost Per Bed ({currencySymbol})</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr><td colSpan="9" className="text-center">Loading...</td></tr>
                                                ) : !searched ? (
                                                    <tr><td colSpan="9" className="text-center">No data available in table</td></tr>
                                                ) : filteredStudents.length === 0 ? (
                                                    <tr><td colSpan="9" className="text-center">No data available in table</td></tr>
                                                ) : (
                                                    filteredStudents.map((student, index) => (
                                                        <tr key={index}>
                                                            <td>{student.class_section}</td>
                                                            <td>{student.admission_no}</td>
                                                            <td>{student.student_name}</td>
                                                            <td>{student.mobile_number}</td>
                                                            <td>{student.guardian_phone}</td>
                                                            <td>{student.hostel_name}</td>
                                                            <td>{student.room_number_name}</td>
                                                            <td>{student.room_type}</td>
                                                            <td className="text-right">{student.cost_per_bed}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>

                                        {/* Record count and pagination */}
                                        <div className="row" style={{ marginTop: '10px' }}>
                                            <div className="col-sm-5">
                                                <div className="dataTables_info" style={{ paddingLeft: '10px', fontSize: '12px' }}>
                                                    Records: {filteredStudents.length > 0 ? 1 : 0} to {filteredStudents.length} of {filteredStudents.length}
                                                    {tableSearch && studentList.length !== filteredStudents.length && ` (filtered from ${studentList.length} total)`}
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
                            </div>{/* ./box box-primary */}
                        </div>{/* ./col-md-12 */}
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default StudentHostelDetails;
