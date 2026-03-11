
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './user_components/Header_user';
import Sidebar from './user_components/Sidebar_user';
import Footer from './user_components/Footer';
import TopSidebar from './user_components/TopSidebar';
import { useSession } from '../../context/SessionContext';
import { api_users } from '../../services/api_users';
import '../../utils/include_files.js';

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

                .box-primary {
                    background: #fff;
                    border-radius: 4px;
                    border: 1px solid #eee !important;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1) !important;
                    margin: 25px 10px 15px 10px;
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
                    font-size: 18px;
                    font-weight: 500;
                    color: #333;
                    flex: 1;
                }

                .box-body {
                    padding: 15px;
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
                }

                .export-btn {
                    background: transparent;
                    border: none;
                    padding: 8px 10px;
                    cursor: pointer;
                    font-size: 14px;
                    color: #555;
                    transition: all 0.2s;
                }

                .export-btn:hover {
                    color: #000;
                    background: #f0f0f0;
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
                    padding: 8px 12px;
                    border-bottom: 1px solid #ddd;
                    font-weight: 600;
                    position: relative;
                }
                .hr-table tbody td {
                    padding: 4px 12px;
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

                @media (max-width: 991px) {
                    .main-sidebar { width: 0 !important; }
                    .content-wrapper, .main-header .navbar, .main-footer { margin-left: 0 !important; }
                    .main-header .logo { width: 120px !important; }
                    .main-header .logo img { width: 100px !important; }
                    .hide-mobile { display: none !important; }
                }

                /* Sidebar mega menu cards logic override if needed */
                .fixedmenu { display: none !important; }
            `}</style>

            <Header
                userData={userData}
                handleLogout={handleLogout}
                sessionYear={sessionYear}
                headerLogoUrl={userData.adminLogoUrl}
            />

            <Sidebar
                sessionYear={sessionYear}
                currentUrl="/user/hostelroom"
            />

            <div className="content-wrapper">
                <section className="content" style={{ padding: "4px", display: "flex", flexDirection: "column" }}>
                    <div className="hide-mobile" style={{ marginBottom: '10px' }}>
                        <TopSidebar sessionYear={sessionYear} />
                    </div>

                    <div className="box box-primary" style={{ flex: 1, margin: '10px' }}>
                        <div className="box-header">
                            <h3 className="box-title">Hostel Rooms</h3>
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
                                <table className="hr-table">
                                    <thead>
                                        <tr>
                                            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('hostel_name')}>Hostel <i className="fa fa-caret-down" style={{ color: '#ccc', marginLeft: '4px' }}></i></th>
                                            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('room_type')}>Room Type <i className="fa fa-caret-down" style={{ color: '#ccc', marginLeft: '4px' }}></i></th>
                                            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('room_no')}>Room Number / Name <i className="fa fa-caret-down" style={{ color: '#ccc', marginLeft: '4px' }}></i></th>
                                            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('no_of_bed')}>No Of Bed <i className="fa fa-caret-down" style={{ color: '#ccc', marginLeft: '4px' }}></i></th>
                                            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('status')}>Status <i className="fa fa-caret-down" style={{ color: '#ccc', marginLeft: '4px' }}></i></th>
                                            <th style={{ textAlign: 'right', cursor: 'pointer' }} onClick={() => handleSort('cost_per_bed')}>Cost Per Bed <i className="fa fa-caret-down" style={{ color: '#ccc', marginLeft: '4px' }}></i></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedRooms.length > 0 ? (
                                            sortedRooms.map((room) => (
                                                <tr key={room.id}>
                                                    <td>{room.hostel_name}</td>
                                                    <td>{room.room_type}</td>
                                                    <td>{room.room_no}</td>
                                                    <td>{room.no_of_bed}</td>
                                                    <td>{room.status}</td>
                                                    <td style={{ textAlign: 'right' }}>₹{amountFormat(room.cost_per_bed)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No rooms found</td>
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
            <Footer />
        </div>
    );
};

export default UserHostelRoom;
