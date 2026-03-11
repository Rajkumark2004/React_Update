
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './user_components/Header_user';
import Sidebar from './user_components/Sidebar_user';
import Footer from './user_components/Footer';
import TopSidebar from './user_components/TopSidebar';
import { useSession } from '../../context/SessionContext';
import { api_users } from '../../services/api_users';
import '../../utils/include_files.js';

const DailyAssignment = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    const [userData, setUserData] = useState({
        name: "User",
        role: "Student",
        id: "",
        avatar: "/uploads/student_images/no_image.png",
        adminLogoUrl: ""
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [assignmentList, setAssignmentList] = useState([]);
    const [subjectList, setSubjectList] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [addForm, setAddForm] = useState({ subject: '', title: '', description: '', file: null, dragOver: false });
    const [editForm, setEditForm] = useState({ id: null, subject: '', title: '', description: '', file: null, dragOver: false });

    const sessionYear = currentSession?.session || '2024-25';
    const themeColor = "#9c68e4";

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
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

                // Fetching subjects and assignments would go here if APIs were ready
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
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

    const handleAddFormChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'file') {
            setAddForm(prev => ({ ...prev, file: files[0] }));
        } else {
            setAddForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleEditFormChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'file') {
            setEditForm(prev => ({ ...prev, file: files[0] }));
        } else {
            setEditForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const filteredData = assignmentList.filter(item => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            (item.subject_name && item.subject_name.toLowerCase().includes(term)) ||
            (item.title && item.title.toLowerCase().includes(term)) ||
            (item.description && item.description.toLowerCase().includes(term))
        );
    });

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

                /* Table Styling Reference: UserHostelRoom.jsx */
                .da-box {
                    background: #fff;
                    border-radius: 4px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1) !important;
                    margin: 25px 10px 15px 10px;
                }
                .da-header {
                    padding: 10px 15px;
                    border-bottom: 1px solid #f4f4f4;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .box-title {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 200 !important;
                    color: #333;
                }
                .da-add-btn {
                    background: ${themeColor};
                    color: #fff;
                    border: none;
                    padding: 6px 18px;
                    border-radius: 20px;
                    font-size: 13px;
                    cursor: pointer;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .da-table-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 4px 0px;
                    margin-bottom: 3px;
                    flex-wrap: nowrap;
                }
                .da-search-input {
                    border: none;
                    border-bottom: 1px solid #ccc;
                    padding: 4px 2px;
                    font-size: 13px;
                    outline: none;
                    width: 180px;
                    background: transparent;
                }
                .da-search-input:focus {
                    border-bottom-color: ${themeColor};
                }
                .da-export-icons {
                    display: flex;
                    gap: 2px;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 3px;
                    justify-content: flex-end;
                    width: 11%;
                }
                .da-export-btn {
                    background: transparent;
                    border: none;
                    padding: 4px 6px;
                    cursor: pointer;
                    font-size: 14px;
                    color: #555;
                    transition: all 0.2s;
                }
                .da-export-btn:hover {
                    color: #000;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    background: #e7e7e7;
                    border-radius: 2px;
                }

                .da-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 13px;
                }
                .da-table th {
                    border: none;
                    border-bottom: 1px solid #ddd;
                    padding: 10px 20px 10px 12px;
                    color: #333;
                    font-weight: 600;
                    text-align: left;
                    cursor: pointer;
                    white-space: nowrap;
                    position: relative;
                }
                .da-table td {
                    padding: 4px 12px;
                    border-bottom: 1px solid #eee;
                    color: #555;
                    vertical-align: middle;
                }
                .da-table tr:hover { background: #fafafa; }

                .da-action-btn {
                    background: transparent;
                    border: none;
                    padding: 3px 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    color: #666;
                    transition: all 0.2s;
                    margin-left: 5px;
                }
                .da-table tr:hover .da-action-btn {
                    background: #fff;
                    border: 1px solid #ddd;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                .da-action-btn:hover {
                    color: #333;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2) !important;
                }

                .da-table-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 10px;
                    font-size: 10px;
                    border-bottom: 1px solid #eee;
                }
                .da-records-info { font-weight: 500; }
                .da-pagination { display: flex; gap: 4px; align-items: center; }
                .da-page-arrow {
                    background: transparent;
                    border: none;
                    padding: 1px 3px;
                    cursor: pointer;
                    font-size: 8px;
                    color: #887274 !important;
                    font-weight: 100 !important;
                }
                .da-page-arrow:disabled { cursor: not-allowed; color: #ddd; }
                .da-page-number {
                    background: #f4f4f4;
                    padding: 1px 7px;
                    min-width: 20px;
                    text-align: center;
                    border-radius: 2px;
                    font-size: 10px;
                }

                /* Modal Styles from Original DailyAssignment.jsx */
                .da-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.4);
                    z-index: 2000;
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    padding-top: 40px;
                }
                .da-modal {
                    background: #fff;
                    border-radius: 6px;
                    width: 90%;
                    max-width: 1050px;
                    max-height: 70vh;
                    overflow-y: auto;
                    box-shadow: 0 5px 30px rgba(0,0,0,0.2);
                    position: relative;
                }
                .da-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 18px 25px 12px 25px;
                    border-bottom: none;
                    background: #fff;
                }
                .da-modal-header h4 { margin: 0; font-size: 17px; color: #333; font-weight: 600; }
                .da-modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: #333; font-weight: bold; }
                .da-modal-body { padding: 10px 25px 0 25px; }
                .da-form-group { margin-bottom: 15px; }
                .da-form-group label { display: block; margin-bottom: 8px; font-size: 13px; font-weight: 600; color: #333; }
                .da-form-group label .req { color: #dd4b39; margin-left: 2px; }
                .da-form-group input[type="text"], .da-form-group select, .da-form-group textarea {
                    width: 100%; padding: 4px 0; border: none; border-bottom: 1px solid #ddd; border-radius: 0; font-size: 12px; outline: none; background: transparent; color: #555;
                }
                .da-form-group select { appearance: none; background-image: url("data:image/svg+xml,..."); background-repeat: no-repeat; background-position: right 4px center; }
                .da-form-group input:focus, .da-form-group select:focus, .da-form-group textarea:focus { border-bottom-color: ${themeColor}; }
                
                .da-file-dropzone { border: none; border-bottom: 1px solid #ddd; padding: 8px 0; cursor: pointer; transition: border-color 0.2s; background: transparent; }
                .da-file-dropzone:hover { border-bottom-color: ${themeColor}; }
                .da-modal-footer { padding: 8px 25px; border-top: 1px solid #f4f4f4; display: flex; justify-content: flex-end; }
                .da-save-btn { background: ${themeColor}; color: #fff; border: none; padding: 8px 28px; border-radius: 20px; font-size: 14px; cursor: pointer; font-weight: 500; }

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
                currentUrl="/user/daily_assignment"
            />

            <div className="content-wrapper">
                <section className="content" style={{ padding: "4px" }}>
                    <div className="hide-mobile" style={{ marginBottom: '10px' }}>
                        <TopSidebar sessionYear={sessionYear} />
                    </div>

                    <div className="da-box">
                        <div className="da-header">
                            <h3 className="box-title">Daily Assignment List</h3>
                            <button className="da-add-btn" onClick={() => setShowAddModal(true)}>
                                <i className="fa fa-plus"></i> Daily Assignment
                            </button>
                        </div>

                        <div className="da-table-wrapper">
                            <div className="da-table-top">
                                <div className="da-search">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="da-search-input"
                                    />
                                </div>
                                <div className="da-export-icons">
                                    <button className="da-export-btn" title="Copy"><i className="fa fa-copy"></i></button>
                                    <button className="da-export-btn" title="Excel"><i className="fa fa-file-excel-o"></i></button>
                                    <button className="da-export-btn" title="CSV"><i className="fa fa-file-text-o"></i></button>
                                    <button className="da-export-btn" title="PDF"><i className="fa fa-file-pdf-o"></i></button>
                                    <button className="da-export-btn" title="Print"><i className="fa fa-print"></i></button>
                                    <button className="da-export-btn" title="Columns"><i className="fa fa-columns"></i></button>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="da-table">
                                    <thead>
                                        <tr>
                                            <th>Subject <i className="fa fa-caret-down" style={{ color: '#ccc', marginLeft: '4px' }}></i></th>
                                            <th>Title <i className="fa fa-caret-down" style={{ color: '#ccc', marginLeft: '4px' }}></i></th>
                                            <th>Description <i className="fa fa-caret-down" style={{ color: '#ccc', marginLeft: '4px' }}></i></th>
                                            <th>Remark <i className="fa fa-caret-down" style={{ color: '#ccc', marginLeft: '4px' }}></i></th>
                                            <th>Submission Date <i className="fa fa-caret-down" style={{ color: '#ccc', marginLeft: '4px' }}></i></th>
                                            <th>Evaluation Date <i className="fa fa-caret-down" style={{ color: '#ccc', marginLeft: '4px' }}></i></th>
                                            <th style={{ textAlign: 'right' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                                                    <div className="da-empty-state">
                                                        <div className="da-empty-text" style={{ color: '#dd4b39', fontSize: '14px', marginBottom: '20px' }}>No data available in table</div>
                                                        <img src="/images/addnewitem.svg" alt="empty" style={{ width: '200px', height: '170px', marginBottom: '20px' }} />
                                                        <div className="da-empty-hint" style={{ color: '#3c763d', fontSize: '13px', fontWeight: 'bold' }}>
                                                            <i className="fa fa-arrow-left" style={{ marginRight: '5px' }}></i>
                                                            Add new record or search with different criteria.
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredData.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.subject_name}</td>
                                                    <td>{item.title}</td>
                                                    <td>{item.description}</td>
                                                    <td>{item.remark}</td>
                                                    <td>{item.date}</td>
                                                    <td>{item.evaluation_date}</td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <button className="da-action-btn"><i className="fa fa-download"></i></button>
                                                        <button className="da-action-btn"><i className="fa fa-pencil"></i></button>
                                                        <button className="da-action-btn"><i className="fa fa-remove"></i></button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="da-table-footer">
                                <div className="da-records-info">
                                    Records: {filteredData.length > 0 ? `1 to ${filteredData.length} of ${filteredData.length}` : '0 of 0'}
                                </div>
                                <div className="da-pagination">
                                    <button className="da-page-arrow" disabled><i className="fa fa-chevron-left"></i></button>
                                    <div className="da-page-number">1</div>
                                    <button className="da-page-arrow" disabled><i className="fa fa-chevron-right"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {showAddModal && (
                <div className="da-modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="da-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="da-modal-header">
                            <h4>Add Daily Assignment</h4>
                            <button className="da-modal-close" onClick={() => setShowAddModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); setShowAddModal(false); }}>
                            <div className="da-modal-body">
                                <div className="da-form-group">
                                    <label>Subject <span className="req">*</span></label>
                                    <select name="subject" required>
                                        <option value="">Select</option>
                                        {subjectList.map((sub, idx) => (
                                            <option key={idx} value={sub.subject_group_subject_id}>{sub.subject_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="da-form-group">
                                    <label>Title <span className="req">*</span></label>
                                    <input type="text" name="title" required />
                                </div>
                                <div className="da-form-group">
                                    <label>Description</label>
                                    <textarea name="description" rows="4"></textarea>
                                </div>
                                <div className="da-form-group">
                                    <label>Attach Document</label>
                                    <div className="da-file-dropzone" onClick={() => document.getElementById('add-file-input').click()}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#999', fontSize: '13px' }}>
                                            <i className="fa fa-cloud-upload" style={{ fontSize: '20px', color: '#bbb' }}></i>
                                            <span>Drag and drop a file here or select</span>
                                        </div>
                                        <input type="file" id="add-file-input" style={{ display: 'none' }} />
                                    </div>
                                </div>
                            </div>
                            <div className="da-modal-footer">
                                <button type="submit" className="da-save-btn">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default DailyAssignment;
