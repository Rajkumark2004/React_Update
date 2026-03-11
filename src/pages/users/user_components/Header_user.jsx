import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CircleUser, X, Loader2, GraduationCap, ChevronRight } from 'lucide-react';
import { api } from '../../../services/api';
import { api_users } from '../../../services/api_users';
import { useLogo } from '../../../context/LogoContext';

const Header = ({
    appName = 'School Management System',
    userData,
    pendingTasks = [],
    handleLogout,
    loading = false,
    toggleSidebar,
    isSidebarOpen,
    headerLogoUrl
}) => {
    // Get logo URLs from context
    const { logos } = useLogo();
    const headerLogo = logos.admin_logo || '/images/wisibles_logo.png';

    // Dropdown State
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const userDropdownRef = useRef(null);
    const navigate = useNavigate();

    // Task/Todo State
    const [tasks, setTasks] = useState([]);
    const [isTaskDropdownOpen, setIsTaskDropdownOpen] = useState(false);
    const taskDropdownRef = useRef(null);

    // Switch Class Modal State
    const [isSwitchClassModalOpen, setIsSwitchClassModalOpen] = useState(false);
    const [availableClasses, setAvailableClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [isSwitchingClass, setIsSwitchingClass] = useState(false);

    // Fetch to-do tasks from API
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                let userId = '1';
                let roleId = '7';
                try {
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        const user = JSON.parse(storedUser);
                        userId = user.id || '1';
                        const roles = user.roles || {};
                        roleId = Object.values(roles)[0] || '7';
                    }
                } catch (e) { console.error('Failed to parse user:', e); }
                const res = await api.getCalendarEvents(userId, roleId);
                const allItems = Array.isArray(res.data) ? res.data : [];
                const todoList = allItems.filter(item => item.event_type === 'task' && item.is_active !== 'yes');
                setTasks(todoList);
            } catch (err) {
                console.error('Failed to fetch tasks:', err);
            }
        };
        fetchTasks();
    }, []);

    // Close task dropdown when clicking outside
    useEffect(() => {
        const handleClickOutsideTask = (event) => {
            if (taskDropdownRef.current && !taskDropdownRef.current.contains(event.target)) {
                setIsTaskDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutsideTask);
        return () => document.removeEventListener('mousedown', handleClickOutsideTask);
    }, []);

    // Mark task complete and remove from list
    const handleMarkComplete = async (id, currentStatus) => {
        const newStatus = currentStatus === 'yes' ? 'no' : 'yes';
        try {
            await api.markToDoComplete(id, newStatus);
            setTasks(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            console.error('Failed to mark task:', err);
        }
    };

    // User data with defaults
    let defaultUser = { name: 'User', role: 'Student', id: 1, avatar: '/uploads/student_images/default.jpg' };
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            defaultUser = {
                name: parsedUser.username || parsedUser.name || 'User',
                role: parsedUser.role || 'Student',
                id: parsedUser.id || 1,
                avatar: parsedUser.image || '/uploads/student_images/default.jpg'
            };
        }
    } catch (e) {
        console.error('Failed to parse user for header:', e);
    }
    const user = userData || defaultUser;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setIsUserDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Switch Class Handlers
    const handleSwitchClassClick = async () => {
        try {
            const res = await api_users.getStudentSessionClasses();
            if (res.status && res.data && res.data.studentclasses) {
                setAvailableClasses(res.data.studentclasses);
                if (res.data.studentclasses.length > 0) {
                    const active = res.data.studentclasses.find(c => c.is_active === 'yes');
                    setSelectedClassId(active ? active.student_session_id : res.data.studentclasses[0].student_session_id);
                }
                setIsSwitchClassModalOpen(true);
            }
        } catch (error) {
            console.error('Failed to fetch class options:', error);
            alert('Could not load class options. Please try again.');
        }
    };

    const handleUpdateClass = async () => {
        if (!selectedClassId) return;
        const selectedClass = availableClasses.find(c => String(c.student_session_id) === String(selectedClassId));
        if (!selectedClass) return;

        setIsSwitchingClass(true);
        try {
            await api_users.updateStudentClass(selectedClass.student_session_id, selectedClass.student_id);
            setIsSwitchClassModalOpen(false);
            window.location.reload(); // Refresh page to reflect new class context
        } catch (error) {
            console.error('Failed to update class:', error);
            alert('Failed to switch class. Please try again.');
            setIsSwitchingClass(false);
        }
    };

    return (
        <>
            {/* ==================== DESKTOP HEADER ==================== */}
            <header className="main-header hide-mobile" id="alert">
                {/* Logo - Links to Dashboard */}
                {/* Logo - Links to Dashboard */}
                <Link to="/user/dashboard" className="logo-hide-on-mobile logo">
                    <span className="logo-mini">
                        <img src={headerLogoUrl || headerLogo} alt={appName} />
                    </span>
                    <span className="logo-lg">
                        <img src={headerLogoUrl || headerLogo} alt={appName} style={{ maxHeight: '40px', objectFit: 'contain' }} />
                    </span>
                </Link>

                {/* Navbar */}
                <nav className="navbar navbar-static-top" role="navigation">
                    <div className="col-lg-5 col-md-3 col-sm-2 col-xs-4"></div>

                    <div className="col-lg-7 col-md-9 col-sm-10 col-xs-8" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <div className="pull-right">
                            {/* Custom Nav Items CSS */}
                            <style>{`
                                .custom-nav-right {
                                    display: flex;
                                    align-items: center;
                                }
                                
                                .custom-nav-item {
                                    padding: 0 12px;
                                    color: #555;
                                    font-size: 14px;
                                    display: flex;
                                    align-items: center;
                                    cursor: pointer;
                                    height: 50px;
                                    position: relative;
                                }
                                
                                .custom-nav-item:hover {
                                    background: transparent !important;
                                }
                                
                                .custom-nav-item i {
                                    font-size: 18px;
                                }
                                
                                .flag-icon {
                                    width: 22px;
                                    height: 14px;
                                    border: 1px solid #eee;
                                }

                                /* Tooltip */
                                .custom-nav-item[data-tooltip]::after {
                                    content: attr(data-tooltip);
                                    position: absolute;
                                    bottom: -35px;
                                    left: 50%;
                                    transform: translateX(-50%);
                                    background: rgba(0,0,0,0.8);
                                    color: #fff;
                                    padding: 5px 10px;
                                    border-radius: 4px;
                                    font-size: 11px;
                                    white-space: nowrap;
                                    visibility: hidden;
                                    opacity: 0;
                                    z-index: 1100;
                                    pointer-events: none;
                                }
                                .custom-nav-item:hover::after {
                                    visibility: visible;
                                    opacity: 1;
                                }

                                /* CHILD SELECTION MODAL SYSTEM - Migrated from LoginPage */
                                .child-modal-overlay {
                                    position: fixed;
                                    top: 0;
                                    left: 0;
                                    width: 100vw;
                                    height: 100vh;
                                    background: rgba(0, 0, 0, 0.45);
                                    backdrop-filter: blur(8px);
                                    z-index: 2000;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    animation: fadeIn 0.3s ease-out;
                                }

                                @keyframes fadeIn {
                                    from { opacity: 0; }
                                    to { opacity: 1; }
                                }

                                .child-modal-card {
                                    background: white;
                                    width: 90%;
                                    max-width: 460px;
                                    border-radius: 20px;
                                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                                    display: flex;
                                    flex-direction: column;
                                    overflow: hidden;
                                    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                                }

                                @keyframes slideUp {
                                    from { transform: translateY(20px); opacity: 0; }
                                    to { transform: translateY(0); opacity: 1; }
                                }

                                .child-modal-header {
                                    padding: 30px 30px 20px;
                                    text-align: center;
                                    background: linear-gradient(to bottom, #fcfaff, #ffffff);
                                }

                                .child-modal-header h3 {
                                    margin: 0 0 8px 0;
                                    font-size: 24px;
                                    font-weight: 700;
                                    color: #1a1a1a;
                                    line-height: 1.2;
                                }

                                .child-modal-header p {
                                    margin: 0;
                                    font-size: 15px;
                                    color: #6b7280;
                                }

                                .child-list {
                                    padding: 10px 20px;
                                    max-height: 400px;
                                    overflow-y: auto;
                                }

                                .child-list::-webkit-scrollbar {
                                    width: 6px;
                                }
                                .child-list::-webkit-scrollbar-thumb {
                                    background: #e5e7eb;
                                    border-radius: 10px;
                                }

                                .child-item {
                                    display: flex;
                                    align-items: center;
                                    padding: 16px;
                                    margin-bottom: 12px;
                                    border: 2px solid #f3f4f6;
                                    border-radius: 16px;
                                    cursor: pointer;
                                    transition: all 0.2s ease;
                                    position: relative;
                                    text-align: left;
                                }

                                .child-item:hover {
                                    border-color: #8f46d8;
                                    background: #f9f5ff;
                                    transform: translateY(-1px);
                                }

                                .child-item.active {
                                    border-color: #8f46d8;
                                    background: #f9f5ff;
                                    box-shadow: 0 4px 12px rgba(143, 70, 216, 0.1);
                                }

                                .child-avatar {
                                    width: 50px;
                                    height: 50px;
                                    background: #f3e8ff;
                                    color: #8f46d8;
                                    border-radius: 12px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    margin-right: 16px;
                                    flex-shrink: 0;
                                }

                                .child-info {
                                    flex: 1;
                                    display: flex;
                                    flex-direction: column;
                                }

                                .child-name {
                                    font-weight: 600;
                                    font-size: 17px;
                                    color: #111827;
                                }

                                .child-class {
                                    font-size: 14px;
                                    color: #6b7280;
                                }

                                .current-badge {
                                    position: absolute;
                                    top: 12px;
                                    right: 40px;
                                    background: #ecfdf5;
                                    color: #059669;
                                    font-size: 11px;
                                    font-weight: 600;
                                    padding: 2px 8px;
                                    border-radius: 20px;
                                }

                                .child-select-indicator {
                                    color: #d1d5db;
                                    transition: transform 0.2s ease;
                                }

                                .child-item.active .child-select-indicator {
                                    color: #8f46d8;
                                    transform: translateX(3px);
                                }

                                .child-modal-footer {
                                    padding: 24px 30px 30px;
                                    display: flex;
                                    gap: 12px;
                                }

                                .modal-submit-btn {
                                    flex: 2;
                                    padding: 14px;
                                    background: #8f46d8;
                                    color: white;
                                    border: none;
                                    border-radius: 14px;
                                    font-size: 16px;
                                    font-weight: 600;
                                    cursor: pointer;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    gap: 8px;
                                    transition: all 0.2s ease;
                                }

                                .modal-cancel-btn {
                                    flex: 1;
                                    padding: 14px;
                                    background: #f3f4f6;
                                    color: #4b5563;
                                    border: none;
                                    border-radius: 14px;
                                    font-size: 16px;
                                    font-weight: 600;
                                    cursor: pointer;
                                    transition: all 0.2s ease;
                                }

                                .modal-cancel-btn:hover {
                                    background: #e5e7eb;
                                }

                                .modal-submit-btn:hover:not(:disabled) {
                                    background: #7b3fe4;
                                    box-shadow: 0 10px 15px -3px rgba(143, 70, 216, 0.3);
                                }

                                .modal-submit-btn:disabled {
                                    opacity: 0.6;
                                    cursor: not-allowed;
                                }

                                .animate-spin {
                                    animation: spin 1s linear infinite;
                                }

                                @keyframes spin {
                                    from { transform: rotate(0deg); }
                                    to { transform: rotate(360deg); }
                                }
                            `}</style>
                            {/* Custom Nav Items (from UserDashboard) */}
                            <div className="custom-nav-right hide-mobile" style={{ display: 'flex', alignItems: 'center', height: '50px' }}>
                                <div className="custom-nav-item" data-tooltip="English">
                                    <img src="https://flagcdn.com/w20/us.png" className="flag-icon" alt="English" />
                                </div>
                                <div className="custom-nav-item" data-tooltip="Currency" style={{ fontWeight: 'bold' }}>
                                    INR
                                </div>
                                <div className="custom-nav-item" data-tooltip="Switch Class" onClick={handleSwitchClassClick} style={{ color: '#4CAF50' }}>
                                    <i className="fa fa-exchange"></i>
                                </div>
                                <div className="custom-nav-item" data-tooltip="Calendar">
                                    <i className="fa fa-calendar"></i>
                                </div>
                                <div className="custom-nav-item" data-tooltip="Task">
                                    <i className="fa fa-check-square-o"></i>
                                </div>
                            </div>

                            {/* Navbar Custom Menu */}
                            <div className="navbar-custom-menu">
                                <ul className="nav navbar-nav headertopmenu">
                                    {loading ? (
                                        <>
                                            <li><div className="skeleton-icon-circle"></div></li>
                                            <li><div className="skeleton-icon-circle"></div></li>
                                            <li><div className="skeleton-icon-circle"></div></li>
                                            <li>
                                                <div style={{ display: 'flex', alignItems: 'center', padding: '15px' }}>
                                                    <div className="skeleton-icon-circle" style={{ width: '30px', height: '30px', margin: 0 }}></div>
                                                </div>
                                            </li>
                                        </>
                                    ) : (
                                        <>
                                            {/* Calendar */}
                                            <li className="cal15 d-sm-none">
                                                <Link
                                                    to="/calendar"
                                                    data-toggle="tooltip"
                                                    title="Calendar"
                                                >
                                                    <i className="fa fa-calendar"></i>
                                                </Link>
                                            </li>

                                            {/* Tasks Dropdown */}
                                            <li className={`dropdown ${isTaskDropdownOpen ? 'open' : ''}`} data-toggle="tooltip" title="Tasks" ref={taskDropdownRef}>
                                                <a href="#" className="dropdown-toggle todoicon" onClick={(e) => { e.preventDefault(); setIsTaskDropdownOpen(!isTaskDropdownOpen); }}>
                                                    <i className="fa fa-check-square-o"></i>
                                                    {tasks.length > 0 && <span className="todo-indicator">{tasks.length}</span>}
                                                </a>
                                                <ul className="dropdown-menu menuboxshadow" style={{ display: isTaskDropdownOpen ? 'block' : 'none' }}>
                                                    <li className="todoview plr10 ssnoti">
                                                        You have {tasks.length} tasks
                                                        <Link to="/calendar" className="pull-right pt0" onClick={() => setIsTaskDropdownOpen(false)}>View All</Link>
                                                    </li>
                                                    <li>
                                                        <ul className="todolist">
                                                            {tasks.map((task) => (
                                                                <li key={task.id}>
                                                                    <div className="checkbox">
                                                                        <label style={task.is_active === 'yes' ? { textDecoration: 'line-through', color: '#4caf50' } : {}}>
                                                                            <input type="checkbox"
                                                                                checked={task.is_active === 'yes'}
                                                                                onChange={() => handleMarkComplete(task.id, task.is_active)}
                                                                            />
                                                                            <span style={{ color: task.event_color || 'inherit' }}>
                                                                                {task.event_title || task.title}
                                                                            </span>
                                                                        </label>
                                                                    </div>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </li>
                                                </ul>
                                            </li>


                                            {/* User Menu Dropdown */}
                                            <li className={`dropdown user-menu ${isUserDropdownOpen ? 'open' : ''}`} ref={userDropdownRef}>
                                                <a
                                                    className="dropdown-toggle"
                                                    style={{ padding: '15px 12px', cursor: 'pointer' }}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setIsUserDropdownOpen(!isUserDropdownOpen);
                                                    }}
                                                >
                                                    <CircleUser className="topuser-image" size={30} style={{ color: '#FFD700' }} />
                                                </a>
                                                <ul className="dropdown-menu dropdown-user menuboxshadow" style={{ display: isUserDropdownOpen ? 'block' : 'none' }}>
                                                    <li>
                                                        <div className="sstopuser">
                                                            <div className="ssuserleft">
                                                                <Link to="/user/user/profile" style={{ display: 'block', height: '100%', width: '100%' }}>
                                                                    <CircleUser size={60} color="#FFD700" strokeWidth={1.5} />
                                                                </Link>
                                                            </div>
                                                            <div className="sstopuser-test">
                                                                <Link to="/user/user/profile">
                                                                    <h4 className="text-capitalize">{user.name}</h4>
                                                                </Link>
                                                                <h5>{user.role}</h5>
                                                            </div>
                                                            <div className="divider"></div>
                                                            <div className="sspass">
                                                                <Link to="/user/user/profile" data-toggle="tooltip" title="My Profile">
                                                                    <i className="fa fa-user"></i> Profile
                                                                </Link>
                                                                <a href="#" data-toggle="tooltip" title="Change Password (Coming Soon)" onClick={(e) => e.preventDefault()}>
                                                                    <i className="fa fa-key"></i> Password
                                                                </a>
                                                                <a className="" onClick={async () => {
                                                                    setIsUserDropdownOpen(false);
                                                                    if (handleLogout) {
                                                                        handleLogout();
                                                                    } else {
                                                                        try { await api.logout(); } catch (e) { }
                                                                        localStorage.removeItem('user');
                                                                        localStorage.removeItem('isLoggedIn');
                                                                        navigate('/user/login');
                                                                    }
                                                                }} style={{ cursor: 'pointer' }}>
                                                                    <i className="fa fa-sign-out fa-fw"></i> Logout
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>

            {/* ==================== MOBILE HEADER ==================== */}
            <header className="main-header hide-desktop" id="alert">
                <nav className="navbar navbar-static-top" role="navigation" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 15px' }}>
                    {/* Sidebar Toggle */}
                    <button
                        className="sidebar-toggle-mobile"
                        onClick={toggleSidebar}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            fontSize: '24px',
                            padding: '10px',
                            cursor: 'pointer'
                        }}
                    >
                        <i className="fa fa-bars"></i>
                    </button>

                    {/* Centered Logo */}
                    <div className="logo-mobile-container" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                        <Link to="/user/dashboard" className="logo">
                            <span className="logo-lg">
                                <img src={headerLogoUrl || headerLogo} alt={appName} style={{ maxHeight: '40px', objectFit: 'contain' }} />
                            </span>
                        </Link>
                    </div>

                    {/* Placeholder on right to keep logo centered */}
                    <div style={{ width: '44px' }}></div>
                </nav>
            </header>

            {/* ==================== SWITCH CLASS MODAL ==================== */}
            {isSwitchClassModalOpen && (
                <div className="child-modal-overlay">
                    <div className="child-modal-card">
                        <div className="child-modal-header">
                            <h3>Switch Class</h3>
                            <p>Please select a student profile to continue</p>
                        </div>

                        <div className="child-list">
                            {availableClasses.length === 0 ? (
                                <p style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
                                    No other classes available for this session.
                                </p>
                            ) : (
                                availableClasses.map((cls) => (
                                    <div
                                        key={cls.student_session_id}
                                        className={`child-item ${selectedClassId === cls.student_session_id ? 'active' : ''}`}
                                        onClick={() => setSelectedClassId(cls.student_session_id)}
                                    >
                                        <div className="child-avatar">
                                            <GraduationCap size={24} />
                                        </div>
                                        <div className="child-info">
                                            <span className="child-name">
                                                {cls.firstname} {cls.lastname}
                                            </span>
                                            <span className="child-class">
                                                {cls.class} ({cls.section})
                                            </span>
                                            {cls.is_active === 'yes' && (
                                                <span className="current-badge">Default</span>
                                            )}
                                        </div>
                                        <div className="child-select-indicator">
                                            <ChevronRight size={20} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="child-modal-footer">
                            <button
                                className="modal-cancel-btn"
                                onClick={() => setIsSwitchClassModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="modal-submit-btn"
                                onClick={handleUpdateClass}
                                disabled={isSwitchingClass || !selectedClassId || availableClasses.length === 0}
                            >
                                {isSwitchingClass ? (
                                    <><Loader2 size={18} className="animate-spin" /> Updating...</>
                                ) : (
                                    "Update"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
