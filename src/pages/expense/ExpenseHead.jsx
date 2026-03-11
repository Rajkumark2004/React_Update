import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable, buildExportData } from '../../utils/tableExport';
import { useTableSort } from '../../hooks/useTableSort';

const ExpenseHead = () => {
    const navigate = useNavigate();
    const [expenseHeadList, setExpenseHeadList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        expensehead: '',
        description: ''
    });
    const [initialLoading, setInitialLoading] = useState(true);

    // Columns Definition
    const columns = [
        { key: 'exp_category', label: 'Expense Head', sortKey: 'exp_category' },
        { key: 'description', label: 'Description', sortKey: 'description' }
    ];

    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));

    const toggleColumn = (key) => {
        const newVisible = new Set(visibleColumns);
        if (newVisible.has(key)) newVisible.delete(key);
        else newVisible.add(key);
        setVisibleColumns(newVisible);
    };
    useEffect(() => {
        fetchExpenseHeadList();
    }, []);

    const fetchExpenseHeadList = async () => {
        try {
            console.log('Fetching Expense Head List');
            const response = await api.getExpenseHeadList();
            console.log('Expense Head Response:', response);
            if (response) {
                const list = response.data || response.expheadlist || (Array.isArray(response) ? response : []);
                setExpenseHeadList(Array.isArray(list) ? list : []);
            }
        } catch (error) {
            console.error('Error fetching expense heads:', error);
            toast.error('Failed to fetch expense heads');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.addExpenseHead(formData);
            if (response.status || response.success) {
                toast.success('Expense Head added successfully');
                setFormData({ expensehead: '', description: '' });
                fetchExpenseHeadList();
            } else {
                toast.error(response.message || 'Failed to add expense head');
            }
        } catch (error) {
            console.error('Error adding expense head:', error);
            toast.error(error.message || 'Failed to add expense head');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                const response = await api.deleteExpenseHead(id);
                if (response.status || response.success) {
                    toast.success('Expense Head deleted successfully');
                    fetchExpenseHeadList();
                } else {
                    toast.error(response.message || 'Failed to delete expense head');
                }
            } catch (error) {
                console.error('Error deleting expense head:', error);
                toast.error('Failed to delete expense head');
            }
        }
    };

    const { sortedData, requestSort, sortConfig, getSortIcon } = useTableSort(expenseHeadList);

    const filteredExpenseHeadList = sortedData.filter(head =>
        Object.values(head).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Export Helper
    const formatCell = (row, key) => {
        return row[key] || '';
    };

    const getExportData = () => {
        return buildExportData(columns, visibleColumns, filteredExpenseHeadList, formatCell);
    };

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
                                    <li>
                                        <Link to="/admin/expense">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/expenses/1.png" alt="icon1" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} />
                                            Add Expense
                                        </Link>
                                    </li>
                                    <li className="active">
                                        <Link to="/admin/expensehead" className="active">
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
                                    <h3 className="box-title">Add Expense Head</h3>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label>Expense Head</label> <small className="req">*</small>
                                            <input
                                                autoFocus
                                                name="expensehead"
                                                type="text"
                                                className="form-control"
                                                value={formData.expensehead}
                                                onChange={handleInputChange}
                                                required
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

                        {/* Expense Head List */}
                        <div className="col-md-6">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Expense Head List</h3>
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
                                                <button className="btn btn-default btn-sm" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'expense_head_list.csv'); }}>
                                                    <i className="fa fa-file-text-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'expense_head_list.xls'); }}>
                                                    <i className="fa fa-file-excel-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="PDF" onClick={() => { const { headers, rows } = getExportData(); downloadPDF(headers, rows, 'expense_head_list.pdf', 'Expense Head List'); }}>
                                                    <i className="fa fa-file-pdf-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Expense Head List'); }}>
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
                                                    onChange={(e) => setSearchTerm(e.target.value)}
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
                                                ) : filteredExpenseHeadList.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={visibleColumns.size + 1} className="text-center">No data available</td>
                                                    </tr>
                                                ) : (
                                                    filteredExpenseHeadList.map((head) => (
                                                        <tr key={head.id}>
                                                            {visibleColumns.has('exp_category') && <td className="mailbox-name">
                                                                {head.exp_category}
                                                            </td>}
                                                            {visibleColumns.has('description') && <td className="mailbox-name">
                                                                {head.description}
                                                            </td>}
                                                            <td className="mailbox-date pull-right">
                                                                <Link
                                                                    to={`/admin/expensehead/edit/${head.id}`}
                                                                    className="btn btn-default btn-xs"
                                                                    data-toggle="tooltip"
                                                                    title="Edit"
                                                                >
                                                                    <i className="fa fa-pencil"></i>
                                                                </Link>
                                                                <a
                                                                    href="#"
                                                                    onClick={(e) => { e.preventDefault(); handleDelete(head.id); }}
                                                                    className="btn btn-default btn-xs"
                                                                    data-toggle="tooltip"
                                                                    title="Delete"
                                                                >
                                                                    <i className="fa fa-remove"></i>
                                                                </a>
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

export default ExpenseHead;
