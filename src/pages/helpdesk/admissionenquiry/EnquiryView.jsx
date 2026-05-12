import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Loader from '../../../components/Loader';
import AddEnquiryModal from './AddEnquiryModal';
import EditEnquiryModal from './EditEnquiryModal';
import FollowUpModal from './FollowUpModal';
import { api } from '../../../services/api';
import { filterEnquiries } from './enquiryFilterLogic';
import { buildExportData } from '../../../utils/tableExport';
import { useTableSort } from '../../../hooks/useTableSort';
import HelpdeskLayout from '../HelpdeskLayout';
import { useHelpdeskCounts } from '../../../context/HelpdeskCountContext';
import PremiumTableToolbar from '../../../utils/PremiumTableToolbar';
import './EnquiryView.css';

// Move pure utility functions outside component to avoid re-creation and hoisting issues
const formatDate = (dateStr) => {
    if (!dateStr || dateStr === '0000-00-00' || dateStr === '1970-01-01') return '';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB');
    } catch { return dateStr; }
};

const getAvatarColor = (name) => {
    const colors = [
        { bg: '#e0f2fe', text: '#0284c7' },
        { bg: '#f3e8ff', text: '#9333ea' },
        { bg: '#dcfce7', text: '#16a34a' },
        { bg: '#fef3c7', text: '#d97706' },
        { bg: '#ffe4e6', text: '#e11d48' },
    ];
    let hash = 0;
    const nameStr = name || '??';
    for (let i = 0; i < nameStr.length; i++) {
        hash = nameStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const EnquiryView = () => {
    const { updateCount } = useHelpdeskCounts();
    // Filter form state
    const [filterForm, setFilterForm] = useState({
        class_id: '',
        source: '',
        from_date: '',
        to_date: '',
        status: ''
    });

    // Data states
    const [masterEnquiryList, setMasterEnquiryList] = useState([]);
    const [enquiryList, setEnquiryList] = useState([]);
    const [classList, setClassList] = useState([]);
    const [sourceList, setSourceList] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [referenceList, setReferenceList] = useState([]);
    const [enquiryStatus, setEnquiryStatus] = useState({
        'active': 'Active',
        'passive': 'Passive',
        'dead': 'Dead',
        'won': 'Won',
        'lost': 'Lost'
    });
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [validationErrors, setValidationErrors] = useState({});

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showFollowUpModal, setShowFollowUpModal] = useState(false);
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);
    const [searchTerm, setSearchTerm] = useState('');

    // Column definitions
    const columns = [
        { key: 'name', label: 'Name', sortKey: 'name', width: '200px' },
        { key: 'contact', label: 'Phone' },
        { key: 'source', label: 'Source' },
        { key: 'classname', label: 'Class', sortKey: 'classname' },
        { key: 'date', label: 'Enquiry Date', sortKey: 'date' },
        { key: 'followupdate', label: 'Last Follow Up Date', sortKey: 'followupdate' },
        { key: 'next_date', label: 'Next Follow Up Date', sortKey: 'next_date' },
        { key: 'status', label: 'Status', sortKey: 'status' }
    ];
    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));

    const toggleColumn = (key) => {
        setVisibleColumns(prev => {
            const next = new Set(prev);
            if (next.has(key)) { next.delete(key); } else { next.add(key); }
            return next;
        });
    };

    const formatCell = (row, key) => {
        if (key === 'next_date') {
            const isInvalid = !row.next_date || row.next_date === '0000-00-00' || row.next_date === '1970-01-01';
            const dateVal = isInvalid ? row.follow_up_date : row.next_date;
            return formatDate(dateVal);
        }
        if (key === 'date' || key === 'followupdate') return formatDate(row[key]);
        if (key === 'status') return (enquiryStatus && enquiryStatus[row[key]]) || row[key];
        return row[key];
    };

    const fetchEnquiryList = async (filters = null) => {
        try {
            setLoading(true);
            const response = filters
                ? await api.searchEnquiryList(filters)
                : await api.getEnquiryList();

            const enquiryData = (response && response.data) ? response.data : response;

            let enquiries = [];
            if (enquiryData && Array.isArray(enquiryData.enquiry_list)) {
                enquiries = enquiryData.enquiry_list;
                if (Array.isArray(enquiryData.class_list)) setClassList(enquiryData.class_list);
                const sources = enquiryData.sourcelist || enquiryData.source_list;
                if (Array.isArray(sources)) setSourceList(sources);
                if (Array.isArray(enquiryData.staff_list)) setStaffList(enquiryData.staff_list);
                if (Array.isArray(enquiryData.reference)) setReferenceList(enquiryData.reference);
                if (enquiryData.enquiry_status) setEnquiryStatus(enquiryData.enquiry_status);
            } else if (Array.isArray(enquiryData)) {
                enquiries = enquiryData;
            }

            if (filters) {
                enquiries = filterEnquiries(enquiries, filters);
            }

            setMasterEnquiryList(enquiries);
            setEnquiryList(enquiries);
            updateCount('totalEnquiries', enquiries.length);
        } catch (err) {
            console.error('Error fetching enquiry list:', err);
            setEnquiryList([]);
        } finally {
            setInitialLoading(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnquiryList();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilterForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const errors = {};
        if (!filterForm.from_date) errors.from_date = 'Required';
        if (!filterForm.to_date) errors.to_date = 'Required';

        if (filterForm.from_date && filterForm.to_date) {
            if (new Date(filterForm.to_date) < new Date(filterForm.from_date)) {
                errors.to_date = 'Invalid range';
            }
        }

        setValidationErrors(errors);
        if (Object.keys(errors).length > 0) return;

        const searchFilters = {
            ...filterForm,
            status: filterForm.status === 'all' ? '' : filterForm.status
        };
        fetchEnquiryList(searchFilters);
        setCurrentPage(1);
    };

    const handleFollowUp = (enquiry) => {
        setSelectedEnquiry(enquiry);
        setShowFollowUpModal(true);
    };

    const handleEdit = (enquiry) => {
        setSelectedEnquiry(enquiry);
        setShowEditModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await api.deleteEnquiry(id);
                setEnquiryList(prev => prev.filter(e => e.id !== id));
                toast.success('Deleted');
            } catch (err) {
                toast.error('Failed');
            }
        }
    };

    const { sortedData: sortedEnquiries, requestSort: handleSort, getSortIcon } = useTableSort(enquiryList);

    const finalFilteredEnquiries = sortedEnquiries.filter(item => {
        if (!searchTerm) return true;
        const lowerTerm = searchTerm.toLowerCase();
        return (
            item.name?.toLowerCase().includes(lowerTerm) ||
            item.contact?.toLowerCase().includes(lowerTerm) ||
            item.source?.toLowerCase().includes(lowerTerm) ||
            item.classname?.toLowerCase().includes(lowerTerm)
        );
    });

    const totalItems = finalFilteredEnquiries.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const totalPages = Math.ceil(totalItems / safeRecordsPerPage);
    const currentEnquiries = finalFilteredEnquiries.slice((currentPage - 1) * safeRecordsPerPage, currentPage * safeRecordsPerPage);

    const getExportData = () => buildExportData(columns, visibleColumns, finalFilteredEnquiries, formatCell);

    const renderEnquiryName = (enquiry) => {
        const color = getAvatarColor(enquiry.name);
        const initials = enquiry.name ? enquiry.name.substring(0, 2).toUpperCase() : '??';
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    backgroundColor: color.bg, color: color.text,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '600', fontSize: '13px', flexShrink: 0
                }}>
                    {initials}
                </div>
                <Link to="#" onClick={() => handleFollowUp(enquiry)} style={{ color: '#1e293b', fontWeight: '500' }}>
                    {enquiry.name}
                </Link>
            </div>
        );
    };

    return (
        <HelpdeskLayout activeTab="enquiry">
            <div className="row">
                <div className="col-md-12">
                    {/* Select Criteria Box */}
                    <div className="box box-primary theme-shadow" style={{ borderRadius: '12px', borderTop: 'none', marginBottom: '24px' }}>
                        <div className="box-header with-border" style={{ padding: '15px 20px', borderBottom: '1px solid #f1f5f9' }}>
                            <h3 className="box-title" style={{ fontWeight: '600', fontSize: '16px' }}>
                                <i className="fa fa-filter" style={{ marginRight: '8px', color: '#7c3aed' }}></i> Select Criteria
                            </h3>
                        </div>
                        <div className="box-body" style={{ padding: '20px' }}>
                            <form role="form" onSubmit={handleSearch}>
                                <div className="row" style={{ display: 'flex', flexWrap: 'wrap', gap: '0' }}>
                                    {/* 1. Class */}
                                    <div className="col-md-2 col-sm-6">
                                        <div className="form-group">
                                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Class</label>
                                            <select name="class_id" className="form-control input-sm" value={filterForm.class_id} onChange={handleFilterChange} style={{ borderRadius: '6px' }}>
                                                <option value="">Select Class</option>
                                                {classList.map(c => <option key={c.id} value={c.id}>{c.class}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    {/* 2. Source */}
                                    <div className="col-md-2 col-sm-6">
                                        <div className="form-group">
                                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Source</label>
                                            <select name="source" className="form-control input-sm" value={filterForm.source} onChange={handleFilterChange} style={{ borderRadius: '6px' }}>
                                                <option value="">Select Source</option>
                                                {sourceList.map(s => <option key={s.id} value={s.source}>{s.source}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    {/* 3. Enquiry From */}
                                    <div className="col-md-2 col-sm-6">
                                        <div className="form-group">
                                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Enquiry From</label>
                                            <input type="date" name="from_date" className="form-control input-sm" value={filterForm.from_date} onChange={handleFilterChange} style={{ borderRadius: '6px' }} />
                                        </div>
                                    </div>
                                    {/* 4. Enquiry To */}
                                    <div className="col-md-2 col-sm-6">
                                        <div className="form-group">
                                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Enquiry To</label>
                                            <input type="date" name="to_date" className="form-control input-sm" value={filterForm.to_date} onChange={handleFilterChange} style={{ borderRadius: '6px' }} />
                                        </div>
                                    </div>
                                    {/* 5. Status */}
                                    <div className="col-md-2 col-sm-6">
                                        <div className="form-group">
                                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Status</label>
                                            <select name="status" className="form-control input-sm" value={filterForm.status} onChange={handleFilterChange} style={{ borderRadius: '6px' }}>
                                                <option value="all">All Status</option>
                                                {Object.entries(enquiryStatus).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    {/* Search Button aligned with fields */}
                                    <div className="col-md-2 col-sm-6" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '15px' }}>
                                        <button type="submit" className="btn" disabled={loading} style={{ backgroundColor: '#7c3aed', color: '#fff', borderRadius: '8px', padding: '6px 0', width: '100%', fontWeight: '600', height: '30px', fontSize: '13px' }}>
                                            {loading ? '...' : 'Search'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Enquiry List Container - Cleaned up to match SIS */}
                    <div className="sis-list-container" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                        {/* Header Section */}
                        <div className="sis-list-header" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>Enquiry List</h3>
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
                                onToggleColumn={toggleColumn}
                                getExportData={getExportData}
                                exportFileName="enquiry_list"
                                exportTitle="Enquiry List"
                                recordsPerPage={recordsPerPage}
                                onRecordsPerPageChange={(num) => { setRecordsPerPage(num); setCurrentPage(1); }}
                            />
                        </div>

                        <div className="sis-list-body" style={{ padding: '0' }}>
                            <div className="table-responsive mailbox-messages overflow-visible">
                                <table className="table table-hover sis-listing-table" style={{ margin: 0 }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc' }}>
                                            {columns.map(col => visibleColumns.has(col.key) && (
                                                <th key={col.key} onClick={() => col.sortKey && handleSort(col.sortKey)} style={{
                                                    cursor: col.sortKey ? 'pointer' : 'default',
                                                    padding: '12px 24px',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    color: '#475569',
                                                    borderBottom: '1px solid #e2e8f0',
                                                    ...(col.width ? { width: col.width } : {})
                                                }}>
                                                    {col.label} {col.sortKey && getSortIcon(col.sortKey)}
                                                </th>
                                            ))}
                                            <th className="text-right noExport" style={{ padding: '12px 24px', borderBottom: '1px solid #e2e8f0' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {initialLoading ? (
                                            <tr>
                                                <td colSpan={visibleColumns.size + 1} className="text-center p-4">
                                                    <Loader type="table" rows={10} />
                                                </td>
                                            </tr>
                                        ) : currentEnquiries.length === 0 ? (
                                            <tr>
                                                <td colSpan={visibleColumns.size + 1} className="text-center p-5 text-muted">
                                                    No enquiries found matching your criteria.
                                                </td>
                                            </tr>
                                        ) : (
                                            currentEnquiries.map((enquiry, idx) => (
                                                <tr key={enquiry.id || idx}>
                                                    {columns.map(col => visibleColumns.has(col.key) && (
                                                        <td key={col.key} style={{ padding: '12px 24px', fontSize: '14px', color: '#1e293b' }}>
                                                            {col.key === 'name' ? (
                                                                renderEnquiryName(enquiry)
                                                            ) : formatCell(enquiry, col.key)}
                                                        </td>
                                                    ))}
                                                    <td className="text-right white-space-nowrap noExport" style={{ padding: '12px 24px' }}>
                                                        <button onClick={() => handleFollowUp(enquiry)} className="btn btn-default btn-xs" title="Follow Up" style={{ marginRight: '4px', borderRadius: '4px' }}>
                                                            <i className="fa fa-phone"></i>
                                                        </button>
                                                        <button onClick={() => handleEdit(enquiry)} className="btn btn-default btn-xs" title="Edit" style={{ marginRight: '4px', borderRadius: '4px' }}>
                                                            <i className="fa fa-pencil"></i>
                                                        </button>
                                                        <button onClick={() => handleDelete(enquiry.id)} className="btn btn-default btn-xs" title="Delete" style={{ borderRadius: '4px' }}>
                                                            <i className="fa fa-remove"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination Footer */}
                        {!initialLoading && totalItems > 0 && (
                            <div style={{
                                padding: '20px 24px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderTop: '1px solid #f1f5f9'
                            }}>
                                <div style={{ color: '#64748b', fontSize: '14px' }}>
                                    Showing {(currentPage - 1) * recordsPerPage + 1} to {Math.min(currentPage * recordsPerPage, totalItems)} of {totalItems} entries
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        className="btn btn-default btn-sm"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                        style={{ borderRadius: '6px', border: '1px solid #e2e8f0' }}
                                    >
                                        <i className="fa fa-angle-left"></i>
                                    </button>
                                    <button className="btn btn-sm" style={{ borderRadius: '6px', background: '#7c3aed', color: '#ffffff', minWidth: '32px' }}>
                                        {currentPage}
                                    </button>
                                    <button
                                        className="btn btn-default btn-sm"
                                        disabled={currentPage >= totalPages}
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                        style={{ borderRadius: '6px', border: '1px solid #e2e8f0' }}
                                    >
                                        <i className="fa fa-angle-right"></i>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AddEnquiryModal show={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={() => { setShowAddModal(false); fetchEnquiryList(); }} classList={classList} sourceList={sourceList} referenceList={referenceList} staffList={staffList} />
            <EditEnquiryModal show={showEditModal} onClose={() => setShowEditModal(false)} enquiry={selectedEnquiry} onSuccess={() => { setShowEditModal(false); fetchEnquiryList(); }} classList={classList} sourceList={sourceList} referenceList={referenceList} staffList={staffList} />
            <FollowUpModal show={showFollowUpModal} onClose={() => setShowFollowUpModal(false)} enquiry={selectedEnquiry} onSuccess={() => { setShowFollowUpModal(false); fetchEnquiryList(); }} />
        </HelpdeskLayout>
    );
};

export default EnquiryView;
