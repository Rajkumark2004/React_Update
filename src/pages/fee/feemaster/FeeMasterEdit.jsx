import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import { api } from '../../../services/api';
import { useSession } from '../../../context/SessionContext';
import toast from 'react-hot-toast';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable } from '../../../utils/tableExport';
import Pagination from '../../../utils/Pagination';

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
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

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
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
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
                                    <div className="row mb-2" style={isMobile ? { marginBottom: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' } : { marginBottom: '10px' }}>
                                        <div className={isMobile ? "" : "col-sm-6"}>
                                            <div className={isMobile ? "dataTables_filter" : "dataTables_filter pull-left"}>
                                                <input
                                                    type="search"
                                                    className="form-control input-sm"
                                                    placeholder="Search..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    style={{ 
                                                        display: 'inline-block', 
                                                        width: '180px', 
                                                        border: 'none', 
                                                        borderBottom: '1px solid #ccc', 
                                                        borderRadius: '0', 
                                                        boxShadow: 'none',
                                                        backgroundColor: 'transparent',
                                                        paddingLeft: '0',
                                                        outline: 'none',
                                                        textAlign: isMobile ? 'center' : 'left'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className={isMobile ? "" : "col-sm-6"}>
                                            <div className={isMobile ? "dt-buttons btn-group" : "pull-right dt-buttons btn-group"}>
                                                <button className="btn btn-default btn-sm" title="Copy" onClick={() => { const { headers, rows } = getFlatExportRows(); copyToClipboard(headers, rows); }} style={{ borderTopLeftRadius: '20px', borderBottomLeftRadius: '20px' }}>
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
                                                    <button className="btn btn-default btn-sm" title="Columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)} style={{ borderTopRightRadius: '20px', borderBottomRightRadius: '20px' }}>
                                                        <i className="fa fa-columns"></i>
                                                    </button>
                                                    {showColumnsDropdown && (
                                                        <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 1000, background: '#fff', border: '1px solid #ccc', borderRadius: '4px', padding: '8px 10px', minWidth: '180px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                                                            {columns.map(col => (
                                                                <label key={col.key} style={{ display: 'block', cursor: 'pointer', padding: '2px 0', fontSize: '13px', fontWeight: 'normal', textAlign: 'left' }}>
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
                                                    {visibleColumns.has('group_name') && <th>Fees Group</th>}
                                                    <th>
                                                        {isMobile ? (
                                                            <div>
                                                                {visibleColumns.has('fee_code') && <div>Fees Code</div>}
                                                                {visibleColumns.has('amount') && <div>Amount</div>}
                                                                {(!visibleColumns.has('fee_code') && !visibleColumns.has('amount')) && <div style={{height: '20px'}}></div>}
                                                                <i className="fa fa-caret-down" style={{ color: '#ccc', marginTop: '5px', display: 'block' }}></i>
                                                            </div>
                                                        ) : (
                                                            <div className="row">
                                                                {visibleColumns.has('fee_code') && <div className={visibleColumns.has('amount') ? "col-xs-6" : "col-xs-9"}>Fees Code</div>}
                                                                {visibleColumns.has('amount') && <div className={visibleColumns.has('fee_code') ? "col-xs-3" : "col-xs-9"}>Amount</div>}
                                                                <div className="col-xs-3"></div>
                                                            </div>
                                                        )}
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
                                                            {visibleColumns.has('group_name') && (
                                                            <td className="mailbox-name" style={{ verticalAlign: 'top', wordBreak: 'break-all' }}>
                                                                {group.group_name}
                                                            </td>
                                                            )}
                                                            <td className="mailbox-name">
                                                                <ul className="liststyle1" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                                    {group.feetypes && group.feetypes.map((ft) => (
                                                                        <li key={ft.id} style={{ padding: '0', margin: '0' }}>
                                                                            {isMobile ? (
                                                                                <div style={{ wordBreak: 'break-word' }}>
                                                                                    {visibleColumns.has('fee_code') && (
                                                                                    <div style={{ marginBottom: '2px' }}>
                                                                                        <i className="fa fa-money"></i> {ft.type} ({ft.code})
                                                                                    </div>
                                                                                    )}
                                                                                    {visibleColumns.has('amount') && (
                                                                                    <div style={{ fontWeight: 'normal', color: '#333', marginBottom: '4px' }}>
                                                                                        ₹{ft.amount}
                                                                                    </div>
                                                                                    )}
                                                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                                                        <Link to={`/admin/feemaster/edit/${ft.id}`} style={{ color: '#337ab7', fontSize: '14px' }} title="Edit">
                                                                                            <i className="fa fa-pencil"></i>
                                                                                        </Link>
                                                                                        <a href="#" onClick={(e) => { e.preventDefault(); handleDelete(ft.id) }} style={{ color: '#337ab7', fontSize: '14px' }} title="Delete">
                                                                                            <i className="fa fa-remove" style={{ fontWeight: 'bold' }}></i>
                                                                                        </a>
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="row">
                                                                                    {visibleColumns.has('fee_code') && (
                                                                                    <div className={visibleColumns.has('amount') ? "col-xs-6" : "col-xs-9"}>
                                                                                        <i className="fa fa-money"></i> {ft.type} ({ft.code})
                                                                                    </div>
                                                                                    )}
                                                                                    {visibleColumns.has('amount') && (
                                                                                    <div className={visibleColumns.has('fee_code') ? "col-xs-3" : "col-xs-9"}>
                                                                                        ₹{ft.amount}
                                                                                    </div>
                                                                                    )}
                                                                                    <div className="col-xs-3 text-right">
                                                                                        <Link to={`/admin/feemaster/edit/${ft.id}`} className="btn btn-default btn-xs" data-toggle="tooltip" title="Edit">
                                                                                            <i className="fa fa-pencil"></i>
                                                                                        </Link>
                                                                                        <a href="#" onClick={(e) => { e.preventDefault(); handleDelete(ft.id) }} className="btn btn-default btn-xs" data-toggle="tooltip" title="Delete">
                                                                                            <i className="fa fa-remove"></i>
                                                                                        </a>
                                                                                    </div>
                                                                                </div>
                                                                            )}
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
                                        <div className="pt15 pb15">
                                            <Pagination 
                                                totalItems={feeMasterList.filter(group =>
                                                    group.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                    (group.feetypes && group.feetypes.some(ft => ft.type.toLowerCase().includes(searchTerm.toLowerCase()) || ft.code.toLowerCase().includes(searchTerm.toLowerCase())))
                                                ).length} 
                                                itemsPerPage={itemsPerPage} 
                                                currentPage={currentPage}
                                                onPageChange={(page) => setCurrentPage(page)}
                                            />
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

export default FeeMasterEdit;
