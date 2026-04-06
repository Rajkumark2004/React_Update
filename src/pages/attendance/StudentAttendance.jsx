import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';
import AttendanceSidebar from '../../components/AttendanceSidebar';
import { api } from '../../services/api';
import '../../utils/include_files';
import toast from 'react-hot-toast';
import Pagination from '../../utils/Pagination';
const StudentAttendance = () => {
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [studentList, setStudentList] = useState([]);
    const [formData, setFormData] = useState({
        class_id: '',
        section_id: '',
        date: new Date().toISOString().split('T')[0] // Default to current date YYYY-MM-DD for HTML5
    });
    const [attendanceState, setAttendanceState] = useState({});
    const [errors, setErrors] = useState({});
    const [isHoliday, setIsHoliday] = useState(false);
    const [attendanceTypes, setAttendanceTypes] = useState([]);
    const [holidayId, setHolidayId] = useState(5);
    const [presentId, setPresentId] = useState(1);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [isAttendanceMarked, setIsAttendanceMarked] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await api.getStudentCreate();
            if (response && response.status === 'success' && response.data && response.data.classlist) {
                setClassList(response.data.classlist);
            } else {
                setClassList([]);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
            // Fallback for resiliency if needed, or just log
        } finally {
            setInitialLoading(false);
        }
    };

    const handleClassChange = async (e) => {
        const classId = e.target.value;
        setFormData(prev => ({ ...prev, class_id: classId, section_id: '' }));
        setSectionList([]);

        if (classId) {
            try {
                const response = await api.getSectionsByClass(classId);
                // Assuming response structure { status: "success", data: [...] } or direct array
                if (response && response.status === 'success' && response.data) {
                    // Check if data is array or object mapping
                    // The getByClass API often returns map { section_id: section_name } or array of objects
                    // Adjust based on typical response. If array of objects:
                    setSectionList(response.data);
                } else if (Array.isArray(response)) {
                    setSectionList(response);
                } else if (response && response.sections) {
                    setSectionList(response.sections);
                } else {
                    // If it is simple key-value pair, map it
                    // But usually getByClass returns array of objects like [{section_id, section, ...}]
                    // Let's assume standard array for now or check response type in usage
                    console.log("Sections response", response);
                    // Safe fallback if it returns directly the list
                    setSectionList(response.data || []);
                }
            } catch (error) {
                console.error('Error fetching sections:', error);
            }
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setErrors({});

        let newErrors = {};
        if (!formData.class_id) newErrors.class_id = "The Class field is required";
        if (!formData.section_id) newErrors.section_id = "The Section field is required";
        if (!formData.date) newErrors.date = "The Date field is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            // Ensure date is in DD-MM-YYYY format for the API
            const formattedDate = formData.date ? formData.date.split('-').reverse().join('-') : '';
            const data = await api.searchAttendance(formData.class_id, formData.section_id, formattedDate);
            console.log('StudentAttendance Search Result:', data);

            if (data.status && data.students) {
                let dynamicHolidayId = holidayId;
                let dynamicPresentId = presentId;
                let isHolidayFound = false;

                if (data.attendencetypeslist) {
                    setAttendanceTypes(data.attendencetypeslist);
                    const hType = data.attendencetypeslist.find(t => t.type.toLowerCase() === 'holiday');
                    if (hType) dynamicHolidayId = parseInt(hType.attendence_type_id);

                    const pType = data.attendencetypeslist.find(t => t.type.toLowerCase() === 'present');
                    if (pType) dynamicPresentId = parseInt(pType.attendence_type_id);

                    setHolidayId(dynamicHolidayId);
                    setPresentId(dynamicPresentId);
                }

                // Check first student for holiday status as per PHP logic (if one is holiday, all are usually holiday for that section/date)
                if (data.students.length > 0 && data.students[0].attendence_type_id == dynamicHolidayId) {
                    isHolidayFound = true;
                }

                // Initialize attendance state
                const initialAttendance = {};
                data.students.forEach(student => {
                    initialAttendance[student.student_session_id] = {
                        // API returns "attendence_type_id": null if not set, or a value.
                        // If null, default to Present.
                        attendance_type_id: student.attendence_type_id || dynamicPresentId,
                        remark: student.remark || ''
                    };
                });
                setAttendanceState(initialAttendance);
                setStudentList(data.students);
                setIsHoliday(isHolidayFound);
                setSelectedStudents([]); // Reset selection on new search

                // Check if any student already has attendance ID
                const alreadyMarked = data.students.some(student => student.attendence_id && student.attendence_id !== "0");
                setIsAttendanceMarked(alreadyMarked);
                if (data.students.length === 0) {
                    toast.error('No attendance records found');
                } else {
                    toast.success('Attendance records loaded');
                }
            } else {
                setStudentList([]);
                toast.error(data.message || 'Attendance not submitted for this class');
            }
        } catch (error) {
            toast.error(error.message || 'Search failed');
        } finally {
            setLoading(false);
        }
    };

    const handleAttendanceChange = (studentSessionId, typeId) => {
        setAttendanceState(prev => ({
            ...prev,
            [studentSessionId]: {
                ...prev[studentSessionId],
                attendance_type_id: typeId
            }
        }));
    };

    const handleRemarkChange = (studentSessionId, remark) => {
        setAttendanceState(prev => ({
            ...prev,
            [studentSessionId]: {
                ...prev[studentSessionId],
                remark: remark
            }
        }));
    };

    const toggleHoliday = () => {
        const newStatus = !isHoliday;
        setIsHoliday(newStatus);

        // If Holiday is checked (5), update all. Else restore defaults (1 - Present)?
        // PHP logic: If holiday checked, radio buttons disabled.
        // We will mimic this: disable radios and conceptually set type to 5 (Holiday) on submit.
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedStudents(studentList.map(s => s.student_session_id));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleSelectStudent = (studentSessionId, checked) => {
        if (checked) {
            setSelectedStudents(prev => [...prev, studentSessionId]);
        } else {
            setSelectedStudents(prev => prev.filter(id => id !== studentSessionId));
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Format date as DD-MM-YYYY for the API
            const formattedDate = formData.date ? formData.date.split('-').reverse().join('-') : '';

            // Build the students array with correct format only for selected students
            const students = studentList
                .filter(student => selectedStudents.includes(student.student_session_id))
                .map(student => {
                    const sessionId = student.student_session_id;
                    return {
                        student_session_id: sessionId,
                        attendance_id: student.attendence_id || "0",
                        attendance_type_id: isHoliday ? holidayId : parseInt(attendanceState[sessionId]?.attendance_type_id || presentId),
                        remark: attendanceState[sessionId]?.remark || ''
                    };
                });

            if (students.length === 0) {
                toast.error('Please select at least one student');
                setLoading(false);
                return;
            }

            const attendanceData = {
                date: formattedDate,
                students: students,
                attendance_id: students.map(s => s.attendance_id)
            };

            console.log('Saving attendance:', attendanceData);
            const response = await api.saveAttendance(attendanceData);

            if (response.status) {
                toast.success(response.message || 'Attendance saved successfully');
                setStudentList([]); // Close the table after successful save
            } else {
                toast.error(response.message || 'Failed to save attendance');
            }
        } catch (error) {
            toast.error(error.message || 'Save failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        // Collect attendance_ids of selected students
        const attendanceIds = selectedStudents
            .map(sessionId => {
                const student = studentList.find(s => s.student_session_id === sessionId);
                // Extract attendence_id if correctly defined
                return student && student.attendence_id && student.attendence_id !== "0" ? parseInt(student.attendence_id) : null;
            })
            .filter(id => id !== null);

        if (attendanceIds.length === 0) {
            toast.error('No saved attendance found for the selected students to delete.');
            return;
        }

        if (!window.confirm('Are you sure you want to delete attendance for the selected students?')) {
            return;
        }

        setLoading(true);
        try {
            const payload = {
                data: attendanceIds.map(id => ({
                    attendence_ids: [id]
                }))
            };

            const response = await api.deleteBulkAttendance(payload);
            if (response && response.status) {
                toast.success('Attendance deleted successfully');
                // Re-fetch search to update the UI
                const e = { preventDefault: () => { } };
                handleSearch(e);
            } else {
                toast.error(response.message || 'Failed to delete attendance');
            }
        } catch (error) {
            console.error('Delete attendance error:', error);
            toast.error('Failed to delete attendance');
        } finally {
            setLoading(false);
        }
    };

    // Calculate Pagination
    const totalItems = studentList.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const totalPages = Math.ceil(totalItems / safeRecordsPerPage);
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentRecords = studentList.slice(indexOfFirstItem, indexOfLastItem);



    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-calendar-check-o"></i> Attendance <small>by date</small>
                    </h1>
                </section>
                <section className="content">
                    {initialLoading ? (
                        <Loader />
                    ) : (
                        <div className="row">
                            <div className="col-md-2">
                                <AttendanceSidebar />
                            </div>
                            <div className="col-md-10">
                                <div className="box box-primary">
                                    <div className="box-header with-border">
                                        <h3 className="box-title"><i className="fa fa-search"></i> Select Criteria</h3>
                                    </div>
                                    <form onSubmit={handleSearch}>
                                        <div className="box-body">
                                            <div className="row">
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label>Class <small className="req"> *</small></label>
                                                        <select
                                                            className="form-control"
                                                            value={formData.class_id}
                                                            onChange={handleClassChange}
                                                        >
                                                            <option value="">Select</option>
                                                            {classList.map(cls => (
                                                                <option key={cls.id} value={cls.id}>{cls.class}</option>
                                                            ))}
                                                        </select>
                                                        {errors.class_id && <span className="text-danger">{errors.class_id}</span>}
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label>Section <small className="req"> *</small></label>
                                                        <select
                                                            className="form-control"
                                                            value={formData.section_id}
                                                            onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                                                        >
                                                            <option value="">Select</option>
                                                            {sectionList.map(sec => (
                                                                <option key={sec.section_id} value={sec.section_id}>{sec.section}</option>
                                                            ))}
                                                        </select>
                                                        {errors.section_id && <span className="text-danger">{errors.section_id}</span>}
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label>Attendance Date <small className="req"> *</small></label>
                                                        <div className="input-group" style={{ position: 'relative', width: '100%', borderBottom: '1px solid #ccc' }}>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                value={formData.date}
                                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                                max={new Date().toISOString().split('T')[0]}
                                                                style={{ width: '100%', border: 'none', background: 'transparent', boxShadow: 'none', paddingLeft: 0, paddingBottom: '4px' }}
                                                            />
                                                        </div>
                                                        {errors.date && <span className="text-danger">{errors.date}</span>}
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="form-group">
                                                        <button type="submit" className="btn btn-primary btn-sm pull-right checkbox-toggle">
                                                            <i className="fa fa-search"></i> Search
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </form>

                                    {studentList.length > 0 && (
                                        <>
                                            {isAttendanceMarked && (
                                                <div style={{ padding: "10px 10px 0px 10px" }}>
                                                    <div className="alert alert-success alert-dismissible">
                                                        Attendance Already Submitted You Can Edit Record
                                                    </div>
                                                </div>
                                            )}
                                            <div className="box-header with-border">
                                                <h3 className="box-title"><i className="fa fa-users"></i> Student List</h3>
                                            </div>
                                            <div className="box-body">
                                                <div className="mailbox-controls" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                                                    <span className="button-checkbox">
                                                        <button
                                                            type="button"
                                                            className={`btn btn-sm ${isHoliday ? 'btn-primary active' : 'btn-primary'}`}
                                                            onClick={toggleHoliday}
                                                        >
                                                            <i className={`state-icon glyphicon ${isHoliday ? 'glyphicon-check' : 'glyphicon-unchecked'}`}></i> Mark as Holiday
                                                        </button>
                                                    </span>
                                                    <div style={{ display: 'flex', gap: '5px' }}>
                                                        <button type="button" onClick={handleDelete} className="btn btn-primary btn-sm checkbox-toggle">
                                                            <i className="fa fa-trash"></i> Delete
                                                        </button>
                                                        <button type="button" onClick={handleSave} className="btn btn-primary btn-sm checkbox-toggle">
                                                            <i className="fa fa-save"></i> Save Attendance
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="table-responsive ptt10">
                                                    <table className="table table-hover table-striped example">
                                                        <thead>
                                                            <tr>
                                                                <th width="5%">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={studentList.length > 0 && selectedStudents.length === studentList.length}
                                                                        onChange={handleSelectAll}
                                                                    />
                                                                </th>
                                                                <th width="5%">S.No</th>
                                                                <th width="15%">Admission No</th>
                                                                <th width="12%">Roll Number</th>
                                                                <th width="20%">Name</th>
                                                                <th width="28%">Attendance</th>
                                                                <th width="15%" style={{ textAlign: 'left' }}>Note</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {currentRecords.map((student, index) => (
                                                                <tr key={student.student_session_id}>
                                                                    <td>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedStudents.includes(student.student_session_id)}
                                                                            onChange={(e) => handleSelectStudent(student.student_session_id, e.target.checked)}
                                                                        />
                                                                    </td>
                                                                    <td>{indexOfFirstItem + index + 1}</td>
                                                                    <td>{student.admission_no}</td>
                                                                    <td>{student.roll_no}</td>
                                                                    <td style={{ wordBreak: 'break-word' }}>{student.firstname} {student.lastname}</td>
                                                                    <td>
                                                                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                                                                            {!isHoliday && attendanceTypes.filter(type => type.type.toLowerCase() !== 'holiday').map(type => (
                                                                                <div key={type.attendence_type_id} className="radio radio-info radio-inline" style={{ display: 'inline-flex', alignItems: 'center', margin: '0 10px 0 0' }}>
                                                                                    <input
                                                                                        type="radio"
                                                                                        id={`attendencetype${student.student_session_id}-${type.attendence_type_id}`}
                                                                                        name={`attendencetype${student.student_session_id}`}
                                                                                        value={type.attendence_type_id}
                                                                                        checked={attendanceState[student.student_session_id]?.attendance_type_id == type.attendence_type_id}
                                                                                        onChange={() => handleAttendanceChange(student.student_session_id, type.attendence_type_id)}
                                                                                    />
                                                                                    <label htmlFor={`attendencetype${student.student_session_id}-${type.attendence_type_id}`}>
                                                                                        {type.type}
                                                                                    </label>
                                                                                </div>
                                                                            ))}
                                                                            {isHoliday && <span className="text-danger">Holiday</span>}
                                                                        </div>
                                                                    </td>
                                                                    <td style={{ verticalAlign: 'middle' }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                style={{ width: '100%', minWidth: '80px', height: '28px', padding: '2px 5px', fontSize: '12px', border: '1px solid #777' }}
                                                                                value={attendanceState[student.student_session_id]?.remark || ''}
                                                                                onChange={(e) => handleRemarkChange(student.student_session_id, e.target.value)}
                                                                                disabled={isHoliday}
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="pt15 pb15">
                                                    <Pagination 
                                                        totalItems={totalItems} 
                                                        itemsPerPage={recordsPerPage} 
                                                        currentPage={currentPage}
                                                        onPageChange={(page) => setCurrentPage(page)}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default StudentAttendance;
