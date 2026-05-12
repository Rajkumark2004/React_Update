import React, { useState } from 'react';
import toast from 'react-hot-toast';

const AddVisitorModal = ({ show, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        purpose: '',
        meeting_with: '',
        visitor_name: '',
        phone: '',
        id_card: '',
        number_of_person: '',
        date: new Date().toISOString().split('T')[0],
        in_time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        out_time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
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
        if (!formData.purpose || !formData.visitor_name) {
            toast.error('Please fill all required fields');
            return;
        }
        setLoading(true);
        // Mock save - just add to local state
        setTimeout(() => {
            setLoading(false);
            toast.success('Visitor added successfully');
            onSuccess(formData);
            setFormData({
                purpose: '',
                meeting_with: '',
                visitor_name: '',
                phone: '',
                id_card: '',
                number_of_person: '',
                date: new Date().toISOString().split('T')[0],
                in_time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                out_time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                note: ''
            });
        }, 500);
    };

    return (
        <>
            <div className="modal fade in" style={{ display: 'block', paddingRight: '17px', zIndex: 1050, overflowY: 'auto' }}>
                <div className="modal-dialog" style={{ marginTop: '80px', maxWidth: '700px' }}>
                    <div className="modal-content" style={{ borderRadius: '12px', overflow: 'hidden', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
                            <button type="button" className="close" onClick={onClose} style={{ fontSize: '24px', color: '#94a3b8' }}>×</button>
                            <h4 className="modal-title" style={{ fontWeight: '600', color: '#1e293b', fontSize: '18px' }}>Add Visitor</h4>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body" style={{ padding: '24px' }}>
                                <div className="row" style={{ marginBottom: '16px' }}>
                                    <div className="col-md-4">
                                        <div className="form-group" style={{ marginBottom: '16px' }}>
                                            <label style={{ color: '#475569', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Purpose <small className="req" style={{ color: '#ef4444' }}>*</small></label>
                                            <select className="form-control" name="purpose" value={formData.purpose} onChange={handleInputChange} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '44px' }}>
                                                <option value="">Select</option>
                                                <option value="permission">Permission</option>
                                                <option value="HEALTH ISSUE">Health Issue</option>
                                                <option value="VISITING">Visiting</option>
                                                <option value="AAA">AAA</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group" style={{ marginBottom: '16px' }}>
                                            <label style={{ color: '#475569', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Meeting With <small className="req" style={{ color: '#ef4444' }}>*</small></label>
                                            <select className="form-control" name="meeting_with" value={formData.meeting_with} onChange={handleInputChange} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '44px' }}>
                                                <option value="">Select</option>
                                                <option value="Staff (Agent One - SBD003)">Staff (Agent One - SBD003)</option>
                                                <option value="Staff (Super Admin - 9000)">Staff (Super Admin - 9000)</option>
                                                <option value="Staff (admin - admin001)">Staff (admin - admin001)</option>
                                                <option value="Staff (Sunil - 1876)">Staff (Sunil - 1876)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group" style={{ marginBottom: '16px' }}>
                                            <label style={{ color: '#475569', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Visitor Name <small className="req" style={{ color: '#ef4444' }}>*</small></label>
                                            <input className="form-control" name="visitor_name" value={formData.visitor_name} onChange={handleInputChange} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '44px', padding: '10px 14px' }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="row" style={{ marginBottom: '16px' }}>
                                    <div className="col-md-4">
                                        <div className="form-group" style={{ marginBottom: '16px' }}>
                                            <label style={{ color: '#475569', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Phone</label>
                                            <input className="form-control" name="phone" value={formData.phone} onChange={handleInputChange} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '44px', padding: '10px 14px' }} />
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group" style={{ marginBottom: '16px' }}>
                                            <label style={{ color: '#475569', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>ID Card</label>
                                            <input className="form-control" name="id_card" value={formData.id_card} onChange={handleInputChange} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '44px', padding: '10px 14px' }} />
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group" style={{ marginBottom: '16px' }}>
                                            <label style={{ color: '#475569', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Number Of Person</label>
                                            <input className="form-control" name="number_of_person" type="number" value={formData.number_of_person} onChange={handleInputChange} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '44px', padding: '10px 14px' }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="row" style={{ marginBottom: '16px' }}>
                                    <div className="col-md-4">
                                        <div className="form-group" style={{ marginBottom: '16px' }}>
                                            <label style={{ color: '#475569', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Date <small className="req" style={{ color: '#ef4444' }}>*</small></label>
                                            <input className="form-control" name="date" type="date" value={formData.date} onChange={handleInputChange} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '44px', padding: '10px 14px' }} />
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group" style={{ marginBottom: '16px' }}>
                                            <label style={{ color: '#475569', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>In Time</label>
                                            <input className="form-control" name="in_time" type="time" value={formData.in_time} onChange={handleInputChange} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '44px', padding: '10px 14px' }} />
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group" style={{ marginBottom: '16px' }}>
                                            <label style={{ color: '#475569', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Out Time</label>
                                            <input className="form-control" name="out_time" type="time" value={formData.out_time} onChange={handleInputChange} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '44px', padding: '10px 14px' }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="form-group" style={{ marginBottom: '0' }}>
                                            <label style={{ color: '#475569', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Note</label>
                                            <textarea className="form-control" name="note" rows="3" value={formData.note} onChange={handleInputChange} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', padding: '10px 14px', resize: 'none' }}></textarea>
                                        </div>
                                    </div>
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

export default AddVisitorModal;
