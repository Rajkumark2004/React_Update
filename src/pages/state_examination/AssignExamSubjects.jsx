import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ClockInput } from '../../utils/clock';
import { sanitizeNumbers, validatePositiveInteger } from '../../utils/validation';

const AssignExamSubjects = ({ examId, handleClose }) => {
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);
    const [batchSubjects, setBatchSubjects] = useState([]);
    const [examInfo, setExamInfo] = useState({});
    const [saving, setSaving] = useState(false);

    // Assessment Type IDs (needed for backend, derived from exam info or fetched)
    const [typeIds, setTypeIds] = useState([]);

    useEffect(() => {
        if (examId) {
            fetchExamSubjects();
        }
    }, [examId]);
    useEffect(() => {
        const selects = document.querySelectorAll('.subject-select-dropdown');
        const subjectsSelected = rows.map(r => String(r.subject_id)).filter(Boolean);
        
        selects.forEach(select => {
            if (!select.value) {
                select.setCustomValidity("");
                return;
            }
            const count = subjectsSelected.filter(id => id === select.value).length;
            if (count <= 1) {
                select.setCustomValidity("");
            }
        });
    }, [rows]);

    const fetchExamSubjects = async () => {
        setLoading(true);
        console.log("Fetching exam subjects for ID:", examId);
        try {
            const response = await api.getExamSubjects(examId);
            console.log("API Response:", response);
            if (response && response.status && response.data) {
                console.log("Setting batch subjects:", response.data.batch_subjects);
                setBatchSubjects(response.data.batch_subjects || []);
                setExamInfo(response.data.examDetail || {});

                // Extract type_ids (assessment types) for the payload
                const types = response.data.type_ids || (response.data.examDetail && response.data.examDetail.type_ids) || [];
                setTypeIds(types);

                // Initialize rows from exam_subjects
                const existingSubjects = response.data.exam_subjects || [];
                console.log("Existing subjects:", existingSubjects);
                if (existingSubjects.length > 0) {
                    const initialRows = existingSubjects.map((sub, index) => ({
                        id: Date.now() + index, // Temporary FE ID
                        exam_subject_id: sub.id, // Real BE ID
                        // Use subject_id from API to pre-select the dropdown
                        subject_id: sub.subject_id,
                        date: sub.date,
                        time_from: sub.time_from,
                        duration: sub.duration,
                        room_no: sub.room_no
                    }));
                    setRows(initialRows);
                } else {
                    setRows([{
                        id: Date.now(),
                        exam_subject_id: null,
                        subject_id: '',
                        date: '',
                        time_from: '',
                        duration: '',
                        room_no: '',
                        errors: {}
                    }]);
                }
            } else {
                console.error("Invalid response structure:", response);
            }
        } catch (error) {
            console.error("Error fetching exam subjects:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRow = () => {
        setRows([...rows, {
            id: Date.now(),
            exam_subject_id: null,
            subject_id: '',
            date: '',
            time_from: '',
            duration: '',
            room_no: '',
            errors: {}
        }]);
    };

    const handleRemoveRow = (id) => {
        setRows(rows.filter(r => r.id !== id));
    };

    const handleRowChange = (id, field, value) => {
        let sanitizedValue = value;
        if (field === 'duration') {
            sanitizedValue = sanitizeNumbers(value);
        }
        setRows(rows.map(r => r.id === id ? { 
            ...r, 
            [field]: sanitizedValue,
            errors: { ...r.errors, [field]: '' } // Clear error on change
        } : r));
    };

    const handleSave = async (e) => {
        e.preventDefault();

        let hasErrors = false;
        const updatedRows = rows.map((row, i) => {
            const errors = {};
            
            const durationError = validatePositiveInteger(row.duration, 'Duration');
            if (durationError) {
                errors.duration = durationError;
                hasErrors = true;
            }
            
            return { ...row, errors };
        });

        if (hasErrors) {
            setRows(updatedRows);
            return;
        }

        setSaving(true);
        try {
            // Mimicking the original PHP application's indexed payload
            const formData = new FormData();
            formData.append('exam_id', examId);

            // Append type_ids[]
            if (typeIds && typeIds.length > 0) {
                typeIds.forEach(id => {
                    formData.append('type_ids[]', id);
                });
            }

            rows.forEach((row, index) => {
                const i = index + 1;
                formData.append(`subject_${i}`, row.subject_id);

                // Format date to DD/MM/YYYY for the backend
                let formattedDate = row.date;
                if (row.date && row.date.includes('-')) {
                    const dateParts = row.date.split('-');
                    formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
                }

                let timeVal = row.time_from;
                if (timeVal && timeVal.split(':').length === 2) {
                    timeVal += ':00';
                }

                formData.append(`date_from_${i}`, formattedDate);
                formData.append(`time_from${i}`, timeVal); // No underscore
                formData.append(`duration${i}`, row.duration); // No underscore
                formData.append(`room_no_${i}`, row.room_no);
                formData.append('rows[]', i);
                formData.append(`prev_row[${i}]`, row.exam_subject_id || 0);
            });

            await api.addExamSubject(formData);
            alert('Subjects saved successfully!');
            handleClose();
        } catch (error) {
            console.error("Error saving exam subjects:", error);
            alert('Failed to save subjects. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)', minHeight: '100vh', zIndex: 1050, position: 'fixed', top: 0, left: 0, overflow: 'auto' }}>
            <div className="modal-dialog modal-xl" style={{ margin: '30px auto' }}>
                <div className="modal-content" style={{ border: 'none', borderRadius: 0, boxShadow: 'none', display: 'flex', flexDirection: 'column' }}>
                    <div className="modal-header" style={{ padding: '8px 15px' }}>
                        <h4 className="modal-title" style={{ fontWeight: 'bold', fontSize: '16px', margin: 0 }}>
                            Exam Subjects
                        </h4>
                    </div>

                    <div className="modal-body" style={{ flex: 1, padding: '15px' }}>
                        {loading ? (
                            <div className="text-center" style={{ padding: '50px' }}>
                                <i className="fa fa-spinner fa-spin fa-3x"></i>
                                <p style={{ marginTop: '10px' }}>Loading subjects...</p>
                            </div>
                        ) : (
                            <div>
                                <div className="row pb10">
                                    <div className="col-lg-2 col-md-3 col-sm-12">
                                        <p className="examinfo"><span>Exam: </span>{examInfo.name}</p>
                                    </div>
                                    <div className="col-lg-10 col-md-9 col-sm-12">
                                        <p className="examinfo"><span>Class (Section): </span>{examInfo.class_sections}</p>
                                    </div>
                                </div>
                                <div className="divider2"></div>
                                <div className="row">
                                    <div className="col-md-12 pt5">
                                        <button type="button" className="btn btn-primary btn-sm add pull-right" onClick={handleAddRow} style={{ backgroundColor: '#9754ca', borderColor: '#8e44ad', borderRadius: '25px', padding: '5px 15px' }}>
                                            <span className="fa fa-plus"></span> Add Exam Subject
                                        </button>
                                    </div>
                                </div>

                                <form onSubmit={handleSave} className="ssaddSubject ptt10 autoscroll">
                                    <div className="table-responsive">
                                        <table className="table table-bordered" id="item_table">
                                            <thead>
                                                <tr>
                                                    <th>Subject<small className="req"> *</small></th>
                                                    <th>Date<small className="req"> *</small></th>
                                                    <th>Start Time<small className="req"> *</small></th>
                                                    <th>Duration (Minute)<small className="req"> *</small></th>
                                                    <th>Room No<small className="req"> *</small></th>
                                                    <th className="text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rows.map((row, index) => (
                                                    <tr key={row.id}>
                                                        <td style={{ minWidth: '200px' }}>
                                                            <select
                                                                className="form-control subject-select-dropdown"
                                                                value={row.subject_id}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    const isDuplicate = val && rows.some(r => String(r.subject_id) === String(val) && r.id !== row.id);
                                                                    if (isDuplicate) {
                                                                        e.target.setCustomValidity("Subject Already Exists");
                                                                        e.target.reportValidity();
                                                                    }
                                                                    handleRowChange(row.id, 'subject_id', val);
                                                                }}
                                                                required
                                                            >
                                                                <option value="">Select</option>
                                                                {batchSubjects.map(sub => (
                                                                    <option key={sub.id} value={sub.id}>
                                                                        {sub.name} {sub.code ? `(${sub.code})` : ''}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <div className="input-group">
                                                                <input
                                                                    type="date"
                                                                    className="form-control"
                                                                    value={row.date}
                                                                    onChange={(e) => handleRowChange(row.id, 'date', e.target.value)}
                                                                    required
                                                                />

                                                            </div>
                                                        </td>
                                                        <td style={{ position: 'relative' }}>
                                                            <input 
                                                                type="text" 
                                                                value={row.time_from || ''} 
                                                                onChange={() => {}} 
                                                                required 
                                                                tabIndex="-1"
                                                                style={{ 
                                                                    position: 'absolute', 
                                                                    opacity: 0, 
                                                                    width: '1px', 
                                                                    height: '1px', 
                                                                    pointerEvents: 'none', 
                                                                    zIndex: -1, 
                                                                    left: '50%', 
                                                                    top: '50%' 
                                                                }} 
                                                            />
                                                            <ClockInput
                                                                onChange={(val) => handleRowChange(row.id, 'time_from', val)}
                                                                value={row.time_from}
                                                                required
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className={`form-control ${row.errors?.duration ? 'is-invalid' : ''}`}
                                                                value={row.duration}
                                                                onChange={(e) => handleRowChange(row.id, 'duration', e.target.value)}
                                                                required
                                                            />
                                                            {row.errors?.duration && (
                                                                <span className="text-danger" style={{ fontSize: '12px' }}>
                                                                    {row.errors.duration}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={row.room_no}
                                                                onChange={(e) => handleRowChange(row.id, 'room_no', e.target.value)}
                                                                required
                                                            />
                                                        </td>
                                                        <td className="text-center">
                                                            <span
                                                                className="text text-danger remove fa fa-times"
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => handleRemoveRow(row.id)}
                                                            ></span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="modal-footer clearboth mx-nt-lr-15 pb0" style={{ borderTop: 'unset', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                        <button type="button" className="btn btn-default" onClick={handleClose} style={{ borderRadius: '25px', padding: '6px 20px', minWidth: '100px' }}>Close</button>
                                        <button type="submit" className="btn btn-primary" id="load" disabled={saving} style={{ backgroundColor: '#9754ca', borderColor: '#8e44ad', borderRadius: '25px', padding: '6px 20px', minWidth: '100px' }}>
                                            {saving ? <i className="fa fa-spinner fa-spin"></i> : 'Save'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignExamSubjects;
