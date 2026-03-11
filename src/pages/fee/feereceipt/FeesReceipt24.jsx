import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import '../../../utils/include_files.js';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import { useSession } from '../../../context/SessionContext';
import { api } from '../../../services/api';
import { ReceiptContent } from './ReceiptContent';
import { copyToClipboard, downloadCSV, downloadExcel, printTable, buildExportData } from '../../../utils/tableExport';

const FeesReceipt24 = () => {
    const navigate = useNavigate();
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
    const currencySymbol = '₹';

    // Data State
    const [feePayments, setFeePayments] = useState([]);
    const [loading, setLoading] = useState(true);

    const receiptPrefix = "24/25-";

    // States for DataTable functionality
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(100);
    const [currentPage, setCurrentPage] = useState(1);

    // Sorting State
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await api.getFeesReceipt();
                if (response && response.fee_payments) {
                    setFeePayments(response.fee_payments);
                }
            } catch (error) {
                console.error("Error fetching fees receipts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Helpers
    const formatAmount = (amount) => parseFloat(amount || 0).toFixed(2);
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('en-GB');
    };
    const getReceiptNo = (id) => `${receiptPrefix}${String(id).padStart(5, '0')}`;

    const handlePrint = async (payment) => {
        try {
            const response = await api.printStudentGroupFees24(payment.id);
            if (response && response.status === 1) {
                const { student, sch_setting } = response.data;
                const receiptHtml = renderToStaticMarkup(
                    <ReceiptContent student={student} sch_setting={sch_setting} />
                );

                const iframe = document.createElement('iframe');
                iframe.style.position = 'absolute';
                iframe.style.width = '0px';
                iframe.style.height = '0px';
                iframe.style.border = 'none';
                document.body.appendChild(iframe);

                const frameDoc = iframe.contentWindow ? iframe.contentWindow : iframe.contentDocument.document ? iframe.contentDocument.document : iframe.contentDocument;
                frameDoc.document.open();
                frameDoc.document.write('<html><head><title>Print Receipt</title>');
                // Add Bootstrap CSS from CDN or local if possible for styling in print
                frameDoc.document.write('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">');
                frameDoc.document.write('<style>');
                frameDoc.document.write(`
                    @media print {
                        .col-sm-6 { width: 50%; float: left; }
                        .col-sm-1, .col-sm-2, .col-sm-3, .col-sm-4, .col-sm-12 { float: left; }
                        .col-sm-12 { width: 100%; }
                        .col-sm-3 { width: 25%; }
                        .col-sm-4 { width: 33.33%; }
                        .col-sm-2 { width: 16.66%; }
                        .col-sm-1 { width: 8.33%; }
                        .text-right { text-align: right; }
                        .text-center { text-align: center; }
                        table { width: 100%; border-collapse: collapse; }
                        td, th { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
                        .no-print { display: none !important; }
                    }
                     /* Base styles for iframe rendering */
                    .header { margin-bottom: 20px; }
                    .table { width: 100%; max-width: 100%; margin-bottom: 20px; }
                    .table-bordered { border: 1px solid #ddd; }
                `);
                frameDoc.document.write('</style>');
                frameDoc.document.write('</head><body>');
                frameDoc.document.write(receiptHtml);
                frameDoc.document.write('</body></html>');
                frameDoc.document.close();

                setTimeout(() => {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                    document.body.removeChild(iframe);
                }, 500);

            } else {
                alert('Failed to fetch receipt data');
            }
        } catch (error) {
            console.error('Error printing receipt:', error);
            alert('An error occurred while printing');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        clearSession();
        navigate('/login');
    };

    const handleSidebarSearch = (e) => {
        e.preventDefault();
        console.log('Searching...');
    };

    // Sorting Logic
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortData = (data) => {
        if (!sortConfig.key) return data;

        return [...data].sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            // Special handling for specific columns
            if (sortConfig.key === 'receipt_no') {
                aValue = getReceiptNo(a.id);
                bValue = getReceiptNo(b.id);
            } else if (sortConfig.key === 'name') {
                aValue = `${a.firstname} ${a.middlename || ''} ${a.lastname || ''}`.trim().toLowerCase();
                bValue = `${b.firstname} ${b.middlename || ''} ${b.lastname || ''}`.trim().toLowerCase();
            } else if (sortConfig.key === 'class') {
                aValue = `${a.class} ${a.section}`.toLowerCase();
                bValue = `${b.class} ${b.section}`.toLowerCase();
            } else if (sortConfig.key === 'amount' || sortConfig.key === 'id') {
                aValue = parseFloat(aValue || 0);
                bValue = parseFloat(bValue || 0);
            } else if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    // Filter Logic
    const filteredPayments = feePayments.filter(payment =>
        (payment.firstname && payment.firstname.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (payment.lastname && payment.lastname.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (payment.admission_no && payment.admission_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
        getReceiptNo(payment.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment.fee_types && payment.fee_types.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Apply Sorting
    const sortedPayments = sortData(filteredPayments);

    // Pagination Logic
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = sortedPayments.slice(indexOfFirstEntry, indexOfLastEntry);
    const totalPages = Math.ceil(sortedPayments.length / entriesPerPage);

    const getStatusLabel = (status) => {
        if (String(status) === '1') {
            return <span className="label label-danger">Cancel</span>;
        }
        return <span className="label label-success">Active</span>;
    };

    const renderSortIcon = (key) => {
        if (sortConfig.key !== key) return <i className="fa fa-sort text-muted pull-right" style={{ opacity: 0.3 }}></i>;
        if (sortConfig.direction === 'asc') return <i className="fa fa-sort-asc pull-right"></i>;
        return <i className="fa fa-sort-desc pull-right"></i>;
    };

    // Column definitions for export
    const columns = [
        { key: 'sno', label: 'S.No' },
        { key: 'receipt_no', label: 'Receipt No' },
        { key: 'admission_no', label: 'Admission No' },
        { key: 'name', label: 'Name' },
        { key: 'class', label: 'Class' },
        { key: 'payment_date', label: 'Payment Date' },
        { key: 'amount', label: 'Amount (₹)' },
        { key: 'fee_type', label: 'Fee Type' },
        { key: 'status', label: 'Status' },
        { key: 'description', label: 'Description' }
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

    const formatCellForExport = (row, key) => {
        const idx = sortedPayments.indexOf(row);
        switch (key) {
            case 'sno': return String(idx + 1);
            case 'receipt_no': return getReceiptNo(row.id);
            case 'admission_no': return row.admission_no || '';
            case 'name': return `${row.firstname || ''} ${row.middlename || ''} ${row.lastname || ''}`.trim();
            case 'class': return `${row.class || ''} (${row.section || ''})`;
            case 'payment_date': return formatDate(row.created_at);
            case 'amount': return '₹' + formatAmount(row.amount);
            case 'fee_type': return row.fee_types || '';
            case 'status': return String(row.status) === '1' ? 'Cancel' : 'Active';
            case 'description': return row.description || '';
            default: return '';
        }
    };

    const getExportData = () => buildExportData(columns, visibleColumns, sortedPayments, formatCellForExport);

    return (
        <div className="wrapper">
            <Header
                appName={appName}
                userData={userData}
                pendingTasks={pendingTasks}
                handleLogout={handleLogout}
            />

            <Sidebar
                handleSearch={handleSidebarSearch}
                sessionYear={sessionYear}
                currentUrl="/admin/feesreceipt24"
            />

            <div className="content-wrapper" style={{ minHeight: '710px' }}>
                <section className="content" style={{ marginTop: '0px' }}>
                    <div className="row">
                        <div className="col-md-4">
                        </div>
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix"> Fees Receipt 24/25</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                    <div className="box-tools pull-right">
                                    </div>
                                </div>

                                <div className="box-body">
                                    {/* DataTables Controls */}
                                    <div className="row mb-2" style={{ marginBottom: '10px' }}>
                                        <div className="col-sm-6">
                                            <div id="example1_filter" className="dataTables_filter pull-left">
                                                <label>Search:<input
                                                    type="search"
                                                    className="form-control input-sm"
                                                    placeholder=""
                                                    aria-controls="example1"
                                                    value={searchTerm}
                                                    onChange={(e) => {
                                                        setSearchTerm(e.target.value);
                                                        setCurrentPage(1);
                                                    }}
                                                    style={{ display: 'inline-block', width: 'auto', marginLeft: '0.5em' }}
                                                /></label>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="pull-right dt-buttons btn-group">
                                                <button className="btn btn-default btn-sm" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }}>
                                                    <i className="fa fa-files-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'fees_receipt_24.xls'); }}>
                                                    <i className="fa fa-file-excel-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'fees_receipt_24.csv'); }}>
                                                    <i className="fa fa-file-text-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="PDF" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Fees Receipt 24/25'); }}>
                                                    <i className="fa fa-file-pdf-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Fees Receipt 24/25'); }}>
                                                    <i className="fa fa-print"></i>
                                                </button>
                                                <div className="btn-group">
                                                    <button className="btn btn-default btn-sm" title="Columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}>
                                                        <i className="fa fa-columns"></i>
                                                    </button>
                                                    {showColumnsDropdown && (
                                                        <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 1000, background: '#fff', border: '1px solid #ccc', borderRadius: '4px', padding: '8px 10px', minWidth: '180px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
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
                                    </div>

                                    <div className="table-responsive overflow-visible">
                                        <table className="table table-striped table-bordered table-hover example">
                                            <thead>
                                                <tr>
                                                    <th>S.No</th>
                                                    <th className="sorting" onClick={() => handleSort('receipt_no')} style={{ cursor: 'pointer' }}>
                                                        Receipt No {renderSortIcon('receipt_no')}
                                                    </th>
                                                    <th className="sorting" onClick={() => handleSort('admission_no')} style={{ cursor: 'pointer' }}>
                                                        Admission No {renderSortIcon('admission_no')}
                                                    </th>
                                                    <th className="sorting" onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                                                        Name {renderSortIcon('name')}
                                                    </th>
                                                    <th className="sorting" onClick={() => handleSort('class')} style={{ cursor: 'pointer' }}>
                                                        Class {renderSortIcon('class')}
                                                    </th>
                                                    <th className="sorting" onClick={() => handleSort('created_at')} style={{ cursor: 'pointer' }}>
                                                        Payment Date {renderSortIcon('created_at')}
                                                    </th>
                                                    <th className="sorting" onClick={() => handleSort('amount')} style={{ cursor: 'pointer' }}>
                                                        Amount ({currencySymbol}) {renderSortIcon('amount')}
                                                    </th>
                                                    <th className="sorting" onClick={() => handleSort('fee_types')} style={{ cursor: 'pointer' }}>
                                                        Fee Type {renderSortIcon('fee_types')}
                                                    </th>
                                                    <th className="sorting" onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                                                        Status {renderSortIcon('status')}
                                                    </th>
                                                    <th className="sorting" onClick={() => handleSort('description')} style={{ cursor: 'pointer' }}>
                                                        Description {renderSortIcon('description')}
                                                    </th>
                                                    <th className="text-right noExport">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr>
                                                        <td colSpan="11" className="text-center">
                                                            <i className="fa fa-spinner fa-spin"></i> Loading...
                                                        </td>
                                                    </tr>
                                                ) : currentEntries.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="11" className="text-center">No matching records found</td>
                                                    </tr>
                                                ) : (
                                                    currentEntries.map((payment, index) => (
                                                        <tr key={payment.id}>
                                                            <td>{indexOfFirstEntry + index + 1}</td>
                                                            <td>{getReceiptNo(payment.id)}</td>
                                                            <td>{payment.admission_no}</td>
                                                            <td>
                                                                {`${payment.firstname} ${payment.middlename || ''} ${payment.lastname || ''}`.trim()}
                                                            </td>
                                                            <td>{`${payment.class} (${payment.section})`}</td>
                                                            <td>{formatDate(payment.created_at)}</td>
                                                            <td>{currencySymbol + formatAmount(payment.amount)}</td>
                                                            <td>{payment.fee_types}</td>
                                                            <td>{getStatusLabel(payment.status)}</td>
                                                            <td>{payment.description}</td>
                                                            <td className="text-right noExport">
                                                                <button
                                                                    className="btn btn-xs btn-default printDocNew"
                                                                    onClick={() => handlePrint(payment)}
                                                                    title="Print"
                                                                >
                                                                    <i className="fa fa-print"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination Info & Controls */}
                                    {!loading && filteredPayments.length > 0 && (
                                        <div className="row">
                                            <div className="col-sm-5">
                                                <div className="dataTables_info" role="status" aria-live="polite">
                                                    Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredPayments.length)} of {filteredPayments.length} entries
                                                </div>
                                            </div>
                                            <div className="col-sm-7">
                                                <div className="dataTables_paginate paging_simple_numbers" style={{ textAlign: 'right' }}>
                                                    <ul className="pagination">
                                                        <li className={`paginate_button previous ${currentPage === 1 ? 'disabled' : ''}`}>
                                                            <a href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1); }}>Previous</a>
                                                        </li>
                                                        {[...Array(totalPages)].map((_, i) => {
                                                            // Logic to show limited page numbers if too many pages
                                                            if (totalPages > 10 && Math.abs(currentPage - (i + 1)) > 4 && i !== 0 && i !== totalPages - 1) {
                                                                if (Math.abs(currentPage - (i + 1)) === 5) return <li key={i} className="paginate_button disabled"><a href="#">...</a></li>;
                                                                return null;
                                                            }
                                                            return (
                                                                <li key={i} className={`paginate_button ${currentPage === i + 1 ? 'active' : ''}`}>
                                                                    <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}>{i + 1}</a>
                                                                </li>
                                                            );
                                                        })}
                                                        <li className={`paginate_button next ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                                                            <a href="#" onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(currentPage + 1); }}>Next</a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}

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

export default FeesReceipt24;
