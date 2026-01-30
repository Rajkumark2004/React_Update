import React, { useState, useEffect } from 'react';
import '../utils/include_files'; // Ensure generic styles/scripts are loaded

const FollowUpModal = ({ isOpen, onClose, studentId, studentName }) => {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        next_follow_up_date: '',
        response: '',
        note: ''
    });

    const [status, setStatus] = useState('active');

    // Mock summary data
    const [summary, setSummary] = useState({
        assigned_staff: 'Admin User (9001)',
        enquiry_date: '01/01/2026',
        last_follow_up_date: '05/01/2026',
        next_follow_up_date: '10/01/2026',
        phone: '9876543210',
        reference: 'Google',
        source: 'Website',
        email: 'test@example.com',
        address: '123 Main St',
        class: 'Class 1',
        no_of_child: '1',
        description: 'Interested in admission.',
        note: 'Call in evening.',
        created_by: 'Super Admin'
    });

    // Mock timeline data
    const [timeline, setTimeline] = useState([
        { date: '05/01/2026', next_date: '10/01/2026', response: 'Called, parent busy.', note: 'Call back later.', created_by: 'Admin' },
        { date: '01/01/2026', next_date: '05/01/2026', response: 'Initial enquiry.', note: '', created_by: 'System' }
    ]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
        // API call to update status would go here
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate adding to timeline
        const newEntry = {
            date: formData.date,
            next_date: formData.next_follow_up_date,
            response: formData.response,
            note: formData.note,
            created_by: 'Admin' // Current user
        };
        setTimeline([newEntry, ...timeline]);
        setFormData({
            date: new Date().toISOString().split('T')[0],
            next_follow_up_date: '',
            response: '',
            note: ''
        });
        alert('Follow-up saved successfully (Mock)');
    };

    if (!isOpen) return null;

    return (
        <div className="modal fade in" style={{ display: 'block', paddingRight: '17px' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" onClick={onClose}>×</button>
                        <h4 className="modal-title">Follow Up ({studentName || 'Student Name'})</h4>
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            {/* Left Column: Form and Timeline */}
                            <div className="col-lg-8 col-md-8 col-sm-8 paddlr">
                                <form onSubmit={handleSubmit} className="ptt10">
                                    <div className="row">
                                        <div className="col-lg-6 col-md-6 col-sm-6">
                                            <div className="form-group">
                                                <label>Follow Up Date <small className="req"> *</small></label>
                                                <input type="date" name="date" className="form-control" value={formData.date} onChange={handleInputChange} required />
                                            </div>
                                        </div>
                                        <div className="col-lg-6 col-md-6 col-sm-6">
                                            <div className="form-group">
                                                <label>Next Follow Up Date <small className="req"> *</small></label>
                                                <input type="date" name="next_follow_up_date" className="form-control" value={formData.next_follow_up_date} onChange={handleInputChange} required />
                                            </div>
                                        </div>
                                        <div className="col-lg-6 col-md-6 col-sm-6">
                                            <div className="form-group">
                                                <label>Response <small className="req"> *</small></label>
                                                <textarea name="response" className="form-control" value={formData.response} onChange={handleInputChange} required></textarea>
                                            </div>
                                        </div>
                                        <div className="col-lg-6 col-md-6 col-sm-6">
                                            <div className="form-group">
                                                <label>Note</label>
                                                <textarea name="note" className="form-control" value={formData.note} onChange={handleInputChange}></textarea>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="box-footer pr0 text-right">
                                        <button type="submit" className="btn btn-info" id="submit">Save</button>
                                    </div>
                                </form>

                                <div className="ptbnull">
                                    <h4 className="box-title titlefix pb5">Follow Up List</h4>
                                </div>
                                <div className="pt20">
                                    <div className="tab-pane active" id="timeline">
                                        {/* Timeline simulation */}
                                        <ul className="timeline timeline-inverse">
                                            {timeline.map((item, index) => (
                                                <li key={index} className="time-label">
                                                    <span className="bg-blue"> {item.date} </span>
                                                </li>
                                            ))}
                                            {timeline.map((item, index) => (
                                                <li key={'item-' + index}>
                                                    <i className="fa fa-list-alt bg-blue"></i>
                                                    <div className="timeline-item">
                                                        <span className="time"><i className="fa fa-clock-o"></i> {item.date}</span>
                                                        <h3 className="timeline-header"><a href="#">{item.created_by}</a> added a follow up</h3>
                                                        <div className="timeline-body">
                                                            {item.response}
                                                            <br />
                                                            <i>{item.note}</i>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                            <li>
                                                <i className="fa fa-clock-o bg-gray"></i>
                                            </li>
                                        </ul>
                                        {/* Simple list fallback if timeline CSS isn't perfect */}
                                        <div style={{ marginTop: '20px' }}>
                                            <table className="table table-striped">
                                                <thead>
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Next Date</th>
                                                        <th>Response</th>
                                                        <th>By</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {timeline.map((t, i) => (
                                                        <tr key={i}>
                                                            <td>{t.date}</td>
                                                            <td>{t.next_date}</td>
                                                            <td>{t.response} <br /> <small>{t.note}</small></td>
                                                            <td>{t.created_by}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Summary */}
                            <div className="col-lg-4 col-md-4 col-sm-4 col-eq">
                                <div className="taskside" style={{ background: '#f9f9f9', padding: '10px', border: '1px solid #ddd' }}>
                                    <h4>Summary
                                        <div style={{ fontSize: '15px' }} className="box-tools pull-right">
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <select className="form-control" value={status} onChange={handleStatusChange}>
                                                    <option value="active">Active</option>
                                                    <option value="won">Won</option>
                                                    <option value="passive">Passive</option>
                                                    <option value="lost">Lost</option>
                                                    <option value="dead">Dead</option>
                                                </select>
                                            </div>
                                        </div>
                                    </h4>
                                    <h5 className="pt0 task-info-created">
                                        <small className="text-dark"> <b>Assigned</b>: <span className="text-dark">{summary.assigned_staff}</span></small>
                                    </h5>
                                    <hr className="taskseparator" />

                                    <div className="task-info task-single-inline-wrap">
                                        <h5><i className="fa fa-calendar-plus-o pull-left fa-margin"></i> <span className="text-dark">Enquiry Date:</span> {summary.enquiry_date}</h5>
                                    </div>
                                    <div className="task-info task-single-inline-wrap">
                                        <h5><i className="fa fa-calendar-plus-o pull-left fa-margin"></i> <span className="text-dark">Last Follow Up:</span> {summary.last_follow_up_date}</h5>
                                    </div>
                                    <div className="task-info task-single-inline-wrap">
                                        <h5><i className="fa fa-calendar-plus-o pull-left fa-margin"></i> <span className="text-dark">Next Follow Up:</span> {summary.next_follow_up_date}</h5>
                                    </div>

                                    <div className="task-info task-single-inline-wrap ptt10">
                                        <h5><span className="text-dark">Phone:</span> {summary.phone}</h5>
                                        <h5><span className="text-dark">Reference:</span> {summary.reference}</h5>
                                        <h5><span className="text-dark">Source:</span> {summary.source}</h5>
                                        <h5><span className="text-dark">Email:</span> {summary.email}</h5>
                                        <h5><span className="text-dark">Address:</span> {summary.address}</h5>
                                        <h5><span className="text-dark">Class:</span> {summary.class}</h5>
                                        <h5><span className="text-dark">No of Child:</span> {summary.no_of_child}</h5>
                                        <h5><span className="text-dark">Description:</span> {summary.description}</h5>
                                        <h5><span className="text-dark">Note:</span> {summary.note}</h5>
                                        <h5><span className="text-dark">Created By:</span> {summary.created_by}</h5>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade in"></div>
        </div>
    );
};

export default FollowUpModal;
