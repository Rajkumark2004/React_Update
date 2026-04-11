import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import '../../../utils/include_files.js';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import Loader from '../../../components/Loader';
import { useSession } from '../../../context/SessionContext';
import { api } from '../../../services/api';
import { sanitizeAlphaWithSpaces, validateSource } from '../../../utils/validation';
import { buildExportData } from '../../../utils/tableExport';
import TableToolbar from '../../../utils/TableToolbar';
import Pagination from '../../../utils/Pagination';

const SourceEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { currentSession, clearSession } = useSession();


    // Form State
    const [formData, setFormData] = useState({
        source: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // List State
    const [source_list, setSourceList] = useState([]);

    const fetchSourceList = async () => {
        setInitialLoading(true);
        try {
            const data = await api.getSourceList();
            setSourceList(data.data || []);
        } catch (error) {
            console.error('Fetch Error:', error);
            setMessage({ type: 'danger', text: 'Failed to fetch source list' });
        } finally {
            setInitialLoading(false);
        }
    };

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);
    const [searchTerm, setSearchTerm] = useState('');
    const [initialLoading, setInitialLoading] = useState(true);

    // Column visibility
    const sourceColumns = [
        { key: 'source', label: 'Source' },
        { key: 'description', label: 'Description' }
    ];
    const [sourceVisibleCols, setSourceVisibleCols] = useState(new Set(sourceColumns.map(c => c.key)));

    const filteredResults = source_list.filter(item =>
        item.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate pagination
    const totalItems = filteredResults.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const totalPages = Math.ceil(totalItems / safeRecordsPerPage);
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentItems = filteredResults.slice(indexOfFirstItem, indexOfLastItem);

    const getExportData = () => buildExportData(sourceColumns, sourceVisibleCols, filteredResults, (row, key) => row[key]);

    const handleToggleColumn = (key) => {
        setSourceVisibleCols(prev => {
            const next = new Set(prev);
            if (next.has(key)) { next.delete(key); } else { next.add(key); }
            return next;
        });
    };

    useEffect(() => {
        fetchSourceList();
    }, []);

    useEffect(() => {
        const sourceToEdit = source_list.find(item => item.id.toString() === id);
        if (sourceToEdit) {
            setFormData({
                source: sourceToEdit.source,
                description: sourceToEdit.description
            });
        }
    }, [id, source_list]);

    const pendingTasks = [];

    // Handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let sanitized = value;
        if (name === 'source') sanitized = sanitizeAlphaWithSpaces(value);
        setFormData({ ...formData, [name]: sanitized });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        const sourceErr = validateSource(formData.source);
        if (sourceErr) {
            setMessage({ type: 'danger', text: sourceErr });
            return;
        }

        setLoading(true);

        try {
            const response = await api.updateSource(id, formData);
            setMessage({ type: 'success', text: response.message || 'Source updated successfully' });
            setTimeout(() => {
                navigate('/admin/source');
            }, 1000);
        } catch (error) {
            console.error('Update Error:', error);
            setMessage({ type: 'danger', text: error.message || 'An error occurred' });
        } finally {
            setTimeout(() => setLoading(false), 5000);
        }
    };

    const handleDelete = async (deleteId) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            setMessage({ type: '', text: '' });
            setLoading(true);
            try {
                const response = await api.deleteSource(deleteId);
                setMessage({ type: 'success', text: response.message || 'Source deleted successfully' });
                // If we deleted the item we are currently editing, navigate back
                if (deleteId.toString() === id) {
                    setTimeout(() => navigate('/admin/source'), 1500);
                } else {
                    fetchSourceList();
                }
            } catch (error) {
                console.error('Delete Error:', error);
                setMessage({ type: 'danger', text: error.message || 'Failed to delete source' });
            } finally {
                setLoading(false);
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            }
        }
    };



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
                                    <li><Link to="/admin/source" className="active">Source</Link></li>
                                    <li><Link to="/admin/reference">Reference</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Edit Source</h3>
                                    <div className="box-tools pull-right hidden-sm hidden-md hidden-lg">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <form id="form1" onSubmit={handleSubmit} method="post" acceptCharset="utf-8" encType="multipart/form-data">
                                    <div className="box-body">
                                        {message.text && (
                                            <div className={`alert alert-${message.type} alert-dismissible`}>
                                                {message.text}
                                            </div>
                                        )}
                                        <div className="form-group">
                                            <label htmlFor="pwd">Source</label> <small className="req"> *</small>
                                            <input
                                                className="form-control"
                                                id="description"
                                                name="source"
                                                maxLength={100}
                                                value={formData.source}
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
                                        <button type="submit" className="btn btn-info pull-right" disabled={loading}>
                                            {loading ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-default pull-right"
                                            style={{ marginRight: '10px' }}
                                            onClick={() => navigate('/admin/source')}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="col-md-5">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Source List</h3>
                                    <div className="box-tools pull-right hidden-xs">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <TableToolbar
                                        searchTerm={searchTerm}
                                        onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
                                        recordsPerPage={recordsPerPage}
                                        onRecordsPerPageChange={(val) => { setRecordsPerPage(val); setCurrentPage(1); }}
                                        columns={sourceColumns}
                                        visibleColumns={sourceVisibleCols}
                                        onToggleColumn={handleToggleColumn}
                                        getExportData={getExportData}
                                        exportFileName="source_list"
                                        exportTitle="Source List"
                                    />
                                    <div className="download_label">Source List</div>
                                    <div className="table-responsive mailbox-messages overflow-visible">
                                        <table className="table table-hover table-striped table-bordered example">
                                            <thead>
                                                <tr>
                                                    {sourceColumns.map(col => sourceVisibleCols.has(col.key) && (
                                                        <th key={col.key} style={{ width: col.key === 'source' ? '30%' : 'auto' }}>{col.label}</th>
                                                    ))}
                                                    <th className="text-right noExport" style={{ width: '150px' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {initialLoading ? (
                                                    <tr>
                                                        <td colSpan={sourceVisibleCols.size + 1} className="text-center">
                                                            <Loader type="table" rows={recordsPerPage === -1 ? 10 : recordsPerPage} />
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    currentItems.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={sourceVisibleCols.size + 1} className="text-center text-danger">No data available in table</td>
                                                        </tr>
                                                    ) : (
                                                        currentItems.map((value, key) => (
                                                            <tr key={key}>
                                                                {sourceColumns.map(col => sourceVisibleCols.has(col.key) && (
                                                                    <td key={col.key} className="mailbox-name" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{value[col.key]}</td>
                                                                ))}
                                                                <td className="mailbox-date pull-right noExport">
                                                                    <Link to={`/admin/source/edit/${value.id}`} className="btn btn-default btn-xs" data-toggle="tooltip" title="Edit">
                                                                        <i className="fa fa-pencil"></i>
                                                                    </Link>
                                                                    <Link to="#" onClick={() => handleDelete(value.id)} className="btn btn-default btn-xs" data-toggle="tooltip" title="Delete">
                                                                        <i className="fa fa-remove"></i>
                                                                    </Link>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )
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
                </section>
            </div >
            <Footer />
        </div >
    );
};

export default SourceEdit;