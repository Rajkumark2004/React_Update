import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable, buildExportData } from '../../utils/tableExport';
import { useTableSort } from '../../hooks/useTableSort';



const IncomeList = () => {
    const [isDragOver, setIsDragOver] = useState(false);
    const navigate = useNavigate();
    const [incomeList, setIncomeList] = useState([]);
    const [incomeHeadList, setIncomeHeadList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(100);

    const columns = [
        { key: 'name', label: 'Name', sortKey: 'name' },
        { key: 'description', label: 'Description', sortKey: 'description' },
        { key: 'invoice_no', label: 'Invoice Number', sortKey: 'invoice_no' },
        { key: 'date', label: 'Date', sortKey: 'date' },
        { key: 'income_category', label: 'Income Head', sortKey: 'income_category' },
        { key: 'amount', label: 'Amount (₹)', sortKey: 'amount' }
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
        if (key === 'income_category') return row.income_category || getHeadName(row.inc_head_id);
        if (key === 'amount') return row.amount_formatted || row.amount;
        return row[key] || '';
    };

    const [formData, setFormData] = useState({
        inc_head_id: '',
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
            console.log('Fetching initial data for Income List');
            const [incomeRes, headRes] = await Promise.all([
                api.getIncomeList(),
                api.getIncomeHeadList()
            ]);

            console.log('Income Response:', incomeRes);
            console.log('Head Response:', headRes);

            // Robust parsing for income list
            if (incomeRes) {
                const list = incomeRes.data || incomeRes.aaData || incomeRes.incomeList || incomeRes.income_list || incomeRes.incheadlist || (Array.isArray(incomeRes) ? incomeRes : []);
                setIncomeList(Array.isArray(list) ? list : []);
            }

            // Robust parsing for income heads
            if (headRes) {
                const heads = headRes.data || headRes.incheadlist || (Array.isArray(headRes) ? headRes : []);
                setIncomeHeadList(Array.isArray(heads) ? heads : []);
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
            dataToSend.append('inc_head_id', formData.inc_head_id);
            dataToSend.append('name', formData.name);
            dataToSend.append('invoice_no', formData.invoice_no);
            dataToSend.append('date', formData.date);
            dataToSend.append('amount', formData.amount);
            dataToSend.append('description', formData.description);
            if (formData.documents) {
                dataToSend.append('documents', formData.documents);
            }

            const response = await api.addIncome(dataToSend);
            if (response.status || response.success) {
                toast.success('Income added successfully');
                setFormData({
                    inc_head_id: '',
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
                toast.error(response.message || 'Failed to add income');
            }
        } catch (error) {
            console.error('Error adding income:', error);
            toast.error(error.message || 'Failed to add income');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                const response = await api.deleteIncome(id);
                if (response.status || response.success) {
                    toast.success('Income deleted successfully');
                    fetchInitialData();
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
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredIncomeList.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredIncomeList.length / itemsPerPage);

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
                                    <h3 className="box-title">Income</h3>
                                </div>
                                <ul className="tablists">
                                    <li className="active">
                                        <Link to="/admin/income" className="active">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/income/1.png" alt="icon1" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} />
                                            Add Income
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/incomehead">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/income/3.png" alt="icon3" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} />
                                            Income Head
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Add Form */}
                        <div className="col-md-4">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Add Income</h3>
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

                        {/* Income List */}
                        <div className="col-md-6">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Income List</h3>
                                    <div className="box-tools pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs" style={{ marginRight: '5px' }}>
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="row" style={{ marginBottom: '10px' }}>
                                        <div className="col-md-6">
                                            <div className="dt-buttons btn-group">
                                                <button className="btn btn-default btn-sm" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }}>
                                                    <i className="fa fa-files-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'income_list.csv'); }}>
                                                    <i className="fa fa-file-text-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'income_list.xls'); }}>
                                                    <i className="fa fa-file-excel-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="PDF" onClick={() => { const { headers, rows } = getExportData(); downloadPDF(headers, rows, 'income_list.pdf', 'Income List'); }}>
                                                    <i className="fa fa-file-pdf-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Income List'); }}>
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
                                                    onChange={(e) => {
                                                        setSearchTerm(e.target.value);
                                                        setCurrentPage(1);
                                                    }}
                                                />
                                                <span className="input-group-addon"><i className="fa fa-search"></i></span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="table-responsive mailbox-messages overflow-visible">
                                        <table className="table table-striped table-bordered table-hover example">
                                            <thead>
                                                <tr>
                                                    {columns.map(col => visibleColumns.has(col.key) && (
                                                        <th key={col.key}
                                                            className={col.sortKey ? 'sorting' : ''}
                                                            style={col.sortKey ? { cursor: 'pointer' } : {}}
                                                            onClick={col.sortKey ? () => handleSort(col.sortKey) : undefined}
                                                        >
                                                            {col.label} {col.sortKey && getSortIcon(col.sortKey)}
                                                        </th>
                                                    ))}
                                                    <th className="text-right noExport">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {initialLoading ? (
                                                    <tr><td colSpan="7" className="text-center">Loading...</td></tr>
                                                ) : currentItems.length === 0 ? (
                                                    <tr><td colSpan="7" className="text-center">No data available</td></tr>
                                                ) : (
                                                    currentItems.map((income) => (
                                                        <tr key={income.id}>
                                                            {columns.map(col => visibleColumns.has(col.key) && (
                                                                <td key={col.key} className={col.key === 'amount' ? "mailbox-name text-right" : "mailbox-name"}>
                                                                    {formatCell(income, col.key)}
                                                                </td>
                                                            ))}
                                                            <td className="text-right white-space-nowrap">
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

                                    {/* Pagination UI */}
                                    {!initialLoading && filteredIncomeList.length > 0 && (
                                        <div className="row mt-3">
                                            <div className="col-sm-5">
                                                <div className="dataTables_info" style={{ padding: '8px 0' }}>
                                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredIncomeList.length)} of {filteredIncomeList.length} entries
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

export default IncomeList;
