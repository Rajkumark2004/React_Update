import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../../utils/include_files.js';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import { useSession } from '../../../context/SessionContext';
import { api } from '../../../services/api';

const FeesForward = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    // Currency Symbol
    const currencySymbol = '₹';

    // Stats/Session info
    const sessionYear = currentSession?.session || '2024-25';
    const appName = 'School Management System';

    // Mock User Data
    const [loggedInUser, setLoggedInUser] = useState(null);
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setLoggedInUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse user data:', e);
            }
        }
    }, []);

    const userData = loggedInUser ? {
        name: loggedInUser.username,
        role: Object.keys(loggedInUser.roles || {})[0] || 'User',
        id: loggedInUser.id,
        avatar: loggedInUser.image || '/uploads/staff_images/default_male.jpg'
    } : {
        name: 'Admin User',
        role: 'Super Admin',
        id: 1,
        avatar: '/uploads/staff_images/default_male.jpg'
    };

    const pendingTasks = [];

    // School Settings (mock or fetched if available)
    const schSetting = {
        admission_date: true,
        roll_no: true,
        father_name: true
    };

    // State for Classes and Sections
    const [classList, setClassList] = useState([]);
    const [sections, setSections] = useState([]);

    // Form State
    const [classId, setClassId] = useState('');
    const [sectionId, setSectionId] = useState('');
    const [studentDueFee, setStudentDueFee] = useState(null);
    const [isUpdate, setIsUpdate] = useState(false);
    const [dueDateFormatted, setDueDateFormatted] = useState('');
    const [amounts, setAmounts] = useState({});
    const [flashMessage, setFlashMessage] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Search & Pagination State
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage] = useState(100);

    // Initial Fetch (Classes)
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await api.getClasses();
                if (response && response.status === 'success' && response.classsectionlist) {
                    setClassList(response.classsectionlist);
                }
            } catch (error) {
                console.error("Error fetching classes:", error);
            }
        };
        fetchClasses();
    }, []);

    // Handle class change - fetch sections
    const handleClassChange = async (e) => {
        const selectedClassId = e.target.value;
        setClassId(selectedClassId);
        setSectionId('');
        setStudentDueFee(null);
        setSections([]);

        if (selectedClassId) {
            try {
                const response = await api.getSectionsByClass(selectedClassId);
                if (response && response.data) {
                    setSections(response.data);
                } else if (response && Array.isArray(response)) {
                    setSections(response);
                }
            } catch (error) {
                console.error("Error fetching sections:", error);
            }
        }
    };

    // Handle section change
    const handleSectionChange = (e) => {
        setSectionId(e.target.value);
        setStudentDueFee(null);
    };

    // Handle search
    const handleSearchSubmit = async (e) => {
        e.preventDefault();

        if (!classId) {
            setFlashMessage({ type: 'danger', message: 'Please select a class.' });
            return;
        }

        if (!sectionId) {
            setFlashMessage({ type: 'danger', message: 'Please select a section.' });
            return;
        }

        setIsLoading(true);
        setStudentDueFee(null);

        try {
            const response = await api.searchFeeCarryForward(classId, sectionId);

            if (response.status && response.data) {
                const { student_due_fee, is_update, due_date } = response.data;

                setStudentDueFee(student_due_fee || []);
                setIsUpdate(is_update);
                setDueDateFormatted(due_date);

                // Initialize amounts
                const initialAmounts = {};
                if (student_due_fee) {
                    student_due_fee.forEach((student, index) => {
                        initialAmounts[index + 1] = parseFloat(student.balance).toFixed(2);
                    });
                }
                setAmounts(initialAmounts);
                setFlashMessage(null);
            } else {
                setFlashMessage({ type: 'danger', message: response.message || 'No records found or error occurred.' });
                setStudentDueFee([]);
            }
        } catch (error) {
            console.error("Search error:", error);
            setFlashMessage({ type: 'danger', message: 'Failed to fetch fees data.' });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle amount change
    const handleAmountChange = (index, value) => {
        setAmounts(prev => ({
            ...prev,
            [index]: value
        }));
    };

    // Handle save
    const handleSave = async (e) => {
        e.preventDefault();

        if (!dueDateFormatted) {
            setFlashMessage({ type: 'danger', message: 'Due Date is missing.' });
            return;
        }

        // map amounts to students
        // The payload only needs the list of students with their amounts
        // We should iterate over ALL loaded students (studentDueFee), not just the filtered ones/current page,
        // because usually this operation applies to the whole set unless specified otherwise.
        // However, the user might want to save edits.

        // Construct payload
        const studentsPayload = studentDueFee.map((student, index) => {
            // Find updated amount if any, otherwise default to current balance
            // Note: index in studentDueFee is 0-based.
            // amounts keys were set as index+1 in handleSearchSubmit
            const key = index + 1;
            const amount = amounts[key] !== undefined ? amounts[key] : parseFloat(student.balance).toFixed(2);

            return {
                student_session_id: student.student_session_id,
                amount: amount
            };
        });

        const payload = {
            due_date: dueDateFormatted, // Format 'YYYY-MM-DD' is expected? The API response gave '2026-01-24' (DD-MM-YYYY?)
            // Wait, the API response for search gave "due_date": "2026-01-24".
            // The API request for save expects "due_date": "2026-03-25".
            // So if input `dueDateFormatted` is already YYYY-MM-DD, we are good.
            students: studentsPayload
        };

        setIsSaving(true);
        try {
            const response = await api.saveFeeCarryForward(payload);
            setFlashMessage({ type: 'success', message: response.message || 'Record Saved Successfully' });
            setIsUpdate(true);
        } catch (error) {
            console.error("Save error:", error);
            setFlashMessage({ type: 'danger', message: error.message || 'Failed to save fees.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        clearSession();
        navigate('/login');
    };

    const handleSidebarSearch = (e) => {
        e.preventDefault();
        console.log('Searching...');
    };

    // Format currency
    const formatCurrency = (amount) => {
        return parseFloat(amount || 0).toFixed(2);
    };

    // --- Pagination & Filtering Logic ---
    const filteredStudents = (studentDueFee || []).filter(student =>
        (student.name && student.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.admission_no && student.admission_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.roll_no && String(student.roll_no).toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.father_name && student.father_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = filteredStudents.slice(indexOfFirstEntry, indexOfLastEntry);
    const totalPages = Math.ceil(filteredStudents.length / entriesPerPage);

    return (
        <div className="wrapper">
            <Header
                appName={appName}
                userData={userData}
                pendingTasks={pendingTasks}
                handleLogout={handleLogout}
            />

            <Sidebar
                handleSearch={handleSidebarSearch}
                sessionYear={sessionYear}
                currentUrl="/admin/feesforward"
            />

            <div className="content-wrapper" style={{ minHeight: '710px' }}>
                {/* Content Header (Page header) */}
                <section className="content-header" >
                    <h1>
                        <i className="fa fa-money"></i> Fees Collection
                    </h1>
                </section>

                {/* Main content */}
                <section className="content" style={{ marginTop: '18px' }}>
                    <div className="row">
                        <form id="feesforward" onSubmit={handleSearchSubmit} method="post" acceptCharset="utf-8">
                            <div className="col-md-12">
                                <div className="box box-primary">
                                    <div className="box-header with-border">
                                        <h3 className="box-title"><i className="fa fa-search"></i> Select Criteria</h3>
                                        <div className="btn-group pull-right">
                                            <Link to="/studentfee" className="btn btn-primary btn-xs">
                                                <i className="fa fa-arrow-left"></i> Back
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="box-body">
                                        <div className="row">
                                            <div className="col-md-12">
                                                {flashMessage && (
                                                    <div className={`alert alert-${flashMessage.type}`}>
                                                        {flashMessage.message}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label htmlFor="class_id">Class</label><small className="req"> *</small>
                                                    <select
                                                        id="class_id"
                                                        name="class_id"
                                                        className="form-control"
                                                        value={classId}
                                                        onChange={handleClassChange}
                                                    >
                                                        <option value="">Select</option>
                                                        {classList.map((cls) => (
                                                            <option key={cls.id} value={cls.id}>
                                                                {cls.class}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label htmlFor="section_id">Section</label><small className="req"> *</small>
                                                    <select
                                                        id="section_id"
                                                        name="section_id"
                                                        className={`form-control ${isLoading && !studentDueFee ? 'dropdownloading' : ''}`}
                                                        value={sectionId}
                                                        onChange={handleSectionChange}
                                                    >
                                                        <option value="">Select</option>
                                                        {sections.map((section) => (
                                                            <option key={section.section_id || section.id} value={section.section_id || section.id}>
                                                                {section.section}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="">
                                            <button
                                                type="submit"
                                                name="action"
                                                value="search"
                                                className="btn btn-primary pull-right"
                                                disabled={isLoading}
                                            >
                                                {isLoading && !studentDueFee ? <i className="fa fa-spinner fa-spin"></i> : 'Search'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Student Due Fee Section */}
                                    {studentDueFee !== null && (
                                        <>
                                            <div className="box-header ptbnull"></div>
                                            <div className="">
                                                <div className="box-header with-border">
                                                    <h3 className="box-title titlefix">Previous Session Balance Fees</h3>
                                                    <div className="pull-right">
                                                        <div className="form-group mb0">
                                                            <span className="text text-danger pt6 bolds">Due Date:</span> {dueDateFormatted}
                                                            <input
                                                                id="due_date"
                                                                name="due_date"
                                                                placeholder=""
                                                                type="hidden"
                                                                className="form-control date"
                                                                value={dueDateFormatted}
                                                                readOnly
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="box-body">
                                                    {isUpdate && (
                                                        <div className="alert alert-info">
                                                            Previous Balance Already Forwarded
                                                        </div>
                                                    )}

                                                    {/* DataTables Controls */}
                                                    <div className="row mb-2" style={{ marginBottom: '10px' }}>
                                                        <div className="col-sm-6">
                                                            <div className="dataTables_filter pull-left">
                                                                <label>Search:<input
                                                                    type="search"
                                                                    className="form-control input-sm"
                                                                    placeholder=""
                                                                    value={searchTerm}
                                                                    onChange={(e) => {
                                                                        setSearchTerm(e.target.value);
                                                                        setCurrentPage(1);
                                                                    }}
                                                                    style={{ display: 'inline-block', width: 'auto', marginLeft: '0.5em' }}
                                                                /></label>
                                                            </div>
                                                        </div>
                                                        <div className="col-sm-6">
                                                            <div className="pull-right dt-buttons btn-group">
                                                                <button type="button" className="btn btn-default btn-sm buttons-copy buttons-html5" title="Copy"><i className="fa fa-files-o"></i></button>
                                                                <button type="button" className="btn btn-default btn-sm buttons-excel buttons-html5" title="Excel"><i className="fa fa-file-excel-o"></i></button>
                                                                <button type="button" className="btn btn-default btn-sm buttons-csv buttons-html5" title="CSV"><i className="fa fa-file-text-o"></i></button>
                                                                <button type="button" className="btn btn-default btn-sm buttons-pdf buttons-html5" title="PDF"><i className="fa fa-file-pdf-o"></i></button>
                                                                <button type="button" className="btn btn-default btn-sm buttons-print" title="Print"><i className="fa fa-print"></i></button>
                                                                <button type="button" className="btn btn-default btn-sm buttons-collection buttons-colvis" title="Columns"><i className="fa fa-columns"></i></button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {studentDueFee.length > 0 ? (
                                                        <>
                                                            <div className="table-responsive">
                                                                <table className="table table-striped table-bordered table-hover example">
                                                                    <thead>
                                                                        <tr>
                                                                            <th className="text text-left">Student Name</th>
                                                                            <th className="text text-left">Admission No</th>
                                                                            {schSetting.admission_date && (
                                                                                <th className="text text-left">Admission Date</th>
                                                                            )}
                                                                            {schSetting.roll_no && (
                                                                                <th className="text text-left">Roll Number</th>
                                                                            )}
                                                                            {schSetting.father_name && (
                                                                                <th className="text text-left">Father Name</th>
                                                                            )}
                                                                            <th className="text-right">
                                                                                Balance <span>({currencySymbol})</span>
                                                                            </th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {currentEntries.length === 0 ? (
                                                                            <tr>
                                                                                <td colSpan="6" className="text-center">No matching records found</td>
                                                                            </tr>
                                                                        ) : (
                                                                            currentEntries.map((dueFee, index) => {
                                                                                // Calculate original index to sync with master state amounts
                                                                                const originalIndex = studentDueFee.findIndex(s => s.student_session_id === dueFee.student_session_id);
                                                                                const i = originalIndex + 1;

                                                                                return (
                                                                                    <tr key={dueFee.student_session_id}>
                                                                                        <td>
                                                                                            <input
                                                                                                type="hidden"
                                                                                                name="student_counter[]"
                                                                                                value={i}
                                                                                            />
                                                                                            <input
                                                                                                type="hidden"
                                                                                                name={`student_sesion[${i}]`}
                                                                                                value={dueFee.student_session_id}
                                                                                            />
                                                                                            {dueFee.name}
                                                                                        </td>
                                                                                        <td>{dueFee.admission_no}</td>
                                                                                        {schSetting.admission_date && (
                                                                                            <td>{dueFee.admission_date}</td>
                                                                                        )}
                                                                                        {schSetting.roll_no && (
                                                                                            <td>{dueFee.roll_no}</td>
                                                                                        )}
                                                                                        {schSetting.father_name && (
                                                                                            <td>{dueFee.father_name}</td>
                                                                                        )}
                                                                                        <td className="text text-right">
                                                                                            <span className="hidden">
                                                                                                {formatCurrency(dueFee.balance)}
                                                                                            </span>
                                                                                            <input
                                                                                                type="text"
                                                                                                name={`amount[${i}]`}
                                                                                                className="form-control tddm200"
                                                                                                value={amounts[i] || formatCurrency(dueFee.balance)}
                                                                                                onChange={(e) => handleAmountChange(i, e.target.value)}
                                                                                                style={{ width: '200px', display: 'inline-block' }}
                                                                                            />
                                                                                        </td>
                                                                                    </tr>
                                                                                );
                                                                            })
                                                                        )}
                                                                    </tbody>
                                                                </table>
                                                            </div>

                                                            {/* Pagination Info & Controls */}
                                                            {filteredStudents.length > 0 && (
                                                                <div className="row">
                                                                    <div className="col-sm-5">
                                                                        <div className="dataTables_info" role="status" aria-live="polite">
                                                                            Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredStudents.length)} of {filteredStudents.length} entries
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-sm-7">
                                                                        <div className="dataTables_paginate paging_simple_numbers" style={{ textAlign: 'right' }}>
                                                                            <ul className="pagination">
                                                                                <li className={`paginate_button previous ${currentPage === 1 ? 'disabled' : ''}`}>
                                                                                    <a href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1); }}>Previous</a>
                                                                                </li>
                                                                                {[...Array(totalPages)].map((_, i) => {
                                                                                    if (totalPages > 10 && Math.abs(currentPage - (i + 1)) > 4 && i !== 0 && i !== totalPages - 1) {
                                                                                        if (Math.abs(currentPage - (i + 1)) === 5) return <li key={i} className="paginate_button disabled"><a href="#">...</a></li>;
                                                                                        return null;
                                                                                    }
                                                                                    return (
                                                                                        <li key={i} className={`paginate_button ${currentPage === i + 1 ? 'active' : ''}`}>
                                                                                            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}>{i + 1}</a>
                                                                                        </li>
                                                                                    );
                                                                                })}
                                                                                <li className={`paginate_button next ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                                                                                    <a href="#" onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(currentPage + 1); }}>Next</a>
                                                                                </li>
                                                                            </ul>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="row">
                                                                <div className="box-footer">
                                                                    <button
                                                                        type="button"
                                                                        name="action"
                                                                        value="fee_submit"
                                                                        className="btn btn-primary pull-right"
                                                                        onClick={handleSave}
                                                                        disabled={isSaving}
                                                                    >
                                                                        {isSaving ? <i className="fa fa-spinner fa-spin"></i> : 'Save'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="alert alert-info">
                                                            No Record Found
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default FeesForward;
