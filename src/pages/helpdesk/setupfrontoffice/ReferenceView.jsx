import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Users } from 'lucide-react';
import Loader from '../../../components/Loader';
import { api } from '../../../services/api';
import { buildExportData } from '../../../utils/tableExport';
import PremiumTableToolbar from '../../../utils/PremiumTableToolbar';
import HelpdeskLayout from '../HelpdeskLayout';
import AddReferenceModal from './AddReferenceModal';
import EditReferenceModal from './EditReferenceModal';
import { useHelpdeskCounts } from '../../../context/HelpdeskCountContext';

const ReferenceView = () => {
    const { updateCount } = useHelpdeskCounts();
    const [reference_list, setReferenceList] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedReference, setSelectedReference] = useState(null);

    const fetchReferenceList = async () => {
        setInitialLoading(true);
        try {
            const data = await api.getReferenceList();
            const list = data.data || [];
            setReferenceList(list);
            updateCount('totalReferences', list.length);
        } catch (error) {
            console.error('Fetch Error:', error);
            toast.error('Failed to fetch reference list');
        } finally {
            setInitialLoading(false);
        }
    };

    useEffect(() => {
        fetchReferenceList();
    }, []);

    const refColumns = [
        { key: 'reference', label: 'Reference' },
        { key: 'description', label: 'Description' }
    ];
    const [refVisibleCols, setRefVisibleCols] = useState(new Set(refColumns.map(c => c.key)));

    const filteredResults = reference_list.filter(item =>
        item.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalItems = filteredResults.length;
    const totalPages = Math.ceil(totalItems / recordsPerPage);
    const currentItems = filteredResults.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

    const getExportData = () => buildExportData(refColumns, refVisibleCols, filteredResults, (row, key) => row[key]);

    const handleToggleColumn = (key) => {
        setRefVisibleCols(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key); else next.add(key);
            return next;
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await api.deleteReference(id);
                toast.success('Reference deleted successfully');
                fetchReferenceList();
            } catch (error) {
                toast.error(error.message || 'Failed to delete reference');
            }
        }
    };

    const handleEdit = (reference) => {
        setSelectedReference(reference);
        setShowEditModal(true);
    };

    return (
        <HelpdeskLayout activeTab="reference">
            <div className="sis-list-container" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                {/* Header Section */}
                <div className="sis-list-header" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>Reference List</h3>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn btn-sm"
                        style={{ backgroundColor: '#7c3aed', color: '#fff', borderRadius: '8px', padding: '8px 20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <i className="fa fa-plus"></i> Add
                    </button>
                </div>

                {/* Toolbar Section */}
                <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <i className="fa fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                        <input
                            type="text"
                            placeholder="Search..."
                            className="form-control"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            style={{ paddingLeft: '36px', borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }}
                        />
                    </div>
                    <PremiumTableToolbar
                        columns={refColumns}
                        visibleColumns={refVisibleCols}
                        onToggleColumn={handleToggleColumn}
                        getExportData={getExportData}
                        exportFileName="reference_list"
                        exportTitle="Reference List"
                        recordsPerPage={recordsPerPage}
                        onRecordsPerPageChange={(val) => { setRecordsPerPage(val); setCurrentPage(1); }}
                    />
                </div>

                {/* Table Section */}
                <div className="sis-list-body" style={{ padding: '0' }}>
                    <div className="table-responsive mailbox-messages overflow-visible">
                        <table className="table table-hover setup-table" style={{ margin: 0 }}>
                            <thead>
                                <tr className="modern-table-header">
                                    {refColumns.map(col => refVisibleCols.has(col.key) && (
                                        <th key={col.key} style={{
                                            ...(col.key === 'reference' ? { width: '30%' } : {})
                                        }}>
                                            {col.label}
                                        </th>
                                    ))}
                                    <th className="text-right noExport">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {initialLoading ? (
                                    <tr>
                                        <td colSpan={refVisibleCols.size + 1} className="text-center p-4">
                                            <Loader type="table" rows={5} />
                                        </td>
                                    </tr>
                                ) : currentItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={refVisibleCols.size + 1} className="text-center p-5 text-muted">No data available in table</td>
                                    </tr>
                                ) : (
                                    currentItems.map((value, idx) => (
                                        <tr key={value.id || idx} className="modern-table-row">
                                            {refColumns.map(col => refVisibleCols.has(col.key) && (
                                                <td key={col.key}>
                                                    {col.key === 'reference' ? (
                                                        <div className="cell-icon-wrapper">
                                                            <Users size={14} className="cell-icon" />
                                                            <span>{value[col.key]}</span>
                                                        </div>
                                                    ) : value[col.key]}
                                                </td>
                                            ))}
                                            <td className="text-right noExport">
                                                <div className="action-btns-wrapper">
                                                    <button onClick={() => handleEdit(value)} className="action-btn-circle btn-edit-circle" title="Edit">
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(value.id)} className="action-btn-circle btn-delete-circle" title="Delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination Section */}
                {!initialLoading && totalItems > 0 && (
                    <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
                        <div style={{ color: '#64748b', fontSize: '14px' }}>
                            Showing {(currentPage - 1) * recordsPerPage + 1} to {Math.min(currentPage * recordsPerPage, totalItems)} of {totalItems} entries
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-default btn-sm" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} style={{ borderRadius: '6px' }}>
                                <i className="fa fa-angle-left"></i>
                            </button>
                            <button className="btn btn-sm" style={{ borderRadius: '6px', background: '#7c3aed', color: '#ffffff', minWidth: '32px' }}>
                                {currentPage}
                            </button>
                            <button className="btn btn-default btn-sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(prev => prev + 1)} style={{ borderRadius: '6px' }}>
                                <i className="fa fa-angle-right"></i>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <AddReferenceModal
                show={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => { setShowAddModal(false); fetchReferenceList(); }}
            />
            <EditReferenceModal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                referenceData={selectedReference}
                onSuccess={() => { setShowEditModal(false); fetchReferenceList(); }}
            />
        </HelpdeskLayout>
    );
};

export default ReferenceView;
