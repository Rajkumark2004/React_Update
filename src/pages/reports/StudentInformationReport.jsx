import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import ReportsSidebar from '../../components/ReportsSidebar';
import '../../styles/reports.css';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const StudentInformationReport = () => {
    const navigate = useNavigate();
    const [activeReport, setActiveReport] = useState('');
    const [subView, setSubView] = useState(null); // { type, data, title }
    const [searchTerm, setSearchTerm] = useState('');

    const [studentData, setStudentData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);

    useEffect(() => {
        const fetchReportStatus = async () => {
            try {
                const response = await api.getStudentInformationReport();
                if (response.status) {
                    toast.success(response.message);
                }
            } catch (error) {
                console.error('Error checking report status:', error);
            }
        };

        fetchReportStatus();
    }, []);

    useEffect(() => {
        if (!activeReport) return;

        const fetchReportData = async () => {
            if (activeReport === 'Student Report') {
                try {
                    setLoading(true);
                    const response = await api.getStudentMasterReport();
                    if (response.status && response.data && response.data.student_data) {
                        setStudentData(response.data.student_data);
                        // toast.success('Report data loaded successfully');
                    } else {
                        toast.error(response.message || 'Failed to load report data');
                    }
                } catch (error) {
                    console.error('Error fetching report data:', error);
                    toast.error('Error fetching report data');
                } finally {
                    setLoading(false);
                }
            } else if (activeReport === 'Class & Section Report') {
                try {
                    setLoading(true);
                    const response = await api.getClassSectionReport();
                    if (response.status && response.data && response.data.class_section_list) {
                        setStudentData(response.data.class_section_list);
                    } else {
                        toast.error(response.message || 'Failed to load class section report');
                    }
                } catch (error) {
                    console.error('Error fetching class section report:', error);
                    toast.error('Error fetching class section report');
                } finally {
                    setLoading(false);
                }
            } else if (activeReport === 'Guardian Report') {
                try {
                    setLoading(true);
                    const response = await api.getGuardianReport();
                    if (response.status && response.data && response.data.classlist) {
                        setClasses(response.data.classlist);
                        setStudentData([]); // Reset student data as this report requires filter selection first
                        // toast.success('Guardian report configuration loaded');
                    } else {
                        toast.error(response.message || 'Failed to load guardian report configuration');
                    }
                } catch (error) {
                    console.error('Error fetching guardian report:', error);
                    toast.error('Error fetching guardian report');
                } finally {
                    setLoading(false);
                }
            } else if (activeReport === 'Student Login Credential') {
                try {
                    setLoading(true);
                    const response = await api.getStudentLoginDetailReport();
                    if (response.status && response.data && response.data.classlist) {
                        setClasses(response.data.classlist);
                        setStudentData([]);
                    } else {
                        toast.error(response.message || 'Failed to load login credential report configuration');
                    }
                } catch (error) {
                    console.error('Error fetching login credential report:', error);
                    toast.error('Error fetching login credential report');
                } finally {
                    setLoading(false);
                }
            } else if (activeReport === 'Parent Login Credential') {
                try {
                    setLoading(true);
                    const response = await api.getParentLoginDetailReport();
                    if (response.status && response.data && response.data.classlist) {
                        setClasses(response.data.classlist);
                        setStudentData([]);
                    } else {
                        toast.error(response.message || 'Failed to load parent login credential report configuration');
                    }
                } catch (error) {
                    console.error('Error fetching parent login credential report:', error);
                    toast.error('Error fetching parent login credential report');
                } finally {
                    setLoading(false);
                }
            } else if (activeReport === 'Sibling Report') {
                try {
                    setLoading(true);
                    const response = await api.getSiblingReport();
                    if (response.status && response.data && response.data.classlist) {
                        setClasses(response.data.classlist);
                        setStudentData([]);
                    } else {
                        toast.error(response.message || 'Failed to load sibling report configuration');
                    }
                } catch (error) {
                    console.error('Error fetching sibling report:', error);
                    toast.error('Error fetching sibling report');
                } finally {
                    setLoading(false);
                }
            } else if (activeReport === 'student_all_data_report') {
                try {
                    setLoading(true);
                    const response = await api.getStudentAllDataReport();
                    if (response.status && response.data && response.data.student_data) {
                        setStudentData(response.data.student_data);
                    } else {
                        toast.error(response.message || 'Failed to load student all data report');
                    }
                } catch (error) {
                    console.error('Error fetching student all data report:', error);
                    toast.error('Error fetching student all data report');
                } finally {
                    setLoading(false);
                }
            } else if (activeReport === 'App Install Users Report') {
                try {
                    setLoading(true);
                    const response = await api.getAppInstallUsersReport();
                    if (response.status && response.data && response.data.resultlist) {
                        setStudentData(response.data.resultlist);
                    } else {
                        toast.error(response.message || 'Failed to load app install users report');
                    }
                } catch (error) {
                    console.error('Error fetching app install users report:', error);
                    toast.error('Error fetching app install users report');
                } finally {
                    setLoading(false);
                }
            } else {
                // Reset data or handle other reports if needed
                // setStudentData([]); 
            }
        };

        fetchReportData();
    }, [activeReport]);

    // Shared Form states
    const [classId, setClassId] = useState('');
    const [sectionId, setSectionId] = useState('');
    const [admissionDate, setAdmissionDate] = useState('');
    const [searchType, setSearchType] = useState('today');
    const [status, setStatus] = useState('');
    const [admissionYear, setAdmissionYear] = useState('');

    useEffect(() => {
        const fetchSections = async () => {
            if ((activeReport === 'Guardian Report' || activeReport === 'Student Login Credential' || activeReport === 'Parent Login Credential' || activeReport === 'Sibling Report') && classId) {
                try {
                    const response = await api.getSectionsByClass(classId);
                    if (response.status && response.data) {
                        setSections(response.data);
                    } else {
                        setSections([]);
                    }
                } catch (error) {
                    console.error('Error fetching sections:', error);
                    setSections([]);
                }
            } else {
                setSections([]);
            }
        };

        fetchSections();
    }, [activeReport, classId]);

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

    const currentConfig = useMemo(() => {
        return reportConfigs[activeReport] || { filters: ['class', 'section'], headers: ["SNO", "Name", "Details"] };
    }, [activeReport]);




    const studentListConfig = {
        headers: ["Admission No", "Student Name", "Class", "Father Name", "Date of Birth", "Gender", "Category", "Mobile Number"]
    };

    const filteredData = useMemo(() => {
        if (!studentData) return [];
        return studentData.filter(row => {
            const searchStr = searchTerm.toLowerCase();
            if (activeReport === 'Class & Section Report') {
                return (
                    (row.class && row.class.toLowerCase().includes(searchStr)) ||
                    (row.section && row.section.toLowerCase().includes(searchStr))
                );
            }
            if (activeReport === 'Student Login Credential') {
                // row is [admission_no, {id, name}, username, password]
                const admissionNo = row[0] ? String(row[0]).toLowerCase() : '';
                const name = row[1]?.name ? String(row[1].name).toLowerCase() : '';
                const username = row[2] ? String(row[2]).toLowerCase() : '';

                return (
                    admissionNo.includes(searchStr) ||
                    name.includes(searchStr) ||
                    username.includes(searchStr)
                );
            }
            if (activeReport === 'Parent Login Credential') {
                // row is [admission_no, anchor_tag_name, username, password] 
                // We need to extract text from the anchor tag or use it as is if extracting text
                const admissionNo = row[0] ? String(row[0]).toLowerCase() : '';
                // Extract text from anchor tag: <a href='...'>Name</a>
                let name = row[1] ? String(row[1]) : '';
                const match = name.match(/>([^<]+)</);
                if (match && match[1]) {
                    name = match[1].toLowerCase();
                } else {
                    name = name.toLowerCase(); // Fallback if no tag
                }

                const username = row[2] ? String(row[2]).toLowerCase() : '';

                return (
                    admissionNo.includes(searchStr) ||
                    name.includes(searchStr) ||
                    username.includes(searchStr)
                );
            }
            if (activeReport === 'Sibling Report') {
                return (
                    (row.firstname && row.firstname.toLowerCase().includes(searchStr)) ||
                    (row.lastname && row.lastname.toLowerCase().includes(searchStr)) ||
                    (row.father_name && row.father_name.toLowerCase().includes(searchStr)) ||
                    (row.mother_name && row.mother_name.toLowerCase().includes(searchStr)) ||
                    (row.guardian_name && row.guardian_name.toLowerCase().includes(searchStr)) ||
                    (row.guardian_phone && row.guardian_phone.toLowerCase().includes(searchStr))
                );
            }
            return (
                (row.firstname && row.firstname.toLowerCase().includes(searchStr)) ||
                (row.lastname && row.lastname.toLowerCase().includes(searchStr)) ||
                (row.admission_no && row.admission_no.toLowerCase().includes(searchStr)) ||
                (row.class && row.class.toLowerCase().includes(searchStr)) ||
                (row.father_name && row.father_name.toLowerCase().includes(searchStr)) ||
                (row.mobileno && row.mobileno.toLowerCase().includes(searchStr))
            );
        });
    }, [searchTerm, studentData, activeReport]);

    const totals = useMemo(() => {
        return {
            boys: filteredData.filter(r => r.gender === 'Male').length,
            girls: filteredData.filter(r => r.gender === 'Female').length,
            students: filteredData.length,
            teachers: 0, // API doesn't seem to return teacher count per row in this endpoint
        };
    }, [filteredData]);

    const handleReportClick = (report) => {
        setActiveReport(report);
        setSubView(null);
        setSearchTerm('');
    };

    const handleViewStudentList = async (class_section_id, className, sectionName) => {
        try {
            setLoading(true);
            const response = await api.getStudentsByClassSection(class_section_id);
            if (response.status && response.data && response.data.student_list) {
                setSubView({
                    type: 'student_list',
                    data: response.data.student_list,
                    title: `Student List - ${className} (${sectionName})`
                });
            } else {
                toast.error(response.message || 'Failed to load student list');
            }
        } catch (error) {
            console.error('Error fetching student list:', error);
            toast.error('Error fetching student list');
        } finally {
            setLoading(false);
        }
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

    const handleSearch = async () => {
        if (!classId && currentConfig.filters.includes('class')) {
            toast.error('Please select a class');
            return;
        }

        if (activeReport === 'Guardian Report') {
            try {
                setLoading(true);
                const payload = {
                    class_id: classId,
                    section_id: sectionId
                };

                const response = await api.searchGuardianReport(payload);
                if (response.status && response.data && response.data.resultlist) {
                    setStudentData(response.data.resultlist);
                } else {
                    toast.error(response.message || 'No records found');
                    setStudentData([]);
                }
            } catch (error) {
                console.error('Error searching guardian report:', error);
                toast.error('Error searching guardian report');
            } finally {
                setLoading(false);
            }
        } else if (activeReport === 'Student Login Credential') {
            try {
                setLoading(true);
                const payload = {
                    class_id: classId,
                    section_id: sectionId
                };

                const validationResponse = await api.searchLoginValidation(payload);
                if (validationResponse.status === 1) {
                    const response = await api.getCredentialReportList(payload);
                    if (response.data) {
                        setStudentData(response.data);
                    } else {
                        toast.error('No login credentials found');
                        setStudentData([]);
                    }
                } else {
                    toast.error(validationResponse.error || 'Validation failed');
                    setStudentData([]);
                }
            } catch (error) {
                console.error('Error searching login credentials:', error);
                toast.error('Error searching login credentials');
            } finally {
                setLoading(false);
            }
        } else if (activeReport === 'Parent Login Credential') {
            try {
                setLoading(true);
                const payload = {
                    class_id: classId,
                    section_id: sectionId
                };

                const validationResponse = await api.searchLoginValidation(payload);
                if (validationResponse.status === 1) {
                    const response = await api.getParentCredentialReportList(payload);
                    if (response.data) {
                        setStudentData(response.data);
                    } else {
                        toast.error('No parent login credentials found');
                        setStudentData([]);
                    }
                } else {
                    toast.error(validationResponse.error || 'Validation failed');
                    setStudentData([]);
                }
            } catch (error) {
                console.error('Error searching parent login credentials:', error);
                toast.error('Error searching parent login credentials');
            } finally {
                setLoading(false);
            }
        } else if (activeReport === 'Sibling Report') {
            try {
                setLoading(true);
                const payload = {
                    class_id: classId,
                    section_id: sectionId
                };
                const response = await api.searchSiblingReport(payload);
                if (response.status && response.data && response.data.resultlist) {
                    // Flatten the grouped resultlist
                    const flatList = Object.values(response.data.resultlist).flat();
                    setStudentData(flatList);
                } else {
                    toast.error(response.message || 'No siblings found');
                    setStudentData([]);
                }
            } catch (error) {
                console.error('Error searching sibling report:', error);
                toast.error('Error searching sibling report');
            } finally {
                setLoading(false);
            }
        }
        // Add other report search logic here if needed
    };

    const renderRow = (row, index) => {
        switch (activeReport) {
            case 'Student Report':
                return (
                    <>
                        <td>{index + 1}</td>
                        <td>{row.class} ({row.section})</td>
                        <td>{row.roll_no}</td>
                        <td><span className="student-link">{row.firstname} {row.lastname}</span></td>
                        <td>{row.mobileno}</td>
                        <td>{row.gender}</td>
                        {activeReport === 'Student Report' && (
                            <>
                                <td>{row.admission_no}</td>
                                <td>{row.admission_date}</td>
                                <td>{row.cast}</td>
                            </>
                        )}
                        {/* Remove redundant Student All Data Report logic from here if any */}
                        <td>{row.adhar_no}</td>
                        <td>{row.dob}</td>
                        <td>{row.father_name}</td>
                        <td>{row.mother_name}</td>
                        <td>{row.current_address}</td>
                        <td>{row.child_id}</td>
                    </>
                );
            case 'student_all_data_report':
                return (
                    <>
                        <td>{index + 1}</td>
                        <td>{row.class} ({row.section})</td>
                        <td>{row.roll_no}</td>
                        <td><span className="student-link">{row.firstname} {row.lastname}</span></td>
                        <td>{row.mobileno}</td>
                        <td>{row.gender}</td>
                        <td>{row.admission_no}</td>
                        <td>{row.admission_date}</td>
                        <td>{row.category_id}</td>
                        <td>{row.religion}</td>
                        <td>{row.cast}</td>
                        <td>{row.blood_group}</td>
                        <td>{row.height}</td>
                        <td>{row.weight}</td>
                        <td>{row.adhar_no}</td>
                        <td>{row.dob}</td>
                        <td>{row.father_name}</td>
                        <td>{row.mother_name}</td>
                        <td>{row.guardian_name}</td>
                        <td>{row.current_address}</td>
                        <td>{row.child_id}</td>
                    </>
                );
            case 'Class & Section Report':
                return (
                    <>
                        <td>{index + 1}</td>
                        <td>{row.class} ({row.section})</td>
                        <td>{row.student_count}</td>
                        <td>
                            <button className="btn btn-default btn-xs" title="View" onClick={() => handleViewStudentList(row.class_section_id || row.id, row.class, row.section)}>
                                <i className="fa fa-eye"></i>
                            </button>
                        </td>
                    </>
                );
            case 'Guardian Report':
                return (
                    <>
                        <td>{row.class} ({row.section})</td>
                        <td>{row.admission_no}</td>
                        <td>{row.firstname} {row.lastname}</td>
                        <td>{row.mobileno}</td>
                        <td>{row.guardian_name}</td>
                        <td>{row.guardian_relation}</td>
                        <td>{row.guardian_phone}</td>
                        <td>{row.father_name}</td>
                        <td>{row.father_phone}</td>
                        <td>{row.mother_name}</td>
                        <td>{row.mother_phone}</td>
                    </>
                );
            case 'Student Login Credential':
                // Data format: [admission_no, {id, name}, username, password]
                return (
                    <>
                        <td>{row[0]}</td>
                        <td>{row[1]?.name}</td>
                        <td>{row[2]}</td>
                        <td>{row[3]}</td>
                    </>
                );
            case 'Parent Login Credential':
                // Data format: [admission_no, anchor_tag, parent_username, parent_password]
                const getNameFromHtml = (htmlString) => {
                    const match = htmlString && htmlString.match(/>([^<]+)</);
                    return match ? match[1] : htmlString;
                };
                return (
                    <>
                        <td>{row[0]}</td>
                        <td>{getNameFromHtml(row[1])}</td>
                        <td>{row[2]}</td>
                        <td>{row[3]}</td>
                    </>
                );
            case 'Sibling Report':
                return (
                    <>
                        <td>{row.father_name}</td>
                        <td>{row.mother_name}</td>
                        <td>{row.guardian_name}</td>
                        <td>{row.guardian_phone}</td>
                        <td>{row.firstname} {row.lastname}</td>
                        <td>{row.class} ({row.section})</td>
                        <td>{row.admission_date}</td>
                        <td>{row.gender}</td>
                    </>
                );
            case 'Class Subject Report':
                return <><td>{index + 1}</td><td>{row.class}</td><td>-</td><td>-</td><td>-</td><td>-</td></>;
            case 'Student Gender Ratio Report':
                return <><td>{row.class}</td><td>-</td><td>-</td><td>-</td><td>-</td></>;
            case 'Student Teacher Ratio Report':
                return <><td>{row.class}</td><td>-</td><td>-</td><td>-</td></>;
            case 'Online Admission Report':
                return <><td>-</td><td>{row.admission_no}</td><td>{row.firstname}</td><td>{row.class}</td><td>{row.mobileno}</td><td>{row.dob}</td><td>{row.gender}</td><td>-</td><td>-</td><td>-</td><td>-</td></>;
            case 'App Install Users Report':
                return (
                    <>
                        <td>{row.firstname} {row.lastname}</td>
                        <td>{row.class} ({row.section})</td>
                        <td>{row.admission_no}</td>
                        <td>{row.father_name || row.guardian_name || '-'}</td>
                        <td>{row.mobileno || row.guardian_phone || '-'}</td>
                        <td>{row.role}</td>
                        <td>{row.created_date}</td>
                    </>
                );
            case 'Audit Trail Log':
                return <><td>-</td><td>{row.firstname}</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></>;
            case 'Student Profile':
                return (
                    <>
                        <td>{row.roll_no}</td><td>{row.class}</td><td>{row.section}</td><td>{row.firstname}</td><td>{row.lastname}</td><td>{row.gender}</td><td>{row.dob}</td><td>{row.category_id}</td><td>{row.religion}</td><td>{row.cast}</td><td>{row.mobileno}</td><td>{row.email}</td><td>{row.admission_date}</td><td>{row.blood_group}</td><td>-</td><td>{row.height}</td><td>{row.weight}</td><td>{row.measurement_date}</td><td>{row.fees_discount}</td><td>{row.father_name}</td><td>{row.father_phone}</td><td>{row.father_occupation}</td><td>{row.mother_name}</td><td>{row.mother_phone}</td><td>{row.mother_occupation}</td><td>{row.guardian_is}</td><td>{row.guardian_name}</td><td>{row.guardian_relation}</td><td>{row.guardian_phone}</td><td>{row.guardian_occupation}</td><td>{row.guardian_email}</td><td>{row.guardian_address}</td><td>{row.current_address}</td><td>{row.permanent_address}</td><td>-</td><td>{row.hostel_name}</td><td>{row.room_no}</td><td>{row.bank_account_no}</td><td>{row.bank_name}</td><td>{row.ifsc_code}</td><td>-</td><td>-</td><td>{row.rte}</td><td>{row.previous_school}</td><td>{row.note}</td>
                    </>
                );
            default:
                return <><td>{row.admission_no}</td><td>{row.firstname}</td><td>Details</td></>;
        }
    };

    return (
        <div className="wrapper theme-white-skin">
            <Header />
            <Sidebar />
            <style>{`
                .content-wrapper { background: #f4f4f4; padding: 0px; margin-top: 0px; }
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
                
                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                .modal-dialog {
                    background: white;
                    width: 90%;
                    max-width: 1200px;
                    max-height: 90vh;
                    border-radius: 4px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                }
                .modal-header {
                    padding: 15px;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-content {
                    padding: 0; /* Bootstrap existing class conflict? Just in case */
                    border: none;
                    box-shadow: none;
                }
                .modal-body {
                    padding: 15px;
                    overflow-y: auto;
                }
                .close-btn {
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: #777;
                }
                .close-btn:hover { color: #333; }
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

                            {activeReport && (
                                <>
                                    {currentConfig.filters.length > 0 && (
                                        <>
                                            <div className="select-criteria-header"><i className="fa fa-search"></i> Select Criteria</div>
                                            <div className="filters-area">
                                                <div className="row">
                                                    {currentConfig.filters.includes('class') && (
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label>Class <span className="req">*</span></label>
                                                                <select className="form-control" value={classId} onChange={(e) => setClassId(e.target.value)} required>
                                                                    <option value="">Select</option>
                                                                    {classes.map((cls) => (
                                                                        <option key={cls.id} value={cls.id}>{cls.class}</option>
                                                                    ))}
                                                                    {classes.length === 0 && <option value="1">Class 1</option>}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {currentConfig.filters.includes('section') && (
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label>Section</label>
                                                                <select className="form-control" value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
                                                                    <option value="">Select</option>
                                                                    {sections.map((sec) => (
                                                                        <option key={sec.id} value={sec.section_id}>{sec.section}</option>
                                                                    ))}
                                                                    {sections.length === 0 && <option value="1">Section A</option>}
                                                                </select>
                                                            </div>
                                                        </div>
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
                                                        <div className="col-sm-12" style={{ textAlign: 'right', marginTop: '10px' }}>
                                                            <button className="btn btn-purple btn-sm" onClick={handleSearch}><i className="fa fa-search"></i> Search</button>
                                                        </div>
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
                                                {loading ? (
                                                    <tr><td colSpan={currentConfig.headers.length} style={{ textAlign: 'center' }}>Loading...</td></tr>
                                                ) : (
                                                    <>
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
                                                    </>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}

                            {/* Modal for Student List */}
                            {subView && (
                                <div className="modal-overlay" onClick={() => setSubView(null)}>
                                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                                        <div className="modal-header">
                                            <h4 className="modal-title">{subView.title}</h4>
                                            <button className="close-btn" onClick={() => setSubView(null)}>&times;</button>
                                        </div>
                                        <div className="modal-body">
                                            <div className="dt-header">
                                                <div className="dt-search">
                                                    <input type="text" placeholder="Search..." />
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
                                                            {studentListConfig.headers.map((header, idx) => (
                                                                <th key={idx}>{header} <i className="fa fa-sort"></i></th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {subView.data.map((row, index) => (
                                                            <tr key={index}>
                                                                <td>{row.admission_no}</td>
                                                                <td><span className="student-link">{row.firstname} {row.lastname}</span></td>
                                                                <td>{row.class} ({row.section})</td>
                                                                <td>{row.father_name}</td>
                                                                <td>{row.dob}</td>
                                                                <td>{row.gender}</td>
                                                                <td>{row.category}</td>
                                                                <td>{row.mobileno}</td>
                                                            </tr>
                                                        ))}
                                                        {subView.data.length === 0 && (
                                                            <tr><td colSpan={studentListConfig.headers.length} style={{ textAlign: 'center' }}>No students found</td></tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </section>
            </div >
            <Footer />
        </div >
    );
};

export default StudentInformationReport;
