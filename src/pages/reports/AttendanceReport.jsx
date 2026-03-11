import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import '../../styles/reports.css';
import { copyToClipboard, downloadCSV, downloadExcel, printTable } from '../../utils/tableExport';

const AttendanceReport = () => {
    const navigate = useNavigate();
    const location = useLocation();

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

    // Table states
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [reportData, setReportData] = useState(null);

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
    };

    // ── Export helpers ──────────────────────────────────────────────
    // class_attendance
    const exportClassAttendance = (action) => {
        if (!reportData?.students) return;
        const hdrs = ['Student Name', 'Adm No', '%', 'P', 'L', 'A', 'H', 'F'];
        const rows = reportData.students.map(s => [s.name, s.admission_no, s.percentage, s.counts.P, s.counts.L, s.counts.A, s.counts.H, s.counts.F].map(String));
        if (action === 'copy') copyToClipboard(hdrs, rows);
        if (action === 'excel') downloadExcel(hdrs, rows, 'Class_Attendance.xls');
        if (action === 'csv') downloadCSV(hdrs, rows, 'Class_Attendance.csv');
        if (action === 'print') printTable(hdrs, rows, 'Student Attendance Report');
    };
    // type_report
    const exportTypeReport = (action) => {
        if (!Array.isArray(reportData)) return;
        const hdrs = ['Admission No', 'Student Name', 'Class (Section)', 'Father Name', 'Date Of Birth', 'Adm Date', 'Gender', 'Mobile', 'Count'];
        const rows = reportData.map(s => [s.admission_no, s.name, `${s.class} (${s.section})`, s.father_name, s.dob, s.admission_date, s.gender, s.mobile, s.count].map(v => String(v ?? '')));
        if (action === 'copy') copyToClipboard(hdrs, rows);
        if (action === 'excel') downloadExcel(hdrs, rows, 'Type_Report.xls');
        if (action === 'csv') downloadCSV(hdrs, rows, 'Type_Report.csv');
        if (action === 'print') printTable(hdrs, rows, 'Student Attendance Type Report');
    };
    // daily_report
    const exportDailyReport = (action) => {
        if (!reportData?.list) return;
        const hdrs = ['Class (Section)', 'Total Present', 'Total Absent', 'Present %', 'Absent %'];
        const rows = reportData.list.map(r => [r.class_section || r.class_name || '-', r.total_present, r.total_absent, r.present_percent, r.absent_persent || r.absent_percent].map(v => String(v ?? '')));
        if (action === 'copy') copyToClipboard(hdrs, rows);
        if (action === 'excel') downloadExcel(hdrs, rows, 'Daily_Attendance.xls');
        if (action === 'csv') downloadCSV(hdrs, rows, 'Daily_Attendance.csv');
        if (action === 'print') printTable(hdrs, rows, 'Daily Attendance Report');
    };
    // staff_report
    const exportStaffReport = (action) => {
        if (!reportData?.staff) return;
        const hdrs = ['Staff Name', 'Employee ID', '%', 'P', 'L', 'A', 'H', 'F'];
        const rows = reportData.staff.map(s => [s.name, s.employee_id, s.percentage, s.counts.P, s.counts.L, s.counts.A, s.counts.H, s.counts.F].map(String));
        if (action === 'copy') copyToClipboard(hdrs, rows);
        if (action === 'excel') downloadExcel(hdrs, rows, 'Staff_Attendance.xls');
        if (action === 'csv') downloadCSV(hdrs, rows, 'Staff_Attendance.csv');
        if (action === 'print') printTable(hdrs, rows, 'Staff Attendance Report');
    };
    // late_report
    const exportLateReport = (action) => {
        if (!Array.isArray(reportData)) return;
        const hdrs = ['S.No', 'Name', 'Admission No', 'Class (Section)', 'Date', 'Time', 'Roll No'];
        const rows = reportData.map((r, i) => [i + 1, `${r.firstname} ${r.lastname}`, r.admission_no, `${r.class} (${r.section})`, r.date, r.time, r.roll_no].map(v => String(v ?? '')));
        if (action === 'copy') copyToClipboard(hdrs, rows);
        if (action === 'excel') downloadExcel(hdrs, rows, 'Late_Entries.xls');
        if (action === 'csv') downloadCSV(hdrs, rows, 'Late_Entries.csv');
        if (action === 'print') printTable(hdrs, rows, 'Late Entries Report');
    };

    const getDaysArray = (monthName, yearVal) => {
        const monthIndex = months.indexOf(monthName);
        const dateObj = new Date(yearVal, monthIndex, 1);
        const days = [];
        while (dateObj.getMonth() === monthIndex) {
            days.push(new Date(dateObj));
            dateObj.setDate(dateObj.getDate() + 1);
        }
        return days;
    };

    const days = (activeReport === 'class_attendance' || activeReport === 'staff_report') && reportData ? getDaysArray(reportData.month, reportData.year) : [];

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />

            <style>{`
                .content-wrapper { background: #f4f4f4; padding: 0px; margin-top: 0px; }
                
                .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
                .page-header h3 { margin: 0; font-size: 16px; font-weight: 400; color: #333; }

                .bg-sunday { background: #f2dede !important; color: #a94442; }
                .label-success { background-color: #5cb85c; }
                .label-danger { background-color: #d9534f; }
                
                .attendance-table th, .attendance-table td {
                    padding: 8px 6px !important;
                    text-align: center;
                    font-size: 13px;
                    vertical-align: middle !important;
                    border: 1px solid #eee !important;
                }
                .attendance-table th { background: #fafafa; white-space: nowrap; font-weight: 600; color: #333; }
                
                .minimal-table { border: none !important; }
                .minimal-table th, .minimal-table td { border-left: none !important; border-right: none !important; border-top: none !important; border-bottom: 1px solid #eee !important; background: transparent !important; }
                .minimal-table th { font-weight: 600; color: #666; border-bottom: 2px solid #eee !important; }

                .lateday-stack { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }
                .lateday { font-size: 12px; color: #444; }
                .lateday b { margin-left: 12px; font-weight: 600; }
                .btn-purple { background-color: #9429b8; border-color: #9429b8; color: #fff !important; padding: 2px 12px; border-radius: 20px; font-size: 11px; }
                .btn-purple:hover { background-color: #7b2199; border-color: #7b2199; color: #fff !important; }
                .box-title { font-size: 18px; font-weight: 400; vertical-align: middle; }
                
                /* Horizontal report listing styles */
                .reportlists { 
                    display: grid; 
                    grid-template-columns: repeat(3, 1fr); 
                    gap: 8px; 
                    background: transparent; 
                    border: none; 
                    margin-bottom: 15px; 
                }
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
                .reportlists li a:hover {
                    background: #f5f5f5;
                    color: #000;
                }
                .reportlists li a.active { 
                    background-color: #e2f0ff !important; 
                    color: #000; 
                    font-weight: 500; 
                }
                .select-criteria-header { 
                    font-size: 17px; 
                    font-weight: 500; 
                    padding: 10px 0; 
                    border-bottom: 1px solid #eee; 
                    margin-bottom: 10px; 
                    color: #333; 
                    border-top: 1px solid #eee; 
                    margin-top: 15px; 
                }
                .form-group label {
                    font-weight: 500;
                    font-size: 13px;
                }
                .req { color: red; }

                /* Standardized Form styles */
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
                
                /* DT Button styles */
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
                .dt-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 5px; font-size: 11px; color: #777; border-top: 1px solid #eee; padding-top: 8px; }
                .dt-pagination { display: flex; list-style: none; padding: 0; margin: 0; }
                .dt-pagination li { border: 1px solid #eee; padding: 2px 8px; cursor: pointer; background: #fff; margin-left: -1px; font-size: 10px; }
                .dt-pagination li.active { border-color: #eee; color: #333; font-weight: bold; }
            `}</style>

            <div className="content-wrapper">
                <section className="content">
                    <div className="box box-primary">
                        <div className="box-header with-border">
                            <h3 className="box-title">Attendance Report</h3>
                            <div className="box-tools pull-right">
                                <button className="btn btn-primary btn-sm" onClick={() => navigate(-1)}><i className="fa fa-arrow-left"></i> Back</button>
                            </div>
                        </div>
                        <div className="box-body">

                            <ul className="reportlists">
                                <li><a className={activeReport === 'class_attendance' ? "active" : ""} onClick={(e) => { e.preventDefault(); handleReportClick('class_attendance'); }}><i className="fa fa-file-text-o"></i> Attendance Report</a></li>
                                <li><a className={activeReport === 'type_report' ? "active" : ""} onClick={(e) => { e.preventDefault(); handleReportClick('type_report'); }}><i className="fa fa-file-text-o"></i> Student Attendance Type Report</a></li>
                                <li><a className={activeReport === 'daily_report' ? "active" : ""} onClick={(e) => { e.preventDefault(); handleReportClick('daily_report'); }}><i className="fa fa-file-text-o"></i> Daily Attendance Report</a></li>
                                <li><a className={activeReport === 'staff_report' ? "active" : ""} onClick={(e) => { e.preventDefault(); handleReportClick('staff_report'); }}><i className="fa fa-file-text-o"></i> Staff Attendance Report</a></li>
                                <li><a className={activeReport === 'late_report' ? "active" : ""} onClick={(e) => { e.preventDefault(); handleReportClick('late_report'); }}><i className="fa fa-file-text-o"></i> Late Entries Report</a></li>
                            </ul>

                            <div style={{ padding: '0 5px' }}>
                                <div className="select-criteria-header"><i className="fa fa-search"></i> Select Criteria</div>
                                <form onSubmit={handleSearch}>
                                    <div className="row">
                                        {(activeReport === 'class_attendance' || activeReport === 'staff_report') && (
                                            <>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label>Month <span className="req">*</span></label>
                                                        <select className="form-control" value={month} onChange={(e) => setMonth(e.target.value)} required>
                                                            <option value="">Select</option>
                                                            {monthList.map(m => <option key={m} value={m}>{m}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label>Year <span className="req">*</span></label>
                                                        <select className="form-control" value={year} onChange={(e) => setYear(e.target.value)} required>
                                                            <option value="">Select</option>
                                                            {yearList.map(y => <option key={y} value={y}>{y}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                                {activeReport === 'class_attendance' && (
                                                    <>
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label>Class <span className="req">*</span></label>
                                                                <select className="form-control" value={classId} onChange={handleClassChange} required>
                                                                    <option value="">Select</option>
                                                                    {classList.map(c => <option key={c.id} value={c.id}>{c.class}</option>)}
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label>Section <span className="req">*</span></label>
                                                                <select className="form-control" value={sectionId} onChange={(e) => setSectionId(e.target.value)} required>
                                                                    <option value="">Select</option>
                                                                    {sectionList.map(s => <option key={s.id} value={s.section_id}>{s.section}</option>)}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                                {activeReport === 'staff_report' && (
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label>Role <span className="req">*</span></label>
                                                            <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)} required>
                                                                <option value="">Select</option>
                                                                {roleList.map(r => <option key={r.id} value={r.id}>{r.type}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {activeReport === 'type_report' && (
                                            <>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Search Type</label>
                                                        <select className="form-control" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                                                            {Object.entries(searchTypeList).map(([key, value]) => (
                                                                <option key={key} value={key}>{value}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Attendance Type <span className="req">*</span></label>
                                                        <select className="form-control" value={attendanceType} onChange={(e) => setAttendanceType(e.target.value)} required>
                                                            <option value="">Select</option>
                                                            {attendanceTypesList.map(t => <option key={t.id} value={t.id}>{t.type}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Class <span className="req">*</span></label>
                                                        <select className="form-control" value={classId} onChange={handleClassChange} required>
                                                            <option value="">Select</option>
                                                            {classList.map(c => <option key={c.id} value={c.id}>{c.class}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Section</label>
                                                        <select className="form-control" value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
                                                            <option value="">Select</option>
                                                            {sectionList.map(s => <option key={s.id} value={s.section_id}>{s.section}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                                {searchType === 'period' && (
                                                    <>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label>Date From <span className="req">*</span></label>
                                                                <input type="date" className="form-control" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label>Date To <span className="req">*</span></label>
                                                                <input type="date" className="form-control" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </>
                                        )}
                                        {activeReport === 'daily_report' && (
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>Date <span className="req">*</span></label>
                                                    <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} required />
                                                </div>
                                            </div>
                                        )}
                                        {activeReport === 'late_report' && (
                                            <>
                                                <div className="col-md-2">
                                                    <div className="form-group">
                                                        <label>Date From <span className="req">*</span></label>
                                                        <input type="date" className="form-control" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} required />
                                                    </div>
                                                </div>
                                                <div className="col-md-2">
                                                    <div className="form-group">
                                                        <label>Date To <span className="req">*</span></label>
                                                        <input type="date" className="form-control" value={dateTo} onChange={(e) => setDateTo(e.target.value)} required />
                                                    </div>
                                                </div>
                                                <div className="col-md-2">
                                                    <div className="form-group">
                                                        <label>Class</label>
                                                        <select className="form-control" value={classId} onChange={handleClassChange}>
                                                            <option value="">Select</option>
                                                            {classList.map(c => <option key={c.id} value={c.id}>{c.class}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Section</label>
                                                        <select className="form-control" value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
                                                            <option value="">Select</option>
                                                            {sectionList.map(s => <option key={s.id} value={s.section_id}>{s.section}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Student</label>
                                                        <select className="form-control" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                                                            <option value="">Select</option>
                                                            {studentList.map(s => <option key={s.id} value={s.id}>{s.firstname} {s.lastname}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        <div className="col-sm-12" style={{ textAlign: 'right', marginTop: '10px' }}>
                                            <button type="submit" className="btn btn-purple btn-sm"><i className="fa fa-search"></i> Search</button>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {loading && <div className="box-body text-center">Loading...</div>}

                            {searched && reportData && (
                                <div className="box-body">
                                    <div className="box-header ptbnull" style={{ paddingLeft: 0 }}>
                                        <h3 className="box-title titlefix">
                                            <i className={`fa ${activeReport === 'staff_report' ? 'fa-sitemap' :
                                                activeReport === 'late_report' ? 'fa-calendar-times-o' :
                                                    'fa-users'
                                                }`}></i> {
                                                activeReport === 'class_attendance' ? 'Student Attendance Report' :
                                                    activeReport === 'type_report' ? 'Student Attendance Type Report' :
                                                        activeReport === 'daily_report' ? 'Daily Attendance Report' :
                                                            activeReport === 'staff_report' ? 'Staff Attendance Report' :
                                                                'Late Entries Report'
                                            }
                                        </h3>
                                    </div>

                                    {activeReport === 'class_attendance' && (
                                        <div className="table-responsive" style={{ marginTop: '10px' }}>
                                            <div className="dt-header" style={{ alignItems: 'flex-end' }}>
                                                <div className="dt-search">
                                                    <input
                                                        type="text"
                                                        placeholder="Search..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                    />
                                                </div>
                                                <div className="lateday-stack">
                                                    <div className="lateday">
                                                        {attTypes.map(t => <b key={t.key}>{t.type}: {t.key}</b>)}
                                                        <b>Holiday: H</b>
                                                    </div>
                                                    <div className="dt-buttons">
                                                        <button className="dt-button" title="Copy" onClick={() => exportClassAttendance('copy')}><i className="fa fa-copy"></i></button>
                                                        <button className="dt-button" title="Excel" onClick={() => exportClassAttendance('excel')}><i className="fa fa-file-excel-o"></i></button>
                                                        <button className="dt-button" title="CSV" onClick={() => exportClassAttendance('csv')}><i className="fa fa-file-text-o"></i></button>
                                                        <button className="dt-button" title="Print" onClick={() => exportClassAttendance('print')}><i className="fa fa-print"></i></button>
                                                        <button className="dt-button" title="Columns"><i className="fa fa-columns"></i></button>
                                                    </div>
                                                </div>
                                            </div>

                                            <table className="table table-striped table-bordered table-hover attendance-table">
                                                <thead>
                                                    <tr><th rowSpan="2" style={{ textAlign: 'left' }}>Student Name</th><th rowSpan="2">(%)</th><th colSpan="5">Total</th>{days.map(d => <th key={d.getTime()} className={d.getDay() === 0 ? "bg-sunday" : ""}>{d.getDate()}<br />{d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}</th>)}</tr>
                                                    <tr>{attTypes.concat([{ key: 'H', type: 'Holiday' }]).map(t => <th key={t.key}>{t.key}</th>)}</tr>
                                                </thead>
                                                <tbody>
                                                    {reportData.students
                                                        ?.filter(s =>
                                                            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                            s.admission_no.toLowerCase().includes(searchTerm.toLowerCase())
                                                        )
                                                        .map(s => (
                                                            <tr key={s.id}><td style={{ textAlign: 'left' }}>{s.name} (Adm: {s.admission_no})</td><td><span className={`label ${s.percentage > 75 ? 'label-success' : 'label-danger'}`}>{s.percentage}</span></td><td>{s.counts.P}</td><td>{s.counts.L}</td><td>{s.counts.A}</td><td>{s.counts.F}</td><td>{s.counts.H}</td>{days.map(d => <td key={d.getTime()} className={d.getDay() === 0 ? "bg-sunday" : ""} dangerouslySetInnerHTML={{ __html: s.daily[d.getDate()] || '-' }}></td>)}</tr>
                                                        ))
                                                    }
                                                </tbody>
                                            </table>

                                            <div className="dt-footer">
                                                <div>Records: 1 to {reportData.students?.length || 0} of {reportData.students?.length || 0}</div>
                                                <ul className="dt-pagination">
                                                    <li>&lt;</li>
                                                    <li className="active">1</li>
                                                    <li>&gt;</li>
                                                </ul>
                                            </div>
                                        </div>
                                    )}

                                    {activeReport === 'type_report' && (
                                        <div className="table-responsive">
                                            <div className="dt-header">
                                                <div className="dt-search">
                                                    <input
                                                        type="text"
                                                        placeholder="Search..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                    />
                                                </div>
                                                <div className="dt-buttons">
                                                    <button className="dt-button" title="Copy" onClick={() => exportTypeReport('copy')}><i className="fa fa-copy"></i></button>
                                                    <button className="dt-button" title="Excel" onClick={() => exportTypeReport('excel')}><i className="fa fa-file-excel-o"></i></button>
                                                    <button className="dt-button" title="CSV" onClick={() => exportTypeReport('csv')}><i className="fa fa-file-text-o"></i></button>
                                                    <button className="dt-button" title="Print" onClick={() => exportTypeReport('print')}><i className="fa fa-print"></i></button>
                                                    <button className="dt-button" title="Columns"><i className="fa fa-columns"></i></button>
                                                </div>
                                            </div>
                                            <table className="table table-hover attendance-table minimal-table">
                                                <thead><tr><th>Admission No</th><th>Student Name</th><th>Class (Section)</th><th>Father Name</th><th>Date Of Birth</th><th>Adm Date</th><th>Gender</th><th>Mobile</th><th>Count</th></tr></thead>
                                                <tbody>{Array.isArray(reportData) && reportData
                                                    .filter(s =>
                                                        (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                                        (s.admission_no && s.admission_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                                        (s.father_name && s.father_name.toLowerCase().includes(searchTerm.toLowerCase()))
                                                    )
                                                    .map(s => (
                                                        <tr key={s.id}><td>{s.admission_no}</td><td>{s.name}</td><td>{s.class} ({s.section})</td><td>{s.father_name}</td><td>{s.dob}</td><td>{s.admission_date}</td><td>{s.gender}</td><td>{s.mobile}</td><td>{s.count}</td></tr>
                                                    ))}</tbody>
                                            </table>
                                            <div className="dt-footer">
                                                <div>Records: 1 to {(reportData || []).length} of {(reportData || []).length}</div>
                                                <ul className="dt-pagination">
                                                    <li>&lt;</li>
                                                    <li className="active">1</li>
                                                    <li>&gt;</li>
                                                </ul>
                                            </div>
                                        </div>
                                    )}

                                    {activeReport === 'daily_report' && (
                                        <div className="table-responsive">
                                            <div className="dt-header">
                                                <div className="dt-search">
                                                    <input
                                                        type="text"
                                                        placeholder="Search..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                    />
                                                </div>
                                                <div className="dt-buttons">
                                                    <button className="dt-button" title="Copy" onClick={() => exportDailyReport('copy')}><i className="fa fa-copy"></i></button>
                                                    <button className="dt-button" title="Excel" onClick={() => exportDailyReport('excel')}><i className="fa fa-file-excel-o"></i></button>
                                                    <button className="dt-button" title="CSV" onClick={() => exportDailyReport('csv')}><i className="fa fa-file-text-o"></i></button>
                                                    <button className="dt-button" title="Print" onClick={() => exportDailyReport('print')}><i className="fa fa-print"></i></button>
                                                    <button className="dt-button" title="Columns"><i className="fa fa-columns"></i></button>
                                                </div>
                                            </div>
                                            <table className="table table-hover attendance-table minimal-table">
                                                <thead><tr><th>Class (Section)</th><th>Total Present</th><th>Total Absent</th><th>Present %</th><th>Absent %</th></tr></thead>
                                                <tbody>
                                                    {Array.isArray(reportData.list) && reportData.list
                                                        .filter(r => (r.class_section || '').toLowerCase().includes(searchTerm.toLowerCase()))
                                                        .map((r, i) => (
                                                            <tr key={i}>
                                                                <td>{r.class_section || r.class_name || '-'}</td>
                                                                <td>{r.total_present}</td>
                                                                <td>{r.total_absent}</td>
                                                                <td>{r.present_percent}</td>
                                                                <td>{r.absent_persent || r.absent_percent}</td>
                                                            </tr>
                                                        ))
                                                    }
                                                    {reportData.totals && (
                                                        <tr style={{ fontWeight: 'bold' }}>
                                                            <td>Total</td>
                                                            <td>{reportData.totals.present}</td>
                                                            <td>{reportData.totals.absent}</td>
                                                            <td>{reportData.totals.present_percent}</td>
                                                            <td>{reportData.totals.absent_percent}</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                            <div className="dt-footer">
                                                <div>Records: 1 to {reportData.list.length + 1} of {reportData.list.length + 1}</div>
                                                <ul className="dt-pagination">
                                                    <li>&lt;</li>
                                                    <li className="active">1</li>
                                                    <li>&gt;</li>
                                                </ul>
                                            </div>
                                        </div>
                                    )}

                                    {activeReport === 'staff_report' && (
                                        <div className="table-responsive">
                                            <div className="dt-header" style={{ alignItems: 'flex-end' }}>
                                                <div className="dt-search">
                                                    <input
                                                        type="text"
                                                        placeholder="Search..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                    />
                                                </div>
                                                <div className="lateday-stack">
                                                    <div className="lateday">
                                                        {attTypes.map(t => <b key={t.key}>{t.type}: {t.key}</b>)}
                                                        <b>Holiday: H</b>
                                                    </div>
                                                    <div className="dt-buttons">
                                                        <button className="dt-button" title="Copy" onClick={() => exportStaffReport('copy')}><i className="fa fa-copy"></i></button>
                                                        <button className="dt-button" title="Excel" onClick={() => exportStaffReport('excel')}><i className="fa fa-file-excel-o"></i></button>
                                                        <button className="dt-button" title="CSV" onClick={() => exportStaffReport('csv')}><i className="fa fa-file-text-o"></i></button>
                                                        <button className="dt-button" title="Print" onClick={() => exportStaffReport('print')}><i className="fa fa-print"></i></button>
                                                        <button className="dt-button" title="Columns"><i className="fa fa-columns"></i></button>
                                                    </div>
                                                </div>
                                            </div>
                                            <table className="table table-striped table-bordered table-hover attendance-table">
                                                <thead>
                                                    <tr><th rowSpan="2" style={{ textAlign: 'left' }}>Staff Name</th><th rowSpan="2">(%)</th><th colSpan="5">Total</th>{days.map(d => <th key={d.getTime()} className={d.getDay() === 0 ? "bg-sunday" : ""}>{d.getDate()}<br />{d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}</th>)}</tr>
                                                    <tr>{attTypes.concat([{ key: 'H', type: 'Holiday' }]).map(t => <th key={t.key}>{t.key}</th>)}</tr>
                                                </thead>
                                                <tbody>
                                                    {(reportData.staff || [])
                                                        .filter(s =>
                                                            (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                            (s.employee_id || '').toLowerCase().includes(searchTerm.toLowerCase())
                                                        )
                                                        .map(s => (
                                                            <tr key={s.id}><td style={{ textAlign: 'left' }}>{s.name} (ID: {s.employee_id})</td><td><span className={`label ${s.percentage > 75 ? 'label-success' : 'label-danger'}`}>{s.percentage}</span></td><td>{s.counts.P}</td><td>{s.counts.L}</td><td>{s.counts.A}</td><td>{s.counts.H}</td><td>{s.counts.F}</td>{days.map(d => <td key={d.getTime()} className={d.getDay() === 0 ? "bg-sunday" : ""}>{s.daily[d.getDate()] || '-'}</td>)}</tr>
                                                        ))
                                                    }
                                                </tbody>
                                            </table>
                                            <div className="dt-footer">
                                                <div>Records: 1 to {reportData.staff.length} of {reportData.staff.length}</div>
                                                <ul className="dt-pagination">
                                                    <li>&lt;</li>
                                                    <li className="active">1</li>
                                                    <li>&gt;</li>
                                                </ul>
                                            </div>
                                        </div>
                                    )}

                                    {activeReport === 'late_report' && (
                                        <div className="table-responsive">
                                            <div className="dt-header">
                                                <div className="dt-search">
                                                    <input
                                                        type="text"
                                                        placeholder="Search..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                    />
                                                </div>
                                                <div className="dt-buttons">
                                                    <button className="dt-button" title="Copy" onClick={() => exportLateReport('copy')}><i className="fa fa-copy"></i></button>
                                                    <button className="dt-button" title="Excel" onClick={() => exportLateReport('excel')}><i className="fa fa-file-excel-o"></i></button>
                                                    <button className="dt-button" title="CSV" onClick={() => exportLateReport('csv')}><i className="fa fa-file-text-o"></i></button>
                                                    <button className="dt-button" title="Print" onClick={() => exportLateReport('print')}><i className="fa fa-print"></i></button>
                                                    <button className="dt-button" title="Columns"><i className="fa fa-columns"></i></button>
                                                </div>
                                            </div>
                                            <table className="table table-hover attendance-table minimal-table">
                                                <thead><tr><th>S.No</th><th>Name</th><th>Admission No</th><th>Class (Section)</th><th>Date</th><th>Time</th><th>Roll No</th></tr></thead>
                                                <tbody>{Array.isArray(reportData) && reportData
                                                    .filter(r =>
                                                        `${r.firstname || ''} ${r.lastname || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                        (r.admission_no || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                        (r.class || '').toLowerCase().includes(searchTerm.toLowerCase())
                                                    )
                                                    .map((r, i) => (
                                                        <tr key={r.id || i}>
                                                            <td>{i + 1}</td>
                                                            <td>{r.firstname} {r.lastname}</td>
                                                            <td>{r.admission_no}</td>
                                                            <td>{r.class} ({r.section})</td>
                                                            <td>{r.date}</td>
                                                            <td>{r.time}</td>
                                                            <td>{r.roll_no}</td>
                                                        </tr>
                                                    ))}</tbody>
                                            </table>
                                            <div className="dt-footer">
                                                <div>Records: 1 to {reportData.length} of {reportData.length}</div>
                                                <ul className="dt-pagination">
                                                    <li>&lt;</li>
                                                    <li className="active">1</li>
                                                    <li>&gt;</li>
                                                </ul>
                                            </div>
                                        </div>
                                    )}
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

export default AttendanceReport;
