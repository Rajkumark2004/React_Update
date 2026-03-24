import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import { api_users } from '../../services/api_users';
import '../../utils/include_files.js';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable, buildExportData } from '../../utils/tableExport.js';

const Homework = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    const [userData, setUserData] = useState({
        name: "User",
        role: "Student",
        id: "",
        avatar: "/uploads/student_images/no_image.png",
        adminLogoUrl: ""
    });

    const sessionYear = currentSession?.session || '2024-25';
    const [loading, setLoading] = useState(true);

    const handleLogout = async () => {
        try {
            await api_users.userLogout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            clearSession();
            localStorage.removeItem('user');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('token');
            navigate('/user/login');
        }
    };

    const themeColor = "#9c68e4";

    // Tab state
    const [activeTab, setActiveTab] = useState('upcoming');

    // Search state
    const [searchTerm, setSearchTerm] = useState('');

    // Homework data from API
    const [upcomingHomework, setUpcomingHomework] = useState([]);
    const [closedHomework, setClosedHomework] = useState([]);

    // Fetch data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch user info
                const userRes = await api_users.getUserDashboard();
                if (userRes && userRes.status && userRes.data && userRes.data.student) {
                    setUserData(prev => ({
                        ...prev,
                        name: userRes.data.student.name || prev.name,
                        id: userRes.data.student.id || prev.id,
                        avatar: userRes.data.student.image ? `${userRes.data.sch_setting?.base_url || ''}uploads/student_images/${userRes.data.student.image}` : prev.avatar,
                        adminLogoUrl: userRes.data.sch_setting?.admin_logo && userRes.data.sch_setting?.base_url
                            ? `${userRes.data.sch_setting.base_url}uploads/school_content/admin_logo/${userRes.data.sch_setting.admin_logo}`
                            : ""
                    }));
                }

                // Fetch homework list
                const hwRes = await api_users.getHomework();
                console.log('Homework full response:', hwRes);
                if (hwRes && hwRes.data) {
                    setUpcomingHomework(hwRes.data.open_homework || []);
                    setClosedHomework(hwRes.data.closed_homework || []);
                }
            } catch (error) {
                console.error('Failed to fetch homework data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [selectedHomework, setSelectedHomework] = useState(null);

    // Sort state
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const getStatusInfo = (homework) => {
        if (homework.homework_evaluation_id && homework.homework_evaluation_id !== 0) {
            return { label: 'Evaluated', className: 'status-evaluated' };
        } else if (homework.status === 'submitted') {
            return { label: 'Submitted', className: 'status-submitted' };
        } else {
            return { label: 'Pending', className: 'status-pending' };
        }
    };

    const handleEvaluation = (homework) => {
        setSelectedHomework(homework);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedHomework(null);
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const currentData = activeTab === 'upcoming' ? upcomingHomework : closedHomework;

    const filteredData = currentData.filter(hw => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            (hw.class && hw.class.toLowerCase().includes(term)) ||
            (hw.section && hw.section.toLowerCase().includes(term)) ||
            (hw.subject_name && hw.subject_name.toLowerCase().includes(term)) ||
            (hw.note && hw.note.toLowerCase().includes(term))
        );
    });

    const tableColumns = [
        { key: 'class', label: 'Class' },
        { key: 'section', label: 'Section' },
        { key: 'subject_name', label: 'Subject' },
        { key: 'homework_date', label: 'Homework Date' },
        { key: 'submit_date', label: 'Submission Date' },
        { key: 'evaluation_date', label: 'Evaluation Date' },
        { key: 'marks', label: 'Max Marks' },
        { key: 'evaluation_marks', label: 'Marks Obtained' },
        { key: 'note', label: 'Note' },
        { key: 'status', label: 'Status' },
    ];

    const [visibleColumns, setVisibleColumns] = useState(new Set(tableColumns.map(c => c.key)));
    const [showColumnDropdown, setShowColumnDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowColumnDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getFormattedData = () => {
        return buildExportData(
            tableColumns,
            visibleColumns,
            filteredData,
            (row, key) => {
                if (key === 'status') {
                    return getStatusInfo(row).label || '';
                }
                if (key === 'subject_name') {
                    return `${row.subject_name}${row.subject_code ? ` (${row.subject_code})` : ''}`;
                }
                return row[key] || '';
            }
        );
    };

    const handleCopy = () => {
        const { headers, rows } = getFormattedData();
        copyToClipboard(headers, rows);
    };

    const handleExportCSV = () => {
        const { headers, rows } = getFormattedData();
        downloadCSV(headers, rows, 'HomeworkList.csv');
    };

    const handleExportExcel = () => {
        const { headers, rows } = getFormattedData();
        downloadExcel(headers, rows, 'HomeworkList.xls');
    };

    const handleExportPDF = () => {
        const { headers, rows } = getFormattedData();
        downloadPDF(headers, rows, 'HomeworkList.pdf', 'Homework List');
    };

    const handlePrint = () => {
        const { headers, rows } = getFormattedData();
        printTable(headers, rows, 'Homework List');
    };

    const toggleColumn = (key) => {
        const newVisible = new Set(visibleColumns);
        if (newVisible.has(key)) {
            newVisible.delete(key);
        } else {
            newVisible.add(key);
        }
        setVisibleColumns(newVisible);
    };

    const handleRestoreVisibility = () => {
        setVisibleColumns(new Set(tableColumns.map(c => c.key)));
    };

    const renderTable = (data) => (
        <div className="hw-table-wrapper">
            <div className="hw-table-top">
                <div className="hw-search">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="hw-search-input"
                    />
                </div>
                <div className="hw-export-icons hw-export-wrap" ref={dropdownRef}>
                    <button className="hw-export-btn" title="Copy" onClick={handleCopy}><i className="fa fa-copy"></i></button>
                    <button className="hw-export-btn" title="Excel" onClick={handleExportExcel}><i className="fa fa-file-excel-o"></i></button>
                    <button className="hw-export-btn" title="CSV" onClick={handleExportCSV}><i className="fa fa-file-text-o"></i></button>
                    <button className="hw-export-btn" title="PDF" onClick={handleExportPDF}><i className="fa fa-file-pdf-o"></i></button>
                    <button className="hw-export-btn" title="Print" onClick={handlePrint}><i className="fa fa-print"></i></button>
                    <button className="hw-export-btn" title="Columns" onClick={() => setShowColumnDropdown(!showColumnDropdown)}><i className="fa fa-columns"></i></button>

                    {showColumnDropdown && (
                        <div className="column-dropdown">
                            {tableColumns.map(col => (
                                <button
                                    key={col.key}
                                    className={`column-item ${visibleColumns.has(col.key) ? 'active-col' : 'hidden-col'}`}
                                    onClick={() => toggleColumn(col.key)}
                                >
                                    {col.label}
                                </button>
                            ))}
                            <button className="restore-visibility" onClick={handleRestoreVisibility}>
                                Restore visibility
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="hw-table-responsive">
                <table className="hw-table">
                    <thead>
                        <tr>
                            {tableColumns.map((col) => (
                                visibleColumns.has(col.key) && (
                                    <th key={col.key} onClick={() => handleSort(col.key)} className="hw-th-sortable">
                                        {col.label} <i className="fa fa-caret-down hw-sort-icon"></i>
                                    </th>
                                )
                            ))}
                            <th className="th-action">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={visibleColumns.size + 1} className="hw-empty-td">
                                    <div className="hw-empty-state">
                                        <div className="hw-empty-text">No data available in table</div>
                                        <div className="hw-empty-illustration">
                                            <img src="/images/addnewitem.svg" alt="empty" className="hw-empty-img" />
                                        </div>
                                        <div className="hw-empty-hint">
                                            ← Add new record or search with different criteria.
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((hw, index) => {
                                const statusInfo = getStatusInfo(hw);
                                return (
                                    <tr key={index}>
                                        {visibleColumns.has('class') && <td>{hw.class}</td>}
                                        {visibleColumns.has('section') && <td>{hw.section}</td>}
                                        {visibleColumns.has('subject_name') && <td>{hw.subject_name}{hw.subject_code ? ` (${hw.subject_code})` : ''}</td>}
                                        {visibleColumns.has('homework_date') && <td>{hw.homework_date}</td>}
                                        {visibleColumns.has('submit_date') && <td>{hw.submit_date}</td>}
                                        {visibleColumns.has('evaluation_date') && <td>{hw.evaluation_date || ''}</td>}
                                        {visibleColumns.has('marks') && <td>{hw.marks}</td>}
                                        {visibleColumns.has('evaluation_marks') && <td>{hw.evaluation_marks}</td>}
                                        {visibleColumns.has('note') && <td>{hw.note}</td>}
                                        {visibleColumns.has('status') && (
                                            <td>
                                                <span className={`hw-status-badge ${statusInfo.className}`}>
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                        )}
                                        <td className="td-action">
                                            <button
                                                className="hw-action-btn"
                                                onClick={() => handleEvaluation(hw)}
                                                title="View / Edit"
                                            >
                                                <i className="fa fa-reorder"></i>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="hw-table-footer">
                <div className="hw-records-info">
                    Records: {filteredData.length > 0 ? `1 to ${filteredData.length} of ${filteredData.length}` : '0 of 0'}
                </div>
                <div className="hw-pagination">
                    <button className="hw-page-arrow" disabled>
                        <i className="fa fa-chevron-left"></i>
                    </button>
                    <div className="hw-page-number">1</div>
                    <button className="hw-page-arrow" disabled>
                        <i className="fa fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <style>{`
                /* Hide standard search and session UI */
                .sessionul, .search-form2, .search-form {
                    display: none !important;
                }

                /* NAVBAR USER MENU DROPDOWN FIX */
                .navbar-custom-menu {
                   overflow: visible !important;
                }
                .navbar-custom-menu .nav {
                   overflow: visible !important;
                }
                .navbar-custom-menu .nav > li:not(.user-menu) {
                    display: none !important;
                }
                .navbar-custom-menu .nav > li.user-menu {
                    display: block !important;
                    overflow: visible !important;
                }

                /* Ensure dropdown menu is on top of everything */
                .dropdown-user {
                    display: none;
                    z-index: 9999 !important;
                    position: absolute !important;
                    right: 0 !important;
                    top: 100% !important;
                }
                .user-menu.open .dropdown-user {
                    display: block !important;
                }

                /* REVERTING SIDEBAR TO THE GOOD PREVIOUS STATE */
                .content-wrapper {
                    margin-left: 80px !important;
                    padding: 0px !important;
                }
                
                .sidebar {
                    height: calc(100vh - 50px) !important;
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                    padding-bottom: 20px !important;
                }

                .sidebar::-webkit-scrollbar {
                    width: 5px;
                }
                .sidebar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .sidebar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                }

                .sidebar-menu > li > a {
                    padding: 12px 5px !important;
                    text-align: center !important;
                }
                
                .sidebar-menu li img {
                    filter: brightness(0) invert(1) !important;
                    width: 24px !important;
                    margin: 0 auto !important;
                }

                .sidebar-menu > li > a span {
                    color: #ffffff !important;
                    font-weight: 500 !important;
                    margin-top: 5px !important;
                    display: block !important;
                    font-size: 10px !important;
                    line-height: 1.2 !important;
                }

                .sidebar-menu > li:hover > a, .sidebar-menu > li.active > a {
                    background: rgba(255, 255, 255, 0.1) !important;
                }

                .content-wrapper {
                    background-color: #f7f8fa !important;
                       padding:2px 4px 0px 4px !important;
                    margin-top: 40px !important;
                    min-height: calc(100vh - 50px);
                }

                /* Homework Page Styles */
                .hw-box {
                    background: #fff;
                    border-radius: 4px;
                    border: 1px solid #eee !important;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1) !important;
                    margin: 25px 5px 15px 10px;
                }

                .hw-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 5px 17px;
                    border-bottom: 1px solid #f4f4f4;
                }

                .hw-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 500;
                    color: #333;
                }

                .hw-daily-btn {
                    background: ${themeColor};
                    color: #fff;
                    border: none;
                    padding: 6px 18px;
                    border-radius: 20px;
                    font-size: 13px;
                    cursor: pointer;
                    font-weight: 500;
                }

                .hw-daily-btn:hover {
                    opacity: 0.9;
                }

                /* Tabs */
                .hw-tabs {
                    display: flex;
                    border-bottom: 2px solid #eee;
                    padding: 0 0px;
                }

                .hw-tab {
                    padding: 10px 20px;
                    cursor: pointer;
                    font-size: 14px;
                    color: #666;
                    border-bottom: 2px solid transparent;
                    margin-bottom: -2px;
                    transition: all 0.2s;
                    background: none;
                    border-top: none;
                    border-left: none;
                    border-right: none;
                    outline: none !important;
                }

                .hw-tab.active {
                    color: #333;
                    border-bottom-color: #4ca1f6;
                    font-weight: 500;
                }

                /* Table wrapper */
                .hw-table-wrapper {
                    padding: 5px 15px 5px 15px;
                }

                .hw-table-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                    flex-wrap: wrap;
                    gap: 10px;
                }

                .hw-search-input {
                    border: none;
                    border-bottom: 1px solid #ccc;
                    border-radius: 0;
                    padding: 6px 2px;
                    font-size: 13px;
                    width: 180px;
                    outline: none;
                    background: transparent;
                }

                .hw-search-input:focus {
                    border-bottom-color: ${themeColor};
                }

                .hw-export-icons {
                    display: flex;
                    gap: 0;
                }

                .hw-export-btn {
                    background: transparent;
                    border: none;
                    border-bottom: 1px solid #ccc;
                    padding: 4px 6px;
                    cursor: pointer;
                    font-size: 14px;
                    color: #555;
                    transition: all 0.2s;
                }

                .hw-export-btn:hover {
                    color: #000;
                    background: #f0f0f0;
                }

                .column-dropdown {
                    position: absolute;
                    right: 0;
                    top: 100%;
                    background: #7d7d7d;
                    border-radius: 4px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    z-index: 1000;
                    min-width: 180px;
                    overflow: hidden;
                    padding: 0;
                    margin-top: 5px;
                    border: 1px solid rgba(0,0,0,0.1);
                }

                .column-item {
                    padding: 4px 15px;
                    font-size: 14px;
                    cursor: pointer;
                    color: #fff;
                    background: #7d7d7d;
                    transition: all 0.2s;
                    display: block;
                    width: 100%;
                    text-align: left;
                    border: none;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }

                .column-item:hover {
                    background: #6e6e6e;
                }

                .column-item.active-col {
                    background: #7d7d7d;
                    color: #fff;
                }

                .column-item.hidden-col {
                    background: #fff;
                    color: #555;
                }

                .restore-visibility {
                    background: #fff;
                    color: #555;
                    padding: 4px 15px;
                    font-size: 14px;
                    cursor: pointer;
                    text-align: left;
                    font-weight: 400;
                    display: block;
                    width: 100%;
                    border: none;
                }
                
                .restore-visibility:hover {
                    background: #f9f9f9;
                }

                /* Table */
                .hw-table-responsive {
                    overflow-x: auto;
                    border: none;
                }

                .hw-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 13px;
                }

                .hw-table thead th {
                    background: transparent;
                    padding: 7px 12px;
                    border: none;
                    border-bottom: 1px solid #ddd;
                    font-weight: 600;
                    color: #333;
                    white-space: nowrap;
                    text-align: left;
                }
                .box-title {
                   margin: 0 !important;
                    font-size: 18px !important;
                    font-weight: 400 !important;
                    color: #333 !important;
                    flex: 1 !important;
                }
                .hw-table tbody td {
                    padding: 4px 12px;
                    border: none;
                    border-bottom: 1px solid #eee;
                    color: #555;
                    vertical-align: middle;
                }

                .hw-table tbody tr:hover {
                    background: #fafafa;
                }

                .td-action {
                    text-align: left;
                }

                /* Empty state */
                .hw-empty-td {
                    text-align: center;
                    padding: 30px !important;
                }

                .hw-status-badge {
                    padding: 3px 10px;
                    border-radius: 3px;
                    font-size: 11px;
                    font-weight: 500;
                    color: #fff;
                }

                .status-pending { background: #dd4b39; }
                .status-submitted { background: #f39c12; }
                .status-evaluated { background: #00a65a; }

                .hw-action-btn {
                    background: #f4f4f4;
                    border: 1px solid #ddd;
                    border-radius: 3px;
                    padding: 4px 8px;
                    cursor: pointer;
                    font-size: 12px;
                    color: #555;
                }

                .hw-table-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 10px 7px 10px;
                    font-size: 10px;
                }

                .hw-records-info { font-weight: 500; }
                .hw-pagination { display: flex; gap: 4px; align-items: center; }
                .hw-page-arrow {
                    background: transparent;
                    border: none;
                    padding: 1px 3px;
                    cursor: pointer;
                    font-size: 8px;
                    color: #887274 !important;
                    font-weight: 100 !important;
                }
                .hw-page-arrow:disabled { cursor: not-allowed; color: #ddd; }
                .hw-page-number {
                    padding: 1px 7px;
                    border-radius: 2px;
                    font-size: 10px;
                    background: #f4f4f4;
                    min-width: 20px;
                    text-align: center;
                }

                @media (max-width: 769px) {
                    .main-sidebar { width: 0 !important; }
                    .content-wrapper, .main-header .navbar, .main-footer { margin-left: 0 !important; }
                    .main-header .logo { width: 120px !important; }
                    .main-header .logo img { width: 100px !important; }
                    /* Padding balancing for mobile */
                    .content-wrapper { padding-left: 0px !important; padding-right: 0px !important; }
                    .content { padding-left: 10px !important; padding-right: 10px !important; }
                    .content-wrapper { padding-top: 18px !important; }
                    .hw-box { margin: 10px 10px 20px 10px !important; }
                }

                /* Sidebar mega menu cards logic override if needed */
                .fixedmenu { display: none !important; }

                @media (max-width: 769px) {
                    .mobile-box-back-btn {
                        display: flex !important;
                        align-items: center;
                        gap: 5px;
                        background-color: #9c68e4 !important;
                        color: #fff !important;
                        border: none;
                        padding: 6px 15px;
                        border-radius: 20px;
                        font-size: 13px;
                        font-weight: 600;
                        position: absolute !important;
                        top: 5px !important;
                        right: 10px !important;
                        z-index: 100 !important;
                        text-decoration: none !important;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .hw-daily-btn {
                        margin-right: 80px !important;
                    }
                    .content{
                        padding:0px 0px 0px 0px !important;
                    }
                }
                @media (min-width: 770px) {
                    .mobile-box-back-btn { display: none !important; }
                }

                /* Homework page specific */
                .hw-content { padding: 1px; }
                .hw-box-wrapper { position: relative; }
                .hw-export-wrap { position: relative; }
                .hw-th-sortable { cursor: pointer; }
                .hw-sort-icon { color: #ccc; margin-left: 4px; }
                .hw-empty-img { width: 130px; height: auto; opacity: 0.8; }
            `}</style>
            <div className="content-wrapper">
                <section className="content hw-content">
                    <div className="hw-box hw-box-wrapper">
                        {/* Header */}
                        <div className="hw-header">
                            <h3 className="box-title">Homework</h3>
                            <button className="mobile-box-back-btn" onClick={() => navigate('/user/dashboard')}>
                                <i className="fa fa-arrow-left"></i> Back
                            </button>
                            <button className="hw-daily-btn" onClick={() => navigate('/user/daily_assignment')}>
                                Daily Assignment
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="hw-tabs">
                            <button
                                className={`hw-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
                                onClick={() => { setActiveTab('upcoming'); setSearchTerm(''); }}
                            >
                                Upcoming Homework
                            </button>
                            <button
                                className={`hw-tab ${activeTab === 'closed' ? 'active' : ''}`}
                                onClick={() => { setActiveTab('closed'); setSearchTerm(''); }}
                            >
                                Closed Homework
                            </button>
                        </div>

                        {/* Table */}
                        {renderTable(filteredData)}
                    </div>
                </section>
            </div>

            {/* Evaluation Modal */}
            {showModal && (
                <div className="hw-modal-overlay" onClick={closeModal}>
                    <div className="hw-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="hw-modal-header">
                            <h4>Homework Details</h4>
                            <button className="hw-modal-close" onClick={closeModal}>&times;</button>
                        </div>
                        <div className="hw-modal-body">
                            {selectedHomework ? (
                                <div>
                                    <p><strong>Subject:</strong> {selectedHomework.subject_name}</p>
                                    <p><strong>Class:</strong> {selectedHomework.class} - {selectedHomework.section}</p>
                                    <p><strong>Homework Date:</strong> {selectedHomework.homework_date}</p>
                                    <p><strong>Submission Date:</strong> {selectedHomework.submit_date}</p>
                                    <p><strong>Max Marks:</strong> {selectedHomework.marks}</p>
                                    <p><strong>Status:</strong> {getStatusInfo(selectedHomework).label}</p>
                                    {selectedHomework.note && <p><strong>Note:</strong> {selectedHomework.note}</p>}
                                </div>
                            ) : (
                                <p>Loading...</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Homework;