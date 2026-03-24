
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import { api_users } from '../../services/api_users';
import '../../utils/include_files.js';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable, buildExportData } from '../../utils/tableExport.js';

const UserHostelRoom = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    const [userData, setUserData] = useState({
        name: "User",
        role: "Student",
        id: "",
        avatar: "/uploads/student_images/no_image.png",
        adminLogoUrl: ""
    });

    // Search State
    const [searchTerm, setSearchTerm] = useState('');

    // State for hostel rooms
    const [hostelRoomList, setHostelRoomList] = useState([]);

    const filteredRooms = (hostelRoomList || []).filter(room =>
        (room.hostel_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (room.room_type || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (room.room_no || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sorting State
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedRooms = [...filteredRooms].sort((a, b) => {
        if (!sortConfig.key) return 0;
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        // Handle numeric values
        if (sortConfig.key === 'cost_per_bed' || sortConfig.key === 'no_of_bed') {
            valA = parseFloat(valA) || 0;
            valB = parseFloat(valB) || 0;
        } else {
            valA = (valA || "").toString().toLowerCase();
            valB = (valB || "").toString().toLowerCase();
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const sessionYear = currentSession?.session || '2024-25';
    const themeColor = "#9c68e4";

    useEffect(() => {
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

        const fetchHostelRooms = async () => {
            try {
                const res = await api_users.getHostelRooms();
                if (res && res.data) {
                    if (res.data.hostel_rooms) {
                        setHostelRoomList(res.data.hostel_rooms);
                    }
                    if (res.data.student) {
                        setUserData(prev => ({
                            ...prev,
                            name: `${res.data.student.firstname} ${res.data.student.lastname}`.trim() || prev.name,
                            id: res.data.student.id || prev.id,
                            avatar: res.data.student.image ? `/uploads/student_images/${res.data.student.image}` : prev.avatar
                        }));
                    }
                }
            } catch (error) {
                console.error("Failed to load hostel rooms:", error);
            }
        };

        fetchUserData();
        fetchHostelRooms();
    }, []);

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

    const amountFormat = (n) =>
        Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const columns = [
        { key: 'hostel_name', label: 'Hostel' },
        { key: 'room_type', label: 'Room Type' },
        { key: 'room_no', label: 'Room Number / Name' },
        { key: 'no_of_bed', label: 'No Of Bed' },
        { key: 'status', label: 'Status' },
        { key: 'cost_per_bed', label: 'Cost Per Bed' }
    ];

    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));
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
            columns,
            visibleColumns,
            sortedRooms,
            (row, key) => {
                if (key === 'cost_per_bed') return `₹${amountFormat(row[key])}`;
                return row[key];
            }
        );
    };

    const handleCopy = () => {
        const { headers, rows } = getFormattedData();
        copyToClipboard(headers, rows);
    };

    const handleExportCSV = () => {
        const { headers, rows } = getFormattedData();
        downloadCSV(headers, rows, 'HostelRooms.csv');
    };

    const handleExportExcel = () => {
        const { headers, rows } = getFormattedData();
        downloadExcel(headers, rows, 'HostelRooms.xls');
    };

    const handleExportPDF = () => {
        const { headers, rows } = getFormattedData();
        downloadPDF(headers, rows, 'HostelRooms.pdf', 'Hostel Rooms List');
    };

    const handlePrint = () => {
        const { headers, rows } = getFormattedData();
        printTable(headers, rows, 'Hostel Rooms List');
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
        setVisibleColumns(new Set(columns.map(c => c.key)));
    };

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
                    padding-top: 8px !important;
                    margin-top: 40px !important;
                    padding-right: 20px;
                    min-height: calc(100vh - 50px);
                }

                .box-primary {
                    background: #fff;
                    border-radius: 4px;
                    border: 1px solid #eee !important;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1) !important;
                    margin: 5px 80px 200px 10px;
                }

                .box-header {
                    padding: 10px 17px;
                    border-bottom: 1px solid #f4f4f4;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .box-title {
                   margin: 0;
                    font-size: 20px;
                    font-weight: 400;
                    color: #333;
                    flex: 1;
                }

                .box-body {
                    padding: 5px 5px 15px 5px;
                }

                /* Table Styling */
                .table-controls {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 4px;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 10px;
                }

                .search-box input {
                    border: none;
                    border-bottom: 1px solid #ccc;
                    padding: 6px 2px;
                    font-size: 13px;
                    outline: none;
                    width: 180px;
                    background: transparent;
                }

                .search-box input:focus {
                    border-bottom-color: ${themeColor};
                }

                .export-icons {
                    display: flex;
                    gap: 0;
                    border-bottom: 1px solid #ccc;
                }

                .export-btn {
                    background: transparent;
                    border: none;
                    padding: 8px 6px;
                    cursor: pointer;
                    font-size: 14px;
                    color: #555;
                    transition: all 0.2s;
                }

                .export-btn:hover {
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

                .table-responsive {
                    border: none;
                }

                .hr-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 13px;
                }
                .hr-table thead th {
                    padding: 6px 10px;
                    border-bottom: 1px solid #ddd;
                    font-weight: 600;
                    position: relative;
                }
                .hr-table tbody td {
                    padding: 6px 10px;
                    border-bottom: 1px solid #eee;
                    color: #555;
                }
                .hr-table tbody tr:hover { background: #fafafa; }
                
                .hr-table-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 10px;
                    font-size: 10px;
                    border-bottom: 1px solid #eee;
                }
                .hr-records-info { font-weight: 500; }
                .hr-pagination { display: flex; gap: 4px; align-items: center; }
                .hr-page-arrow {
                    background: transparent;
                    border: none;
                    padding: 1px 3px;
                    cursor: pointer;
                    font-size: 8px;
                    color: #887274 !important;
                    font-weight: 100 !important;
                }
                .hr-page-arrow:disabled { cursor: not-allowed; color: #ddd; }
                .hr-page-number {
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
                    .content-wrapper { padding-top:18px !important; }
                    .box-primary { margin: 10px 10px 50px 10px !important; }

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
                        top: 4px !important;
                        right: 10px !important;
                        z-index: 100 !important;
                        text-decoration: none !important;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .content{
                        padding:0px 20px 0px 0px !important;
                    }

                    /* Center toolbar and search bar on mobile, one row each */
                    .table-controls {
                        flex-direction: column !important;
                        align-items: center !important;
                        justify-content: center !important;
                        gap: 6px !important;
                    }
                    .export-icons {
                        order: 1 !important;
                        justify-content: center !important;
                        width: 170px !important;
                        border-bottom: 1px solid #ccc !important;
                    }
                    .search-box {
                        order: 2 !important;
                        width: 170px !important;
                        display: flex !important;
                        justify-content: center !important;
                       
                    }
                    .search-box input {
                        width: 100% !important;
                        max-width: 320px !important;
                        text-align: start !important;
                    }
                }
                @media (min-width: 770px) {
                    .mobile-box-back-btn { display: none !important; }
                }

                @media (min-width: 992px) {
                    .hide-desktop { display: none !important; }
                }

                /* Sidebar mega menu cards logic override if needed */
                .fixedmenu { display: none !important; }

                /* Hostel page specific */
                .hostel-content { padding: 0px; display: flex; flex-direction: column; }
                .hostel-hide-mobile-spacer { margin-bottom: 10px; }
                .hostel-box-wrapper { position: relative; flex: 1; margin: 10px; }
                .hostel-export-icons-wrap { position: relative; }
                .hr-table-th-sortable { cursor: pointer; }
                .hr-table-th-right { text-align: right; cursor: pointer; }
                .hr-table-sort-icon { color: #ccc; margin-left: 4px; }
                .hr-table-td-right { text-align: right; }
                .hr-table-empty-cell { text-align: center; padding: 20px; }
            `}</style>
            <div className="content-wrapper">
                <section className="content hostel-content">
                    <div className="hide-mobile hostel-hide-mobile-spacer">                    </div>

                    <div className="box box-primary hostel-box-wrapper">
                        <div className="box-header">
                            <h3 className="box-title">Hostel Rooms</h3>
                            <button className="mobile-box-back-btn" onClick={() => navigate('/user/dashboard')}>
                                <i className="fa fa-arrow-left"></i> Back
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
                                    />
                                </div>
                                <div className="export-icons hostel-export-icons-wrap" ref={dropdownRef}>
                                    <button className="export-btn" title="Copy" onClick={handleCopy}><i className="fa fa-copy"></i></button>
                                    <button className="export-btn" title="Excel" onClick={handleExportExcel}><i className="fa fa-file-excel-o"></i></button>
                                    <button className="export-btn" title="CSV" onClick={handleExportCSV}><i className="fa fa-file-text-o"></i></button>
                                    <button className="export-btn" title="PDF" onClick={handleExportPDF}><i className="fa fa-file-pdf-o"></i></button>
                                    <button className="export-btn" title="Print" onClick={handlePrint}><i className="fa fa-print"></i></button>
                                    <button className="export-btn" title="Columns" onClick={() => setShowColumnDropdown(!showColumnDropdown)}><i className="fa fa-columns"></i></button>

                                    {showColumnDropdown && (
                                        <div className="column-dropdown">
                                            {columns.map(col => (
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

                            <div className="table-responsive">
                                <table className="hr-table">
                                    <thead>
                                        <tr>
                                            {visibleColumns.has('hostel_name') && (
                                                <th className="hr-table-th-sortable" onClick={() => handleSort('hostel_name')}>Hostel <i className="fa fa-caret-down hr-table-sort-icon"></i></th>
                                            )}
                                            {visibleColumns.has('room_type') && (
                                                <th className="hr-table-th-sortable" onClick={() => handleSort('room_type')}>Room Type <i className="fa fa-caret-down hr-table-sort-icon"></i></th>
                                            )}
                                            {visibleColumns.has('room_no') && (
                                                <th className="hr-table-th-sortable" onClick={() => handleSort('room_no')}>Room Number / Name <i className="fa fa-caret-down hr-table-sort-icon"></i></th>
                                            )}
                                            {visibleColumns.has('no_of_bed') && (
                                                <th className="hr-table-th-sortable" onClick={() => handleSort('no_of_bed')}>No Of Bed <i className="fa fa-caret-down hr-table-sort-icon"></i></th>
                                            )}
                                            {visibleColumns.has('status') && (
                                                <th className="hr-table-th-sortable" onClick={() => handleSort('status')}>Status <i className="fa fa-caret-down hr-table-sort-icon"></i></th>
                                            )}
                                            {visibleColumns.has('cost_per_bed') && (
                                                <th className="hr-table-th-right" onClick={() => handleSort('cost_per_bed')}>Cost Per Bed <i className="fa fa-caret-down hr-table-sort-icon"></i></th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedRooms.length > 0 ? (
                                            sortedRooms.map((room) => (
                                                <tr key={room.id}>
                                                    {visibleColumns.has('hostel_name') && <td>{room.hostel_name}</td>}
                                                    {visibleColumns.has('room_type') && <td>{room.room_type}</td>}
                                                    {visibleColumns.has('room_no') && <td>{room.room_no}</td>}
                                                    {visibleColumns.has('no_of_bed') && <td>{room.no_of_bed}</td>}
                                                    {visibleColumns.has('status') && <td>{room.status}</td>}
                                                    {visibleColumns.has('cost_per_bed') && (
                                                        <td className="hr-table-td-right">₹{amountFormat(room.cost_per_bed)}</td>
                                                    )}
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={visibleColumns.size} className="hr-table-empty-cell">No rooms found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="hr-table-footer">
                                <div className="hr-records-info">
                                    Records: {filteredRooms.length > 0 ? `1 to ${filteredRooms.length} of ${filteredRooms.length}` : '0 of 0'}
                                </div>
                                <div className="hr-pagination">
                                    <button className="hr-page-arrow" disabled>
                                        <i className="fa fa-chevron-left"></i>
                                    </button>
                                    <div className="hr-page-number">1</div>
                                    <button className="hr-page-arrow" disabled>
                                        <i className="fa fa-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default UserHostelRoom;
