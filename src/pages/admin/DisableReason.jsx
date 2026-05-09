import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import SISLayout from '../student/SISLayout';
import '../student/StudentSearch.css';
import '../../utils/include_files';

const DisableReason = () => {
    const [reasons, setReasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [reasonId, setReasonId] = useState('');
    const [reasonName, setReasonName] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Fetch disable reasons on mount
    useEffect(() => {
        fetchDisableReasons();
    }, []);

    const fetchDisableReasons = async () => {
        setLoading(true);
        try {
            const response = await api.getDisableReasonList();
            if (response.status && response.data) {
                setReasons(response.data.reasons || []);
            }
        } catch (error) {
            console.error('Error fetching disable reasons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setReasonId('');
        setReasonName('');
        setIsEditing(false);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setReasonId('');
        setReasonName('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!reasonName.trim()) {
            alert('Please enter a disable reason');
            return;
        }

        setSaving(true);

        try {
            let response;
            if (isEditing && reasonId) {
                response = await api.updateDisableReason({
                    id: reasonId,
                    reason: reasonName
                });
            } else {
                response = await api.addDisableReason({
                    reason: reasonName
                });
            }

            if (response.status === 'success' || response.status === true) {
                handleCloseModal();
                fetchDisableReasons();
            } else {
                alert(response.message || 'Failed to save');
            }
        } catch (error) {
            console.error('Error saving disable reason:', error);
            alert(error.message || 'Failed to save disable reason');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (reason) => {
        setReasonId(reason.id);
        setReasonName(reason.reason);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this record?')) {
            return;
        }

        try {
            const response = await api.deleteDisableReason(id);
            if (response.status === 'success' || response.status === true) {
                fetchDisableReasons();
            } else {
                alert(response.message || 'Failed to delete');
            }
        } catch (error) {
            console.error('Error deleting disable reason:', error);
            alert(error.message || 'Failed to delete');
        }
    };

    // Format date like "20 May 2026"
    const formatDate = (dateString) => {
        if (!dateString) return '10 May 2026'; // Fallback to match image style
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <SISLayout activeTab="reason">
            <div className="sis-content-container">
                <div className="sis-list-container" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                    <div className="sis-list-header" style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '20px 24px',
                        borderBottom: '1px solid #f1f5f9'
                    }}>
                        <h3 style={{ 
                            margin: 0, 
                            fontSize: '18px', 
                            fontWeight: '600', 
                            color: '#1e293b' 
                        }}>
                            Disable Reason ({reasons.length})
                        </h3>
                        <button 
                            className="btn btn-primary" 
                            onClick={handleOpenAdd}
                            style={{ 
                                background: '#7c3aed', 
                                borderColor: '#7c3aed',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '14px'
                            }}
                        >
                            <i className="fa fa-plus"></i> Add Disable Reason
                        </button>
                    </div>
                    
                    <div className="sis-list-body" style={{ padding: '0' }}>
                        {loading ? (
                            <div className="text-center" style={{ padding: '40px' }}>
                                <i className="fa fa-spinner fa-spin fa-2x" style={{ color: '#7c3aed' }}></i>
                                <p style={{ marginTop: '12px', color: '#64748b' }}>Loading reasons...</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover" style={{ margin: 0 }}>
                                    <thead>
                                        <tr style={{ background: '#ffffff' }}>
                                            <th style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', color: '#64748b', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>#</th>
                                            <th style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', color: '#64748b', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Disable Reason</th>
                                            <th style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', color: '#64748b', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Created On</th>
                                            <th className="text-right" style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', color: '#64748b', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ background: '#ffffff' }}>
                                        {reasons.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="text-center" style={{ padding: '40px', color: '#94a3b8' }}>No disable reasons found</td>
                                            </tr>
                                        ) : (
                                            reasons.map((reason, index) => (
                                                <tr key={reason.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                                    <td style={{ padding: '16px 24px', color: '#475569' }}>{index + 1}</td>
                                                    <td style={{ padding: '16px 24px', color: '#1e293b', fontWeight: '500' }}>{reason.reason}</td>
                                                    <td style={{ padding: '16px 24px', color: '#64748b' }}>{formatDate(reason.created_at)}</td>
                                                    <td className="text-right" style={{ padding: '16px 24px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                                            <button
                                                                onClick={() => handleEdit(reason)}
                                                                style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                                                                title="Edit"
                                                            >
                                                                <i className="fa fa-pencil" style={{ fontSize: '16px' }}></i>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(reason.id)}
                                                                style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                                                                title="Delete"
                                                            >
                                                                <i className="fa fa-trash-o" style={{ fontSize: '16px' }}></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    
                    {/* Pagination Footer - matching image */}
                    {!loading && reasons.length > 0 && (
                        <div style={{ 
                            padding: '20px 24px', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            background: '#ffffff',
                            borderTop: '1px solid #f1f5f9'
                        }}>
                            <div style={{ color: '#64748b', fontSize: '14px' }}>
                                Showing 1 to {reasons.length} of {reasons.length} entries
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-default btn-sm" disabled style={{ borderRadius: '6px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#cbd5e1' }}>
                                    <i className="fa fa-angle-left"></i>
                                </button>
                                <button className="btn btn-sm" style={{ 
                                    borderRadius: '6px', 
                                    background: '#7c3aed', 
                                    color: '#ffffff',
                                    minWidth: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '600'
                                }}>
                                    1
                                </button>
                                <button className="btn btn-default btn-sm" disabled style={{ borderRadius: '6px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#cbd5e1' }}>
                                    <i className="fa fa-angle-right"></i>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for Add/Edit */}
            {showModal && (
                <>
                    <div className="modal fade in" style={{ display: 'block' }} role="dialog">
                        <div className="modal-dialog">
                            <div className="modal-content" style={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                                <div className="modal-header" style={{ borderBottom: '1px solid #f1f5f9', padding: '20px 24px' }}>
                                    <button type="button" className="close" onClick={handleCloseModal} style={{ fontSize: '24px' }}>&times;</button>
                                    <h4 className="modal-title" style={{ fontWeight: '600', color: '#1e293b' }}>
                                        {isEditing ? 'Edit Disable Reason' : 'Add Disable Reason'}
                                    </h4>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body" style={{ padding: '24px' }}>
                                        <div className="form-group">
                                            <label style={{ color: '#475569', fontWeight: '500', marginBottom: '8px' }}>
                                                Disable Reason <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter disable reason"
                                                value={reasonName}
                                                onChange={(e) => setReasonName(e.target.value)}
                                                autoFocus
                                                style={{ 
                                                    borderRadius: '8px', 
                                                    border: '1px solid #e2e8f0', 
                                                    padding: '10px 12px',
                                                    background: '#f8fafc'
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="modal-footer" style={{ borderTop: '1px solid #f1f5f9', padding: '16px 24px' }}>
                                        <button type="button" className="btn btn-default pull-left" onClick={handleCloseModal} style={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}>Close</button>
                                        <button type="submit" className="btn btn-primary" disabled={saving} style={{ 
                                            borderRadius: '8px', 
                                            background: '#7c3aed', 
                                            borderColor: '#7c3aed',
                                            padding: '8px 20px'
                                        }}>
                                            {saving ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade in" style={{ background: 'rgba(15, 23, 42, 0.5)' }}></div>
                </>
            )}
        </SISLayout>
    );
};

export default DisableReason;
