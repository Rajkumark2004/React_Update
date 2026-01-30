import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import { api } from '../../../services/api';
import toast from 'react-hot-toast';

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

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [expenseRes, headRes] = await Promise.all([
                api.getExpenseList(),
                api.getExpenseHeadList()
            ]);

            let heads = [];
            if (headRes && headRes.data) heads = headRes.data;
            else if (Array.isArray(headRes)) heads = headRes;
            setExpenseHeadList(heads);

            let list = [];
            if (expenseRes && expenseRes.data) list = expenseRes.data;
            else if (expenseRes && expenseRes.aaData) list = expenseRes.aaData;
            else if (Array.isArray(expenseRes)) list = expenseRes;
            setExpenseList(list);

            const item = list.find(f => f.id == id);
            if (item) {
                setFormData({
                    exp_head_id: item.exp_head_id,
                    name: item.name,
                    invoice_no: item.invoice_no,
                    date: item.date,
                    amount: item.amount,
                    description: item.description,
                    documents: null
                });

            } else {
                try {
                    const detail = await api.fetchExpense(id);
                    if (detail && detail.data) {
                        // setFormData... not implemented fully as we rely on list usually or logic
                    } else {
                        toast.error('Expense not found');
                        navigate('/admin/expense');
                    }
                } catch (e) {
                    toast.error('Expense not found');
                    navigate('/admin/expense');
                }
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
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

    // eslint-disable-next-line no-unused-vars
    const getHeadName = (headId) => {
        const head = expenseHeadList.find(h => h.id == headId);
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

export default ExpenseEdit;
