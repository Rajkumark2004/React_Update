import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import Loader from '../../components/Loader';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import '../../utils/include_files';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable, buildExportData } from '../../utils/tableExport';
import { toast } from 'react-hot-toast';

const DisableReason = () => {
    // Mock Permissions
    const canAdd = true;
    const canEdit = true;
    const canDelete = true;

    // Static Data
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState([]);

    // Responsive state
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    useEffect(() => {
        fetchDisableReasons();
    }, []);

    const fetchDisableReasons = async () => {
        try {
            setLoading(true);
            const response = await api.getDisableReasonsList();
            if (response && response.data) {
                setResults(response.data);
            } else if (Array.isArray(response)) {
                setResults(response);
            }
        } catch (error) {
            console.error('Error fetching disable reasons:', error);
            toast.error('Failed to load disable reasons');
        } finally {
            setLoading(false);
        }
    };

    const [formData, setFormData] = useState({
        name: ''
    });

    const [searchTerm, setSearchTerm] = useState('');
    const filteredResults = results.filter(item =>
        item.reason?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Column visibility
    const columns = [
        { key: 'reason', label: 'Disable Reason' },
    ];
    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));
    const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

    const toggleColumn = (key) => {
        setVisibleColumns(prev => {
            const next = new Set(prev);
            if (next.has(key)) { next.delete(key); } else { next.add(key); }
            return next;
        });
    };

    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(10);

    // Pagination Logic
    const totalItems = filteredResults.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const totalPages = Math.ceil(totalItems / safeRecordsPerPage);
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentItems = filteredResults.slice(indexOfFirstItem, indexOfLastItem);

    const changePage = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    };

    // Export helpers
    const getExportData = () => buildExportData(columns, visibleColumns, filteredResults, (row, key) => row[key]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                const response = await api.deleteDisableReason(id);
                if (response.status) {
                    toast.success(response.message || 'Record Deleted Successfully');
                    fetchDisableReasons();
                } else {
                    toast.error(response.error || 'Failed to delete record');
                }
            } catch (error) {
                console.error('Error deleting disable reason:', error);
                toast.error('An error occurred while deleting');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let response;
            response = await api.addDisableReason(formData);

            if (response.status) {
                fetchDisableReasons();
                setFormData({ name: '' });
                toast.success(response.message || 'Record Saved Successfully');
            } else {
                toast.error(response.message || 'Failed to save record');
            }
        } catch (error) {
            console.error('Error saving disable reason:', error);
            toast.error(error.message || 'An error occurred while saving');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                {/* Main content */}
                <section className="content">
                    <div className="row">
                        <div className="col-md-2 hide-mobile">
                            <div className="box border0">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Student Information</h3>
                                </div>
                                <ul className="tablists">
                                    <li><Link to="/student/search"><img src="/images/student_details.png" alt="icon1" className="img-fluid" style={{ width: '20px' }} /> Student Details</Link></li>
                                    <li><Link to="/student/create"><img src="/images/student_admission.png" alt="icon2" className="img-fluid" style={{ width: '20px' }} /> Student Admission</Link></li>
                                    <li><Link to="/admin/onlinestudent"><img src="/images/online_admission.png" alt="icon3" className="img-fluid" style={{ width: '20px' }} /> Online Admission</Link></li>
                                    <li><Link to="/student/disabled"><img src="/images/disabled_students.png" alt="icon4" className="img-fluid" style={{ width: '20px' }} /> Disabled Students</Link></li>
                                    <li><Link to="/admin/disable-reason" className="active"><img src="/images/disabled_reason.png" alt="icon7" className="img-fluid" style={{ width: '20px' }} /> Disable Reason</Link></li>
                                </ul>
                            </div>
                        </div>

                        <div className="col-md-10">
                            <div className="row">
                                {canAdd && (
                                    <div className="col-md-4">
                                        <div className="box box-primary">
                                            <div className="box-header with-border">
                                                <h3 className="box-title"><i className="fa fa-users"></i> Add Disable Reason</h3>
                                            </div>
                                            <form id="form1" onSubmit={handleSubmit} name="employeeform" method="post" acceptCharset="utf-8">
                                                <div className="box-body">
                                                    <div className="row">
                                                        <input type="hidden" id="reason_id" name="reason_id" />
                                                        <div className="col-sm-12">
                                                            <div className="form-group">
                                                                <label htmlFor="name">Disable Reason</label><small className="req"> *</small>
                                                                <input
                                                                    type="text"
                                                                    name="name"
                                                                    id="name"
                                                                    className="form-control"
                                                                    value={formData.name}
                                                                    onChange={handleChange}
                                                                />
                                                                <span className="text-danger"></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="box-footer">
                                                    <button type="submit" className="btn btn-info pull-right">Save</button>

                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                )}

                                <div className={`col-md-${canAdd ? '8' : '12'}`}>
                                    <div className="box box-primary">
                                        <div className="box-header ptbnull">
                                            <h3 className="box-title"><i className="fa fa-users"></i> Disable Reason List</h3>
                                            <div className="btn-group pull-right">
                                                <button onClick={() => window.history.back()} className="btn btn-primary btn-sm"> <i className="fa fa-arrow-left"></i> Back</button>
                                            </div>
                                        </div>
                                        <div className="box-body">
                                            <div className="download_label">Disable Reason List</div>

                                            {/* Responsive Toolbar */}
                                            <div
                                                className="row mb-2"
                                                style={{
                                                    marginBottom: '10px',
                                                    display: isMobile ? 'flex' : 'block',
                                                    flexDirection: isMobile ? 'column' : 'row',
                                                    alignItems: isMobile ? 'center' : 'stretch',
                                                    gap: isMobile ? '15px' : '0'
                                                }}
                                            >
                                                <div
                                                    className={isMobile ? "" : "col-sm-6"}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: isMobile ? '15px' : '20px',
                                                        justifyContent: isMobile ? 'center' : 'flex-start',
                                                        flexWrap: 'wrap'
                                                    }}
                                                >
                                                    <div className="dataTables_length">
                                                        <label style={{ fontWeight: 'normal', display: 'flex', alignItems: 'center', margin: 0 }}>
                                                            Records:
                                                            <select
                                                                value={recordsPerPage}
                                                                onChange={(e) => {
                                                                    setRecordsPerPage(Number(e.target.value));
                                                                    setCurrentPage(1);
                                                                }}
                                                                className="form-control input-sm"
                                                                style={{ width: '80px', margin: '0 10px' }}
                                                            >
                                                                <option value="10">10</option>
                                                                <option value="25">25</option>
                                                                <option value="50">50</option>
                                                                <option value="100">100</option>
                                                                <option value="-1">All</option>
                                                            </select>
                                                        </label>
                                                    </div>
                                                    <div className="dataTables_filter">
                                                        <input
                                                            type="search"
                                                            className="form-control input-sm"
                                                            placeholder="Search..."
                                                            style={{
                                                                marginLeft: isMobile ? '0' : '10px',
                                                                display: 'inline-block',
                                                                width: '180px',
                                                                border: 'none',
                                                                borderBottom: '1px solid #ccc',
                                                                borderRadius: '0',
                                                                boxShadow: 'none',
                                                                backgroundColor: 'transparent',
                                                                paddingLeft: '0',
                                                                outline: 'none',
                                                                textAlign: isMobile ? 'center' : 'left'
                                                            }}
                                                            value={searchTerm}
                                                            onChange={(e) => {
                                                                setSearchTerm(e.target.value);
                                                                setCurrentPage(1);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className={isMobile ? "text-center" : "col-sm-6 text-right"}>
                                                    <div className="dt-buttons btn-group">
                                                        <button className="btn btn-default btn-sm" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }} style={{ borderTopLeftRadius: '20px', borderBottomLeftRadius: '20px' }}>
                                                            <i className="fa fa-files-o"></i>
                                                        </button>
                                                        <button className="btn btn-default btn-sm" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'disable_reasons.csv'); }}>
                                                            <i className="fa fa-file-text-o"></i>
                                                        </button>
                                                        <button className="btn btn-default btn-sm" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'disable_reasons.xls'); }}>
                                                            <i className="fa fa-file-excel-o"></i>
                                                        </button>
                                                        <button className="btn btn-default btn-sm" title="PDF" onClick={() => { const { headers, rows } = getExportData(); downloadPDF(headers, rows, 'disable_reasons.pdf', 'Disable Reason List'); }}>
                                                            <i className="fa fa-file-pdf-o"></i>
                                                        </button>
                                                        <button className="btn btn-default btn-sm" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Disable Reason List'); }}>
                                                            <i className="fa fa-print"></i>
                                                        </button>
                                                        <div className="btn-group">
                                                            <button className="btn btn-default btn-sm" title="Columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)} style={{ borderTopRightRadius: '20px', borderBottomRightRadius: '20px' }}>
                                                                <i className="fa fa-columns"></i>
                                                            </button>
                                                            {showColumnsDropdown && (
                                                                <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 1000, background: '#fff', border: '1px solid #ccc', borderRadius: '4px', padding: '8px 10px', minWidth: '180px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                                                                    {columns.map(col => (
                                                                        <label key={col.key} style={{ display: 'block', cursor: 'pointer', padding: '2px 0', fontSize: '13px', fontWeight: 'normal', textAlign: 'left' }}>
                                                                            <input type="checkbox" checked={visibleColumns.has(col.key)} onChange={() => toggleColumn(col.key)} style={{ marginRight: '6px' }} />
                                                                            {col.label}
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Table */}
                                            <div className="mailbox-messages">
                                                {loading ? (
                                                    <Loader rows={5} />
                                                ) : (
                                                    <div className="slide-in table-responsive overflow-visible-lg">
                                                        <table className="table table-hover table-striped table-bordered example">
                                                            <thead>
                                                                <tr>
                                                                    {columns.map(col => visibleColumns.has(col.key) && (
                                                                        <th key={col.key}>{col.label}</th>
                                                                    ))}
                                                                    <th className="text-right noExport">Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {currentItems.map((value) => (
                                                                    <tr key={value.id}>
                                                                        {visibleColumns.has('reason') && <td style={{ wordBreak: 'break-word' }}>{value.reason}</td>}
                                                                        <td className="text-right">
                                                                            {canEdit && (
                                                                                <Link
                                                                                    className="btn btn-default btn-xs"
                                                                                    to={`/admin/disable_reason/edit/${value.id}`}
                                                                                    data-toggle="tooltip"
                                                                                    title="Edit"
                                                                                    style={{ marginRight: '5px' }}
                                                                                >
                                                                                    <i className="fa fa-pencil"></i>
                                                                                </Link>
                                                                            )}
                                                                            {canDelete && (
                                                                                <a
                                                                                    onClick={() => handleDelete(value.id)}
                                                                                    className="btn btn-default btn-xs"
                                                                                    href="#"
                                                                                    data-toggle="tooltip"
                                                                                    title="Delete"
                                                                                >
                                                                                    <i className="fa fa-remove"></i>
                                                                                </a>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Responsive Pagination Footer */}
                                            <div className="row" style={{ display: isMobile ? 'flex' : 'block', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'center' : 'stretch', gap: isMobile ? '10px' : '0' }}>
                                                <div className={isMobile ? "text-center" : "col-sm-5"}>
                                                    <div className="dataTables_info">
                                                        Showing {totalItems === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
                                                    </div>
                                                </div>
                                                <div className={isMobile ? "text-center" : "col-sm-7"}>
                                                    <div className={`dataTables_paginate paging_simple_numbers ${isMobile ? '' : 'pull-right'}`}>
                                                        <ul className="pagination" style={{ margin: 0 }}>
                                                            <li className={`paginate_button previous ${currentPage === 1 ? 'disabled' : ''}`}>
                                                                <a href="#" onClick={(e) => { e.preventDefault(); changePage(currentPage - 1); }}><i className="fa fa-angle-left"></i></a>
                                                            </li>
                                                            {totalPages > 0 && totalPages < 1000 && [...Array(totalPages)].map((_, i) => {
                                                                const p = i + 1;
                                                                return (
                                                                    <li key={i} className={`paginate_button ${currentPage === p ? 'active' : ''}`}>
                                                                        <a href="#" onClick={(e) => { e.preventDefault(); changePage(p); }}>{p}</a>
                                                                    </li>
                                                                );
                                                            })}
                                                            <li className={`paginate_button next ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                                                                <a href="#" onClick={(e) => { e.preventDefault(); changePage(currentPage + 1); }}><i className="fa fa-angle-right"></i></a>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default DisableReason;
