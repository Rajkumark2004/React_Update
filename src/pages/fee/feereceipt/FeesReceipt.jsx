import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../../utils/include_files.js';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import { useSession } from '../../../context/SessionContext';
import { copyToClipboard, downloadCSV, downloadExcel, printTable, buildExportData } from '../../../utils/tableExport';

const FeesReceipt = () => {
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

    // Currency Symbol
    const currencySymbol = '₹';

    // Mock Fee Payments Data
    const [feePayments, setFeePayments] = useState([
        {
            id: 1,
            admission_no: '18001',
            firstname: 'Edward',
            middlename: '',
            lastname: 'Thomas',
            class: 'Class 1',
            section: 'A',
            created_at: '2023-04-20',
            amount: 5000.00,
            fee_types: 'Admission Fee',
            status: 0,
            description: 'Full payment received',
            class_id: 1,
            section_id: 1,
            student_session_id: 101
        },
        {
            id: 2,
            admission_no: '18002',
            firstname: 'Mellisa',
            middlename: '',
            lastname: 'Chung',
            class: 'Class 1',
            section: 'B',
            created_at: '2023-04-22',
            amount: 3500.00,
            fee_types: 'April Month Fee',
            status: 0,
            description: '',
            class_id: 1,
            section_id: 2,
            student_session_id: 102
        },
        {
            id: 3,
            admission_no: '18003',
            firstname: 'Richard',
            middlename: 'K',
            lastname: 'Joseph',
            class: 'Class 2',
            section: 'A',
            created_at: '2023-04-25',
            amount: 4000.00,
            fee_types: 'Transport Fee',
            status: 1, // Cancelled
            description: 'Wrong entry',
            class_id: 2,
            section_id: 1,
            student_session_id: 103
        },
        {
            id: 4,
            admission_no: '18004',
            firstname: 'John',
            middlename: '',
            lastname: 'Doe',
            class: 'Class 3',
            section: 'B',
            created_at: '2023-05-02',
            amount: 4500.00,
            fee_types: 'May Month Fee',
            status: 0,
            description: 'Via Bank Transfer',
            class_id: 3,
            section_id: 2,
            student_session_id: 104
        }
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const receiptPrefix = 23;

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
        switch (key) {
            case 'sno': return String(feePayments.indexOf(row) + 1);
            case 'receipt_no': return getReceiptNo(row.id);
            case 'admission_no': return row.admission_no;
            case 'name': return `${row.firstname} ${row.middlename ? row.middlename + ' ' : ''}${row.lastname}`.trim();
            case 'class': return `${row.class} (${row.section})`;
            case 'payment_date': return formatDate(row.created_at);
            case 'amount': return '₹' + formatAmount(row.amount);
            case 'fee_type': return row.fee_types;
            case 'status': return (row.status === 0 || !row.status) ? 'Active' : 'Cancel';
            case 'description': return row.description || '';
            default: return '';
        }
    };

    const getExportData = () => buildExportData(columns, visibleColumns, filteredPayments, formatCellForExport);

    // Helper function to format amount
    const formatAmount = (amount) => {
        return parseFloat(amount).toFixed(2);
    };

    // Helper function to format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB'); // dd/mm/yyyy format
    };

    // Helper to get receipt number
    const getReceiptNo = (id) => {
        return `${receiptPrefix}${String(id).padStart(5, '0')}`;
    };

    const handlePrint = (payment) => {
        console.log('Printing receipt for:', payment);
        alert(`Simulating print for Receipt ID: ${payment.id}, Student: ${payment.firstname} ${payment.lastname}`);
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

    const filteredPayments = feePayments.filter(payment =>
        payment.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.admission_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getReceiptNo(payment.id).includes(searchTerm)
    );

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
                currentUrl="/admin/feesreceipt"
            />

            <div className="content-wrapper" style={{ minHeight: '710px' }}>
                {/* Main content */}
                <section className="content" style={{ marginTop: '17px' }}>
                    <div className="row">
                        <div className="col-md-4">
                        </div>
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix"> Fees Receipt</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                    <div className="box-tools pull-right">
                                    </div>
                                </div>

                                <div className="box-body">
                                    <div className="row mb-2" style={{ marginBottom: '10px' }}>
                                        <div className="col-md-6">
                                            <div className="pull-left">
                                                <label>Search:
                                                    <input
                                                        type="search"
                                                        className="form-control input-sm"
                                                        placeholder=""
                                                        aria-controls="example1"
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        style={{ display: 'inline-block', width: 'auto', marginLeft: '0.5em' }}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="pull-right dt-buttons btn-group">
                                                <button className="btn btn-default btn-sm" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }}>
                                                    <i className="fa fa-files-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'fees_receipt.xls'); }}>
                                                    <i className="fa fa-file-excel-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'fees_receipt.csv'); }}>
                                                    <i className="fa fa-file-text-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="PDF" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Fees Receipt'); }}>
                                                    <i className="fa fa-file-pdf-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Fees Receipt'); }}>
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
                                                    <th>Receipt No</th>
                                                    <th>Admission No</th>
                                                    <th>Name</th>
                                                    <th>Class</th>
                                                    <th>Payment Date</th>
                                                    <th>Amount ({currencySymbol})</th>
                                                    <th>Fee Type</th>
                                                    <th>Status</th>
                                                    <th>Description</th>
                                                    <th className="text-right noExport">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredPayments.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="11" className="text-center">No Data Available</td>
                                                    </tr>
                                                ) : (
                                                    filteredPayments.map((payment, index) => (
                                                        <tr key={payment.id}>
                                                            <td>{index + 1}</td>
                                                            <td>{getReceiptNo(payment.id)}</td>
                                                            <td>{payment.admission_no}</td>
                                                            <td>
                                                                {`${payment.firstname} ${payment.middlename ? payment.middlename + ' ' : ''}${payment.lastname}`}
                                                            </td>
                                                            <td>{`${payment.class} (${payment.section})`}</td>
                                                            <td>{formatDate(payment.created_at)}</td>
                                                            <td>{currencySymbol + formatAmount(payment.amount)}</td>
                                                            <td>{payment.fee_types}</td>
                                                            <td>
                                                                {payment.status === 0 || !payment.status ? (
                                                                    <span className="label label-success">Active</span>
                                                                ) : (
                                                                    <span className="label label-danger">Cancel</span>
                                                                )}
                                                            </td>
                                                            <td>{payment.description}</td>
                                                            <td className="text-right noExport">
                                                                <button
                                                                    className="btn btn-xs btn-default printDoc"
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

export default FeesReceipt;
