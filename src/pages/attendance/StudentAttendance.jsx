import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';
import AttendanceSidebar from '../../components/AttendanceSidebar';
import { api } from '../../services/api';
import '../../utils/include_files';

const StudentAttendance = () => {
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [studentList, setStudentList] = useState([]);
    const [formData, setFormData] = useState({
        class_id: '',
        section_id: '',
        date: new Date().toLocaleDateString('en-GB') // Default to current date DD/MM/YYYY
    });
    const [attendanceState, setAttendanceState] = useState({});
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isHoliday, setIsHoliday] = useState(false);

    // Hardcoded attendance types based on typical system values
    const attendanceTypes = [
        { id: 1, type: 'Present', key_value: 'P', color: 'radio-success' },
        { id: 2, type: 'Late', key_value: 'L', color: 'radio-warning' },
        { id: 3, type: 'Absent', key_value: 'A', color: 'radio-danger' },
        { id: 4, type: 'Half Day', key_value: 'F', color: 'radio-info' }
        // Holiday is handled separately via button/checkbox
    ];

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await api.getClasses();
            if (response && (response.data || response.class_sections)) {
                // Handle various likely response structures
                const classesData = response.data?.class_sections || response.class_sections || [];
                if (Array.isArray(classesData)) {
                    setClassList(classesData);
                } else {
                    setClassList([]);
                }
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
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
                // User expects an API call. Using the provided generic Sections API.
                // Note: The provided API response does not include class_id, so strict filtering 
                // might not be possible unless the class list itself contains the mapping.
                // We will try to fetch sections and populate the list.
                const response = await api.getSections();

                if (response && response.data) {
                    setSectionList(response.data);
                } else if (response && Array.isArray(response)) {
                    setSectionList(response);
                }
            } catch (error) {
                console.error('Error fetching sections:', error);
            }
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!formData.class_id || !formData.section_id || !formData.date) {
            setMessage({ type: 'error', text: 'Class, Section and Date are required' });
            return;
        }

        setLoading(true);
        try {
            // Ensure date is in DD-MM-YYYY format for the API if not already
            const formattedDate = formData.date.replace(/\//g, '-');
            const data = await api.searchAttendance(formData.class_id, formData.section_id, formattedDate);
            console.log('StudentAttendance Search Result:', data);

            if (data.status && data.students) {
                // Initialize attendance state
                const initialAttendance = {};
                let isHolidayFound = false;

                // Check first student for holiday status as per PHP logic (if one is holiday, all are usually holiday for that section/date)
                if (data.students.length > 0 && data.students[0].attendence_type_id == 5) {
                    isHolidayFound = true;
                }

                data.students.forEach(student => {
                    initialAttendance[student.student_session_id] = {
                        // API returns "attendence_type_id": null if not set, or a value.
                        // If null, default to Present (1).
                        attendance_type_id: student.attendence_type_id || 1,
                        remark: student.remark || ''
                    };
                });
                setAttendanceState(initialAttendance);
                setStudentList(data.students);
                setIsHoliday(isHolidayFound);
            } else {
                setStudentList([]);
                setMessage({ type: 'error', text: data.message || 'Attendance not submitted for this class' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Search failed' });
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

    const handleSave = async () => {
        setLoading(true);
        try {
            // Format date as DD-MM-YYYY for the API
            const formattedDate = formData.date.replace(/\//g, '-');

            // Build the students array with correct format
            const students = Object.keys(attendanceState).map(key => ({
                student_session_id: parseInt(key),
                attendance_type_id: isHoliday ? 5 : parseInt(attendanceState[key].attendance_type_id)
            }));

            const attendanceData = {
                date: formattedDate,
                students: students
            };

            console.log('Saving attendance:', attendanceData);
            const response = await api.saveAttendance(attendanceData);

            if (response.status) {
                setMessage({ type: 'success', text: response.message || 'Attendance saved successfully' });
            } else {
                setMessage({ type: 'error', text: response.message || 'Failed to save attendance' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Save failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="wrapper theme-white-skin">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '946px' }}>
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
                                                {message.text && (
                                                    <div className={`col-md-12 alert alert-${message.type === 'error' ? 'danger' : 'success'}`}>
                                                        {message.text}
                                                    </div>
                                                )}
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
                                                                <option key={sec.id || sec.section_id} value={sec.id || sec.section_id}>{sec.section}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label>Attendance Date <small className="req"> *</small></label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={formData.date}
                                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                            placeholder="DD/MM/YYYY" // Basic text input for now matching PHP style
                                                        />
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
                                            <div className="box-header with-border">
                                                <h3 className="box-title"><i className="fa fa-users"></i> Student List</h3>
                                            </div>
                                            <div className="box-body">
                                                <div className="mailbox-controls">
                                                    <span className="button-checkbox">
                                                        <button
                                                            type="button"
                                                            className={`btn btn-sm ${isHoliday ? 'btn-primary active' : 'btn-primary'}`}
                                                            onClick={toggleHoliday}
                                                        >
                                                            <i className={`state-icon glyphicon ${isHoliday ? 'glyphicon-check' : 'glyphicon-unchecked'}`}></i> Mark as Holiday
                                                        </button>
                                                    </span>
                                                    <div className="pull-right">
                                                        <button type="button" className="btn btn-default btn-sm pull-left checkbox-toggle" style={{ marginRight: '5px' }}>
                                                            <i className="fa fa-trash"></i> Delete
                                                        </button>
                                                        <button type="button" onClick={handleSave} className="btn btn-primary btn-sm pull-right checkbox-toggle">
                                                            <i className="fa fa-save"></i> Save Attendance
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="table-responsive ptt10">
                                                    <table className="table table-hover table-striped example">
                                                        <thead>
                                                            <tr>
                                                                <th>#</th>
                                                                <th>Admission No</th>
                                                                <th>Roll Number</th>
                                                                <th>Name</th>
                                                                <th width="30%">Attendance</th>
                                                                <th>Note</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {studentList.map((student, index) => (
                                                                <tr key={student.student_session_id}>
                                                                    <td>{index + 1}</td>
                                                                    <td>{student.admission_no}</td>
                                                                    <td>{student.roll_no}</td>
                                                                    <td>{student.firstname} {student.lastname}</td>
                                                                    <td>
                                                                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                                                                            {!isHoliday && attendanceTypes.map(type => (
                                                                                <div key={type.id} className="radio radio-info radio-inline" style={{ display: 'inline-flex', alignItems: 'center', margin: '0 10px 0 0' }}>
                                                                                    <input
                                                                                        type="radio"
                                                                                        id={`attendencetype${student.student_session_id}-${type.id}`}
                                                                                        name={`attendencetype${student.student_session_id}`}
                                                                                        value={type.id}
                                                                                        checked={attendanceState[student.student_session_id]?.attendance_type_id == type.id}
                                                                                        onChange={() => handleAttendanceChange(student.student_session_id, type.id)}
                                                                                    />
                                                                                    <label htmlFor={`attendencetype${student.student_session_id}-${type.id}`}>
                                                                                        {type.type}
                                                                                    </label>
                                                                                </div>
                                                                            ))}
                                                                            {isHoliday && <span className="text-danger">Holiday</span>}
                                                                        </div>
                                                                    </td>
                                                                    <td style={{ verticalAlign: 'bottom', paddingBottom: '8px' }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                style={{ width: '100px', height: '24px', padding: '2px 5px', fontSize: '12px', border: '1px solid #777' }}
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
