import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable, buildExportData } from '../../utils/tableExport';
import { useTableSort } from '../../hooks/useTableSort';

const ExpenseList = () => {
    const [isDragOver, setIsDragOver] = useState(false);
    const navigate = useNavigate();
    const [expenseList, setExpenseList] = useState([]);
    const [expenseHeadList, setExpenseHeadList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(100);

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

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'documents') {
            setFormData({ ...formData, documents: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) setFormData(prev => ({ ...prev, documents: file }));
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
    const handleDragLeave = () => setIsDragOver(false);

    const removeFile = () => {
        setFormData(prev => ({ ...prev, documents: null }));
        const el = document.getElementById('documents');
        if (el) el.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dataToSend = new FormData();
            dataToSend.append('exp_head_id', formData.exp_head_id);
            dataToSend.append('name', formData.name);
            dataToSend.append('invoice_no', formData.invoice_no);
            dataToSend.append('date', formData.date);
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
                setIsDragOver(false);
                if (document.getElementById('documents')) {
                    document.getElementById('documents').value = "";
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
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredExpenseList.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredExpenseList.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className="wrapper theme-white-skin">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '828px' }}>
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
                                            <div
                                                onDrop={handleDrop}
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onClick={() => document.getElementById('documents').click()}
                                                style={{
                                                    border: `2px dashed ${isDragOver ? '#31708f' : '#aaa'}`,
                                                    borderRadius: '6px',
                                                    padding: '18px 12px',
                                                    textAlign: 'center',
                                                    cursor: 'pointer',
                                                    background: isDragOver ? '#d9edf7' : '#fafafa',
                                                    transition: 'background 0.2s, border-color 0.2s',
                                                    userSelect: 'none'
                                                }}
                                            >
                                                <input
                                                    id="documents"
                                                    name="documents"
                                                    type="file"
                                                    style={{ display: 'none' }}
                                                    onChange={handleInputChange}
                                                />
                                                {formData.documents ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                        <i className="fa fa-file-text-o" style={{ color: '#31708f' }}></i>
                                                        <span style={{ fontSize: '13px', color: '#333' }}>{formData.documents.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); removeFile(); }}
                                                            style={{ background: 'none', border: 'none', color: '#a94442', cursor: 'pointer', padding: '0 4px', fontSize: '14px' }}
                                                            title="Remove file"
                                                        >
                                                            <i className="fa fa-times-circle"></i>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <i className="fa fa-cloud-upload" style={{ fontSize: '22px', color: '#aaa', display: 'block', marginBottom: '6px' }}></i>
                                                        <span style={{ fontSize: '13px', color: '#888' }}>Drag &amp; drop a file here, or <span style={{ color: '#31708f', textDecoration: 'underline' }}>click to browse</span></span>
                                                    </div>
                                                )}
                                            </div>
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
                                    <div className="mailbox-controls">
                                        <div className="pull-left">
                                            <div className="btn-group">
                                                <button className="btn btn-default btn-sm" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }}>
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
                                                    <button type="button" className="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown" aria-expanded="false" title="Columns">
                                                        <i className="fa fa-columns"></i> <span className="caret"></span>
                                                    </button>
                                                    <ul className="dropdown-menu" style={{ padding: '10px', minWidth: '150px' }}>
                                                        {columns.map(col => (
                                                            <li key={col.key} style={{ padding: '0px' }}>
                                                                <label style={{ display: 'block', margin: '0', fontWeight: 'normal', cursor: 'pointer' }}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={visibleColumns.has(col.key)}
                                                                        onChange={() => toggleColumn(col.key)}
                                                                        style={{ marginRight: '8px' }}
                                                                    />
                                                                    {col.label}
                                                                </label>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pull-right">
                                            <div className="input-group input-group-sm" style={{ width: '150px' }}>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Search..."
                                                    value={searchTerm}
                                                    onChange={(e) => {
                                                        setSearchTerm(e.target.value);
                                                        setCurrentPage(1);
                                                    }}
                                                />
                                                <div className="input-group-addon">
                                                    <i className="fa fa-search"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="table-responsive mailbox-messages overflow-visible">
                                        <table className="table table-striped table-bordered table-hover example">
                                            <thead>
                                                <tr>
                                                    {columns.map(col => visibleColumns.has(col.key) && (
                                                        <th key={col.key} onClick={() => requestSort(col.sortKey)} style={{ cursor: 'pointer' }} className={col.key === 'amount' ? 'text-right' : ''}>
                                                            {col.label} {getSortIcon(col.sortKey)}
                                                        </th>
                                                    ))}
                                                    <th className="text-right noExport">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {initialLoading ? (
                                                    <tr><td colSpan={visibleColumns.size + 1} className="text-center">Loading...</td></tr>
                                                ) : currentItems.length === 0 ? (
                                                    <tr><td colSpan={visibleColumns.size + 1} className="text-center">No data available</td></tr>
                                                ) : (
                                                    currentItems.map((expense) => (
                                                        <tr key={expense.id}>
                                                            {visibleColumns.has('name') && <td className="mailbox-name">{expense.name}</td>}
                                                            {visibleColumns.has('description') && <td className="mailbox-name">{expense.note || expense.description}</td>}
                                                            {visibleColumns.has('invoice_no') && <td className="mailbox-name">{expense.invoice_no}</td>}
                                                            {visibleColumns.has('date') && <td className="mailbox-name">{expense.date}</td>}
                                                            {visibleColumns.has('exp_head') && <td className="mailbox-name">{expense.exp_head}</td>}
                                                            {visibleColumns.has('amount') && <td className="mailbox-name text-right">{expense.amount}</td>}
                                                            <td className="mailbox-date pull-right">
                                                                <Link to={`/admin/expense/edit/${expense.id}`} className="btn btn-default btn-xs" data-toggle="tooltip" title="Edit">
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

                                    {/* Pagination UI */}
                                    {!initialLoading && filteredExpenseList.length > 0 && (
                                        <div className="row mt-3">
                                            <div className="col-sm-5">
                                                <div className="dataTables_info" style={{ padding: '8px 0' }}>
                                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredExpenseList.length)} of {filteredExpenseList.length} entries
                                                </div>
                                            </div>
                                            <div className="col-sm-7">
                                                <div className="dataTables_paginate paging_simple_numbers pull-right">
                                                    <ul className="pagination pagination-sm no-margin">
                                                        <li className={`paginate_button previous ${currentPage === 1 ? 'disabled' : ''}`}>
                                                            <button
                                                                onClick={() => handlePageChange(currentPage - 1)}
                                                                disabled={currentPage === 1}
                                                                className="btn btn-default btn-sm"
                                                                style={{ marginRight: '5px' }}
                                                            >
                                                                Previous
                                                            </button>
                                                        </li>

                                                        {[...Array(totalPages)].map((_, index) => (
                                                            <li key={index + 1} className={`paginate_button ${currentPage === index + 1 ? 'active' : ''}`}>
                                                                <button
                                                                    onClick={() => handlePageChange(index + 1)}
                                                                    className={`btn btn-sm ${currentPage === index + 1 ? 'btn-primary' : 'btn-default'}`}
                                                                    style={{ marginRight: '5px' }}
                                                                >
                                                                    {index + 1}
                                                                </button>
                                                            </li>
                                                        ))}

                                                        <li className={`paginate_button next ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                            <button
                                                                onClick={() => handlePageChange(currentPage + 1)}
                                                                disabled={currentPage === totalPages}
                                                                className="btn btn-default btn-sm"
                                                            >
                                                                Next
                                                            </button>
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

export default ExpenseList;
