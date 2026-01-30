import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import { api } from '../../../services/api';
import toast from 'react-hot-toast';

const IncomeList = () => {
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

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [incomeRes, headRes] = await Promise.all([
                api.getIncomeList(),
                api.getIncomeHeadList()
            ]);

            if (incomeRes && incomeRes.data) {
                setIncomeList(incomeRes.data);
            } else if (incomeRes && incomeRes.aaData) { // Datatable format sometimes
                setIncomeList(incomeRes.aaData);
            } else if (Array.isArray(incomeRes)) {
                setIncomeList(incomeRes);
            } else {
                // Maybe it's empty or format is different
                // If using getincomelist it might be { aaData: ... }
                // The user provided endpoint might return list.
                setIncomeList([]);
            }

            if (headRes && headRes.data) setIncomeHeadList(headRes.data);
            else if (Array.isArray(headRes)) setIncomeHeadList(headRes);

        } catch (error) {
            console.error('Error fetching data:', error);
            // Don't toast error for list fetch immediately as it might just be empty or permission
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
                    date: '',
                    amount: '',
                    description: '',
                    documents: null
                });
                // Clear file input
                document.getElementById('documents').value = "";

                // Refresh list
                const incomeRes = await api.getIncomeList();
                if (incomeRes && incomeRes.data) setIncomeList(incomeRes.data);
                else setIncomeList(incomeRes || []);

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
                    const incomeRes = await api.getIncomeList();
                    if (incomeRes && incomeRes.data) setIncomeList(incomeRes.data);
                    else setIncomeList(incomeRes || []);
                } else {
                    toast.error(response.message || 'Failed to delete income');
                }
            } catch (error) {
                console.error('Error deleting income:', error);
                toast.error('Failed to delete income');
            }
        }
    };

    // Helper to get head name
    const getHeadName = (id) => {
        const head = incomeHeadList.find(h => h.id == id);
        return head ? head.income_category : '';
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
                        <div className="col-md-8">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Income List</h3>
                                </div>
                                <div className="box-body">
                                    <div className="download_label">Income List</div>
                                    <div className="table-responsive mailbox-messages overflow-visible">
                                        <table className="table table-striped table-bordered table-hover example">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Description</th>
                                                    <th>Invoice Number</th>
                                                    <th>Date</th>
                                                    <th>Income Head</th>
                                                    <th className="text-right">Amount</th>
                                                    <th className="text-right noExport">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {initialLoading ? (
                                                    <tr><td colSpan="7" className="text-center">Loading...</td></tr>
                                                ) : incomeList.length === 0 ? (
                                                    <tr><td colSpan="7" className="text-center">No data available</td></tr>
                                                ) : (
                                                    incomeList.map((income) => (
                                                        <tr key={income.id}>
                                                            <td className="mailbox-name">{income.name}</td>
                                                            <td className="mailbox-name">{income.description}</td>
                                                            <td className="mailbox-name">{income.invoice_no}</td>
                                                            <td className="mailbox-name">{income.date}</td>
                                                            <td className="mailbox-name">{income.income_category || getHeadName(income.inc_head_id)}</td>
                                                            <td className="mailbox-name text-right">{income.amount}</td>
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
