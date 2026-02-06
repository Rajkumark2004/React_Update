
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import '../../utils/include_files';

const NoticeBoard = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);

    // Mock Data for Notifications
    const [notifications] = useState([
        {
            id: 1,
            title: 'School Sports Day',
            message: '<p>The annual sports day will be held on 25th March. All students are requested to participate.</p>',
            publish_date: '2024-03-20',
            created_id: 1 // Assuming 1 is current user for demo
        },
        {
            id: 2,
            title: 'Parent Teacher Meeting',
            message: '<p>PTM is scheduled for next Saturday. Please attend.</p>',
            publish_date: '2024-03-15',
            created_id: 2
        },
        {
            id: 3,
            title: 'Holiday Announcement',
            message: '<p>School will remain closed on Monday due to public holiday.</p>',
            publish_date: '2024-03-10',
            created_id: 1
        }
    ]);

    // Mock User ID
    const user_id = 1;

    const openDetails = (notification) => {
        setSelectedNotification(notification);
        setIsSidebarOpen(true);
    };

    const closeDetails = (e) => {
        if (e) e.preventDefault();
        setIsSidebarOpen(false);
        setSelectedNotification(null);
    };

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ minHeight: '946px', marginTop: '16px' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-bullhorn"></i> Communicate <small>1.0.0</small>
                    </h1>
                </section>

                <section className="content">
                    <div className="row mt-20">
                        {/* Left Sidebar (Submenu) */}
                        <div className="col-md-2 hide-mobile">
                            <div className="box border0">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Communicate</h3>
                                </div>
                                <ul className="tablists">
                                    <li>
                                        <Link to="/admin/notification" className="active">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/communication/1.png" alt="icon1" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} />
                                            Notice Board
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/mail">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/communication/2.png" alt="icon2" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} />
                                            Send Email
                                        </Link>
                                    </li>
                                    {/* <li>
                                        <Link to="/admin/mailsms/compose_sms">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/communication/3.png" alt="icon3" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} />
                                            Send SMS
                                        </Link>
                                    </li> */}
                                    {/* <li>
                                        <Link to="/admin/sendwhatsapp/compose_sms">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/communication/3.png" alt="icon2" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} />
                                            Send Whatsapp
                                        </Link>
                                    </li> */}
                                    <li>
                                        <Link to="/admin/notification_class/index">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/communication/1.png" alt="icon7" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} />
                                            Circular
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/mail/email_sms_log">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/communication/4.png" alt="icon4" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} />
                                            Email / SMS Log
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/mail/schedule_log">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/communication/5.png" alt="icon5" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} />
                                            Schedule Email SMS Log
                                        </Link>
                                    </li>
                                    {/* <li>
                                        <Link to="/student/bulkmail">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/communication/6.png" alt="icon6" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} />
                                            Login Credentials Send
                                        </Link>
                                    </li> */}
                                    <li>
                                        <Link to="/admin/mail/send_reminders">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/fees/fr.png" alt="icon6" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} />
                                            Send Reminders
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/mail/email_template">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/communication/7.png" alt="icon7" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} />
                                            Email Template
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/mail/sms_template">
                                            <img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/communication/8.png" alt="icon7" className="img-fluid" style={{ width: '20px', marginRight: '5px' }} />
                                            SMS Template
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="col-md-10">
                            <div className="box box-solid1 box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title"><i className="fa fa-commenting-o"></i> Notice Board</h3>
                                    <div className="box-tools pull-right">
                                        <Link to="/admin/notification_class/add" className="btn btn-primary btn-sm">
                                            <i className="fa fa-plus"></i> Post New Message
                                        </Link>
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs mright5 hide-desktop">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body pt0">
                                    {notifications.length === 0 ? (
                                        <div className="alert alert-info">No Record Found</div>
                                    ) : (
                                        notifications.map((notification) => (
                                            <div key={notification.id} className="email-info d-flex" style={{ borderBottom: '1px solid #f4f4f4', padding: '10px 0' }}>
                                                <a href="#" className="navbar-toggle2 force-visible mail-sidebar w-100" onClick={(e) => { e.preventDefault(); openDetails(notification); }} style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
                                                    <h4 className="h4-title" style={{ margin: '0 0 5px 0', fontSize: '15px' }}>
                                                        <i className="fa fa-envelope-o" style={{ marginRight: '5px' }}></i>
                                                        {notification.title}
                                                    </h4>
                                                    <div className="email-discription" style={{ color: '#666', fontSize: '13px' }} dangerouslySetInnerHTML={{ __html: notification.message.substring(0, 100) + '...' }}></div>
                                                </a>
                                                <div className="d-flex ptt10 hover-show" style={{ marginLeft: '10px' }}>
                                                    {notification.created_id === user_id && (
                                                        <>
                                                            <Link to={`/admin/notification/edit/${notification.id}`} className="" data-toggle="tooltip" title="Edit" style={{ marginRight: '5px', color: '#666' }}>
                                                                <i className="fa fa-pencil"></i>
                                                            </Link>
                                                            <Link to="#" className="" data-toggle="tooltip" title="Delete" onClick={(e) => { e.preventDefault(); if (window.confirm('Are you sure you want to delete this?')) console.log('delete'); }} style={{ color: '#666' }}>
                                                                <i className="fa fa-remove"></i>
                                                            </Link>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Sidebar Container / Drawer */}
                                <aside className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`} role="dialog">
                                    <article className="email-collection">
                                        <a href="#" className="mail-sidebar mail-close-btn" onClick={closeDetails}>
                                            <i className="fa fa-times fs-2"></i>
                                        </a>
                                        {selectedNotification && (
                                            <div id="notificationdata" style={{ padding: '20px' }}>
                                                <h3>{selectedNotification.title}</h3>
                                                <ul className="list-unstyled">
                                                    <li><i className="fa fa-calendar-check-o"></i> Publish Date: {selectedNotification.publish_date}</li>
                                                    <li><i className="fa fa-calendar"></i> Notice Date: {selectedNotification.publish_date}</li>
                                                    <li><i className="fa fa-user"></i> Created By: Super Admin</li>
                                                </ul>
                                                <div className="email-body" style={{ marginTop: '20px' }} dangerouslySetInnerHTML={{ __html: selectedNotification.message }}></div>
                                            </div>
                                        )}
                                    </article>
                                </aside>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
            <style>{`
                .sidebar-container {
                    position: fixed;
                    top: 0;
                    right: -500px;
                    width: 500px;
                    height: 100%;
                    background: #fff;
                    z-index: 1050;
                    box-shadow: -2px 0 5px rgba(0,0,0,0.1);
                    transition: all 0.3s ease;
                    overflow-y: auto;
                }
                .sidebar-container.open {
                    right: 0;
                }
                .mail-close-btn {
                    position: absolute;
                    top: 10px;
                    right: 15px;
                    font-size: 20px;
                    color: #444;
                }
                .email-info:hover .hover-show {
                    display: block !important;
                }
                .hover-show {
                    display: none !important;
                }
                .email-info:hover {
                    background-color: #f9f9f9;
                }
            `}</style>
        </div>
    );
};

export default NoticeBoard;
