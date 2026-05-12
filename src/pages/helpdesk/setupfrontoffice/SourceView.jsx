import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Loader from '../../../components/Loader';
import { api } from '../../../services/api';
import { buildExportData } from '../../../utils/tableExport';
import PremiumTableToolbar from '../../../utils/PremiumTableToolbar';
import HelpdeskLayout from '../HelpdeskLayout';
import AddSourceModal from './AddSourceModal';
import EditSourceModal from './EditSourceModal';
import { useHelpdeskCounts } from '../../../context/HelpdeskCountContext';

const SourceView = () => {
    const { updateCount } = useHelpdeskCounts();
    const [source_list, setSourceList] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSource, setSelectedSource] = useState(null);

    const fetchSourceList = async () => {
        setInitialLoading(true);
        try {
            const data = await api.getSourceList();
            const list = data.data || [];
            setSourceList(list);
            updateCount('totalSources', list.length);
        } catch (error) {
            console.error('Fetch Error:', error);
            toast.error('Failed to fetch source list');
        } finally {
            setInitialLoading(false);
        }
    };

    useEffect(() => {
        fetchSourceList();
    }, []);

    const sourceColumns = [
        { key: 'source', label: 'Source' },
        { key: 'description', label: 'Description' }
    ];
    const [sourceVisibleCols, setSourceVisibleCols] = useState(new Set(sourceColumns.map(c => c.key)));

    const filteredResults = source_list.filter(item =>
        item.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalItems = filteredResults.length;
    const totalPages = Math.ceil(totalItems / recordsPerPage);
    const currentItems = filteredResults.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

    const getExportData = () => buildExportData(sourceColumns, sourceVisibleCols, filteredResults, (row, key) => row[key]);

    const handleToggleColumn = (key) => {
        setSourceVisibleCols(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key); else next.add(key);
            return next;
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await api.deleteSource(id);
                toast.success('Source deleted successfully');
                fetchSourceList();
            } catch (error) {
                toast.error(error.message || 'Failed to delete source');
            }
        }
    };

    const handleEdit = (source) => {
        setSelectedSource(source);
        setShowEditModal(true);
    };

    return (
        <HelpdeskLayout activeTab="source">
            <div className="sis-list-container" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                {/* Header Section */}
                <div className="sis-list-header" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>Source List</h3>
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
                        columns={sourceColumns}
                        visibleColumns={sourceVisibleCols}
                        onToggleColumn={handleToggleColumn}
                        getExportData={getExportData}
                        exportFileName="source_list"
                        exportTitle="Source List"
                        recordsPerPage={recordsPerPage}
                        onRecordsPerPageChange={(val) => { setRecordsPerPage(val); setCurrentPage(1); }}
                    />
                </div>

                {/* Table Section */}
                <div className="sis-list-body" style={{ padding: '0' }}>
                    <div className="table-responsive mailbox-messages overflow-visible">
                        <table className="table table-hover" style={{ margin: 0 }}>
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    {sourceColumns.map(col => sourceVisibleCols.has(col.key) && (
                                        <th key={col.key} style={{
                                            padding: '12px 24px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            color: '#475569',
                                            borderBottom: '1px solid #e2e8f0',
                                            ...(col.key === 'source' ? { width: '30%' } : {})
                                        }}>
                                            {col.label}
                                        </th>
                                    ))}
                                    <th className="text-right noExport" style={{ padding: '12px 24px', borderBottom: '1px solid #e2e8f0' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {initialLoading ? (
                                    <tr>
                                        <td colSpan={sourceVisibleCols.size + 1} className="text-center p-4">
                                            <Loader type="table" rows={5} />
                                        </td>
                                    </tr>
                                ) : currentItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={sourceVisibleCols.size + 1} className="text-center p-5 text-muted">No data available in table</td>
                                    </tr>
                                ) : (
                                    currentItems.map((value, idx) => (
                                        <tr key={value.id || idx}>
                                            {sourceColumns.map(col => sourceVisibleCols.has(col.key) && (
                                                <td key={col.key} style={{ padding: '16px 24px', fontSize: '14px', color: '#1e293b' }}>
                                                    {value[col.key]}
                                                </td>
                                            ))}
                                            <td className="text-right noExport" style={{ padding: '16px 24px' }}>
                                                <button onClick={() => handleEdit(value)} className="btn btn-link btn-xs" title="Edit" style={{ color: '#475569', padding: '0 8px' }}>
                                                    <i className="fa fa-pencil" style={{ fontSize: '16px' }}></i>
                                                </button>
                                                <button onClick={() => handleDelete(value.id)} className="btn btn-link btn-xs" title="Delete" style={{ color: '#475569', padding: '0 8px' }}>
                                                    <i className="fa fa-remove" style={{ fontSize: '16px' }}></i>
                                                </button>
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

            <AddSourceModal
                show={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => { setShowAddModal(false); fetchSourceList(); }}
            />
            <EditSourceModal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                sourceData={selectedSource}
                onSuccess={() => { setShowEditModal(false); fetchSourceList(); }}
            />
        </HelpdeskLayout>
    );
};

export default SourceView;