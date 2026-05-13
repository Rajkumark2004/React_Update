import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';
import { api } from '../../services/api';
import { buildExportData } from '../../utils/tableExport';
import PremiumTableToolbar from '../../utils/PremiumTableToolbar';
import toast from 'react-hot-toast';
import './HomeworkLayout.css';
import '../../utils/include_files';

const StudentDiaryList = () => {
    const navigate = useNavigate();

    // Data states
    const [diaryList, setDiaryList] = useState([]);
    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Search and Filter states
    const [topSearchText, setTopSearchText] = useState('');
    const [appliedTopSearch, setAppliedTopSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterForm, setFilterForm] = useState({
        class_id: '',
        section_id: ''
    });
    const [validationErrors, setValidationErrors] = useState({});

    // Pagination and Table states
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);
    const columns = [
        { key: 'class', label: 'Class', sortKey: 'class' },
        { key: 'section', label: 'Section', sortKey: 'section' },
        { key: 'date', label: 'Date', sortKey: 'date' },
        { key: 'assigned_by', label: 'Created By', sortKey: 'assigned_by' }
    ];
    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showEvaluateModal, setShowEvaluateModal] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);

    // Form states for modals
    const [addFormData, setAddFormData] = useState({
        class_id: '',
        section_id: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        file: null
    });
    const [editFormData, setEditFormData] = useState({
        id: '',
        class_id: '',
        section_id: '',
        date: '',
        description: '',
        file: null,
        existing_file: ''
    });

    // Fetch initial data
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setInitialLoading(true);
                const classRes = await api.getClasses();
                if (classRes && classRes.status === 'success' && classRes.classsectionlist) {
                    setClassList([...classRes.classsectionlist].reverse());
                }
                await fetchDiaryList();
            } catch (err) {
                console.error("Initialization error:", err);
            } finally {
                setInitialLoading(false);
            }
        };
        loadInitialData();
    }, []);

    const fetchDiaryList = async (filters = null) => {
        try {
            setLoading(true);
            const response = await api.getStudentDiaryList(filters || {});
            if (response && response.status && response.data) {
                setDiaryList(response.data);
            } else {
                setDiaryList([]);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            setDiaryList([]);
        } finally {
            setLoading(false);
        }
    };

    const handleClassChange = async (e, mode = 'filter') => {
        const classId = e.target.value;
        if (mode === 'filter') {
            setFilterForm(prev => ({ ...prev, class_id: classId, section_id: '' }));
        } else if (mode === 'add') {
            setAddFormData(prev => ({ ...prev, class_id: classId, section_id: '' }));
        } else if (mode === 'edit') {
            setEditFormData(prev => ({ ...prev, class_id: classId, section_id: '' }));
        }

        if (classId) {
            try {
                const res = await api.getSectionsByClass(classId);
                setSectionList(res.data || res || []);
            } catch (error) {
                setSectionList([]);
            }
        } else {
            setSectionList([]);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setAppliedTopSearch(topSearchText);
        setCurrentPage(1);
    };

    const handleApplyFilters = async (e) => {
        e.preventDefault();
        if (!filterForm.class_id) {
            setValidationErrors({ class_id: 'Required' });
            return;
        }
        setValidationErrors({});
        await fetchDiaryList(filterForm);
        setCurrentPage(1);
    };

    const handleToggleColumn = (key) => {
        setVisibleColumns(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const getExportData = () => buildExportData(columns, visibleColumns, finalFilteredList, (row, key) => row[key] || '');

    const finalFilteredList = diaryList.filter(item => {
        const searchStr = (appliedTopSearch).toLowerCase();
        if (!searchStr) return true;
        return (
            (item.class || '').toLowerCase().includes(searchStr) ||
            (item.section || '').toLowerCase().includes(searchStr) ||
            (item.assigned_by || '').toLowerCase().includes(searchStr) ||
            (item.date || '').toLowerCase().includes(searchStr)
        );
    });

    const currentRecords = finalFilteredList.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);
    const totalPages = Math.ceil(finalFilteredList.length / recordsPerPage);

    // Modal Action Handlers
    const handleAddClick = () => {
        setAddFormData({
            class_id: '',
            section_id: '',
            date: new Date().toISOString().split('T')[0],
            description: '',
            file: null
        });
        setSectionList([]);
        setShowAddModal(true);
    };

    const handleEditClick = async (item) => {
        setSelectedEntry(item);
        setEditFormData({
            id: item.id,
            class_id: item.class_id || '',
            section_id: item.section_id || '',
            date: item.date || '',
            description: item.description || '',
            file: null,
            existing_file: item.document || ''
        });
        if (item.class_id) {
            const res = await api.getSectionsByClass(item.class_id);
            setSectionList(res.data || res || []);
        }
        setShowEditModal(true);
    };

    const handleEvaluateClick = (item) => {
        setSelectedEntry(item);
        setShowEvaluateModal(true);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await api.deleteStudentDiary(id);
                toast.success('Record deleted');
                fetchDiaryList();
            } catch (error) {
                toast.error('Failed to delete');
            }
        }
    };

    // Modal Submits
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = new FormData();
            Object.keys(addFormData).forEach(key => {
                if (key === 'file' && addFormData[key]) submitData.append('userfile', addFormData[key]);
                else if (key !== 'file') submitData.append(key, addFormData[key]);
            });
            submitData.append('assigned_by', 'Admin'); 
            await api.createStudentDiary(submitData);
            toast.success('Diary entry added');
            setShowAddModal(false);
            fetchDiaryList();
        } catch (error) {
            toast.error('Failed to save');
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = new FormData();
            submitData.append('id', editFormData.id);
            submitData.append('class_id', editFormData.class_id);
            submitData.append('section_id', editFormData.section_id);
            submitData.append('date', editFormData.date);
            submitData.append('description', editFormData.description);
            submitData.append('assigned_by', 'Admin');
            if (editFormData.file) submitData.append('userfile', editFormData.file);

            await api.updateStudentDiary(submitData);
            toast.success('Diary entry updated');
            setShowEditModal(false);
            fetchDiaryList();
        } catch (error) {
            toast.error('Failed to update');
        }
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)', backgroundColor: '#f8fafc' }}>
                
                {/* Premium Module Header */}
                <section className="homework-header-section">
                    <div className="homework-header-content">
                        <div className="homework-titles">
                            <h1>Student Diary</h1>
                            <p>Manage and track student classwise assessments and diary records</p>
                        </div>
                        <div className="homework-actions">
                            <button onClick={handleAddClick} className="btn btn-primary" style={{ borderRadius: '8px', padding: '10px 24px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fff', color: '#7c4dff', border: 'none' }}>
                                <i className="fa fa-plus"></i> Add Diary Entry
                            </button>
                        </div>
                    </div>

                    <div className="homework-summary-cards">
                        <div className="homework-card active">
                            <div className="homework-card-header">
                                <span className="homework-card-title">Diary Entries</span>
                                <i className="fa fa-book homework-card-icon" style={{ color: '#7c4dff' }}></i>
                            </div>
                            <div className="homework-card-value">{diaryList.length}</div>
                            <div className="homework-card-subtitle">Total records in system</div>
                        </div>
                        <div className="homework-card">
                            <div className="homework-card-header">
                                <span className="homework-card-title">Daily Assignment</span>
                                <i className="fa fa-tasks homework-card-icon" style={{ color: '#448aff' }}></i>
                            </div>
                            <div className="homework-card-value">View</div>
                            <div className="homework-card-subtitle">Manage daily tasks</div>
                        </div>
                        <div className="homework-card">
                            <div className="homework-card-header">
                                <span className="homework-card-title">Classwise Homework</span>
                                <i className="fa fa-graduation-cap homework-card-icon" style={{ color: '#10b981' }}></i>
                            </div>
                            <div className="homework-card-value">List</div>
                            <div className="homework-card-subtitle">Track academic progress</div>
                        </div>
                    </div>
                </section>

                <section className="content" style={{ marginTop: '50px', padding: '20px' }}>
                    <div className="row">
                        <div className="col-md-12">
                            
                            {/* Premium Search & Filter Bar */}
                            <div className="sis-search-bar-container" style={{ marginBottom: '24px' }}>
                                <div className="sis-search-bar-header">
                                    <h3 className="sis-search-title">Search & Filters</h3>
                                </div>
                                <form onSubmit={handleSearchSubmit} className="sis-search-form">
                                    <div className="sis-search-main-input-wrapper">
                                        <i className="fa fa-search sis-search-icon"></i>
                                        <input
                                            type="text"
                                            className="sis-search-input"
                                            placeholder="Search by class, section, creator, or date..."
                                            value={topSearchText}
                                            onChange={(e) => setTopSearchText(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-default sis-filter-toggle-btn"
                                            onClick={() => setShowFilters(!showFilters)}
                                            style={{ marginRight: '8px' }}
                                        >
                                            <i className="fa fa-filter"></i> Filters
                                        </button>
                                        <button type="submit" className="btn btn-primary" style={{ marginRight: '4px' }}>
                                            Search
                                        </button>
                                    </div>

                                    {showFilters && (
                                        <div className="sis-advanced-filters">
                                            <div className="sis-filter-row" style={{ flexWrap: 'wrap', gap: '16px' }}>
                                                <div className="sis-filter-col" style={{ flex: '1', minWidth: '200px' }}>
                                                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Class</label>
                                                    <select name="class_id" className="sis-filter-select" value={filterForm.class_id} onChange={(e) => handleClassChange(e, 'filter')}>
                                                        <option value="">Select Class</option>
                                                        {classList.map(c => <option key={c.id} value={c.id}>{c.class}</option>)}
                                                    </select>
                                                </div>
                                                <div className="sis-filter-col" style={{ flex: '1', minWidth: '200px' }}>
                                                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Section</label>
                                                    <select name="section_id" className="sis-filter-select" value={filterForm.section_id} onChange={(e) => setFilterForm(p => ({ ...p, section_id: e.target.value }))} disabled={!filterForm.class_id}>
                                                        <option value="">Select Section</option>
                                                        {sectionList.map(s => <option key={s.section_id || s.id} value={s.section_id}>{s.section}</option>)}
                                                    </select>
                                                </div>
                                                <div className="sis-filter-col" style={{ display: 'flex', alignItems: 'flex-end', flex: '0 0 auto' }}>
                                                    <button onClick={handleApplyFilters} className="btn btn-primary sis-apply-btn" disabled={loading} style={{ height: '40px', width: '100px' }}>
                                                        {loading ? <i className="fa fa-spinner fa-spin"></i> : 'Apply'}
                                                    </button>
                                                </div>
                                            </div>
                                            {validationErrors.class_id && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px' }}>Class is required for filtering.</div>}
                                        </div>
                                    )}
                                </form>
                            </div>

                            {/* Premium Listing Container */}
                            <div className="sis-list-container" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                                <div className="sis-list-header" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>Diary Records ({finalFilteredList.length})</h3>
                                    <PremiumTableToolbar
                                        columns={columns}
                                        visibleColumns={visibleColumns}
                                        onToggleColumn={handleToggleColumn}
                                        getExportData={getExportData}
                                        exportFileName="Student_Diary_Report"
                                        exportTitle="Student Diary Records"
                                        recordsPerPage={recordsPerPage}
                                        onRecordsPerPageChange={(num) => { setRecordsPerPage(num); setCurrentPage(1); }}
                                    />
                                </div>

                                <div className="sis-list-body" style={{ padding: '0' }}>
                                    <div className="table-responsive">
                                        <table className="table table-hover sis-listing-table" style={{ margin: 0 }}>
                                            <thead>
                                                <tr style={{ background: '#f8fafc' }}>
                                                    {columns.map(col => visibleColumns.has(col.key) && (
                                                        <th key={col.key} style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                                                            {col.label}
                                                        </th>
                                                    ))}
                                                    <th className="text-right noExport" style={{ padding: '12px 24px', borderBottom: '1px solid #e2e8f0', width: '150px' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading || initialLoading ? (
                                                    <tr>
                                                        <td colSpan={visibleColumns.size + 1} className="text-center p-5">
                                                            <Loader type="table" rows={5} />
                                                        </td>
                                                    </tr>
                                                ) : currentRecords.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={visibleColumns.size + 1} className="text-center p-5">
                                                            <div className="sis-empty-state" style={{ padding: '40px 0' }}>
                                                                <img src="/images/addnewitem.svg" alt="No Data" style={{ width: '150px', marginBottom: '16px', opacity: 0.6 }} />
                                                                <p style={{ color: '#64748b', fontSize: '15px' }}>No diary entries found matching your search.</p>
                                                                <button onClick={handleAddClick} className="btn btn-link text-primary" style={{ fontWeight: '600' }}>Add your first entry</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    currentRecords.map((item, idx) => (
                                                        <tr key={item.id || idx}>
                                                            {visibleColumns.has('class') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#334155' }}>{item.class}</td>}
                                                            {visibleColumns.has('section') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#334155' }}>{item.section}</td>}
                                                            {visibleColumns.has('date') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#334155' }}>{item.date}</td>}
                                                            {visibleColumns.has('assigned_by') && <td style={{ padding: '12px 24px', fontSize: '14px', color: '#334155' }}>{item.assigned_by}</td>}
                                                            <td className="text-right white-space-nowrap noExport" style={{ padding: '12px 24px' }}>
                                                                <button onClick={() => handleEvaluateClick(item)} className="btn btn-default btn-xs" title="Evaluate" style={{ marginRight: '6px', borderRadius: '6px', width: '32px', height: '32px' }}>
                                                                    <i className="fa fa-reorder"></i>
                                                                </button>
                                                                <button onClick={() => handleEditClick(item)} className="btn btn-default btn-xs" title="Edit" style={{ marginRight: '6px', borderRadius: '6px', width: '32px', height: '32px' }}>
                                                                    <i className="fa fa-pencil"></i>
                                                                </button>
                                                                <button onClick={() => handleDeleteClick(item.id)} className="btn btn-default btn-xs" title="Delete" style={{ borderRadius: '6px', width: '32px', height: '32px' }}>
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

                                {/* Premium Pagination Footer */}
                                {!loading && finalFilteredList.length > 0 && (
                                    <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', background: '#fafafa', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                                        <div style={{ color: '#64748b', fontSize: '14px' }}>
                                            Showing {(currentPage - 1) * recordsPerPage + 1} to {Math.min(currentPage * recordsPerPage, finalFilteredList.length)} of {finalFilteredList.length} entries
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="btn btn-default btn-sm" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff' }}>
                                                <i className="fa fa-angle-left"></i>
                                            </button>
                                            <button className="btn btn-sm" style={{ borderRadius: '8px', background: '#7c4dff', color: '#fff', minWidth: '36px', fontWeight: '600' }}>
                                                {currentPage}
                                            </button>
                                            <button className="btn btn-default btn-sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(prev => prev + 1)} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff' }}>
                                                <i className="fa fa-angle-right"></i>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Premium Add Modal */}
            {showAddModal && (
                <div className="modal fade in" style={{ display: 'block', zIndex: 1050 }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content" style={{ borderRadius: '12px', overflow: 'hidden', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #7c4dff 0%, #448aff 100%)', color: '#fff', padding: '20px 24px' }}>
                                <button type="button" className="close" onClick={() => setShowAddModal(false)} style={{ color: '#fff', opacity: 1 }}>&times;</button>
                                <h4 className="modal-title" style={{ fontWeight: '700', fontSize: '18px' }}>Add Student Diary Entry</h4>
                            </div>
                            <form onSubmit={handleAddSubmit}>
                                <div className="modal-body" style={{ padding: '24px' }}>
                                    <div className="row">
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label style={{ fontWeight: '600', color: '#475569', marginBottom: '8px', display: 'block' }}>Class <small className="text-danger">*</small></label>
                                                <select className="form-control" name="class_id" value={addFormData.class_id} onChange={(e) => handleClassChange(e, 'add')} required style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '42px' }}>
                                                    <option value="">Select Class</option>
                                                    {classList.map(c => <option key={c.id} value={c.id}>{c.class}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label style={{ fontWeight: '600', color: '#475569', marginBottom: '8px', display: 'block' }}>Section <small className="text-danger">*</small></label>
                                                <select className="form-control" name="section_id" value={addFormData.section_id} onChange={(e) => setAddFormData(p => ({ ...p, section_id: e.target.value }))} required disabled={!addFormData.class_id} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '42px' }}>
                                                    <option value="">Select Section</option>
                                                    {sectionList.map(s => <option key={s.section_id || s.id} value={s.section_id}>{s.section}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label style={{ fontWeight: '600', color: '#475569', marginBottom: '8px', display: 'block' }}>Date <small className="text-danger">*</small></label>
                                                <input type="date" className="form-control" name="date" value={addFormData.date} onChange={(e) => setAddFormData(p => ({ ...p, date: e.target.value }))} required style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '42px' }} />
                                            </div>
                                        </div>
                                        <div className="col-md-12" style={{ marginTop: '16px' }}>
                                            <div className="form-group">
                                                <label style={{ fontWeight: '600', color: '#475569', marginBottom: '8px', display: 'block' }}>Description <small className="text-danger">*</small></label>
                                                <textarea className="form-control" name="description" value={addFormData.description} onChange={(e) => setAddFormData(p => ({ ...p, description: e.target.value }))} required style={{ borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '120px' }}></textarea>
                                            </div>
                                        </div>
                                        <div className="col-md-12" style={{ marginTop: '16px' }}>
                                            <div className="form-group">
                                                <label style={{ fontWeight: '600', color: '#475569', marginBottom: '8px', display: 'block' }}>Attach Document</label>
                                                <input type="file" className="form-control" onChange={(e) => setAddFormData(p => ({ ...p, file: e.target.files[0] }))} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer" style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                                    <button type="button" className="btn btn-default" onClick={() => setShowAddModal(false)} style={{ borderRadius: '8px', fontWeight: '600', padding: '8px 20px' }}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" style={{ borderRadius: '8px', fontWeight: '600', padding: '8px 24px', background: '#7c4dff', border: 'none' }}>Save Entry</button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="modal-backdrop fade in" style={{ zIndex: 1040 }}></div>
                </div>
            )}

            {/* Premium Edit Modal */}
            {showEditModal && (
                <div className="modal fade in" style={{ display: 'block', zIndex: 1050 }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content" style={{ borderRadius: '12px', overflow: 'hidden', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #448aff 0%, #7c4dff 100%)', color: '#fff', padding: '20px 24px' }}>
                                <button type="button" className="close" onClick={() => setShowEditModal(false)} style={{ color: '#fff', opacity: 1 }}>&times;</button>
                                <h4 className="modal-title" style={{ fontWeight: '700', fontSize: '18px' }}>Edit Diary Entry</h4>
                            </div>
                            <form onSubmit={handleEditSubmit}>
                                <div className="modal-body" style={{ padding: '24px' }}>
                                    <div className="row">
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label style={{ fontWeight: '600', color: '#475569', marginBottom: '8px', display: 'block' }}>Class <small className="text-danger">*</small></label>
                                                <select className="form-control" name="class_id" value={editFormData.class_id} onChange={(e) => handleClassChange(e, 'edit')} required style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '42px' }}>
                                                    <option value="">Select Class</option>
                                                    {classList.map(c => <option key={c.id} value={c.id}>{c.class}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label style={{ fontWeight: '600', color: '#475569', marginBottom: '8px', display: 'block' }}>Section <small className="text-danger">*</small></label>
                                                <select className="form-control" name="section_id" value={editFormData.section_id} onChange={(e) => setEditFormData(p => ({ ...p, section_id: e.target.value }))} required disabled={!editFormData.class_id} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '42px' }}>
                                                    <option value="">Select Section</option>
                                                    {sectionList.map(s => <option key={s.section_id || s.id} value={s.section_id}>{s.section}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label style={{ fontWeight: '600', color: '#475569', marginBottom: '8px', display: 'block' }}>Date <small className="text-danger">*</small></label>
                                                <input type="date" className="form-control" name="date" value={editFormData.date} onChange={(e) => setEditFormData(p => ({ ...p, date: e.target.value }))} required style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '42px' }} />
                                            </div>
                                        </div>
                                        <div className="col-md-12" style={{ marginTop: '16px' }}>
                                            <div className="form-group">
                                                <label style={{ fontWeight: '600', color: '#475569', marginBottom: '8px', display: 'block' }}>Description <small className="text-danger">*</small></label>
                                                <textarea className="form-control" name="description" value={editFormData.description} onChange={(e) => setEditFormData(p => ({ ...p, description: e.target.value }))} required style={{ borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '120px' }}></textarea>
                                            </div>
                                        </div>
                                        <div className="col-md-12" style={{ marginTop: '16px' }}>
                                            <div className="form-group">
                                                <label style={{ fontWeight: '600', color: '#475569', marginBottom: '8px', display: 'block' }}>Attach New Document (Optional)</label>
                                                <input type="file" className="form-control" onChange={(e) => setEditFormData(p => ({ ...p, file: e.target.files[0] }))} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px' }} />
                                                {editFormData.existing_file && <small className="text-muted">Current file: {editFormData.existing_file.split('/').pop()}</small>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer" style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                                    <button type="button" className="btn btn-default" onClick={() => setShowEditModal(false)} style={{ borderRadius: '8px', fontWeight: '600', padding: '8px 20px' }}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" style={{ borderRadius: '8px', fontWeight: '600', padding: '8px 24px', background: '#448aff', border: 'none' }}>Update Entry</button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="modal-backdrop fade in" style={{ zIndex: 1040 }}></div>
                </div>
            )}

            {/* Premium Evaluate Modal (View Only / Summary) */}
            {showEvaluateModal && selectedEntry && (
                <div className="modal fade in" style={{ display: 'block', zIndex: 1050 }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content" style={{ borderRadius: '12px', overflow: 'hidden', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                            <div className="modal-header" style={{ background: '#1e293b', color: '#fff', padding: '20px 24px' }}>
                                <button type="button" className="close" onClick={() => setShowEvaluateModal(false)} style={{ color: '#fff', opacity: 1 }}>&times;</button>
                                <h4 className="modal-title" style={{ fontWeight: '700', fontSize: '18px' }}>Diary Details & Evaluation</h4>
                            </div>
                            <div className="modal-body" style={{ padding: '0', display: 'flex' }}>
                                <div style={{ flex: 1, padding: '24px', borderRight: '1px solid #e2e8f0' }}>
                                    <h5 style={{ fontWeight: '700', marginBottom: '16px', color: '#334155' }}>Description</h5>
                                    <div style={{ color: '#475569', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: selectedEntry.description || 'No description provided.' }}></div>
                                </div>
                                <div style={{ width: '300px', background: '#f8fafc', padding: '24px' }}>
                                    <h5 style={{ fontWeight: '700', marginBottom: '20px', color: '#334155' }}>Summary</h5>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div>
                                            <small style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '11px', fontWeight: '700' }}>Class / Section</small>
                                            <div style={{ fontWeight: '600', color: '#1e293b' }}>{selectedEntry.class} - {selectedEntry.section}</div>
                                        </div>
                                        <div>
                                            <small style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '11px', fontWeight: '700' }}>Date</small>
                                            <div style={{ fontWeight: '600', color: '#1e293b' }}>{selectedEntry.date}</div>
                                        </div>
                                        <div>
                                            <small style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '11px', fontWeight: '700' }}>Created By</small>
                                            <div style={{ fontWeight: '600', color: '#1e293b' }}>{selectedEntry.assigned_by}</div>
                                        </div>
                                        {selectedEntry.document && (
                                            <div>
                                                <small style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '11px', fontWeight: '700' }}>Attached Document</small>
                                                <div style={{ marginTop: '8px' }}>
                                                    <a href={`${api.baseHost}/uploads/homework/${selectedEntry.document}`} target="_blank" rel="noreferrer" className="btn btn-default btn-sm" style={{ width: '100%', borderRadius: '6px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <i className="fa fa-download"></i> Download File
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer" style={{ padding: '16px 24px', background: '#fff', borderTop: '1px solid #e2e8f0' }}>
                                <button type="button" className="btn btn-default" onClick={() => setShowEvaluateModal(false)} style={{ borderRadius: '8px', fontWeight: '600', padding: '8px 20px' }}>Close</button>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade in" style={{ zIndex: 1040 }}></div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default StudentDiaryList;
