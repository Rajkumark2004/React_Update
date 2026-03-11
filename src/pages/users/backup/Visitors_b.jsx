
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './user_components/Header_user';
import Sidebar from './user_components/Sidebar_user';
import Footer from './user_components/Footer';
import TopSidebar from './user_components/TopSidebar';
import { useSession } from '../../context/SessionContext';
import { api_users } from '../../services/api_users';
import '../../utils/include_files.js';

const Visitors = () => {
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

    // Modal State
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

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

        const fetchVisitors = async () => {
            try {
                const res = await api_users.getVisitors();
                if (res && res.status && res.data && res.data.visitor_list) {
                    setRecordList(res.data.visitor_list);
                }
            } catch (error) {
                console.error("Failed to load visitors:", error);
            }
        };

        fetchUserData();
        fetchVisitors();
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

    const filteredList = recordList.filter(record => {
        const search = searchTerm.toLowerCase();
        return (
            (record.purpose || "").toLowerCase().includes(search) ||
            (record.name || "").toLowerCase().includes(search) ||
            (record.contact || "").toLowerCase().includes(search) ||
            (record.id_proof || "").toLowerCase().includes(search) ||
            (record.date || "").toLowerCase().includes(search)
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

    const handleViewDetail = (record) => {
        setSelectedRecord(record);
        setShowDetailModal(true);
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
                    padding: 15px 15px 0px 0px !important;
                    padding-top: 0px !important;
                    margin-top: 40px !important;
                    min-height: calc(100vh - 70px);
                }

                /* Visitors Styles */
                .box-info {
                    background: #fff;
                    border-radius: 4px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1) !important;
                    margin: 25px 15px 15px 10px;
                    
                }
                .box-header {
                    padding: 10px 15px;
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
                    padding: 5px 5px 5px 5px;
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

                .search-box input {
                    border: none;
                    border-bottom: 1px solid #ccc;
                    padding: 4px 2px;
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

                .table-responsive {
                    margin-bottom: 0 !important;
                }

                .table tr:hover { background: #fafafa; }
                .table td {
                    padding: 4px 12px;
                    border-bottom: 1px solid #eee;
                    color: #555;
                    vertical-align: middle;
                }

                .table tr:hover { background: #fafafa; }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 15px 0;
                    gap: 5px;
                }

                .empty-state-text { color: #f5a0a0; font-size: 14px; margin-bottom: 10px; }
                .empty-illustration img { width: 200px; height: 170px; }
                .add-record-text {
                    color: #3c763d; font-size: 13px; margin-top: 10px;
                    display: flex; align-items: center; gap: 5px;
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
                    max-width: 800px;
                    box-shadow: 0 5px 30px rgba(0,0,0,0.2);
                    position: relative;
                }

                .modal-header {
                    padding: 15px 25px;
                    border-bottom: 1px solid #f4f4f4;
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

                .modal-body { padding: 20px 25px; }
                .btn-action {
                    background: #eee;
                    border: 1px solid #ddd;
                    padding: 3px 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    color: #666;
                    transition: all 0.2s;
                    margin-left: 5px;
                }
                .btn-action:hover { 
                    background: #fff !important; 
                    color: #333;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.15);
                }
                .table tr:hover .btn-action {
                    background: #fff;
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
                currentUrl="/user/visitors"
            />

            <div className="content-wrapper" style={{ minHeight: 'calc(100vh - 70px)' }}>
                <section className="content" style={{ padding: "3px" }}>
                    <div className="hide-mobile" style={{ marginBottom: '10px' }}>
                        <TopSidebar sessionYear={sessionYear} />
                    </div>

                    <div className="box box-info">
                        <div className="box-header">
                            <h3 className="box-title">Visitor List</h3>
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
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th onClick={() => handleSort('purpose')}>Purpose <i className="fa fa-caret-down" style={{ color: '#ccc', marginLeft: '4px' }}></i></th>
                                            <th onClick={() => handleSort('name')}>Visitor Name <i className="fa fa-caret-down" style={{ color: '#ccc', marginLeft: '4px' }}></i></th>
                                            <th onClick={() => handleSort('contact')}>Phone <i className="fa fa-caret-down" style={{ color: '#ccc', marginLeft: '4px' }}></i></th>
                                            <th onClick={() => handleSort('id_proof')}>ID Card <i className="fa fa-caret-down" style={{ color: '#ccc', marginLeft: '4px' }}></i></th>
                                            <th onClick={() => handleSort('no_of_people')}>Number Of Person <i className="fa fa-caret-down" style={{ color: '#ccc', marginLeft: '4px' }}></i></th>
                                            <th style={{ width: '35%' }} onClick={() => handleSort('note')}>Note <i className="fa fa-caret-down" style={{ color: '#ccc', marginLeft: '4px' }}></i></th>
                                            <th onClick={() => handleSort('date')}>Date <i className="fa fa-caret-down" style={{ color: '#ccc', marginLeft: '4px' }}></i></th>
                                            <th onClick={() => handleSort('in_time')}>In Time <i className="fa fa-caret-down" style={{ color: '#ccc', marginLeft: '4px' }}></i></th>
                                            <th onClick={() => handleSort('out_time')}>Out Time <i className="fa fa-caret-down" style={{ color: '#ccc', marginLeft: '4px' }}></i></th>
                                            <th style={{ textAlign: 'right' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedList.length > 0 ? (
                                            sortedList.map((record, index) => (
                                                <tr key={index}>
                                                    <td>{record.purpose}</td>
                                                    <td>
                                                        {record.name}
                                                        {record.email && (
                                                            <>
                                                                <br />
                                                                <a href={`mailto:${record.email}`} style={{ fontSize: 'smaller' }}>({record.email})</a>
                                                            </>
                                                        )}
                                                    </td>
                                                    <td>{record.contact}</td>
                                                    <td>{record.id_proof}</td>
                                                    <td>{record.no_of_people}</td>
                                                    <td>{record.note}</td>
                                                    <td>{record.date}</td>
                                                    <td>{record.in_time}</td>
                                                    <td>{record.out_time}</td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        {record.image && (
                                                            <button className="btn-action" title="Download">
                                                                <i className="fa fa-download"></i>
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="10" style={{ textAlign: 'center', padding: '0' }}>
                                                    <div className="empty-state">
                                                        <div className="empty-state-text">No data available in table</div>
                                                        <div className="empty-illustration">
                                                            <img src="/images/addnewitem.svg" alt="empty" style={{ width: '200px', height: '170px' }} />
                                                        </div>
                                                        <div className="add-record-text">
                                                            <i className="fa fa-arrow-left"></i> Add new record or search with different criteria.
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

            {showDetailModal && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h4>Visitor Details</h4>
                            <button className="modal-close-icon" onClick={() => setShowDetailModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-info">
                                <p>No details found for this visitor.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default Visitors;
