import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import { api } from '../../../services/api';
import toast from 'react-hot-toast';

const ExpenseHeadEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [expenseHeadList, setExpenseHeadList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [formData, setFormData] = useState({
        exp_category: '',
        description: ''
    });

    useEffect(() => {
        fetchExpenseHeadList();
    }, []);

    const fetchExpenseHeadList = async () => {
        try {
            const response = await api.getExpenseHeadList();
            let list = [];
            if (response && response.data) {
                list = response.data;
            } else if (Array.isArray(response)) {
                list = response;
            }
            setExpenseHeadList(list);

            const item = list.find(f => f.id == id);
            if (item) {
                setFormData({
                    exp_category: item.exp_category,
                    description: item.description
                });
            } else {
                toast.error('Expense Head not found');
                navigate('/admin/expensehead');
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
            const response = await api.editExpenseHead(id, formData);
            if (response.status || response.success) {
                toast.success('Expense Head updated successfully');
                navigate('/admin/expensehead');
            } else {
                toast.error(response.message || 'Failed to update expense head');
            }
        } catch (error) {
            console.error('Error updating expense head:', error);
            toast.error(error.message || 'Failed to update expense head');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (deleteId) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                const response = await api.deleteExpenseHead(deleteId);
                if (response.status || response.success) {
                    toast.success('Expense Head deleted successfully');
                    fetchExpenseHeadList();
                    if (deleteId == id) navigate('/admin/expensehead');
                } else {
                    toast.error(response.message || 'Failed to delete expense head');
                }
            } catch (error) {
                console.error('Error deleting expense head:', error);
                toast.error('Failed to delete expense head');
            }
        }
    };

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
                                    <h3 className="box-title">Edit Expense Head</h3>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label>Expense Head</label> <small className="req">*</small>
                                            <input
                                                autoFocus
                                                name="exp_category"
                                                type="text"
                                                className="form-control"
                                                value={formData.exp_category}
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
                        <div className="col-md-8">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Expense Head List</h3>
                                </div>
                                <div className="box-body">
                                    <div className="download_label">Expense Head List</div>
                                    <div className="table-responsive mailbox-messages overflow-visible">
                                        <table className="table table-striped table-bordered table-hover example">
                                            <thead>
                                                <tr>
                                                    <th>Expense Head</th>
                                                    <th className="text-right noExport">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {initialLoading ? (
                                                    <tr>
                                                        <td colSpan="2" className="text-center">Loading...</td>
                                                    </tr>
                                                ) : expenseHeadList.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="2" className="text-center">No data available in table</td>
                                                    </tr>
                                                ) : (
                                                    expenseHeadList.map((head) => (
                                                        <tr key={head.id}>
                                                            <td className="mailbox-name">
                                                                <span
                                                                    data-toggle="tooltip"
                                                                    title={head.description || 'No Description'}
                                                                    style={{ cursor: 'pointer' }}
                                                                >
                                                                    {head.exp_category}
                                                                </span>
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

export default ExpenseHeadEdit;
