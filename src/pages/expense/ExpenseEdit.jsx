import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { buildExportData } from '../../utils/tableExport';
import { useTableSort } from '../../hooks/useTableSort';
import TableToolbar from '../../utils/TableToolbar';
import Pagination from '../../utils/Pagination';

const ExpenseEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [expenseList, setExpenseList] = useState([]);
    const [expenseHeadList, setExpenseHeadList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const [formData, setFormData] = useState({
        exp_head_id: '',
        name: '',
        invoice_no: '',
        date: '',
        amount: '',
        description: '',
        documents: null
    });
    const [existingDocument, setExistingDocument] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);

    const columns = [
        { key: 'name', label: 'Name', sortKey: 'name' },
        { key: 'description', label: 'Description', sortKey: 'description' },
        { key: 'invoice_no', label: 'Invoice Number', sortKey: 'invoice_no' },
        { key: 'date', label: 'Date', sortKey: 'date' },
        { key: 'exp_category', label: 'Expense Head', sortKey: 'exp_category' },
        { key: 'amount', label: 'Amount (₹)', sortKey: 'amount' }
    ];
    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));

    const handleToggleColumn = (key) => {
        setVisibleColumns(prev => {
            const next = new Set(prev);
            if (next.has(key)) { next.delete(key); } else { next.add(key); }
            return next;
        });
    };

    const formatCell = (row, key) => {
        if (key === 'exp_category') return row.exp_category || getHeadName(row.exp_head_id);
        if (key === 'amount') return row.amount;
        return row[key] || '';
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            // Fetch initial data using Promise.all
            const [headRes, listRes, expenseDetail] = await Promise.all([
                api.getExpenseHeadList(),
                api.getExpenseList(),
                api.fetchExpense(id)
            ]);

            console.log('Expense Head Response:', headRes);
            console.log('Expense List Response:', listRes);
            console.log('Expense Detail Response:', expenseDetail);

            // Robust parsing for expense heads
            let heads = [];
            if (headRes) {
                heads = headRes.data || headRes.expheadlist || (Array.isArray(headRes) ? headRes : []);
            }
            setExpenseHeadList(heads);

            // Robust parsing for expense list
            if (listRes) {
                const list = listRes.data || listRes.aaData || listRes.expenseList || listRes.expense_list || listRes.expheadlist || (Array.isArray(listRes) ? listRes : []);
                setExpenseList(Array.isArray(list) ? list : []);
            }

            // Populate form with current expense detail
            if (expenseDetail && expenseDetail.expense) {
                const item = expenseDetail.expense;
                setFormData({
                    exp_head_id: item.exp_head_id || '',
                    name: item.name || '',
                    invoice_no: item.invoice_no || '',
                    date: item.date || '',
                    amount: item.amount || '',
                    description: item.note || item.description || '',
                    documents: null
                });
                setExistingDocument(item.documents || null);
            } else {
                toast.error('Expense not found');
                navigate('/admin/expense');
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load expense data');
            navigate('/admin/expense');
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
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
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

            const response = await api.editExpense(id, dataToSend);
            if (response.status || response.success) {
                toast.success('Expense updated successfully');
                navigate('/admin/expense');
            } else {
                toast.error(response.message || 'Failed to update expense');
            }
        } catch (error) {
            console.error('Error updating expense:', error);
            toast.error(error.message || 'Failed to update expense');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (deleteId) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                const response = await api.deleteExpense(deleteId);
                if (response.status || response.success) {
                    toast.success('Expense deleted successfully');
                    if (deleteId == id) navigate('/admin/expense');
                    else fetchInitialData();
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

    const { sortedData: sortedExpense, requestSort: handleSort, getSortIcon } = useTableSort(expenseList);

    const filteredExpenseList = sortedExpense.filter(expense =>
        Object.values(expense).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        ) || getHeadName(expense.exp_head_id).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getExportData = () => buildExportData(columns, visibleColumns, filteredExpenseList, formatCell);

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
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content">
                    <div className="row">
                        <div className="col-md-4">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Edit Expense</h3>
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
                                                data-default-file={existingDocument ? `https://newlayout.wisibles.com/admin/expense/download/${id}` : ''}
                                            />
                                            {existingDocument && !formData.documents && (
                                                <div className="mt-2">
                                                    <i className="fa fa-file-text-o text-muted"></i>
                                                    <a
                                                        href={`https://newlayout.wisibles.com/admin/expense/download/${id}`}
                                                        className="ml-2 text-info"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ marginLeft: '10px' }}
                                                    >
                                                        Download Existing Document
                                                    </a>
                                                </div>
                                            )}
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
                        <div className="col-md-8">
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
                                    <TableToolbar
                                        searchTerm={searchTerm}
                                        onSearchChange={setSearchTerm}
                                        recordsPerPage={recordsPerPage}
                                        onRecordsPerPageChange={setRecordsPerPage}
                                        columns={columns}
                                        visibleColumns={visibleColumns}
                                        onToggleColumn={handleToggleColumn}
                                        getExportData={getExportData}
                                        exportFileName="expense_list"
                                        exportTitle="Expense List"
                                    />
                                    <div className="table-responsive mailbox-messages">
                                        <table className="table table-striped table-bordered table-hover example">
                                            <thead>
                                                <tr>
                                                    {columns.map(col => visibleColumns.has(col.key) && (
                                                        <th key={col.key} onClick={() => handleSort(col.sortKey)} style={{ cursor: 'pointer' }} className={col.key === 'amount' ? 'text-right' : ''}>
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
                                                    <tr><td colSpan={visibleColumns.size + 1} className="text-center text-danger">No data available in table</td></tr>
                                                ) : (
                                                    currentItems.map((expense) => (
                                                        <tr key={expense.id}>
                                                            {columns.map(col => visibleColumns.has(col.key) && (
                                                                <td key={col.key} className={col.key === 'amount' ? "mailbox-name text-right" : "mailbox-name"}>
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

export default ExpenseEdit;
