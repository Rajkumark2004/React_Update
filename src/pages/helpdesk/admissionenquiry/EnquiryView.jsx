import React, { useState, useEffect } from 'react';
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
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [flashMessage, setFlashMessage] = useState('');
    const [error, setError] = useState('');

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showFollowUpModal, setShowFollowUpModal] = useState(false);
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Status options
    const enquiryStatus = {
        'active': 'Active',
        'passive': 'Passive',
        'dead': 'Dead',
        'won': 'Won',
        'lost': 'Lost'
    };

    // Use sorting hook
    const { sortedData: sortedEnquiries, requestSort: handleSort, getSortIcon } = useTableSort(enquiryList);

    // Fetch enquiry list from API
    const fetchEnquiryList = async () => {
        try {
            setError('');
            setLoading(true);
            // Fetch ALL data initially (pass empty filters to get everything)
            const response = await api.getEnquiryList({});
            console.log('Enquiry API Response:', response);

            // Handle different response formats and ensure array
            // API returns: { status: true, data: { enquiry_list: [...], class_list: [...], sourcelist: [...] } }
            let enquiries = [];
            if (response && response.data && Array.isArray(response.data.enquiry_list)) {
                // Main format: response.data.enquiry_list
                enquiries = response.data.enquiry_list;

                // Set class list from same response if not already set or refreshing
                if (Array.isArray(response.data.class_list)) {
                    console.log('Setting classList from API:', response.data.class_list);
                    setClassList(response.data.class_list);
                }

                // Set source list (API uses 'sourcelist')
                if (Array.isArray(response.data.sourcelist)) {
                    console.log('Setting sourceList from API:', response.data.sourcelist);
                    setSourceList(response.data.sourcelist);
                }
            } else if (response && Array.isArray(response.data)) {
                enquiries = response.data;
            } else if (response && Array.isArray(response.enquiry_list)) {
                enquiries = response.enquiry_list;
            } else if (Array.isArray(response)) {
                enquiries = response;
            }

            console.log('Setting enquiryList to:', enquiries);
            setMasterEnquiryList(enquiries); // Save to master list
            setEnquiryList(enquiries);       // Initial display is full list
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
        fetchEnquiryList();
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
        console.log('Search with filters (Internal):', filterForm);
        setLoading(true); // Show loader briefly for UX
        const results = filterEnquiries(masterEnquiryList, filterForm);
        setEnquiryList(results);
        setCurrentPage(1); // Reset to first page
        setLoading(false);
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

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEnquiries = sortedEnquiries.slice(indexOfFirstItem, indexOfLastItem);
    const totalItems = sortedEnquiries.length;
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
                        <i className="fa fa-ioxhost"></i> Front Office
                    </h1>
                </section>

                {/* Main Content */}
                <section className="content">
                    <div className="row">
                        {/* Left Sidebar - Front Office Menu */}
                        <div className="col-md-2">
                            <div className="box border0">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Front Office</h3>
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
                                                <div className="mailbox-messages">
                                                    <div className="table-responsive overflow-visible-lg">
                                                        <table className="table table-hover table-striped table-bordered" id="enquirytable">
                                                            <thead>
                                                                <tr>
                                                                    <th className="sorting" style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                                                                        Name {getSortIcon('name')}
                                                                    </th>
                                                                    <th>Phone</th>
                                                                    <th>Source</th>
                                                                    <th className="sorting" style={{ cursor: 'pointer' }} onClick={() => handleSort('classname')}>
                                                                        Class {getSortIcon('classname')}
                                                                    </th>
                                                                    <th className="sorting" style={{ cursor: 'pointer' }} onClick={() => handleSort('date')}>
                                                                        Enquiry Date {getSortIcon('date')}
                                                                    </th>
                                                                    <th className="sorting" style={{ cursor: 'pointer' }} onClick={() => handleSort('followupdate')}>
                                                                        Last Follow Up Date {getSortIcon('followupdate')}
                                                                    </th>
                                                                    <th className="sorting" style={{ cursor: 'pointer' }} onClick={() => handleSort('follow_up_date')}>
                                                                        Next Follow Up Date {getSortIcon('follow_up_date')}
                                                                    </th>
                                                                    <th className="sorting" style={{ cursor: 'pointer' }} onClick={() => handleSort('status')}>
                                                                        Status {getSortIcon('status')}
                                                                    </th>
                                                                    <th className="text-right noExport1">Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {sortedEnquiries.length === 0 ? (
                                                                    <tr>
                                                                        <td colSpan="8" className="text-center">
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
                                                                            <td className="mailbox-name">{enquiry.name}</td>
                                                                            <td className="mailbox-name">{enquiry.contact}</td>
                                                                            <td className="mailbox-name">{enquiry.source}</td>
                                                                            <td className="mailbox-name">{enquiry.classname}</td>
                                                                            <td className="mailbox-name">{formatDate(enquiry.date)}</td>
                                                                            <td className="mailbox-name">{formatDate(enquiry.followupdate)}</td>
                                                                            <td className="mailbox-name">{formatDate(enquiry.follow_up_date)}</td>
                                                                            <td>{enquiryStatus[enquiry.status] || enquiry.status}</td>
                                                                            <td className="mailbox-date text-right white-space-nowrap">
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
