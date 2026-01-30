import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import { api } from '../../../services/api';
import { useSession } from '../../../context/SessionContext';
import toast from 'react-hot-toast';

const FeeMasterEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentSession } = useSession();
    const sessionYear = currentSession?.session || '2024-25';

    // Dropdowns
    const [feeGroupList, setFeeGroupList] = useState([]);
    const [feeTypeList, setFeeTypeList] = useState([]);
    const [feeMasterList, setFeeMasterList] = useState([]);

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(100);

    const [formData, setFormData] = useState({
        fee_groups_id: '',
        feetype_id: '',
        due_date: '',
        amount: '',
        account_type: 'none',
        fine_percentage: '',
        fine_amount: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, [id]);

    const fetchInitialData = async () => {
        try {
            const response = await api.fetchFeeMaster(id);
            if (response && response.status && response.data) {
                const { feemaster, feegroupList, feetypeList, feemasterList } = response.data;

                // Populate Dropdowns
                if (feegroupList) setFeeGroupList(feegroupList);
                if (feetypeList) setFeeTypeList(feetypeList);
                if (feemasterList) setFeeMasterList(feemasterList);

                // Populate Form
                if (feemaster) {
                    setFormData({
                        fee_groups_id: feemaster.fee_groups_id,
                        feetype_id: feemaster.feetype_id,
                        due_date: feemaster.due_date === '0000-00-00' ? '' : feemaster.due_date,
                        amount: feemaster.amount,
                        account_type: feemaster.fine_type || 'none',
                        fine_percentage: feemaster.fine_percentage,
                        fine_amount: feemaster.fine_amount
                    });
                } else {
                    toast.error('Fee Master details not found');
                    navigate('/admin/feemaster');
                }
            } else {
                toast.error('Failed to load data');
                navigate('/admin/feemaster');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            if (name === 'amount' || name === 'fine_percentage' || name === 'account_type') {
                if (newData.account_type === 'percentage' && newData.amount && newData.fine_percentage) {
                    newData.fine_amount = ((parseFloat(newData.amount) * parseFloat(newData.fine_percentage)) / 100).toFixed(2);
                } else if (newData.account_type === 'none') {
                    newData.fine_amount = '';
                    newData.fine_percentage = '';
                } else if (newData.account_type === 'fix' && name === 'account_type') {
                    newData.fine_percentage = '';
                }
            }
            return newData;
        });
    };

    const handleRadioChange = (e) => {
        const { name, value } = e.target;
        handleInputChange({ target: { name, value } });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.editFeeMaster(id, formData);
            if (response.status) {
                toast.success('Fee Master updated successfully');
                navigate('/admin/feemaster');
            } else {
                toast.error(response.message || 'Failed to update fee master');
            }
        } catch (error) {
            console.error('Error updating fee master:', error);
            toast.error(error.message || 'Failed to update fee master');
        } finally {
            setLoading(false);
        }
    };

    // Delete functions same as List
    const handleDelete = async (deleteId) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                const response = await api.deleteFeeMaster(deleteId);
                if (response.status) {
                    toast.success('Fee Master deleted successfully');
                    // Refresh details? Or Redirect?
                    // If we deleted the current one, redirect.
                    if (deleteId == id) navigate('/admin/feemaster');
                    else fetchInitialData();
                } else {
                    toast.error(response.message || 'Failed to delete fee master');
                }
            } catch (error) {
                console.error('Error deleting fee master:', error);
                toast.error('Failed to delete fee master');
            }
        }
    };

    const handleDeleteGroup = async (deleteId) => {
        if (window.confirm('Are you sure you want to delete this group?')) {
            try {
                const response = await api.deleteFeeMasterGroup(deleteId);
                if (response.status) {
                    toast.success('Fee Group deleted successfully');
                    fetchInitialData();
                } else {
                    toast.error(response.message || 'Failed to delete fee group');
                }
            } catch (error) {
                console.error('Error deleting fee group:', error);
                toast.error('Failed to delete fee group');
            }
        }
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
                                    <h3 className="box-title">Edit Fees Master : {sessionYear}</h3>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label>Fees Group</label> <small className="req">*</small>
                                            <select
                                                autoFocus
                                                name="fee_groups_id"
                                                className="form-control"
                                                value={formData.fee_groups_id}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select</option>
                                                {feeGroupList.map(g => (
                                                    <option key={g.id} value={g.id}>{g.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Fees Type</label> <small className="req">*</small>
                                            <select
                                                name="feetype_id"
                                                className="form-control"
                                                value={formData.feetype_id}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select</option>
                                                {feeTypeList.map(t => (
                                                    <option key={t.id} value={t.id}>{t.type}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Due Date</label>
                                            <input
                                                name="due_date"
                                                type="date"
                                                className="form-control"
                                                value={formData.due_date}
                                                onChange={handleInputChange}
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
                                            <label>Fine Type</label>
                                            <div>
                                                <label className="radio-inline">
                                                    <input
                                                        type="radio"
                                                        name="account_type"
                                                        value="none"
                                                        checked={formData.account_type === 'none'}
                                                        onChange={handleRadioChange}
                                                    /> None
                                                </label>
                                                <label className="radio-inline">
                                                    <input
                                                        type="radio"
                                                        name="account_type"
                                                        value="percentage"
                                                        checked={formData.account_type === 'percentage'}
                                                        onChange={handleRadioChange}
                                                    /> Percentage
                                                </label>
                                                <label className="radio-inline">
                                                    <input
                                                        type="radio"
                                                        name="account_type"
                                                        value="fix"
                                                        checked={formData.account_type === 'fix'}
                                                        onChange={handleRadioChange}
                                                    /> Fix Amount
                                                </label>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>Percentage (%)</label> <small className="req">*</small>
                                                    <input
                                                        name="fine_percentage"
                                                        type="number"
                                                        className="form-control"
                                                        value={formData.fine_percentage}
                                                        onChange={handleInputChange}
                                                        disabled={formData.account_type !== 'percentage'}
                                                        required={formData.account_type === 'percentage'}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>Fix Amount (₹)</label> <small className="req">*</small>
                                                    <input
                                                        name="fine_amount"
                                                        type="number"
                                                        className="form-control"
                                                        value={formData.fine_amount}
                                                        onChange={handleInputChange}
                                                        disabled={formData.account_type !== 'fix' && formData.account_type !== 'percentage'}
                                                        readOnly={formData.account_type === 'percentage'}
                                                        required={formData.account_type === 'fix'}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                    <div className="box-footer">
                                        <button type="submit" className="btn btn-primary pull-right" disabled={loading}>
                                            {loading ? <i className="fa fa-spinner fa-spin"></i> : 'Save'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="col-md-8">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Fees Master List : {sessionYear}</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="download_label">Fees Master List</div>
                                    <div className="row mb-2" style={{ marginBottom: '10px' }}>
                                        <div className="col-sm-6">
                                            <div className="dataTables_filter pull-left">
                                                <label>Search:<input
                                                    type="search"
                                                    className="form-control input-sm"
                                                    placeholder=""
                                                    style={{ display: 'inline-block', width: 'auto', marginLeft: '0.5em' }}
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                /></label>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="pull-right dt-buttons btn-group">
                                                <button className="btn btn-default btn-sm buttons-copy buttons-html5" title="Copy">
                                                    <i className="fa fa-files-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm buttons-excel buttons-html5" title="Excel">
                                                    <i className="fa fa-file-excel-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm buttons-csv buttons-html5" title="CSV">
                                                    <i className="fa fa-file-text-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm buttons-pdf buttons-html5" title="PDF">
                                                    <i className="fa fa-file-pdf-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm buttons-print" onClick={() => window.print()} title="Print">
                                                    <i className="fa fa-print"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm buttons-collection buttons-colvis" title="Columns">
                                                    <i className="fa fa-columns"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="table-responsive mailbox-messages">
                                        <table className="table table-striped table-bordered table-hover example">
                                            <thead>
                                                <tr>
                                                    <th>Fees Group</th>
                                                    <th>
                                                        <div className="row">
                                                            <div className="col-md-6">Fees Code</div>
                                                            <div className="col-md-6">Amount</div>
                                                        </div>
                                                    </th>
                                                    <th className="text-right noExport">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {initialLoading ? (
                                                    <tr><td colSpan="3" className="text-center">Loading...</td></tr>
                                                ) : feeMasterList
                                                    .filter(group =>
                                                        group.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                        (group.feetypes && group.feetypes.some(ft => ft.type.toLowerCase().includes(searchTerm.toLowerCase()) || ft.code.toLowerCase().includes(searchTerm.toLowerCase())))
                                                    )
                                                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                                    .map((group, index) => (
                                                        <tr key={index}>
                                                            <td className="mailbox-name" style={{ verticalAlign: 'top' }}>
                                                                {group.group_name}
                                                            </td>
                                                            <td className="mailbox-name">
                                                                <ul className="liststyle1" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                                    {group.feetypes && group.feetypes.map((ft) => (
                                                                        <li key={ft.id} style={{ padding: '0', margin: '0' }}>
                                                                            <div className="row">
                                                                                <div className="col-md-6">
                                                                                    <i className="fa fa-money"></i> {ft.type} ({ft.code})
                                                                                </div>
                                                                                <div className="col-md-3">
                                                                                    ₹{ft.amount}
                                                                                </div>
                                                                                <div className="col-md-3 text-right">
                                                                                    <Link to={`/admin/feemaster/edit/${ft.id}`} className="btn btn-primary btn-xs" data-toggle="tooltip" title="Edit">
                                                                                        <i className="fa fa-pencil"></i>
                                                                                    </Link>
                                                                                    <a href="#" onClick={(e) => { e.preventDefault(); handleDelete(ft.id) }} className="btn btn-primary btn-xs" data-toggle="tooltip" title="Delete">
                                                                                        <i className="fa fa-remove"></i>
                                                                                    </a>
                                                                                </div>
                                                                            </div>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </td>
                                                            <td className="mailbox-date pull-right" style={{ verticalAlign: 'top' }}>
                                                                <Link to={`/admin/feemaster/assign/${group.id}`} className="btn btn-primary btn-xs" data-toggle="tooltip" title="Assign / View Student">
                                                                    <i className="fa fa-tag"></i>
                                                                </Link>
                                                                <a href="#" onClick={(e) => { e.preventDefault(); handleDeleteGroup(group.id) }} className="btn btn-primary btn-xs" data-toggle="tooltip" title="Delete Group">
                                                                    <i className="fa fa-remove"></i>
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    ))
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-5">
                                            <div className="dataTables_info">
                                                Showing {feeMasterList.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, feeMasterList.filter(group =>
                                                    group.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                    (group.feetypes && group.feetypes.some(ft => ft.type.toLowerCase().includes(searchTerm.toLowerCase()) || ft.code.toLowerCase().includes(searchTerm.toLowerCase())))
                                                ).length)} of {feeMasterList.filter(group =>
                                                    group.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                    (group.feetypes && group.feetypes.some(ft => ft.type.toLowerCase().includes(searchTerm.toLowerCase()) || ft.code.toLowerCase().includes(searchTerm.toLowerCase())))
                                                ).length} entries
                                            </div>
                                        </div>
                                        <div className="col-sm-7">
                                            <div className="dataTables_paginate paging_simple_numbers">
                                                <ul className="pagination">
                                                    <li className={`paginate_button previous ${currentPage === 1 ? 'disabled' : ''}`}>
                                                        <a href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1); }}>Previous</a>
                                                    </li>
                                                    {Array.from({
                                                        length: Math.ceil(feeMasterList.filter(group =>
                                                            group.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                            (group.feetypes && group.feetypes.some(ft => ft.type.toLowerCase().includes(searchTerm.toLowerCase()) || ft.code.toLowerCase().includes(searchTerm.toLowerCase())))
                                                        ).length / itemsPerPage)
                                                    }, (_, i) => (
                                                        <li key={i} className={`paginate_button ${currentPage === i + 1 ? 'active' : ''}`}>
                                                            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}>{i + 1}</a>
                                                        </li>
                                                    ))}
                                                    <li className={`paginate_button next ${currentPage === Math.ceil(feeMasterList.filter(group =>
                                                        group.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                        (group.feetypes && group.feetypes.some(ft => ft.type.toLowerCase().includes(searchTerm.toLowerCase()) || ft.code.toLowerCase().includes(searchTerm.toLowerCase())))
                                                    ).length / itemsPerPage) ? 'disabled' : ''}`}>
                                                        <a href="#" onClick={(e) => {
                                                            e.preventDefault(); if (currentPage < Math.ceil(feeMasterList.filter(group =>
                                                                group.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                                (group.feetypes && group.feetypes.some(ft => ft.type.toLowerCase().includes(searchTerm.toLowerCase()) || ft.code.toLowerCase().includes(searchTerm.toLowerCase())))
                                                            ).length / itemsPerPage)) setCurrentPage(currentPage + 1);
                                                        }}>Next</a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
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

export default FeeMasterEdit;
