import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import '../../utils/include_files';
import { validateMaxLength, validateDescription, sanitizeName } from '../../utils/validation';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable } from '../../utils/tableExport';
import TableToolbar from '../../utils/TableToolbar';
import Pagination from '../../utils/Pagination';

const HostelEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        hostel_name: '',
        type: '',
        address: '',
        intake: '',
        description: ''
    });
    const [errors, setErrors] = useState({});

    const [hostellist, setHostelList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);

    const hostelTypes = ['Boys', 'Girls', 'Combined'];

    const filteredHostelList = hostellist.filter(hostel =>
        Object.values(hostel).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const totalItems = filteredHostelList.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentItems = filteredHostelList.slice(indexOfFirstItem, indexOfLastItem);

    const columns = [
        { key: 'hostel_name', label: 'Hostel Name' },
        { key: 'type', label: 'Type' },
        { key: 'address', label: 'Address' },
        { key: 'intake', label: 'Intake' }
    ];

    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));

    const toggleColumn = (key) => {
        const newVisible = new Set(visibleColumns);
        if (newVisible.has(key)) {
            newVisible.delete(key);
        } else {
            newVisible.add(key);
        }
        setVisibleColumns(newVisible);
    };

    const getExportData = () => {
        const activeCols = columns.filter(c => visibleColumns.has(c.key));
        const headers = activeCols.map(c => c.label);
        const rows = filteredHostelList.map(h => activeCols.map(c => h[c.key]));
        return { headers, rows };
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.getHostelData();

            if (response && response.status && response.data) {
                setHostelList(response.data.listhostel || []);

                // Find and populate the hostel being edited
                const hostelToEdit = response.data.listhostel?.find(h => h.id === id);
                if (hostelToEdit) {
                    setFormData({
                        id: hostelToEdit.id,
                        hostel_name: hostelToEdit.hostel_name,
                        type: hostelToEdit.type,
                        address: hostelToEdit.address || '',
                        intake: hostelToEdit.intake || '',
                        description: hostelToEdit.description || ''
                    });
                }
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
            const response = await api.updateHostel(formData);

            if (response && response.status === true) {
                toast.success(response.message || 'Hostel updated successfully');
                navigate('/admin/hostel');
            } else {
                toast.error(response.message || 'Failed to update hostel');
            }
        } catch (error) {
            console.error('Error updating hostel:', error);
            toast.error('Failed to update hostel');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (hostelId) => {
        if (window.confirm('Are you sure you want to delete this hostel?')) {
            try {
                const response = await api.deleteHostel(hostelId);

                if (response && response.status === true) {
                    toast.success(response.message || 'Hostel deleted successfully');
                    fetchData();
                    // If the deleted hostel was the one being edited, navigate back
                    if (hostelId === id) {
                        navigate('/admin/hostel');
                    }
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
                        {/* Edit Form */}
                        <div className={`col-md-4 ${isMobile ? 'col-xs-12' : ''}`} style={{ marginBottom: isMobile ? '20px' : '0' }}>
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Edit Hostel</h3>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="box-body">
                                        <input type="hidden" name="id" value={formData.id} />

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
                                                placeholder="Enter ..."
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
                                        <div className="download_label">Hostel List</div>
                                        <table className="table table-striped table-bordered table-hover example">
                                            <thead>
                                                <tr>
                                                    {visibleColumns.has('hostel_name') && <th>Hostel Name</th>}
                                                    {visibleColumns.has('type') && <th>Type</th>}
                                                    {visibleColumns.has('address') && <th>Address</th>}
                                                    {visibleColumns.has('intake') && <th>Intake</th>}
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
                                                            {visibleColumns.has('hostel_name') && (
                                                                <td className="mailbox-name">
                                                                    <a
                                                                        href="#"
                                                                        data-toggle="tooltip"
                                                                        title={hostel.description || 'No description'}
                                                                        onClick={(e) => e.preventDefault()}
                                                                    >
                                                                        {hostel.hostel_name}
                                                                    </a>
                                                                </td>
                                                            )}
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
                    </div>
                </section>
            </div>

            <Footer />
        </div>
    );
};

export default HostelEdit;
