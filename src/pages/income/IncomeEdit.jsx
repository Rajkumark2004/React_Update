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

const IncomeEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [incomeList, setIncomeList] = useState([]);
    const [incomeHeadList, setIncomeHeadList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const [formData, setFormData] = useState({
        inc_head_id: '',
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
        { key: 'income_category', label: 'Income Head', sortKey: 'income_category' },
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
        if (key === 'income_category') return row.income_category || getHeadName(row.inc_head_id);
        if (key === 'amount') return row.amount_formatted || row.amount;
        return row[key] || '';
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            // Fetch initial data using Promise.all
            const [headRes, listRes, incomeDetail] = await Promise.all([
                api.getIncomeHeadList(),
                api.getIncomeList(),
                api.fetchIncome(id)
            ]);

            console.log('Income Head Response:', headRes);
            console.log('Income List Response:', listRes);
            console.log('Income Detail Response:', incomeDetail);

            // Robust parsing for income heads
            let heads = [];
            if (headRes) {
                heads = headRes.data || headRes.incheadlist || (Array.isArray(headRes) ? headRes : []);
            }
            setIncomeHeadList(heads);

            // Robust parsing for income list
            if (listRes) {
                const list = listRes.data || listRes.aaData || listRes.incomeList || listRes.income_list || listRes.incheadlist || (Array.isArray(listRes) ? listRes : []);
                setIncomeList(Array.isArray(list) ? list : []);
            }

            // Populate form with current income detail
            if (incomeDetail && incomeDetail.data) {
                const item = incomeDetail.data;
                setFormData({
                    inc_head_id: item.income_head_id || item.inc_head_id || '',
                    name: item.name || '',
                    invoice_no: item.invoice_no || '',
                    date: item.date || '',
                    amount: item.amount || '',
                    description: item.note || item.description || '',
                    documents: null
                });
                setExistingDocument(item.documents || null);
            } else {
                toast.error('Income not found');
                navigate('/admin/income');
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load income data');
            navigate('/admin/income');
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
            dataToSend.append('inc_head_id', formData.inc_head_id);
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

            const response = await api.editIncome(id, dataToSend);
            if (response.status || response.success) {
                toast.success('Income updated successfully');
                navigate('/admin/income');
            } else {
                toast.error(response.message || 'Failed to update income');
            }
        } catch (error) {
            console.error('Error updating income:', error);
            toast.error(error.message || 'Failed to update income');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (deleteId) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                const response = await api.deleteIncome(deleteId);
                if (response.status || response.success) {
                    toast.success('Income deleted successfully');
                    if (deleteId == id) navigate('/admin/income');
                    else fetchInitialData();
                } else {
                    toast.error(response.message || 'Failed to delete income');
                }
            } catch (error) {
                console.error('Error deleting income:', error);
                toast.error('Failed to delete income');
            }
        }
    };

    const getHeadName = (id) => {
        const head = incomeHeadList.find(h => h.id == id);
        return head ? head.income_category : '';
    };

    const { sortedData: sortedIncome, requestSort: handleSort, getSortIcon } = useTableSort(incomeList);

    const filteredIncomeList = sortedIncome.filter(income =>
        Object.values(income).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        ) || getHeadName(income.inc_head_id).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getExportData = () => buildExportData(columns, visibleColumns, filteredIncomeList, formatCell);

    // Pagination logic
    const totalItems = filteredIncomeList.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const totalPages = Math.ceil(totalItems / safeRecordsPerPage);
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentItems = filteredIncomeList.slice(indexOfFirstItem, indexOfLastItem);

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
                                    <h3 className="box-title">Edit Income</h3>
                                    <div className="box-tools pull-right hidden-sm hidden-md hidden-lg">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label>Income Head</label> <small className="req">*</small>
                                            <select
                                                autoFocus
                                                name="inc_head_id"
                                                className="form-control"
                                                value={formData.inc_head_id}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select</option>
                                                {incomeHeadList.map(h => (
                                                    <option key={h.id} value={h.id}>{h.income_category}</option>
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
                                                data-default-file={existingDocument ? `https://newlayout.wisibles.com/admin/income/download/${id}` : ''}
                                            />
                                            {existingDocument && !formData.documents && (
                                                <div className="mt-2">
                                                    <i className="fa fa-file-text-o text-muted"></i>
                                                    <a
                                                        href={`https://newlayout.wisibles.com/admin/income/download/${id}`}
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
                                    <h3 className="box-title titlefix">Income List</h3>
                                    <div className="box-tools pull-right hidden-xs">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
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
                                        exportFileName="income_list"
                                        exportTitle="Income List"
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
                                                    currentItems.map((income) => (
                                                        <tr key={income.id}>
                                                            {columns.map(col => visibleColumns.has(col.key) && (
                                                                <td key={col.key} className={col.key === 'amount' ? "mailbox-name text-right" : "mailbox-name"}>
                                                                    {formatCell(income, col.key)}
                                                                </td>
                                                            ))}
                                                            <td className="text-right white-space-nowrap noExport">
                                                                {income.documents && (
                                                                    <a href={`https://newlayout.wisibles.com/admin/income/download/${income.id}`} className="btn btn-default btn-xs" data-toggle="tooltip" title="Download" style={{ marginRight: '2px' }}>
                                                                        <i className="fa fa-download"></i>
                                                                    </a>
                                                                )}
                                                                <Link to={`/admin/income/edit/${income.id}`} className="btn btn-default btn-xs" data-toggle="tooltip" title="Edit" style={{ marginRight: '2px' }}>
                                                                    <i className="fa fa-pencil"></i>
                                                                </Link>
                                                                <a href="#" onClick={(e) => { e.preventDefault(); handleDelete(income.id) }} className="btn btn-default btn-xs" data-toggle="tooltip" title="Delete">
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

export default IncomeEdit;
