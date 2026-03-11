import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import Loader from '../../components/Loader';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import '../../utils/include_files';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable } from '../../utils/tableExport';
import { toast } from 'react-hot-toast';

const DisableReason = () => {
    // Mock Permissions
    const canAdd = true;
    const canEdit = true;
    const canDelete = true;

    // Static Data
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState([]);

    useEffect(() => {
        fetchDisableReasons();
    }, []);

    const fetchDisableReasons = async () => {
        try {
            setLoading(true);
            // Use POST api with empty name to fetch list as per user requirement (refactored to getDisableReasonsList)
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

    // Column visibility (same pattern as EnquiryView)
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
    const [itemsPerPage] = useState(10);

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredResults.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

    const changePage = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    };

    // Edit State


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
            // Since edit is now on a separate page, we only handle add here
            response = await api.addDisableReason(formData);

            if (response.status) {
                // Refresh list
                fetchDisableReasons();
                setFormData({ name: '' });
                toast.success(response.message || 'Record Saved Successfully');
            } else {
                toast.error(response.error || 'Failed to save record');
            }
        } catch (error) {
            console.error('Error saving disable reason:', error);
            toast.error('An error occurred while saving');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="wrapper theme-white-skin">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '946px' }}>
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
                                    {/* <li><a href="#" onClick={(e) => e.preventDefault()}><img src="/images/student_details.png" alt="icon5" className="img-fluid" style={{ width: '20px' }} /> Multi Class Student</a></li>
                                    <li><a href="#" onClick={(e) => e.preventDefault()}><img src="/images/bulk_delete.png" alt="icon6" className="img-fluid" style={{ width: '20px' }} /> Bulk Delete</a></li>
                                    <li><a href="#" onClick={(e) => e.preventDefault()}><img src="/images/student_category.png" alt="icon7" className="img-fluid" style={{ width: '20px' }} /> Student Categories</a></li>
                                    <li><a href="#" onClick={(e) => e.preventDefault()}><img src="/images/student_house.png" alt="icon7" className="img-fluid" style={{ width: '20px' }} /> Student House</a></li>*/}
                                    <li><Link to="/admin/disable-reason" className="active"><img src="/images/disabled_reason.png" alt="icon7" className="img-fluid" style={{ width: '20px' }} /> Disable Reason</Link></li>
                                    {/* <li><a href="#" onClick={(e) => e.preventDefault()}><img src="/images/admission_intake.png" alt="icon7" className="img-fluid" style={{ width: '20px' }} /> Admissions Intake</a></li>
                                    <li><a href="#" onClick={(e) => e.preventDefault()}><img src="/images/behavioural_note.png" alt="icon7" className="img-fluid" style={{ width: '20px' }} /> Behavioural Note</a></li>
                                    <li><a href="#" onClick={(e) => e.preventDefault()}><img src="/images/my_day_today.png" alt="icon7" className="img-fluid" style={{ width: '20px' }} /> My Day Today</a></li>*/}
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
                                                    {/* Flash messages would hide here */}
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

                                            {/* DataTables Controls */}
                                            <div className="row" style={{ marginBottom: '10px' }}>
                                                <div className="col-md-6">
                                                    <div className="dt-buttons btn-group">
                                                        <button className="btn btn-default btn-sm" title="Copy" onClick={() => {
                                                            const headers = columns.filter(c => visibleColumns.has(c.key)).map(c => c.label);
                                                            const rows = filteredResults.map(r => columns.filter(c => visibleColumns.has(c.key)).map(c => String(r[c.key] ?? '')));
                                                            copyToClipboard(headers, rows);
                                                        }}>
                                                            <i className="fa fa-files-o"></i>
                                                        </button>
                                                        <button className="btn btn-default btn-sm" title="CSV" onClick={() => {
                                                            const headers = columns.filter(c => visibleColumns.has(c.key)).map(c => c.label);
                                                            const rows = filteredResults.map(r => columns.filter(c => visibleColumns.has(c.key)).map(c => String(r[c.key] ?? '')));
                                                            downloadCSV(headers, rows, 'disable_reasons.csv');
                                                        }}>
                                                            <i className="fa fa-file-text-o"></i>
                                                        </button>
                                                        <button className="btn btn-default btn-sm" title="Excel" onClick={() => {
                                                            const headers = columns.filter(c => visibleColumns.has(c.key)).map(c => c.label);
                                                            const rows = filteredResults.map(r => columns.filter(c => visibleColumns.has(c.key)).map(c => String(r[c.key] ?? '')));
                                                            downloadExcel(headers, rows, 'disable_reasons.xls');
                                                        }}>
                                                            <i className="fa fa-file-excel-o"></i>
                                                        </button>
                                                        <button className="btn btn-default btn-sm" title="PDF" onClick={() => {
                                                            const headers = columns.filter(c => visibleColumns.has(c.key)).map(c => c.label);
                                                            const rows = filteredResults.map(r => columns.filter(c => visibleColumns.has(c.key)).map(c => String(r[c.key] ?? '')));
                                                            downloadPDF(headers, rows, 'disable_reasons.pdf', 'Disable Reason List');
                                                        }}>
                                                            <i className="fa fa-file-pdf-o"></i>
                                                        </button>
                                                        <button className="btn btn-default btn-sm" title="Print" onClick={() => {
                                                            const headers = columns.filter(c => visibleColumns.has(c.key)).map(c => c.label);
                                                            const rows = filteredResults.map(r => columns.filter(c => visibleColumns.has(c.key)).map(c => String(r[c.key] ?? '')));
                                                            printTable(headers, rows, 'Disable Reason List');
                                                        }}>
                                                            <i className="fa fa-print"></i>
                                                        </button>
                                                        <div className="btn-group">
                                                            <button className="btn btn-default btn-sm" title="Columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}>
                                                                <i className="fa fa-columns"></i>
                                                            </button>
                                                            {showColumnsDropdown && (
                                                                <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 1000, background: '#fff', border: '1px solid #ccc', borderRadius: '4px', padding: '8px 10px', minWidth: '180px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                                                                    {columns.map(col => (
                                                                        <label key={col.key} style={{ display: 'block', cursor: 'pointer', padding: '2px 0', fontSize: '13px', fontWeight: 'normal' }}>
                                                                            <input type="checkbox" checked={visibleColumns.has(col.key)} onChange={() => toggleColumn(col.key)} style={{ marginRight: '6px' }} />
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
                                            {/* Flash messages here */}
                                            <div className="mailbox-messages">
                                                {loading ? (
                                                    <Loader rows={5} />
                                                ) : (
                                                    <div className="slide-in">
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
                                                                        {visibleColumns.has('reason') && <td>{value.reason}</td>}
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
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default DisableReason;
