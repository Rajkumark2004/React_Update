import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import { validateDateRange, sanitizeNumbers, validatePositiveInteger } from '../../utils/validation';

/**
 * ExamAttendance Component
 * 
 * Displays student list for an exam and allows entering attendance data.
 * 
 * Props:
 * - examId: The exam ID to fetch students for
 * - handleClose: Function to close the modal
 * - onSaveSuccess: Callback after successful save (optional)
 */

const ExamAttendance = ({ examId, handleClose, onSaveSuccess }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [students, setStudents] = useState([]);
    const [exam, setExam] = useState({});
    const [schSetting, setSchSetting] = useState({});
    const [totalWorkingDays, setTotalWorkingDays] = useState('');
    const [presentDays, setPresentDays] = useState({});
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (examId) {
            fetchAttendanceData();
        }
    }, [examId]);

    const fetchAttendanceData = async () => {
        // Validation: From Date should be less than or equal to To Date
        const dateRangeError = validateDateRange(fromDate, toDate, 'From Date', 'To Date');
        if (dateRangeError) {
            setErrors(prev => ({ ...prev, toDate: dateRangeError }));
            return;
        }
        setErrors(prev => ({ ...prev, toDate: '' }));

        setLoading(true);
        try {
            // Format dates to DD/MM/YYYY for the backend if they are in YYYY-MM-DD
            const formatForBE = (dateStr) => {
                if (dateStr && dateStr.includes('-')) {
                    const [y, m, d] = dateStr.split('-');
                    return `${d}/${m}/${y}`;
                }
                return dateStr;
            };

            const payload = {
                exam_id: examId,
                from_date: formatForBE(fromDate),
                to_date: formatForBE(toDate)
            };
            const response = await api.getExamAttendance(payload);
            console.log('Exam Attendance Response:', response);
            if (response && response.status) {
                const studentList = response.resultlist || [];
                const examData = response.exam || {};
                const settings = response.sch_setting || {};

                const formatForFE = (dateStr) => {
                    if (dateStr && dateStr.includes('/')) {
                        const [d, m, y] = dateStr.split('/');
                        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                    }
                    return dateStr;
                };

                setStudents(studentList);
                setExam(examData);
                setSchSetting(settings);
                setTotalWorkingDays(examData.total_working_days || '0');
                setFromDate(formatForFE(response.from_date || ''));
                setToDate(formatForFE(response.to_date || ''));

                // Initialize present days from student data
                const initialPresentDays = {};
                studentList.forEach(student => {
                    initialPresentDays[student.exam_student_id] = student.total_present_days || '';
                });
                setPresentDays(initialPresentDays);
            }
        } catch (error) {
            console.error("Error fetching exam attendance:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePresentDaysChange = (examStudentId, value) => {
        setPresentDays(prev => ({
            ...prev,
            [examStudentId]: value
        }));
    };

    const getFullName = (student) => {
        let name = student.firstname || '';
        if (schSetting.middlename === '1' && student.middlename) {
            name += ' ' + student.middlename;
        }
        if (schSetting.lastname === '1' && student.lastname) {
            name += ' ' + student.lastname;
        }
        if (!schSetting.id) {
            return `${student.firstname || ''} ${student.lastname || ''}`.trim();
        }
        return name;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};

        // 1. Date Range Validation
        const dateRangeError = validateDateRange(fromDate, toDate, 'From Date', 'To Date');
        if (dateRangeError) {
            newErrors.toDate = dateRangeError;
        }

        // 2. Total Attendance Validation
        const workingDaysError = validatePositiveInteger(totalWorkingDays, 'Total attendance days');
        if (workingDaysError) {
            newErrors.totalWorkingDays = workingDaysError;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error('Please fix the errors before saving.');
            return;
        }

        setSaving(true);
        try {
            // Build payload
            const examStudentIds = students.map(s => parseInt(s.exam_student_id));
            const payload = {
                exam_id: examId,
                total_working_days: totalWorkingDays,
                exam_student_id: examStudentIds,
                total_present_days: presentDays
            };

            const response = await api.saveExamAttendance(payload);
            if (response && response.status) {
                toast.success(response.message || 'Attendance saved successfully!');
                if (onSaveSuccess) {
                    onSaveSuccess();
                }
                if (handleClose) {
                    handleClose();
                }
                // fetchAttendanceData(); // Refresh not needed if closing
            } else {
                toast.error(response.message || 'Failed to save attendance. Please try again.');
            }
        } catch (error) {
            console.error("Error saving exam attendance:", error);
            toast.error('Error occurred. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center" style={{ padding: '50px' }}>
                <i className="fa fa-spinner fa-spin fa-3x"></i>
                <p style={{ marginTop: '10px' }}>Loading attendance data...</p>
            </div>
        );
    }

    if (!students || students.length === 0) {
        return (
            <div className="alert alert-info">
                No students found for this exam.
            </div>
        );
    }

    return (
        <form id="examAttendanceForm" onSubmit={handleSubmit}>
            {/* Date Range (if applicable) */}
            <div className="row mb20">
                <div className="col-md-4">
                    <div className="form-group">
                        <label>From Date</label>
                        <input
                            type="date"
                            className={`form-control ${errors.fromDate ? 'is-invalid' : ''}`}
                            value={fromDate}
                            onChange={(e) => {
                                setFromDate(e.target.value);
                                setErrors(prev => ({ ...prev, fromDate: '', toDate: '' }));
                            }}
                        />
                        {errors.fromDate && <span className="text-danger" style={{ fontSize: '12px' }}>{errors.fromDate}</span>}
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label>To Date</label>
                        <input
                            type="date"
                            className={`form-control ${errors.toDate ? 'is-invalid' : ''}`}
                            value={toDate}
                            onChange={(e) => {
                                setToDate(e.target.value);
                                setErrors(prev => ({ ...prev, fromDate: '', toDate: '' }));
                            }}
                        />
                        {errors.toDate && <span className="text-danger" style={{ fontSize: '12px' }}>{errors.toDate}</span>}
                    </div>
                </div>
                <div className="col-md-2">
                    <div className="form-group">
                        <label>&nbsp;</label>
                        <button
                            type="button"
                            className="btn btn-info fetch-btn"
                            onClick={fetchAttendanceData}
                        >
                            Fetch
                        </button>
                    </div>
                </div>
            </div>

            {/* Total Working Days */}
            <div className="row">
                <div className="col-md-12">
                    <div className="form-group row align-items-center">
                        <label className="col-sm-2">Total Attendance Days *</label>
                        <div className="col-sm-2">
                            <input
                                type="text"
                                className={`form-control ${errors.totalWorkingDays ? 'is-invalid' : ''}`}
                                value={totalWorkingDays}
                                onChange={(e) => {
                                    setTotalWorkingDays(sanitizeNumbers(e.target.value));
                                    setErrors(prev => ({ ...prev, totalWorkingDays: '' }));
                                }}
                            />
                            {errors.totalWorkingDays && (
                                <span className="text-danger" style={{ fontSize: '12px' }}>
                                    {errors.totalWorkingDays}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Student Table */}
            <div className="table-responsive">
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Admission No</th>
                            <th>Roll No</th>
                            <th>Student Name</th>
                            <th>Class</th>
                            <th>Father Name</th>
                            <th>Gender</th>
                            <th>Total Present Days</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student, index) => (
                            <tr key={student.exam_student_id || index}>
                                <td>{student.admission_no}</td>
                                <td>{student.roll_no}</td>
                                <td>{getFullName(student)}</td>
                                <td>{student.class_name} ({student.section_name})</td>
                                <td>{student.father_name}</td>
                                <td>{student.gender}</td>
                                <td>
                                    <input
                                        type="hidden"
                                        name="exam_student_id[]"
                                        value={student.exam_student_id}
                                    />
                                    <input
                                        type="text"
                                        className="form-control input-sm"
                                        name={`total_present_days[${student.exam_student_id}]`}
                                        value={presentDays[student.exam_student_id] || ''}
                                        onChange={(e) => handlePresentDaysChange(student.exam_student_id, e.target.value)}
                                        placeholder="Enter Days"
                                        style={{ width: '100px' }}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Save Button */}
            <div className="modal-footer" style={{ borderTop: 'unset' }}>
                <button
                    type="submit"
                    className="btn btn-primary pull-right"
                    disabled={saving}
                    style={{ backgroundColor: '#9754ca', borderColor: '#8e44ad', borderRadius: '25px' }}
                >
                    {saving ? (
                        <>
                            <i className="fa fa-spinner fa-spin"></i> Saving...
                        </>
                    ) : (
                        'Save'
                    )}
                </button>
            </div>
            <style jsx>{`
                .mb20 { margin-bottom: 20px; }
                .fetch-btn {
                    padding: 5px 20px;
                    font-size: 13px;
                    border-radius: 4px;
                    width: auto;
                    display: inline-block;
                }
                @media (max-width: 767px) {
                    .fetch-btn {
                        padding: 8px 16px;
                        font-size: 13px;
                        margin-top: 5px;
                    }
                }
            `}</style>
        </form>
    );
};

export default ExamAttendance;
