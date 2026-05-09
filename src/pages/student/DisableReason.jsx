import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import SISLayout from './SISLayout';
import { useSISCounts } from '../../context/SISCountContext';
import PremiumTableToolbar from '../../utils/PremiumTableToolbar';
import { buildExportData } from '../../utils/tableExport';
import '../student/StudentSearch.css';
import '../../utils/include_files';

const DisableReason = () => {
    const { updateCount } = useSISCounts();
    const [reasons, setReasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [reasonId, setReasonId] = useState('');
    const [reasonName, setReasonName] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 100;

    // Fetch disable reasons on mount
    useEffect(() => {
        fetchDisableReasons();
    }, []);

    const fetchDisableReasons = async () => {
        setLoading(true);
        try {
            const response = await api.getDisableReasonsList();
            if (response && response.data) {
                setReasons(response.data || []);
            } else if (Array.isArray(response)) {
                setReasons(response);
            }
        } catch (error) {
            console.error('Error fetching disable reasons:', error);
        } finally {
            setLoading(false);
        }
    };

    // Update layout count when reasons list changes
    useEffect(() => {
        updateCount('reason', reasons.length);
    }, [reasons.length, updateCount]);

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
                response = await api.updateDisableReason(reasonId, {
                    name: reasonName
                });
            } else {
                response = await api.addDisableReason({
                    name: reasonName
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
        if (!dateString) return '10 May 2026';
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

    const columns = [
        { key: 'index', label: 'Sl. No.' },
        { key: 'reason', label: 'Disable Reason' },
        { key: 'created_at', label: 'Date' }
    ];

    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(col => col.key)));

    const handleToggleColumn = (columnKey) => {
        setVisibleColumns(prev => {
            const newSet = new Set(prev);
            if (newSet.has(columnKey)) {
                newSet.delete(columnKey);
            } else {
                newSet.add(columnKey);
            }
            return newSet;
        });
    };

    const getExportData = () => buildExportData(columns, [], reasons, (row, key, idx) => {
        if (key === 'index') return idx + 1;
        if (key === 'created_at') return formatDate(row[key]);
        return row[key];
    });

    const totalPages = Math.ceil(reasons.length / recordsPerPage);
    const currentReasons = reasons.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <PremiumTableToolbar
                                columns={columns}
                                visibleColumns={visibleColumns}
                                onToggleColumn={handleToggleColumn}
                                getExportData={getExportData}
                                exportFileName="disable_reasons"
                                exportTitle="Disable Reason List"
                            />
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
                                            {columns.filter(col => visibleColumns.has(col.key)).map(col => (
                                                <th key={col.key} style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', color: '#64748b', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>{col.label}</th>
                                            ))}
                                            <th className="text-right" style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', color: '#64748b', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ background: '#ffffff' }}>
                                        {reasons.length === 0 ? (
                                            <tr>
                                                <td colSpan={columns.filter(col => visibleColumns.has(col.key)).length + 1} className="text-center" style={{ padding: '40px', color: '#94a3b8' }}>No disable reasons found</td>
                                            </tr>
                                        ) : (
                                            currentReasons.map((reason, index) => (
                                                <tr key={reason.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                                    {columns.filter(col => visibleColumns.has(col.key)).map(col => (
                                                        <td key={col.key} style={{ padding: '16px 24px', color: col.key === 'reason' ? '#1e293b' : '#64748b', fontWeight: col.key === 'reason' ? '500' : 'normal' }}>
                                                            {col.key === 'index' ? (currentPage - 1) * recordsPerPage + index + 1 :
                                                                col.key === 'created_at' ? formatDate(reason.created_at) :
                                                                    reason[col.key]}
                                                        </td>
                                                    ))}
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

                    {/* Pagination Footer */}
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
                                Showing {(currentPage - 1) * recordsPerPage + 1} to {Math.min(currentPage * recordsPerPage, reasons.length)} of {reasons.length} entries
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    className="btn btn-default btn-sm"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    style={{ borderRadius: '6px', border: '1px solid #e2e8f0', background: '#ffffff', color: currentPage === 1 ? '#cbd5e1' : '#475569' }}
                                >
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
                                    {currentPage}
                                </button>
                                <button
                                    className="btn btn-default btn-sm"
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    style={{ borderRadius: '6px', border: '1px solid #e2e8f0', background: '#ffffff', color: currentPage >= totalPages ? '#cbd5e1' : '#475569' }}
                                >
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
                        <div className="modal-dialog" style={{ marginTop: '10vh' }}>
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
                                                    background: '#f8fafc',
                                                    height: '45px'
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="modal-footer" style={{ borderTop: '1px solid #f1f5f9', padding: '16px 24px', display: 'flex', justifyContent: 'flex-end' }}>
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
