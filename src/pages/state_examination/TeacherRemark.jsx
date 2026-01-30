import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

/**
 * TeacherRemark Component
 * 
 * This is a modal/partial component used within CBSEExamList to display
 * student list and allow teachers to enter remarks for each student.
 * 
 * Props:
 * - examId: The exam ID to fetch students for
 * - handleClose: Function to close the modal
 * - onSaveSuccess: Callback after successful save (optional)
 */

const TeacherRemark = ({ examId, handleClose, onSaveSuccess }) => {
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [schSetting, setSchSetting] = useState({});
    const [remarks, setRemarks] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (examId) {
            fetchStudents();
        }
    }, [examId]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await api.getTeacherRemark(examId);
            console.log('Teacher Remark Response:', response);
            if (response && response.status) {
                // Map from response structure
                const studentList = response.resultlist || [];
                const settings = response.sch_setting || {};

                setStudents(studentList);
                setSchSetting(settings);
                initializeRemarks(studentList);
            }
        } catch (error) {
            console.error("Error fetching students for remark:", error);
        } finally {
            setLoading(false);
        }
    };

    const initializeRemarks = (studentList) => {
        const initialRemarks = {};
        studentList.forEach(student => {
            // exam_student_id is the key, remark is the current value
            initialRemarks[student.exam_student_id] = student.remark || '';
        });
        setRemarks(initialRemarks);
    };

    const handleRemarkChange = (examStudentId, value) => {
        setRemarks(prev => ({
            ...prev,
            [examStudentId]: value
        }));
    };

    const getFullName = (student) => {
        // Replicate PHP getFullName logic based on schSetting
        let name = student.firstname || '';
        if (schSetting.middlename === '1' && student.middlename) {
            name += ' ' + student.middlename;
        }
        if (schSetting.lastname === '1' && student.lastname) {
            name += ' ' + student.lastname;
        }
        // Fallback if schSetting not properly loaded
        if (!schSetting.id) {
            return `${student.firstname || ''} ${student.lastname || ''}`.trim();
        }
        return name;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Build payload matching API structure:
            // { "exam_student_id": [52, 53], "teacher_remark": { "52": "...", "53": "..." } }
            const examStudentIds = students.map(s => parseInt(s.exam_student_id));
            const payload = {
                exam_student_id: examStudentIds,
                teacher_remark: remarks
            };

            const response = await api.addTeacherRemark(payload);
            if (response && response.status) {
                alert(response.message || 'Remarks saved successfully!');
                if (onSaveSuccess) {
                    onSaveSuccess();
                }
                // Refresh data after save
                fetchStudents();
            } else {
                alert('Failed to save remarks. Please try again.');
            }
        } catch (error) {
            console.error("Error saving teacher remarks:", error);
            alert('Error occurred. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center" style={{ padding: '50px' }}>
                <i className="fa fa-spinner fa-spin fa-3x"></i>
                <p style={{ marginTop: '10px' }}>Loading students...</p>
            </div>
        );
    }

    if (!students || students.length === 0) {
        return (
            <div className="alert alert-info">
                No record found
            </div>
        );
    }

    return (
        <form method="post" id="addTeacherRemark" onSubmit={handleSubmit}>
            <div className="row">
                <div className="col-md-12">
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Admission No</th>
                                    <th>Roll No</th>
                                    <th>Class</th>
                                    <th>Section</th>
                                    <th>Student Name</th>
                                    <th>Father Name</th>
                                    <th>Gender</th>
                                    <th>Remark</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student, index) => (
                                    <tr key={student.exam_student_id || index} className={`cbse_exam_student_id_${student.exam_student_id}`}>
                                        <td>{student.admission_no}</td>
                                        <td>{student.roll_no}</td>
                                        <td>{student.class_name}</td>
                                        <td>{student.section_name}</td>
                                        <td>{getFullName(student)}</td>
                                        <td>{student.father_name}</td>
                                        <td>{student.gender}</td>
                                        <td className="white-space-nowrap">
                                            <input
                                                type="hidden"
                                                className="marksssss form-control w-sm-150"
                                                name="exam_student_id[]"
                                                value={student.exam_student_id}
                                            />
                                            <input
                                                type="text"
                                                className="marksssss form-control w-sm-150"
                                                name={`teacher_remark[${student.exam_student_id}]`}
                                                value={remarks[student.exam_student_id] || ''}
                                                onChange={(e) => handleRemarkChange(student.exam_student_id, e.target.value)}
                                                placeholder="Enter Remark"
                                                style={{ minWidth: '150px' }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Save Button */}
                    <div className="modal-footer clearboth mx-nt-lr-15 pb0" style={{ borderTop: 'unset' }}>
                        <button
                            type="submit"
                            className="allot-fees btn btn-primary pull-right"
                            id="load"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <i className="fa fa-spinner fa-spin"></i> Please Wait..
                                </>
                            ) : (
                                'Save'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default TeacherRemark;
