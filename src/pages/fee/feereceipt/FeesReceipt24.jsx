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
import toast from 'react-hot-toast';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable, buildExportData } from '../../../utils/tableExport';
import Pagination from '../../../utils/Pagination';

const FeesReceipt24 = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

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
    const [printSettings, setPrintSettings] = useState(null);

    const receiptPrefix = "24/25-";

    // States for DataTable functionality
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(100);
    const [currentPage, setCurrentPage] = useState(1);

    // Sorting State
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const fetchPrintSettings = async () => {
        try {
            const res = await api.getPrintHeaderFooterSettings();
            if (res.status === 'success' && res.result) {
                const receiptSetting = res.result.find(item => item.print_type === 'student_receipt');
                if (receiptSetting) {
                    setPrintSettings({
                        header_image: receiptSetting.header_image ? `https://newlayout.wisibles.com/uploads/print_headerfooter/student_receipt/${receiptSetting.header_image}` : null,
                        footer_content: receiptSetting.footer_content || ''
                    });
                }
            }
        } catch (e) {
            console.error("Error fetching print settings", e);
        }
    };

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
        fetchPrintSettings();
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
                const { student: studentData, sch_setting } = response.data;
                const enriched_sch_setting = {
                    ...sch_setting,
                    receipt_header_url: printSettings?.header_image || sch_setting?.receipt_header_url || '',
                    receipt_footer_content: printSettings?.footer_content || sch_setting?.receipt_footer_content || ''
                };
                const receiptHtml = renderToStaticMarkup(
                    <ReceiptContent student={studentData} sch_setting={enriched_sch_setting} />
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
                toast.error('Failed to fetch receipt data');
            }
        } catch (error) {
            console.error('Error printing receipt:', error);
            toast.error('An error occurred while printing');
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
        return (
            <i
                className={`fa fa-caret-${sortConfig.key === key && sortConfig.direction === 'desc' ? 'up' : 'down'}`}
                style={{
                    color: sortConfig.key === key ? '#333' : '#ccc',
                    marginLeft: '5px'
                }}
            ></i>
        );
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
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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

            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content" style={{ marginTop: '0px' }}>
                    <div className="row">
                        <div className="col-md-4">
                        </div>
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header ptbnull" style={isMobile ? { display: 'flex', alignItems: 'center', padding: '12px 15px' } : {}}>
                                    <h3 className="box-title titlefix" style={isMobile ? { margin: 0, fontSize: '18px' } : {}}> Fees Receipt 24</h3>
                                    <div className={isMobile ? "" : "btn-group pull-right"} style={isMobile ? { marginLeft: 'auto' } : {}}>
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                    <div className="box-tools pull-right">
                                    </div>
                                </div>

                                <div className="box-body">
                                    {/* DataTables Controls */}
                                    <div className="row mb-2" style={isMobile ? { marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' } : { marginBottom: '10px' }}>
                                        <div className={isMobile ? "" : "col-sm-6"}>
                                            <div className={isMobile ? "dataTables_filter" : "dataTables_filter pull-left"}>
                                                <input
                                                    type="search"
                                                    className="form-control input-sm"
                                                    placeholder="Search..."
                                                    value={searchTerm}
                                                    onChange={(e) => {
                                                        setSearchTerm(e.target.value);
                                                        setCurrentPage(1);
                                                    }}
                                                    style={{ 
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
                                                />
                                            </div>
                                        </div>
                                        <div className={isMobile ? "" : "col-sm-6"}>
                                            <div className={isMobile ? "dt-buttons btn-group" : "pull-right dt-buttons btn-group"}>
                                                <button className="btn btn-default btn-sm" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }} style={{ borderTopLeftRadius: '20px', borderBottomLeftRadius: '20px' }}>
                                                    <i className="fa fa-files-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'fees_receipt_24.xls'); }}>
                                                    <i className="fa fa-file-excel-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'fees_receipt_24.csv'); }}>
                                                    <i className="fa fa-file-text-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="PDF" onClick={() => { const { headers, rows } = getExportData(); downloadPDF(headers, rows, 'fees_receipt_24.pdf', 'Fees Receipt 24/25'); }}>
                                                    <i className="fa fa-file-pdf-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Fees Receipt 24/25'); }}>
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

                                    <div className="table-responsive" style={isMobile ? { overflowX: 'auto', WebkitOverflowScrolling: 'touch', display: 'block', width: '100%' } : { overflow: 'visible' }}>
                                        <table className="table table-striped table-bordered table-hover example" style={isMobile ? { minWidth: '1200px', tableLayout: 'fixed' } : {}}>
                                            <thead>
                                                <tr>
                                                    {visibleColumns.has('sno') && <th style={isMobile ? { textAlign: 'left', borderLeft: 'none', borderRight: 'none', fontSize: '12px', padding: '10px 4px', width: '50px' } : { textAlign: 'left' }}>S.No</th>}
                                                    {visibleColumns.has('receipt_no') && (
                                                        <th className="sorting" onClick={() => handleSort('receipt_no')} style={isMobile ? { cursor: 'pointer', whiteSpace: 'nowrap', textAlign: 'left', borderLeft: 'none', borderRight: 'none', fontSize: '12px', padding: '10px 4px', width: '110px' } : { cursor: 'pointer', whiteSpace: 'nowrap', textAlign: 'left' }}>
                                                            Receipt No {renderSortIcon('receipt_no')}
                                                        </th>
                                                    )}
                                                    {visibleColumns.has('admission_no') && (
                                                        <th className="sorting" onClick={() => handleSort('admission_no')} style={isMobile ? { cursor: 'pointer', whiteSpace: 'nowrap', textAlign: 'left', borderLeft: 'none', borderRight: 'none', fontSize: '12px', padding: '10px 4px', width: '110px' } : { cursor: 'pointer', whiteSpace: 'nowrap', textAlign: 'left' }}>
                                                            Adm No {renderSortIcon('admission_no')}
                                                        </th>
                                                    )}
                                                    {visibleColumns.has('name') && (
                                                        <th className="sorting" onClick={() => handleSort('name')} style={isMobile ? { cursor: 'pointer', whiteSpace: 'nowrap', textAlign: 'left', borderLeft: 'none', borderRight: 'none', fontSize: '12px', padding: '10px 4px', width: '180px' } : { cursor: 'pointer', whiteSpace: 'nowrap', textAlign: 'left' }}>
                                                            Name {renderSortIcon('name')}
                                                        </th>
                                                    )}
                                                    {visibleColumns.has('class') && (
                                                        <th className="sorting" onClick={() => handleSort('class')} style={isMobile ? { cursor: 'pointer', whiteSpace: 'nowrap', textAlign: 'left', borderLeft: 'none', borderRight: 'none', fontSize: '12px', padding: '10px 4px', width: '120px' } : { cursor: 'pointer', whiteSpace: 'nowrap', textAlign: 'left' }}>
                                                            Class {renderSortIcon('class')}
                                                        </th>
                                                    )}
                                                    {visibleColumns.has('payment_date') && (
                                                        <th className="sorting" onClick={() => handleSort('created_at')} style={isMobile ? { cursor: 'pointer', whiteSpace: 'nowrap', textAlign: 'left', borderLeft: 'none', borderRight: 'none', fontSize: '12px', padding: '10px 4px', width: '100px' } : { cursor: 'pointer', whiteSpace: 'nowrap', textAlign: 'left' }}>
                                                            Payment Date {renderSortIcon('created_at')}
                                                        </th>
                                                    )}
                                                    {visibleColumns.has('amount') && (
                                                        <th className="sorting" onClick={() => handleSort('amount')} style={isMobile ? { cursor: 'pointer', whiteSpace: 'nowrap', textAlign: 'left', borderLeft: 'none', borderRight: 'none', fontSize: '12px', padding: '10px 4px', width: '100px' } : { cursor: 'pointer', whiteSpace: 'nowrap', textAlign: 'left' }}>
                                                            Amt ({currencySymbol}) {renderSortIcon('amount')}
                                                        </th>
                                                    )}
                                                    {visibleColumns.has('fee_type') && (
                                                        <th className="sorting" onClick={() => handleSort('fee_types')} style={isMobile ? { cursor: 'pointer', whiteSpace: 'nowrap', textAlign: 'left', borderLeft: 'none', borderRight: 'none', fontSize: '12px', padding: '10px 4px', width: '150px' } : { cursor: 'pointer', whiteSpace: 'nowrap', textAlign: 'left' }}>
                                                            Fee Type {renderSortIcon('fee_types')}
                                                        </th>
                                                    )}
                                                    {visibleColumns.has('status') && (
                                                        <th className="sorting" onClick={() => handleSort('status')} style={isMobile ? { cursor: 'pointer', whiteSpace: 'nowrap', textAlign: 'left', borderLeft: 'none', borderRight: 'none', fontSize: '12px', padding: '10px 4px', width: '80px' } : { cursor: 'pointer', whiteSpace: 'nowrap', textAlign: 'left' }}>
                                                            Status {renderSortIcon('status')}
                                                        </th>
                                                    )}
                                                    {visibleColumns.has('description') && (
                                                        <th className="sorting" onClick={() => handleSort('description')} style={isMobile ? { cursor: 'pointer', whiteSpace: 'nowrap', textAlign: 'left', borderLeft: 'none', borderRight: 'none', fontSize: '12px', padding: '10px 4px', width: '150px' } : { cursor: 'pointer', whiteSpace: 'nowrap', textAlign: 'left' }}>
                                                            Description {renderSortIcon('description')}
                                                        </th>
                                                    )}
                                                    <th className="noExport" style={isMobile ? { textAlign: 'left', borderLeft: 'none', borderRight: 'none', fontSize: '12px', padding: '10px 4px', width: '60px' } : { textAlign: 'left' }}>Action</th>
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
                                                    currentEntries.map((payment, index) => {
                                                        const fullName = `${payment.firstname} ${payment.middlename || ''} ${payment.lastname || ''}`.trim();
                                                        return (
                                                            <tr key={payment.id}>
                                                                {visibleColumns.has('sno') && <td style={isMobile ? { borderLeft: 'none', borderRight: 'none', verticalAlign: 'top', padding: '10px 4px', fontSize: '12px', width: '40px', textAlign: 'left' } : { width: '40px', textAlign: 'left' }}>{indexOfFirstEntry + index + 1}</td>}
                                                                {visibleColumns.has('receipt_no') && (
                                                                    <td style={isMobile ? { borderLeft: 'none', borderRight: 'none', verticalAlign: 'top', padding: '10px 4px', fontSize: '12px', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' } : { maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }} title={getReceiptNo(payment.id)}>
                                                                        {getReceiptNo(payment.id)}
                                                                    </td>
                                                                )}
                                                                {visibleColumns.has('admission_no') && (
                                                                    <td style={isMobile ? { borderLeft: 'none', borderRight: 'none', verticalAlign: 'top', padding: '10px 4px', fontSize: '12px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' } : { maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }} title={payment.admission_no}>
                                                                        {payment.admission_no}
                                                                    </td>
                                                                )}
                                                                {visibleColumns.has('name') && (
                                                                    <td style={isMobile ? { borderLeft: 'none', borderRight: 'none', verticalAlign: 'top', padding: '10px 4px', fontSize: '12px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' } : { maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }} title={fullName}>
                                                                        {fullName}
                                                                    </td>
                                                                )}
                                                                {visibleColumns.has('class') && (
                                                                    <td style={isMobile ? { borderLeft: 'none', borderRight: 'none', verticalAlign: 'top', padding: '10px 4px', fontSize: '12px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' } : { maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }} title={`${payment.class} (${payment.section})`}>
                                                                        {`${payment.class} (${payment.section})`}
                                                                    </td>
                                                                )}
                                                                {visibleColumns.has('payment_date') && <td style={isMobile ? { borderLeft: 'none', borderRight: 'none', verticalAlign: 'top', padding: '10px 4px', fontSize: '12px', width: '100px', textAlign: 'left' } : { width: '100px', textAlign: 'left' }}>{formatDate(payment.created_at)}</td>}
                                                                {visibleColumns.has('amount') && <td style={isMobile ? { borderLeft: 'none', borderRight: 'none', verticalAlign: 'top', padding: '10px 4px', fontSize: '12px', width: '100px', textAlign: 'left' } : { width: '100px', textAlign: 'left' }}>{currencySymbol + formatAmount(payment.amount)}</td>}
                                                                {visibleColumns.has('fee_type') && (
                                                                    <td style={isMobile ? { borderLeft: 'none', borderRight: 'none', verticalAlign: 'top', padding: '10px 4px', fontSize: '12px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' } : { maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }} title={payment.fee_types}>
                                                                        {payment.fee_types}
                                                                    </td>
                                                                )}
                                                                {visibleColumns.has('status') && <td style={isMobile ? { borderLeft: 'none', borderRight: 'none', verticalAlign: 'top', padding: '10px 4px', fontSize: '12px', width: '80px', textAlign: 'left' } : { width: '80px', textAlign: 'left' }}>{getStatusLabel(payment.status)}</td>}
                                                                {visibleColumns.has('description') && (
                                                                    <td style={isMobile ? { borderLeft: 'none', borderRight: 'none', verticalAlign: 'top', padding: '10px 4px', fontSize: '12px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' } : { maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }} title={payment.description}>
                                                                        {payment.description}
                                                                    </td>
                                                                )}
                                                                <td className="noExport" style={isMobile ? { borderLeft: 'none', borderRight: 'none', verticalAlign: 'top', padding: '10px 4px', fontSize: '12px', width: '60px', textAlign: 'left' } : { width: '60px', textAlign: 'left' }}>
                                                                    <button
                                                                        className="btn btn-xs btn-default printDocNew"
                                                                        onClick={() => handlePrint(payment)}
                                                                        title="Print"
                                                                    >
                                                                        <i className="fa fa-print"></i>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination Info & Controls */}
                                    {!loading && filteredPayments.length > 0 && (
                                        <div className="pt15 pb15">
                                            <Pagination 
                                                totalItems={filteredPayments.length} 
                                                itemsPerPage={entriesPerPage} 
                                                currentPage={currentPage}
                                                onPageChange={(page) => setCurrentPage(page)}
                                            />
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
