import React, { useState } from 'react';
import toast from 'react-hot-toast';

const AddComplainModal = ({ show, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        complaint_type: '',
        source: '',
        complain_by: '',
        phone: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        action_taken: '',
        assigned: '',
        note: ''
    });
    const [loading, setLoading] = useState(false);

    if (!show) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.complaint_type || !formData.complain_by) {
            toast.error('Please fill all required fields');
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success('Complaint added successfully');
            onSuccess(formData);
            setFormData({
                complaint_type: '',
                source: '',
                complain_by: '',
                phone: '',
                date: new Date().toISOString().split('T')[0],
                description: '',
                action_taken: '',
                assigned: '',
                note: ''
            });
        }, 500);
    };

    return (
        <>
            <div className="modal fade in" style={{ display: 'block', paddingRight: '17px', zIndex: 1050, overflowY: 'auto' }}>
                <div className="modal-dialog" style={{ marginTop: '80px', maxWidth: '600px' }}>
                    <div className="modal-content" style={{ borderRadius: '12px', overflow: 'hidden', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
                            <button type="button" className="close" onClick={onClose} style={{ fontSize: '24px', color: '#94a3b8' }}>×</button>
                            <h4 className="modal-title" style={{ fontWeight: '600', color: '#1e293b', fontSize: '18px' }}>Add Complain</h4>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body" style={{ padding: '24px' }}>
                                <div className="row" style={{ marginBottom: '16px' }}>
                                    <div className="col-md-6">
                                        <div className="form-group" style={{ marginBottom: '16px' }}>
                                            <label style={{ color: '#475569', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Complaint Type <small className="req" style={{ color: '#ef4444' }}>*</small></label>
                                            <select className="form-control" name="complaint_type" value={formData.complaint_type} onChange={handleInputChange} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '44px' }}>
                                                <option value="">Select</option>
                                                <option value="Students">Students</option>
                                                <option value="Staff">Staff</option>
                                                <option value="Infrastructure">Infrastructure</option>
                                                <option value="Others">Others</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group" style={{ marginBottom: '16px' }}>
                                            <label style={{ color: '#475569', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Source</label>
                                            <select className="form-control" name="source" value={formData.source} onChange={handleInputChange} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '44px' }}>
                                                <option value="">Select</option>
                                                <option value="Online">Online</option>
                                                <option value="Phone">Phone</option>
                                                <option value="In Person">In Person</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="row" style={{ marginBottom: '16px' }}>
                                    <div className="col-md-6">
                                        <div className="form-group" style={{ marginBottom: '16px' }}>
                                            <label style={{ color: '#475569', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Complain By <small className="req" style={{ color: '#ef4444' }}>*</small></label>
                                            <input className="form-control" name="complain_by" value={formData.complain_by} onChange={handleInputChange} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '44px', padding: '10px 14px' }} />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group" style={{ marginBottom: '16px' }}>
                                            <label style={{ color: '#475569', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Phone</label>
                                            <input className="form-control" name="phone" value={formData.phone} onChange={handleInputChange} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '44px', padding: '10px 14px' }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="row" style={{ marginBottom: '16px' }}>
                                    <div className="col-md-6">
                                        <div className="form-group" style={{ marginBottom: '16px' }}>
                                            <label style={{ color: '#475569', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Date <small className="req" style={{ color: '#ef4444' }}>*</small></label>
                                            <input className="form-control" name="date" type="date" value={formData.date} onChange={handleInputChange} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '44px', padding: '10px 14px' }} />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group" style={{ marginBottom: '16px' }}>
                                            <label style={{ color: '#475569', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Assigned</label>
                                            <input className="form-control" name="assigned" value={formData.assigned} onChange={handleInputChange} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '44px', padding: '10px 14px' }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ color: '#475569', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Description</label>
                                    <textarea className="form-control" name="description" rows="3" value={formData.description} onChange={handleInputChange} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', padding: '10px 14px', resize: 'none' }}></textarea>
                                </div>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ color: '#475569', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Action Taken</label>
                                    <textarea className="form-control" name="action_taken" rows="2" value={formData.action_taken} onChange={handleInputChange} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', padding: '10px 14px', resize: 'none' }}></textarea>
                                </div>
                                <div className="form-group" style={{ marginBottom: '0' }}>
                                    <label style={{ color: '#475569', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Note</label>
                                    <textarea className="form-control" name="note" rows="2" value={formData.note} onChange={handleInputChange} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', padding: '10px 14px', resize: 'none' }}></textarea>
                                </div>
                            </div>
                            <div className="modal-footer" style={{ borderTop: 'none', padding: '0 24px 24px 24px', display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="submit" className="btn" disabled={loading} style={{ backgroundColor: '#7c3aed', color: '#fff', padding: '10px 30px', borderRadius: '8px', fontWeight: '600', border: 'none', boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.2)' }}>
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade in" style={{ opacity: '0.5' }}></div>
        </>
    );
};

export default AddComplainModal;
