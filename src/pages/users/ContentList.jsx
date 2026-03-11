
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './user_components/Header_user';
import Sidebar from './user_components/Sidebar_user';
import Footer from './user_components/Footer';
import TopSidebar from './user_components/TopSidebar';
import { useSession } from '../../context/SessionContext';
import { api_users } from '../../services/api_users';
import '../../utils/include_files.js';

const ContentList = () => {
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

    const [recordList, setRecordList] = useState([]);

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

        const fetchContentList = async () => {
            try {
                const res = await api_users.getContentList();
                if (res && res.status && res.data && res.data.downloads) {
                    setRecordList(res.data.downloads);
                }
            } catch (error) {
                console.error("Failed to load content list:", error);
            }
        };

        fetchUserData();
        fetchContentList();
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

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === '0000-00-00' || dateStr === '0000-00-00 00:00:00') return '';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getSharedByName = (record) => {
        const namePart = `${record.name || ''} ${record.surname || ''}`.trim();
        const empIdPart = record.employee_id ? `(${record.employee_id})` : '';
        return `${namePart} ${empIdPart}`.trim() || 'Staff';
    };

    const filteredList = recordList.filter(record => {
        const search = searchTerm.toLowerCase();
        const sharedBy = getSharedByName(record).toLowerCase();
        return (
            (record.title || "").toLowerCase().includes(search) ||
            sharedBy.includes(search)
        );
    });

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

                /* Table Styling */
                .box-info {
                    background: #fff;
                    border-radius: 4px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1) !important;
                    margin: 25px 10px 15px 10px;
                    min-height: 100px;
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
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 4px;
                }

                .export-icons i {
                    color: #555;
                    cursor: pointer;
                    font-size: 13px;
                    padding: 4px 8px;
                    line-height: 1;
                }

                .export-icons i:hover { color: #222; }

                .table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 13px;
                }

                .table th {
                    border: none;
                    border-bottom: 1px solid #ddd;
                    padding: 10px 8px;
                    color: #333;
                    font-weight: 600;
                    text-align: left;
                    white-space: nowrap;
                }

                .table td {
                    padding: 10px 8px;
                    border: none;
                    border-bottom: 1px solid #eee;
                    color: #555;
                    vertical-align: middle;
                }

                .table tr:hover { background: #fafafa; }

                .table-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0px 0;
                    font-size: 11px;
                    color: #555;
                }

                .pagination { display: flex; gap: 8px; align-items: center; }

                .page-arrow {
                    background: transparent;
                    border: none;
                    padding: 0;
                    font-size: 8px;
                    color: gray;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .page-arrow.disabled { color: #ddd; cursor: not-allowed; }

                .page-number {
                    background: #f4f4f4;
                    padding: 2px 7px;
                    font-size: 9px;
                    color: #333;
                    min-width: 20px;
                    text-align: center;
                }

                .btn-action {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: #555;
                    font-size: 14px;
                }
                .btn-action:hover { color: #222; }

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
                currentUrl="/user/content/list"
            />

            <div className="content-wrapper">
                <section className="content" style={{ padding: "5px", display: "flex", flexDirection: "column" }}>
                    <div className="hide-mobile" style={{ marginBottom: '10px' }}>
                        <TopSidebar sessionYear={sessionYear} />
                    </div>

                    <div className="box box-info" style={{ flex: 1, margin: '10px' }}>
                        <div className="box-header">
                            <h3 className="box-title">Content List</h3>
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
                                    <i className="fa fa-files-o" title="Copy"></i>
                                    <i className="fa fa-file-excel-o" title="Excel"></i>
                                    <i className="fa fa-file-text-o" title="CSV"></i>
                                    <i className="fa fa-file-pdf-o" title="PDF"></i>
                                    <i className="fa fa-print" title="Print"></i>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Share Date</th>
                                            <th>Valid Upto</th>
                                            <th>Shared By</th>
                                            <th style={{ textAlign: 'right' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredList.length > 0 ? (
                                            filteredList.map((record, index) => (
                                                <tr key={index}>
                                                    <td>{record.title}</td>
                                                    <td>{formatDate(record.share_date)}</td>
                                                    <td>{formatDate(record.valid_upto)}</td>
                                                    <td>{getSharedByName(record)}</td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <button
                                                            className="btn-action"
                                                            title="View"
                                                            onClick={() => navigate(`/user/content/view/${record.id}`)}
                                                        >
                                                            <i className="fa fa-eye"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                                                    No results found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <div className="table-footer">
                                    <div className="records-info">
                                        Records: {filteredList.length > 0 ? 1 : 0} to {filteredList.length} of {filteredList.length}
                                    </div>
                                    <div className="pagination">
                                        <button className="page-arrow disabled">
                                            <i className="fa fa-chevron-left"></i>
                                        </button>
                                        <div className="page-number">1</div>
                                        <button className="page-arrow disabled">
                                            <i className="fa fa-chevron-right"></i>
                                        </button>
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

export default ContentList;
