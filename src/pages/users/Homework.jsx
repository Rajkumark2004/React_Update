
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './user_components/Header_user';
import Sidebar from './user_components/Sidebar_user';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';
import '../../utils/include_files.js';

const Homework = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    const [userData, setUserData] = useState({
        name: "T. Srinivasulu",
        role: "Student",
        id: "12345",
        avatar: "/uploads/student_images/1.jpg"
    });

    const sessionYear = currentSession?.session || '2024-25';

    const handleLogout = () => {
        clearSession();
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        navigate('/');
    };

    const themeColor = "#9c68e4";

    // Tab state
    const [activeTab, setActiveTab] = useState('upcoming');

    // Search state
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data - empty arrays for now
    const [upcomingHomework, setUpcomingHomework] = useState([]);
    const [closedHomework, setClosedHomework] = useState([]);

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

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return '↕';
        return sortConfig.direction === 'asc' ? '↑' : '↓';
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
                <div className="hw-export-icons">
                    <button className="hw-export-btn" title="Copy"><i className="fa fa-copy"></i></button>
                    <button className="hw-export-btn" title="Excel"><i className="fa fa-file-excel-o"></i></button>
                    <button className="hw-export-btn" title="CSV"><i className="fa fa-file-text-o"></i></button>
                    <button className="hw-export-btn" title="PDF"><i className="fa fa-file-pdf-o"></i></button>
                    <button className="hw-export-btn" title="Print"><i className="fa fa-print"></i></button>
                    <button className="hw-export-btn" title="Columns"><i className="fa fa-columns"></i></button>
                </div>
            </div>

            <div className="hw-table-responsive">
                <table className="hw-table">
                    <thead>
                        <tr>
                            {tableColumns.map((col) => (
                                <th key={col.key} onClick={() => handleSort(col.key)}>
                                    {col.label} <span className="sort-icon">{getSortIcon(col.key)}</span>
                                </th>
                            ))}
                            <th className="th-action">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={tableColumns.length + 1} className="hw-empty-td">
                                    <div className="hw-empty-state">
                                        <div className="hw-empty-text">No data available in table</div>
                                        <div className="hw-empty-illustration">
                                            <img src="/images/addnewitem.svg" alt="empty" style={{ width: '130px', height: 'auto', opacity: '0.8' }} />
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
                                        <td>{hw.class}</td>
                                        <td>{hw.section}</td>
                                        <td>{hw.subject_name}{hw.subject_code ? ` (${hw.subject_code})` : ''}</td>
                                        <td>{hw.homework_date}</td>
                                        <td>{hw.submit_date}</td>
                                        <td>{hw.evaluation_date || ''}</td>
                                        <td>{hw.marks}</td>
                                        <td>{hw.evaluation_marks}</td>
                                        <td>{hw.note}</td>
                                        <td>
                                            <span className={`hw-status-badge ${statusInfo.className}`}>
                                                {statusInfo.label}
                                            </span>
                                        </td>
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
                    Records: 0 to 0 of 0
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
        <div className="wrapper">
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
                .content-wrapper, .main-footer {
                    margin-left: 80px !important;
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
                    padding-top: 25px !important;
                    margin-top: 50px !important;
                    min-height: calc(100vh - 50px);
                }

                /* Homework Page Styles */
                .hw-box {
                    background: #fff;
                    border-radius: 4px;
                    border: 1px solid #eee !important;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1) !important;
                    margin: 25px 10px 15px 10px;
                }

                .hw-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 17px;
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
                    padding: 15px;
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
                    padding: 8px 10px;
                    cursor: pointer;
                    font-size: 14px;
                    color: #555;
                    transition: all 0.2s;
                }

                .hw-export-btn:hover {
                    color: #000;
                    background: #f0f0f0;
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
                    padding: 8px 12px;
                    border: none;
                    border-bottom: 1px solid #ddd;
                    font-weight: 600;
                    color: #333;
                    white-space: nowrap;
                    text-align: left;
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
                    padding: 10px 10px;
                    font-size: 10px;
                    border-bottom: 1px solid #eee;
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

                @media (max-width: 991px) {
                    .main-sidebar { width: 0 !important; }
                    .content-wrapper, .main-header .navbar, .main-footer { margin-left: 0 !important; }
                    .main-header .logo { width: 120px !important; }
                    .main-header .logo img { width: 100px !important; }
                    .hw-header { flex-direction: column; gap: 10px; align-items: flex-start; }
                    .hw-table-top { flex-direction: column; }
                    .hw-search-input { width: 100%; }
                    .hide-mobile { display: none !important; }
                }

                /* Sidebar mega menu cards logic override if needed */
                .fixedmenu { display: none !important; }
            `}</style>

            <Header
                userData={userData}
                handleLogout={handleLogout}
                sessionYear={sessionYear}
            />

            <Sidebar
                sessionYear={sessionYear}
                currentUrl="/user/homework"
            />

            <div className="content-wrapper">
                <section className="content" style={{ padding: "1px" }}>
                    <div className="hw-box">
                        {/* Header */}
                        <div className="hw-header">
                            <h3>Homework</h3>
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

            <Footer />
        </div>
    );
};

export default Homework;
