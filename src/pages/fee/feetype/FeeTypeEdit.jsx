import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import { api } from '../../../services/api';
import { useSession } from '../../../context/SessionContext';
import toast from 'react-hot-toast';
import { sanitizeNameWithNumbers } from '../../../utils/validation';
import { buildExportData } from '../../../utils/tableExport';
import TableToolbar from '../../../utils/TableToolbar';

const FeeTypeEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentSession } = useSession();
    const sessionYear = currentSession?.session || '2024-25';

    const [feetypeList, setFeetypeList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [formData, setFormData] = useState({
        type: '',
        code: '',
        description: ''
    });
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

    // Column definitions
    const columns = [
        { key: 'type', label: 'Name' },
        { key: 'code', label: 'Fees Code' }
    ];

    // Column visibility state
    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));


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
        const filteredData = feetypeList.filter(f => f.type.toLowerCase().includes(searchTerm.toLowerCase()) || f.code.toLowerCase().includes(searchTerm.toLowerCase()));
        return buildExportData(columns, visibleColumns, filteredData, formatCell);
    };

    useEffect(() => {
        fetchInitialData();
    }, [id]);

    // Need to fetch details of the specific feed type or find it in the list?
    // Since API doesn't seem to have getDetail, but list fetches all, we can find it from list BUT
    // usually in these systems update requires fetching fresh data.
    // However, the edit endpoint is a POST. Usually legacy code sends data to view via controller.
    // We can fetch list, find item. If list doesn't have it, maybe there's a fetch endpoint?
    // The user provided 'editFeeType' POST .../edit/:id.
    // Let's assume list has it. Or we can just use the list to populate if we fetched it.
    // Actually, looking at `feetypeEdit.php`, `$feetype` variable is passed.
    // There isn't a dedicated "get" for single feer type listed by user.
    // I will use the list to find the item.

    const fetchInitialData = async () => {
        try {
            // Fetch fee type details directly by ID
            const response = await api.fetchFeeType(id);
            if (response && response.status && response.data) {
                const item = response.data;
                setFormData({
                    type: item.type, // Changed from 'name' to 'type' to match existing formData structure
                    code: item.code,
                    description: item.description || ''
                });
            } else {
                toast.error('Failed to fetch fee type details');
                navigate('/admin/feetype');
            }

            // Also fetch the list to show below the form (if desired, or remove if not needed)
            const listResponse = await api.getFeeTypeList();
            if (listResponse && listResponse.data) {
                setFeetypeList(listResponse.data); // Changed from 'setFeeTypeList' to 'setFeetypeList' to match existing state variable
            } else if (Array.isArray(listResponse)) {
                setFeetypeList(listResponse); // Changed from 'setFeeTypeList' to 'setFeetypeList' to match existing state variable
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
        if (name === 'type') {
            value = sanitizeNameWithNumbers(value);
        } else if (name === 'code') {
            value = value.slice(0, 50);
        }
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                name: formData.type
            };
            const response = await api.editFeeType(id, payload);
            if (response.status) {
                toast.success('Fee Type updated successfully');
                navigate('/admin/feetype');
            } else {
                toast.error(response.message || 'Failed to update fee type');
            }
        } catch (error) {
            console.error('Error updating fee type:', error);
            toast.error(error.message || 'Failed to update fee type');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (deleteId) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                const response = await api.deleteFeeType(deleteId);
                if (response.status) {
                    toast.success('Fee Type deleted successfully');
                    fetchFeeTypeList(); // Refresh list (and if current item deleted, redirect?)
                    if (deleteId == id) navigate('/admin/feetype');
                } else {
                    toast.error(response.message || 'Failed to delete fee type');
                }
            } catch (error) {
                console.error('Error deleting fee type:', error);
                toast.error('Failed to delete fee type');
            }
        }
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content">
                    <div className="row">
                        <div className="col-md-4">
                            <div className="box box-primary">
                                <div className="box-header with-border" style={isMobile ? { display: 'flex', alignItems: 'center', padding: '12px 15px' } : {}}>
                                    <h3 className="box-title" style={isMobile ? { margin: 0, fontSize: '18px' } : {}}>
                                        Edit Fees Type : {sessionYear}
                                    </h3>
                                    {isMobile && (
                                        <div style={{ marginLeft: 'auto' }}>
                                            <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                                <i className="fa fa-arrow-left"></i> Back
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label>Name</label> <small className="req">*</small>
                                            <input
                                                autoFocus
                                                name="type"
                                                type="text"
                                                className="form-control"
                                                value={formData.type}
                                                onChange={handleInputChange}
                                                maxLength="50"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Fees Code</label> <small className="req">*</small>
                                            <input
                                                name="code"
                                                type="text"
                                                className="form-control"
                                                value={formData.code}
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
                                <div className="box-header ptbnull" style={isMobile ? { display: 'flex', alignItems: 'center', padding: '12px 15px' } : {}}>
                                    <h3 className="box-title titlefix" style={isMobile ? { margin: 0, fontSize: '18px' } : {}}>
                                        Fees Type List : {sessionYear}
                                    </h3>
                                    {!isMobile && (
                                        <div className="btn-group pull-right">
                                            <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                                <i className="fa fa-arrow-left"></i> Back
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="box-body">
                                    <div className="download_label">Fees Type List</div>
                                    <TableToolbar
                                        searchTerm={searchTerm}
                                        onSearchChange={setSearchTerm}
                                        columns={columns}
                                        visibleColumns={visibleColumns}
                                        onToggleColumn={toggleColumn}
                                        getExportData={getExportData}
                                        exportFileName="fees_type"
                                        exportTitle="Fees Type List"
                                        showRecordsPerPage={false}
                                    />
                                    <div className="table-responsive mailbox-messages overflow-visible">
                                        <table className="table table-striped table-bordered table-hover example">
                                            <thead>
                                                <tr>
                                                    {columns.map(col => visibleColumns.has(col.key) && (
                                                        <th key={col.key} style={isMobile ? { borderLeft: 'none', borderRight: 'none', fontSize: '13px', width: col.key === 'type' ? '40%' : '45%' } : {}}>{col.label}</th>
                                                    ))}
                                                    <th className="text-right noExport" style={isMobile ? { borderLeft: 'none', borderRight: 'none', fontSize: '13px', width: '15%' } : {}}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {initialLoading ? (
                                                    <tr>
                                                        <td colSpan="3" className="text-center">
                                                            <i className="fa fa-spinner fa-spin"></i> Loading...
                                                        </td>
                                                    </tr>
                                                ) : feetypeList
                                                    .filter(f => f.type.toLowerCase().includes(searchTerm.toLowerCase()) || f.code.toLowerCase().includes(searchTerm.toLowerCase()))
                                                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                                    .map((feetype) => (
                                                        <tr key={feetype.id}>
                                                            {visibleColumns.has('type') && (
                                                                <td className="mailbox-name" style={isMobile ? { borderLeft: 'none', borderRight: 'none', verticalAlign: 'top', padding: '10px 4px', fontSize: '13px', width: '40%' } : { verticalAlign: 'top' }}>
                                                                    <span
                                                                        data-toggle="tooltip"
                                                                        title={feetype.description || 'No Description'}
                                                                        style={{ cursor: 'pointer' }}
                                                                    >
                                                                        {feetype.type}
                                                                    </span>
                                                                </td>
                                                            )}
                                                            {visibleColumns.has('code') && (
                                                                <td className="mailbox-name" style={isMobile ? { borderLeft: 'none', borderRight: 'none', verticalAlign: 'top', padding: '10px 4px', fontSize: '13px', width: '45%' } : { verticalAlign: 'top' }}>
                                                                    {feetype.code}
                                                                </td>
                                                            )}
                                                            <td 
                                                                className={isMobile ? "text-right" : "mailbox-date pull-right"} 
                                                                style={isMobile ? { borderLeft: 'none', borderRight: 'none', verticalAlign: 'top', padding: '10px 4px' } : { verticalAlign: 'top' }}
                                                            >
                                                                <div style={isMobile ? { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' } : {}}>
                                                                    <Link
                                                                        to={`/admin/feetype/edit/${feetype.id}`}
                                                                        className={isMobile ? "" : "btn btn-default btn-xs"}
                                                                        style={isMobile ? { color: '#333', fontSize: '14px' } : {}}
                                                                        data-toggle="tooltip"
                                                                        title="Edit"
                                                                    >
                                                                        <i className="fa fa-pencil"></i>
                                                                    </Link>
                                                                    <a
                                                                        href="#"
                                                                        onClick={(e) => { e.preventDefault(); handleDelete(feetype.id); }}
                                                                        className={isMobile ? "" : "btn btn-default btn-xs"}
                                                                        style={isMobile ? { color: '#333', fontSize: '14px' } : {}}
                                                                        data-toggle="tooltip"
                                                                        title="Delete"
                                                                    >
                                                                        <i className="fa fa-remove"></i>
                                                                    </a>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="row" style={isMobile ? { marginTop: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' } : {}}>
                                        <div className={isMobile ? "text-center" : "col-sm-5"}>
                                            <div className="dataTables_info">
                                                Showing {feetypeList.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, feetypeList.filter(f => f.type.toLowerCase().includes(searchTerm.toLowerCase()) || f.code.toLowerCase().includes(searchTerm.toLowerCase())).length)} of {feetypeList.filter(f => f.type.toLowerCase().includes(searchTerm.toLowerCase()) || f.code.toLowerCase().includes(searchTerm.toLowerCase())).length} entries
                                            </div>
                                        </div>
                                        <div className={isMobile ? "text-center" : "col-sm-7"}>
                                            <div className={isMobile ? "dataTables_paginate paging_simple_numbers" : "dataTables_paginate paging_simple_numbers"}>
                                                <ul className="pagination" style={isMobile ? { margin: 0 } : {}}>
                                                    <li className={`paginate_button previous ${currentPage === 1 ? 'disabled' : ''}`}>
                                                        <a href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1); }}><i className="fa fa-angle-left"></i></a>
                                                    </li>
                                                    {Array.from({ length: Math.ceil(feetypeList.filter(f => f.type.toLowerCase().includes(searchTerm.toLowerCase()) || f.code.toLowerCase().includes(searchTerm.toLowerCase())).length / itemsPerPage) }, (_, i) => (
                                                        <li key={i} className={`paginate_button ${currentPage === i + 1 ? 'active' : ''}`}>
                                                            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}>{i + 1}</a>
                                                        </li>
                                                    ))}
                                                    <li className={`paginate_button next ${currentPage === Math.ceil(feetypeList.filter(f => f.type.toLowerCase().includes(searchTerm.toLowerCase()) || f.code.toLowerCase().includes(searchTerm.toLowerCase())).length / itemsPerPage) ? 'disabled' : ''}`}>
                                                        <a href="#" onClick={(e) => { e.preventDefault(); if (currentPage < Math.ceil(feetypeList.filter(f => f.type.toLowerCase().includes(searchTerm.toLowerCase()) || f.code.toLowerCase().includes(searchTerm.toLowerCase())).length / itemsPerPage)) setCurrentPage(currentPage + 1); }}><i className="fa fa-angle-right"></i></a>
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

export default FeeTypeEdit;
