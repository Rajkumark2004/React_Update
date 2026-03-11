import React, { useEffect } from 'react';
import { useSession } from '../../../context/SessionContext';

// ============================================================================
// FOOTER COMPONENT
// Converted from wisibles_30_12_2025/application/views/layout/footer.php
// UI Only - No backend logic
// ============================================================================

const Footer = () => {
    // Static mock data
    const currentYear = new Date().getFullYear();
    const appName = 'School Management System';

    const userData = {
        name: 'Admin',
        role: 'Administrator',
        id: 1,
        avatar: '/uploads/staff_images/default_male.jpg'
    };

    // Session Context
    const { sessions, currentSession, fetchSessions, setCurrentSession } = useSession();

    // Local state for the dropdown selection (before saving)
    const [selectedSessionId, setSelectedSessionId] = React.useState('');

    // Fetch sessions on mount and set the dropdown to current session
    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    // Update dropdown when currentSession changes
    useEffect(() => {
        if (currentSession) {
            setSelectedSessionId(currentSession.id);
        }
    }, [currentSession]);

    const handleSessionChange = (e) => {
        setSelectedSessionId(e.target.value);
    };

    const handleSaveSession = () => {
        // Find the selected session object
        const selectedSession = sessions.find(s => String(s.id) === String(selectedSessionId));
        if (selectedSession) {
            setCurrentSession(selectedSession);
            console.log('Saving session:', selectedSession);
            alert(`Session ${selectedSession.session} saved!`);
        } else {
            alert('Please select a valid session.');
        }
    };

    return (
        <>
            {/* Inline styles from footer.php */}
            <style>{`
                .footer-menu {
                    background-color: #fff;
                    position: fixed;
                    bottom: 0;
                }
                .profile-text {
                    font-size: 18px;
                    color: #444;
                }
            `}</style>

            {/* Desktop Footer */}
            <footer className="main-footer hide-mobile">
                &copy; {currentYear} {appName}
            </footer>

            {/* Mobile Footer Menu - shown on dashboard */}
            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 d-flex justify-content-center hide-desktop footer-menu">
                <div className="pull-right">
                    <div className="navbar-custom-menu">
                        <ul className="nav navbar-nav headertopmenu">
                            <li className="dropdown user-menu">
                                <a
                                    style={{ padding: '15px 12px' }}
                                    href={`/admin/staff/profile/${userData.id}`}
                                    data-original-title="My Profile"
                                    className="profile-text"
                                >
                                    <img
                                        src={userData.avatar}
                                        className="topuser-image"
                                        alt="User Image"
                                    />
                                    {' '}My Profile
                                </a>
                                <ul className="dropdown-menu dropdown-user menuboxshadow">
                                    <li>
                                        <div className="sstopuser">
                                            <div className="ssuserleft">
                                                <a href={`/admin/staff/profile/${userData.id}`}>
                                                    <img src={userData.avatar} alt="User Image" />
                                                </a>
                                            </div>
                                            <div className="sstopuser-test">
                                                <h4 className="text-capitalize">{userData.name}</h4>
                                                <h5>{userData.role}</h5>
                                            </div>
                                            <div className="divider"></div>
                                            <div className="sspass">
                                                <a
                                                    href={`/admin/staff/profile/${userData.id}`}
                                                    data-toggle="tooltip"
                                                    title="My Profile"
                                                >
                                                    <i className="fa fa-user"></i> Profile
                                                </a>
                                                <a
                                                    className="pl25"
                                                    href="/admin/admin/changepass"
                                                    data-toggle="tooltip"
                                                    title="Change Password"
                                                >
                                                    <i className="fa fa-key"></i> Password
                                                </a>
                                                <a className="pull-right" href="/site/logout">
                                                    <i className="fa fa-sign-out fa-fw"></i> Logout
                                                </a>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Control Sidebar Background */}
            <div className="control-sidebar-bg"></div>

            {/* Session Modal */}
            <div className="row">
                <div
                    className="modal fade"
                    id="sessionModal"
                    tabIndex="-1"
                    role="dialog"
                    aria-labelledby="sessionModalLabel"
                >
                    <form action="/admin/admin/activeSession" id="form_modal_session" onSubmit={(e) => e.preventDefault()}>
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <button
                                        type="button"
                                        className="close"
                                        data-dismiss="modal"
                                        aria-label="Close"
                                    >
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                    <h4 className="modal-title" id="sessionModalLabel">
                                        Current Session
                                    </h4>
                                </div>
                                <div className="modal-body sessionmodal_body">
                                    <div className="form-group">
                                        <label htmlFor="session_id" className="control-label">Session</label>
                                        <select
                                            className="form-control"
                                            id="session_id"
                                            name="session_id"
                                            value={selectedSessionId}
                                            onChange={handleSessionChange}
                                        >
                                            <option value="">Select</option>
                                            {sessions.map((sess) => (
                                                <option key={sess.id} value={sess.id}>{sess.session}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <div className="col-md-12">
                                        <button
                                            type="button"
                                            className="btn btn-primary submit_session"
                                            onClick={handleSaveSession}
                                            data-dismiss="modal"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Footer;

