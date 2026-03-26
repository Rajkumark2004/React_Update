import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import Loader from '../../../components/Loader';
import AddEnquiryModal from './AddEnquiryModal';
import EditEnquiryModal from './EditEnquiryModal';
import FollowUpModal from './FollowUpModal';
import { api } from '../../../services/api';
import { filterEnquiries } from './enquiryFilterLogic';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable, buildExportData } from '../../../utils/tableExport';
import '../../../utils/include_files';
import { useTableSort } from '../../../hooks/useTableSort';
import './EnquiryView.css';

const EnquiryView = () => {
    // Filter form state
    const [filterForm, setFilterForm] = useState({
        class_id: '',
        source: '',
        from_date: '',
        to_date: '',
        status: ''
    });

    // Data states
    const [masterEnquiryList, setMasterEnquiryList] = useState([]); // Store all data
    const [enquiryList, setEnquiryList] = useState([]);
    const [classList, setClassList] = useState([]);
    const [sourceList, setSourceList] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [referenceList, setReferenceList] = useState([]);
    const [enquiryStatus, setEnquiryStatus] = useState({
        'active': 'Active',
        'passive': 'Passive',
        'dead': 'Dead',
        'won': 'Won',
        'lost': 'Lost'
    });
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [flashMessage, setFlashMessage] = useState('');
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showFollowUpModal, setShowFollowUpModal] = useState(false);
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState(''); // Global search term

    // Column definitions
    const columns = [
        { key: 'name', label: 'Name', sortKey: 'name' },
        { key: 'contact', label: 'Phone' },
        { key: 'source', label: 'Source' },
        { key: 'classname', label: 'Class', sortKey: 'classname' },
        { key: 'date', label: 'Enquiry Date', sortKey: 'date' },
        { key: 'followupdate', label: 'Last Follow Up Date', sortKey: 'followupdate' },
        { key: 'follow_up_date', label: 'Next Follow Up Date', sortKey: 'follow_up_date' },
        { key: 'status', label: 'Status', sortKey: 'status' }
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
        if (key === 'date' || key === 'followupdate' || key === 'follow_up_date') return formatDate(row[key]);
        if (key === 'status') return (enquiryStatus && enquiryStatus[row[key]]) || row[key];
        return row[key];
    };

    const getExportData = () => buildExportData(columns, visibleColumns, finalFilteredEnquiries, formatCell);

    // Use sorting hook
    const { sortedData: sortedEnquiries, requestSort: handleSort, getSortIcon } = useTableSort(enquiryList);

    // Fetch enquiry list from API
    const fetchEnquiryList = async (filters = null) => {
        try {
            setError('');
            setLoading(true);
            
            // Use POST search if filters are provided, otherwise GET initial list
            const response = filters 
                ? await api.searchEnquiryList(filters) 
                : await api.getEnquiryList();
                
            console.log('DEBUG: Enquiry API Response:', response);

            // Handle different response formats and ensure array
            // The API response can be directly the object or wrapped in .data
            const enquiryData = (response && response.data) ? response.data : response;

            console.log('DEBUG: Parsed Enquiry Data Object:', enquiryData);

            let enquiries = [];
            if (enquiryData && Array.isArray(enquiryData.enquiry_list)) {
                enquiries = enquiryData.enquiry_list;

                // Set class list
                if (Array.isArray(enquiryData.class_list)) {
                    console.log('DEBUG: Setting classList:', enquiryData.class_list);
                    setClassList(enquiryData.class_list);
                }

                // Set source list (handles both sourcelist and source_list)
                const sources = enquiryData.sourcelist || enquiryData.source_list;
                if (Array.isArray(sources)) {
                    console.log('DEBUG: Setting sourceList:', sources);
                    setSourceList(sources);
                }

                // Set staff list
                if (Array.isArray(enquiryData.staff_list)) {
                    console.log('DEBUG: Setting staffList:', enquiryData.staff_list);
                    setStaffList(enquiryData.staff_list);
                }

                // Set reference list
                if (Array.isArray(enquiryData.reference)) {
                    console.log('DEBUG: Setting referenceList:', enquiryData.reference);
                    setReferenceList(enquiryData.reference);
                }

                // Set enquiry status mapping
                if (enquiryData.enquiry_status) {
                    console.log('DEBUG: Setting enquiryStatus:', enquiryData.enquiry_status);
                    setEnquiryStatus(enquiryData.enquiry_status);
                }
            } else if (Array.isArray(enquiryData)) {
                enquiries = enquiryData;
            }

            console.log('DEBUG: Final enquiries extracted:', enquiries.length);
            
            // Client-side fallback because the server is currently ignoring the class_id filter
            // We apply the local filtering logic to ensure the UI matches the requested criteria
            if (filters) {
                console.log('DEBUG: Applying client-side filters:', filters);
                enquiries = filterEnquiries(enquiries, filters);
                console.log('DEBUG: Enquiries after client-side filtering:', enquiries.length);
            }

            setMasterEnquiryList(enquiries);
            setEnquiryList(enquiries);
        } catch (err) {
            console.error('Error fetching enquiry list:', err);
            setError(err.message || 'Failed to load enquiry list');
            setMasterEnquiryList([]);
            setEnquiryList([]); // Ensure it's an empty array on error
        } finally {
            setInitialLoading(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnquiryList(); // Hits GET /admin/enquiry
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilterForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = (e) => {
        e.preventDefault();

        const errors = {};
        if (!filterForm.from_date) {
            errors.from_date = 'The Enquiry From Date field is required.';
        }
        if (!filterForm.to_date) {
            errors.to_date = 'The Enquiry To Date field is required.';
        }

        // Validation: Date logic check
        if (filterForm.from_date && filterForm.to_date) {
            const start = new Date(filterForm.from_date);
            const end = new Date(filterForm.to_date);

            if (end < start) {
                errors.to_date = 'Enquiry To Date cannot be before Enquiry From Date';
            }
        }

        setValidationErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        const searchFilters = { 
            ...filterForm, 
            status: filterForm.status === 'all' ? '' : filterForm.status 
        };

        console.log('Search with API:', searchFilters);
        fetchEnquiryList(searchFilters);
        setCurrentPage(1); // Reset to first page
    };

    const handleFollowUp = (enquiry) => {
        setSelectedEnquiry(enquiry);
        setShowFollowUpModal(true);
    };

    const handleEdit = (enquiry) => {
        setSelectedEnquiry(enquiry);
        setShowEditModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                // Call API
                await api.deleteEnquiry(id);

                // Update State
                const updatedList = masterEnquiryList.filter(e => e.id !== id);
                setMasterEnquiryList(updatedList);
                setEnquiryList(prev => prev.filter(e => e.id !== id));

                setFlashMessage('Record Deleted Successfully');
                setTimeout(() => setFlashMessage(''), 3000);
            } catch (err) {
                console.error('Delete Error:', err);
                // Fallback: If 404/500, still maybe remove or show error
                // alert('Failed to delete record: ' + err.message);
                setFlashMessage('Failed to delete record');
                setTimeout(() => setFlashMessage(''), 3000);
            }
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === '0000-00-00') return '';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    const isOverdue = (enquiry) => {
        let checkDate = enquiry.next_date;
        if (!checkDate || checkDate === '0000-00-00') {
            // PHP logic uses follow_up_date for calculation, but table displays followupdate. Check both for safety.
            checkDate = enquiry.follow_up_date || enquiry.followupdate;
        }

        if (!checkDate || checkDate === '0000-00-00') return false;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const next = new Date(checkDate);
        return next < today;
    };

    // Combine API filters + Client-side search + Sorting
    // Note: sortedEnquiries already contains the sorted result of filtered API data
    // We now further filter `sortedEnquiries` based on `searchTerm`
    const finalFilteredEnquiries = sortedEnquiries.filter(item => {
        if (!searchTerm) return true;
        const lowerTerm = searchTerm.toLowerCase();
        return (
            item.name?.toLowerCase().includes(lowerTerm) ||
            item.contact?.toLowerCase().includes(lowerTerm) ||
            item.source?.toLowerCase().includes(lowerTerm) ||
            item.classname?.toLowerCase().includes(lowerTerm) ||
            item.status?.toLowerCase().includes(lowerTerm)
        );
    });

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEnquiries = finalFilteredEnquiries.slice(indexOfFirstItem, indexOfLastItem);
    const totalItems = finalFilteredEnquiries.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <div className="wrapper theme-white-skin">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '828px' }}>
                {/* Content Header */}
                <section className="content-header">
                    <h1>
                        <i className="fa fa-ioxhost"></i> Help Desk
                    </h1>
                </section>

                {/* Main Content */}
                <section className="content">
                    <div className="row">
                        {/* Left Sidebar - Front Office Menu */}
                        <div className="col-md-2">
                            <div className="box border0">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Help Desk</h3>
                                </div>
                                <ul className="tablists">
                                    <li>
                                        <Link to="/admin/enquiry">
                                            <img src="/images/admission_enquiry.png" alt="icon1" className="img-fluid" style={{ width: '20px' }} /> Admission Enquiry
                                        </Link>
                                    </li>
                                    {/*
                                    <li>
                                        <Link to="/admin/visitors">
                                            <img src="/images/visitor_book.png" alt="icon2" className="img-fluid" style={{ width: '20px' }} /> Visitor Book
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/visitor_management">
                                            <img src="/images/visitor_management.png" alt="icon2" className="img-fluid" style={{ width: '20px' }} /> Visitor Management
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/generalcall">
                                            <img src="/images/phone_call_log.png" alt="icon3" className="img-fluid" style={{ width: '20px' }} /> Phone Call Log
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/dispatch">
                                            <img src="/images/postal_dispatch.png" alt="icon4" className="img-fluid" style={{ width: '20px' }} /> Postal Dispatch
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/receive">
                                            <img src="/images/postal_receive.png" alt="icon5" className="img-fluid" style={{ width: '20px' }} /> Postal Receive
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/complaint">
                                            <img src="/images/complain.png" alt="icon6" className="img-fluid" style={{ width: '20px' }} /> Complain
                                        </Link>
                                    </li>*/}
                                    <li>
                                        <Link to="/admin/source">
                                            <img src="/images/set_up_front_office.png" alt="icon7" className="img-fluid" style={{ width: '20px' }} /> Setup Front Office
                                        </Link>
                                    </li>

                                </ul>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="col-md-10">
                            {initialLoading ? (
                                <Loader />
                            ) : (
                                <div className="box box-primary">
                                    <div className="box-header with-border">
                                        <h3 className="box-title"><i className="fa fa-search"></i> Select Criteria</h3>
                                    </div>

                                    {/* Flash Message */}
                                    {flashMessage && (
                                        <div className="col-md-12">
                                            <div className="alert alert-info">{flashMessage}</div>
                                        </div>
                                    )}

                                    {/* Filter Form */}
                                    <form role="form" onSubmit={handleSearch}>
                                        <div className="box-body row">
                                            {/* Class */}
                                            <div className="col-sm-6 col-md-2 col-lg-2">
                                                <div className="form-group">
                                                    <label>Class</label>
                                                    <select
                                                        id="class"
                                                        name="class_id"
                                                        className="form-control"
                                                        value={filterForm.class_id}
                                                        onChange={handleFilterChange}
                                                    >
                                                        <option value="">Select</option>
                                                        {classList.map(cls => (
                                                            <option key={cls.id} value={cls.id}>{cls.class}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Source */}
                                            <div className="col-sm-6 col-md-2 col-lg-2">
                                                <div className="form-group">
                                                    <label>Source</label>
                                                    <select
                                                        id="source"
                                                        name="source"
                                                        className="form-control"
                                                        value={filterForm.source}
                                                        onChange={handleFilterChange}
                                                    >
                                                        <option value="">Select</option>
                                                        {sourceList.map((src, idx) => (
                                                            <option key={idx} value={src.source}>{src.source}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* From Date */}
                                            <div className="col-sm-3 col-md-2 col-lg-2">
                                                <div className="form-group">
                                                    <label>Enquiry From Date<small className="req"> *</small></label>
                                                    <input
                                                        type="date"
                                                        autoComplete="off"
                                                        name="from_date"
                                                        className="form-control"
                                                        value={filterForm.from_date}
                                                        onChange={handleFilterChange}
                                                    />
                                                    {validationErrors.from_date && <span className="text-danger">{validationErrors.from_date}</span>}
                                                </div>
                                            </div>

                                            {/* To Date */}
                                            <div className="col-sm-3 col-md-2 col-lg-2">
                                                <div className="form-group">
                                                    <label>Enquiry To Date<small className="req"> *</small></label>
                                                    <input
                                                        type="date"
                                                        autoComplete="off"
                                                        name="to_date"
                                                        className="form-control"
                                                        value={filterForm.to_date}
                                                        onChange={handleFilterChange}
                                                    />
                                                    {validationErrors.to_date && <span className="text-danger">{validationErrors.to_date}</span>}
                                                </div>
                                            </div>

                                            {/* Status */}
                                            <div className="col-sm-3 col-md-2 col-lg-2">
                                                <div className="form-group">
                                                    <label>Status</label>
                                                    <select
                                                        id="status"
                                                        name="status"
                                                        className="form-control"
                                                        value={filterForm.status}
                                                        onChange={handleFilterChange}
                                                    >
                                                        <option value="">Select</option>
                                                        <option value="all">All</option>
                                                        {Object.entries(enquiryStatus).map(([key, value]) => (
                                                            <option key={key} value={key}>{value}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Search Button */}
                                            <div className="col-sm-3 col-md-2 col-lg-2">
                                                <div className="form-group pl10">
                                                    <label className="displayblock opacity d-sm-none">&nbsp;</label>
                                                    <button
                                                        type="submit"
                                                        name="search"
                                                        className="btn btn-primary smallbtn28 btn-sm pull-right"
                                                        disabled={loading}
                                                    >
                                                        {loading ? (
                                                            <><i className="fa fa-spinner fa-spin"></i> Searching...</>
                                                        ) : (
                                                            <><i className="fa fa-search"></i> Search</>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>

                                    {/* Enquiry List Section */}
                                    <div className="ptt10">
                                        <div className="bordertop">
                                            <div className="box-header with-border">
                                                <h3 className="box-title titlefix">Admission Enquiry</h3>
                                                <div className="box-tools pull-right">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => setShowAddModal(true)}
                                                    >
                                                        <i className="fa fa-plus"></i> Add
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="box-body">
                                                <div className="download_label">Admission Enquiry List</div>

                                                {/* Controls: Export Buttons + Search */}
                                                <div className="row" style={{ marginBottom: '10px' }}>
                                                    <div className="col-md-6">
                                                        <div className="dt-buttons btn-group">
                                                            <button className="btn btn-default btn-sm" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }}>
                                                                <i className="fa fa-files-o"></i>
                                                            </button>
                                                            <button className="btn btn-default btn-sm" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'enquiry_list.csv'); }}>
                                                                <i className="fa fa-file-text-o"></i>
                                                            </button>
                                                            <button className="btn btn-default btn-sm" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'enquiry_list.xls'); }}>
                                                                <i className="fa fa-file-excel-o"></i>
                                                            </button>
                                                            <button className="btn btn-default btn-sm" title="PDF" onClick={() => { const { headers, rows } = getExportData(); downloadPDF(headers, rows, 'enquiry_list.pdf', 'Admission Enquiry List'); }}>
                                                                <i className="fa fa-file-pdf-o"></i>
                                                            </button>
                                                            <button className="btn btn-default btn-sm" title="Print" onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Admission Enquiry List'); }}>
                                                                <i className="fa fa-print"></i>
                                                            </button>
                                                            <div className="btn-group">
                                                                <button className="btn btn-default btn-sm" title="Columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}>
                                                                    <i className="fa fa-columns"></i>
                                                                </button>
                                                                {showColumnsDropdown && (
                                                                    <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 1000, background: '#fff', border: '1px solid #ccc', borderRadius: '4px', padding: '8px 10px', minWidth: '180px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
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
                                                    <div className="col-md-6">
                                                        <div className="input-group input-group-sm">
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Search..."
                                                                value={searchTerm}
                                                                onChange={(e) => {
                                                                    setSearchTerm(e.target.value);
                                                                    setCurrentPage(1);
                                                                }}
                                                            />
                                                            <span className="input-group-addon"><i className="fa fa-search"></i></span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mailbox-messages">
                                                    <div className="table-responsive overflow-visible-lg">
                                                        <table className="table table-hover table-striped table-bordered" id="enquirytable">
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
                                                                {finalFilteredEnquiries.length === 0 ? (
                                                                    <tr>
                                                                        <td colSpan={visibleColumns.size + 1} className="text-center">
                                                                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                                                                                <div style={{ color: 'red', fontFamily: 'Roboto-Bold', fontSize: '10px' }}>No data available in table</div>
                                                                                <img src="/images/addnewitem.svg" alt="No Data" style={{ marginBottom: 0, width: '150px' }} />
                                                                                <div style={{ color: 'green', fontFamily: 'Roboto-Bold', fontSize: '10px' }}>&lt;- Add new record or search with different criteria</div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ) : (
                                                                    currentEnquiries.map((enquiry) => (
                                                                        <tr key={enquiry.id} className={isOverdue(enquiry) ? 'danger' : ''}>
                                                                            {columns.map(col => visibleColumns.has(col.key) && (
                                                                                <td key={col.key} className="mailbox-name">{formatCell(enquiry, col.key)}</td>
                                                                            ))}
                                                                            <td className="mailbox-date text-right white-space-nowrap noExport">
                                                                                <a
                                                                                    className="btn btn-default btn-xs"
                                                                                    onClick={() => handleFollowUp(enquiry)}
                                                                                    title="Follow Up Admission Enquiry"
                                                                                    style={{ cursor: 'pointer' }}
                                                                                >
                                                                                    <i className="fa fa-phone"></i>
                                                                                </a>
                                                                                <a
                                                                                    className="btn btn-default btn-xs"
                                                                                    onClick={() => handleEdit(enquiry)}
                                                                                    title="Edit"
                                                                                    style={{ cursor: 'pointer' }}
                                                                                >
                                                                                    <i className="fa fa-pencil"></i>
                                                                                </a>
                                                                                <a
                                                                                    className="btn btn-default btn-xs"
                                                                                    onClick={() => handleDelete(enquiry.id)}
                                                                                    title="Delete"
                                                                                    style={{ cursor: 'pointer' }}
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
                                                </div>

                                                {/* Pagination Controls */}
                                                <div className="row">
                                                    <div className="col-md-5">
                                                        <div className="dataTables_info">
                                                            Records {totalItems === 0 ? 0 : indexOfFirstItem + 1} to {indexOfLastItem > totalItems ? totalItems : indexOfLastItem} of {totalItems}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-7">
                                                        <div className="dataTables_paginate paging_simple_numbers">
                                                            <ul className="pagination">
                                                                <li className={`paginate_button previous ${currentPage === 1 ? 'disabled' : ''}`}>
                                                                    <a href="#" onClick={(e) => { e.preventDefault(); handlePrevious(); }}>Previous</a>
                                                                </li>
                                                                {[...Array(totalPages)].map((_, i) => (
                                                                    <li key={i} className={`paginate_button ${currentPage === i + 1 ? 'active' : ''}`}>
                                                                        <a href="#" onClick={(e) => { e.preventDefault(); paginate(i + 1); }}>{i + 1}</a>
                                                                    </li>
                                                                ))}
                                                                <li className={`paginate_button next ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                                    <a href="#" onClick={(e) => { e.preventDefault(); handleNext(); }}>Next</a>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Add Enquiry Modal */}
                <AddEnquiryModal
                    show={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    classList={classList}
                    sourceList={sourceList}
                    staffList={staffList}
                    referenceList={referenceList}
                    onSuccess={() => {
                        setShowAddModal(false);
                        setFlashMessage('Enquiry added successfully');
                        fetchEnquiryList(); // Refresh list
                        setTimeout(() => setFlashMessage(''), 3000);
                    }}
                />

                {/* Edit Enquiry Modal */}
                <EditEnquiryModal
                    show={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    enquiry={selectedEnquiry}
                    classList={classList}
                    sourceList={sourceList}
                    staffList={staffList}
                    referenceList={referenceList}
                    onSuccess={() => {
                        setShowEditModal(false);
                        setFlashMessage('Enquiry updated successfully');
                        fetchEnquiryList(); // Refresh list
                        setTimeout(() => setFlashMessage(''), 3000);
                    }}
                />

                {/* Follow Up Modal */}
                <FollowUpModal
                    show={showFollowUpModal}
                    onClose={() => setShowFollowUpModal(false)}
                    enquiry={selectedEnquiry}
                    onSuccess={() => {
                        setShowFollowUpModal(false);
                        setFlashMessage('Follow up recorded successfully');
                        fetchEnquiryList(); // Refresh list
                        setTimeout(() => setFlashMessage(''), 3000);
                    }}
                />
            </div >
            <Footer />
        </div >
    );
};

export default EnquiryView;
