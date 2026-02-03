import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const IncomeList = () => {
    const navigate = useNavigate();
    const [incomeList, setIncomeList] = useState([]);
    const [incomeHeadList, setIncomeHeadList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(100);

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

    const filteredIncomeList = incomeList.filter(income =>
        Object.values(income).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        ) || getHeadName(income.inc_head_id).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExport = (type) => {
        toast.success(`${type} export triggered (Simulation)`);
    };

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
                                            <input
                                                id="documents"
                                                name="documents"
                                                type="file"
                                                className="form-control"
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
                                    <div className="mailbox-controls">
                                        <div className="pull-left">
                                            <div className="btn-group">
                                                <button type="button" className="btn btn-default btn-xs" title="Copy" onClick={() => handleExport('Copy')}>
                                                    <i className="fa fa-copy"></i>
                                                </button>
                                                <button type="button" className="btn btn-default btn-xs" title="Excel" onClick={() => handleExport('Excel')}>
                                                    <i className="fa fa-file-excel-o"></i>
                                                </button>
                                                <button type="button" className="btn btn-default btn-xs" title="CSV" onClick={() => handleExport('CSV')}>
                                                    <i className="fa fa-file-text-o"></i>
                                                </button>
                                                <button type="button" className="btn btn-default btn-xs" title="PDF" onClick={() => handleExport('PDF')}>
                                                    <i className="fa fa-file-pdf-o"></i>
                                                </button>
                                                <button type="button" className="btn btn-default btn-xs" title="Print" onClick={() => window.print()}>
                                                    <i className="fa fa-print"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="pull-right">
                                            <div className="has-feedback">
                                                <input
                                                    type="text"
                                                    className="form-control input-sm"
                                                    placeholder="Search..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                                <span className="glyphicon glyphicon-search form-control-feedback"></span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="table-responsive mailbox-messages overflow-visible">
                                        <table className="table table-striped table-bordered table-hover example">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Description</th>
                                                    <th>Invoice Number</th>
                                                    <th>Date</th>
                                                    <th>Income Head</th>
                                                    <th className="text-right">Amount (₹)</th>
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
                                                            <td className="mailbox-name">{income.name}</td>
                                                            <td className="mailbox-name">{income.description}</td>
                                                            <td className="mailbox-name">{income.invoice_no}</td>
                                                            <td className="mailbox-name">{income.date}</td>
                                                            <td className="mailbox-name">{income.income_category || getHeadName(income.inc_head_id)}</td>
                                                            <td className="mailbox-name text-right">{income.amount_formatted || income.amount}</td>
                                                            <td className="mailbox-date pull-right">
                                                                <Link to={`/admin/income/edit/${income.id}`} className="btn btn-default btn-xs" data-toggle="tooltip" title="Edit">
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
