import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import { api } from '../../../services/api';
import { useSession } from '../../../context/SessionContext';
import toast from 'react-hot-toast';
import Loader from '../../../components/Loader';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable, buildExportData } from '../../../utils/tableExport';
import '../../../utils/include_files';

const amountFormat = (amount) => {
    return parseFloat(amount || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

const StudentFeeSearch = () => {
    // Session from context
    const { currentSession } = useSession();
    const sessionYear = currentSession?.session || '2024-25';
    const appName = 'School Management System';

    // Column definitions
    const columns = [
        { key: 'class', label: 'Class', minWidth: '60px', maxWidth: '100px' },
        { key: 'section', label: 'Section', minWidth: '70px', maxWidth: '110px' },
        { key: 'admission_no', label: 'Admission No', minWidth: '110px', maxWidth: '150px' },
        { key: 'student_name', label: 'Student Name', minWidth: '150px', maxWidth: '200px' },
        { key: 'father_name', label: 'Father Name', minWidth: '150px', maxWidth: '200px' },
        { key: 'dob', label: 'Date Of Birth', minWidth: '100px', maxWidth: '120px' },
        { key: 'mobileno', label: 'Phone', minWidth: '100px', maxWidth: '130px' }
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
        if (key === 'class') return row.class_section || row.class;
        if (key === 'student_name') return row.full_name || `${row.firstname || ''} ${row.lastname || ''}`.trim();
        if (key === 'mobileno') return row.mobileno || row.mobile_no;
        return row[key];
    };

    const getExportData = () => buildExportData(columns, visibleColumns, students, formatCell);

    // Stats State (Mock Data based on PHP logic)
    const [stats, setStats] = useState({
        cash: 0,
        card: 0,
        upi: 0,
        total: 0
    });

    // Form State
    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [formData, setFormData] = useState({
        class_id: '',
        section_id: '',
        search_text: ''
    });

    // Student List State
    const [students, setStudents] = useState([]);
    const [csvFile, setCsvFile] = useState(null);
    const [loading, setLoading] = useState(false);

    // Pagination & local search state
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);
    const [localSearch, setLocalSearch] = useState('');
    const [importing, setImporting] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Fetch Classes and Stats on Mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Today's Collection Stats and Class List from studentfee API
                const response = await api.getStudentFeeIndex();

                // Populate Class List
                if (response && response.classlist && Array.isArray(response.classlist)) {
                    setClassList(response.classlist);
                }

                // Populate Stats
                if (response && response.fees_data && Array.isArray(response.fees_data)) {
                    const newStats = {
                        cash: 0,
                        card: 0,
                        upi: 0,
                        total: 0
                    };

                    response.fees_data.forEach(item => {
                        const amount = parseFloat(item.total_amount || 0);
                        const mode = (item.mode || '').toLowerCase();

                        // Map modes to stats keys
                        if (mode === 'cash') newStats.cash += amount;
                        else if (mode === 'card') newStats.card += amount;
                        else if (mode === 'upi') newStats.upi += amount;
                        // total is handled below

                        newStats.total += amount;
                    });

                    // Format to 2 decimals
                    setStats({
                        cash: amountFormat(newStats.cash),
                        card: amountFormat(newStats.card),
                        upi: amountFormat(newStats.upi),
                        total: amountFormat(newStats.total)
                    });
                }
            } catch (err) {
                console.error("Error fetching initial data", err);
            } finally {
                setInitialLoading(false);
            }
        };
        fetchData();
    }, []);

    // Initialize Dropify
    useEffect(() => {
        const timer = setTimeout(() => {
            try {
                const $ = window.jQuery;
                if ($ && $.fn && typeof $.fn.dropify === 'function') {
                    const drEvent = $('.dropify').dropify();
                    drEvent.on('change', function (event, element) {
                        // The native onChange on the input usually handles state, 
                        // but if not we could manually setCsvFile here.
                    });
                }
            } catch (error) {
                console.error('Dropify initialization error:', error);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [initialLoading]);

    const handleClassChange = async (e) => {
        const classId = e.target.value;
        setFormData(prev => ({ ...prev, class_id: classId, section_id: '' }));
        setSectionList([]);

        if (classId) {
            try {
                const res = await api.getSectionsByClass(classId);
                if (res && res.data) {
                    setSectionList(res.data);
                } else if (res && Array.isArray(res)) {
                    setSectionList(res);
                }
            } catch (err) {
                console.error('Error fetching sections by class:', err);
            }
        }
    };

    const handleSearch = async (e, type) => {
        if (e) e.preventDefault();

        // Validation for class_search
        if (type !== 'keyword' && !formData.class_id) {
            toast.error('Please Select Class');
            return;
        }

        setLoading(true);

        try {
            // Both searches use /studentfee/search endpoint
            // search_type: 'class_search' for class/section filter
            // search_type: 'keyword_search' for keyword search
            const payload = {
                search_type: type === 'keyword' ? 'keyword_search' : 'class_search',
                class_id: formData.class_id ? parseInt(formData.class_id) : '',
                section_id: formData.section_id ? parseInt(formData.section_id) : '',
                search_text: formData.search_text || ''
            };

            console.log('Search Payload:', payload);
            const data = await api.studentFeeSearch(payload);

            console.log('Search Response:', data);

            // Transform data if necessary
            let studentsData = [];
            if (data.status === true || data.status === 'success') {
                if (data.data && Array.isArray(data.data)) {
                    studentsData = data.data;
                } else if (data.students && Array.isArray(data.students)) {
                    studentsData = data.students;
                } else if (Array.isArray(data)) {
                    studentsData = data;
                }
            } else if (data.data && Array.isArray(data.data)) {
                studentsData = data.data;
            } else if (Array.isArray(data)) {
                studentsData = data;
            }

            setStudents(studentsData);
            setCurrentPage(1);

            if (studentsData.length === 0) {
                toast.error('No students found');
            }

        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch students");
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        if (!csvFile) {
            toast.error('Please select a CSV file first');
            return;
        }

        try {
            setImporting(true);
            const fd = new FormData();
            fd.append('file', csvFile);

            const response = await api.importStudentFeePayments(fd);
            if (response.status === true || response.status === 'success') {
                toast.success(response.message || 'Payments imported successfully');
                setCsvFile(null);
                // Clear Dropify
                try {
                    const $ = window.jQuery;
                    $('.dropify').data('dropify').resetPreview();
                    $('.dropify').data('dropify').clearElement();
                } catch (e) { }
            } else {
                toast.error(response.message || 'Import failed. Please check the file format.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Import error. Please try again.');
        } finally {
            setImporting(false);
        }
    };

    const handleDownloadSample = async () => {
        try {
            setDownloading(true);
            await api.exportPaymentSample();
            toast.success('Sample file downloaded');
        } catch (error) {
            console.error(error);
            toast.error('Failed to download sample file');
        } finally {
            setDownloading(false);
        }
    };

    // Helper for currency format
    const currencySymbol = "₹"; // Mock or fetch from settings

    // Pagination Logic
    const filteredStudents = students.filter(student => {
        if (!localSearch) return true;
        const searchLower = localSearch.toLowerCase();
        return columns.some(col => {
            const val = formatCell(student, col.key);
            return val && String(val).toLowerCase().includes(searchLower);
        });
    });

    const currentTotal = filteredStudents.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? currentTotal || 1 : recordsPerPage;
    const totalPages = Math.ceil(currentTotal / safeRecordsPerPage);
    const indexOfLastRecord = currentPage * safeRecordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - safeRecordsPerPage;
    const currentRecords = filteredStudents.slice(indexOfFirstRecord, indexOfLastRecord);

    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    return (
        <div className="wrapper theme-white-skin">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '850px' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-money"></i> Fees Collection
                    </h1>
                </section>

                <section className="content">
                    <div className="row">
                        {/* Sidebar Menu Column */}
                        <div className="col-md-2">
                            <div className="box border0">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Fees Collection</h3>
                                </div>
                                <ul className="tablists">
                                    <li>
                                        <Link to="/studentfee" className="active">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/fees/cf.png" alt="icon1" className="img-fluid" style={{ width: '20px' }} /> Collect Fees
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/studentfee/searchpayment">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/fees/sfp.png" alt="icon2" className="img-fluid" style={{ width: '20px' }} /> Search Fees Payment
                                        </Link>
                                    </li>
                                    {/*} <li>
                                        <Link to="/studentfee/feesearch">
                                            <img src="/images/sdf.png" alt="icon3" className="img-fluid" style={{ width: '20px' }} /> Search Due Fees
                                        </Link>
                                    </li>*/}
                                    <li>
                                        <Link to="/admin/feemaster">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/fees/fm.png" alt="icon4" className="img-fluid" style={{ width: '20px' }} /> Fees Master
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/feegroup">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/fees/fg.png" alt="icon5" className="img-fluid" style={{ width: '20px' }} /> Fees Group
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/feetype">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/fees/ft.png" alt="icon6" className="img-fluid" style={{ width: '20px' }} /> Fees Type
                                        </Link>
                                    </li>
                                    {/* <li>
                                        <Link to="/admin/feediscount">
                                            <img src="/images/fd.png" alt="icon7" className="img-fluid" style={{ width: '20px' }} /> Fees Discount
                                        </Link>
                                    </li>*/}
                                    <li>
                                        <Link to="/admin/feesforward">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/fees/fcf.png" alt="icon7" className="img-fluid" style={{ width: '20px' }} /> Fees Carry Forward
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/feereminder/setting">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/fees/fr.png" alt="icon7" className="img-fluid" style={{ width: '20px' }} /> Fees Reminder
                                        </Link>
                                    </li>
                                    {/*} <li>
                                        <Link to="/admin/bankdetails">
                                            <img src="/images/cf.png" alt="icon1" className="img-fluid" style={{ width: '20px' }} /> Bank Details
                                        </Link>
                                    </li>*/}
                                    <li>
                                        <Link to="/admin/feesreceipt/feesreceipt_24">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/fees/fr24.png" alt="icon7" className="img-fluid" style={{ width: '20px' }} /> Fees Receipt 24
                                        </Link>
                                    </li>
                                    {/*} <li>
                                        <Link to="/admin/feediscount_report">
                                            <img src="/images/fd.png" alt="icon7" className="img-fluid" style={{ width: '20px' }} /> Fees Discount Report
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/feesreceipt/studentfee_challan">
                                            <img src="/images/cf.png" alt="icon1" className="img-fluid" style={{ width: '20px' }} /> Student Challan
                                        </Link>
                                    </li>
                                    */}
                                </ul>
                            </div>
                        </div>

                        {/* Main Content Column */}
                        <div className="col-md-10">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">
                                        <i className="fa fa-users"></i> Today's Collection
                                    </h3>
                                    <div className="box-tools pull-right"></div>
                                </div>
                                <div className="box-body">
                                    <div className="row">
                                        <div className="col-md-3">
                                            <div className="cb9854 info-box">
                                                <a href="#">
                                                    <span className="back-none info-box-icon">
                                                        <img className="width25 img-fluid" src="https://newlayout.wisibles.com/backend/images/sidebar/22/18.png" alt="Cash" />
                                                    </span>
                                                    <div className="info-box-content">
                                                        <span className="info-box-text font-weight-bold">Cash</span>
                                                        <span className="info-box-number">{currencySymbol} {stats.cash}</span>
                                                    </div>
                                                </a>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="cb9854 info-box">
                                                <a href="#">
                                                    <span className="back-none info-box-icon">
                                                        <img className="width25 img-fluid" src="https://newlayout.wisibles.com/backend/images/sidebar/22/20.png" alt="Card" />
                                                    </span>
                                                    <div className="info-box-content">
                                                        <span className="info-box-text font-weight-bold">Card</span>
                                                        <span className="info-box-number">{currencySymbol} {stats.card}</span>
                                                    </div>
                                                </a>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="cb9854 info-box">
                                                <a href="#">
                                                    <span className="back-none info-box-icon">
                                                        <img className="width25 img-fluid" src="https://newlayout.wisibles.com/backend/images/sidebar/22/21.png" alt="UPI" />
                                                    </span>
                                                    <div className="info-box-content">
                                                        <span className="info-box-text font-weight-bold">UPI</span>
                                                        <span className="info-box-number">{currencySymbol} {stats.upi}</span>
                                                    </div>
                                                </a>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="cb9854 info-box">
                                                <a href="#">
                                                    <span className="back-none info-box-icon">
                                                        <img className="width25 img-fluid" src="https://newlayout.wisibles.com/backend/images/sidebar/3.png" alt="Total" />
                                                    </span>
                                                    <div className="info-box-content">
                                                        <span className="info-box-text font-weight-bold">Total</span>
                                                        <span className="info-box-number">{currencySymbol} {stats.total}</span>
                                                    </div>
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bulk Upload Section - Import payments from CSV */}
                                    <div className="box box-info" style={{ padding: '5px' }}>
                                        <div className="box-header with-border">
                                            <div className="pull-right box-tools">
                                                <button
                                                    onClick={handleDownloadSample}
                                                    className="btn btn-primary btn-sm"
                                                    disabled={downloading}
                                                >
                                                    <i className={`fa ${downloading ? 'fa-spinner fa-spin' : 'fa-download'}`}></i>
                                                    {downloading ? ' Downloading...' : ' Import Payment Sample File'}
                                                </button>
                                            </div>
                                        </div>
                                        <hr />
                                        <div className="box-body">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label htmlFor="csvFileInput">
                                                            Select CSV File <small className="req">*</small>
                                                        </label>
                                                        <input
                                                            id="csvFileInput"
                                                            className="dropify"
                                                            type="file"
                                                            name="file"
                                                            data-height="28"
                                                            accept=".csv"
                                                            onChange={(e) => setCsvFile(e.target.files[0] || null)}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6 pt20">
                                                    <button
                                                        type="button"
                                                        className="btn btn-info pull-right"
                                                        onClick={handleImport}
                                                        disabled={importing || !csvFile}
                                                    >
                                                        {importing ? ' Importing...' : ' Import Payments'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Select Criteria / Search Section */}
                                    <div className="row">
                                        <div className="box-header with-border">
                                            <h3 className="box-title">
                                                <i className="fa fa-search"></i> Select Criteria
                                            </h3>
                                        </div>
                                        <div className="box-body">
                                            <div className="row">
                                                <div className="col-md-6 col-sm-6">
                                                    <form onSubmit={(e) => handleSearch(e, 'class')}>
                                                        <div className="row">
                                                            <div className="col-sm-6">
                                                                <div className="form-group">
                                                                    <label>Class</label><small className="req"> *</small>
                                                                    <select
                                                                        autoFocus
                                                                        id="class_id"
                                                                        name="class_id"
                                                                        className="form-control"
                                                                        value={formData.class_id}
                                                                        onChange={handleClassChange}
                                                                    >
                                                                        <option value="">Select</option>
                                                                        {classList.map(cls => (
                                                                            <option key={cls.id} value={cls.id}>{cls.class}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="col-sm-6">
                                                                <div className="form-group">
                                                                    <label>Section</label>
                                                                    <select
                                                                        id="section_id"
                                                                        name="section_id"
                                                                        className="form-control"
                                                                        value={formData.section_id}
                                                                        onChange={(e) => setFormData(prev => ({ ...prev, section_id: e.target.value }))}
                                                                    >
                                                                        <option value="">Select</option>
                                                                        {sectionList.map(sec => (
                                                                            <option key={sec.section_id || sec.id} value={sec.section_id}>{sec.section}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="col-sm-12">
                                                                <div className="form-group">
                                                                    <button type="submit" className="btn btn-primary btn-sm pull-right">
                                                                        <i className="fa fa-search"></i> Search
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>

                                                <div className="col-md-6 col-sm-6">
                                                    <form onSubmit={(e) => handleSearch(e, 'keyword')}>
                                                        <div className="row">
                                                            <div className="col-sm-12">
                                                                <div className="form-group">
                                                                    <label>Search By Keyword</label>
                                                                    <input
                                                                        type="text"
                                                                        name="search_text"
                                                                        className="form-control"
                                                                        placeholder="Search By Student Name, Roll Number, Enroll Number, National Id, Local Id Etc."
                                                                        value={formData.search_text}
                                                                        onChange={(e) => setFormData(prev => ({ ...prev, search_text: e.target.value }))}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-sm-12">
                                                                <div className="form-group">
                                                                    <button type="submit" className="btn btn-primary btn-sm pull-right">
                                                                        <i className="fa fa-search"></i> Search
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Student List Table */}
                                        <div className="">
                                            <div className="box-header ptbnull"></div>
                                            <div className="box-header ptbnull">
                                                <h3 className="box-title titlefix">
                                                    <i className="fa fa-users"></i> Student List
                                                </h3>
                                            </div>
                                            <div className="box-body">
                                                <div className="download_label">Student List</div>

                                                {/* Controls: Records, local search, export buttons */}
                                                <div className="row" style={{ marginBottom: '10px' }}>
                                                    <div className="col-sm-8" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
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
                                                            <label style={{ fontWeight: 'normal', display: 'flex', alignItems: 'center', margin: 0 }}>
                                                                Search:
                                                                <input
                                                                    type="search"
                                                                    className="form-control input-sm"
                                                                    placeholder=""
                                                                    style={{ marginLeft: '10px' }}
                                                                    value={localSearch}
                                                                    onChange={(e) => {
                                                                        setLocalSearch(e.target.value);
                                                                        setCurrentPage(1);
                                                                    }}
                                                                />
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-4 text-right">
                                                        <div className="dt-buttons btn-group">
                                                            <button className="btn btn-default btn-sm" title="Copy" onClick={() => { const { headers, rows } = getExportData(); copyToClipboard(headers, rows); }}>
                                                                <i className="fa fa-files-o"></i>
                                                            </button>
                                                            <button className="btn btn-default btn-sm" title="CSV" onClick={() => { const { headers, rows } = getExportData(); downloadCSV(headers, rows, 'student_list.csv'); }}>
                                                                <i className="fa fa-file-text-o"></i>
                                                            </button>
                                                            <button className="btn btn-default btn-sm" title="Excel" onClick={() => { const { headers, rows } = getExportData(); downloadExcel(headers, rows, 'student_list.xls'); }}>
                                                                <i className="fa fa-file-excel-o"></i>
                                                            </button>
                                                            <button className="btn btn-default btn-sm" title="PDF" onClick={() => { const { headers, rows } = getExportData(); downloadPDF(headers, rows, 'student_list.pdf', 'Student List'); }}>
                                                                <i className="fa fa-file-pdf-o"></i>
                                                            </button>
                                                            <button 
                                                                className="btn btn-default btn-sm" 
                                                                title="Print" 
                                                                onClick={() => { const { headers, rows } = getExportData(); printTable(headers, rows, 'Student List'); }}
                                                                style={{ borderTopRightRadius: '20px', borderBottomRightRadius: '20px' }}
                                                            >
                                                                <i className="fa fa-print"></i>
                                                            </button>
                                                            {/* 
                                                            <div className="btn-group">
                                                                <button className="btn btn-default btn-sm" title="Columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}>
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
                                                            */}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="table-responsive">
                                                    <table className="table table-striped table-bordered table-hover student-list">
                                                        <thead>
                                                            <tr>
                                                                {columns.map(col => visibleColumns.has(col.key) && (
                                                                    <th key={col.key} style={{ whiteSpace: 'nowrap', minWidth: col.minWidth }}>{col.label}</th>
                                                                ))}
                                                                <th className="text-right noExport" style={{ whiteSpace: 'nowrap', minWidth: '100px' }}>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {currentRecords.length === 0 ? (
                                                                <tr>
                                                                    <td colSpan={visibleColumns.size + 1} className="text-center">
                                                                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                                                                            <div style={{ color: 'red', fontFamily: 'Roboto-Bold', fontSize: '10px' }}>No data available in table</div>
                                                                            <img src="/images/addnewitem.svg" alt="No Data" style={{ marginBottom: 0, width: '150px' }} />
                                                                            <div style={{ color: 'green', fontFamily: 'Roboto-Bold', fontSize: '10px' }}>&lt;- Search with different criteria</div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                currentRecords.map((student, index) => (
                                                                    <tr key={`${student.id}-${index}`}>
                                                                        {columns.map(col => visibleColumns.has(col.key) && (
                                                                            <td
                                                                                key={col.key}
                                                                                style={{
                                                                                    whiteSpace: 'nowrap',
                                                                                    maxWidth: col.maxWidth,
                                                                                    overflow: 'hidden',
                                                                                    textOverflow: 'ellipsis'
                                                                                }}
                                                                                title={formatCell(student, col.key)}
                                                                            >
                                                                                {col.key === 'student_name' ? (
                                                                                    <Link to={`/student/view/${student.id}`}>
                                                                                        {formatCell(student, col.key)}
                                                                                    </Link>
                                                                                ) : formatCell(student, col.key)}
                                                                            </td>
                                                                        ))}
                                                                        <td className="text-right" style={{ whiteSpace: 'nowrap' }}>
                                                                            {/* Action Buttons */}
                                                                            <Link to={`/studentfee/addfee/${student.student_session_id}`} className="btn btn-info btn-xs" title="Collect Fees">
                                                                                Collect Fees
                                                                            </Link>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {/* Pagination Footer */}
                                                <div className="row" style={{ marginTop: '15px' }}>
                                                    <div className="col-sm-5">
                                                        <div className="dataTables_info">
                                                            Showing {currentTotal === 0 ? 0 : indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, currentTotal)} of {currentTotal} entries
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-7">
                                                        <div className="dataTables_paginate paging_simple_numbers pull-right">
                                                            <ul className="pagination" style={{ margin: 0 }}>
                                                                <li className={`paginate_button previous ${currentPage === 1 ? 'disabled' : ''}`}>
                                                                    <a href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}><i className="fa fa-angle-left"></i></a>
                                                                </li>
                                                                {[...Array(totalPages)].map((_, i) => {
                                                                    const p = i + 1;
                                                                    if (totalPages > 7) {
                                                                        if (p !== 1 && p !== totalPages && Math.abs(currentPage - p) > 1) {
                                                                            if (p === 2 && currentPage > 3) return <li key={`ellipsis-${i}`} className="paginate_button disabled"><a>...</a></li>;
                                                                            if (p === totalPages - 1 && currentPage < totalPages - 2) return <li key={`ellipsis-${i}`} className="paginate_button disabled"><a>...</a></li>;
                                                                            return null;
                                                                        }
                                                                    }
                                                                    return (
                                                                        <li key={i} className={`paginate_button ${currentPage === p ? 'active' : ''}`}>
                                                                            <a href="#" onClick={(e) => { e.preventDefault(); handlePageChange(p); }}>{p}</a>
                                                                        </li>
                                                                    );
                                                                })}
                                                                <li className={`paginate_button next ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                                                                    <a href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}><i className="fa fa-angle-right"></i></a>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
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

export default StudentFeeSearch;
