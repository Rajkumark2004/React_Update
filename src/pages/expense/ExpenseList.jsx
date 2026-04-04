import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable, buildExportData } from '../../utils/tableExport';
import { useTableSort } from '../../hooks/useTableSort';
import Pagination from '../../utils/Pagination';

const ExpenseList = () => {
    const navigate = useNavigate();
    const [expenseList, setExpenseList] = useState([]);
    const [expenseHeadList, setExpenseHeadList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;
    const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

    // Columns Definition
    const columns = [
        { key: 'name', label: 'Name', sortKey: 'name' },
        { key: 'description', label: 'Description', sortKey: 'description' },
        { key: 'invoice_no', label: 'Invoice Number', sortKey: 'invoice_no' },
        { key: 'date', label: 'Date', sortKey: 'date' },
        { key: 'exp_head', label: 'Expense Head', sortKey: 'exp_head_id' },
        { key: 'amount', label: 'Amount', sortKey: 'amount' }
    ];

    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));

    const toggleColumn = (key) => {
        const newVisible = new Set(visibleColumns);
        if (newVisible.has(key)) newVisible.delete(key);
        else newVisible.add(key);
        setVisibleColumns(newVisible);
    };

    const [formData, setFormData] = useState({
        exp_head_id: '',
        name: '',
        invoice_no: '',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        description: '',
        documents: null
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            console.log('Fetching initial data for Expense List');
            const [expenseRes, headRes] = await Promise.all([
                api.getExpenseList(),
                api.getExpenseHeadList()
            ]);

            console.log('Expense Response:', expenseRes);
            console.log('Head Response:', headRes);

            // Robust parsing for expense list
            if (expenseRes) {
                const list = expenseRes.data || expenseRes.aaData || expenseRes.expenseList || expenseRes.expense_list || expenseRes.expheadlist || (Array.isArray(expenseRes) ? expenseRes : []);
                setExpenseList(Array.isArray(list) ? list : []);
            }

            // Robust parsing for expense heads
            if (headRes) {
                const heads = headRes.data || headRes.expheadlist || (Array.isArray(headRes) ? headRes : []);
                setExpenseHeadList(Array.isArray(heads) ? heads : []);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch data');
        } finally {
            setInitialLoading(false);
        }
    };

    // Initialize Dropify
    useEffect(() => {
        const timer = setTimeout(() => {
            try {
                const $ = window.jQuery;
                if ($ && $.fn && typeof $.fn.dropify === 'function') {
                    $('.dropify').dropify();
                }
            } catch (error) {
                console.error('Dropify initialization error:', error);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dataToSend = new FormData();
            dataToSend.append('exp_head_id', formData.exp_head_id);
            dataToSend.append('name', formData.name);
            dataToSend.append('invoice_no', formData.invoice_no);

            // Format date from yyyy-mm-dd to dd/mm/yyyy
            let formattedDate = formData.date;
            if (formData.date && formData.date.includes('-')) {
                const [y, m, d] = formData.date.split('-');
                formattedDate = `${d}/${m}/${y}`;
            }
            dataToSend.append('date', formattedDate);

            dataToSend.append('amount', formData.amount);
            dataToSend.append('description', formData.description);
            if (formData.documents) {
                dataToSend.append('documents', formData.documents);
            }

            const response = await api.addExpense(dataToSend);
            if (response.status || response.success) {
                toast.success('Expense added successfully');
                setFormData({
                    exp_head_id: '',
                    name: '',
                    invoice_no: '',
                    date: new Date().toISOString().split('T')[0],
                    amount: '',
                    description: '',
                    documents: null
                });
                const $ = window.jQuery;
                if ($ && $.fn && typeof $.fn.dropify === 'function') {
                    $('.dropify').each(function () {
                        var drEvent = $(this).dropify();
                        drEvent = drEvent.data('dropify');
                        drEvent.resetPreview();
                        drEvent.clearElement();
                    });
                }

                fetchInitialData();

            } else {
                toast.error(response.message || 'Failed to add expense');
            }
        } catch (error) {
            console.error('Error adding expense:', error);
            toast.error(error.message || 'Failed to add expense');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                const response = await api.deleteExpense(id);
                if (response.status || response.success) {
                    toast.success('Expense deleted successfully');
                    fetchInitialData();
                } else {
                    toast.error(response.message || 'Failed to delete expense');
                }
            } catch (error) {
                console.error('Error deleting expense:', error);
                toast.error('Failed to delete expense');
            }
        }
    };

    const getHeadName = (id) => {
        const head = expenseHeadList.find(h => h.id == id);
        return head ? head.exp_category : '';
    };

    // Prepare data for sorting
    const sortableData = React.useMemo(() => {
        return expenseList.map(expense => ({
            ...expense,
            exp_head: expense.exp_category || getHeadName(expense.exp_head_id)
        }));
    }, [expenseList, expenseHeadList]);

    // Apply Sorting
    const { sortedData, requestSort, sortConfig, getSortIcon } = useTableSort(sortableData);

    const filteredExpenseList = sortedData.filter(expense =>
        Object.values(expense).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Export Helper
    const formatCell = (row, key) => {
        return row[key] || '';
    };

    const getExportData = () => {
        return buildExportData(columns, visibleColumns, filteredExpenseList, formatCell);
    };

    // Pagination logic
    const totalItems = filteredExpenseList.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const totalPages = Math.ceil(totalItems / safeRecordsPerPage);
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentItems = filteredExpenseList.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, recordsPerPage]);

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <style>{`
                .table-responsive table.example td.mailbox-name {
                    max-width: 150px;
                    word-wrap: break-word !important;
                    word-break: break-all !important;
                    white-space: normal !important;
                }
                .table-responsive table.example td.nowrap-cell {
                    white-space: nowrap !important;
                    word-wrap: normal !important;
                    word-break: normal !important;
                }
            `}</style>
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content">
                    <div className="row">
                        {/* Submenu Sidebar */}
                        <div className="col-md-2">
                            <div className="box border0">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Expense</h3>
                                </div>
                                <ul className="tablists">
                                    <li className="active">
                                        <Link to="/admin/expense" className="active">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/expenses/1.png" alt="icon1" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} />
                                            Add Expense
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/expensehead">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/expenses/3.png" alt="icon3" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} />
                                            Expense Head
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Add Form */}
                        <div className="col-md-4">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Add Expense</h3>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label>Expense Head</label> <small className="req">*</small>
                                            <select
                                                autoFocus
                                                name="exp_head_id"
                                                className="form-control"
                                                value={formData.exp_head_id}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select</option>
                                                {expenseHeadList.map(h => (
                                                    <option key={h.id} value={h.id}>{h.exp_category}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Name</label> <small className="req">*</small>
                                            <input
                                                name="name"
                                                type="text"
                                                className="form-control"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Invoice Number</label>
                                            <input
                                                name="invoice_no"
                                                type="text"
                                                className="form-control"
                                                value={formData.invoice_no}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Date</label> <small className="req">*</small>
                                            <input
                                                name="date"
                                                type="date"
                                                className="form-control"
                                                value={formData.date}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Amount (₹)</label> <small className="req">*</small>
                                            <input
                                                name="amount"
                                                type="number"
                                                className="form-control"
                                                value={formData.amount}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Attach Document</label>
                                            <input
                                                id="documents"
                                                name="documents"
                                                type="file"
                                                className="dropify"
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Description</label>
                                            <textarea
                                                className="form-control"
                                                name="description"
                                                rows="3"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <button type="submit" className="btn btn-info pull-right" disabled={loading}>
                                            {loading ? <i className="fa fa-spinner fa-spin"></i> : 'Save'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Expense List */}
                        <div className="col-md-6">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Expense List</h3>
                                    <div className="box-tools pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs" style={{ marginRight: '5px' }}>
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
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
                                                <button className="btn btn-default btn-sm" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'expense_list.csv'); }}>
                                                    <i className="fa fa-file-text-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'expense_list.xls'); }}>
                                                    <i className="fa fa-file-excel-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="PDF" onClick={() => { const { headers, rows } = getExportData(); downloadPDF(headers, rows, 'expense_list.pdf', 'Expense List'); }}>
                                                    <i className="fa fa-file-pdf-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Expense List'); }}>
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
                                    <div className="table-responsive mailbox-messages">
                                        <table className="table table-striped table-bordered table-hover example">
                                            <thead>
                                                <tr>
                                                    {columns.map(col => visibleColumns.has(col.key) && (
                                                        <th key={col.key} onClick={() => requestSort(col.sortKey)} style={{ cursor: 'pointer' }}>
                                                            {col.label} {getSortIcon(col.sortKey)}
                                                        </th>
                                                    ))}
                                                    <th className="text-right noExport">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {initialLoading ? (
                                                    <tr>
                                                        <td colSpan={visibleColumns.size + 1} className="text-center">Loading...</td>
                                                    </tr>
                                                ) : currentItems.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={visibleColumns.size + 1} className="text-center text-danger">No data available in table</td>
                                                    </tr>
                                                ) : (
                                                    currentItems.map((expense) => (
                                                        <tr key={expense.id}>
                                                            {columns.map(col => visibleColumns.has(col.key) && (
                                                                <td key={col.key} className={`mailbox-name ${col.key === 'amount' || col.key === 'date' ? 'nowrap-cell' : ''}`}>
                                                                    {formatCell(expense, col.key)}
                                                                </td>
                                                            ))}
                                                            <td className="text-right white-space-nowrap noExport">
                                                                {expense.documents && (
                                                                    <a href={`https://newlayout.wisibles.com/admin/expense/download/${expense.id}`} className="btn btn-default btn-xs" data-toggle="tooltip" title="Download" style={{ marginRight: '2px' }}>
                                                                        <i className="fa fa-download"></i>
                                                                    </a>
                                                                )}
                                                                <Link to={`/admin/expense/edit/${expense.id}`} className="btn btn-default btn-xs" data-toggle="tooltip" title="Edit" style={{ marginRight: '2px' }}>
                                                                    <i className="fa fa-pencil"></i>
                                                                </Link>
                                                                <a href="#" onClick={(e) => { e.preventDefault(); handleDelete(expense.id) }} className="btn btn-default btn-xs" data-toggle="tooltip" title="Delete">
                                                                    <i className="fa fa-remove"></i>
                                                                </a>
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
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default ExpenseList;
