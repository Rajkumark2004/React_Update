import React, { useState, useEffect, useMemo } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import TableToolbar from '../../utils/TableToolbar';
import Pagination from '../../utils/Pagination';

const COLUMNS = [
    { key: 'name', label: 'Name' },
    { key: 'action', label: 'Action' }
];

const Designation = () => {
    const [designations, setDesignations] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        id: '',
        name: ''
    });

    const [isEditing, setIsEditing] = useState(false);

    // TableToolbar state
    const [searchTerm, setSearchTerm] = useState('');
    const [recordsPerPage, setRecordsPerPage] = useState(100);
    const [currentPage, setCurrentPage] = useState(1);
    const [visibleColumns, setVisibleColumns] = useState(new Set(COLUMNS.map(c => c.key)));

    const fetchDesignations = async () => {
        setLoading(true);
        try {
            const response = await api.getDesignationList();
            if (response && response.status === 'success') {
                const formattedData = response.designation.map(desig => ({
                    id: desig.id,
                    name: desig.designation
                }));
                setDesignations(formattedData);
            }
        } catch (error) {
            console.error('Error fetching designations:', error);
            // toast.error('Failed to fetch designations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDesignations();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, name: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error('Name is required');
            return;
        }

        const isDuplicate = designations.some(desig =>
            desig.name.toLowerCase() === formData.name.trim().toLowerCase() &&
            (!isEditing || desig.id !== formData.id)
        );

        if (isDuplicate) {
            toast.error('Designation name already exists');
            return;
        }

        setLoading(true);
        try {
            if (isEditing) {
                const response = await api.updateDesignation({
                    designationid: formData.id,
                    type: formData.name
                });
                if (response && response.status === 'success') {
                    toast.success('Designation updated successfully');
                    fetchDesignations(); // Refresh the list
                } else {
                    toast.error(response?.message || 'Failed to update designation');
                }
            } else {
                const response = await api.addDesignation({ type: formData.name });
                if (response && response.status === 'success') {
                    toast.success('Designation added successfully');
                    fetchDesignations(); // Refresh the list
                } else {
                    toast.error(response?.message || 'Failed to add designation');
                }
            }
            setFormData({ id: '', name: '' });
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving designation:', error);
            toast.error('An error occurred while saving');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (d) => {
        setLoading(true);
        try {
            const response = await api.getDesignationForEdit(d.id);
            if (response && response.status === 'success' && response.result) {
                setFormData({
                    id: response.result.id,
                    name: response.result.designation
                });
                setIsEditing(true);
            } else {
                toast.error('Failed to fetch designation details');
            }
        } catch (error) {
            console.error('Error fetching designation details:', error);
            toast.error('An error occurred while fetching details');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this designation?')) {
            setLoading(true);
            try {
                const response = await api.deleteDesignation(id);
                if (response && response.status === 'success') {
                    toast.success('Designation deleted successfully');
                    fetchDesignations(); // Refresh the list
                } else {
                    toast.error(response?.message || 'Failed to delete designation');
                }
            } catch (error) {
                console.error('Error deleting designation:', error);
                toast.error('An error occurred while deleting');
            } finally {
                setLoading(false);
            }
        }
    };

    // Filtered + paginated data
    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return designations;
        const term = searchTerm.toLowerCase();
        return designations.filter(d => d.name.toLowerCase().includes(term));
    }, [designations, searchTerm]);

    const paginatedData = useMemo(() => {
        if (recordsPerPage === -1) return filteredData;
        const start = (currentPage - 1) * recordsPerPage;
        return filteredData.slice(start, start + recordsPerPage);
    }, [filteredData, currentPage, recordsPerPage]);

    const totalPages = recordsPerPage === -1 ? 1 : Math.ceil(filteredData.length / recordsPerPage);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, recordsPerPage]);

    const handleToggleColumn = (key) => {
        setVisibleColumns(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key); else next.add(key);
            return next;
        });
    };

    const getExportData = () => {
        const exportCols = COLUMNS.filter(c => c.key !== 'action' && visibleColumns.has(c.key));
        return {
            headers: exportCols.map(c => c.label),
            rows: filteredData.map(d => exportCols.map(c => d[c.key] || ''))
        };
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content-header">
                    <h1><i className="fa fa-sitemap"></i> Human Resource</h1>
                </section>

                <section className="content">
                    <div className="row">
                        <div className="col-md-4">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">{isEditing ? 'Edit Designation' : 'Add Designation'}</h3>
                                </div>
                                <form onSubmit={handleSave}>
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label>Name</label><small className="req"> *</small>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <button type="submit" className="btn btn-primary pull-right">
                                            {isEditing ? 'Update' : 'Save'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div className="col-md-8">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Designation List</h3>
                                    <div className="box-tools pull-right">
                                        <button onClick={() => window.history.back()} className="btn btn-primary btn-xs">
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
                                        columns={COLUMNS}
                                        visibleColumns={visibleColumns}
                                        onToggleColumn={handleToggleColumn}
                                        getExportData={getExportData}
                                        exportFileName="designation_list"
                                        exportTitle="Designation List"
                                    />
                                    <div className="table-responsive no-padding">
                                        <table className="table table-striped table-bordered table-hover">
                                            <thead>
                                                <tr>
                                                    {visibleColumns.has('name') && <th>Name</th>}
                                                    {visibleColumns.has('action') && <th className="text-right">Action</th>}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr>
                                                        <td colSpan="2" className="text-center">Loading...</td>
                                                    </tr>
                                                ) : paginatedData.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="2" className="text-center">No Result Found</td>
                                                    </tr>
                                                ) : (
                                                    paginatedData.map(d => (
                                                        <tr key={d.id}>
                                                            {visibleColumns.has('name') && <td>{d.name}</td>}
                                                            {visibleColumns.has('action') && (
                                                                <td className="text-right white-space-nowrap">
                                                                    <button
                                                                        onClick={() => handleEdit(d)}
                                                                        className="btn btn-default btn-xs"
                                                                        title="Edit"
                                                                    >
                                                                        <i className="fa fa-pencil"></i>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(d.id)}
                                                                        className="btn btn-default btn-xs"
                                                                        title="Delete"
                                                                        style={{ marginLeft: '3px' }}
                                                                    >
                                                                        <i className="fa fa-remove"></i>
                                                                    </button>
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Pagination
                                        totalItems={filteredData.length}
                                        itemsPerPage={recordsPerPage}
                                        currentPage={currentPage}
                                        onPageChange={setCurrentPage}
                                    />
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

export default Designation;
