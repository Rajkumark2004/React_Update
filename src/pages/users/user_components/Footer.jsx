import React, { useState, useEffect } from 'react';
import { useSession } from '../../../context/SessionContext';
import api from '../../../services/api';

// FOOTER COMPONENT
// Converted from wisibles_30_12_2025/application/views/layout/footer.php
// UI Only - No backend logic
// ============================================================================

const Footer = () => {
    // Static mock data
    const currentYear = new Date().getFullYear();
    const appName = 'School Management System';

    // Session Context
    const { sessions, currentSession, setCurrentSession } = useSession();

    // Local state for the dropdown selection
    const [selectedSessionId, setSelectedSessionId] = useState('');

    // Update dropdown when currentSession changes
    useEffect(() => {
        if (currentSession) {
            setSelectedSessionId(currentSession.id);
        }
    }, [currentSession]);

    const handleSessionChange = (e) => {
        setSelectedSessionId(e.target.value);
    };

    const handleSaveSession = async () => {
        const selectedSession = sessions.find(s => String(s.id) === String(selectedSessionId));
        if (selectedSession) {
            try {
                const response = await api.updateAdminSession(selectedSessionId);
                console.log('Footer.jsx: Session update response:', response);
                if (response && response.status) {
                    setCurrentSession(selectedSession);
                    console.log('Footer.jsx: Update successful, reloading page...');
                    window.location.reload();
                }
            } catch (error) {
                console.error("Failed to update session:", error);
                alert("Failed to change session.");
            }
        }
    };

    // User Data for mobile footer profile link
    const [userData, setUserData] = useState({
        name: 'Admin',
        role: 'Administrator',
        id: 1,
        avatar: '/uploads/staff_images/default_male.jpg'
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setUserData({
                    name: user.username || 'Admin',
                    role: Object.keys(user.roles || {})[0] || 'Administrator',
                    id: user.id || 1,
                    avatar: user.image || '/uploads/staff_images/default_male.jpg'
                });
            } catch (e) {
                console.error('Failed to parse user data in Footer:', e);
            }
        }
    }, []);

    return (
        <>
            {/* Inline styles from footer.php */}
            <style>{`
            `}</style>

            {/* Desktop Footer */}
            <footer className="main-footer hide-mobile">
                &copy; {currentYear} {appName}
            </footer>


            {/* Control Sidebar Background */}
            <div className="control-sidebar-bg"></div>

            {/* Session Modal - Moved here for correct z-index / backdrop fix */}
            <div className="row">
                <div
                    className="modal fade"
                    id="sessionModal"
                    tabIndex="-1"
                    role="dialog"
                    aria-labelledby="sessionModalLabel"
                >
                    <form id="form_modal_session" onSubmit={(e) => e.preventDefault()}>
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