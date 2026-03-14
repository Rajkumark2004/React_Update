import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams, Link } from 'react-router-dom';
import '../../../utils/include_files.js';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import { useSession } from '../../../context/SessionContext';
import { api } from '../../../services/api';
import { sanitizeAlphaWithSpaces, validateReference } from '../../../utils/validation';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable, buildExportData } from '../../../utils/tableExport';

const ReferenceEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { currentSession, clearSession } = useSession();

    // Stats/Session info
    const sessionYear = currentSession?.session || '2024-25';
    const appName = 'School Management System';

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

    // Form State
    const [formData, setFormData] = useState({
        reference: '',
        description: ''
    });
    const [saving, setSaving] = useState(false);

    // List State
    const [reference_list, setReferenceList] = useState([]);

    useEffect(() => {
        fetchReferenceList();
    }, []);

    const fetchReferenceList = async () => {
        try {
            const data = await api.getReferenceList();
            if (data.status && data.data) {
                setReferenceList(data.data);
            }
        } catch (error) {
            console.error('Error fetching reference list:', error);
        }
    };

    // Search & Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Column visibility
    const refColumns = [
        { key: 'reference', label: 'Reference' },
        { key: 'description', label: 'Description' }
    ];
    const [refVisibleCols, setRefVisibleCols] = useState(new Set(refColumns.map(c => c.key)));
    const [showRefColsDd, setShowRefColsDd] = useState(false);

    const filteredResults = reference_list.filter(item =>
        item.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        if (reference_list.length > 0) {
            const referenceToEdit = reference_list.find(item => item.id.toString() === id);
            if (referenceToEdit) {
                setFormData({
                    reference: referenceToEdit.reference,
                    description: referenceToEdit.description
                });
            }
        }
    }, [id, reference_list]);

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
            const response = await api.updateReference(id, formData);
            if (response.status) {
                toast.success('Reference updated successfully');
                navigate('/admin/reference');
            }
        } catch (error) {
            console.error('Error updating reference:', error);
            toast.error('Failed to update reference');
        } finally {
            setTimeout(() => setSaving(false), 5000);
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
            <Header
                appName={appName}
                userData={userData}
                pendingTasks={pendingTasks}
                handleLogout={handleLogout}
            />

            <Sidebar
                handleSearch={handleSearch}
                sessionYear={sessionYear}
                currentUrl="/admin/reference"
            />

            <div className="content-wrapper" style={{ minHeight: '710px', display: 'block' }}>
                <section className="content-header" style={{ display: 'block', padding: '15px 15px 0 15px' }}>

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
                                    <h3 className="box-title">Edit Reference</h3>
                                    <div className="box-tools pull-right">
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
                                    <div className="box-tools pull-right">
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="download_label">Reference List</div>

                                    {/* Controls */}
                                    <div className="row" style={{ marginBottom: '10px' }}>
                                        <div className="col-md-6">
                                            <div className="dt-buttons btn-group">
                                                <button className="btn btn-default btn-sm" title="Copy" onClick={() => {
                                                    const { headers, rows } = buildExportData(refColumns, refVisibleCols, filteredResults, (row, key) => row[key]);
                                                    copyToClipboard(headers, rows);
                                                }}>
                                                    <i className="fa fa-files-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="CSV" onClick={() => {
                                                    const { headers, rows } = buildExportData(refColumns, refVisibleCols, filteredResults, (row, key) => row[key]);
                                                    downloadCSV(headers, rows, 'reference_list.csv');
                                                }}>
                                                    <i className="fa fa-file-text-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="Excel" onClick={() => {
                                                    const { headers, rows } = buildExportData(refColumns, refVisibleCols, filteredResults, (row, key) => row[key]);
                                                    downloadExcel(headers, rows, 'reference_list.xls');
                                                }}>
                                                    <i className="fa fa-file-excel-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="PDF" onClick={() => {
                                                    const { headers, rows } = buildExportData(refColumns, refVisibleCols, filteredResults, (row, key) => row[key]);
                                                    downloadPDF(headers, rows, 'reference_list.pdf', 'Reference List');
                                                }}>
                                                    <i className="fa fa-file-pdf-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="Print" onClick={() => {
                                                    const { headers, rows } = buildExportData(refColumns, refVisibleCols, filteredResults, (row, key) => row[key]);
                                                    printTable(headers, rows, 'Reference List');
                                                }}>
                                                    <i className="fa fa-print"></i>
                                                </button>
                                                <div className="btn-group">
                                                    <button className="btn btn-default btn-sm" title="Columns" onClick={() => setShowRefColsDd(!showRefColsDd)}>
                                                        <i className="fa fa-columns"></i>
                                                    </button>
                                                    {showRefColsDd && (
                                                        <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 1000, background: '#fff', border: '1px solid #ccc', borderRadius: '4px', padding: '8px 10px', minWidth: '160px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                                                            {refColumns.map(col => (
                                                                <label key={col.key} style={{ display: 'block', cursor: 'pointer', padding: '2px 0', fontSize: '13px', fontWeight: 'normal' }}>
                                                                    <input type="checkbox" checked={refVisibleCols.has(col.key)} onChange={() => {
                                                                        setRefVisibleCols(prev => {
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
                                    <div className="table-responsive mailbox-messages overflow-visible">
                                        <table className="table table-hover table-striped table-bordered example">
                                            <thead>
                                                <tr>
                                                    {refColumns.map(col => refVisibleCols.has(col.key) && (
                                                        <th key={col.key}>{col.label}</th>
                                                    ))}
                                                    <th className="text-right noExport">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentItems.map((value, key) => (
                                                    <tr key={key}>
                                                        {refColumns.map(col => refVisibleCols.has(col.key) && (
                                                            <td key={col.key} className="mailbox-name">{value[col.key]}</td>
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
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination Footer */}
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
                    </div>
                </section >
            </div >
            <Footer />
        </div >
    );
};

export default ReferenceEdit;
