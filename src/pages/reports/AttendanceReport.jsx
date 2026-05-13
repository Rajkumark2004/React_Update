import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import '../../styles/reports.css';
import TableToolbar from '../../utils/TableToolbar';
import Pagination from '../../utils/Pagination';

const AttendanceReport = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;
    // Navigation and visibility state
    const [activeReport, setActiveReport] = useState(location.state?.activeReport || 'class_attendance');

    // Shared Form states
    const [classId, setClassId] = useState('');
    const [sectionId, setSectionId] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [date, setDate] = useState('2025-01-01');
    const [dateFrom, setDateFrom] = useState('2025-01-01');
    const [dateTo, setDateTo] = useState('2025-01-31');
    const [role, setRole] = useState('');
    const [attendanceType, setAttendanceType] = useState('');
    const [studentId, setStudentId] = useState('');
    const [searchType, setSearchType] = useState('today');
    const [searchTerm, setSearchTerm] = useState('');
    const [visibleColumns, setVisibleColumns] = useState(new Set());
    const dropdownRef = React.useRef(null);

    // Table states
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [reportData, setReportData] = useState(null);

    const toggleColumn = (key) => {
        setVisibleColumns(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) newSet.delete(key);
            else newSet.add(key);
            return newSet;
        });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowColumnsDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Data states
    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [monthList, setMonthList] = useState([]);
    const [yearList, setYearList] = useState([]);
    const [subjectList, setSubjectList] = useState([]);
    const [attendanceTypesList, setAttendanceTypesList] = useState([]);
    const [searchTypeList, setSearchTypeList] = useState({});
    const [roleList, setRoleList] = useState([]); // Added for Staff Attendance Report
    const [studentList, setStudentList] = useState([]); // Added for Late Entries Report Student Selection

    // Constants for logic/display (kept for compatibility with existing mock/logic)
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Using this for table headers to match existing mock logic until full API search integration
    const attTypes = [
        { id: '1', type: 'Present', key: 'P' },
        { id: '2', type: 'Late', key: 'L' },
        { id: '3', type: 'Absent', key: 'A' },
        { id: '4', type: 'Half Day', key: 'F' }
    ];

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const response = await api.getClassAttendanceReport();
            if (response) {
                // Process Month List
                if (response.monthlist) {
                    setMonthList(Object.values(response.monthlist));
                }

                // Process Year List
                if (response.yearlist && Array.isArray(response.yearlist)) {
                    setYearList(response.yearlist.map(y => y.year));
                }

                // Process Class List
                if (response.classlist && Array.isArray(response.classlist)) {
                    setClassList(response.classlist);
                }

                // Process Attendance Types List - For type report mostly
                if (response.attendencetypeslist && Array.isArray(response.attendencetypeslist)) {
                    setAttendanceTypesList(response.attendencetypeslist);
                }
            }
        } catch (error) {
            console.error('Error fetching initial report data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClassChange = async (e) => {
        const selectedClassId = e.target.value;
        setClassId(selectedClassId);
        setSectionId(''); // Reset section
        setSectionList([]);

        if (selectedClassId) {
            try {
                const response = await api.getSectionsByClass(selectedClassId);
                if (response && response.data) {
                    setSectionList(response.data);
                }
            } catch (error) {
                console.error('Error fetching sections:', error);
            }
        }
    };

    // Fetch data for Attendance Type Report when active
    useEffect(() => {
        if (activeReport === 'type_report') {
            // Only fetch if data (like search types) hasn't been loaded yet
            if (Object.keys(searchTypeList).length > 0) return;

            const fetchTypeReportData = async () => {
                try {
                    setLoading(true);
                    const response = await api.getAttendanceTypeReport();
                    if (response) {
                        if (response.attendance_type) {
                            setAttendanceTypesList(response.attendance_type);
                        }
                        if (response.searchlist) {
                            setSearchTypeList(response.searchlist);
                        }
                        // Use classlist from this response if needed, for consistency, or keep existing.
                        // User mentioned "populate classlist and sections from getbyclass". 
                        // If "getbyclass" refers to this endpoint (or generic class fetch), let's ensure classList is populated.
                        if (response.classlist && Array.isArray(response.classlist)) {
                            // Only update if we dictate specific list for this report, OR just use the common one.
                            // Given potential differences, let's update it.
                            setClassList(response.classlist);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching attendance type report data:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchTypeReportData();
        }
    }, [activeReport]);

    // Fetch data for Daily Attendance Report when tab is clicked
    useEffect(() => {
        if (activeReport === 'daily_report') {
            const fetchDailyReport = async () => {
                try {
                    setLoading(true);
                    console.log('Auto-fetching Daily Attendance Report on tab click');
                    const response = await api.getDailyAttendanceReport();
                    console.log('Daily Attendance Report Response:', response);

                    if (response) {
                        // Update date from response (convert DD/MM/YYYY to YYYY-MM-DD for input field)
                        if (response.date) {
                            // API might return date with escaped slashes like "17\/02\/2026"
                            // or standard "17/02/2026". We sanitize it just in case.
                            let dateStr = String(response.date).replace(/\\/g, '');
                            console.log('Raw date from API:', response.date, 'Sanitized:', dateStr);

                            const parts = dateStr.split('/');
                            if (parts.length === 3) {
                                // Assume DD/MM/YYYY -> YYYY-MM-DD
                                const day = parts[0];
                                const month = parts[1];
                                const year = parts[2];
                                const newDate = `${year}-${month}-${day}`;
                                console.log('Setting date state to:', newDate);
                                setDate(newDate);
                            } else {
                                console.warn('Date format not recognized:', dateStr);
                            }
                        }

                        setReportData({
                            list: response.resultlist || [],
                            totals: {
                                present: response.all_present || 0,
                                absent: response.all_absent || 0,
                                present_percent: response.all_present_percent || '0%',
                                absent_percent: response.all_absent_percent || '0%'
                            }
                        });
                        setSearched(true);
                    }
                } catch (error) {
                    console.error('Error auto-fetching daily attendance report:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchDailyReport();
        }
    }, [activeReport]);

    // Fetch data for Staff Attendance Report when tab is clicked
    useEffect(() => {
        if (activeReport === 'staff_report') {
            const fetchStaffReportData = async () => {
                try {
                    setLoading(true);
                    const response = await api.getStaffAttendanceReport();
                    if (response) {
                        if (response.role && Array.isArray(response.role)) {
                            setRoleList(response.role);
                        }
                        if (response.monthlist) {
                            // Ensure it's an array for mapping
                            setMonthList(Object.values(response.monthlist));
                        }
                        if (response.yearlist && Array.isArray(response.yearlist)) {
                            setYearList(response.yearlist.map(y => y.year));
                        }
                        // Helper to create attendance types map if needed, or just use existing list if provided
                        if (response.attendencetypeslist && Array.isArray(response.attendencetypeslist)) {
                            setAttendanceTypesList(response.attendencetypeslist);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching staff attendance report data:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchStaffReportData();
        }
    }, [activeReport]);

    // Fetch data for Late Entries Report when tab is clicked
    useEffect(() => {
        if (activeReport === 'late_report') {
            const fetchLateReportData = async () => {
                try {
                    setLoading(true);
                    const response = await api.getLateEntriesReport();
                    if (response && response.classlist) {
                        setClassList(response.classlist);
                    }
                } catch (error) {
                    console.error('Error fetching late report classlist:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchLateReportData();
        }
    }, [activeReport]);

    // Fetch student list for Late Entry when class and section are selected
    useEffect(() => {
        if (activeReport === 'late_report' && classId && sectionId) {
            const fetchStudents = async () => {
                try {
                    const response = await api.getStudentsByClassAndSection(classId, sectionId);
                    if (Array.isArray(response)) {
                        setStudentList(response);
                        setStudentId(''); // Added reset
                    }
                } catch (error) {
                    console.error('Error fetching student list for late entry:', error);
                }
            };
            fetchStudents();
        } else if (activeReport === 'late_report' && (!classId || !sectionId)) {
            setStudentList([]);
            setStudentId(''); // Added reset
        }
    }, [activeReport, classId, sectionId]);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSearched(false);
        setSearchTerm('');
        setReportData(null);
        console.log('handleSearch triggered. activeReport:', activeReport);




        if (activeReport === 'class_attendance') {
            try {
                const payload = {
                    class_id: classId,
                    section_id: sectionId,
                    month: month,
                    year: year
                };
                const response = await api.searchClassAttendanceReport(payload);
                if (response) {
                    const studentsMap = {};
                    // Helper to safely get string values
                    const safeStr = (val) => val || '';

                    // 1. Initialize students from the first day ofresultlist (or iterate all if needed, but first day should have all students)
                    // Actually, let's iterate all days to be safe, or just take the first entry if we assume consistent student list.
                    // Using the first day's list is safer for performance if the list is consistent.
                    const firstDayKey = response.resultlist ? Object.keys(response.resultlist)[0] : null;
                    if (firstDayKey && response.resultlist[firstDayKey]) {
                        Object.values(response.resultlist[firstDayKey]).forEach(student => {
                            studentsMap[student.student_session_id] = {
                                id: student.student_session_id,
                                name: `${safeStr(student.firstname)} ${safeStr(student.lastname)}`.trim(),
                                admission_no: student.admission_no,
                                roll_no: student.roll_no,
                                percentage: 0,
                                counts: { P: 0, L: 0, A: 0, H: 0, F: 0 },
                                daily: {}
                            };
                        });
                    }

                    // 2. Fill in daily attendance from resultlist
                    if (response.resultlist) {
                        Object.entries(response.resultlist).forEach(([dateStr, studentsDayData]) => {
                            const day = parseInt(dateStr.split('-')[2], 10);
                            Object.values(studentsDayData).forEach(sData => {
                                if (studentsMap[sData.student_session_id]) {
                                    // Default to '-' if key is null/empty. API 'key' corresponds to attendance type key (e.g. 'P', 'A')
                                    studentsMap[sData.student_session_id].daily[day] = sData.key || '-';
                                }
                            });
                        });
                    }

                    // 3. Fill in counts and calculate percentage from monthAttendance
                    if (response.monthAttendance && Array.isArray(response.monthAttendance)) {
                        response.monthAttendance.forEach(record => {
                            const studentId = Object.keys(record)[0];
                            const stats = record[studentId];
                            if (studentsMap[studentId]) {
                                const p = parseInt(stats.present) || 0;
                                const l = parseInt(stats.late) || 0;
                                const a = parseInt(stats.absent) || 0;
                                const h = parseInt(stats.holiday) || 0;
                                const f = parseInt(stats.half_day) || 0;
                                const lwe = parseInt(stats.late_with_excuse) || 0;

                                studentsMap[studentId].counts = { P: p, L: l, A: a, H: h, F: f };

                                // Simple percentage calculation: (Present + Late + Half/2) / Total * 100
                                // Total days = sum of all statuses (excluding holidays maybe? or strict total?)
                                // Usually percentage is based on working days. 
                                // Let's assume total working is P + L + A + F + LWE. Holidays usually excluded from percentage.
                                const presentEquivalent = p + l + lwe + (f * 0.5);
                                const totalWorking = p + l + lwe + a + f;

                                // Prevent division by zero
                                studentsMap[studentId].percentage = totalWorking > 0
                                    ? ((presentEquivalent / totalWorking) * 100).toFixed(2)
                                    : '0.00';
                            }
                        });
                    }

                    setReportData({
                        ...response,
                        month: month,
                        year: year,
                        students: Object.values(studentsMap)
                    });
                } else {
                    setReportData({ month, year, students: [] }); // No data found
                }
                setSearched(true);
            } catch (error) {
                console.error('Error searching class attendance:', error);
                // toast.error?
            } finally {
                setLoading(false);
            }
            return;
        }

        if (activeReport === 'type_report') {
            if (!classId || !attendanceType) {
                // Warning or just return? logic seems to be handled by required attribute in form usually,
                // but since we are handling search on button click, we might want to check here.
                // Assuming 'required' attribute handles it for now, but explicit check doesn't hurt.
                return;
            }

            try {
                const payload = {
                    class_id: classId,
                    section_id: sectionId,
                    attendance_type: attendanceType,
                    search_type: searchType
                };

                if (searchType === 'period') {
                    payload.date_from = dateFrom;
                    payload.date_to = dateTo;
                }

                const response = await api.searchAttendanceTypeReport(payload);
                if (response) {
                    let dataList = [];
                    // Check for filtered_data first (e.g. date range search)
                    if (response.filtered_data && Array.isArray(response.filtered_data)) {
                        dataList = response.filtered_data;
                    }
                    // Fallback to student_attendences
                    else if (response.student_attendences && Array.isArray(response.student_attendences)) {
                        dataList = response.student_attendences;
                    }
                    // Fallback to generic array checks
                    else if (Array.isArray(response)) {
                        dataList = response;
                    } else if (response.data && Array.isArray(response.data)) {
                        dataList = response.data;
                    }

                    // Map the data to match table columns
                    if (dataList.length > 0) {
                        const mappedData = dataList.map(s => ({
                            id: s.id,
                            admission_no: s.admission_no,
                            name: `${s.firstname || ''} ${s.lastname || ''}`.trim(),
                            class: s.class,
                            section: s.section,
                            father_name: s.father_name,
                            dob: s.dob,
                            admission_date: s.admission_date,
                            gender: s.gender,
                            mobile: s.mobileno,
                            count: s.total_type
                        }));
                        setReportData(mappedData);
                    } else {
                        setReportData([]);
                    }
                } else {
                    setReportData([]);
                }
                setSearched(true);
            } catch (error) {
                console.error('Error searching attendance type report:', error);
            } finally {
                setLoading(false);
            }
            return;
        }
        if (activeReport === 'daily_report') {
            let dateStr = date;
            // Convert YYYY-MM-DD to DD/MM/YYYY for API
            if (date) {
                const [y, m, d] = date.split('-');
                dateStr = `${d}/${m}/${y}`;
            }
            console.log('Fetching Daily Attendance Report for date:', dateStr);
            try {
                const response = await api.searchDailyAttendanceReport({ date: dateStr });
                console.log('Daily Attendance Report Response:', response);

                if (response) {
                    // Update date from response if available (convert DD/MM/YYYY to YYYY-MM-DD)
                    if (response.date) {
                        let dateStr = String(response.date).replace(/\\/g, '');
                        const parts = dateStr.split('/');
                        if (parts.length === 3) {
                            const newDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                            console.log('Setting date from API response (Search):', newDate);
                            setDate(newDate);
                        }
                    }

                    setReportData({
                        list: response.resultlist || [],
                        totals: {
                            present: response.all_present || 0,
                            absent: response.all_absent || 0,
                            present_percent: response.all_present_percent || '0%',
                            absent_percent: response.all_absent_percent || '0%'
                        }
                    });
                } else {
                    setReportData({ list: [], totals: {} });
                }
                setSearched(true);
            } catch (error) {
                console.error('Error searching daily attendance report:', error);
            } finally {
                setLoading(false);
            }
            return;
        }
        if (activeReport === 'staff_report') {
            try {
                const payload = {
                    month: month,
                    year: year,
                    role: role
                };
                const response = await api.searchStaffAttendanceReport(payload);
                if (response) {
                    const staffMap = {};
                    const safeStr = (val) => val || '';

                    // Extract staff from any available source in response
                    const firstDayKey = response.resultlist ? Object.keys(response.resultlist).find(k => Array.isArray(response.resultlist[k]) && response.resultlist[k].length > 0) : null;
                    const referenceList = firstDayKey ? response.resultlist[firstDayKey] : (response.staff_array || response.student_array || []);

                    if (Array.isArray(referenceList)) {
                        referenceList.forEach(staff => {
                            const sId = staff.staff_id || staff.id;
                            staffMap[sId] = {
                                id: sId,
                                name: `${safeStr(staff.name)} ${safeStr(staff.surname)}`.trim(),
                                employee_id: staff.employee_id,
                                percentage: 0,
                                counts: { P: 0, L: 0, A: 0, H: 0, F: 0 },
                                daily: {}
                            };
                        });
                    }

                    // Fill daily attendance
                    if (response.resultlist) {
                        Object.entries(response.resultlist).forEach(([dateStr, staffDayData]) => {
                            const day = parseInt(dateStr.split('-')[2], 10);
                            if (Array.isArray(staffDayData)) {
                                staffDayData.forEach(sData => {
                                    const sId = sData.staff_id || sData.id;
                                    if (staffMap[sId]) {
                                        staffMap[sId].daily[day] = sData.key || '-';
                                    }
                                });
                            }
                        });
                    }

                    // Fill counts
                    if (response.monthAttendance && Array.isArray(response.monthAttendance)) {
                        response.monthAttendance.forEach(record => {
                            const staffId = Object.keys(record)[0];
                            const stats = record[staffId];
                            if (staffMap[staffId]) {
                                staffMap[staffId].counts = {
                                    P: parseInt(stats.present) || 0,
                                    L: parseInt(stats.late) || 0,
                                    A: parseInt(stats.absent) || 0,
                                    H: parseInt(stats.holiday) || 0,
                                    F: parseInt(stats.half_day) || 0
                                };
                                const totalWorking = staffMap[staffId].counts.P + staffMap[staffId].counts.L + staffMap[staffId].counts.A + staffMap[staffId].counts.F;
                                const presentEquivalent = staffMap[staffId].counts.P + staffMap[staffId].counts.L + (staffMap[staffId].counts.F * 0.5);
                                staffMap[staffId].percentage = totalWorking > 0 ? ((presentEquivalent / totalWorking) * 100).toFixed(2) : '0.00';
                            }
                        });
                    }

                    setReportData({
                        month: response.month_selected || month,
                        year: response.year_selected || year,
                        staff: Object.values(staffMap)
                    });
                }
                setSearched(true);
            } catch (error) {
                console.error('Error searching staff attendance:', error);
            } finally {
                setLoading(false);
            }
            return;
        }

        if (activeReport === 'late_report') {
            try {
                const payload = {
                    date_from: dateFrom,
                    date_to: dateTo,
                    class_id: classId,
                    section_id: sectionId,
                    student_id: studentId
                };
                const response = await api.searchLateEntriesReport(payload);
                if (response) {
                    setReportData(Array.isArray(response) ? response : (response.data || []));
                }
                setSearched(true);
            } catch (error) {
                console.error('Error searching late entries report:', error);
            } finally {
                setLoading(false);
            }
            return;
        }

        setTimeout(() => {
            let data = {};
            if (activeReport !== 'class_attendance' && activeReport !== 'type_report' && activeReport !== 'daily_report' && activeReport !== 'late_report' && activeReport !== 'staff_report') {
                setReportData(data);
                setSearched(true);
                setLoading(false);
            }
        }, 800);
    };
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(100);

    const getFilteredData = () => {
        if (!reportData) return [];
        switch (activeReport) {
            case 'class_attendance':
                return (reportData.students || []).filter(s =>
                    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    s.admission_no.toLowerCase().includes(searchTerm.toLowerCase())
                );
            case 'type_report':
                return (Array.isArray(reportData) ? reportData : []).filter(s =>
                    (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (s.admission_no && s.admission_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (s.father_name && s.father_name.toLowerCase().includes(searchTerm.toLowerCase()))
                );
            case 'daily_report':
                return (Array.isArray(reportData.list) ? reportData.list : []).filter(r =>
                    (r.class_section || '').toLowerCase().includes(searchTerm.toLowerCase())
                );
            case 'staff_report':
                return (reportData.staff || []).filter(s =>
                    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (s.employee_id || '').toLowerCase().includes(searchTerm.toLowerCase())
                );
            case 'late_report':
                return (Array.isArray(reportData) ? reportData : []).filter(r =>
                    `${r.firstname || ''} ${r.lastname || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (r.admission_no || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (r.class || '').toLowerCase().includes(searchTerm.toLowerCase())
                );
            default:
                return [];
        }
    };

    const filteredData = getFilteredData();
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeReport, searched, searchTerm, month, year, classId, sectionId, date, dateFrom, dateTo, role, attendanceType, studentId, searchType]);

    const handleReportClick = (reportKey) => {
        setActiveReport(reportKey);
        setSearched(false);
        setReportData(null);
        setSearchTerm('');

        // Clear all filter selections per user request
        setClassId('');
        setSectionId('');
        setMonth('');
        setYear('');
        setDate('2025-01-01');
        setDateFrom('2025-01-01');
        setDateTo('2025-01-31');
        setRole('');
        setAttendanceType('');
        setStudentId('');
        setSearchType('today');
        setVisibleColumns(new Set());
    };

    // ── Columns and Export Helpers ──────────────────────────────────────────────
    const getColumnsForReport = () => {
        const d = (activeReport === 'class_attendance' || activeReport === 'staff_report') && reportData ? getDaysArray(reportData.month, reportData.year) : [];
        const dayCols = d.map(date => {
            const dayNum = date.getDate();
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
            return { key: `day_${dayNum}`, label: `${dayNum} ${dayName}` };
        });

        switch (activeReport) {
            case 'class_attendance':
                return [
                    { key: 'student_name', label: 'Student Name' },
                    { key: 'percentage', label: '(%)' },
                    { key: 'P', label: 'P' },
                    { key: 'L', label: 'L' },
                    { key: 'A', label: 'A' },
                    { key: 'F', label: 'F' },
                    { key: 'H', label: 'H' },
                    ...dayCols
                ];
            case 'type_report':
                return [
                    { key: 'admission_no', label: 'Admission No' },
                    { key: 'student_name', label: 'Student Name' },
                    { key: 'class_section', label: 'Class (Section)' },
                    { key: 'father_name', label: 'Father Name' },
                    { key: 'dob', label: 'Date Of Birth' },
                    { key: 'adm_date', label: 'Adm Date' },
                    { key: 'gender', label: 'Gender' },
                    { key: 'mobile', label: 'Mobile' },
                    { key: 'count', label: 'Count' }
                ];
            case 'daily_report':
                return [
                    { key: 'class_section', label: 'Class (Section)' },
                    { key: 'total_present', label: 'Total Present' },
                    { key: 'total_absent', label: 'Total Absent' },
                    { key: 'present_percent', label: 'Present %' },
                    { key: 'absent_percent', label: 'Absent %' }
                ];
            case 'staff_report':
                return [
                    { key: 'staff_name', label: 'Staff Name' },
                    { key: 'percentage', label: '(%)' },
                    { key: 'P', label: 'P' },
                    { key: 'L', label: 'L' },
                    { key: 'A', label: 'A' },
                    { key: 'H', label: 'H' },
                    { key: 'F', label: 'F' },
                    ...dayCols
                ];
            case 'late_report':
                return [
                    { key: 's_no', label: 'S.No' },
                    { key: 'name', label: 'Name' },
                    { key: 'admission_no', label: 'Admission No' },
                    { key: 'class_section', label: 'Class (Section)' },
                    { key: 'date', label: 'Date' },
                    { key: 'time', label: 'Time' },
                    { key: 'roll_no', label: 'Roll No' }
                ];
            default: return [];
        }
    };

    // Initialize visibleColumns when reportData changes
    useEffect(() => {
        if (searched && reportData && visibleColumns.size === 0) {
            const cols = getColumnsForReport();
            setVisibleColumns(new Set(cols.map(c => c.key)));
        }
    }, [searched, reportData]);

    const getExportData = () => {
        const columns = getColumnsForReport();
        const activeCols = columns.filter(c => visibleColumns.has(c.key));
        const headers = activeCols.map(c => c.label);
        const data = getFilteredData();
        const d = (activeReport === 'class_attendance' || activeReport === 'staff_report') && reportData ? getDaysArray(reportData.month, reportData.year) : [];

        const rows = data.map((item, index) => {
            const rowData = {};
            switch (activeReport) {
                case 'class_attendance':
                    rowData.student_name = `${item.name} (Adm: ${item.admission_no})`;
                    rowData.percentage = item.percentage;
                    rowData.P = item.counts.P;
                    rowData.L = item.counts.L;
                    rowData.A = item.counts.A;
                    rowData.F = item.counts.F;
                    rowData.H = item.counts.H;
                    d.forEach(day => {
                        const dayNum = day.getDate();
                        const val = item.daily[dayNum] || '-';
                        rowData[`day_${dayNum}`] = val.replace(/<[^>]*>/g, '');
                    });
                    break;
                case 'type_report':
                    rowData.admission_no = item.admission_no;
                    rowData.student_name = item.name;
                    rowData.class_section = `${item.class} (${item.section})`;
                    rowData.father_name = item.father_name;
                    rowData.dob = item.dob;
                    rowData.adm_date = item.admission_date;
                    rowData.gender = item.gender;
                    rowData.mobile = item.mobile;
                    rowData.count = item.count;
                    break;
                case 'daily_report':
                    rowData.class_section = item.class_section || item.class_name || '-';
                    rowData.total_present = item.total_present;
                    rowData.total_absent = item.total_absent;
                    rowData.present_percent = item.present_percent;
                    rowData.absent_percent = item.absent_persent || item.absent_percent;
                    break;
                case 'staff_report':
                    rowData.staff_name = `${item.name} (ID: ${item.employee_id})`;
                    rowData.percentage = item.percentage;
                    rowData.P = item.counts.P;
                    rowData.L = item.counts.L;
                    rowData.A = item.counts.A;
                    rowData.H = item.counts.H;
                    rowData.F = item.counts.F;
                    d.forEach(day => {
                        const dayNum = day.getDate();
                        rowData[`day_${dayNum}`] = item.daily[dayNum] || '-';
                    });
                    break;
                case 'late_report':
                    rowData.s_no = indexOfFirstItem + index + 1;
                    rowData.name = `${item.firstname} ${item.lastname}`;
                    rowData.admission_no = item.admission_no;
                    rowData.class_section = `${item.class} (${item.section})`;
                    rowData.date = item.date;
                    rowData.time = item.time;
                    rowData.roll_no = item.roll_no;
                    break;
            }
            return activeCols.map(c => String(rowData[c.key] ?? ''));
        });

        // Add total row for daily_report
        if (activeReport === 'daily_report' && reportData.totals) {
            const totalRow = activeCols.map(c => {
                if (c.key === 'class_section') return 'Total';
                if (c.key === 'total_present') return String(reportData.totals.present);
                if (c.key === 'total_absent') return String(reportData.totals.absent);
                if (c.key === 'present_percent') return String(reportData.totals.present_percent);
                if (c.key === 'absent_percent') return String(reportData.totals.absent_percent);
                return '';
            });
            rows.push(totalRow);
        }

        return { headers, rows };
    };

    const getExportTitle = () => {
        switch (activeReport) {
            case 'class_attendance': return 'Student Attendance Report';
            case 'type_report': return 'Student Attendance Type Report';
            case 'daily_report': return 'Daily Attendance Report';
            case 'staff_report': return 'Staff Attendance Report';
            case 'late_report': return 'Late Entries Report';
            default: return 'Attendance Report';
        }
    };

    const getDaysArray = (monthName, yearVal) => {
        const monthIndex = months.indexOf(monthName);
        const date = new Date(yearVal, monthIndex, 1);
        const result = [];
        while (date.getMonth() === monthIndex) {
            result.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return result;
    };



    const days = (activeReport === 'class_attendance' || activeReport === 'staff_report') && reportData ? getDaysArray(reportData.month, reportData.year) : [];

    return (
        <AttendanceLayout activeTab="reports">
            <div className="sis-search-bar-container" style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <div className="sis-search-bar-header" style={{ marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                    <h3 className="sis-search-title" style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#1e293b' }}>Attendance Reports</h3>
                </div>

                <div className="report-tabs-wrapper" style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {[
                            { id: 'class_attendance', label: 'Attendance Report', icon: 'fa-file-text-o' },
                            { id: 'type_report', label: 'Student Attendance Type Report', icon: 'fa-file-text-o' },
                            { id: 'daily_report', label: 'Daily Attendance Report', icon: 'fa-file-text-o' },
                            { id: 'staff_report', label: 'Staff Attendance Report', icon: 'fa-file-text-o' },
                            { id: 'late_report', label: 'Late Entries Report', icon: 'fa-file-text-o' }
                        ].map(report => (
                            <button
                                key={report.id}
                                onClick={() => handleReportClick(report.id)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: '1px solid ' + (activeReport === report.id ? '#3b82f6' : '#e2e8f0'),
                                    background: activeReport === report.id ? '#eff6ff' : '#fff',
                                    color: activeReport === report.id ? '#1d4ed8' : '#64748b',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <i className={`fa ${report.icon}`}></i> {report.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="sis-advanced-filters" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: '#475569' }}>
                        <i className="fa fa-search" style={{ marginRight: '8px' }}></i> Select Criteria
                    </h4>
                    <form onSubmit={handleSearch}>
                        <div className="sis-filter-row" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            {(activeReport === 'class_attendance' || activeReport === 'staff_report') && (
                                <>
                                    <div className="sis-filter-col" style={{ flex: '1', minWidth: '180px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>Month <span className="req">*</span></label>
                                        <select className="form-control sis-filter-select" value={month} onChange={(e) => setMonth(e.target.value)} required style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }}>
                                            <option value="">Select</option>
                                            {monthList.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </div>
                                    <div className="sis-filter-col" style={{ flex: '1', minWidth: '180px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>Year <span className="req">*</span></label>
                                        <select className="form-control sis-filter-select" value={year} onChange={(e) => setYear(e.target.value)} required style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }}>
                                            <option value="">Select</option>
                                            {yearList.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                    {activeReport === 'class_attendance' && (
                                        <>
                                            <div className="sis-filter-col" style={{ flex: '1', minWidth: '180px' }}>
                                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>Class <span className="req">*</span></label>
                                                <select className="form-control sis-filter-select" value={classId} onChange={handleClassChange} required style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }}>
                                                    <option value="">Select</option>
                                                    {classList.map(c => <option key={c.id} value={c.id}>{c.class}</option>)}
                                                </select>
                                            </div>
                                            <div className="sis-filter-col" style={{ flex: '1', minWidth: '180px' }}>
                                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>Section <span className="req">*</span></label>
                                                <select className="form-control sis-filter-select" value={sectionId} onChange={(e) => setSectionId(e.target.value)} required style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }}>
                                                    <option value="">Select</option>
                                                    {sectionList.map(s => <option key={s.id} value={s.section_id}>{s.section}</option>)}
                                                </select>
                                            </div>
                                        </>
                                    )}
                                    {activeReport === 'staff_report' && (
                                        <div className="sis-filter-col" style={{ flex: '1', minWidth: '180px' }}>
                                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>Role <span className="req">*</span></label>
                                            <select className="form-control sis-filter-select" value={role} onChange={(e) => setRole(e.target.value)} required style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }}>
                                                <option value="">Select</option>
                                                {roleList.map(r => <option key={r.id} value={r.id}>{r.type}</option>)}
                                            </select>
                                        </div>
                                    )}
                                </>
                            )}
                            {activeReport === 'type_report' && (
                                <>
                                    <div className="sis-filter-col" style={{ flex: '1', minWidth: '160px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>Search Type</label>
                                        <select className="form-control sis-filter-select" value={searchType} onChange={(e) => setSearchType(e.target.value)} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }}>
                                            {Object.entries(searchTypeList).map(([key, value]) => (
                                                <option key={key} value={key}>{value}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="sis-filter-col" style={{ flex: '1', minWidth: '160px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>Attendance Type <span className="req">*</span></label>
                                        <select className="form-control sis-filter-select" value={attendanceType} onChange={(e) => setAttendanceType(e.target.value)} required style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }}>
                                            <option value="">Select</option>
                                            {attendanceTypesList.map(t => <option key={t.id} value={t.id}>{t.type}</option>)}
                                        </select>
                                    </div>
                                    <div className="sis-filter-col" style={{ flex: '1', minWidth: '160px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>Class <span className="req">*</span></label>
                                        <select className="form-control sis-filter-select" value={classId} onChange={handleClassChange} required style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }}>
                                            <option value="">Select</option>
                                            {classList.map(c => <option key={c.id} value={c.id}>{c.class}</option>)}
                                        </select>
                                    </div>
                                    <div className="sis-filter-col" style={{ flex: '1', minWidth: '160px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>Section</label>
                                        <select className="form-control sis-filter-select" value={sectionId} onChange={(e) => setSectionId(e.target.value)} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }}>
                                            <option value="">Select</option>
                                            {sectionList.map(s => <option key={s.id} value={s.section_id}>{s.section}</option>)}
                                        </select>
                                    </div>
                                    {searchType === 'period' && (
                                        <>
                                            <div className="sis-filter-col" style={{ flex: '1', minWidth: '160px' }}>
                                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>Date From <span className="req">*</span></label>
                                                <input type="date" className="form-control sis-filter-select" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }} />
                                            </div>
                                            <div className="sis-filter-col" style={{ flex: '1', minWidth: '160px' }}>
                                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>Date To <span className="req">*</span></label>
                                                <input type="date" className="form-control sis-filter-select" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }} />
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                            {activeReport === 'daily_report' && (
                                <div className="sis-filter-col" style={{ flex: '1', minWidth: '200px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>Date <span className="req">*</span></label>
                                    <input type="date" className="form-control sis-filter-select" value={date} onChange={(e) => setDate(e.target.value)} required style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }} />
                                </div>
                            )}
                            {activeReport === 'late_report' && (
                                <>
                                    <div className="sis-filter-col" style={{ flex: '1', minWidth: '140px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>Date From <span className="req">*</span></label>
                                        <input type="date" className="form-control sis-filter-select" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} required style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }} />
                                    </div>
                                    <div className="sis-filter-col" style={{ flex: '1', minWidth: '140px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>Date To <span className="req">*</span></label>
                                        <input type="date" className="form-control sis-filter-select" value={dateTo} onChange={(e) => setDateTo(e.target.value)} required style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }} />
                                    </div>
                                    <div className="sis-filter-col" style={{ flex: '1', minWidth: '140px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>Class</label>
                                        <select className="form-control sis-filter-select" value={classId} onChange={handleClassChange} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }}>
                                            <option value="">Select</option>
                                            {classList.map(c => <option key={c.id} value={c.id}>{c.class}</option>)}
                                        </select>
                                    </div>
                                    <div className="sis-filter-col" style={{ flex: '1', minWidth: '140px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>Section</label>
                                        <select className="form-control sis-filter-select" value={sectionId} onChange={(e) => setSectionId(e.target.value)} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }}>
                                            <option value="">Select</option>
                                            {sectionList.map(s => <option key={s.id} value={s.section_id}>{s.section}</option>)}
                                        </select>
                                    </div>
                                    <div className="sis-filter-col" style={{ flex: '1', minWidth: '140px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>Student</label>
                                        <select className="form-control sis-filter-select" value={studentId} onChange={(e) => setStudentId(e.target.value)} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }}>
                                            <option value="">Select</option>
                                            {studentList.map(s => <option key={s.id} value={s.id}>{s.firstname} {s.lastname}</option>)}
                                        </select>
                                    </div>
                                </>
                            )}
                            <div className="sis-filter-col" style={{ display: 'flex', alignItems: 'flex-end' }}>
                                <button type="submit" className="btn btn-primary sis-apply-btn" disabled={loading} style={{ height: '40px', padding: '0 24px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <i className={`fa ${loading ? 'fa-spinner fa-spin' : 'fa-search'}`}></i> {loading ? 'Searching...' : 'Search'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {loading && <div className="sis-list-container text-center p-5"><Loader /></div>}

            {searched && reportData && (
                <div className="sis-list-container" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div className="sis-list-header" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                            {activeReport === 'class_attendance' ? 'Student Attendance Report' :
                                activeReport === 'type_report' ? 'Student Attendance Type Report' :
                                    activeReport === 'daily_report' ? 'Daily Attendance Report' :
                                        activeReport === 'staff_report' ? 'Staff Attendance Report' :
                                            'Late Entries Report'}
                        </h3>
                    </div>

                    <div style={{ padding: '16px 24px' }}>
                        <TableToolbar
                            searchTerm={searchTerm}
                            onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
                            recordsPerPage={itemsPerPage}
                            onRecordsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
                            columns={getColumnsForReport()}
                            visibleColumns={visibleColumns}
                            onToggleColumn={toggleColumn}
                            getExportData={getExportData}
                            exportFileName={activeReport}
                            exportTitle={getExportTitle()}
                        />
                    </div>

                    <div className="table-responsive">
                        {activeReport === 'class_attendance' && (
                            <table className="table table-striped table-bordered table-hover attendance-table" style={{ margin: 0 }}>
                                <thead style={{ background: '#f8fafc' }}>
                                    <tr>
                                        {visibleColumns.has('student_name') && <th rowSpan="2" style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Student Name</th>}
                                        {visibleColumns.has('percentage') && <th rowSpan="2" style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>(%)</th>}
                                        {(visibleColumns.has('P') || visibleColumns.has('L') || visibleColumns.has('A') || visibleColumns.has('F') || visibleColumns.has('H')) && (
                                            <th colSpan={['P', 'L', 'A', 'F', 'H'].filter(k => visibleColumns.has(k)).length} style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Total</th>
                                        )}
                                        {days.filter(d => visibleColumns.has(`day_${d.getDate()}`)).map(d => (
                                            <th key={d.getTime()} style={{ padding: '12px 8px', fontSize: '12px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0', background: d.getDay() === 0 ? '#fee2e2' : '' }}>{d.getDate()}<br />{d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}</th>
                                        ))}
                                    </tr>
                                    <tr style={{ background: '#f8fafc' }}>
                                        {visibleColumns.has('P') && <th style={{ padding: '8px', fontSize: '12px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>P</th>}
                                        {visibleColumns.has('L') && <th style={{ padding: '8px', fontSize: '12px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>L</th>}
                                        {visibleColumns.has('A') && <th style={{ padding: '8px', fontSize: '12px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>A</th>}
                                        {visibleColumns.has('F') && <th style={{ padding: '8px', fontSize: '12px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>F</th>}
                                        {visibleColumns.has('H') && <th style={{ padding: '8px', fontSize: '12px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>H</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentData.map(s => (
                                        <tr key={s.id}>
                                            {visibleColumns.has('student_name') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>{s.name} (Adm: {s.admission_no})</td>}
                                            {visibleColumns.has('percentage') && <td style={{ padding: '12px 24px', borderBottom: '1px solid #f1f5f9' }}><span className={`label ${s.percentage > 75 ? 'label-success' : 'label-danger'}`} style={{ borderRadius: '4px', padding: '2px 8px' }}>{s.percentage}</span></td>}
                                            {visibleColumns.has('P') && <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f5f9' }}>{s.counts.P}</td>}
                                            {visibleColumns.has('L') && <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f5f9' }}>{s.counts.L}</td>}
                                            {visibleColumns.has('A') && <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f5f9' }}>{s.counts.A}</td>}
                                            {visibleColumns.has('F') && <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f5f9' }}>{s.counts.F}</td>}
                                            {visibleColumns.has('H') && <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f5f9' }}>{s.counts.H}</td>}
                                            {days.filter(d => visibleColumns.has(`day_${d.getDate()}`)).map(d => (
                                                <td key={d.getTime()} style={{ padding: '12px 8px', fontSize: '12px', borderBottom: '1px solid #f1f5f9', background: d.getDay() === 0 ? '#fff1f2' : '' }} dangerouslySetInnerHTML={{ __html: s.daily[d.getDate()] || '-' }}></td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeReport === 'type_report' && (
                            <table className="table table-hover" style={{ margin: 0 }}>
                                <thead style={{ background: '#f8fafc' }}>
                                    <tr>
                                        {visibleColumns.has('admission_no') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Admission No</th>}
                                        {visibleColumns.has('student_name') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Student Name</th>}
                                        {visibleColumns.has('class_section') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Class (Section)</th>}
                                        {visibleColumns.has('father_name') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Father Name</th>}
                                        {visibleColumns.has('dob') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Date Of Birth</th>}
                                        {visibleColumns.has('adm_date') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Adm Date</th>}
                                        {visibleColumns.has('gender') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Gender</th>}
                                        {visibleColumns.has('mobile') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Mobile</th>}
                                        {visibleColumns.has('count') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Count</th>}
                                    </tr>
                                </thead>
                                <tbody>{currentData.map(s => (
                                    <tr key={s.id}>
                                        {visibleColumns.has('admission_no') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{s.admission_no}</td>}
                                        {visibleColumns.has('student_name') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{s.name}</td>}
                                        {visibleColumns.has('class_section') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{s.class} ({s.section})</td>}
                                        {visibleColumns.has('father_name') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{s.father_name}</td>}
                                        {visibleColumns.has('dob') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{s.dob}</td>}
                                        {visibleColumns.has('adm_date') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{s.admission_date}</td>}
                                        {visibleColumns.has('gender') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{s.gender}</td>}
                                        {visibleColumns.has('mobile') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{s.mobile}</td>}
                                        {visibleColumns.has('count') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{s.count}</td>}
                                    </tr>
                                ))}</tbody>
                            </table>
                        )}

                        {activeReport === 'daily_report' && (
                            <table className="table table-hover" style={{ margin: 0 }}>
                                <thead style={{ background: '#f8fafc' }}>
                                    <tr>
                                        {visibleColumns.has('class_section') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Class (Section)</th>}
                                        {visibleColumns.has('total_present') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Total Present</th>}
                                        {visibleColumns.has('total_absent') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Total Absent</th>}
                                        {visibleColumns.has('present_percent') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Present %</th>}
                                        {visibleColumns.has('absent_percent') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Absent %</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentData.map((r, i) => (
                                        <tr key={r.id || indexOfFirstItem + i}>
                                            {visibleColumns.has('class_section') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{r.class_section || r.class_name || '-'}</td>}
                                            {visibleColumns.has('total_present') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{r.total_present}</td>}
                                            {visibleColumns.has('total_absent') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{r.total_absent}</td>}
                                            {visibleColumns.has('present_percent') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{r.present_percent}</td>}
                                            {visibleColumns.has('absent_percent') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{r.absent_persent || r.absent_percent}</td>}
                                        </tr>
                                    ))}
                                    {reportData.totals && (
                                        <tr style={{ fontWeight: 'bold', background: '#f8fafc' }}>
                                            <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b' }}>Total</td>
                                            <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b' }}>{reportData.totals.present}</td>
                                            <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b' }}>{reportData.totals.absent}</td>
                                            <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b' }}>{reportData.totals.present_percent}</td>
                                            <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b' }}>{reportData.totals.absent_percent}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}

                        {activeReport === 'staff_report' && (
                            <table className="table table-striped table-bordered table-hover attendance-table" style={{ margin: 0 }}>
                                <thead style={{ background: '#f8fafc' }}>
                                    <tr>
                                        {visibleColumns.has('staff_name') && <th rowSpan="2" style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Staff Name</th>}
                                        {visibleColumns.has('percentage') && <th rowSpan="2" style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>(%)</th>}
                                        {(visibleColumns.has('P') || visibleColumns.has('L') || visibleColumns.has('A') || visibleColumns.has('H') || visibleColumns.has('F')) && (
                                            <th colSpan={['P', 'L', 'A', 'H', 'F'].filter(k => visibleColumns.has(k)).length} style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Total</th>
                                        )}
                                        {days.filter(d => visibleColumns.has(`day_${d.getDate()}`)).map(d => (
                                            <th key={d.getTime()} style={{ padding: '12px 8px', fontSize: '12px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0', background: d.getDay() === 0 ? '#fee2e2' : '' }}>{d.getDate()}<br />{d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}</th>
                                        ))}
                                    </tr>
                                    <tr style={{ background: '#f8fafc' }}>
                                        {visibleColumns.has('P') && <th style={{ padding: '8px', fontSize: '12px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>P</th>}
                                        {visibleColumns.has('L') && <th style={{ padding: '8px', fontSize: '12px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>L</th>}
                                        {visibleColumns.has('A') && <th style={{ padding: '8px', fontSize: '12px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>A</th>}
                                        {visibleColumns.has('H') && <th style={{ padding: '8px', fontSize: '12px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>H</th>}
                                        {visibleColumns.has('F') && <th style={{ padding: '8px', fontSize: '12px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>F</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentData.map(s => (
                                        <tr key={s.id}>
                                            {visibleColumns.has('staff_name') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>{s.name} (ID: {s.employee_id})</td>}
                                            {visibleColumns.has('percentage') && <td style={{ padding: '12px 24px', borderBottom: '1px solid #f1f5f9' }}><span className={`label ${s.percentage > 75 ? 'label-success' : 'label-danger'}`} style={{ borderRadius: '4px', padding: '2px 8px' }}>{s.percentage}</span></td>}
                                            {visibleColumns.has('P') && <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f5f9' }}>{s.counts.P}</td>}
                                            {visibleColumns.has('L') && <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f5f9' }}>{s.counts.L}</td>}
                                            {visibleColumns.has('A') && <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f5f9' }}>{s.counts.A}</td>}
                                            {visibleColumns.has('H') && <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f5f9' }}>{s.counts.H}</td>}
                                            {visibleColumns.has('F') && <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f5f9' }}>{s.counts.F}</td>}
                                            {days.filter(d => visibleColumns.has(`day_${d.getDate()}`)).map(d => (
                                                <td key={d.getTime()} style={{ padding: '12px 8px', fontSize: '12px', borderBottom: '1px solid #f1f5f9', background: d.getDay() === 0 ? '#fff1f2' : '' }}>{s.daily[d.getDate()] || '-'}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeReport === 'late_report' && (
                            <table className="table table-hover" style={{ margin: 0 }}>
                                <thead style={{ background: '#f8fafc' }}>
                                    <tr>
                                        {visibleColumns.has('s_no') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>S.No</th>}
                                        {visibleColumns.has('name') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Name</th>}
                                        {visibleColumns.has('admission_no') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Admission No</th>}
                                        {visibleColumns.has('class_section') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Class (Section)</th>}
                                        {visibleColumns.has('date') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Date</th>}
                                        {visibleColumns.has('time') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Time</th>}
                                        {visibleColumns.has('roll_no') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Roll No</th>}
                                    </tr>
                                </thead>
                                <tbody>{currentData.map((r, i) => (
                                    <tr key={r.id || indexOfFirstItem + i}>
                                        {visibleColumns.has('s_no') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{indexOfFirstItem + i + 1}</td>}
                                        {visibleColumns.has('name') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{r.firstname} {r.lastname}</td>}
                                        {visibleColumns.has('admission_no') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{r.admission_no}</td>}
                                        {visibleColumns.has('class_section') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{r.class} ({r.section})</td>}
                                        {visibleColumns.has('date') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{r.date}</td>}
                                        {visibleColumns.has('time') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{r.time}</td>}
                                        {visibleColumns.has('roll_no') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{r.roll_no}</td>}
                                    </tr>
                                ))}</tbody>
                            </table>
                        )}
                    </div>
                    <div style={{ padding: '20px 24px', borderTop: '1px solid #f1f5f9' }}>
                        <Pagination
                            totalItems={filteredData.length}
                            itemsPerPage={itemsPerPage}
                            currentPage={currentPage}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    </div>
                </div>
            )}
        </AttendanceLayout>
    );
};

export default AttendanceReport;
