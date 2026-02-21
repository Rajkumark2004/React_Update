import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import { api } from '../../../services/api';
import { useSession } from '../../../context/SessionContext';
import toast from 'react-hot-toast';
import { sanitizeNameWithNumbers } from '../../../utils/validation';
import { copyToClipboard, downloadCSV, downloadExcel, printTable, buildExportData } from '../../../utils/tableExport';

const FeeGroupEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentSession } = useSession();
    const sessionYear = currentSession?.session || '2024-25';

    const [feegroupList, setFeegroupList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(100);

    // Column definitions
    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'description', label: 'Description' }
    ];

    // Column visibility state
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
        return row[key];
    };

    // Export functions
    const getExportData = () => {
        const filteredData = feegroupList.filter(group => group.name.toLowerCase().includes(searchTerm.toLowerCase()));
        return buildExportData(columns, visibleColumns, filteredData, formatCell);
    };

    useEffect(() => {
        fetchInitialData();
    }, [id]);

    const fetchInitialData = async () => {
        try {
            // Fetch fee group details directly by ID
            const response = await api.fetchFeeGroup(id);
            if (response && response.status && response.data) {
                const item = response.data;
                setFormData({
                    name: item.name,
                    description: item.description || ''
                });
            } else {
                toast.error('Failed to fetch fee group details');
                navigate('/admin/feegroup');
            }

            // Also fetch the list to show below the form (if needed)
            const listResponse = await api.getFeeGroupList();
            if (listResponse && listResponse.data) {
                setFeegroupList(listResponse.data);
            } else if (Array.isArray(listResponse)) {
                setFeegroupList(listResponse);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleInputChange = (e) => {
        let { name, value } = e.target;
        if (name === 'name') {
            value = sanitizeNameWithNumbers(value);
        }
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.editFeeGroup(id, formData);
            if (response.status) {
                toast.success('Fee Group updated successfully');
                navigate('/admin/feegroup');
            } else {
                let errorMsg = 'Failed to update fee group';
                if (response.errors && response.errors.name) {
                    errorMsg = response.errors.name.replace(/<[^>]*>?/gm, '');
                } else if (response.message) {
                    errorMsg = response.message;
                }
                toast.error(errorMsg);
            }
        } catch (error) {
            console.error('Error updating fee group:', error);
            toast.error(error.message || 'Failed to update fee group');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (deleteId) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                const response = await api.deleteFeeGroup(deleteId);
                if (response.status) {
                    toast.success('Fee Group deleted successfully');
                    fetchFeeGroupList();
                    if (deleteId == id) navigate('/admin/feegroup');
                } else {
                    toast.error(response.message || 'Failed to delete fee group');
                }
            } catch (error) {
                console.error('Error deleting fee group:', error);
                toast.error('Failed to delete fee group');
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
                                    <h3 className="box-title">Edit Fees Group : {sessionYear}</h3>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label>Name</label> <small className="req">*</small>
                                            <input
                                                autoFocus
                                                name="name"
                                                type="text"
                                                className="form-control"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                maxLength="50"
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
                                    <h3 className="box-title titlefix">Fees Group List : {sessionYear}</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="download_label">Fees Group List</div>
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
                                                <button className="btn btn-default btn-sm buttons-copy buttons-html5" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }}>
                                                    <i className="fa fa-files-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm buttons-excel buttons-html5" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'fees_group.xls'); }}>
                                                    <i className="fa fa-file-excel-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm buttons-csv buttons-html5" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'fees_group.csv'); }}>
                                                    <i className="fa fa-file-text-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm buttons-pdf buttons-html5" title="PDF" onClick={() => {
                                                    import('jspdf').then(({ default: jsPDF }) => {
                                                        const { headers, rows } = getExportData();
                                                        const doc = new jsPDF();
                                                        doc.text("Fees Group List", 14, 15);
                                                        let y = 25;

                                                        // Print Headers
                                                        headers.forEach((header, index) => {
                                                            doc.text(header, 14 + (index * 60), y);
                                                        });
                                                        y += 10;

                                                        // Print Rows
                                                        rows.forEach(row => {
                                                            row.forEach((cell, index) => {
                                                                doc.text((cell || '').toString(), 14 + (index * 60), y);
                                                            });
                                                            y += 10;
                                                            if (y > 280) {
                                                                doc.addPage();
                                                                y = 20;
                                                            }
                                                        });
                                                        doc.save("fees_group.pdf");
                                                    });
                                                }}>
                                                    <i className="fa fa-file-pdf-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm buttons-print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Fees Group List'); }} title="Print">
                                                    <i className="fa fa-print"></i>
                                                </button>
                                                <div className="btn-group" style={{ position: 'relative', display: 'inline-block' }}>
                                                    <button className="btn btn-default btn-sm buttons-collection buttons-colvis" title="Columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}>
                                                        <i className="fa fa-columns"></i>
                                                    </button>
                                                    {showColumnsDropdown && (
                                                        <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 1000, background: '#fff', border: '1px solid #ccc', borderRadius: '4px', padding: '8px 10px', minWidth: '180px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                                                            {columns.map(col => (
                                                                <label key={col.key} style={{ display: 'block', cursor: 'pointer', padding: '2px 0', fontSize: '13px', fontWeight: 'normal', whiteSpace: 'nowrap' }}>
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
                                    <div className="table-responsive mailbox-messages overflow-visible">
                                        <table className="table table-striped table-bordered table-hover example">
                                            <thead>
                                                <tr>
                                                    {columns.map(col => visibleColumns.has(col.key) && (
                                                        <th key={col.key}>{col.label}</th>
                                                    ))}
                                                    <th className="text-right noExport">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {initialLoading ? (
                                                    <tr>
                                                        <td colSpan="3" className="text-center">
                                                            <i className="fa fa-spinner fa-spin"></i> Loading...
                                                        </td>
                                                    </tr>
                                                ) : feegroupList.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="3" className="text-center">No data available in table</td>
                                                    </tr>
                                                ) : feegroupList
                                                    .filter(group => group.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                                    .map((feegroup) => (
                                                        <tr key={feegroup.id}>
                                                            {visibleColumns.has('name') && (
                                                                <td className="mailbox-name">
                                                                    <a href="#" onClick={(e) => e.preventDefault()}>{feegroup.name}</a>
                                                                </td>
                                                            )}
                                                            {visibleColumns.has('description') && (
                                                                <td className="mailbox-name">
                                                                    {feegroup.description}
                                                                </td>
                                                            )}
                                                            <td className="mailbox-date pull-right">
                                                                <Link
                                                                    to={`/admin/feegroup/edit/${feegroup.id}`}
                                                                    className="btn btn-default btn-xs"
                                                                    data-toggle="tooltip"
                                                                    title="Edit"
                                                                >
                                                                    <i className="fa fa-pencil"></i>
                                                                </Link>
                                                                <a
                                                                    href="#"
                                                                    onClick={(e) => { e.preventDefault(); handleDelete(feegroup.id); }}
                                                                    className="btn btn-default btn-xs"
                                                                    data-toggle="tooltip"
                                                                    title="Delete"
                                                                >
                                                                    <i className="fa fa-remove"></i>
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    ))
                                                }
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

export default FeeGroupEdit;
