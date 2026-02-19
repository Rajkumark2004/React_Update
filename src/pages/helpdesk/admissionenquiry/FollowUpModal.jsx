import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';

const FollowUpModal = ({ show, onClose, enquiry }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    follow_up_date: '',
    next_follow_up_date: '',
    response: '',
    note: '',
    status: 'active'
  });

  const [summary, setSummary] = useState({});
  const [history, setHistory] = useState([]);
  const [statusOptions, setStatusOptions] = useState({});

  /* ---------------- Helpers ---------------- */

  const isValidDate = (d) =>
    d && d !== '1970-01-01' && d !== '0000-00-00';

  const toInputDate = (d) => {
    if (!isValidDate(d)) return '';
    const date = new Date(d);
    return isNaN(date) ? '' : date.toISOString().split('T')[0];
  };

  const formatDate = (d) => {
    if (!isValidDate(d)) return '';
    const date = new Date(d);
    return isNaN(date) ? d : date.toLocaleDateString('en-GB');
  };

  /* ---------------- Fetch Follow Up Details ---------------- */

  useEffect(() => {
    if (!show || !enquiry?.id) return;

    setLoading(true);

    Promise.all([
      api.getFollowUpDetails(enquiry.id, enquiry.status),
      api.getFollowUpList(enquiry.id)
    ])
      .then(([detailsRes, listRes]) => {
        const details = detailsRes.data;
        const followList = listRes.data?.follow_up_list || [];
        setHistory(followList);

        setStatusOptions(details.enquiry_status || {});

        // 1️⃣ Find latest valid follow-up from history
        const validFollowUps = followList
          .filter(f => isValidDate(f.follow_up_date))
          .sort((a, b) =>
            new Date(b.follow_up_date) - new Date(a.follow_up_date)
          );

        let nextFollowUpDate = validFollowUps[0]?.follow_up_date || '';

        // 2️⃣ Fallback to enquiry.follow_up_date
        if (!isValidDate(nextFollowUpDate)) {
          nextFollowUpDate = enquiry.follow_up_date || '';
        }

        // 3️⃣ Set FORM data
        setFormData(prev => ({
          ...prev,
          follow_up_date: toInputDate(nextFollowUpDate),
          next_follow_up_date: toInputDate(nextFollowUpDate),
          status: enquiry.status || 'active'
        }));

        // 4️⃣ Set SUMMARY data
        const staff = details.created_by_staff || {};
        setSummary({
          enquiry_date: enquiry.date,
          last_follow_up_date: validFollowUps[0]?.follow_up_date || '',
          next_follow_up_date: nextFollowUpDate,
          phone: enquiry.contact,
          reference: enquiry.reference,
          source: enquiry.source,
          email: enquiry.email,
          address: enquiry.address,
          class: enquiry.classname,
          no_of_child: enquiry.no_of_child,
          description: enquiry.description,
          note: enquiry.note,
          created_by: staff.name
            ? `${staff.name} (${staff.employee_id})`
            : (enquiry.staff_name ? `${enquiry.staff_name} (${enquiry.employee_id})` : '')
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [show, enquiry]);

  /* ---------------- Handlers ---------------- */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!show) return null;

  return (
    <div className="modal fade in" style={{ display: 'block', background: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">

          {/* HEADER */}
          <div className="modal-header">
            <h4>Follow Up Admission Enquiry</h4>
            <button className="close" onClick={onClose}>×</button>
          </div>

          <div className="modal-body">
            {loading ? (
              <div className="text-center">
                <i className="fa fa-spinner fa-spin fa-2x" />
              </div>
            ) : (
              <div className="row">

                {/* LEFT FORM */}
                <div className="col-md-8">
                  <div className="row">

                    <div className="col-md-6">
                      <label>Follow Up Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        name="follow_up_date"
                        value={formData.follow_up_date}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label>Next Follow Up Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        name="next_follow_up_date"
                        value={formData.next_follow_up_date}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="col-md-6 mt-3">
                      <label>Response *</label>
                      <select
                        className="form-control"
                        name="response"
                        value={formData.response}
                        onChange={handleChange}
                      >
                        <option value="">Select</option>
                        <option>Interested</option>
                        <option>Not Interested</option>
                        <option>Call Back Later</option>
                        <option>Not Reachable</option>
                        <option>Admission Confirmed</option>
                        <option>Admission Declined</option>
                      </select>
                    </div>

                    <div className="col-md-6 mt-3">
                      <label>Note</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        name="note"
                        value={formData.note}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-12 text-right mt-4">
                      <button className="btn btn-purple" disabled={saving} onClick={() => { setSaving(true); setTimeout(() => setSaving(false), 5000); }}>{saving ? 'Saving...' : 'Save'}</button>
                    </div>
                  </div>

                  <hr />
                  <h4>Follow Up ({enquiry?.name})</h4>
                  <div className="timeline-container mt-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {history.length === 0 ? (
                      <p className="text-muted">No follow up history found.</p>
                    ) : (
                      <ul className="timeline timeline-inverse">
                        {history.map((item, idx) => (
                          <li key={idx}>
                            <i className="fa fa-phone bg-blue"></i>
                            <div className="timeline-item">
                              <span className="time">
                                <i className="fa fa-clock-o"></i> {item.follow_up_date}
                              </span>
                              <h3 className="timeline-header">
                                <span className="label label-info">{item.response}</span>
                                <span className="ml-2">By: {item.staff_name}</span>
                              </h3>
                              <div className="timeline-body">
                                {item.note || 'No note provided.'}
                              </div>
                              <div className="timeline-footer">
                                <span>Next Follow Up: {item.next_date}</span>
                              </div>
                            </div>
                          </li>
                        ))}
                        <li><i className="fa fa-clock-o bg-gray"></i></li>
                      </ul>
                    )}
                  </div>
                </div>

                {/* RIGHT SUMMARY */}
                <div className="col-md-4">
                  <h4>Summary</h4>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      className="form-control"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      {Object.entries(statusOptions).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>

                  <ul className="list-unstyled mt-3">
                    <li><b>Enquiry Date:</b> {formatDate(summary.enquiry_date)}</li>
                    <li><b>Last Follow Up Date:</b> {formatDate(summary.last_follow_up_date)}</li>
                    <li><b>Next Follow Up Date:</b> {formatDate(summary.next_follow_up_date)}</li>
                    <hr />
                    <li><b>Phone:</b> {summary.phone}</li>
                    <li><b>Reference:</b> {summary.reference}</li>
                    <li><b>Source:</b> {summary.source}</li>
                    <li><b>Email:</b> {summary.email}</li>
                    <li><b>Address:</b> {summary.address}</li>
                    <li><b>Class:</b> {summary.class}</li>
                    <li><b>Number Of Child:</b> {summary.no_of_child}</li>
                    <li><b>Description:</b> {summary.description}</li>
                    <li><b>Note:</b> {summary.note}</li>
                    <li><b>Created By:</b> {summary.created_by}</li>
                  </ul>
                </div>

              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-default" onClick={onClose}>Close</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FollowUpModal;
