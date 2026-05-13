import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Phone, Calendar, Edit, Trash2, User, Leaf, Users, MoreHorizontal, ArrowUpRight, Search, Plus, MapPin, Pencil } from 'lucide-react';
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
    return colors[Math.abs(hash) % colors.length] || colors[0];
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
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const formatCell = (row, key) => {
        if (key === 'next_date') {
            const isInvalid = !row.next_date || row.next_date === '0000-00-00' || row.next_date === '1970-01-01';
            const dateVal = isInvalid ? row.follow_up_date : row.next_date;
            return formatDate(dateVal);
        }
        if (key === 'followupdate') {
            return formatDate(row[key]);
        }
        if (key === 'date') {
            return (
                <div className="cell-icon-wrapper">
                    <Calendar size={14} className="cell-icon" />
                    <span>{formatDate(row[key])}</span>
                </div>
            );
        }
        if (key === 'contact') {
            return (
                <div className="cell-icon-wrapper">
                    <Phone size={14} className="cell-icon" />
                    <span>{row[key]}</span>
                </div>
            );
        }
        if (key === 'source') {
            return row[key];
        }
        if (key === 'status') {
            const statusLabel = (enquiryStatus && enquiryStatus[row[key]]) || row[key];
            return (
                <div className="status-badge">
                    <div className="status-dot"></div>
                    <span>{statusLabel}</span>
                </div>
            );
        }
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
        if (window.confirm('Are you sure you want to delete this enquiry?')) {
            try {
                await api.deleteEnquiry(id);
                setEnquiryList(prev => prev.filter(e => e.id !== id));
                toast.success('Enquiry deleted successfully');
            } catch (err) {
                toast.error('Failed to delete enquiry');
            }
        }
    };

    // Table sorting logic
    const { sortedData: sortedEnquiries, requestSort: handleSort, getSortIcon } = useTableSort(enquiryList);

    // Local search filter
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
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentEnquiries = finalFilteredEnquiries.slice(indexOfFirstItem, indexOfLastItem);

    const getExportData = () => buildExportData(columns, visibleColumns, finalFilteredEnquiries, formatCell);

    const renderEnquiryName = (enquiry) => {
        const color = getAvatarColor(enquiry.name);
        const initials = enquiry.name ? enquiry.name.substring(0, 2).toUpperCase() : '??';
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div className="enquiry-avatar" style={{
                    backgroundColor: color.bg, 
                    color: color.text
                }}>
                    {initials}
                </div>
                <Link to="#" onClick={() => handleFollowUp(enquiry)} style={{ color: '#1e293b', fontWeight: '600', fontSize: '14px' }}>
                    {enquiry.name}
                </Link>
            </div>
        );
    };

    return (
        <HelpdeskLayout activeTab="enquiry">
            <div className="row">
                <div className="col-md-12">
                    <div className="sis-search-bar-container">
                        <div className="sis-search-bar-header">
                            <h3 className="sis-search-title" style={{ marginBottom: '20px', fontSize: '20px' }}>Select Criteria</h3>
                        </div>
                        <form onSubmit={handleSearch} className="sis-search-form">
                            <div className="sis-advanced-filters" style={{ marginTop: '0', paddingTop: '0', borderTop: 'none' }}>
                                <div className="sis-filter-row" style={{ flexWrap: 'wrap', gap: '16px' }}>
                                    <div className="sis-filter-col">
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Class</label>
                                        <select name="class_id" className="sis-filter-select" value={filterForm.class_id} onChange={handleFilterChange}>
                                            <option value="">All Classes</option>
                                            {classList.map(c => <option key={c.id} value={c.id}>{c.class}</option>)}
                                        </select>
                                    </div>
                                    <div className="sis-filter-col">
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Source</label>
                                        <select name="source" className="sis-filter-select" value={filterForm.source} onChange={handleFilterChange}>
                                            <option value="">All Sources</option>
                                            {sourceList.map(s => <option key={s.id} value={s.source}>{s.source}</option>)}
                                        </select>
                                    </div>
                                    <div className="sis-filter-col">
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Enquiry From <span className="req">*</span></label>
                                        <input type="date" name="from_date" className={`sis-filter-select ${validationErrors.from_date ? 'border-danger' : ''}`} value={filterForm.from_date} onChange={handleFilterChange} />
                                    </div>
                                    <div className="sis-filter-col">
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Enquiry To <span className="req">*</span></label>
                                        <input type="date" name="to_date" className={`sis-filter-select ${validationErrors.to_date ? 'border-danger' : ''}`} value={filterForm.to_date} onChange={handleFilterChange} />
                                    </div>
                                    <div className="sis-filter-col">
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Status</label>
                                        <select name="status" className="sis-filter-select" value={filterForm.status} onChange={handleFilterChange}>
                                            <option value="all">All Status</option>
                                            {Object.entries(enquiryStatus).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                        </select>
                                    </div>
                                    <div className="sis-filter-col" style={{ display: 'flex', alignItems: 'flex-end', flex: '0 0 auto' }}>
                                        <button type="submit" className="btn btn-primary sis-apply-btn" disabled={loading} style={{ height: '40px', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 24px' }}>
                                            {loading ? <i className="fa fa-spinner fa-spin"></i> : <><i className="fa fa-search"></i> Search</>}
                                        </button>
                                    </div>
                                </div>
                                {(validationErrors.from_date || validationErrors.to_date) && (
                                    <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px' }}>
                                        Please provide valid dates for Enquiry From and Enquiry To.
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="sis-list-container" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                        <div className="sis-list-header" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>Admission Enquiries ({totalItems})</h3>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="btn btn-sm"
                                style={{ backgroundColor: '#7c3aed', color: '#fff', borderRadius: '8px', padding: '8px 20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <i className="fa fa-plus"></i> Add
                            </button>
                        </div>

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

                        <div className="table-responsive" style={{ padding: '0' }}>
                            <table className="table table-hover" style={{ margin: 0 }}>
                                <thead>
                                    <tr className="modern-table-header">
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
                                        <th className="text-right" style={{ padding: '12px 24px', borderBottom: '1px solid #e2e8f0' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {initialLoading ? (
                                        <tr>
                                            <td colSpan={visibleColumns.size + 1} className="text-center p-4">
                                                <Loader />
                                            </td>
                                        </tr>
                                    ) : currentEnquiries.length === 0 ? (
                                        <tr>
                                            <td colSpan={visibleColumns.size + 1} className="text-center p-5 text-muted">
                                                No enquiries found.
                                            </td>
                                        </tr>
                                    ) : (
                                        currentEnquiries.map((enquiry, idx) => (
                                            <tr key={enquiry.id || idx} className="modern-table-row">
                                                {columns.map(col => visibleColumns.has(col.key) && (
                                                    <td key={col.key}>
                                                        {col.key === 'name' ? (
                                                            renderEnquiryName(enquiry)
                                                        ) : formatCell(enquiry, col.key)}
                                                    </td>
                                                ))}
                                                <td className="text-right">
                                                    <div className="action-btns-wrapper">
                                                        <button onClick={() => handleFollowUp(enquiry)} className="action-btn-circle btn-phone" title="Follow Up">
                                                            <Phone size={14} />
                                                        </button>
                                                        <button onClick={() => handleEdit(enquiry)} className="action-btn-circle btn-edit-circle" title="Edit">
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button onClick={() => handleDelete(enquiry.id)} className="action-btn-circle btn-delete-circle" title="Delete">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Section */}
                        {!initialLoading && totalItems > 0 && (
                            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
                                <div style={{ color: '#64748b', fontSize: '14px' }}>
                                    Showing {(currentPage - 1) * safeRecordsPerPage + 1} to {Math.min(currentPage * safeRecordsPerPage, totalItems)} of {totalItems} entries
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
                </div>
            </div>

            <AddEnquiryModal show={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={() => { fetchEnquiryList(); }} classList={classList} sourceList={sourceList} referenceList={referenceList} staffList={staffList} />
            <EditEnquiryModal show={showEditModal} onClose={() => setShowEditModal(false)} enquiryData={selectedEnquiry} onSuccess={() => { fetchEnquiryList(); }} classList={classList} sourceList={sourceList} referenceList={referenceList} staffList={staffList} />
            <FollowUpModal show={showFollowUpModal} onClose={() => setShowFollowUpModal(false)} enquiryData={selectedEnquiry} onSuccess={() => { fetchEnquiryList(); }} enquiryStatus={enquiryStatus} />
        </HelpdeskLayout>
    );
};

export default EnquiryView;
