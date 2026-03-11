
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from './user_components/Header_user';
import Sidebar from './user_components/Sidebar_user';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';
import { api_users } from '../../services/api_users';
import '../../utils/include_files.js';

const Homework = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    const [userData, setUserData] = useState({
        name: "User",
        role: "student",
        id: "",
        avatar: "/uploads/student_images/no_image.png",
        adminLogoUrl: ""
    });

    const [isLoading, setIsLoading] = useState(true);
    const [openHomework, setOpenHomework] = useState([]);
    const [closedHomework, setClosedHomework] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('open'); // 'open' or 'closed'

    // Daily Assignment States
    const [isDailyAssignmentModalOpen, setIsDailyAssignmentModalOpen] = useState(false);
    const [dailyAssignmentLoading, setDailyAssignmentLoading] = useState(false);
    const [dailyAssignmentData, setDailyAssignmentData] = useState({
        student_id: "",
        daily_assignments: [],
        subject_list: []
    });

    const sessionYear = currentSession?.session || '2024-25';
    const themeColor = "#9c68e4";

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user info for header
                const storedUser = localStorage.getItem('user');
                let initialName = "User";
                if (storedUser) {
                    const userObj = JSON.parse(storedUser);
                    initialName = userObj.username || "User";
                    setUserData(prev => ({
                        ...prev,
                        name: initialName,
                        role: userObj.role || 'student',
                        avatar: userObj.image || "/uploads/student_images/no_image.png"
                    }));
                }

                // Fetch Dashboard to get student ID and logo
                const dashRes = await api_users.getUserDashboard();
                if (dashRes && dashRes.status && dashRes.data && dashRes.data.student) {
                    setUserData(prev => ({
                        ...prev,
                        name: dashRes.data.student.name || initialName,
                        id: dashRes.data.student.id || prev.id,
                        adminLogoUrl: dashRes.data.sch_setting?.admin_logo && dashRes.data.sch_setting?.base_url
                            ? `${dashRes.data.sch_setting.base_url}uploads/school_content/admin_logo/${dashRes.data.sch_setting.admin_logo}`
                            : ""
                    }));
                }

                // Fetch real Homework
                const res = await api_users.getHomework();
                if (res && res.status && res.data) {
                    setOpenHomework(res.data.open_homework || []);
                    setClosedHomework(res.data.closed_homework || []);
                }
            } catch (error) {
                console.error("Failed to load homework:", error);
            } finally {
                setIsLoading(false);
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

    const handleOpenDailyAssignment = async () => {
        setIsDailyAssignmentModalOpen(true);
        setDailyAssignmentLoading(true);
        try {
            const res = await api_users.getDailyAssignment();
            if (res && res.status && res.data) {
                setDailyAssignmentData(res.data);
            }
        } catch (error) {
            console.error("Failed to load daily assignments:", error);
        } finally {
            setDailyAssignmentLoading(false);
        }
    };

    const currentHomeworkList = activeTab === 'open' ? openHomework : closedHomework;

    const filteredData = currentHomeworkList.filter(item => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            (item.class && item.class.toLowerCase().includes(term)) ||
            (item.section && item.section.toLowerCase().includes(term)) ||
            (item.subject_name && item.subject_name.toLowerCase().includes(term)) ||
            (item.description && item.description.toLowerCase().includes(term))
        );
    });

    return (
        <div className="wrapper">
            <style>{`
                .content-wrapper, .main-footer {
                    margin-left: 80px !important;
                }
                .content-wrapper {
                    background-color: #f7f8fa !important;
                    padding-top: 25px !important;
                    margin-top: 50px !important;
                    min-height: calc(100vh - 50px);
                }
                
                /* Keep standard spacing for tab boxes */
                .nav-tabs-custom {
                    margin: 0 15px 15px 15px;
                    border-radius: 4px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    background: #fff;
                }

                @media (max-width: 991px) {
                    .content-wrapper, .main-footer {
                        margin-left: 0 !important;
                    }
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
                currentUrl="/user/homework"
            />

            <div className="content-wrapper">
                <section className="content" style={{ marginTop: '15px' }}>
                    <div className="nav-tabs-custom border0 navnoshadow">
                        <div className="box-header with-border" style={{ padding: '15px 15px 35px 15px' }}>
                            <h3 className="box-title pull-left" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontWeight: 600, fontSize: '18px' }}>
                                Homework
                            </h3>
                            <div className="pull-right">
                                <button className="btn btn-primary btn-sm" onClick={handleOpenDailyAssignment}>
                                    <i className="fa fa-plus"></i> Daily Assignment
                                </button>
                            </div>
                        </div>
                        <ul className="nav nav-tabs">
                            <li className={activeTab === 'open' ? 'active' : ''}>
                                <a href="#tab_1" data-toggle="tab" aria-expanded={activeTab === 'open'} onClick={(e) => { e.preventDefault(); setActiveTab('open'); }}>
                                    <i className="fa fa-list"></i> Upcoming Homework
                                </a>
                            </li>
                            <li className={activeTab === 'closed' ? 'active' : ''}>
                                <a href="#tab_2" data-toggle="tab" aria-expanded={activeTab === 'closed'} onClick={(e) => { e.preventDefault(); setActiveTab('closed'); }}>
                                    <i className="fa fa-newspaper-o"></i> Closed Homework
                                </a>
                            </li>
                        </ul>

                        <div className="tab-content">
                            {/* UPCOMING HOMEWORK (LIST VIEW) */}
                            <div className={`tab-pane ${activeTab === 'open' ? 'active' : ''} table-responsive no-padding`} id="tab_1">
                                {isLoading ? (
                                    <div style={{ textAlign: 'center', padding: '30px' }}>Loading homework...</div>
                                ) : openHomework.filter(hw => !searchTerm || Object.values(hw).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))).length === 0 ? (
                                    <div className="text-center" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                                        <div style={{ color: '#ffb3b3ff', fontFamily: 'Roboto-Bold', fontSize: '10px' }}>No data available in table</div>
                                        <img src="/images/addnewitem.svg" alt="No Data" style={{ marginBottom: 0, width: '150px' }} />
                                        <div style={{ color: 'green', fontFamily: 'Roboto-Bold', fontSize: '10px' }}>&lt;- Add new record or search with different criteria</div>
                                    </div>
                                ) : (
                                    <table className="table table-striped table-bordered table-hover">
                                        <thead>
                                            <tr>
                                                <th>Class</th>
                                                <th>Section</th>
                                                <th>Subject Group</th>
                                                <th>Subject</th>
                                                <th>Homework Date</th>
                                                <th>Submission Date</th>
                                                <th>Evaluation Date</th>
                                                <th>Max Marks</th>
                                                <th className="text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {openHomework.filter(hw => !searchTerm || Object.values(hw).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))).map((hw, idx) => (
                                                <tr key={hw.id || idx}>
                                                    <td>{hw.class || ''}</td>
                                                    <td>{hw.section || ''}</td>
                                                    <td>{hw.subject_group || ''}</td>
                                                    <td>{hw.subject_name || ''}</td>
                                                    <td>{hw.homework_date}</td>
                                                    <td>{hw.submit_date}</td>
                                                    <td>{hw.evaluation_date || ''}</td>
                                                    <td>{hw.marks || ''}</td>
                                                    <td className="text-right">
                                                        <button className="btn btn-default btn-xs" data-toggle="tooltip" title="View"><i className="fa fa-reorder"></i></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {/* CLOSED HOMEWORK (DETAILS VIEW) */}
                            <div className={`tab-pane ${activeTab === 'closed' ? 'active' : ''}`} id="tab_2">
                                {isLoading ? (
                                    <div style={{ textAlign: 'center', padding: '30px' }}>Loading homework...</div>
                                ) : closedHomework.filter(hw => !searchTerm || Object.values(hw).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))).length === 0 ? (
                                    <div className="text-center" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', minHeight: '200px' }}>
                                        <div style={{ color: '#999', fontFamily: 'Roboto-Bold', fontSize: '10px' }}>No data available in table</div>
                                        <img src="/images/addnewitem.svg" alt="No Data" style={{ marginBottom: 0, width: '150px' }} />
                                        <div style={{ color: 'green', fontFamily: 'Roboto-Bold', fontSize: '10px' }}>&lt;- Add new record or search with different criteria</div>
                                    </div>
                                ) : (
                                    closedHomework.filter(hw => !searchTerm || Object.values(hw).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))).map((hw, idx) => (
                                        <div className="carousel-row" key={hw.id || idx}>
                                            <div className="slide-row">
                                                <div className="carousel slide slide-carousel">
                                                    <div className="carousel-inner">
                                                        <div className="item active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#fafafa', border: '1px solid #eee' }}>
                                                            {/* Thumbnail placeholder SVG */}
                                                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                                <polyline points="14 2 14 8 20 8"></polyline>
                                                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                                                <polyline points="10 9 9 9 8 9"></polyline>
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="slide-content">
                                                    <h4><span>{hw.subject_name} ({hw.subject_group || 'Subject Group'})</span></h4>
                                                    <div className="row">
                                                        <div className="col-xs-6 col-md-6">
                                                            <address>
                                                                <strong><b>Class: </b>{hw.class || ''} ({hw.section || ''})</strong><br />
                                                                <b>Homework Date: </b>{hw.homework_date}<br />
                                                                <b>Submission Date: </b>{hw.submit_date}<br />
                                                            </address>
                                                        </div>
                                                        <div className="col-xs-6 col-md-6">
                                                            <b>Evaluation Date:&nbsp;</b>{hw.evaluation_date || '-'}<br />
                                                            <b>Created By: </b> {hw.created_by || 'Admin'}<br />
                                                            <b>Status: </b> <span className="label label-success">Completed</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="slide-footer">
                                                    <span className="pull-right buttons">
                                                        <button className="btn btn-default btn-xs" data-toggle="tooltip" title="View"><i className="fa fa-reorder"></i></button>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Daily Assignment Modal */}
                <div className={`modal fade ${isDailyAssignmentModalOpen ? 'in' : ''}`} style={{ display: isDailyAssignmentModalOpen ? 'block' : 'none', background: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h4 className="modal-title box-title"><i className="fa fa-plus"></i> Daily Assignment</h4>
                                <button type="button" className="close" onClick={() => setIsDailyAssignmentModalOpen(false)}>×</button>
                            </div>
                            <div className="modal-body">
                                {dailyAssignmentLoading ? (
                                    <div style={{ textAlign: 'center', padding: '30px' }}>Loading assignments...</div>
                                ) : (
                                    <>
                                        {/* Display Assignments logic could go here */}
                                        {dailyAssignmentData.daily_assignments.length === 0 ? (
                                            <div className="alert alert-info">
                                                No daily assignments found for today.
                                            </div>
                                        ) : (
                                            <div className="table-responsive">
                                                <table className="table table-striped table-bordered table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th>Subject</th>
                                                            <th>Description</th>
                                                            <th>Date</th>
                                                            <th>Attachment</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {dailyAssignmentData.daily_assignments.map((assignment, index) => (
                                                            <tr key={index}>
                                                                <td>{assignment.subject_name}</td>
                                                                <td>{assignment.description}</td>
                                                                <td>{assignment.date}</td>
                                                                <td>{assignment.attachment ? <a href={assignment.attachment} target="_blank" rel="noopener noreferrer" className="btn btn-default btn-xs"><i className="fa fa-download"></i></a> : ''}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        <h4 className="page-header" style={{ marginTop: '20px' }}>Available Subjects</h4>
                                        <div className="table-responsive">
                                            <table className="table table-striped table-bordered table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>Subject</th>
                                                        <th>Subject Group</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {dailyAssignmentData.subject_list && dailyAssignmentData.subject_list.length > 0 ? (
                                                        dailyAssignmentData.subject_list.map((sub, idx) => (
                                                            <tr key={idx}>
                                                                <td>{sub.subject_name}</td>
                                                                <td>{sub.subject_group_name}</td>
                                                                <td><button className="btn btn-default btn-xs" title="Add Assignment"><i className="fa fa-plus"></i></button></td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr><td colSpan="3" className="text-center">No subjects available</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            <Footer />
        </div>
    );
};

export default Homework;
