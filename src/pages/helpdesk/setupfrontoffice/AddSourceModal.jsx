import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../../services/api';
import { sanitizeAlphaWithSpaces, validateSource } from '../../../utils/validation';

const AddSourceModal = ({ show, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        source: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);

    if (!show) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let sanitized = value;
        if (name === 'source') sanitized = sanitizeAlphaWithSpaces(value);
        setFormData({ ...formData, [name]: sanitized });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const sourceErr = validateSource(formData.source);
        if (sourceErr) {
            toast.error(sourceErr);
            return;
        }

        setLoading(true);
        try {
            const response = await api.addSource(formData);
            toast.success(response.message || 'Source added successfully');
            setFormData({ source: '', description: '' });
            onSuccess();
        } catch (error) {
            toast.error(error.message || 'An error occurred while saving');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="modal fade in" style={{ display: 'block', paddingRight: '17px', zIndex: 1050 }}>
                <div className="modal-dialog" style={{ marginTop: '100px', maxWidth: '500px' }}>
                    <div className="modal-content" style={{ borderRadius: '12px', overflow: 'hidden', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
                            <button type="button" className="close" onClick={onClose} style={{ fontSize: '24px', color: '#94a3b8' }}>×</button>
                            <h4 className="modal-title" style={{ fontWeight: '600', color: '#1e293b', fontSize: '18px' }}>Add Source</h4>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body" style={{ padding: '24px' }}>
                                <div className="form-group" style={{ marginBottom: '20px' }}>
                                    <label style={{ color: '#475569', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Source <small className="req" style={{ color: '#ef4444' }}>*</small></label>
                                    <input
                                        className="form-control"
                                        name="source"
                                        maxLength={100}
                                        value={formData.source}
                                        onChange={handleInputChange}
                                        required
                                        style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '44px', padding: '10px 14px' }}
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: '0' }}>
                                    <label style={{ color: '#475569', fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Description</label>
                                    <textarea
                                        className="form-control"
                                        name="description"
                                        rows="4"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        style={{ borderRadius: '8px', border: '1px solid #e2e8f0', padding: '10px 14px', resize: 'none' }}
                                    ></textarea>
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

export default AddSourceModal;
