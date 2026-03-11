
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './user_components/Header_user';
import Sidebar from './user_components/Sidebar_user';
import Footer from './user_components/Footer';
import TopSidebar from './user_components/TopSidebar';
import { useSession } from '../../context/SessionContext';
import { api_users } from '../../services/api_users';
import '../../utils/include_files.js';

const ApplyLeave = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    const [userData, setUserData] = useState({
        name: "User",
        role: "Student",
        id: "",
        avatar: "/uploads/student_images/no_image.png",
        adminLogoUrl: ""
    });

    // Search and Filtering State
    const [searchTerm, setSearchTerm] = useState('');
    const [leaveList, setLeaveList] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLeaveRecords = async () => {
        setLoading(true);
        try {
            const response = await api_users.getApplyLeave();
            if (response && response.status && response.data && response.data.leave_records) {
                setLeaveList(response.data.leave_records);
            }
        } catch (error) {
            console.error("Failed to fetch leave records:", error);
        } finally {
            setLoading(false);
        }
    };

    // Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [leaveData, setLeaveData] = useState({
        apply_date: new Date().toLocaleDateString('en-GB'),
        from_date: '',
        to_date: '',
        reason: '',
        file: null
    });

    const sessionYear = currentSession?.session || '2024-25';
    const themeColor = "#9c68e4";

    useEffect(() => {
        const loadData = async () => {
            await fetchUserData();
            await fetchLeaveRecords();
        };
        loadData();
    }, []);

    const fetchUserData = async () => {
        try {
            const storedUser = localStorage.getItem('user');
            let initialName = "User";
            if (storedUser) {
                const userObj = JSON.parse(storedUser);
                initialName = userObj.username || "User";
                setUserData(prev => ({
                    ...prev,
                    name: initialName,
                    role: userObj.role || 'Student',
                    avatar: userObj.image || "/uploads/student_images/no_image.png"
                }));
            }
            const res = await api_users.getUserDashboard();
            if (res && res.status && res.data && res.data.student) {
                setUserData(prev => ({
                    ...prev,
                    name: res.data.student.name || initialName,
                    id: res.data.student.id || prev.id,
                    adminLogoUrl: res.data.sch_setting?.admin_logo && res.data.sch_setting?.base_url
                        ? `${res.data.sch_setting.base_url}uploads/school_content/admin_logo/${res.data.sch_setting.admin_logo}`
                        : ""
                }));
            }
        } catch (error) {
            console.error("Failed to load user data:", error);
        }
    };

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

    const handleSave = () => {
        if (!leaveData.from_date || !leaveData.to_date) {
            alert("Please fill in the required dates.");
            return;
        }

        const newLeave = {
            ...leaveData,
            class: "10",
            section: "A",
            status: "0" // Pending
        };

        setLeaveList([...leaveList, newLeave]);
        resetLeaveData();
        setShowAddModal(false);
    };

    const handleUpdate = () => {
        if (!leaveData.from_date || !leaveData.to_date) {
            alert("Please fill in the required dates.");
            return;
        }
        // Logic to update leaveList would go here
        setShowEditModal(false);
        resetLeaveData();
    };

    const resetLeaveData = () => {
        setLeaveData({
            apply_date: new Date().toLocaleDateString('en-GB'),
            from_date: '',
            to_date: '',
            reason: '',
            file: null
        });
    };

    const handleEditClick = (leave) => {
        setLeaveData({
            apply_date: leave.apply_date,
            from_date: leave.from_date,
            to_date: leave.to_date,
            reason: leave.reason,
            file: null
        });
        setShowEditModal(true);
    };

    const filteredList = (leaveList || []).filter(leave => {
        const search = searchTerm.toLowerCase();
        return (
            (leave.class || "").toLowerCase().includes(search) ||
            (leave.section || "").toLowerCase().includes(search) ||
            (leave.reason || "").toLowerCase().includes(search) ||
            (leave.from_date || "").includes(search) ||
            (leave.to_date || "").includes(search)
        );
    });

    // Sorting State
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedList = [...filteredList].sort((a, b) => {
        if (!sortConfig.key) return 0;
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        valA = (valA || "").toString().toLowerCase();
        valB = (valB || "").toString().toLowerCase();

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const getStatusInfo = (status) => {
        switch (status) {
            case "0":
                return { label: "Pending", color: "#ab5f61" };
            case "1":
                return { label: "Approved", color: "#00a65a" };
            case "2":
                return { label: "Disapproved", color: "#dd4b39" };
            default:
                return { label: "Unknown", color: "#666" };
        }
    };

    return (
        <div className="wrapper">
            <style>{`
                .content-wrapper, .main-footer {
                    margin-left: 80px !important;
                }
                .sidebar {
                    height: calc(100vh - 50px) !important;
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                    padding-bottom: 20px !important;
                }
                .sidebar::-webkit-scrollbar { width: 5px; }
                .sidebar::-webkit-scrollbar-track { background: transparent; }
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
                .sessionul, .fixedmenu, .search-form, .navbar-form { display: none !important; }
                .content-wrapper {
                    background-color: #f7f8fa !important;
                    padding-top: 0px !important;
                    margin-top: 40px !important;
                    min-height: calc(100vh - 70px);
                }

                /* TABLE BOX STYLING */
                .box-leave {
                    background: #fff;
                    border-radius: 4px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    margin: 25px 10px 15px 10px;
                }

                .box-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 15px;
                    border-bottom: 1px solid #f4f4f4;
                }

                .box-title {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 500;
                    color: #333;
                    flex: 1; 
                }

                .add-btn {
                    background: ${themeColor};
                    color: #fff;
                    border: none;
                    border-radius: 20px;
                    padding: 6px 15px;
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                   
                    cursor: pointer;
                    font-weight: 500;
                }

                .box-body {
                    padding: 5px 5px 0px 5px;
                }

                .table-controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 4px 0px;
                    margin-bottom: 3px;
                    flex-wrap: nowrap;
                }

                .search-box { margin-top: 0px; }

                .search-input {
                    border: none;
                    border-bottom: 1px solid #ccc;
                    padding: 4px 2px;
                    font-size: 13px;
                    width: 180px;
                    outline: none;
                }

                .export-icons {
                    display: flex;
                    gap: 2px;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 3px;
                    justify-content: flex-end;
                }

                .export-btn {
                    background: transparent;
                    border: none;
                    padding: 4px 6px;
                    cursor: pointer;
                    font-size: 14px;
                    color: #555;
                    transition: all 0.2s;
                }

                .export-btn:hover {
                    color: #000;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    background: #e7e7e7;
                    border-radius: 2px;
                }

                .table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 13px;
                    margin-bottom: 0 !important;
                }
                .table-responsive { margin-bottom: 0 !important; }

                .table th {
                    border: none;
                    border-bottom: 1px solid #ddd;
                    padding: 10px 20px 10px 12px;
                    color: #333;
                    font-weight: 600;
                    text-align: left;
                    white-space: nowrap;
                    position: relative;
                    cursor: pointer;
                    user-select: none;
                }

                .table td {
                    padding: 4px 12px;
                    border-bottom: 1px solid #eee;
                    color: #555;
                }

                .table tr:hover {
                    background: #fafafa;
                }

                .action-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #666;
                    padding: 4px 8px;
                    transition: all 0.2s;
                    border-radius: 2px;
                    font-size: 13px;
                }

                .table tr:hover .action-btn {
                    background: #fff !important;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.15);
                    color: #000;
                }

                .action-btn:hover {
                    background: #fff !important;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.2) !important;
                    transform: translateY(-1px);
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 0px;
                }

                .empty-state-text {
                    color: #f5a0a0;
                    font-size: 14px;
                }

                .empty-state img {
                    width: 200px;
                    height: 170px;
                }

                .add-record-text {
                    color: #3c763d;
                    font-size: 13px;
                }

                .table-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0px 10px 0px 10px;
                    font-size: 10px;
                    border-bottom: none;
                    margin-top: -2px;
                }

                .records-info { font-weight: 500; }

                .pagination { display: flex; gap: 4px; align-items: center; }

                .page-arrow {
                    background: transparent;
                    border: none;
                    padding: 1px 3px;
                    cursor: pointer;
                    font-size: 8px;
                    color: #887274 !important;
                    font-weight: 100 !important;
                }

                .page-arrow:disabled { cursor: not-allowed; color: #ddd; }

                .page-number {
                    padding: 1px 7px;
                    border-radius: 2px;
                    font-size: 10px;
                    background: #f4f4f4;
                    min-width: 20px;
                    text-align: center;
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.4);
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    z-index: 2000;
                    padding-top: 40px;
                }

                .modal-content {
                    background: #fff;
                    border-radius: 6px;
                    width: 90%;
                    max-width: 600px;
                    box-shadow: 0 5px 30px rgba(0,0,0,0.2);
                    position: relative;
                }

                .modal-header {
                    background: #fff !important;
                    padding: 18px 25px 12px 25px;
                    border-bottom: 1px solid #000;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .modal-header h4 {
                    margin: 0;
                    font-size: 17px;
                    font-weight: 600;
                    color: #333;
                }

                .modal-close-icon {
                    background: none;
                    border: none;
                    font-size: 22px;
                    cursor: pointer;
                    color: #333;
                    font-weight: bold;
                    padding: 0;
                    line-height: 1;
                }

                .modal-body {
                    padding: 10px 25px 0 25px;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #333;
                }

                .form-group label span {
                    color: #dd4b39;
                    margin-left: 2px;
                }

                .form-value-text {
                    font-size: 13px;
                    color: #555;
                    padding: 4px 0;
                    border-bottom: 1px solid #ddd;
                    width: 100%;
                }

                .form-control-underlined {
                    width: 100%;
                    padding: 4px 0;
                    border: none;
                    border-bottom: 1px solid #ddd;
                    border-radius: 0;
                    font-size: 13px;
                    outline: none;
                    background: transparent;
                    color: #555;
                    font-family: inherit;
                    -webkit-appearance: none;
                }

                .form-control-underlined::-webkit-calendar-picker-indicator {
                    display: none;
                }

                .form-control-underlined::placeholder {
                    color: transparent;
                }
                
                input[type="date"]::-webkit-datetime-edit {
                    color: transparent;
                }
                
                input[type="date"]:focus::-webkit-datetime-edit,
                input[type="date"]:valid::-webkit-datetime-edit {
                    color: #555 !important;
                }

                .form-control-underlined:focus {
                    border-bottom-color: ${themeColor};
                }

                textarea.form-control-underlined {
                    min-height: 40px;
                    resize: vertical;
                }

                /* File Upload Area */
                .file-upload-container {
                    border: none;
                    border-bottom: 1px solid #ddd;
                    padding: 0px 0 4px 0;
                    text-align: left;
                    cursor: pointer;
                    border-radius: 0;
                    background: transparent;
                    transition: border-bottom-color 0.2s;
                    margin-top: 5px;
                }

                .file-upload-container:hover {
                    border-color: ${themeColor};
                }

                .file-upload-content {
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    gap: 12px;
                    color: #999;
                    font-size: 13px;
                }

                .file-upload-content i {
                    font-size: 24px;
                    color: #bbb;
                }

                .modal-footer {
                    padding: 8px 25px;
                    display: flex;
                    justify-content: flex-end;
                    border-top: 1px solid #f4f4f4;
                }

                .btn-save-purple {
                    background: ${themeColor};
                    color: #fff;
                    border: none;
                    border-radius: 20px;
                    padding: 7px 20px;
                    font-size: 13px;
                    cursor: pointer;
                    font-weight: 500;
                    box-shadow: 0 2px 4px rgba(156, 104, 228, 0.3);
                }

                @media (max-width: 991px) {
                    .main-sidebar { width: 0 !important; }
                    .content-wrapper, .main-header .navbar, .main-footer { margin-left: 0 !important; }
                    .hide-mobile { display: none !important; }
                }
            `}</style>

            <Header
                userData={userData}
                handleLogout={handleLogout}
                sessionYear={sessionYear}
                headerLogoUrl={userData.adminLogoUrl}
            />

            <Sidebar
                sessionYear={sessionYear}
                currentUrl="/user/apply_leave"
            />

            <div className="content-wrapper">
                <section className="content" style={{ padding: "5px" }}>
                    <div className="hide-mobile" style={{ marginBottom: '10px' }}>
                        <TopSidebar sessionYear={sessionYear} />
                    </div>

                    <div className="box-leave">
                        <div className="box-header">
                            <h3 className="box-title">Leave List</h3>
                            <button className="add-btn" onClick={() => setShowAddModal(true)}>
                                <i className="fa fa-plus"></i> Add
                            </button>
                        </div>
                        <div className="box-body">
                            <div className="table-controls">
                                <div className="search-box">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="search-input"
                                    />
                                </div>
                                <div className="export-icons">
                                    <button className="export-btn" title="Copy"><i className="fa fa-copy"></i></button>
                                    <button className="export-btn" title="Excel"><i className="fa fa-file-excel-o"></i></button>
                                    <button className="export-btn" title="CSV"><i className="fa fa-file-text-o"></i></button>
                                    <button className="export-btn" title="PDF"><i className="fa fa-file-pdf-o"></i></button>
                                    <button className="export-btn" title="Print"><i className="fa fa-print"></i></button>
                                    <button className="export-btn" title="Columns"><i className="fa fa-columns"></i></button>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('class')}>Class <i className="fa fa-caret-down" style={{ color: '#ccc', marginLeft: '4px' }}></i></th>
                                            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('section')}>Section <i className="fa fa-caret-down" style={{ color: '#ccc', marginLeft: '4px' }}></i></th>
                                            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('apply_date')}>Apply Date <i className="fa fa-caret-down" style={{ color: '#ccc', marginLeft: '4px' }}></i></th>
                                            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('from_date')}>From Date <i className="fa fa-caret-down" style={{ color: '#ccc', marginLeft: '4px' }}></i></th>
                                            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('to_date')}>To Date <i className="fa fa-caret-down" style={{ color: '#ccc', marginLeft: '4px' }}></i></th>
                                            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('reason')}>Reason <i className="fa fa-caret-down" style={{ color: '#ccc', marginLeft: '4px' }}></i></th>
                                            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('status')}>Status <i className="fa fa-caret-down" style={{ color: '#ccc', marginLeft: '4px' }}></i></th>
                                            <th style={{ textAlign: 'right' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td>
                                            </tr>
                                        ) : sortedList.length > 0 ? (
                                            sortedList.map((leave, index) => {
                                                const statusInfo = getStatusInfo(leave.status);
                                                return (
                                                    <tr key={index}>
                                                        <td>{leave.class}</td>
                                                        <td>{leave.section}</td>
                                                        <td>{leave.apply_date}</td>
                                                        <td>{leave.from_date}</td>
                                                        <td>{leave.to_date}</td>
                                                        <td>{leave.reason}</td>
                                                        <td>
                                                            <span style={{
                                                                background: statusInfo.color,
                                                                color: '#fff',
                                                                padding: '2px 8px',
                                                                borderRadius: '2px',
                                                                fontSize: '11px'
                                                            }}>
                                                                {statusInfo.label}
                                                            </span>
                                                        </td>
                                                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                                            <button title="Edit" className="action-btn" style={{ marginRight: '5px' }} onClick={() => handleEditClick(leave)}>
                                                                <i className="fa fa-pencil"></i>
                                                            </button>
                                                            <button title="Delete" className="action-btn">
                                                                <i className="fa fa-remove"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="8" style={{ textAlign: 'center', padding: '20px', borderBottom: '1px solid #dee2e6' }}>
                                                    <div className="empty-state">
                                                        <div className="empty-state-text">No data available in table</div>
                                                        <div className="empty-illustration">
                                                            <img src="/images/addnewitem.svg" alt="empty" style={{ width: '200px', height: '170px' }} />
                                                        </div>
                                                        <div className="add-record-text" onClick={() => setShowAddModal(true)} style={{ cursor: 'pointer' }}>
                                                            ← Add new record or search with different criteria.
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <div className="table-footer">
                                    <div className="records-info">
                                        Records: {filteredList.length > 0 ? `1 to ${filteredList.length} of ${filteredList.length}` : '0 of 0'}
                                    </div>
                                    <div className="pagination">
                                        <button className="page-arrow" disabled>
                                            <i className="fa fa-chevron-left"></i>
                                        </button>
                                        <div className="page-number">1</div>
                                        <button className="page-arrow" disabled>
                                            <i className="fa fa-chevron-right"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>
            </div>

            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h4>Add Leave</h4>
                            <button className="modal-close-icon" onClick={() => setShowAddModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Apply Date <span>*</span></label>
                                <div className="form-value-text">{leaveData.apply_date}</div>
                            </div>
                            <div className="row" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-start' }}>
                                <div className="form-group" style={{ width: '265px' }}>
                                    <label>From Date <span>*</span></label>
                                    <input
                                        type="date"
                                        required
                                        className="form-control-underlined"
                                        value={leaveData.from_date}
                                        onClick={(e) => e.target.showPicker()}
                                        onChange={(e) => setLeaveData({ ...leaveData, from_date: e.target.value })}
                                    />
                                </div>
                                <div className="form-group" style={{ width: '265px' }}>
                                    <label>To Date <span>*</span></label>
                                    <input
                                        type="date"
                                        required
                                        className="form-control-underlined"
                                        value={leaveData.to_date}
                                        onClick={(e) => e.target.showPicker()}
                                        onChange={(e) => setLeaveData({ ...leaveData, to_date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Reason</label>
                                <textarea
                                    className="form-control-underlined"
                                    value={leaveData.reason}
                                    placeholder=""
                                    onChange={(e) => setLeaveData({ ...leaveData, reason: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label>Attach Document</label>
                                <div className="file-upload-container">
                                    <div className="file-upload-content">
                                        <i className="fa fa-cloud-upload"></i>
                                        <span>Drag and drop a file here or click</span>
                                    </div>
                                    <input type="file" style={{ display: 'none' }} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-save-purple" onClick={handleSave}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h4>Edit Leave</h4>
                            <button className="modal-close-icon" onClick={() => setShowEditModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Apply Date <span>*</span></label>
                                <div className="form-value-text">{leaveData.apply_date}</div>
                            </div>
                            <div className="row" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-start' }}>
                                <div className="form-group" style={{ width: '265px' }}>
                                    <label>From Date <span>*</span></label>
                                    <input
                                        type="date"
                                        required
                                        className="form-control-underlined"
                                        value={leaveData.from_date}
                                        onClick={(e) => e.target.showPicker()}
                                        onChange={(e) => setLeaveData({ ...leaveData, from_date: e.target.value })}
                                    />
                                </div>
                                <div className="form-group" style={{ width: '265px' }}>
                                    <label>To Date <span>*</span></label>
                                    <input
                                        type="date"
                                        required
                                        className="form-control-underlined"
                                        value={leaveData.to_date}
                                        onClick={(e) => e.target.showPicker()}
                                        onChange={(e) => setLeaveData({ ...leaveData, to_date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Reason</label>
                                <textarea
                                    className="form-control-underlined"
                                    value={leaveData.reason}
                                    placeholder=""
                                    onChange={(e) => setLeaveData({ ...leaveData, reason: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label>Attach Document</label>
                                <div className="file-upload-container">
                                    <div className="file-upload-content">
                                        <i className="fa fa-cloud-upload"></i>
                                        <span>Drag and drop a file here or click</span>
                                    </div>
                                    <input type="file" style={{ display: 'none' }} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-save-purple" onClick={handleUpdate}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default ApplyLeave;
