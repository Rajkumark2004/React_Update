import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import { api } from '../../../services/api';
import toast from 'react-hot-toast';

const ExpenseList = () => {
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

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [expenseRes, headRes] = await Promise.all([
                api.getExpenseList(),
                api.getExpenseHeadList()
            ]);

            if (expenseRes && expenseRes.data) {
                setExpenseList(expenseRes.data);
            } else if (expenseRes && expenseRes.aaData) {
                setExpenseList(expenseRes.aaData);
            } else if (Array.isArray(expenseRes)) {
                setExpenseList(expenseRes);
            } else {
                setExpenseList([]);
            }

            if (headRes && headRes.data) setExpenseHeadList(headRes.data);
            else if (Array.isArray(headRes)) setExpenseHeadList(headRes);

        } catch (error) {
            console.error('Error fetching data:', error);
            // Don't toast error for list fetch immediately
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
                    date: '',
                    amount: '',
                    description: '',
                    documents: null
                });
                document.getElementById('documents').value = "";

                const expenseRes = await api.getExpenseList();
                if (expenseRes && expenseRes.data) setExpenseList(expenseRes.data);
                else setExpenseList(expenseRes || []);

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
                    const expenseRes = await api.getExpenseList();
                    if (expenseRes && expenseRes.data) setExpenseList(expenseRes.data);
                    else setExpenseList(expenseRes || []);
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
    }

    return (
        <div className="wrapper theme-white-skin">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '850px' }}>
                <section className="content">
                    <div className="row">
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
                        <div className="col-md-8">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Expense List</h3>
                                </div>
                                <div className="box-body">
                                    <div className="download_label">Expense List</div>
                                    <div className="table-responsive mailbox-messages overflow-visible">
                                        <table className="table table-striped table-bordered table-hover example">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Description</th>
                                                    <th>Invoice Number</th>
                                                    <th>Date</th>
                                                    <th>Expense Head</th>
                                                    <th className="text-right">Amount</th>
                                                    <th className="text-right noExport">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {initialLoading ? (
                                                    <tr><td colSpan="7" className="text-center">Loading...</td></tr>
                                                ) : expenseList.length === 0 ? (
                                                    <tr><td colSpan="7" className="text-center">No data available</td></tr>
                                                ) : (
                                                    expenseList.map((expense) => (
                                                        <tr key={expense.id}>
                                                            <td className="mailbox-name">{expense.name}</td>
                                                            <td className="mailbox-name">{expense.description}</td>
                                                            <td className="mailbox-name">{expense.invoice_no}</td>
                                                            <td className="mailbox-name">{expense.date}</td>
                                                            <td className="mailbox-name">{expense.exp_category || getHeadName(expense.exp_head_id)}</td>
                                                            <td className="mailbox-name text-right">{expense.amount}</td>
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
