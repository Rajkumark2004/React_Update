import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable, buildExportData } from '../../utils/tableExport';
import { useTableSort } from '../../hooks/useTableSort';
import Pagination from '../../utils/Pagination';


const IncomeHead = () => {
    const navigate = useNavigate();
    const [incomeHeadList, setIncomeHeadList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        incomehead: '',
        description: ''
    });
    const [initialLoading, setInitialLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    const columns = [
        { key: 'income_category', label: 'Income Head', sortKey: 'income_category' },
        { key: 'description', label: 'Description', sortKey: 'description' }
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

    const formatCell = (row, key) => {
        return row[key] || '';
    };

    useEffect(() => {
        fetchIncomeHeadList();
    }, []);

    const fetchIncomeHeadList = async () => {
        try {
            console.log('Fetching Income Head List');
            const response = await api.getIncomeHeadList();
            console.log('Income Head Response:', response);
            if (response) {
                const list = response.data || response.incheadlist || (Array.isArray(response) ? response : []);
                setIncomeHeadList(Array.isArray(list) ? list : []);
            }
        } catch (error) {
            console.error('Error fetching income heads:', error);
            toast.error('Failed to fetch income heads');
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
            const response = await api.addIncomeHead(formData);
            if (response.status) {
                toast.success('Income Head added successfully');
                setFormData({ incomehead: '', description: '' });
                fetchIncomeHeadList();
            } else {
                toast.error(response.message || 'Failed to add income head');
            }
        } catch (error) {
            console.error('Error adding income head:', error);
            toast.error(error.message || 'Failed to add income head');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                const response = await api.deleteIncomeHead(id);
                if (response.status || response.success) {
                    toast.success('Income Head deleted successfully');
                    fetchIncomeHeadList();
                } else {
                    toast.error(response.message || 'Failed to delete income head');
                }
            } catch (error) {
                console.error('Error deleting income head:', error);
                toast.error('Failed to delete income head');
            }
        }
    };

    const { sortedData: sortedIncomeHead, requestSort: handleSort, getSortIcon } = useTableSort(incomeHeadList);

    const filteredIncomeHeadList = sortedIncomeHead.filter(head =>
        Object.values(head).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Pagination logic
    const totalItems = filteredIncomeHeadList.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const totalPages = Math.ceil(totalItems / safeRecordsPerPage);
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentItems = filteredIncomeHeadList.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, recordsPerPage]);

    const getExportData = () => buildExportData(columns, visibleColumns, filteredIncomeHeadList, formatCell);

    return (
        <div className="wrapper theme-white-skin">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '828px' }}>
                <section className="content">
                    <div className="row">
                        {/* Submenu Sidebar */}
                        <div className="col-md-2">
                            <div className="box border0">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Income</h3>
                                </div>
                                <ul className="tablists">
                                    <li>
                                        <Link to="/admin/income">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/income/1.png" alt="icon1" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} />
                                            Add Income
                                        </Link>
                                    </li>
                                    <li className="active">
                                        <Link to="/admin/incomehead" className="active">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/income/3.png" alt="icon3" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} />
                                            Income Head
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Add Form */}
                        <div className="col-md-4">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Add Income Head</h3>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label>Income Head</label> <small className="req">*</small>
                                            <input
                                                autoFocus
                                                name="incomehead"
                                                type="text"
                                                className="form-control"
                                                value={formData.incomehead}
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

                        {/* Income Head List */}
                        <div className="col-md-6">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Income Head List</h3>
                                    <div className="box-tools pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs" style={{ marginRight: '5px' }}>
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div
                                        className="row mb-2"
                                        style={{
                                            marginBottom: '10px',
                                            display: isMobile ? 'flex' : 'block',
                                            flexDirection: isMobile ? 'column' : 'row',
                                            alignItems: isMobile ? 'center' : 'stretch',
                                            gap: isMobile ? '15px' : '0'
                                        }}
                                    >
                                        <div
                                            className={isMobile ? "" : "col-sm-6"}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: isMobile ? '15px' : '20px',
                                                justifyContent: isMobile ? 'center' : 'flex-start',
                                                flexWrap: 'wrap'
                                            }}
                                        >
                                            <div className="dataTables_length">
                                                <label style={{ fontWeight: 'normal', display: 'flex', alignItems: 'center', margin: 0 }}>
                                                    Records:
                                                    <select
                                                        value={recordsPerPage}
                                                        onChange={(e) => {
                                                            setRecordsPerPage(Number(e.target.value));
                                                            setCurrentPage(1);
                                                        }}
                                                        className="form-control input-sm"
                                                        style={{ width: '80px', margin: '0 10px' }}
                                                    >
                                                        <option value="10">10</option>
                                                        <option value="25">25</option>
                                                        <option value="50">50</option>
                                                        <option value="100">100</option>
                                                        <option value="-1">All</option>
                                                    </select>
                                                </label>
                                            </div>
                                            <div className="dataTables_filter">
                                                <input
                                                    type="search"
                                                    className="form-control input-sm"
                                                    placeholder="Search..."
                                                    style={{
                                                        marginLeft: isMobile ? '0' : '10px',
                                                        display: 'inline-block',
                                                        width: isMobile ? '180px' : '180px',
                                                        border: 'none',
                                                        borderBottom: '1px solid #ccc',
                                                        borderRadius: '0',
                                                        boxShadow: 'none',
                                                        backgroundColor: 'transparent',
                                                        paddingLeft: '0',
                                                        outline: 'none',
                                                        textAlign: isMobile ? 'center' : 'left'
                                                    }}
                                                    value={searchTerm}
                                                    onChange={(e) => {
                                                        setSearchTerm(e.target.value);
                                                        setCurrentPage(1);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className={isMobile ? "text-center" : "col-sm-6 text-right"}>
                                            <div className="dt-buttons btn-group">
                                                <button className="btn btn-default btn-sm" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }} style={{ borderTopLeftRadius: '20px', borderBottomLeftRadius: '20px' }}>
                                                    <i className="fa fa-files-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'income_head_list.csv'); }}>
                                                    <i className="fa fa-file-text-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'income_head_list.xls'); }}>
                                                    <i className="fa fa-file-excel-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="PDF" onClick={() => { const { headers, rows } = getExportData(); downloadPDF(headers, rows, 'income_head_list.pdf', 'Income Head List'); }}>
                                                    <i className="fa fa-file-pdf-o"></i>
                                                </button>
                                                <button className="btn btn-default btn-sm" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Income Head List'); }}>
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
                                                    {columns.map(col => visibleColumns.has(col.key) && (
                                                        <th key={col.key}
                                                            className={col.sortKey ? 'sorting' : ''}
                                                            style={col.sortKey ? { cursor: 'pointer' } : {}}
                                                            onClick={col.sortKey ? () => handleSort(col.sortKey) : undefined}
                                                        >
                                                            {col.label} {col.sortKey && getSortIcon(col.sortKey)}
                                                        </th>
                                                    ))}
                                                    <th className="text-right noExport">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {initialLoading ? (
                                                    <tr>
                                                        <td colSpan={visibleColumns.size + 1} className="text-center">Loading...</td>
                                                    </tr>
                                                ) : currentItems.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={visibleColumns.size + 1} className="text-center text-danger">No data available in table</td>
                                                    </tr>
                                                ) : (
                                                    currentItems.map((head) => (
                                                        <tr key={head.id}>
                                                            {columns.map(col => visibleColumns.has(col.key) && (
                                                                <td key={col.key} className="mailbox-name">
                                                                    {formatCell(head, col.key)}
                                                                </td>
                                                            ))}
                                                            <td className="mailbox-date text-right noExport white-space-nowrap">
                                                                <Link
                                                                    to={`/admin/incomehead/edit/${head.id}`}
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
                                        {/* Pagination Footer */}
                                        <div className="pt15 pb15">
                                            <Pagination
                                                totalItems={totalItems}
                                                itemsPerPage={recordsPerPage}
                                                currentPage={currentPage}
                                                onPageChange={(page) => setCurrentPage(page)}
                                            />
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

export default IncomeHead;
