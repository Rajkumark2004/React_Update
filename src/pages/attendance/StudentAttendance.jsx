import React, { useState, useEffect } from 'react';
import Loader from '../../components/Loader';
import { api } from '../../services/api';
import '../../utils/include_files';
import toast from 'react-hot-toast';
import AttendanceLayout from './AttendanceLayout';
import PremiumTableToolbar from '../../utils/PremiumTableToolbar';
import { buildExportData } from '../../utils/tableExport';

const StudentAttendance = () => {
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [studentList, setStudentList] = useState([]);
    const [formData, setFormData] = useState({
        class_id: '',
        section_id: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [attendanceState, setAttendanceState] = useState({});
    const [errors, setErrors] = useState({});
    const [isHoliday, setIsHoliday] = useState(false);
    const [attendanceTypes, setAttendanceTypes] = useState([]);
    const [holidayId, setHolidayId] = useState(5);
    const [presentId, setPresentId] = useState(1);
    const [selectedStudents, setSelectedStudents] = useState([]);

    // Table state
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);
    const [searchTerm, setSearchTerm] = useState('');

    const columns = [
        { key: 'select', label: 'Select' },
        { key: 'sno', label: 'S.No' },
        { key: 'admission_no', label: 'Admission No' },
        { key: 'roll_no', label: 'Roll Number' },
        { key: 'name', label: 'Name' },
        { key: 'attendance', label: 'Attendance' },
        { key: 'note', label: 'Note' }
    ];
    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await api.getStudentCreate();
            if (response && response.status === 'success' && response.data && response.data.classlist) {
                setClassList(response.data.classlist);
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
                const response = await api.getSectionsByClass(classId);
                if (response && response.status === 'success' && response.data) {
                    setSectionList(response.data);
                } else if (Array.isArray(response)) {
                    setSectionList(response);
                } else {
                    setSectionList(response.data || response.sections || []);
                }
            } catch (error) {
                console.error('Error fetching sections:', error);
            }
        }
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
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
            const formattedDate = formData.date ? formData.date.split('-').reverse().join('-') : '';
            const data = await api.searchAttendance(formData.class_id, formData.section_id, formattedDate);

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

                if (data.students.length > 0 && data.students[0].attendence_type_id == dynamicHolidayId) {
                    isHolidayFound = true;
                }

                const initialAttendance = {};
                data.students.forEach(student => {
                    initialAttendance[student.student_session_id] = {
                        attendance_type_id: student.attendence_type_id || dynamicPresentId,
                        remark: student.remark || ''
                    };
                });
                setAttendanceState(initialAttendance);
                setStudentList(data.students);
                setIsHoliday(isHolidayFound);
                setSelectedStudents([]);
                setCurrentPage(1);
                toast.success('Attendance records loaded');
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
            [studentSessionId]: { ...prev[studentSessionId], attendance_type_id: typeId }
        }));
    };

    const getInitials = (name) => {
        if (!name) return '';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const getAvatarColor = (name) => {
        const colors = [
            { bg: '#e0f2fe', text: '#0284c7' },
            { bg: '#f3e8ff', text: '#9333ea' },
            { bg: '#dcfce7', text: '#16a34a' },
            { bg: '#fef3c7', text: '#d97706' },
            { bg: '#ffe4e6', text: '#e11d48' },
        ];
        let hash = 0;
        if (name) {
            for (let i = 0; i < name.length; i++) {
                hash = name.charCodeAt(i) + ((hash << 5) - hash);
            }
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const handleRemarkChange = (studentSessionId, remark) => {
        setAttendanceState(prev => ({
            ...prev,
            [studentSessionId]: { ...prev[studentSessionId], remark: remark }
        }));
    };

    const toggleHoliday = () => setIsHoliday(!isHoliday);

    const handleSelectAll = (e) => {
        if (e.target.checked) setSelectedStudents(studentList.map(s => s.student_session_id));
        else setSelectedStudents([]);
    };

    const handleSelectStudent = (studentSessionId, checked) => {
        if (checked) setSelectedStudents(prev => [...prev, studentSessionId]);
        else setSelectedStudents(prev => prev.filter(id => id !== studentSessionId));
    };

    const handleSave = async () => {
        if (selectedStudents.length === 0) {
            toast.error('Please select at least one student');
            return;
        }
        setLoading(true);
        try {
            const formattedDate = formData.date ? formData.date.split('-').reverse().join('-') : '';
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

            const attendanceData = { date: formattedDate, students, attendance_id: students.map(s => s.attendance_id) };
            const response = await api.saveAttendance(attendanceData);
            if (response.status) {
                toast.success(response.message || 'Attendance saved successfully');
                handleSearch();
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
        const attendanceIds = selectedStudents
            .map(sessionId => {
                const student = studentList.find(s => s.student_session_id === sessionId);
                return student && student.attendence_id && student.attendence_id !== "0" ? parseInt(student.attendence_id) : null;
            })
            .filter(id => id !== null);

        if (attendanceIds.length === 0) {
            toast.error('No saved attendance found for the selected students to delete.');
            return;
        }
        if (!window.confirm('Are you sure you want to delete attendance for the selected students?')) return;

        setLoading(true);
        try {
            const payload = { data: attendanceIds.map(id => ({ attendence_ids: [id] })) };
            const response = await api.deleteBulkAttendance(payload);
            if (response && response.status) {
                toast.success('Attendance deleted successfully');
                handleSearch();
            } else {
                toast.error(response.message || 'Failed to delete attendance');
            }
        } catch (error) {
            toast.error('Failed to delete attendance');
        } finally {
            setLoading(false);
        }
    };

    const filteredList = studentList.filter(student => {
        const term = searchTerm.toLowerCase();
        return (
            (student.admission_no || '').toLowerCase().includes(term) ||
            (student.roll_no || '').toLowerCase().includes(term) ||
            (`${student.firstname || ''} ${student.lastname || ''}`).toLowerCase().includes(term)
        );
    });

    const totalItems = filteredList.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const totalPages = Math.ceil(totalItems / safeRecordsPerPage);
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentRecords = filteredList.slice(indexOfFirstItem, indexOfLastItem);

    const formatCell = (row, key) => {
        switch (key) {
            case 'sno': return studentList.indexOf(row) + 1;
            case 'name': return `${row.firstname} ${row.lastname}`;
            case 'attendance': return attendanceTypes.find(t => parseInt(t.attendence_type_id) === parseInt(attendanceState[row.student_session_id]?.attendance_type_id))?.type || 'N/A';
            case 'note': return attendanceState[row.student_session_id]?.remark || '';
            default: return row[key] || '';
        }
    };

    const getExportData = () => buildExportData(columns, visibleColumns, filteredList, formatCell);

    return (
        <AttendanceLayout activeTab="student">
            <div className="sis-search-bar-container" style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <div className="sis-search-bar-header">
                    <h3 className="sis-search-title" style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600', color: '#1e293b' }}>Select Criteria</h3>
                </div>
                <form onSubmit={handleSearch}>
                    <div className="sis-filter-row" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div className="sis-filter-col" style={{ flex: '1', minWidth: '200px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>Class <span className="req">*</span></label>
                            <select
                                className="form-control sis-filter-select"
                                value={formData.class_id}
                                onChange={handleClassChange}
                                style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }}
                            >
                                <option value="">Select</option>
                                {classList.map(cls => (
                                    <option key={cls.id} value={cls.id}>{cls.class}</option>
                                ))}
                            </select>
                            {errors.class_id && <span className="text-danger" style={{ fontSize: '11px' }}>{errors.class_id}</span>}
                        </div>
                        <div className="sis-filter-col" style={{ flex: '1', minWidth: '200px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>Section <span className="req">*</span></label>
                            <select
                                className="form-control sis-filter-select"
                                value={formData.section_id}
                                onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                                style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }}
                            >
                                <option value="">Select</option>
                                {sectionList.map(sec => (
                                    <option key={sec.section_id} value={sec.section_id}>{sec.section}</option>
                                ))}
                            </select>
                            {errors.section_id && <span className="text-danger" style={{ fontSize: '11px' }}>{errors.section_id}</span>}
                        </div>
                        <div className="sis-filter-col" style={{ flex: '1', minWidth: '200px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>Attendance Date <span className="req">*</span></label>
                            <input
                                type="date"
                                className="form-control sis-filter-select"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                max={new Date().toISOString().split('T')[0]}
                                style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }}
                            />
                            {errors.date && <span className="text-danger" style={{ fontSize: '11px' }}>{errors.date}</span>}
                        </div>
                        <div className="sis-filter-col" style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <button type="submit" className="btn btn-primary sis-apply-btn" disabled={loading} style={{ height: '40px', padding: '0 24px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className={`fa ${loading ? 'fa-spinner fa-spin' : 'fa-search'}`}></i> {loading ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {initialLoading ? (
                <div className="text-center p-5"><Loader /></div>
            ) : studentList.length > 0 ? (
                <div className="sis-list-container" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div className="sis-list-header" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>Attendance Marking</h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                type="button"
                                className={`btn ${isHoliday ? 'btn-primary' : 'btn-default'}`}
                                onClick={toggleHoliday}
                                style={{ borderRadius: '8px', fontWeight: '600', border: '1px solid #e2e8f0' }}
                            >
                                <i className={`fa ${isHoliday ? 'fa-check-square-o' : 'fa-square-o'}`}></i> Mark as Holiday
                            </button>
                            <button type="button" onClick={handleDelete} className="btn btn-danger" style={{ borderRadius: '8px', fontWeight: '600' }}>
                                <i className="fa fa-trash"></i> Delete
                            </button>
                            <button type="button" onClick={handleSave} className="btn btn-primary" style={{ borderRadius: '8px', fontWeight: '600', padding: '0 24px' }}>
                                <i className="fa fa-save"></i> Save Attendance
                            </button>
                        </div>
                    </div>

                <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <i className="fa fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                        <input
                            type="text"
                            placeholder="Search..."
                            className="form-control"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            style={{ paddingLeft: '36px', borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }}
                        />
                    </div>
                    <PremiumTableToolbar
                        columns={columns}
                        visibleColumns={visibleColumns}
                        onToggleColumn={(key) => setVisibleColumns(prev => {
                            const next = new Set(prev);
                            if (next.has(key)) next.delete(key); else next.add(key);
                            return next;
                        })}
                        getExportData={getExportData}
                        exportFileName="student_attendance"
                        exportTitle="Student Attendance"
                        recordsPerPage={recordsPerPage}
                        onRecordsPerPageChange={(val) => { setRecordsPerPage(val); setCurrentPage(1); }}
                    />
                </div>

                    <div className="table-responsive">
                        <table className="table table-hover" style={{ margin: 0 }}>
                            <thead>
                                <tr className="modern-table-header">
                                    {visibleColumns.has('select') && (
                                        <th style={{ padding: '12px 24px', borderBottom: '1px solid #e2e8f0' }}>
                                            <input
                                                type="checkbox"
                                                checked={studentList.length > 0 && selectedStudents.length === studentList.length}
                                                onChange={handleSelectAll}
                                            />
                                        </th>
                                    )}
                                    {visibleColumns.has('sno') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>S.No</th>}
                                    {visibleColumns.has('admission_no') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Admission No</th>}
                                    {visibleColumns.has('roll_no') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Roll No</th>}
                                    {visibleColumns.has('name') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Name</th>}
                                    {visibleColumns.has('attendance') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Attendance</th>}
                                    {visibleColumns.has('note') && <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Note</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {currentRecords.map((student, index) => (
                                    <tr key={student.student_session_id} className="modern-table-row">
                                        {visibleColumns.has('select') && (
                                            <td style={{ padding: '12px 24px', borderBottom: '1px solid #f1f5f9' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStudents.includes(student.student_session_id)}
                                                    onChange={(e) => handleSelectStudent(student.student_session_id, e.target.checked)}
                                                />
                                            </td>
                                        )}
                                        {visibleColumns.has('sno') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{indexOfFirstItem + index + 1}</td>}
                                        {visibleColumns.has('admission_no') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{student.admission_no}</td>}
                                        {visibleColumns.has('roll_no') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{student.roll_no}</td>}
                                        {visibleColumns.has('name') && (
                                            <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ 
                                                        width: '32px', height: '32px', borderRadius: '50%', 
                                                        backgroundColor: getAvatarColor(`${student.firstname} ${student.lastname}`).bg, 
                                                        color: getAvatarColor(`${student.firstname} ${student.lastname}`).text,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontWeight: '600', fontSize: '13px', flexShrink: 0
                                                    }}>
                                                        {getInitials(`${student.firstname} ${student.lastname}`)}
                                                    </div>
                                                    <div style={{ fontWeight: '500' }}>{student.firstname} {student.lastname}</div>
                                                </div>
                                            </td>
                                        )}
                                        {visibleColumns.has('attendance') && (
                                            <td style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                                                    {!isHoliday && attendanceTypes.filter(type => type.type.toLowerCase() !== 'holiday').map(type => (
                                                        <label key={type.attendence_type_id} style={{ fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', margin: 0 }}>
                                                            <input
                                                                type="radio"
                                                                name={`attendencetype${student.student_session_id}`}
                                                                value={type.attendence_type_id}
                                                                checked={attendanceState[student.student_session_id]?.attendance_type_id == type.attendence_type_id}
                                                                onChange={() => handleAttendanceChange(student.student_session_id, type.attendence_type_id)}
                                                            />
                                                            {type.type}
                                                        </label>
                                                    ))}
                                                    {isHoliday && <span className="label label-danger" style={{ borderRadius: '4px' }}><i className="fa fa-sun-o"></i> Holiday</span>}
                                                </div>
                                            </td>
                                        )}
                                        {visibleColumns.has('note') && (
                                            <td style={{ padding: '12px 24px', borderBottom: '1px solid #f1f5f9' }}>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    style={{ height: '32px', fontSize: '13px', borderRadius: '6px' }}
                                                    value={attendanceState[student.student_session_id]?.remark || ''}
                                                    onChange={(e) => handleRemarkChange(student.student_session_id, e.target.value)}
                                                    disabled={isHoliday}
                                                    placeholder="Add remark..."
                                                />
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {!initialLoading && totalItems > 0 && (
                        <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
                            <div style={{ color: '#64748b', fontSize: '14px' }}>
                                Showing {(currentPage - 1) * safeRecordsPerPage + 1} to {Math.min(currentPage * safeRecordsPerPage, totalItems)} of {totalItems} entries
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                    className="btn btn-default btn-sm" 
                                    disabled={currentPage === 1} 
                                    onClick={() => setCurrentPage(prev => prev - 1)} 
                                    style={{ borderRadius: '6px', border: '1px solid #e2e8f0', background: '#ffffff', color: currentPage === 1 ? '#cbd5e1' : '#475569' }}
                                >
                                    <i className="fa fa-angle-left"></i>
                                </button>
                                <button 
                                    className="btn btn-sm" 
                                    style={{ borderRadius: '6px', background: '#7c3aed', color: '#ffffff', minWidth: '32px', fontWeight: '600' }}
                                >
                                    {currentPage}
                                </button>
                                <button 
                                    className="btn btn-default btn-sm" 
                                    disabled={currentPage >= totalPages} 
                                    onClick={() => setCurrentPage(prev => prev + 1)} 
                                    style={{ borderRadius: '6px', border: '1px solid #e2e8f0', background: '#ffffff', color: currentPage >= totalPages ? '#cbd5e1' : '#475569' }}
                                >
                                    <i className="fa fa-angle-right"></i>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                !initialLoading && (
                    <div className="sis-list-container" style={{ padding: '48px', textAlign: 'center', background: '#fff', borderRadius: '12px', color: '#64748b', border: '1px solid #e2e8f0' }}>
                        <i className="fa fa-info-circle" style={{ fontSize: '24px', marginBottom: '12px' }}></i>
                        <p>No student records found. Select criteria and click search.</p>
                    </div>
                )
            )}
        </AttendanceLayout>
    );
};

export default StudentAttendance;


