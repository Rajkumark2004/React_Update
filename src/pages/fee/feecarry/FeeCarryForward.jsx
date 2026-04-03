import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../../utils/include_files.js';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import { useSession } from '../../../context/SessionContext';
import { api } from '../../../services/api';
import { copyToClipboard, downloadCSV, downloadExcel, printTable } from '../../../utils/tableExport';
import toast from 'react-hot-toast';

const FeesForward = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

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
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Search & Pagination State
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage] = useState(100);

    // Column Visibility State
    const [visibleColumns, setVisibleColumns] = useState(new Set([
        'Student Name', 'Admission No', 'Admission Date', 'Roll Number', 'Father Name', 'Balance'
    ]));
    const [showColumnDropdown, setShowColumnDropdown] = useState(false);
    const columnDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (columnDropdownRef.current && !columnDropdownRef.current.contains(event.target)) {
                setShowColumnDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleColumnVisibility = (columnName) => {
        setVisibleColumns(prev => {
            const newSet = new Set(prev);
            if (newSet.has(columnName)) {
                newSet.delete(columnName);
            } else {
                newSet.add(columnName);
            }
            return newSet;
        });
    };

    const getExportData = () => {
        const headers = [];
        if (visibleColumns.has('Student Name')) headers.push('Student Name');
        if (visibleColumns.has('Admission No')) headers.push('Admission No');
        if (schSetting.admission_date && visibleColumns.has('Admission Date')) headers.push('Admission Date');
        if (schSetting.roll_no && visibleColumns.has('Roll Number')) headers.push('Roll Number');
        if (schSetting.father_name && visibleColumns.has('Father Name')) headers.push('Father Name');
        if (visibleColumns.has('Balance')) headers.push(`Balance`);

        const rows = (currentEntries || []).map(dueFee => {
            const rowData = [];
            const originalIndex = studentDueFee.findIndex(s => s.student_session_id === dueFee.student_session_id);
            const i = originalIndex + 1;

            if (visibleColumns.has('Student Name')) rowData.push(dueFee.name || '');
            if (visibleColumns.has('Admission No')) rowData.push(dueFee.admission_no || '');
            if (schSetting.admission_date && visibleColumns.has('Admission Date')) rowData.push(dueFee.admission_date || '');
            if (schSetting.roll_no && visibleColumns.has('Roll Number')) rowData.push(dueFee.roll_no || '');
            if (schSetting.father_name && visibleColumns.has('Father Name')) rowData.push(dueFee.father_name || '');
            if (visibleColumns.has('Balance')) {
                rowData.push(amounts[i] !== undefined ? amounts[i] : (formatCurrency(dueFee.balance) || ''));
            }
            return rowData;
        });

        return { headers, rows };
    };

    const handleExport = (type) => {
        const { headers, rows } = getExportData();
        if (type === 'copy') {
            copyToClipboard(headers, rows);
        } else if (type === 'excel') {
            downloadExcel(headers, rows, 'fees_carry_forward.xls');
        } else if (type === 'csv') {
            downloadCSV(headers, rows, 'fees_carry_forward.csv');
        } else if (type === 'pdf') {
            import('jspdf').then(({ default: jsPDF }) => {
                const doc = new jsPDF();
                doc.text("Fees Carry Forward List", 14, 15);
                let y = 25;
                headers.forEach((header, index) => {
                    doc.text(header, 14 + (index * 30), y);
                });
                y += 10;
                rows.forEach(row => {
                    row.forEach((cell, index) => {
                        doc.text((cell || '').toString(), 14 + (index * 30), y);
                    });
                    y += 10;
                    if (y > 280) {
                        doc.addPage();
                        y = 20;
                    }
                });
                doc.save("fees_carry_forward.pdf");
            });
        } else if (type === 'print') {
            printTable(headers, rows, 'Fees Carry Forward List');
        }
    };

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
            toast.error('Please select a class.');
            return;
        }

        if (!sectionId) {
            toast.error('Please select a section.');
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
            } else {
                toast.error(response.message || 'No records found or error occurred.');
                setStudentDueFee([]);
            }
        } catch (error) {
            console.error("Search error:", error);
            toast.error('Failed to fetch fees data.');
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
            toast.error('Due Date is missing.');
            return;
        }

        const studentsPayload = studentDueFee.map((student, index) => {
            const key = index + 1;
            const amount = amounts[key] !== undefined ? amounts[key] : parseFloat(student.balance).toFixed(2);

            return {
                student_session_id: student.student_session_id,
                amount: amount
            };
        });

        const payload = {
            due_date: dueDateFormatted,
            students: studentsPayload
        };

        setIsSaving(true);
        try {
            const response = await api.saveFeeCarryForward(payload);
            toast.success(response.message || 'Record Saved Successfully');
            setIsUpdate(true);
        } catch (error) {
            console.error("Save error:", error);
            toast.error(error.message || 'Failed to save fees.');
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
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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

            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                {/* Content Header (Page header) */}
                <section className="content-header" >
                    <h1>
                        <i className="fa fa-money"></i> Fees Collection
                    </h1>
                </section>

                {/* Main content */}
                <section className="content" style={{ marginTop: '0px' }}>
                    <div className="row">
                        <form id="feesforward" onSubmit={handleSearchSubmit} method="post" acceptCharset="utf-8">
                            <div className="col-md-12">
                                <div className="box box-primary">
                                    <div className="box-header with-border" style={isMobile ? { display: 'flex', alignItems: 'center', padding: '12px 15px' } : {}}>
                                        <h3 className="box-title" style={isMobile ? { margin: 0, fontSize: '18px' } : {}}><i className="fa fa-search"></i> Select Criteria</h3>
                                        <div className={isMobile ? "" : "btn-group pull-right"} style={isMobile ? { marginLeft: 'auto' } : {}}>
                                            <Link to="/studentfee" className="btn btn-primary btn-xs">
                                                <i className="fa fa-arrow-left"></i> Back
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="box-body">
                                        <div className="row">
                                            <div className="col-md-12">
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
                                                        {[...classList].reverse().map((cls) => (
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
                                                <div className="box-header with-border" style={isMobile ? { display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', textAlign: 'center', padding: '15px' } : {}}>
                                                    <h3 className="box-title titlefix" style={isMobile ? { margin: 0, fontSize: '18px' } : {}}>Previous Session Balance Fees</h3>
                                                    <div className={isMobile ? "" : "pull-right"}>
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
                                                    <div className="row mb-2" style={isMobile ? { marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' } : { marginBottom: '10px' }}>
                                                        <div className={isMobile ? "" : "col-sm-6"}>
                                                            <div className={isMobile ? "dataTables_filter" : "dataTables_filter pull-left"}>
                                                                <input
                                                                    type="search"
                                                                    className="form-control input-sm"
                                                                    placeholder="Search..."
                                                                    value={searchTerm}
                                                                    onChange={(e) => {
                                                                        setSearchTerm(e.target.value);
                                                                        setCurrentPage(1);
                                                                    }}
                                                                    style={{ 
                                                                        display: 'inline-block', 
                                                                        width: '180px', 
                                                                        border: 'none', 
                                                                        borderBottom: '1px solid #ccc', 
                                                                        borderRadius: '0', 
                                                                        boxShadow: 'none',
                                                                        backgroundColor: 'transparent',
                                                                        paddingLeft: '0',
                                                                        outline: 'none',
                                                                        textAlign: isMobile ? 'center' : 'left'
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className={isMobile ? "" : "col-sm-6"}>
                                                            <div className={isMobile ? "dt-buttons btn-group" : "pull-right dt-buttons btn-group"}>
                                                                <button type="button" className="btn btn-default btn-sm buttons-copy buttons-html5" title="Copy" onClick={() => handleExport('copy')} style={{ borderTopLeftRadius: '20px', borderBottomLeftRadius: '20px' }}><i className="fa fa-files-o"></i></button>
                                                                <button type="button" className="btn btn-default btn-sm buttons-excel buttons-html5" title="Excel" onClick={() => handleExport('excel')}><i className="fa fa-file-excel-o"></i></button>
                                                                <button type="button" className="btn btn-default btn-sm buttons-csv buttons-html5" title="CSV" onClick={() => handleExport('csv')}><i className="fa fa-file-text-o"></i></button>
                                                                <button type="button" className="btn btn-default btn-sm buttons-pdf buttons-html5" title="PDF" onClick={() => handleExport('pdf')}><i className="fa fa-file-pdf-o"></i></button>
                                                                <button type="button" className="btn btn-default btn-sm buttons-print" title="Print" onClick={() => handleExport('print')}><i className="fa fa-print"></i></button>
                                                                <div className="btn-group" ref={columnDropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
                                                                    <button type="button" className="btn btn-default btn-sm buttons-collection buttons-colvis" title="Columns" onClick={() => setShowColumnDropdown(!showColumnDropdown)} style={{ borderTopRightRadius: '20px', borderBottomRightRadius: '20px' }}>
                                                                        <i className="fa fa-columns"></i>
                                                                    </button>
                                                                    {showColumnDropdown && (
                                                                        <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 1000, background: '#fff', border: '1px solid #ccc', borderRadius: '4px', padding: '8px 10px', minWidth: '180px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                                                                            {['Student Name', 'Admission No', 'Admission Date', 'Roll Number', 'Father Name', 'Balance'].map(col => {
                                                                                // Only show options for schSetting enabled fields
                                                                                if (col === 'Admission Date' && !schSetting.admission_date) return null;
                                                                                if (col === 'Roll Number' && !schSetting.roll_no) return null;
                                                                                if (col === 'Father Name' && !schSetting.father_name) return null;

                                                                                return (
                                                                                    <label key={col} style={{ display: 'block', cursor: 'pointer', padding: '2px 0', fontSize: '13px', fontWeight: 'normal', whiteSpace: 'nowrap', textAlign: 'left' }}>
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            checked={visibleColumns.has(col)}
                                                                                            onChange={(e) => { e.stopPropagation(); toggleColumnVisibility(col); }}
                                                                                            style={{ marginRight: '6px' }}
                                                                                        />
                                                                                        {col}
                                                                                    </label>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {studentDueFee.length > 0 ? (
                                                        <>
                                                            <div className="table-responsive mailbox-messages" style={isMobile ? { overflowX: 'auto', WebkitOverflowScrolling: 'touch', display: 'block', width: '100%' } : { overflow: 'visible' }}>
                                                                <table id="fees-carry-forward-table" className="table table-striped table-bordered table-hover example" style={isMobile ? { minWidth: '800px', tableLayout: 'fixed' } : {}}>
                                                                    <thead>
                                                                        <tr>
                                                                            {visibleColumns.has('Student Name') && <th className="text text-left" style={isMobile ? { borderLeft: 'none', borderRight: 'none', fontSize: '12px', padding: '10px 4px', width: '180px' } : {}}>Student Name</th>}
                                                                            {visibleColumns.has('Admission No') && <th className="text text-left" style={isMobile ? { borderLeft: 'none', borderRight: 'none', fontSize: '12px', padding: '10px 4px', width: '140px' } : {}}>Adm No</th>}
                                                                            {schSetting.admission_date && visibleColumns.has('Admission Date') && (
                                                                                <th className="text text-left" style={isMobile ? { borderLeft: 'none', borderRight: 'none', fontSize: '12px', padding: '10px 4px', width: '120px' } : {}}>Adm Date</th>
                                                                            )}
                                                                            {schSetting.roll_no && visibleColumns.has('Roll Number') && (
                                                                                <th className="text text-left" style={isMobile ? { borderLeft: 'none', borderRight: 'none', fontSize: '12px', padding: '10px 4px', width: '100px' } : {}}>Roll No</th>
                                                                            )}
                                                                            {schSetting.father_name && visibleColumns.has('Father Name') && (
                                                                                <th className="text text-left" style={isMobile ? { borderLeft: 'none', borderRight: 'none', fontSize: '12px', padding: '10px 4px', width: '130px' } : {}}>Father Name</th>
                                                                            )}
                                                                            {visibleColumns.has('Balance') && (
                                                                                <th className="text-left" style={{ borderLeft: 'none', borderRight: 'none', fontSize: isMobile ? '12px' : 'inherit', padding: '10px 2px', paddingLeft: '12px !important', paddingRight: '4px !important', width: '150px', textAlign: 'left !important', background: 'none !important' }}>
                                                                                    Bal <span>({currencySymbol})</span>
                                                                                </th>
                                                                            )}
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {currentEntries.length === 0 ? (
                                                                            <tr>
                                                                                <td colSpan={visibleColumns.size} className="text-center">No matching records found</td>
                                                                            </tr>
                                                                        ) : (
                                                                            currentEntries.map((dueFee, index) => {
                                                                                // Calculate original index to sync with master state amounts
                                                                                const originalIndex = studentDueFee.findIndex(s => s.student_session_id === dueFee.student_session_id);
                                                                                const i = originalIndex + 1;

                                                                                return (                                                                                    <tr key={dueFee.student_session_id}>
                                                                                        {visibleColumns.has('Student Name') && (
                                                                                            <td style={isMobile ? { borderLeft: 'none', borderRight: 'none', verticalAlign: 'top', padding: '10px 4px', fontSize: '12px', wordBreak: 'break-word', width: '180px' } : {}}>
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
                                                                                        )}
                                                                                        {visibleColumns.has('Admission No') && <td style={isMobile ? { borderLeft: 'none', borderRight: 'none', verticalAlign: 'top', padding: '10px 4px', fontSize: '12px', wordBreak: 'break-word', width: '140px' } : {}}>{dueFee.admission_no}</td>}
                                                                                        {schSetting.admission_date && visibleColumns.has('Admission Date') && (
                                                                                            <td style={isMobile ? { borderLeft: 'none', borderRight: 'none', verticalAlign: 'top', padding: '10px 4px', fontSize: '12px', wordBreak: 'break-word', width: '120px' } : {}}>{dueFee.admission_date}</td>
                                                                                        )}
                                                                                        {schSetting.roll_no && visibleColumns.has('Roll Number') && (
                                                                                            <td style={isMobile ? { borderLeft: 'none', borderRight: 'none', verticalAlign: 'top', padding: '10px 4px', fontSize: '12px', wordBreak: 'break-word', width: '100px' } : {}}>{dueFee.roll_no}</td>
                                                                                        )}
                                                                                        {schSetting.father_name && visibleColumns.has('Father Name') && (
                                                                                            <td style={isMobile ? { borderLeft: 'none', borderRight: 'none', verticalAlign: 'top', padding: '10px 4px', fontSize: '12px', wordBreak: 'break-word', width: '130px' } : {}}>{dueFee.father_name}</td>
                                                                                        )}
                                                                                        {visibleColumns.has('Balance') && (
                                                                                             <td className="text text-left" style={{ borderLeft: 'none', borderRight: 'none', verticalAlign: 'top', padding: '10px 2px', paddingLeft: '12px !important', paddingRight: '4px !important', fontSize: isMobile ? '12px' : 'inherit', width: '150px', textAlign: 'left !important' }}>
                                                                                                <span className="hidden">
                                                                                                    {formatCurrency(dueFee.balance)}
                                                                                                </span>
                                                                                                <input
                                                                                                    type="text"
                                                                                                    name={`amount[${i}]`}
                                                                                                    className="form-control tddm200 text-left"
                                                                                                    value={amounts[i] || formatCurrency(dueFee.balance)}
                                                                                                    onChange={(e) => handleAmountChange(i, e.target.value)}
                                                                                                    style={{ width: '100%', fontSize: isMobile ? '12px' : 'inherit', padding: '2px 4px', paddingLeft: '4px !important', height: 'auto', display: 'inline-block', textAlign: 'left' }}
                                                                                                />
                                                                                            </td>
                                                                                        )}
                                                                                    </tr>

                                                                                );
                                                                            })
                                                                        )}
                                                                    </tbody>
                                                                </table>
                                                            </div>

                                                            {/* Pagination Info & Controls */}
                                                            {filteredStudents.length > 0 && (
                                                                <div className="row" style={isMobile ? { marginTop: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' } : { marginTop: '15px' }}>
                                                                    <div className={isMobile ? "text-center" : "col-sm-5"}>
                                                                        <div className="dataTables_info" role="status" aria-live="polite">
                                                                            Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredStudents.length)} of {filteredStudents.length} entries
                                                                        </div>
                                                                    </div>
                                                                    <div className={isMobile ? "text-center" : "col-sm-7"}>
                                                                        <div className={isMobile ? "dataTables_paginate paging_simple_numbers" : "dataTables_paginate paging_simple_numbers pull-right"}>
                                                                            <ul className="pagination" style={{ margin: 0 }}>
                                                                                <li className={`paginate_button previous ${currentPage === 1 ? 'disabled' : ''}`}>
                                                                                    <a href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1); }}><i className="fa fa-angle-left"></i></a>
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
                                                                                    <a href="#" onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(currentPage + 1); }}><i className="fa fa-angle-right"></i></a>
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
