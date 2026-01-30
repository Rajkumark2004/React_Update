import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import '../../utils/include_files';
import { useSession } from '../../context/SessionContext';

const ExamSubjects = () => {
    const { id: examId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [examIdVal, setExamIdVal] = useState(examId || '');
    const [rows, setRows] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [examDetail, setExamDetail] = useState({ name: '', class_sections: '' });

    // Mock data for subjects
    const mockSubjects = [
        { id: '1', name: 'Telugu' },
        { id: '2', name: 'Hindi' },
        { id: '3', name: 'English' },
        { id: '4', name: 'Maths' },
        { id: '5', name: 'Science' },
        { id: '6', name: 'Social Studies' },
        { id: '7', name: 'EVS' },
        { id: '8', name: 'DANCE' },
        { id: '9', name: 'ALL SUBJECTS' },




    ];

    // Mock initial exam subjects
    const mockExamSubjects = [
        { id: '101', subject_id: '1', date: '2025-05-15', time_from: '09:00 AM', duration: '180', room_no: '101' },
        { id: '102', subject_id: '2', date: '2025-05-17', time_from: '09:00 AM', duration: '180', room_no: '102' },
    ];

    useEffect(() => {
        // Simulate fetching exam details and subjects
        setLoading(true);
        setTimeout(() => {
            setSubjects(mockSubjects);
            setExamDetail({
                name: 'First Term Exam',
                class_sections: 'Class 1 (A, B)'
            });

            // Convert initial data to rows state
            const initialRows = mockExamSubjects.map((item, index) => ({
                id: Date.now() + index,
                prev_id: item.id,
                subject_id: item.subject_id,
                date: item.date,
                time_from: item.time_from,
                duration: item.duration,
                room_no: item.room_no
            }));

            if (initialRows.length === 0) {
                // Add one empty row if no subjects exist
                initialRows.push(createEmptyRow());
            }

            setRows(initialRows);
            setLoading(false);
        }, 500);
    }, [examId]);

    const createEmptyRow = () => ({
        id: Date.now(),
        prev_id: '',
        subject_id: '',
        date: '',
        time_from: '',
        duration: '',
        room_no: ''
    });

    const addRow = () => {
        setRows([...rows, createEmptyRow()]);
    };

    const removeRow = (id) => {
        setRows(rows.filter(row => row.id !== id));
    };

    const handleInputChange = (id, field, value) => {
        setRows(rows.map(row =>
            row.id === id ? { ...row, [field]: value } : row
        ));
    };

    const handleSave = (e) => {
        e.preventDefault();
        console.log('Saving exam subjects:', rows);
        alert('Exam subjects saved successfully!');
        navigate('/cbseexam/exam');
    };

    const handleClose = () => {
        navigate('/cbseexam/exam');
    };

    return (
        <div className="modal show" style={{ display: 'block', background: '#fff', minHeight: '100vh', zIndex: 1050 }}>
            <div className="modal-dialog modal-xl" style={{ width: '100%', maxWidth: '100%', margin: 0, height: '100%' }}>
                <div className="modal-content" style={{ border: 'none', borderRadius: 0, boxShadow: 'none', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

                    <div className="modal-header" style={{ borderBottom: '1px solid #f4f4f4', padding: '15px', position: 'relative' }}>
                        <button
                            type="button"
                            className="close"
                            onClick={handleClose}
                            style={{
                                position: 'absolute',
                                right: '15px',
                                top: '15px',
                                opacity: 1,
                                color: '#000',
                                fontSize: '28px',
                                lineHeight: '1',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer'
                            }}
                        >
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <h4 className="modal-title" style={{ fontWeight: 'bold' }}>
                            Add Exam Subject
                        </h4>
                    </div>

                    <div className="modal-body" style={{ flex: 1, padding: '15px' }}>
                        {loading ? (
                            <div className="text-center" style={{ padding: '50px' }}>
                                <i className="fa fa-spinner fa-spin fa-3x"></i>
                                <p style={{ marginTop: '10px' }}>Loading exam subjects...</p>
                            </div>
                        ) : (
                            <div className="autoscroll">
                                <div className="row pb10">
                                    <div className="col-lg-2 col-md-3 col-sm-12">
                                        <p className="examinfo" style={{ marginBottom: '5px' }}><span style={{ fontWeight: 'bold', marginRight: '5px' }}>Exam:</span>{examDetail.name}</p>
                                    </div>
                                    <div className="col-lg-10 col-md-9 col-sm-12">
                                        <p className="examinfo" style={{ marginBottom: '5px' }}><span style={{ fontWeight: 'bold', marginRight: '5px' }}>Class (Section):</span>{examDetail.class_sections}</p>
                                    </div>
                                </div>
                                <div className="divider2" style={{ height: '1px', background: '#eee', margin: '10px 0' }}></div>

                                <div className="row">
                                    <div className="col-md-12 pt5">
                                        <button
                                            type="button"
                                            onClick={addRow}
                                            className="btn btn-primary btn-sm pull-right"
                                            style={{ marginBottom: '10px' }}
                                        >
                                            <span className="fa fa-plus"></span> Add Exam Subject
                                        </button>
                                    </div>
                                </div>

                                <form onSubmit={handleSave} className="ssaddSubject ptt10">
                                    <input type="hidden" name="exam_id" value={examIdVal} />
                                    <div className="table-responsive">
                                        <table className="table table-bordered" id="item_table">
                                            <thead>
                                                <tr>
                                                    <th style={{ whiteSpace: 'nowrap' }}>Subject<small className="req"> *</small></th>
                                                    <th style={{ whiteSpace: 'nowrap' }}>Date<small className="req"> *</small></th>
                                                    <th style={{ whiteSpace: 'nowrap' }}>Start Time<small className="req"> *</small></th>
                                                    <th style={{ whiteSpace: 'nowrap' }}>Duration (Minute)<small className="req"> *</small></th>
                                                    <th style={{ whiteSpace: 'nowrap' }}>Room No<small className="req"> *</small></th>
                                                    <th className="text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rows.map((row, index) => (
                                                    <tr key={row.id}>
                                                        <td>
                                                            <select
                                                                className="form-control"
                                                                style={{ minWidth: '200px' }}
                                                                value={row.subject_id}
                                                                onChange={(e) => handleInputChange(row.id, 'subject_id', e.target.value)}
                                                                required
                                                            >
                                                                <option value="">Select</option>
                                                                {subjects.map(sub => (
                                                                    <option key={sub.id} value={sub.id}>
                                                                        {sub.name}{sub.code ? ` (${sub.code})` : ''}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <div className="input-group">
                                                                <input
                                                                    className="form-control"
                                                                    type="date"
                                                                    style={{ minWidth: '200px' }}
                                                                    value={row.date}
                                                                    onChange={(e) => handleInputChange(row.id, 'date', e.target.value)}
                                                                    required
                                                                />
                                                                <span className="input-group-addon">
                                                                    <i className="fa fa-calendar"></i>
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="input-group">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    placeholder="09:00 AM"
                                                                    style={{ minWidth: '200px' }}
                                                                    value={row.time_from}
                                                                    onChange={(e) => handleInputChange(row.id, 'time_from', e.target.value)}
                                                                    required
                                                                />
                                                                <span className="input-group-addon">
                                                                    <i className="fa fa-clock-o"></i>
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                style={{ minWidth: '200px' }}
                                                                value={row.duration}
                                                                onChange={(e) => handleInputChange(row.id, 'duration', e.target.value)}
                                                                required
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                className="form-control"
                                                                type="text"
                                                                style={{ minWidth: '100px' }}
                                                                value={row.room_no}
                                                                onChange={(e) => handleInputChange(row.id, 'room_no', e.target.value)}
                                                                required
                                                            />
                                                            <input type="hidden" name={`prev_row_${index}`} value={row.prev_id} />
                                                        </td>
                                                        <td className="text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeRow(row.id)}
                                                                className="btn btn-link text-danger"
                                                                style={{ padding: 0 }}
                                                            >
                                                                <i className="fa fa-times" style={{ fontSize: '18px' }}></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="modal-footer" style={{ borderTop: '1px solid #f4f4f4', padding: '15px 0 0 0', marginTop: '15px' }}>
                                        <button type="submit" className="btn btn-primary pull-right">
                                            Save
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

export default ExamSubjects;
