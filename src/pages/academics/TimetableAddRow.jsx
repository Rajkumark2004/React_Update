import React, { useState, useEffect } from 'react';

const TimetableAddRow = ({
    day,
    classId,
    sectionId,
    subjectGroupId,
    subjects = [],
    staffs = [],
    initialRecords = [],
    onSave
}) => {
    const [rows, setRows] = useState([]);

    useEffect(() => {
        if (initialRecords && initialRecords.length > 0) {
            setRows(initialRecords.map((rec, index) => ({
                id: rec.id || index + 1,
                subject_id: rec.subject_group_subject_id || rec.subject_id || '',
                staff_id: rec.staff_id || '',
                time_from: rec.time_from || '',
                time_to: rec.time_to || '',
                room_no: rec.room_no || '',
                prev_id: rec.id || '0'
            })));
        } else {
            // Add one empty row by default if no records
            handleAddRow();
        }
    }, [initialRecords]);

    const handleAddRow = () => {
        setRows(prev => [
            ...prev,
            {
                id: Date.now(), // Local key
                subject_id: '',
                staff_id: '',
                time_from: '',
                time_to: '',
                room_no: '',
                prev_id: '0'
            }
        ]);
    };

    const handleDeleteRow = (index) => {
        if (window.confirm('Are you sure you want to delete this row?')) {
            const updatedRows = [...rows];
            updatedRows.splice(index, 1);
            setRows(updatedRows);
        }
    };

    const handleInputChange = (index, field, value) => {
        const updatedRows = [...rows];
        updatedRows[index][field] = value;
        setRows(updatedRows);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSave) {
            onSave({
                day,
                class_id: classId,
                section_id: sectionId,
                subject_group_id: subjectGroupId,
                rows: rows
            });
        }
    };

    return (
        <>
            <style>
                {`
                    .relative label.text-danger { position: absolute; left: 5px; bottom: 0; }
                    .tablewidthRS { width: 100% !important; }
                    .astrike { color: red; }
                `}
            </style>
            <div className="row clearfix">
                <div className="col-md-12 column">
                    <button
                        type="button"
                        onClick={handleAddRow}
                        className="addrow addbtnright btn btn-primary btn-sm pull-right"
                        style={{ marginBottom: '10px' }}
                    >
                        <i className="fa fa-plus"></i> Add New
                    </button>
                    <form method="POST" onSubmit={handleSubmit} className="commentForm autoscroll">
                        <input type="hidden" name="day" value={day} />
                        <input type="hidden" name="class_id" value={classId} />
                        <input type="hidden" name="section_id" value={sectionId} />
                        <input type="hidden" name="subject_group_id" value={subjectGroupId} />

                        <div className="table-responsive">
                            <table className="table table-bordered table-hover order-list tablewidthRS" id="tab_logic">
                                <thead>
                                    <tr>
                                        <th>Subject</th>
                                        <th>Teacher</th>
                                        <th>Time From<small className="astrike"> *</small></th>
                                        <th>Time To<small className="astrike"> *</small></th>
                                        <th>Room No</th>
                                        <th className="text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, index) => (
                                        <tr key={row.id}>
                                            <td className="relative">
                                                <input type="hidden" name="total_row[]" value={index + 1} />
                                                <input type="hidden" name={`prev_id_${index + 1}`} value={row.prev_id} />
                                                <select
                                                    className="form-control subject"
                                                    value={row.subject_id}
                                                    onChange={(e) => handleInputChange(index, 'subject_id', e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select</option>
                                                    {subjects.map(sub => (
                                                        <option key={sub.id} value={sub.id}>
                                                            {sub.name} {sub.code ? `(${sub.code})` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="relative">
                                                <select
                                                    className="form-control staff"
                                                    value={row.staff_id}
                                                    onChange={(e) => handleInputChange(index, 'staff_id', e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select</option>
                                                    {staffs.map(staff => (
                                                        <option key={staff.id} value={staff.id}>
                                                            {staff.name} {staff.surname || ''} ({staff.employee_id || staff.id})
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <div className="input-group">
                                                    <input
                                                        type="text"
                                                        className="form-control time_from time"
                                                        value={row.time_from}
                                                        onChange={(e) => handleInputChange(index, 'time_from', e.target.value)}
                                                        required
                                                    />
                                                    <div className="input-group-addon">
                                                        <span className="fa fa-clock-o"></span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="input-group">
                                                    <input
                                                        type="text"
                                                        className="form-control time_to time"
                                                        value={row.time_to}
                                                        onChange={(e) => handleInputChange(index, 'time_to', e.target.value)}
                                                        required
                                                    />
                                                    <div className="input-group-addon">
                                                        <span className="fa fa-clock-o"></span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-control room_no"
                                                    placeholder="Room no"
                                                    value={row.room_no}
                                                    onChange={(e) => handleInputChange(index, 'room_no', e.target.value)}
                                                    required
                                                />
                                            </td>
                                            <td className="text-right">
                                                <button
                                                    type="button"
                                                    className="ibtnDel btn btn-danger btn-sm"
                                                    onClick={() => handleDeleteRow(index)}
                                                >
                                                    <i className="fa fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button className="btn btn-primary btn-sm pull-right" type="submit">
                            <i className="fa fa-save"></i> Save
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default TimetableAddRow;
