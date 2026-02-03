import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

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

    const filteredExpenseHeadList = expenseHeadList.filter(head =>
        Object.values(head).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const handleExport = (type) => {
        toast.success(`${type} export triggered (Simulation)`);
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
                                                    <th>Expense Head</th>
                                                    <th>Description</th>
                                                    <th className="text-right noExport">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {initialLoading ? (
                                                    <tr>
                                                        <td colSpan="2" className="text-center">Loading...</td>
                                                    </tr>
                                                ) : filteredExpenseHeadList.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="2" className="text-center">No data available</td>
                                                    </tr>
                                                ) : (
                                                    filteredExpenseHeadList.map((head) => (
                                                        <tr key={head.id}>
                                                            <td className="mailbox-name">
                                                                {head.exp_category}
                                                            </td>
                                                            <td className="mailbox-name">
                                                                {head.description}
                                                            </td>
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
