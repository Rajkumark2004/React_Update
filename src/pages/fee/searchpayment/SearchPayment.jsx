import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import { api } from '../../../services/api';
import toast from 'react-hot-toast';
import { useSession } from '../../../context/SessionContext';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable, buildExportData } from '../../../utils/tableExport';
import '../../../utils/include_files';

const SearchPayment = () => {
    const navigate = useNavigate();
    const { currentSession } = useSession();
    const currencySymbol = '₹'; // Can be fetched from settings

    // Form State
    const [paymentId, setPaymentId] = useState('');
    const [loading, setLoading] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;
    const [searched, setSearched] = useState(false);
    const [feeList, setFeeList] = useState([]);
    const [error, setError] = useState('');

    // Pagination and Sort state
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(10);
    const [localSearch, setLocalSearch] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Column definitions for export
    const columns = [
        { key: 'payment_id', label: 'Payment ID' },
        { key: 'date', label: 'Date' },
        { key: 'name', label: 'Name' },
        { key: 'class', label: 'Class' },
        { key: 'fee_group_name', label: 'Fees Group' },
        { key: 'fee_type', label: 'Fee Type' },
        { key: 'payment_mode', label: 'Mode' },
        { key: 'amount', label: 'Amount' },
        { key: 'amount_discount', label: 'Discount' },
        { key: 'amount_fine', label: 'Fine' }
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

    const formatCell = (row, key) => {
        if (key === 'payment_id') return row.payment_id || `${row.id}/${row.sub_invoice_id || ''}`;
        if (key === 'date') return formatDate(row.date);
        if (key === 'name') return `${row.firstname} ${row.middlename || ''} ${row.lastname || ''}${row.admission_no ? ` (${row.admission_no})` : ''}`;
        if (key === 'class') return `${row.class} ${row.section ? `(${row.section})` : ''}`;
        if (key === 'fee_group_name') return row.fee_group_name || row.name || '-';
        if (key === 'fee_type') return `${row.fee_type || row.type || '-'}${row.code ? ` (${row.code})` : ''}`;
        if (key === 'payment_mode') return row.payment_mode || '-';
        if (key === 'amount') return formatAmount(row.amount);
        if (key === 'amount_discount') return formatAmount(row.amount_discount || row.discount);
        if (key === 'amount_fine') return formatAmount(row.amount_fine || row.fine);
        return row[key];
    };

    const getExportData = () => {
        return buildExportData(columns, visibleColumns, feeList, formatCell);
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setError('');

        if (!paymentId.trim()) {
            setError('Payment ID is required');
            return;
        }

        setLoading(true);
        setSearched(true);

        try {
            const response = await api.searchPayment({ paymentid: paymentId });
            console.log('Search Payment Response:', response);

            if (response.status === true || response.status === 'success') {
                const subInvoiceId = response.sub_invoice_id;
                const list = response.feeList || response.data;

                if (list) {
                    let amountDetail = list.amount_detail;
                    if (typeof amountDetail === 'string') {
                        try {
                            amountDetail = JSON.parse(amountDetail);
                        } catch (e) {
                            console.error('Error parsing amount_detail:', e);
                            amountDetail = {};
                        }
                    }

                    // Find the specific sub-invoice details
                    const paymentDetail = amountDetail && subInvoiceId ? amountDetail[subInvoiceId] : null;

                    if (paymentDetail) {
                        setFeeList([{
                            ...list,
                            sub_invoice_id: subInvoiceId,
                            amount: paymentDetail.amount,
                            amount_discount: paymentDetail.amount_discount,
                            amount_fine: paymentDetail.amount_fine,
                            payment_mode: paymentDetail.payment_mode,
                            date: paymentDetail.date,
                            description: paymentDetail.description
                        }]);
                    } else if (Array.isArray(list)) {
                        setFeeList(list);
                    } else {
                        setFeeList([list]); // Fallback to raw list as single-item array
                    }
                    setCurrentPage(1);
                } else {
                    setFeeList([]);
                    toast.error('Payment not found');
                }
            } else {
                setFeeList([]);
                toast.error(response.message || 'Payment not found');
            }
        } catch (err) {
            console.error('Error searching payment:', err);
            setFeeList([]);
            toast.error('Error searching payment');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatAmount = (amount) => {
        const num = parseFloat(amount) || 0;
        return num.toFixed(2);
    };

    // Filter, Sort, and Pagination Logic
    const filteredRecords = feeList.filter(record => {
        if (!localSearch) return true;
        const searchLower = localSearch.toLowerCase();
        return columns.some(col => {
            const val = formatCell(record, col.key);
            return val && String(val).toLowerCase().includes(searchLower);
        });
    });

    const sortedRecords = [...filteredRecords].sort((a, b) => {
        if (!sortConfig.key) return 0;

        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        // Specific handling for complex fields
        if (sortConfig.key === 'name') {
            valA = `${a.firstname} ${a.lastname}`.toLowerCase();
            valB = `${b.firstname} ${b.lastname}`.toLowerCase();
        } else if (['amount', 'amount_discount', 'amount_fine'].includes(sortConfig.key)) {
            valA = parseFloat(a[sortConfig.key]) || 0;
            valB = parseFloat(b[sortConfig.key]) || 0;
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const currentTotal = sortedRecords.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? currentTotal || 1 : recordsPerPage;
    const totalPages = Math.ceil(currentTotal / safeRecordsPerPage);
    const indexOfLastRecord = currentPage * safeRecordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - safeRecordsPerPage;
    const currentRecords = sortedRecords.slice(indexOfFirstRecord, indexOfLastRecord);

    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    return (
        <div className="wrapper theme-white-skin">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '850px' }}>
                <section className="content-header">
                    <h1><i className="fa fa-money"></i> Fees Collection</h1>
                </section>

                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header with-border" style={isMobile ? { display: 'flex', alignItems: 'center', padding: '12px 15px' } : {}}>
                                    <h3 className="box-title" style={isMobile ? { margin: 0, fontSize: '18px' } : {}}>
                                        <i className="fa fa-search"></i> Search Fees Payments
                                    </h3>
                                    <div className={isMobile ? "" : "btn-group pull-right"} style={isMobile ? { marginLeft: 'auto' } : {}}>
                                        <button
                                            onClick={() => navigate(-1)}
                                            className="btn btn-primary btn-xs"
                                        >
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>

                                <div className="box-body">
                                    <div className="row">
                                        <div className="col-md-12">
                                            <form onSubmit={handleSearch} className={isMobile ? "" : "form-inline"}>
                                                <div className="form-group" style={isMobile ? { width: '100%', marginBottom: '20px', display: 'block' } : {}}>
                                                    <div className={isMobile ? "" : "col-sm-12"}>
                                                        <label style={isMobile ? { marginBottom: '10px', display: 'block' } : {}}>
                                                            Payment ID <small className="req"> *</small>
                                                        </label>
                                                        <input
                                                            autoFocus
                                                            id="paymentid"
                                                            name="paymentid"
                                                            placeholder="Enter Payment ID"
                                                            type="text"
                                                            className="form-control"
                                                            value={paymentId}
                                                            onChange={(e) => setPaymentId(e.target.value)}
                                                            style={isMobile ? {
                                                                width: '100%',
                                                                border: 'none',
                                                                borderBottom: '1px solid #ccc',
                                                                borderRadius: '0',
                                                                boxShadow: 'none',
                                                                backgroundColor: 'transparent',
                                                                outline: 'none',
                                                                padding: '8px 0'
                                                            } : {
                                                                display: 'inline-block',
                                                                width: '180px',
                                                                border: 'none',
                                                                borderBottom: '1px solid #ccc',
                                                                borderRadius: '0',
                                                                boxShadow: 'none',
                                                                backgroundColor: 'transparent',
                                                                paddingLeft: '5px',
                                                                outline: 'none',
                                                                height: '30px',
                                                                marginLeft: '10px',
                                                                marginRight: '10px'
                                                            }}
                                                        />
                                                        {error && (
                                                            <div className="text-danger">{error}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={isMobile ? "text-right" : "form-group align-text-top"} style={isMobile ? { width: '100%', marginTop: '5px' } : {}}>
                                                    <div className={isMobile ? "" : "col-sm-12"}>
                                                        <button
                                                            type="submit"
                                                            className="btn btn-primary btn-sm checkbox-toggle"
                                                            disabled={loading}
                                                        >
                                                            {loading ? (
                                                                <><i className="fa fa-spinner fa-spin"></i> Searching...</>
                                                            ) : (
                                                                <><i className="fa fa-search"></i> Search</>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                {/* Results Section */}
                                {searched && (
                                    <div className="ptt10">
                                        <div className="box-header ptbnull"></div>
                                        <div className="box-header ptbnull">
                                            <h3 className="box-title titlefix">
                                                <i className="fa fa-money"></i> Payment ID Detail
                                            </h3>
                                            <div className="box-tools pull-right"></div>
                                        </div>
                                        <div className="box-body table-responsive">
                                            <div className="download_label">Payment ID Detail</div>

                                            {/* Toolbar: Records, Local Search, Export Buttons */}
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
                                                                width: isMobile ? '180px' : '180px',
                                                                border: 'none',
                                                                borderBottom: '1px solid #ccc',
                                                                borderRadius: '0',
                                                                boxShadow: 'none',
                                                                backgroundColor: 'transparent',
                                                                paddingLeft: '0',
                                                                outline: 'none',
                                                                textAlign: isMobile ? 'center' : 'left'
                                                            }}
                                                            value={localSearch}
                                                            onChange={(e) => {
                                                                setLocalSearch(e.target.value);
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
                                                        <button className="btn btn-default btn-sm" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'payment_list.csv'); }}>
                                                            <i className="fa fa-file-text-o"></i>
                                                        </button>
                                                        <button className="btn btn-default btn-sm" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'payment_list.xls'); }}>
                                                            <i className="fa fa-file-excel-o"></i>
                                                        </button>
                                                        <button className="btn btn-default btn-sm" title="PDF" onClick={() => { const { headers, rows } = getExportData(); downloadPDF(headers, rows, 'payment_list.pdf', 'Search Fees Payments'); }}>
                                                            <i className="fa fa-file-pdf-o"></i>
                                                        </button>
                                                        <button className="btn btn-default btn-sm" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Search Fees Payments'); }} >
                                                            <i className="fa fa-print"></i>
                                                        </button>
                                                        <div className="btn-group">
                                                            <button
                                                                className="btn btn-default btn-sm"
                                                                title="Columns"
                                                                onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}
                                                                style={{ borderTopRightRadius: '20px', borderBottomRightRadius: '20px' }}
                                                            >
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

                                            <table className="table table-striped table-bordered table-hover">
                                                <thead>
                                                    <tr>
                                                        {columns.map(col => visibleColumns.has(col.key) && (
                                                            <th key={col.key} onClick={() => handleSort(col.key)} style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                                                {col.label}{' '}
                                                                <i
                                                                    className={`fa fa-caret-${sortConfig.key === col.key && sortConfig.direction === 'desc' ? 'up' : 'down'}`}
                                                                    style={{ color: sortConfig.key === col.key ? '#333' : '#ccc', marginLeft: '5px' }}
                                                                ></i>
                                                            </th>
                                                        ))}
                                                        <th className="text text-right" style={{ whiteSpace: 'nowrap' }}>Action <i className="fa fa-caret-down" style={{ color: '#ccc', marginLeft: '5px' }}></i></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {loading ? (
                                                        <tr>
                                                            <td colSpan={visibleColumns.size + 1} className="text-center">
                                                                <i className="fa fa-spinner fa-spin"></i> Loading...
                                                            </td>
                                                        </tr>
                                                    ) : currentRecords.length > 0 ? (
                                                        currentRecords.map((fee, index) => (
                                                            <tr key={`${fee.id}-${index}`}>
                                                                {columns.map(col => visibleColumns.has(col.key) && (
                                                                    <td key={col.key} className={['amount', 'amount_discount', 'amount_fine'].includes(col.key) ? 'text text-right' : ''}>
                                                                        {['amount', 'amount_discount', 'amount_fine'].includes(col.key) ? currencySymbol : ''}
                                                                        {formatCell(fee, col.key)}
                                                                    </td>
                                                                ))}
                                                                <td className="text text-right">
                                                                    <Link
                                                                        to={`/studentfee/addfee/${fee.student_session_id}`}
                                                                        className="btn btn-primary btn-xs"
                                                                        title="View"
                                                                    >
                                                                        View
                                                                    </Link>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={visibleColumns.size + 1} className="text-center">
                                                                No record found
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>

                                            {/* Pagination Footer */}
                                            <div className="row" style={{ marginTop: '15px', display: isMobile ? 'flex' : 'block', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'center' : 'stretch', gap: isMobile ? '10px' : '0' }}>
                                                <div className={isMobile ? "text-center" : "col-sm-5"}>
                                                    <div className="dataTables_info">
                                                        Showing {currentTotal === 0 ? 0 : indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, currentTotal)} of {currentTotal} entries
                                                    </div>
                                                </div>
                                                <div className={isMobile ? "text-center" : "col-sm-7"}>
                                                    <div className={`dataTables_paginate paging_simple_numbers ${isMobile ? '' : 'pull-right'}`}>
                                                        <ul className="pagination" style={{ margin: 0 }}>
                                                            <li className={`paginate_button previous ${currentPage === 1 ? 'disabled' : ''}`}>
                                                                <a href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}><i className="fa fa-angle-left"></i></a>
                                                            </li>
                                                            {totalPages > 0 && totalPages < 1000 && [...Array(totalPages)].map((_, i) => {
                                                                const p = i + 1;
                                                                return (
                                                                    <li key={i} className={`paginate_button ${currentPage === p ? 'active' : ''}`}>
                                                                        <a href="#" onClick={(e) => { e.preventDefault(); handlePageChange(p); }}>{p}</a>
                                                                    </li>
                                                                );
                                                            })}
                                                            <li className={`paginate_button next ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                                                                <a href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}><i className="fa fa-angle-right"></i></a>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default SearchPayment;
