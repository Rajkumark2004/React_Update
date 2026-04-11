import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { buildExportData } from '../../utils/tableExport';
import { useTableSort } from '../../hooks/useTableSort';
import TableToolbar from '../../utils/TableToolbar';
import Pagination from '../../utils/Pagination';

const IncomeHeadEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [incomeHeadList, setIncomeHeadList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [formData, setFormData] = useState({
        incomehead: '',
        description: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);

    const columns = [
        { key: 'income_category', label: 'Income Head', sortKey: 'income_category' },
        { key: 'description', label: 'Description', sortKey: 'description' }
    ];
    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));

    const handleToggleColumn = (key) => {
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
            const response = await api.getIncomeHeadList();
            console.log('Income Head Response:', response);
            let list = [];
            if (response) {
                list = response.data || response.incheadlist || (Array.isArray(response) ? response : []);
            }
            setIncomeHeadList(list);

            const item = list.find(f => f.id == id);
            if (item) {
                setFormData({
                    incomehead: item.income_category || item.incomehead,
                    description: item.description
                });
            } else {
                toast.error('Income Head not found');
                navigate('/admin/incomehead');
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
            const response = await api.editIncomeHead(id, formData);
            if (response.status || response.success) {
                toast.success('Income Head updated successfully');
                navigate('/admin/incomehead');
            } else {
                toast.error(response.message || 'Failed to update income head');
            }
        } catch (error) {
            console.error('Error updating income head:', error);
            toast.error(error.message || 'Failed to update income head');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (deleteId) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                const response = await api.deleteIncomeHead(deleteId);
                if (response.status || response.success) {
                    toast.success('Income Head deleted successfully');
                    fetchIncomeHeadList();
                    if (deleteId == id) navigate('/admin/incomehead');
                } else {
                    toast.error(response.message || 'Failed to delete income head');
                }
            } catch (error) {
                console.error('Error deleting income head:', error);
                toast.error('Failed to delete income head');
            }
        }
    };

    const { sortedData: sortedHeads, requestSort: handleSort, getSortIcon } = useTableSort(incomeHeadList);

    const filteredHeads = sortedHeads.filter(head =>
        Object.values(head).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const getExportData = () => buildExportData(columns, visibleColumns, filteredHeads, formatCell);

    // Pagination logic
    const totalItems = filteredHeads.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const totalPages = Math.ceil(totalItems / safeRecordsPerPage);
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentItems = filteredHeads.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, recordsPerPage]);

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
                                    <h3 className="box-title">Edit Income Head</h3>
                                    <div className="box-tools pull-right hidden-sm hidden-md hidden-lg">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
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
                        <div className="col-md-8">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Income Head List</h3>
                                    <div className="box-tools pull-right hidden-xs">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs" style={{ marginRight: '5px' }}>
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <TableToolbar
                                        searchTerm={searchTerm}
                                        onSearchChange={setSearchTerm}
                                        recordsPerPage={recordsPerPage}
                                        onRecordsPerPageChange={setRecordsPerPage}
                                        columns={columns}
                                        visibleColumns={visibleColumns}
                                        onToggleColumn={handleToggleColumn}
                                        getExportData={getExportData}
                                        exportFileName="income_head_list"
                                        exportTitle="Income Head List"
                                    />
                                    <div className="table-responsive mailbox-messages">
                                        <table className="table table-striped table-bordered table-hover example">
                                            <thead>
                                                <tr>
                                                    {columns.map(col => visibleColumns.has(col.key) && (
                                                        <th key={col.key} onClick={() => handleSort(col.sortKey)} style={{ cursor: 'pointer' }}>
                                                            {col.label} {getSortIcon(col.sortKey)}
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

export default IncomeHeadEdit;
