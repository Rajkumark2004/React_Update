import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import '../../../utils/include_files.js';
import Header from '../../../components/Header.jsx';
import Sidebar from '../../../components/Sidebar.jsx';
import Footer from '../../../components/Footer.jsx';
import Loader from '../../../components/Loader.jsx';
import { useSession } from '../../../context/SessionContext.jsx';
import { api } from '../../../services/api';
import { sanitizeAlphaWithSpaces, validateReference } from '../../../utils/validation';
import { buildExportData } from '../../../utils/tableExport';
import TableToolbar from '../../../utils/TableToolbar';
import Pagination from '../../../utils/Pagination';

const ReferenceView = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    const pendingTasks = [];

    // Form State
    const [formData, setFormData] = useState({
        reference: '',
        description: ''
    });
    const [saving, setSaving] = useState(false);

    // List State
    const [reference_list, setReferenceList] = useState([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);
    const [searchTerm, setSearchTerm] = useState('');
    const [initialLoading, setInitialLoading] = useState(true);

    // Column visibility
    const refColumns = [
        { key: 'reference', label: 'Reference' },
        { key: 'description', label: 'Description' }
    ];
    const [refVisibleCols, setRefVisibleCols] = useState(new Set(refColumns.map(c => c.key)));

    const filteredResults = reference_list.filter(item =>
        item.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate pagination
    const totalItems = filteredResults.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const totalPages = Math.ceil(totalItems / safeRecordsPerPage);
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentItems = filteredResults.slice(indexOfFirstItem, indexOfLastItem);

    const getExportData = () => buildExportData(refColumns, refVisibleCols, filteredResults, (row, key) => row[key]);

    const handleToggleColumn = (key) => {
        setRefVisibleCols(prev => {
            const next = new Set(prev);
            if (next.has(key)) { next.delete(key); } else { next.add(key); }
            return next;
        });
    };

    useEffect(() => {
        fetchReferenceList();
    }, []);

    const fetchReferenceList = async () => {
        setInitialLoading(true);
        try {
            const data = await api.getReferenceList();
            if (data.status && data.data) {
                setReferenceList(data.data);
            }
        } catch (error) {
            console.error('Error fetching reference list:', error);
            toast.error('Failed to fetch reference list');
        } finally {
            setInitialLoading(false);
        }
    };



    // Handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let sanitized = value;
        if (name === 'reference') sanitized = sanitizeAlphaWithSpaces(value);
        setFormData({ ...formData, [name]: sanitized });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const refErr = validateReference(formData.reference);
        if (refErr) {
            toast.error(refErr);
            return;
        }

        setSaving(true);
        try {
            const response = await api.addReference(formData);
            if (response.status) {
                await fetchReferenceList(); // Refresh list
                setFormData({ reference: '', description: '' });
                toast.success(response.message || 'Reference saved successfully');
            } else {
                toast.error(response.message || 'Failed to save reference');
            }
        } catch (error) {
            console.error('Error saving reference:', error);
            toast.error(error.message || 'Failed to save reference');
        } finally {
            setSaving(false);
        }
    };



    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                const response = await api.deleteReference(id);
                if (response.status) {
                    toast.success('Reference deleted successfully');
                    await fetchReferenceList(); // Refresh list
                }
            } catch (error) {
                console.error('Error deleting reference:', error);
                toast.error('Failed to delete reference');
            }
        }
    };




    useEffect(() => {
        if (window.$ && window.$.fn && window.$.fn.popover) {
            window.$('.detail_popover').popover({
                placement: 'right',
                trigger: 'hover',
                container: 'body',
                html: true,
                content: function () {
                    return window.$(this).closest('td').find('.fee_detail_popover').html();
                }
            });
        }
    }, [reference_list]);

    return (
        <div className="wrapper">
            <Header />

            <Sidebar />

            <div className="content-wrapper" style={{ minHeight: '710px', display: 'block' }}>
                <section className="content-header" style={{ display: 'block', padding: '0px 15px 0 15px' }}>

                </section>
                <section className="content" style={{ paddingBottom: '80px' }}>
                    <div className="row">
                        <div className="col-md-3">
                            <div className="box border0">
                                <ul className="tablists">
                                    <li><Link to="/admin/source">Source</Link></li>
                                    <li><Link to="/admin/reference" className="active">Reference</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Add Reference</h3>
                                    <div className="box-tools pull-right hidden-sm hidden-md hidden-lg">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <form id="form1" onSubmit={handleSubmit} method="post" acceptCharset="utf-8" encType="multipart/form-data">
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label htmlFor="pwd">Reference</label> <small className="req"> *</small>
                                            <input
                                                className="form-control"
                                                id="description"
                                                name="reference"
                                                maxLength={100}
                                                value={formData.reference}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="pwd">Description</label>
                                            <textarea
                                                className="form-control"
                                                id="description"
                                                name="description"
                                                rows="3"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <button type="submit" className="btn btn-info pull-right" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="col-md-5">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Reference List</h3>
                                    <div className="box-tools pull-right hidden-xs">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="download_label">Reference List</div>

                                    <TableToolbar
                                        searchTerm={searchTerm}
                                        onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
                                        recordsPerPage={recordsPerPage}
                                        onRecordsPerPageChange={(val) => { setRecordsPerPage(val); setCurrentPage(1); }}
                                        columns={refColumns}
                                        visibleColumns={refVisibleCols}
                                        onToggleColumn={handleToggleColumn}
                                        getExportData={getExportData}
                                        exportFileName="reference_list"
                                        exportTitle="Reference List"
                                    />
                                    <div className="table-responsive mailbox-messages overflow-visible">
                                        <table className="table table-hover table-striped table-bordered example">
                                            <thead>
                                                <tr>
                                                    {refColumns.map(col => refVisibleCols.has(col.key) && (
                                                        <th key={col.key} style={{ width: col.key === 'reference' ? '30%' : 'auto' }}>{col.label}</th>
                                                    ))}
                                                    <th className="text-right noExport" style={{ width: '150px' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {initialLoading ? (
                                                    <tr>
                                                        <td colSpan={refVisibleCols.size + 1} className="text-center">
                                                            <Loader type="table" rows={recordsPerPage === -1 ? 10 : recordsPerPage} />
                                                        </td>
                                                    </tr>
                                                ) : currentItems.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={refVisibleCols.size + 1} className="text-center text-danger">No data available in table</td>
                                                    </tr>
                                                ) : (
                                                    currentItems.map((value, key) => (
                                                        <tr key={key}>
                                                            {refColumns.map(col => refVisibleCols.has(col.key) && (
                                                                <td key={col.key} className="mailbox-name" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{value[col.key]}</td>
                                                            ))}
                                                            <td className="mailbox-date pull-right">
                                                                <Link to={`/admin/reference/edit/${value.id}`} className="btn btn-default btn-xs" data-toggle="tooltip" title="Edit">
                                                                    <i className="fa fa-pencil"></i>
                                                                </Link>
                                                                <Link to="#" onClick={() => handleDelete(value.id)} className="btn btn-default btn-xs" data-toggle="tooltip" title="Delete">
                                                                    <i className="fa fa-remove"></i>
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination Footer */}
                                    <div className="pt15 pb15">
                                        <Pagination 
                                            totalItems={totalItems} 
                                            itemsPerPage={recordsPerPage} 
                                            currentPage={currentPage}
                                            onPageChange={(page) => setCurrentPage(page)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section >
            </div >
            <Footer />
        </div >
    );
};

export default ReferenceView;
