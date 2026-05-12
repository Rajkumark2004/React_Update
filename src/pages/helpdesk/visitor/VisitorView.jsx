import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Loader from '../../../components/Loader';
import { buildExportData } from '../../../utils/tableExport';
import PremiumTableToolbar from '../../../utils/PremiumTableToolbar';
import HelpdeskLayout from '../HelpdeskLayout';
import AddVisitorModal from './AddVisitorModal';

// Mock data matching the reference screenshot
const MOCK_VISITORS = [
    { id: 1, purpose: 'permission', meeting_with: 'Staff (Agent One - SBD003)', visitor_name: 'ascdddddd', phone: '', id_card: '', number_of_person: '0', date: '12/02/2026', in_time: '11:44 AM', out_time: '11:44 AM' },
    { id: 2, purpose: 'HEALTH ISSUE', meeting_with: 'Staff (Agent One - SBD003)', visitor_name: 'champ', phone: '14789632520', id_card: '7412369852', number_of_person: '2', date: '09/02/2026', in_time: '02:30 PM', out_time: '02:30 PM' },
    { id: 3, purpose: 'VISITING', meeting_with: 'Staff (Super Admin - 9000)', visitor_name: 'none', phone: '1235896347', id_card: 'mnmmmn', number_of_person: '2', date: '07/02/2026', in_time: '02:41 PM', out_time: '02:41 PM' },
    { id: 4, purpose: 'VISITING', meeting_with: 'Student (Siva Sai Venkat Nandhu Odella - 1005)', visitor_name: 'abcd', phone: 'abod', id_card: '123', number_of_person: '2', date: '05/12/2025', in_time: '12:23 PM', out_time: '12:23 PM' },
    { id: 5, purpose: 'AAA', meeting_with: 'Student (mahesh posa - 23PRE001)', visitor_name: 'ABCD', phone: '12345', id_card: '', number_of_person: '1', date: '05/12/2025', in_time: '11:45 AM', out_time: '11:45 AM' },
    { id: 6, purpose: 'Visiting', meeting_with: 'Staff (admin - admin001)', visitor_name: 'sai aveen', phone: '23456787654', id_card: '', number_of_person: '0', date: '17/05/2025', in_time: '02:41 PM', out_time: '02:41 PM' },
    { id: 7, purpose: 'Visiting', meeting_with: 'Staff (Sunil - 1876)', visitor_name: 'reddy', phone: '7894561230', id_card: '343', number_of_person: '3', date: '18/02/2025', in_time: '05:26 PM', out_time: '05:26 PM' },
];

const VisitorView = () => {
    const [visitorList, setVisitorList] = useState(MOCK_VISITORS);
    const [initialLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    const columns = [
        { key: 'purpose', label: 'Purpose' },
        { key: 'meeting_with', label: 'Meeting With' },
        { key: 'visitor_name', label: 'Visitor Name' },
        { key: 'phone', label: 'Phone' },
        { key: 'id_card', label: 'ID Card' },
        { key: 'number_of_person', label: 'Number Of Person' },
        { key: 'date', label: 'Date' },
        { key: 'in_time', label: 'In Time' },
        { key: 'out_time', label: 'Out Time' }
    ];
    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));

    const handleToggleColumn = (key) => {
        setVisibleColumns(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key); else next.add(key);
            return next;
        });
    };

    const filteredResults = visitorList.filter(item =>
        item.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.meeting_with?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.visitor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalItems = filteredResults.length;
    const totalPages = Math.ceil(totalItems / recordsPerPage);
    const currentItems = filteredResults.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

    const getExportData = () => buildExportData(columns, visibleColumns, filteredResults, (row, key) => row[key]);

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this visitor?')) {
            setVisitorList(prev => prev.filter(v => v.id !== id));
            toast.success('Visitor deleted successfully');
        }
    };

    const handleAddSuccess = (newVisitor) => {
        const newId = visitorList.length > 0 ? Math.max(...visitorList.map(v => v.id)) + 1 : 1;
        const formattedDate = new Date(newVisitor.date).toLocaleDateString('en-GB');
        setVisitorList(prev => [{
            ...newVisitor,
            id: newId,
            date: formattedDate
        }, ...prev]);
        setShowAddModal(false);
    };

    return (
        <HelpdeskLayout activeTab="visitors">
            <div className="sis-list-container" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                <div className="sis-list-header" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>Visitor List</h3>
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
                        columns={columns}
                        visibleColumns={visibleColumns}
                        onToggleColumn={handleToggleColumn}
                        getExportData={getExportData}
                        exportFileName="visitor_list"
                        exportTitle="Visitor List"
                        recordsPerPage={recordsPerPage}
                        onRecordsPerPageChange={(val) => { setRecordsPerPage(val); setCurrentPage(1); }}
                    />
                </div>

                {/* Table */}
                <div className="sis-list-body" style={{ padding: '0' }}>
                    <div className="table-responsive mailbox-messages overflow-visible">
                        <table className="table table-hover sis-listing-table" style={{ margin: 0 }}>
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    {columns.map(col => visibleColumns.has(col.key) && (
                                        <th key={col.key} style={{
                                            padding: '12px 24px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            color: '#475569',
                                            borderBottom: '1px solid #e2e8f0'
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
                                        <td colSpan={visibleColumns.size + 1} className="text-center p-4">
                                            <Loader type="table" rows={5} />
                                        </td>
                                    </tr>
                                ) : currentItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={visibleColumns.size + 1} className="text-center p-5 text-muted">No data available in table</td>
                                    </tr>
                                ) : (
                                    currentItems.map((value, idx) => (
                                        <tr key={value.id || idx}>
                                            {columns.map(col => visibleColumns.has(col.key) && (
                                                <td key={col.key} style={{ padding: '16px 24px', fontSize: '14px', color: '#1e293b' }}>
                                                    {value[col.key]}
                                                </td>
                                            ))}
                                            <td className="text-right noExport" style={{ padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                                                    <button className="btn btn-link btn-xs" title="View" style={{ color: '#64748b', padding: '4px 8px' }}>
                                                        <i className="fa fa-list" style={{ fontSize: '16px' }}></i>
                                                    </button>
                                                    <button className="btn btn-link btn-xs" title="Edit" style={{ color: '#64748b', padding: '4px 8px' }}>
                                                        <i className="fa fa-pencil" style={{ fontSize: '16px' }}></i>
                                                    </button>
                                                    <button onClick={() => handleDelete(value.id)} className="btn btn-link btn-xs" title="Delete" style={{ color: '#64748b', padding: '4px 8px' }}>
                                                        <i className="fa fa-remove" style={{ fontSize: '16px' }}></i>
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

                {/* Pagination */}
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

            <AddVisitorModal
                show={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={handleAddSuccess}
            />
        </HelpdeskLayout>
    );
};

export default VisitorView;
