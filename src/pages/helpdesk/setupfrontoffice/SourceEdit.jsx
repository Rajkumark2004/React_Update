import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import '../../../utils/include_files.js';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import { useSession } from '../../../context/SessionContext';
import { api } from '../../../services/api';
import { sanitizeAlphaWithSpaces, validateSource } from '../../../utils/validation';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable, buildExportData } from '../../../utils/tableExport';

const SourceEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { currentSession, clearSession } = useSession();

    // Stats/Session info
    const sessionYear = currentSession?.session || '2024-25';
    const appName = 'School Management System';

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
        try {
            const data = await api.getSourceList();
            setSourceList(data.data || []);
        } catch (error) {
            console.error('Fetch Error:', error);
            setMessage({ type: 'danger', text: 'Failed to fetch source list' });
        }
    };

    // Search & Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Column visibility
    const sourceColumns = [
        { key: 'source', label: 'Source' },
        { key: 'description', label: 'Description' }
    ];
    const [sourceVisibleCols, setSourceVisibleCols] = useState(new Set(sourceColumns.map(c => c.key)));
    const [showSourceColsDd, setShowSourceColsDd] = useState(false);

    const filteredResults = source_list.filter(item =>
        item.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredResults.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

    const changePage = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
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

    // Mock User Data
    const [loggedInUser, setLoggedInUser] = useState(null);
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setLoggedInUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse user data:', e);
            }
        }
    }, []);

    const userData = loggedInUser ? {
        name: loggedInUser.username,
        role: Object.keys(loggedInUser.roles || {})[0] || 'User',
        id: loggedInUser.id,
        avatar: loggedInUser.image || '/uploads/staff_images/default_male.jpg'
    } : {
        name: 'Admin User',
        role: 'Super Admin',
        id: 1,
        avatar: '/uploads/staff_images/default_male.jpg'
    };

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

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        clearSession();
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Searching...');
    };

    return (
        <div className="wrapper">
            <Header
                appName={appName}
                userData={userData}
                pendingTasks={pendingTasks}
                handleLogout={handleLogout}
            />

            <Sidebar
                handleSearch={handleSearch}
                sessionYear={sessionYear}
                currentUrl="/admin/source"
            />

            <div className="content-wrapper" style={{ minHeight: '710px', display: 'block' }}>
                <section className="content-header" style={{ display: 'block', padding: '15px 15px 0 15px' }}>
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
                                    <div className="box-tools pull-right">
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
                                </div>
                                <div className="box-body">
                                    {/* Controls */}
                                    <div className="row" style={{ marginBottom: '10px' }}>
                                        <div className="col-md-6">
                                            <div className="dt-buttons btn-group">
                                                <button className="btn btn-default btn-sm" title="Copy" onClick={() => {
                                                    const { headers, rows } = buildExportData(sourceColumns, sourceVisibleCols, filteredResults, (row, key) => row[key]);
                                                    copyToClipboard(headers, rows);
                                                }}>
                                                    <i className="fa fa-files-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="CSV" onClick={() => {
                                                    const { headers, rows } = buildExportData(sourceColumns, sourceVisibleCols, filteredResults, (row, key) => row[key]);
                                                    downloadCSV(headers, rows, 'source_list.csv');
                                                }}>
                                                    <i className="fa fa-file-text-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="Excel" onClick={() => {
                                                    const { headers, rows } = buildExportData(sourceColumns, sourceVisibleCols, filteredResults, (row, key) => row[key]);
                                                    downloadExcel(headers, rows, 'source_list.xls');
                                                }}>
                                                    <i className="fa fa-file-excel-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="PDF" onClick={() => {
                                                    const { headers, rows } = buildExportData(sourceColumns, sourceVisibleCols, filteredResults, (row, key) => row[key]);
                                                    downloadPDF(headers, rows, 'source_list.pdf', 'Source List');
                                                }}>
                                                    <i className="fa fa-file-pdf-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="Print" onClick={() => {
                                                    const { headers, rows } = buildExportData(sourceColumns, sourceVisibleCols, filteredResults, (row, key) => row[key]);
                                                    printTable(headers, rows, 'Source List');
                                                }}>
                                                    <i className="fa fa-print"></i>
                                                </button>
                                                <div className="btn-group">
                                                    <button className="btn btn-default btn-sm" title="Columns" onClick={() => setShowSourceColsDd(!showSourceColsDd)}>
                                                        <i className="fa fa-columns"></i>
                                                    </button>
                                                    {showSourceColsDd && (
                                                        <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 1000, background: '#fff', border: '1px solid #ccc', borderRadius: '4px', padding: '8px 10px', minWidth: '160px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                                                            {sourceColumns.map(col => (
                                                                <label key={col.key} style={{ display: 'block', cursor: 'pointer', padding: '2px 0', fontSize: '13px', fontWeight: 'normal' }}>
                                                                    <input type="checkbox" checked={sourceVisibleCols.has(col.key)} onChange={() => {
                                                                        setSourceVisibleCols(prev => {
                                                                            const next = new Set(prev);
                                                                            if (next.has(col.key)) { next.delete(col.key); } else { next.add(col.key); }
                                                                            return next;
                                                                        });
                                                                    }} style={{ marginRight: '6px' }} />
                                                                    {col.label}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="input-group input-group-sm">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Search..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                                <span className="input-group-addon"><i className="fa fa-search"></i></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="download_label">Source List</div>
                                <div className="table-responsive mailbox-messages overflow-visible">
                                    <table className="table table-hover table-striped table-bordered example">
                                        <thead>
                                            <tr>
                                                {sourceColumns.map(col => sourceVisibleCols.has(col.key) && (
                                                    <th key={col.key}>{col.label}</th>
                                                ))}
                                                <th className="text-right noExport">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentItems.map((value, key) => (
                                                <tr key={key}>
                                                    {sourceColumns.map(col => sourceVisibleCols.has(col.key) && (
                                                        <td key={col.key} className="mailbox-name">{value[col.key]}</td>
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
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="row">
                                    <div className="col-md-5">
                                        <div className="dataTables_info">
                                            Records: {filteredResults.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredResults.length)} of {filteredResults.length}
                                        </div>
                                    </div>
                                    <div className="col-md-7">
                                        <div className="dataTables_paginate paging_simple_numbers">
                                            <ul className="pagination">
                                                <li className={`paginate_button previous ${currentPage === 1 ? 'disabled' : ''}`}>
                                                    <a href="#" onClick={(e) => { e.preventDefault(); changePage(currentPage - 1); }}>Previous</a>
                                                </li>
                                                {[...Array(totalPages)].map((_, i) => (
                                                    <li key={i} className={`paginate_button ${currentPage === i + 1 ? 'active' : ''}`}>
                                                        <a href="#" onClick={(e) => { e.preventDefault(); changePage(i + 1); }}>{i + 1}</a>
                                                    </li>
                                                ))}
                                                <li className={`paginate_button next ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                    <a href="#" onClick={(e) => { e.preventDefault(); changePage(currentPage + 1); }}>Next</a>
                                                </li>
                                            </ul>
                                        </div>
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