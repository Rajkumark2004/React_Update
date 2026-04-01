import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import { api } from '../../../services/api';
import { useSession } from '../../../context/SessionContext';
import toast from 'react-hot-toast';
import Loader from '../../../components/Loader';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable } from '../../../utils/tableExport';

const FeeMaster = () => {
    const { currentSession } = useSession();
    const sessionYear = currentSession?.session || '2024-25';

    const [feeGroupList, setFeeGroupList] = useState([]);
    const [feeTypeList, setFeeTypeList] = useState([]);
    const [feeMasterList, setFeeMasterList] = useState([]); // List of fee groups with their types
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(100);
    const navigate = useNavigate();

    // Column definitions for export
    const columns = [
        { key: 'group_name', label: 'Fees Group' },
        { key: 'fee_code', label: 'Fees Code' },
        { key: 'amount', label: 'Amount' }
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

    // Flatten nested fee master list for export
    const getFlatExportRows = () => {
        const filteredGroups = feeMasterList.filter(group =>
            group.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (group.feetypes && group.feetypes.some(ft => ft.type.toLowerCase().includes(searchTerm.toLowerCase()) || ft.code.toLowerCase().includes(searchTerm.toLowerCase())))
        );
        const visibleCols = columns.filter(col => visibleColumns.has(col.key));
        const headers = visibleCols.map(col => col.label);
        const rows = [];
        filteredGroups.forEach(group => {
            if (group.feetypes && group.feetypes.length > 0) {
                group.feetypes.forEach(ft => {
                    const rowData = {
                        group_name: group.group_name,
                        fee_code: `${ft.type} (${ft.code})`,
                        amount: `₹${ft.amount}`
                    };
                    rows.push(visibleCols.map(col => rowData[col.key] || ''));
                });
            } else {
                const rowData = { group_name: group.group_name, fee_code: '', amount: '' };
                rows.push(visibleCols.map(col => rowData[col.key] || ''));
            }
        });
        return { headers, rows };
    };

    const [formData, setFormData] = useState({
        fee_groups_id: '',
        feetype_id: '',
        due_date: '',
        amount: '',
        account_type: 'none', // none, percentage, fix
        fine_percentage: '',
        fine_amount: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [groupsRes, typesRes, masterRes] = await Promise.all([
                api.getFeeGroupList(),
                api.getFeeTypeList(),
                api.getFeeMasterList()
            ]);

            if (masterRes) {
                if (masterRes.feemasterList) setFeeMasterList(masterRes.feemasterList);
                // Also use the lists from master response if available as they are consistent
                if (masterRes.feegroupList) setFeeGroupList(masterRes.feegroupList);
                if (masterRes.feetypeList) setFeeTypeList(masterRes.feetypeList);
            } else {
                // Fallback if relying on other calls
                if (groupsRes && groupsRes.data) setFeeGroupList(groupsRes.data);
                else if (Array.isArray(groupsRes)) setFeeGroupList(groupsRes);

                if (typesRes && typesRes.data) setFeeTypeList(typesRes.data);
                else if (Array.isArray(typesRes)) setFeeTypeList(typesRes);
            }

        } catch (error) {
            console.error('Error fetching initial data:', error);
            toast.error('Failed to load data');
        } finally {
            setInitialLoading(false);
        }
    };

    const fetchFeeMasterList = async () => {
        try {
            const response = await api.getFeeMasterList();
            if (response && response.feemasterList) setFeeMasterList(response.feemasterList);
            else if (response && response.data) setFeeMasterList(response.data);
            else if (Array.isArray(response)) setFeeMasterList(response);
        } catch (error) {
            console.error('Error fetching fee master list:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            let newData = { ...prev, [name]: value };

            // Block negative values for amount fields
            if ((name === 'amount' || name === 'fine_amount' || name === 'fine_percentage') && value !== '' && parseFloat(value) < 0) {
                newData[name] = '0';
            }

            // Handle fine calculations
            if (name === 'amount' || name === 'fine_percentage' || name === 'account_type') {
                if (newData.account_type === 'percentage') {
                    if (newData.amount && newData.fine_percentage) {
                        newData.fine_amount = ((parseFloat(newData.amount) * parseFloat(newData.fine_percentage)) / 100).toFixed(2);
                    } else {
                        // If percentage or amount is cleared, reset fine_amount
                        newData.fine_amount = '';
                    }
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
            const response = await api.addFeeMaster(formData);
            if (response.status) {
                toast.success('Fee Master added successfully');
                setFormData({
                    fee_groups_id: '',
                    feetype_id: '',
                    due_date: '',
                    amount: '',
                    account_type: 'none',
                    fine_percentage: '',
                    fine_amount: ''
                });
                fetchFeeMasterList();
            } else {
                toast.error(response.message || 'Failed to add fee master');
            }
        } catch (error) {
            console.error('Error adding fee master:', error);
            toast.error(error.message || 'Failed to add fee master');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                const response = await api.deleteFeeMaster(id);
                if (response.status) {
                    toast.success('Fee Master deleted successfully');
                    fetchFeeMasterList();
                } else {
                    toast.error(response.message || 'Failed to delete fee master');
                }
            } catch (error) {
                console.error('Error deleting fee master:', error);
                toast.error('Failed to delete fee master');
            }
        }
    };

    const handleDeleteGroup = async (id) => {
        if (window.confirm('Are you sure you want to delete this group?')) {
            try {
                const response = await api.deleteFeeMasterGroup(id);
                if (response.status) {
                    toast.success('Fee Group deleted successfully');
                    fetchFeeMasterList();
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
                                    <h3 className="box-title">Add Fees Master : {sessionYear}</h3>
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
                                                min="0"
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
                                                        min="0"
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
                                                        min="0"
                                                        disabled={formData.account_type !== 'fix'}
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
                                                <button className="btn btn-default btn-sm" title="Copy" onClick={() => { const { headers, rows } = getFlatExportRows(); copyToClipboard(headers, rows); }}>
                                                    <i className="fa fa-files-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="Excel" onClick={() => { const { headers, rows } = getFlatExportRows(); downloadExcel(headers, rows, 'fees_master.xls'); }}>
                                                    <i className="fa fa-file-excel-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="CSV" onClick={() => { const { headers, rows } = getFlatExportRows(); downloadCSV(headers, rows, 'fees_master.csv'); }}>
                                                    <i className="fa fa-file-text-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="PDF" onClick={() => { const { headers, rows } = getFlatExportRows(); downloadPDF(headers, rows, 'fees_master.pdf', 'Fees Master List'); }}>
                                                    <i className="fa fa-file-pdf-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="Print" onClick={() => { const { headers, rows } = getFlatExportRows(); printTable(headers, rows, 'Fees Master List'); }}>
                                                    <i className="fa fa-print"></i>
                                                </button>
                                                <div className="btn-group">
                                                    <button className="btn btn-default btn-sm" title="Columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}>
                                                        <i className="fa fa-columns"></i>
                                                    </button>
                                                    {showColumnsDropdown && (
                                                        <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 1000, background: '#fff', border: '1px solid #ccc', borderRadius: '4px', padding: '8px 10px', minWidth: '180px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
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
                                                    <tr><td colSpan="3" className="text-center"><Loader /></td></tr>
                                                ) : feeMasterList.length === 0 ? (
                                                    <tr><td colSpan="3" className="text-center">No data available</td></tr>
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
                                                                                    <Link to={`/admin/feemaster/edit/${ft.id}`} className="btn btn-default btn-xs" data-toggle="tooltip" title="Edit">
                                                                                        <i className="fa fa-pencil"></i>
                                                                                    </Link>
                                                                                    <a href="#" onClick={(e) => { e.preventDefault(); handleDelete(ft.id) }} className="btn btn-default btn-xs" data-toggle="tooltip" title="Delete">
                                                                                        <i className="fa fa-remove"></i>
                                                                                    </a>
                                                                                </div>
                                                                            </div>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </td>
                                                            <td className="mailbox-date pull-right" style={{ verticalAlign: 'top' }}>
                                                                <Link to={`/admin/feemaster/assign/${group.id}`} className="btn btn-default btn-xs" data-toggle="tooltip" title="Assign / View Student">
                                                                    <i className="fa fa-tag"></i>
                                                                </Link>
                                                                <a href="#" onClick={(e) => { e.preventDefault(); handleDeleteGroup(group.id) }} className="btn btn-default btn-xs" data-toggle="tooltip" title="Delete Group">
                                                                    <i className="fa fa-remove"></i>
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    ))
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                    {feeMasterList.length > 0 && (
                                        <div className="row">
                                            <div className="col-sm-5">
                                                <div className="dataTables_info">
                                                    {(() => {
                                                        const filteredItems = feeMasterList.filter(group =>
                                                            group.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                            (group.feetypes && group.feetypes.some(ft => ft.type.toLowerCase().includes(searchTerm.toLowerCase()) || ft.code.toLowerCase().includes(searchTerm.toLowerCase())))
                                                        );
                                                        const totalCount = filteredItems.length;
                                                        const from = totalCount > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0;
                                                        const to = Math.min(currentPage * itemsPerPage, totalCount);
                                                        return `Showing ${from} to ${to} of ${totalCount} entries`;
                                                    })()}
                                                </div>
                                            </div>
                                            <div className="col-sm-7">
                                                <div className="dataTables_paginate paging_simple_numbers pull-right">
                                                    <ul className="pagination" style={{ margin: 0 }}>
                                                        <li className={`paginate_button previous ${currentPage === 1 ? 'disabled' : ''}`}>
                                                            <a href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1); }}><i className="fa fa-angle-left"></i></a>
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
                                                            }}><i className="fa fa-angle-right"></i></a>
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

export default FeeMaster;
