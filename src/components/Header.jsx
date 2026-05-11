import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CircleUser } from 'lucide-react';
import { api } from '../services/api';
import { useLogo } from '../context/LogoContext';

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
    // Get logo URLs from context ensuring priority to global Context
    const { logos, updateLogo } = useLogo();
    const headerLogo = headerLogoUrl || logos.admin_logo || '/images/wisibles_logo.png';

    // Global logo fetch interceptor inside Header
    useEffect(() => {
        // 1. If a logo prop is passed (e.g. from dashboard), sync it globally
        if (headerLogoUrl) {
            updateLogo('admin_logo', headerLogoUrl);
            return;
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [headerLogoUrl]);

    // Dropdown State
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const userDropdownRef = useRef(null);
    const navigate = useNavigate();

    // Task/Todo State
    const [tasks, setTasks] = useState([]);
    const [isTaskDropdownOpen, setIsTaskDropdownOpen] = useState(false);
    const taskDropdownRef = useRef(null);

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
    let defaultUser = { name: 'Admin User', role: 'Super Admin', id: 1, avatar: '/uploads/staff_images/default_male.jpg' };
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            defaultUser = {
                name: parsedUser.username || parsedUser.name || 'Admin User',
                role: parsedUser.role || 'Super Admin',
                id: parsedUser.id || 1,
                avatar: parsedUser.image || '/uploads/staff_images/default_male.jpg'
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

    // ========== SEARCH STATE ==========
    const [searchQuery, setSearchQuery] = useState('');

    const onSearch = (e) => {
        e.preventDefault();

        if (!searchQuery.trim()) {
            return;
        }

        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    };

    return (
        <>
            {/* ==================== DESKTOP HEADER ==================== */}
            <header className="main-header hide-mobile" id="alert">
                {/* Logo - Links to Dashboard */}
                <Link to="/dashboard" className="logo-hide-on-mobile logo">
                    <span className="logo-mini">
                        <img src={headerLogo} alt={appName} />
                    </span>
                    <span className="logo-lg">
                        <img src={headerLogo} alt={appName} style={{ maxHeight: '40px', objectFit: 'contain' }} />
                    </span>
                </Link>

                {/* Navbar */}
                <nav className="navbar navbar-static-top" role="navigation" style={{ display: 'flex', alignItems: 'center', padding: '0 15px' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                        {/* Modern Search Bar */}
                        <form
                            id="header_search_form"
                            className="header-search-modern"
                            onSubmit={onSearch}
                            style={{ margin: '8px 0 0 20px', width: '100%', maxWidth: '550px' }}
                        >
                            <div style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                background: '#fff',
                                borderRadius: '7px',
                                padding: '0 16px',
                                border: '1px solid #e2e8f0',
                                boxShadow: 'none',
                                transition: 'all 0.3s ease'
                            }}
                                className="search-input-wrapper-premium"
                            >
                                <input
                                    type="text"
                                    name="search_text1"
                                    id="search_text1"
                                    placeholder="Search student, records..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        padding: '8px 0',
                                        fontSize: '14px',
                                        width: '100%',
                                        outline: 'none',
                                        color: '#334155'
                                    }}
                                />
                                <div style={{
                                    width: '1px',
                                    height: '20px',
                                    background: '#e2e8f0',
                                    margin: '0 12px'
                                }}></div>
                                <button
                                    type="submit"
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        padding: '4px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <i className="fa fa-search" style={{ color: '#64748b', fontSize: '16px' }}></i>
                                </button>
                            </div>
                        </form>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '20px' }}>
                        <div className="pull-right">

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
                                                                <Link to={`/admin/staff/profile/${user.id}`} style={{ display: 'block', height: '100%', width: '100%' }}>
                                                                    <CircleUser size={60} color="#FFD700" strokeWidth={1.5} />
                                                                </Link>
                                                            </div>
                                                            <div className="sstopuser-test">
                                                                <Link to={`/admin/staff/profile/${user.id}`}>
                                                                    <h4 className="text-capitalize">{user.name}</h4>
                                                                </Link>
                                                                <h5>{user.role}</h5>
                                                            </div>
                                                            <div className="divider"></div>
                                                            <div className="sspass">
                                                                <Link to={`/admin/staff/profile/${user.id}`} data-toggle="tooltip" title="My Profile">
                                                                    <i className="fa fa-user"></i> Profile
                                                                </Link>
                                                                <a href="#" data-toggle="tooltip" title="Change Password (Coming Soon)" onClick={(e) => e.preventDefault()}>
                                                                    <i className="fa fa-key"></i> Password
                                                                </a>
                                                                <a className="" onClick={async () => {
                                                                    setIsUserDropdownOpen(false);
                                                                    try { await api.logout(); } catch (e) { console.error('Logout error:', e); }
                                                                    localStorage.removeItem('user');
                                                                    localStorage.removeItem('isLoggedIn');
                                                                    localStorage.removeItem('token');
                                                                    if (handleLogout) {
                                                                        handleLogout();
                                                                    } else {
                                                                        navigate('/login');
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
                        <Link to="/dashboard" className="logo">
                            <span className="logo-lg">
                                <img src={headerLogo} alt={appName} style={{ maxHeight: '40px', objectFit: 'contain' }} />
                            </span>
                        </Link>
                    </div>

                    {/* Placeholder on right to keep logo centered */}
                    <div style={{ width: '44px' }}></div>
                </nav>
            </header>
        </>
    );
};

export default Header;
