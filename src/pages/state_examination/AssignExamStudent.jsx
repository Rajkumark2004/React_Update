import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';

const AssignExamStudent = ({ examId: propExamId, handleClose }) => {
    const { sessionYear } = useSession();
    const { id: paramExamId } = useParams();
    const navigate = useNavigate();

    // Use prop if available, otherwise param (for standalone testing if needed)
    const examId = propExamId || paramExamId;

    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [selectAllVisible, setSelectAllVisible] = useState(false);
    const [saving, setSaving] = useState(false);

    // State to store exam details (from previous page or fetched)
    const [examInfo, setExamInfo] = useState({ id: examId });

    useEffect(() => {
        if (examId) {
            fetchStudents();
        }
    }, [examId]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await api.getAssignExamStudents(examId);
            if (response && response.status && response.data && response.data.resultlist) {
                setStudents(response.data.resultlist);
            } else {
                setStudents([]);
            }
        } catch (error) {
            console.error("Error fetching students:", error);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAllChange = (e) => {
        const checked = e.target.checked;
        setSelectAll(checked);
        setStudents(students.map(s => ({ ...s, is_selected: checked })));
    };

    const handleSelectAllVisibleChange = (e) => {
        const checked = e.target.checked;
        setSelectAllVisible(checked);
        setStudents(students.map(s => ({ ...s, is_visible: checked })));
    };

    const handleStudentCheckboxChange = (id, field) => {
        setStudents(students.map(s => {
            if (s.id === id) {
                // For individual checkbox toggle
                // We are using local state properties is_selected and is_visible
                // If undefined, initialize based on exam_student_id or reportcard_visible_student
                const currentVal = s[field] !== undefined
                    ? s[field]
                    : (field === 'is_selected' ? (Number(s.exam_student_id) !== 0) : (Number(s.reportcard_visible_student) !== 0));

                return { ...s, [field]: !currentVal };
            }
            return s;
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const selectedStudentIds = [];
            const visibleStudentMap = {};

            students.forEach(student => {
                const isSelected = student.is_selected ?? (Number(student.exam_student_id) !== 0);
                const isVisible = student.is_visible ?? (Number(student.reportcard_visible_student) !== 0);

                if (isSelected) {
                    selectedStudentIds.push(parseInt(student.student_session_id));
                }

                if (isVisible) {
                    visibleStudentMap[student.student_session_id] = 1;
                }
            });

            const payload = {
                exam_id: parseInt(examId),
                student_session_id: selectedStudentIds,
                visible_student: visibleStudentMap,
                all_students: 0
            };

            const response = await api.assignExamStudents(payload);
            if (response && response.status) {
                toast.success(response.message || 'Record Saved Successfully');
                if (handleClose) {
                    handleClose();
                } else {
                    navigate('/cbseexam/exam');
                }
            } else {
                toast.error(response.message || 'Failed to save assignments');
            }
        } catch (error) {
            console.error("Error saving exam assignments:", error);
            toast.error("Error occurred while saving");
        } finally {
            setSaving(false);
        }
    };

    // Only render the inner content if using as component
    const content = (
        <div className="modal-content" style={{ border: 'none', borderRadius: '8px', overflow: 'hidden', boxShadow: 'none', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header modal-header-responsive" style={{ background: '#9754ca', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: 'none', borderTopLeftRadius: '6px', borderTopRightRadius: '6px' }}>
                <h4 className="modal-title" style={{ color: 'white', fontWeight: 'bold', margin: 0 }}>
                    Assign / View Student
                </h4>
                <button type="button" className="close-btn-custom" onClick={handleClose} style={{ color: 'white', opacity: 1, background: 'none', border: 'none', fontSize: '28px', fontWeight: 'bold', cursor: 'pointer', transition: 'transform 0.5s ease' }}>&times;</button>
            </div>

            <div className="modal-body" style={{ flex: 1, padding: '15px' }}>
                {loading ? (
                    <div className="text-center" style={{ padding: '50px' }}>
                        <i className="fa fa-spinner fa-spin fa-3x"></i>
                        <p style={{ marginTop: '10px' }}>Loading students...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSave} id="allot_exam_student">
                        <input type="hidden" name="exam_id" value={examId} />
                        <div className="table-responsive ptt10">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th width="60">
                                            <label className="checkbox-inline bolds" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <input type="checkbox" checked={selectAll} onChange={handleSelectAllChange} className="select_all" /> All
                                            </label>
                                        </th>
                                        <th>
                                            <label className="checkbox-inline bolds" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <input type="checkbox" checked={selectAllVisible} onChange={handleSelectAllVisibleChange} className="select_all_visible" /> Visible Report Card
                                            </label>
                                        </th>
                                        <th>Student Name</th>
                                        <th>Admission No</th>
                                        <th>Class (Section)</th>
                                        <th>Father Name</th>
                                        <th>Category</th>
                                        <th>Gender</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="text-danger text-center">No Record Found</td>
                                        </tr>
                                    ) : (
                                        students.map((student) => (
                                            <tr key={student.id}>
                                                <td>
                                                    <input type="hidden" name="all_students[]" value={student.student_session_id} />
                                                    <input type="hidden" name={`student_${student.student_session_id}`} value={student.id} />
                                                    <input
                                                        className="checkbox"
                                                        type="checkbox"
                                                        name="student_session_id[]"
                                                        checked={student.is_selected ?? (Number(student.exam_student_id) !== 0)}
                                                        onChange={() => handleStudentCheckboxChange(student.id, 'is_selected')}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        className="checkbox"
                                                        type="checkbox"
                                                        name={`visible_student[${student.student_session_id}]`}
                                                        checked={student.is_visible ?? (Number(student.reportcard_visible_student) !== 0)}
                                                        onChange={() => handleStudentCheckboxChange(student.id, 'is_visible')}
                                                    />
                                                </td>
                                                <td>{`${student.firstname || ''} ${student.middlename || ''} ${student.lastname || ''}`.trim()}</td>
                                                <td>{student.admission_no}</td>
                                                <td>{`${student.class || ''} (${student.section || ''})`}</td>
                                                <td>{student.father_name}</td>
                                                <td>{student.category}</td>
                                                <td>{student.gender}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="modal-footer" style={{ borderTop: '1px solid #f4f4f4', padding: '15px 0 0 0', marginTop: '15px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button 
                                type="submit" 
                                className="btn btn-primary" 
                                id="load" 
                                disabled={saving} 
                                style={{ 
                                    borderRadius: '25px', 
                                    padding: '6px 20px', 
                                    minWidth: '100px', 
                                    fontWeight: 'bold',
                                    color: 'white',
                                    boxShadow: 'none',
                                    outline: 'none'
                                }}
                            >
                                {saving ? <i className="fa fa-spinner fa-spin"></i> : 'Save'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );

    // If used as a component (with handleClose), render without the outer modal wrapper if handled by parent, 
    // OR render as full modal if that's what we want.
    // The user said "modal should open in the same page", implying it's an overlay.

    return (
        <div className="modal show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)', minHeight: '100vh', zIndex: 1050, position: 'fixed', top: 0, left: 0, overflow: 'auto' }}>
            <div className="modal-dialog modal-xl" style={{ margin: '30px auto' }}>
                {content}
            </div>
        </div>
    );
};

export default AssignExamStudent;
