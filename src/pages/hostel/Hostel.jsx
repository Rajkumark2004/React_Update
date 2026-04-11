import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import '../../utils/include_files';
import { buildExportData } from '../../utils/tableExport';
import TableToolbar from '../../utils/TableToolbar';
import { useTableSort } from '../../hooks/useTableSort';
import { validateMaxLength, validateDescription, sanitizeName } from '../../utils/validation';
import Pagination from '../../utils/Pagination';

const Hostel = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        hostel_name: '',
        type: '',
        address: '',
        intake: '',
        description: ''
    });
    const [errors, setErrors] = useState({});
    const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

    const [hostellist, setHostelList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);

    const hostelTypes = ['Boys', 'Girls', 'Combined']; // Hostel type options

    // Columns
    const columns = [
        { key: 'hostel_name', label: 'Hostel Name', sortKey: 'hostel_name' },
        { key: 'type', label: 'Type', sortKey: 'type' },
        { key: 'address', label: 'Address', sortKey: 'address' },
        { key: 'intake', label: 'Intake', sortKey: 'intake' }
    ];

    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));

    const toggleColumn = (key) => {
        const newVisible = new Set(visibleColumns);
        if (newVisible.has(key)) newVisible.delete(key);
        else newVisible.add(key);
        setVisibleColumns(newVisible);
    };

    const { sortedData, requestSort, sortConfig, getSortIcon } = useTableSort(hostellist);

    const filteredHostelList = sortedData.filter(hostel =>
        Object.values(hostel).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const totalItems = filteredHostelList.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentItems = filteredHostelList.slice(indexOfFirstItem, indexOfLastItem);

    // Export Data formatting
    const formatCell = (row, key) => {
        return row[key] || '';
    };

    const getExportData = () => {
        return buildExportData(columns, visibleColumns, filteredHostelList, formatCell);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.getHostelData();

            if (response && response.status && response.data) {
                setHostelList(response.data.listhostel || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let sanitizedValue = value;
        let errorMsg = '';

        if (name === 'hostel_name' || name === 'address' || name === 'intake') {
            let limit = name === 'address' ? 100 : (name === 'intake' ? 10 : 50);
            if (value.length > limit) {
                errorMsg = `Maximum ${limit} characters allowed`;
            }
            if (name === 'hostel_name') sanitizedValue = sanitizeName(value);
            if (name === 'intake') sanitizedValue = value.replace(/[^0-9]/g, '');
        }

        setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
        setErrors(prev => ({ ...prev, [name]: errorMsg }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const newErrors = {};
        
        const nameError = validateMaxLength(formData.hostel_name, 50, 'Hostel Name');
        if (nameError) {
            newErrors.hostel_name = nameError;
        } else if (!formData.hostel_name) {
            newErrors.hostel_name = 'Hostel Name is required';
        }
        
        if (!formData.type) {
            newErrors.type = 'Type is required';
        }

        const addressError = validateMaxLength(formData.address, 100, 'Address');
        if (addressError) {
            newErrors.address = addressError;
        }

        const intakeError = validateMaxLength(formData.intake, 10, 'Intake');
        if (intakeError) {
            newErrors.intake = intakeError;
        } else if (formData.intake && !/^\d+$/.test(formData.intake)) {
            newErrors.intake = 'Intake must be a number';
        }
        
        const descriptionError = validateDescription(formData.description);
        if (descriptionError) {
            newErrors.description = descriptionError;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({}); // Clear errors if validation passes

        setSubmitting(true);
        try {
            const response = await api.createHostel(formData);

            if (response && response.status === true) {
                toast.success(response.message || 'Hostel added successfully');
                setFormData({
                    hostel_name: '',
                    type: '',
                    address: '',
                    intake: '',
                    description: ''
                });
                fetchData(); // Refresh list
            } else {
                toast.error(response.message || 'Failed to add hostel');
            }
        } catch (error) {
            console.error('Error creating hostel:', error);
            toast.error('Failed to add hostel');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this hostel?')) {
            try {
                const response = await api.deleteHostel(id);

                if (response && response.status === true) {
                    toast.success(response.message || 'Hostel deleted successfully');
                    fetchData();
                } else {
                    toast.error(response.message || 'Failed to delete hostel');
                }
            } catch (error) {
                console.error('Error deleting hostel:', error);
                toast.error('Failed to delete hostel');
            }
        }
    };

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-building-o"></i> Hostel
                    </h1>
                </section>

                <section className="content">
                    <div className="row">
                        {/* Add Form */}
                        <div className={`col-md-4 ${isMobile ? 'col-xs-12' : ''}`} style={{ marginBottom: isMobile ? '20px' : '0' }}>
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Add Hostel</h3>
                                    <div className="box-tools pull-right hidden-sm hidden-md hidden-lg">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <form id="form1" onSubmit={handleSubmit}>
                                    <div className="box-body">
                                        <div className="form-group">
                                            <label>Hostel Name<small className="req"> *</small></label>
                                            <input
                                                type="text"
                                                name="hostel_name"
                                                value={formData.hostel_name}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                placeholder=""
                                                maxLength={51}
                                                autoFocus
                                            />
                                            {errors.hostel_name && <span className="text-danger" style={{ fontSize: '12px' }}>{errors.hostel_name}</span>}
                                        </div>

                                        <div className="form-group">
                                            <label>Type<small className="req"> *</small></label>
                                            <select
                                                name="type"
                                                value={formData.type}
                                                onChange={handleInputChange}
                                                className="form-control"
                                            >
                                                <option value="">Select</option>
                                                {hostelTypes.map(type => (
                                                    <option key={type} value={type}>
                                                        {type}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.type && <span className="text-danger" style={{ fontSize: '12px' }}>{errors.type}</span>}
                                        </div>

                                        <div className="form-group">
                                            <label>Address</label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                placeholder=""
                                                maxLength={101}
                                            />
                                            {errors.address && <span className="text-danger" style={{ fontSize: '12px' }}>{errors.address}</span>}
                                        </div>

                                        <div className="form-group">
                                            <label>Intake</label>
                                            <input
                                                type="text"
                                                name="intake"
                                                value={formData.intake}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                placeholder=""
                                                maxLength={11}
                                            />
                                            {errors.intake && <span className="text-danger" style={{ fontSize: '12px' }}>{errors.intake}</span>}
                                        </div>

                                        <div className="form-group">
                                            <label>Description</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                rows="3"
                                                placeholder=""
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <button type="submit" className="btn btn-info pull-right" disabled={submitting}>
                                            {submitting ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Hostel List */}
                        <div className={`col-md-8 ${isMobile ? 'col-xs-12' : ''}`}>
                            <div className="box box-primary" id="holist">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Hostel List</h3>
                                    <div className="btn-group pull-right hidden-xs">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <TableToolbar
                                        searchTerm={searchTerm}
                                        onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
                                        recordsPerPage={recordsPerPage}
                                        onRecordsPerPageChange={(val) => { setRecordsPerPage(val); setCurrentPage(1); }}
                                        columns={columns}
                                        visibleColumns={visibleColumns}
                                        onToggleColumn={toggleColumn}
                                        getExportData={getExportData}
                                        exportFileName="hostel_list"
                                        exportTitle="Hostel List"
                                    />
                                    <div className="mailbox-messages table-responsive">
                                        <table className="table table-striped table-bordered table-hover example">
                                            <thead>
                                                <tr>
                                                    {columns.map(col => visibleColumns.has(col.key) && (
                                                        <th key={col.key} onClick={() => requestSort(col.sortKey)} style={{ cursor: 'pointer' }}>
                                                            {col.label} {getSortIcon(col.sortKey)}
                                                        </th>
                                                    ))}
                                                    <th className="text-right noExport">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentItems.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={visibleColumns.size + 1} className="text-center">No Record Found</td>
                                                    </tr>
                                                ) : (
                                                    currentItems.map(hostel => (
                                                        <tr key={hostel.id}>
                                                            {visibleColumns.has('hostel_name') && <td className="mailbox-name">
                                                                <a
                                                                    href="#"
                                                                    data-toggle="tooltip"
                                                                    title={hostel.description || 'No description'}
                                                                    onClick={(e) => e.preventDefault()}
                                                                >
                                                                    {hostel.hostel_name}
                                                                </a>
                                                            </td>}
                                                            {visibleColumns.has('type') && <td className="mailbox-name">{hostel.type}</td>}
                                                            {visibleColumns.has('address') && <td className="mailbox-name">{hostel.address}</td>}
                                                            {visibleColumns.has('intake') && <td className="mailbox-name">{hostel.intake}</td>}
                                                            <td className="mailbox-date pull-right no-print">
                                                                <Link
                                                                    to={`/admin/hostel/edit/${hostel.id}`}
                                                                    className="btn btn-default btn-xs"
                                                                    data-toggle="tooltip"
                                                                    title="Edit"
                                                                >
                                                                    <i className="fa fa-pencil"></i>
                                                                </Link>
                                                                <button
                                                                    onClick={() => handleDelete(hostel.id)}
                                                                    className="btn btn-default btn-xs"
                                                                    data-toggle="tooltip"
                                                                    title="Delete"
                                                                    style={{ marginLeft: '5px' }}
                                                                >
                                                                    <i className="fa fa-remove"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="pt15 pb15" style={{ padding: '15px 0' }}>
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

export default Hostel;
