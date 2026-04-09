import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import { api } from '../../../services/api';
import { useSession } from '../../../context/SessionContext';
import toast from 'react-hot-toast';
import { sanitizeNameWithNumbers } from '../../../utils/validation';
import { buildExportData } from '../../../utils/tableExport';
import Pagination from '../../../utils/Pagination';
import TableToolbar from '../../../utils/TableToolbar';

const FeeGroup = () => {
    const { currentSession } = useSession();
    const sessionYear = currentSession?.session || '2024-25';

    const [feegroupList, setFeegroupList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [initialLoading, setInitialLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(100);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    // Column definitions
    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'description', label: 'Description' }
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
        const filteredData = feegroupList.filter(group => group.name.toLowerCase().includes(searchTerm.toLowerCase()));
        return buildExportData(columns, visibleColumns, filteredData, formatCell);
    };

    useEffect(() => {
        fetchFeeGroupList();
    }, []);

    const fetchFeeGroupList = async () => {
        try {
            const response = await api.getFeeGroupList();
            if (response && response.data) {
                setFeegroupList(response.data);
            } else if (Array.isArray(response)) {
                setFeegroupList(response);
            } else {
                setFeegroupList([]);
            }
        } catch (error) {
            console.error('Error fetching fee groups:', error);
            toast.error('Failed to fetch fee groups');
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
            const response = await api.addFeeGroup(formData);
            if (response.status) {
                toast.success('Fee Group added successfully');
                setFormData({ name: '', description: '' });
                fetchFeeGroupList();
            } else {
                let errorMsg = 'Failed to add fee group';
                if (response.errors && response.errors.name) {
                    errorMsg = response.errors.name.replace(/<[^>]*>?/gm, '');
                } else if (response.message) {
                    errorMsg = response.message;
                }
                toast.error(errorMsg);
            }
        } catch (error) {
            console.error('Error adding fee group:', error);
            toast.error(error.message || 'Failed to add fee group');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                const response = await api.deleteFeeGroup(id);
                if (response.status) {
                    toast.success('Fee Group deleted successfully');
                    fetchFeeGroupList();
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
                                        Add Fees Group : {sessionYear}
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
                                <div className="box-header ptbnull" style={isMobile ? { display: 'flex', alignItems: 'center', padding: '12px 15px' } : {}}>
                                    <h3 className="box-title titlefix" style={isMobile ? { margin: 0, fontSize: '18px' } : {}}>
                                        Fees Group List : {sessionYear}
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
                                    <div className="download_label">Fees Group List</div>
                                    <TableToolbar
                                        searchTerm={searchTerm}
                                        onSearchChange={setSearchTerm}
                                        columns={columns}
                                        visibleColumns={visibleColumns}
                                        onToggleColumn={toggleColumn}
                                        getExportData={getExportData}
                                        exportFileName="fees_group"
                                        exportTitle="Fees Group List"
                                        showRecordsPerPage={false}
                                    />
                                    <div className="table-responsive mailbox-messages overflow-visible">
                                        <table className="table table-striped table-bordered table-hover example">
                                            <thead>
                                                <tr>
                                                    {columns.map(col => visibleColumns.has(col.key) && (
                                                        <th key={col.key} style={isMobile ? { borderLeft: 'none', borderRight: 'none', fontSize: '13px', width: col.key === 'name' ? '30%' : '55%' } : {}}>{col.label}</th>
                                                    ))}
                                                    <th className="text-right noExport" style={isMobile ? { borderLeft: 'none', borderRight: 'none', fontSize: '13px', width: '15%' } : {}}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {initialLoading ? (
                                                    <tr>
                                                        <td colSpan={visibleColumns.size + 1} className="text-center">
                                                            <i className="fa fa-spinner fa-spin"></i> Loading...
                                                        </td>
                                                    </tr>
                                                ) : feegroupList.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={visibleColumns.size + 1} className="text-center">No data available in table</td>
                                                    </tr>
                                                ) : feegroupList
                                                    .filter(group => group.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                                    .map((feegroup) => (
                                                        <tr key={feegroup.id}>
                                                            {visibleColumns.has('name') && (
                                                                <td className="mailbox-name" style={isMobile ? { borderLeft: 'none', borderRight: 'none', verticalAlign: 'top', padding: '10px 4px', fontSize: '13px', width: '30%' } : { verticalAlign: 'top' }}>
                                                                    <a href="#" onClick={(e) => e.preventDefault()}>{feegroup.name}</a>
                                                                </td>
                                                            )}
                                                            {visibleColumns.has('description') && (
                                                                <td className="mailbox-name" style={isMobile ? { borderLeft: 'none', borderRight: 'none', verticalAlign: 'top', padding: '10px 4px', fontSize: '13px', width: '55%' } : { verticalAlign: 'top' }}>
                                                                    {feegroup.description}
                                                                </td>
                                                            )}
                                                            <td 
                                                                className={isMobile ? "text-right" : "mailbox-date pull-right"} 
                                                                style={isMobile ? { borderLeft: 'none', borderRight: 'none', verticalAlign: 'top', padding: '10px 4px' } : { verticalAlign: 'top' }}
                                                            >
                                                                <div style={isMobile ? { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' } : {}}>
                                                                    <Link
                                                                        to={`/admin/feegroup/edit/${feegroup.id}`}
                                                                        className={isMobile ? "" : "btn btn-default btn-xs"}
                                                                        style={isMobile ? { color: '#333', fontSize: '14px' } : {}}
                                                                        data-toggle="tooltip"
                                                                        title="Edit"
                                                                    >
                                                                        <i className="fa fa-pencil"></i>
                                                                    </Link>
                                                                    <a
                                                                        href="#"
                                                                        onClick={(e) => { e.preventDefault(); handleDelete(feegroup.id); }}
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
                                                    ))
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                    {feegroupList.length > 0 && (
                                        <div className="pt15 pb15">
                                            <Pagination 
                                                totalItems={feegroupList.filter(group => group.name.toLowerCase().includes(searchTerm.toLowerCase())).length} 
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

export default FeeGroup;
