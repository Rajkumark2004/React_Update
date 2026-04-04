import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import ReportsSidebar from '../../components/ReportsSidebar';
import '../../styles/reports.css';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable } from '../../utils/tableExport';
import Pagination from '../../utils/Pagination';

const StudentInformationReport = () => {
    const navigate = useNavigate();
    const [activeReport, setActiveReport] = useState('');
    const [subView, setSubView] = useState(null); // { type, data, title }
    const [searchTerm, setSearchTerm] = useState('');
    const [visibleColumns, setVisibleColumns] = useState(new Set());
    const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
    const [errors, setErrors] = useState({});

    // Modal Specific State
    const [subSearchTerm, setSubSearchTerm] = useState('');
    const [subVisibleColumns, setSubVisibleColumns] = useState(new Set());
    const [showSubColumnsDropdown, setShowSubColumnsDropdown] = useState(false);

    const [studentData, setStudentData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);

    // Shared Form states
    const [classId, setClassId] = useState('');
    const [sectionId, setSectionId] = useState('');
    const [admissionDate, setAdmissionDate] = useState('');
    const [searchType, setSearchType] = useState('today');
    const [status, setStatus] = useState('');
    const [admissionYear, setAdmissionYear] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(100);

    // Reset page to 1 when filters or report changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeReport, searchTerm, classId, sectionId]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch report status (original logic)
                const statusRes = await api.getStudentInformationReport();
                if (statusRes.status) {
                    toast.success(statusRes.message);
                }

                // Fetch classes once on mount for all reports
                const classesRes = await api.getGuardianReport(); // Any report that returns classlist
                if (classesRes.status && classesRes.data && classesRes.data.classlist) {
                    setClasses(classesRes.data.classlist);
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        };

        fetchInitialData();
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
                setStudentData([]); // Data loaded via Search button
            } else if (activeReport === 'Student Login Credential') {
                setStudentData([]);
            } else if (activeReport === 'Parent Login Credential') {
                setStudentData([]);
            } else if (activeReport === 'Sibling Report') {
                setStudentData([]);
            } else if (activeReport === 'Student All Data Report') {
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



    useEffect(() => {
        const fetchSections = async () => {
            if (currentConfig.filters.includes('section') && classId) {
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
        [/* "Student History", */ "Student Login Credential", "Parent Login Credential"],
        [/* "Class Subject Report", "Admission Report", */ "Sibling Report"],
        [/* "Student Profile", "Student Gender Ratio Report", "Student Teacher Ratio Report" */],
        [/* "Online Admission Report", */ "Student All Data Report", "App Install Users Report"]
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
        'Student All Data Report': {
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

    // Sync visible columns when report changes
    useEffect(() => {
        setVisibleColumns(new Set(currentConfig.headers));
        setShowColumnsDropdown(false);
    }, [activeReport]);




    const studentListConfig = {
        headers: ["Admission No", "Student Name", "Class", "Father Name", "Date of Birth", "Gender", "Category", "Mobile Number"]
    };

    const filteredData = useMemo(() => {
        if (!studentData) return [];
        // Sibling Report uses grouped data structure
        if (activeReport === 'Sibling Report') {
            if (!searchTerm) return studentData;
            const searchStr = searchTerm.toLowerCase();
            return studentData.filter(group => {
                return group.some(student =>
                    (student.firstname && student.firstname.toLowerCase().includes(searchStr)) ||
                    (student.lastname && student.lastname.toLowerCase().includes(searchStr)) ||
                    (student.father_name && student.father_name.toLowerCase().includes(searchStr)) ||
                    (student.mother_name && student.mother_name.toLowerCase().includes(searchStr)) ||
                    (student.guardian_name && student.guardian_name.toLowerCase().includes(searchStr)) ||
                    (student.guardian_phone && student.guardian_phone.toLowerCase().includes(searchStr))
                );
            });
        }
        return studentData.filter((row) => {
            // Filter by Class/Section if applicable and selected (client-side for all-data reports)
            if (currentConfig.filters.includes('class') && classId && row.class_id && String(row.class_id) !== String(classId)) {
                return false;
            }
            if (currentConfig.filters.includes('section') && sectionId && row.section_id && String(row.section_id) !== String(sectionId)) {
                return false;
            }

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

        // Clear all filter selections per user request
        setClassId('');
        setSectionId('');
        setAdmissionDate('');
        setSearchType('today');
        setStatus('');
        setAdmissionYear('');
        setStudentData([]); // Also clear search results
        setErrors({});
    };

    // Export helpers
    const getRowValue = (header, row, index) => {
        const maps = {
            'Student Report': {
                'SNO': (r, i) => i + 1,
                'Class': (r) => `${r.class} (${r.section})`,
                'Roll No.': (r) => r.roll_no,
                'Student Name': (r) => `${r.firstname} ${r.lastname}`,
                'Mobile Number': (r) => r.mobileno,
                'Gender': (r) => r.gender,
                'Admission No': (r) => r.admission_no,
                'Admission Date': (r) => r.admission_date,
                'Caste': (r) => r.cast,
                'Aadhar Number': (r) => r.adhar_no,
                'Date of Birth': (r) => r.dob,
                'Father Name': (r) => r.father_name,
                'Mother Name': (r) => r.mother_name,
                'Current Address': (r) => r.current_address,
                'Child ID': (r) => r.child_id
            },
            'Student All Data Report': {
                'SNO': (r, i) => i + 1,
                'Class': (r) => `${r.class} (${r.section})`,
                'Roll No.': (r) => r.roll_no,
                'Student Name': (r) => `${r.firstname} ${r.lastname}`,
                'Mobile Number': (r) => r.mobileno,
                'Gender': (r) => r.gender,
                'Admission No': (r) => r.admission_no,
                'Admission Date': (r) => r.admission_date,
                'Category': (r) => r.category || r.category_id,
                'Religion': (r) => r.religion,
                'Caste': (r) => r.cast,
                'Blood Group': (r) => r.blood_group,
                'Height': (r) => r.height,
                'Weight': (r) => r.weight,
                'Aadhar Number': (r) => r.adhar_no,
                'Date of Birth': (r) => r.dob,
                'Father Name': (r) => r.father_name,
                'Mother Name': (r) => r.mother_name,
                'Guardian Name': (r) => r.guardian_name,
                'Current Address': (r) => r.current_address,
                'Child ID': (r) => r.child_id
            },
            'Guardian Report': {
                'Class (Section)': (r) => `${r.class} (${r.section})`,
                'Admission No': (r) => r.admission_no,
                'Student Name': (r) => `${r.firstname} ${r.lastname}`,
                'Mobile Number': (r) => r.mobileno,
                'Guardian Name': (r) => r.guardian_name,
                'Guardian Relation': (r) => r.guardian_relation,
                'Guardian Phone': (r) => r.guardian_phone,
                'Father Name': (r) => r.father_name,
                'Father Phone': (r) => r.father_phone,
                'Mother Name': (r) => r.mother_name,
                'Mother Phone': (r) => r.mother_phone
            },
            'Student Login Credential': {
                'Admission No': (r) => r[0],
                'Student Name': (r) => r[1]?.name,
                'Username': (r) => r[2],
                'Password': (r) => r[3]
            },
            'Parent Login Credential': {
                'Admission No': (r) => r[0],
                'Student Name': (r) => {
                    let name = r[1] ? String(r[1]) : '';
                    const match = name.match(/>([^<]+)</);
                    return match ? match[1] : name;
                },
                'Parent Username': (r) => r[2],
                'Parent Password': (r) => r[3]
            },
            'Sibling Report': {
                'Father Name': (r) => r.father_name,
                'Mother Name': (r) => r.mother_name,
                'Guardian Name': (r) => r.guardian_name,
                'Guardian Phone': (r) => r.guardian_phone,
                'Student Name (Sibling)': (r) => `${r.firstname} ${r.lastname}`,
                'Class': (r) => `${r.class} (${r.section})`,
                'Admission Date': (r) => r.admission_date,
                'Gender': (r) => r.gender
            },
            'App Install Users Report': {
                'Student Name': (r) => `${r.firstname} ${r.lastname}`,
                'Class(Section)': (r) => `${r.class} (${r.section})`,
                'Admission No': (r) => r.admission_no,
                'Father Name': (r) => r.father_name || r.guardian_name || '-',
                'Mobile No': (r) => r.mobileno || r.guardian_phone || '-',
                'Role': (r) => r.role,
                'Date': (r) => r.created_date
            },
            'Class & Section Report': {
                'S.No': (r, i) => i + 1,
                'Class (Section)': (r) => `${r.class} (${r.section})`,
                'Students': (r) => r.student_count
            },
            'Student Profile': {
                'Roll Number': (r) => r.roll_no,
                'Class': (r) => r.class,
                'Section': (r) => r.section,
                'First Name': (r) => r.firstname,
                'Last Name': (r) => r.lastname,
                'Gender': (r) => r.gender,
                'Date of Birth': (r) => r.dob,
                'Category': (r) => r.category || r.category_id,
                'Religion': (r) => r.religion,
                'Caste': (r) => r.cast,
                'Mobile Number': (r) => r.mobileno,
                'Email': (r) => r.email,
                'Admission Date': (r) => r.admission_date,
                'Blood Group': (r) => r.blood_group,
                'House': (r) => r.house_name || '-',
                'Height': (r) => r.height,
                'Weight': (r) => r.weight,
                'Measurement Date': (r) => r.measurement_date,
                'Fees Discount': (r) => r.fees_discount,
                'Father Name': (r) => r.father_name,
                'Father Phone': (r) => r.father_phone,
                'Father Occupation': (r) => r.father_occupation,
                'Mother Name': (r) => r.mother_name,
                'Mother Phone': (r) => r.mother_phone,
                'Mother Occupation': (r) => r.mother_occupation,
                'If Guardian Is': (r) => r.guardian_is,
                'Guardian Name': (r) => r.guardian_name,
                'Guardian Relation': (r) => r.guardian_relation,
                'Guardian Phone': (r) => r.guardian_phone,
                'Guardian Occupation': (r) => r.guardian_occupation,
                'Guardian Email': (r) => r.guardian_email,
                'Guardian Address': (r) => r.guardian_address,
                'Current Address': (r) => r.current_address,
                'Permanent Address': (r) => r.permanent_address,
                'Route List': (r) => r.route_list || '-',
                'Hostel Details': (r) => r.hostel_name || '-',
                'Room No.': (r) => r.room_no,
                'Bank Account Number': (r) => r.bank_account_no,
                'Bank Name': (r) => r.bank_name,
                'IFSC Code': (r) => r.ifsc_code,
                'National Identification Number': (r) => r.adhar_no,
                'Local Identification Number': (r) => r.samagra_id,
                'RTE': (r) => r.rte,
                'Previous School Details': (r) => r.previous_school,
                'Note': (r) => r.note
            }
        };

        const reportMap = maps[activeReport];
        if (reportMap && reportMap[header]) {
            return reportMap[header](row, index);
        }
        return row[header] || '-';
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    const getVisibleHeaders = () => currentConfig.headers.filter(h => visibleColumns.has(h));
    const getExportRows = () => {
        if (activeReport === 'Sibling Report') {
            // Flatten grouped sibling data for export
            const rows = [];
            filteredData.forEach(group => {
                group.forEach(student => {
                    rows.push(getVisibleHeaders().map(h => String(getRowValue(h, student, 0) ?? '')));
                });
            });
            return rows;
        }
        return filteredData.map((row, index) => getVisibleHeaders().map(h => String(getRowValue(h, row, index) ?? '')));
    };
    const handleCopy = () => copyToClipboard(getVisibleHeaders(), getExportRows());
    const handleExcel = () => downloadExcel(getVisibleHeaders(), getExportRows(), `${activeReport}.xls`);
    const handleCSV = () => downloadCSV(getVisibleHeaders(), getExportRows(), `${activeReport}.csv`);
    const handlePDF = () => downloadPDF(getVisibleHeaders(), getExportRows(), `${activeReport}.pdf`, activeReport);
    const handlePrint = () => printTable(getVisibleHeaders(), getExportRows(), activeReport);
    const toggleColumn = (h) => setVisibleColumns(prev => { const n = new Set(prev); n.has(h) ? n.delete(h) : n.add(h); return n; });

    // Modal Export Helpers
    const getSubVisibleHeaders = () => studentListConfig.headers.filter(h => subVisibleColumns.has(h));
    const filteredModalData = useMemo(() => {
        if (!subView || !subView.data) return [];
        const searchStr = subSearchTerm.toLowerCase();
        return subView.data.filter(row =>
            String(row.admission_no || '').toLowerCase().includes(searchStr) ||
            String(row.firstname || '').toLowerCase().includes(searchStr) ||
            String(row.lastname || '').toLowerCase().includes(searchStr) ||
            String(row.father_name || '').toLowerCase().includes(searchStr) ||
            String(row.mobileno || '').toLowerCase().includes(searchStr)
        );
    }, [subView, subSearchTerm]);

    const getSubExportRows = () => filteredModalData.map(row => {
        const rowData = {
            "Admission No": row.admission_no,
            "Student Name": `${row.firstname} ${row.lastname}`,
            "Class": `${row.class} (${row.section})`,
            "Father Name": row.father_name,
            "Date of Birth": row.dob,
            "Gender": row.gender,
            "Category": row.category,
            "Mobile Number": row.mobileno
        };
        return getSubVisibleHeaders().map(h => String(rowData[h] ?? ''));
    });

    const handleSubCopy = () => copyToClipboard(getSubVisibleHeaders(), getSubExportRows());
    const handleSubExcel = () => downloadExcel(getSubVisibleHeaders(), getSubExportRows(), `${subView?.title}.xls`);
    const handleSubCSV = () => downloadCSV(getSubVisibleHeaders(), getSubExportRows(), `${subView?.title}.csv`);
    const handleSubPDF = () => downloadPDF(getSubVisibleHeaders(), getSubExportRows(), `${subView?.title}.pdf`, subView?.title);
    const handleSubPrint = () => printTable(getSubVisibleHeaders(), getSubExportRows(), subView?.title);
    const toggleSubColumn = (h) => setSubVisibleColumns(prev => { const n = new Set(prev); n.has(h) ? n.delete(h) : n.add(h); return n; });

    const handleViewStudentList = async (class_section_id, className, sectionName) => {
        try {
            setLoading(true);
            const response = await api.getStudentByClassSectionNew(class_section_id);
            if (response.status && response.data && response.data.student_list) {
                setSubView({
                    type: 'student_list',
                    data: response.data.student_list,
                    title: `Student List - ${className} (${sectionName})`
                });
                setSubVisibleColumns(new Set(studentListConfig.headers));
                setSubSearchTerm('');
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
        const newErrors = {};
        if (currentConfig.filters.includes('class') && !classId) {
            newErrors.class = 'Please select a class';
        }
        if (currentConfig.filters.includes('section') && !sectionId) {
            newErrors.section = 'section is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            // Optionally keep toasts for backward compatibility with current style
            if (newErrors.class) toast.error(newErrors.class);
            if (newErrors.section) toast.error(newErrors.section);
            return;
        }
        setErrors({});

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
                    // Keep only parent groups with 2+ children (actual siblings)
                    const grouped = Object.values(response.data.resultlist).filter(group => group.length >= 2);
                    setStudentData(grouped);
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
            case 'Student All Data Report':
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
                        <td>{row.category}</td>
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
                // Sibling report uses grouped rendering, handled separately in the table body
                return null;
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
                    <div className="row">
                        <ReportsSidebar activeGroup="SIS" />

                        <div className="col-md-10">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Student Information Report</h3>
                                </div>
                                <div className="box-body">

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
                                                                {errors.class && <span className="text-danger" style={{ fontSize: '11px', display: 'block', marginTop: '2px' }}>{errors.class}</span>}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {currentConfig.filters.includes('section') && (
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label>Section <span className="req">*</span></label>
                                                                <select className="form-control" value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
                                                                    <option value="">Select</option>
                                                                    {sections.map((sec) => (
                                                                        <option key={sec.id} value={sec.section_id}>{sec.section}</option>
                                                                    ))}
                                                                    {sections.length === 0 && <option value="1">Section A</option>}
                                                                </select>
                                                                {errors.section && <span className="text-danger" style={{ fontSize: '11px', display: 'block', marginTop: '2px' }}>{errors.section}</span>}
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
                                        <div className="dt-buttons" style={{ position: 'relative' }}>
                                            <button className="dt-button" title="Copy" onClick={handleCopy}><i className="fa fa-copy"></i></button>
                                            <button className="dt-button" title="Excel" onClick={handleExcel}><i className="fa fa-file-excel-o"></i></button>
                                            <button className="dt-button" title="CSV" onClick={handleCSV}><i className="fa fa-file-text-o"></i></button>
                                            <button className="dt-button" title="PDF" onClick={handlePDF}><i className="fa fa-file-pdf-o"></i></button>
                                            <button className="dt-button" title="Print" onClick={handlePrint}><i className="fa fa-print"></i></button>
                                            <button className="dt-button" title="Columns" onClick={() => setShowColumnsDropdown(v => !v)}>
                                                <i className="fa fa-columns"></i>
                                            </button>
                                            {showColumnsDropdown && (
                                                <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 1000, background: '#fff', border: '1px solid #ccc', borderRadius: '4px', padding: '8px 10px', minWidth: '200px', maxHeight: '300px', overflowY: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                                                    {currentConfig.headers.map(h => (
                                                        <label key={h} style={{ display: 'block', cursor: 'pointer', padding: '2px 0', fontSize: '13px', fontWeight: 'normal' }}>
                                                            <input type="checkbox" checked={visibleColumns.has(h)} onChange={() => toggleColumn(h)} style={{ marginRight: '6px' }} />
                                                            {h}
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
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
                                                ) : activeReport === 'Sibling Report' ? (
                                                    <>
                                                        {currentData.map((group, gIdx) => {
                                                            const firstStudent = group[0];
                                                            return (
                                                                <React.Fragment key={indexOfFirstItem + gIdx}>
                                                                    {/* Parent info header row */}
                                                                    <tr style={{ backgroundColor: '#f5f5f5', borderTop: '2px solid #ddd' }}>
                                                                        <td><strong>{firstStudent.father_name || '-'}</strong></td>
                                                                        <td><strong>{firstStudent.mother_name || '-'}</strong></td>
                                                                        <td><strong>{firstStudent.guardian_name || '-'}</strong></td>
                                                                        <td><strong>{firstStudent.guardian_phone || '-'}</strong></td>
                                                                        <td colSpan="4"></td>
                                                                    </tr>
                                                                    {/* Individual student rows */}
                                                                    {group.map((student, sIdx) => (
                                                                        <tr key={`${indexOfFirstItem + gIdx}-${sIdx}`}>
                                                                            <td colSpan="4"></td>
                                                                            <td>{student.firstname} {student.lastname || ''}</td>
                                                                            <td>{student.class} ({student.section})</td>
                                                                            <td>{student.admission_date || '-'}</td>
                                                                            <td>{student.gender}</td>
                                                                        </tr>
                                                                    ))}
                                                                </React.Fragment>
                                                            );
                                                        })}
                                                        {currentData.length === 0 && <tr><td colSpan={currentConfig.headers.length} style={{ textAlign: 'center' }}>No record found</td></tr>}
                                                    </>
                                                ) : (
                                                    <>
                                                        {currentData.map((row, index) => (
                                                            <tr key={indexOfFirstItem + index}>{renderRow(row, indexOfFirstItem + index)}</tr>
                                                        ))}
                                                        {currentData.length > 0 && activeReport === 'Student Gender Ratio Report' && (
                                                            <tr className="total-row">
                                                                <td>Total</td><td>{totals.boys}</td><td>{totals.girls}</td><td>{totals.students}</td><td>{(totals.boys / totals.girls).toFixed(2)}</td>
                                                            </tr>
                                                        )}
                                                        {currentData.length > 0 && activeReport === 'Student Teacher Ratio Report' && (
                                                            <tr className="total-row">
                                                                <td>Total</td><td>{totals.students}</td><td>{totals.teachers}</td><td>{(totals.students / totals.teachers).toFixed(1)}:1</td>
                                                            </tr>
                                                        )}
                                                        {currentData.length === 0 && <tr><td colSpan={currentConfig.headers.length} style={{ textAlign: 'center' }}>No record found</td></tr>}
                                                    </>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    {filteredData.length > 0 && (
                                        <div className="pt15 pb15">
                                            <Pagination 
                                                totalItems={filteredData.length} 
                                                itemsPerPage={itemsPerPage} 
                                                currentPage={currentPage}
                                                onPageChange={(page) => setCurrentPage(page)}
                                            />
                                        </div>
                                    )}
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
                                                    <input type="text" placeholder="Search..." value={subSearchTerm} onChange={(e) => setSubSearchTerm(e.target.value)} />
                                                </div>
                                                <div className="dt-buttons" style={{ position: 'relative' }}>
                                                    <button className="dt-button" title="Copy" onClick={handleSubCopy}><i className="fa fa-copy"></i></button>
                                                    <button className="dt-button" title="Excel" onClick={handleSubExcel}><i className="fa fa-file-excel-o"></i></button>
                                                    <button className="dt-button" title="CSV" onClick={handleSubCSV}><i className="fa fa-file-text-o"></i></button>
                                                    <button className="dt-button" title="PDF" onClick={handleSubPDF}><i className="fa fa-file-pdf-o"></i></button>
                                                    <button className="dt-button" title="Print" onClick={handleSubPrint}><i className="fa fa-print"></i></button>
                                                    <button className="dt-button" title="Columns" onClick={() => setShowSubColumnsDropdown(v => !v)}>
                                                        <i className="fa fa-columns"></i>
                                                    </button>
                                                    {showSubColumnsDropdown && (
                                                        <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 1000, background: '#fff', border: '1px solid #ccc', borderRadius: '4px', padding: '8px 10px', minWidth: '200px', maxHeight: '300px', overflowY: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                                                            {studentListConfig.headers.map(h => (
                                                                <label key={h} style={{ display: 'block', cursor: 'pointer', padding: '2px 0', fontSize: '13px', fontWeight: 'normal' }}>
                                                                    <input type="checkbox" checked={subVisibleColumns.has(h)} onChange={() => toggleSubColumn(h)} style={{ marginRight: '6px' }} />
                                                                    {h}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="table-responsive">
                                                <table className="table-custom">
                                                    <thead>
                                                        <tr>
                                                            {studentListConfig.headers.filter(h => subVisibleColumns.has(h)).map((header, idx) => (
                                                                <th key={idx}>{header} <i className="fa fa-sort"></i></th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredModalData.map((row, index) => (
                                                            <tr key={index}>
                                                                {subVisibleColumns.has("Admission No") && <td>{row.admission_no}</td>}
                                                                {subVisibleColumns.has("Student Name") && <td><span className="student-link">{row.firstname} {row.lastname}</span></td>}
                                                                {subVisibleColumns.has("Class") && <td>{row.class} ({row.section})</td>}
                                                                {subVisibleColumns.has("Father Name") && <td>{row.father_name}</td>}
                                                                {subVisibleColumns.has("Date of Birth") && <td>{row.dob}</td>}
                                                                {subVisibleColumns.has("Gender") && <td>{row.gender}</td>}
                                                                {subVisibleColumns.has("Category") && <td>{row.category}</td>}
                                                                {subVisibleColumns.has("Mobile Number") && <td>{row.mobileno}</td>}
                                                            </tr>
                                                        ))}
                                                        {filteredModalData.length === 0 && (
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
                        </div>
                    </div>
                </section>
            </div >
            <Footer />
        </div >
    );
};

export default StudentInformationReport;
