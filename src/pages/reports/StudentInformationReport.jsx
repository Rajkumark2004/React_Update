import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import ReportsSidebar from '../../components/ReportsSidebar';
import '../../styles/reports.css';

const StudentInformationReport = () => {
    const navigate = useNavigate();
    const [activeReport, setActiveReport] = useState('Student Report');
    const [searchTerm, setSearchTerm] = useState('');

    // Shared Form states
    const [classId, setClassId] = useState('');
    const [sectionId, setSectionId] = useState('');
    const [admissionDate, setAdmissionDate] = useState('');
    const [searchType, setSearchType] = useState('today');
    const [status, setStatus] = useState('');
    const [admissionYear, setAdmissionYear] = useState('');

    const sisReports = [
        ["Student Report", "Class & Section Report", "Guardian Report"],
        ["Student History", "Student Login Credential", "Parent Login Credential"],
        ["Class Subject Report", "Admission Report", "Sibling Report"],
        ["Student Profile", "Student Gender Ratio Report", "Student Teacher Ratio Report"],
        ["Online Admission Report", "student_all_data_report", "App Install Users Report"]
    ];

    const reportConfigs = {
        'Student Report': {
            filters: [],
            headers: ["SNO", "Class", "Roll No.", "Student Name", "Mobile Number", "Gender", "Admission No", "Admission Date", "Caste", "Aadhar Number", "Date of Birth", "Father Name", "Mother Name", "Current Address", "Child ID"]
        },
        'Class & Section Report': {
            filters: [],
            headers: ["S.No", "Class (Section)", "Students", "Action"]
        },
        'Guardian Report': {
            filters: ['class', 'section'],
            headers: ["Class (Section)", "Admission No", "Student Name", "Mobile Number", "Guardian Name", "Guardian Relation", "Guardian Phone", "Father Name", "Father Phone", "Mother Name", "Mother Phone"]
        },
        'Student History': {
            filters: ['class', 'admission_year'],
            headers: ["Admission No", "Student Name", "Admission Date", "Class (Start-End)", "Session (Start-End)", "Years", "Mobile Number", "Guardian Name", "Guardian Phone"]
        },
        'Student Login Credential': {
            filters: ['class', 'section'],
            headers: ["Admission No", "Student Name", "Username", "Password"]
        },
        'Parent Login Credential': {
            filters: ['class', 'section'],
            headers: ["Admission No", "Student Name", "Parent Username", "Parent Password"]
        },
        'Class Subject Report': {
            filters: ['class', 'section'],
            headers: ["S.No", "Class (Section)", "Subject", "Teacher", "Time", "Room No"]
        },
        'Admission Report': {
            filters: ['search_type'],
            headers: ["Admission No", "Student Name", "Class", "Father Name", "Date of Birth", "Admission Date", "Gender", "Category", "Mobile Number"]
        },
        'Sibling Report': {
            filters: ['class', 'section'],
            headers: ["Father Name", "Mother Name", "Guardian Name", "Guardian Phone", "Student Name (Sibling)", "Class", "Admission Date", "Gender"]
        },
        'Student Profile': {
            filters: ['class', 'section', 'admission_date'],
            headers: ["Roll Number", "Class", "Section", "First Name", "Last Name", "Gender", "Date of Birth", "Category", "Religion", "Caste", "Mobile Number", "Email", "Admission Date", "Blood Group", "House", "Height", "Weight", "Measurement Date", "Fees Discount", "Father Name", "Father Phone", "Father Occupation", "Mother Name", "Mother Phone", "Mother Occupation", "If Guardian Is", "Guardian Name", "Guardian Relation", "Guardian Phone", "Guardian Occupation", "Guardian Email", "Guardian Address", "Current Address", "Permanent Address", "Route List", "Hostel Details", "Room No.", "Bank Account Number", "Bank Name", "IFSC Code", "National Identification Number", "Local Identification Number", "RTE", "Previous School Details", "Note"]
        },
        'Student Gender Ratio Report': {
            filters: [],
            headers: ["Class(Section)", "Total Boys", "Total Girls", "Total Students", "Boys-Girls Ratio"]
        },
        'Student Teacher Ratio Report': {
            filters: [],
            headers: ["Class(Section)", "Total Students", "Total Assigned Teachers", "Student Teacher Ratio"]
        },
        'Online Admission Report': {
            filters: ['class', 'section', 'status'],
            headers: ["Reference No", "Admission No", "Student Name", "Class", "Mobile No", "Date of Birth", "Gender", "Form Status", "Payment Status", "Enrolled", "Amount"]
        },
        'student_all_data_report': {
            filters: [],
            headers: ["SNO", "Class", "Roll No.", "Student Name", "Mobile Number", "Gender", "Admission No", "Admission Date", "Category", "Religion", "Caste", "Blood Group", "Height", "Weight", "Aadhar Number", "Date of Birth", "Father Name", "Mother Name", "Guardian Name", "Current Address", "Child ID"]
        },
        'App Install Users Report': {
            filters: [],
            headers: ["Student Name", "Class(Section)", "Admission No", "Father Name", "Mobile No", "Role", "Date"]
        },
        'Audit Trail Log': {
            filters: ['search_type'],
            headers: ["Message", "Users", "IP Address", "Action", "Platform", "Agent", "Date Time"]
        }
    };

    const currentConfig = reportConfigs[activeReport] || { filters: ['class', 'section'], headers: ["SNO", "Name", "Details"] };

    const rawMockData = [
        { sno: 1, class: 'LKG(A)', roll: '4', name: 'SAI', mobile: '6302945732', gender: 'Male', admNo: '1004', admDate: '2021-02-21', caste: 'ST', aadhar: '1234 5678 9012', dob: '21/02/2021', father: 'Punyamurthi pavan kumar', mother: 'Laxmi', address: 'B-24, New Delhi', childId: '1234567893', username: 'sai_1004', password: 'password123', subject: 'Maths', teacher: 'Ravi Kumar', time: '09:00 AM', room: '101', boys: 10, girls: 12, students: 22, teachers: 2, reference: 'REF001', formStatus: 'Completed', payStatus: 'Paid', enrolled: 'Yes', amount: '5000', role: 'Student', date: '2024-02-14 10:00 AM', message: 'Logged In', ip: '192.168.1.1', action: 'LOGIN', platform: 'Web', agent: 'Chrome/121.0.0.0' },
        { sno: 2, class: 'Nursery(A)', roll: '5', name: 'NANDHU', mobile: '6302945733', gender: 'Male', admNo: '1005', admDate: '2021-02-05', caste: 'BC-A', aadhar: '1234 5678 9013', dob: '05/02/2021', father: 'Said Hussainpeer Khadri', mother: 'Fatima', address: 'A-10, Hyderabad', childId: '1234567894', username: 'nandhu_1005', password: 'password123', subject: 'English', teacher: 'Sita Ram', time: '10:00 AM', room: '102', boys: 8, girls: 15, students: 23, teachers: 1, reference: 'REF002', formStatus: 'Pending', payStatus: 'Unpaid', enrolled: 'No', amount: '4500', role: 'Student', date: '2024-02-14 11:30 AM', message: 'Updated Profile', ip: '192.168.1.5', action: 'UPDATE', platform: 'Android', agent: 'MobileApp' },
        { sno: 3, class: 'Nursery(B)', roll: '3', name: 'SURAY', mobile: '6302945736', gender: 'Male', admNo: '1008', admDate: '2021-02-25', caste: 'BC-D', aadhar: '1234 5678 9014', dob: '25/02/2021', father: 'A. Nagaraju', mother: 'Sumathi', address: 'Flat 402, Bangalore', childId: '1234567897', username: 'suray_1008', password: 'password123', subject: 'Science', teacher: 'Manoj Gupta', time: '11:00 AM', room: '201', boys: 15, girls: 10, students: 25, teachers: 3, reference: 'REF003', formStatus: 'Rejected', payStatus: 'N/A', enrolled: 'No', amount: '0', role: 'Student', date: '2024-02-14 01:45 PM', message: 'Viewed Fees', ip: '192.168.2.10', action: 'VIEW', platform: 'Web', agent: 'Firefox/120.0' },
        { sno: 4, class: 'Nursery(B)', roll: '4', name: 'KARTHIK', mobile: '6302945737', gender: 'Male', admNo: '1009', admDate: '2021-02-26', caste: 'BC-E', aadhar: '1234 5678 9015', dob: '26/02/2021', father: 'T. Srinivasulu', mother: 'Anitha', address: 'H.No 12, Visakhapatnam', childId: '1234567898', username: 'karthik_1009', password: 'password123', subject: 'Social', teacher: 'Kiran Reddy', time: '12:00 PM', room: '202', boys: 12, girls: 12, students: 24, teachers: 2, reference: 'REF004', formStatus: 'Completed', payStatus: 'Paid', enrolled: 'Yes', amount: '5200', role: 'Student', date: '2024-02-14 02:20 PM', message: 'Downloaded ID', ip: '192.168.5.22', action: 'DOWNLOAD', platform: 'iOS', agent: 'Safari/17.0' },
    ];

    const filteredData = useMemo(() => {
        return rawMockData.filter(row => {
            const searchStr = searchTerm.toLowerCase();
            return (
                row.name.toLowerCase().includes(searchStr) ||
                row.admNo.toLowerCase().includes(searchStr) ||
                row.class.toLowerCase().includes(searchStr) ||
                (row.father && row.father.toLowerCase().includes(searchStr))
            );
        });
    }, [searchTerm]);

    const totals = useMemo(() => {
        return {
            boys: filteredData.reduce((acc, r) => acc + (r.boys || 0), 0),
            girls: filteredData.reduce((acc, r) => acc + (r.girls || 0), 0),
            students: filteredData.reduce((acc, r) => acc + (r.students || 0), 0),
            teachers: filteredData.reduce((acc, r) => acc + (r.teachers || 0), 0),
        };
    }, [filteredData]);

    const handleReportClick = (report) => {
        setActiveReport(report);
        setSearchTerm('');
    };

    const handleGroupClick = (group) => {
        // SIS is the default group for this component
        if (group !== 'SIS') {
            const routeMap = {
                'Finance': '/admin/reports/payroll',
                'Attendance': '/admin/reports/attendance',
                'Examinations': '/admin/reports/rank',
                'Lesson Plans': '/admin/reports/lesson_plan',
                'Human Resource': '/admin/reports/staff',
                'Transport': '/admin/reports/transport',
                'Hostel': '/admin/reports/hostel',
                'Alumni': '/admin/reports/alumni',
                'User Log': '/admin/reports/user_log',
                'Audit Trail Log': '/admin/reports/audit_trail'
            };
            if (routeMap[group]) {
                navigate(routeMap[group]);
            }
        }
    };

    const renderRow = (row, index) => {
        switch (activeReport) {
            case 'Student Report':
            case 'student_all_data_report':
                return (
                    <>
                        <td>{row.sno}</td><td>{row.class}</td><td>{row.roll}</td><td><span className="student-link">{row.name}</span></td>
                        <td>{row.mobile}</td><td>{row.gender}</td><td>{row.admNo}</td><td>{row.admDate}</td>
                        {activeReport === 'Student Report' && <td>{row.caste}</td>}
                        <td>{row.aadhar}</td><td>{row.dob}</td><td>{row.father}</td><td>{row.mother}</td>
                        <td>{row.address}</td><td>{row.childId}</td>
                    </>
                );
            case 'Class & Section Report':
                return <><td>{index + 1}</td><td>{row.class}</td><td>{row.students}</td><td><i className="fa fa-eye"></i></td></>;
            case 'Guardian Report':
                return <><td>{row.class}</td><td>{row.admNo}</td><td>{row.name}</td><td>{row.mobile}</td><td>{row.father}</td><td>Father</td><td>{row.mobile}</td><td>{row.father}</td><td>{row.mobile}</td><td>{row.mother}</td><td>-</td></>;
            case 'Parent Login Credential':
                return <><td>{row.admNo}</td><td>{row.name}</td><td>parent_{row.admNo}</td><td>password123</td></>;
            case 'Class Subject Report':
                return <><td>{index + 1}</td><td>{row.class}</td><td>{row.subject}</td><td>{row.teacher}</td><td>{row.time}</td><td>{row.room}</td></>;
            case 'Student Gender Ratio Report':
                return <><td>{row.class}</td><td>{row.boys}</td><td>{row.girls}</td><td>{row.students}</td><td>{(row.boys / row.girls).toFixed(2)}</td></>;
            case 'Student Teacher Ratio Report':
                return <><td>{row.class}</td><td>{row.students}</td><td>{row.teachers}</td><td>{(row.students / row.teachers).toFixed(1)}:1</td></>;
            case 'Online Admission Report':
                return <><td>{row.reference}</td><td>{row.admNo}</td><td>{row.name}</td><td>{row.class}</td><td>{row.mobile}</td><td>{row.dob}</td><td>{row.gender}</td><td>{row.formStatus}</td><td>{row.payStatus}</td><td>{row.enrolled}</td><td>{row.amount}</td></>;
            case 'App Install Users Report':
                return <><td>{row.name}</td><td>{row.class}</td><td>{row.admNo}</td><td>{row.father}</td><td>{row.mobile}</td><td>{row.role}</td><td>{row.date}</td></>;
            case 'Audit Trail Log':
                return <><td>{row.message}</td><td>{row.name}</td><td>{row.ip}</td><td>{row.action}</td><td>{row.platform}</td><td>{row.agent}</td><td>{row.date}</td></>;
            case 'Student Profile':
                return (
                    <>
                        <td>{row.roll}</td><td>{row.class.split('(')[0]}</td><td>{row.class.split('(')[1]?.replace(')', '')}</td><td>{row.name}</td><td></td><td>{row.gender}</td><td>{row.dob}</td><td>Category</td><td>Religion</td><td>{row.caste}</td><td>{row.mobile}</td><td>{row.name.toLowerCase()}@example.com</td><td>{row.admDate}</td><td>O+</td><td>A</td><td>120cm</td><td>25kg</td><td>2024-01-01</td><td>None</td><td>{row.father}</td><td>{row.mobile}</td><td>Business</td><td>{row.mother}</td><td></td><td>Homemaker</td><td>Father</td><td>{row.father}</td><td>Father</td><td>{row.mobile}</td><td>Business</td><td></td><td>{row.address}</td><td>{row.address}</td><td>{row.address}</td><td>Route 1</td><td>Hostel A</td><td>101</td><td>{row.admNo}001</td><td>SBI</td><td>SBIN0001</td><td>AD1234</td><td>LC1234</td><td>No</td><td>Old School</td><td>Good student</td>
                    </>
                );
            default:
                return <><td>{row.admNo}</td><td>{row.name}</td><td>Sample Data</td></>;
        }
    };

    return (
        <div className="wrapper theme-white-skin">
            <Header />
            <Sidebar />
            <style>{`
                .content-wrapper { background: #f4f4f4; padding: 0px; margin-top: 18px; }
                .report-flex-container { 
                    display: flex; 
                    gap: 10px;
                    padding: 0; 
                    margin-bottom: 20px; 
                    align-items: flex-start;
                }
                
                .internal-sidebar-box { 
                    width: 270px; 
                    background: #fff; 
                    border-radius: 4px; 
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
                    flex-shrink: 0; 
                    padding: 10px 0; 
                    position: sticky;
                    top: 0px;
                }
                .sidebar-title { padding: 0 15px 10px 15px; font-size: 16px; font-weight: 500; color: #333; border-bottom: 1px solid #f4f4f4; margin-bottom: 5px; }
                .internal-nav { list-style: none; padding: 0; margin: 0; }
                .internal-nav li { 
                    padding: 10px 15px; 
                    font-size: 13.5px; 
                    color: #555; 
                    cursor: pointer; 
                    display: flex; 
                    align-items: center; 
                    border-bottom: 1px solid #f9f9f9;
                    transition: all 0.2s;
                }
                .internal-nav li img { margin-right: 12px; width: 22px; height: 22px; object-fit: contain; }
                .internal-nav li.active { background: #fff; color: #3c8dbc; font-weight: 600; border-left: 3px solid #3c8dbc; padding-left: 12px; }
                .internal-nav li:hover:not(.active) { background: #fbfbfb; }

                .main-report-box { 
                    flex: 1; 
                    background: #fff; 
                    border-radius: 4px; 
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
                    padding: 10px;
                    overflow: hidden;
                    min-width: 0;
                }
                .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
                .page-header h3 { margin: 0; font-size: 16px; font-weight: 400; color: #333; }
                
                .reportlists { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; background: transparent; border: none; margin-bottom: 15px; }
                .reportlists li { background: #fff; list-style: none; border: none; margin: 0; }
                .reportlists li a { 
                    color: #333; 
                    text-decoration: none; 
                    display: flex; 
                    align-items: center; 
                    padding: 8px 10px; 
                    font-size: 13px; 
                    transition: all 0.2s; 
                    border: none;
                    cursor: pointer;
                    background: #fff;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .reportlists li a i { margin-right: 8px; color: #666; font-size: 14px; }
                .reportlists li a.active { background-color: #e2f0ff !important; color: #000; font-weight: 500; }

                .select-criteria-header { font-size: 17px; font-weight: 500; padding: 10px 0; border-bottom: 1px solid #eee; margin-bottom: 10px; color: #333; border-top: 1px solid #eee; margin-top: 15px; }
                
                .form-control {
                    width: 100%;
                    border: none !important;
                    border-bottom: 1px solid #d2d6de !important;
                    border-radius: 0;
                    box-shadow: none !important;
                    background: transparent;
                    padding-left: 0 !important;
                    padding-right: 0 !important;
                    height: 28px;
                    font-size: 12.5px;
                }
                .form-control:focus { border-bottom: 1px solid #3c8dbc !important; outline: none !important; }
                .form-group label { font-size: 12px; font-weight: 600; color: #444; margin-bottom: 5px; display: block; }
                .req { color: red; margin-left: 2px; }

                .dt-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; width: 100%; }
                .dt-buttons { display: flex; border-bottom: 1px solid #d2d6de; gap: 0; }
                .dt-button { 
                    padding: 3px 6px; 
                    border: none; 
                    background: transparent; 
                    font-size: 15px; 
                    color: #555; 
                    cursor: pointer;
                }
                .dt-button:hover { background: #f9f9f9; }
                .dt-search input { 
                    border: none; 
                    border-bottom: 1px solid #d2d6de; 
                    padding: 4px 0; 
                    font-size: 13px; 
                    width: 160px; 
                    background: transparent; 
                    outline: none;
                }

                .table-responsive { overflow-x: auto; margin-bottom: 10px; width: 100%; scrollbar-width: thin; }
                .table-custom { width: 100%; border-collapse: collapse; }
                .table-custom th { 
                    border-bottom: 2px solid #eee; 
                    padding: 8px 10px; 
                    text-align: left; 
                    font-size: 14px; 
                    font-weight: 600; 
                    color: #444;
                    background: #fff;
                    white-space: nowrap;
                }
                .table-custom td { padding: 10px; border-bottom: 1px solid #f9f9f9; font-size: 13.5px; color: #444; vertical-align: top; white-space: nowrap; }
                .table-custom tr:hover { background: #fbfbfb; }

                .dt-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 5px; font-size: 11px; color: #777; border-top: 1px solid #eee; padding-top: 8px; }
                .dt-pagination { display: flex; list-style: none; padding: 0; margin: 0; }
                .dt-pagination li { border: 1px solid #eee; padding: 2px 8px; cursor: pointer; background: #fff; margin-left: -1px; font-size: 10px; }
                .dt-pagination li.active { border-color: #eee; color: #333; font-weight: bold; }

                .btn-purple { background-color: #9429b8; border-color: #9429b8; color: #fff !important; padding: 2px 12px; border-radius: 20px; font-size: 11px; }
                .total-row { font-weight: bold; background: #f9f9f9; border-top: 2px solid #eee; }
            `}</style>

            <div className="content-wrapper" style={{ minHeight: '946px' }}>
                <section className="content">
                    <div className="report-flex-container">
                        <ReportsSidebar activeGroup="SIS" />

                        <div className="main-report-box">
                            <div className="page-header">
                                <h3>Student Information Report</h3>
                            </div>

                            <ul className="reportlists">
                                {sisReports.flat().map((report, idx) => (
                                    <li key={idx}>
                                        <a className={activeReport === report ? "active" : ""} onClick={(e) => { e.preventDefault(); handleReportClick(report); }}>
                                            <i className="fa fa-file-text-o"></i> {report}
                                        </a>
                                    </li>
                                ))}
                            </ul>

                            {currentConfig.filters.length > 0 && (
                                <>
                                    <div className="select-criteria-header"><i className="fa fa-search"></i> Select Criteria</div>
                                    <div className="filters-area">
                                        <div className="row">
                                            {currentConfig.filters.includes('class') && (
                                                <div className="col-md-3"><div className="form-group"><label>Class <span className="req">*</span></label><select className="form-control" value={classId} onChange={(e) => setClassId(e.target.value)} required><option value="">Select</option><option value="1">Class 1</option></select></div></div>
                                            )}
                                            {currentConfig.filters.includes('section') && (
                                                <div className="col-md-3"><div className="form-group"><label>Section</label><select className="form-control" value={sectionId} onChange={(e) => setSectionId(e.target.value)}><option value="">Select</option><option value="1">Section A</option></select></div></div>
                                            )}
                                            {currentConfig.filters.includes('admission_date') && (
                                                <div className="col-md-3"><div className="form-group"><label>Admission Date</label><input type="date" className="form-control" value={admissionDate} onChange={(e) => setAdmissionDate(e.target.value)} /></div></div>
                                            )}
                                            {currentConfig.filters.includes('search_type') && (
                                                <div className="col-md-3"><div className="form-group"><label>Search Type <span className="req">*</span></label><select className="form-control" value={searchType} onChange={(e) => setSearchType(e.target.value)} required><option value="today">Today</option></select></div></div>
                                            )}
                                            {currentConfig.filters.includes('status') && (
                                                <div className="col-md-3"><div className="form-group"><label>Status</label><select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Select</option><option value="pending">Pending</option></select></div></div>
                                            )}
                                            {currentConfig.filters.includes('admission_year') && (
                                                <div className="col-md-3"><div className="form-group"><label>Admission Year</label><select className="form-control" value={admissionYear} onChange={(e) => setAdmissionYear(e.target.value)}><option value="">Select</option><option value="2024">2024</option><option value="2025">2025</option></select></div></div>
                                            )}
                                            <div className="col-sm-12" style={{ textAlign: 'right', marginTop: '10px' }}>
                                                <button className="btn btn-purple btn-sm"><i className="fa fa-search"></i> Search</button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="select-criteria-header" style={{ marginTop: '20px' }}> {activeReport}</div>

                            <div className="dt-header">
                                <div className="dt-search">
                                    <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                </div>
                                <div className="dt-buttons">
                                    <button className="dt-button" title="Copy"><i className="fa fa-copy"></i></button>
                                    <button className="dt-button" title="Excel"><i className="fa fa-file-excel-o"></i></button>
                                    <button className="dt-button" title="CSV"><i className="fa fa-file-text-o"></i></button>
                                    <button className="dt-button" title="PDF"><i className="fa fa-file-pdf-o"></i></button>
                                    <button className="dt-button" title="Print"><i className="fa fa-print"></i></button>
                                    <button className="dt-button" title="Columns"><i className="fa fa-columns"></i></button>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="table-custom">
                                    <thead>
                                        <tr>
                                            {currentConfig.headers.map((header, idx) => (
                                                <th key={idx}>{header} <i className="fa fa-sort"></i></th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.map((row, index) => (
                                            <tr key={index}>{renderRow(row, index)}</tr>
                                        ))}
                                        {filteredData.length > 0 && activeReport === 'Student Gender Ratio Report' && (
                                            <tr className="total-row">
                                                <td>Total</td><td>{totals.boys}</td><td>{totals.girls}</td><td>{totals.students}</td><td>{(totals.boys / totals.girls).toFixed(2)}</td>
                                            </tr>
                                        )}
                                        {filteredData.length > 0 && activeReport === 'Student Teacher Ratio Report' && (
                                            <tr className="total-row">
                                                <td>Total</td><td>{totals.students}</td><td>{totals.teachers}</td><td>{(totals.students / totals.teachers).toFixed(1)}:1</td>
                                            </tr>
                                        )}
                                        {filteredData.length === 0 && <tr><td colSpan={currentConfig.headers.length} style={{ textAlign: 'center' }}>No record found</td></tr>}
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default StudentInformationReport;
