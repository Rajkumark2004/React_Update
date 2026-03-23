import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import '../../utils/include_files.js';
import { api_users } from '../../services/api_users';

const UserDashboard = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    const [userData, setUserData] = useState({
        name: "User",
        role: "student",
        id: "",
        admission_no: "",
        avatar: "/uploads/student_images/1.jpg",
        adminLogoUrl: "",
        baseUrl: ""
    });

    // Comprehensive Dashboard Data State
    const [dashboardData, setDashboardData] = useState({
        notifications: [],
        subjects_progress: [],
        timetable: {},
        homework: [],
        attendance_percentage: 0
    });

    const [isLoading, setIsLoading] = useState(true);
    const [permissions, setPermissions] = useState(new Set());
    const [permissionsLoaded, setPermissionsLoaded] = useState(false);

    // Switch Class Modal State
    const [isSwitchClassModalOpen, setIsSwitchClassModalOpen] = useState(false);
    const [availableClasses, setAvailableClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [isSwitchingClass, setIsSwitchingClass] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // First try to load initial username from localStorage
                const storedUser = localStorage.getItem('user');
                let initialName = "User";
                let isParent = false;
                if (storedUser) {
                    const userObj = JSON.parse(storedUser);
                    isParent = userObj.role === 'parent';
                    initialName = userObj.username || "User";
                    setUserData(prev => ({ ...prev, name: initialName, role: userObj.role || 'student', avatar: userObj.image || "/uploads/student_images/1.jpg" }));
                }

                // Then fetch real data from dashboard API
                const res = await api_users.getUserDashboard();
                if (res && res.status && res.data) {
                    const d = res.data;
                    if (d.student) {
                        const studentFullName = `${d.student.firstname || ''} ${d.student.lastname || ''}`.trim();
                        setUserData(prev => ({
                            ...prev,
                            // For parents, keep login_username — don't overwrite with student name
                            name: isParent ? initialName : (studentFullName || initialName),
                            id: d.student.id || prev.id,
                            admission_no: d.student.admission_no || "",
                            adminLogoUrl: d.sch_setting?.admin_logo && d.sch_setting?.base_url
                                ? `${d.sch_setting.base_url}uploads/school_content/admin_logo/${d.sch_setting.admin_logo}`
                                : prev.adminLogoUrl,
                            baseUrl: d.sch_setting?.base_url || prev.baseUrl
                        }));
                    }

                    // Set all dashboard metrics
                    setDashboardData({
                        notifications: Array.isArray(d.notifications) ? d.notifications : [],
                        subjects_progress: Array.isArray(d.subjects_progress) ? d.subjects_progress : [],
                        timetable: d.timetable || {},
                        homework: Array.isArray(d.homework) ? d.homework : [],
                        attendance_percentage: d.attendance_percentage || 0,
                        class_name: d.student ? `${d.student.class || ''} (${d.student.section || ''})` : ""
                    });
                }
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchPermissions = async () => {
            try {
                const data = await api_users.getModulePermissions();
                const set = new Set();
                const storedUser = localStorage.getItem('user');
                let userRole = 'student';
                if (storedUser) {
                    try {
                        const parsed = JSON.parse(storedUser);
                        userRole = (parsed.role || parsed.usertype || 'student').toLowerCase();
                    } catch (e) { /* fallback */ }
                }
                const isParent = userRole === 'parent';
                const list = isParent ? data.parentpermissionList : data.studentpermissionList;
                (list || []).forEach(p => {
                    const field = isParent ? p.parent : p.student;
                    if (field === '1') set.add(p.short_code);
                });
                setPermissions(set);
            } catch (err) {
                console.error('Failed to fetch module permissions:', err);
            } finally {
                setPermissionsLoaded(true);
            }
        };

        fetchDashboardData();
        fetchPermissions();
    }, [userData.student_id]);

    const sessionYear = currentSession?.session || '2024-25';

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

    const themeColor = "#9c68e4";

    const allMobileMenus = [
        { label: 'My Profile', url: '/user/profile', icon: 'student.png', alwaysVisible: true },
        { label: 'Attendance', url: '/user/attendance', icon: 'attendance.png', permission: 'attendance' },
        { label: 'Fees', url: '/user/getfees', icon: 'Fees.png', permission: 'fees' },
        { label: 'Circular', url: '/user/notification', icon: 'noticeboard.png', permission: 'notice_board' },
        { label: 'Student Assessment', url: '/user/studentassessment', icon: 'homework.png', permission: 'examinations' },
        { label: 'Class Timetable', url: '/user/timetable', icon: 'timetable.png', alwaysVisible: true },
        { label: 'Lesson Plan', url: '/user/syllabus', icon: 'homework.png', permission: 'lesson_plan' },
        { label: 'Syllabus Status', url: '/user/syllabus/status', icon: 'syllabus.png', permission: 'syllabus_status' },
        { label: 'Homework', url: '/user/homework', icon: 'homework.png', permission: 'homework' },
        { label: 'Daily Assignment', url: '/user/daily_assignment', icon: 'homework.png', permission: 'homework' },
        { label: 'Courses', url: '/user/onlinecourse', icon: 'courses.png', permission: 'online_course' },
        { label: 'Apply Leave', url: '/user/apply_leave', icon: 'applyleave.png', permission: 'apply_leave' },
        { label: 'Visitor Book', url: '/user/visitors', icon: 'visitorbook.png', permission: 'visitor_book' },
        { label: 'Download Center', url: '/user/content/list', icon: 'download_resouces.png', permission: 'download_center' },
        { label: 'State Examination', url: '/user/examresult', icon: 'helpdesk.png', permission: 'cbseexam' },
        { label: 'Notice Board', url: '/user/notice_board', icon: 'noticeboard.png', permission: 'notice_board' },
        { label: 'Transport Route', url: '/user/route', icon: 'transport.png', permission: 'transport_routes' },
        { label: 'Hostel Rooms', url: '/user/hostelroom', icon: 'hostle.png', permission: 'hostel_rooms' }
    ];

    const filteredMenus = allMobileMenus.filter(menu => {
        if (menu.alwaysVisible) return true;
        if (!menu.permission) return true;
        return permissions.has(menu.permission);
    });

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
            window.location.reload();
        } catch (error) {
            console.error('Failed to update class:', error);
            alert('Failed to switch class. Please try again.');
            setIsSwitchingClass(false);
        }
    };


    // Get Today's classes
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[new Date().getDay()];
    const todayClasses = dashboardData.timetable[todayName] || [];

    return (
        <>
            <style>{`
                /* REVERTING SIDEBAR TO THE GOOD PREVIOUS STATE */
                .content-wrapper {
                    margin-left: 80px !important;
                    padding: 0px 0px 0px 5px;
                }
                .main-footer {
                    margin-left: 80px !important;
                    padding-left: 5px !important;
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



                /* Layout adjustments */
                .content-wrapper {
                    background-color: #f7f7f7 !important;
                    padding-top: 60px !important;
                }
                
                .welcome-card {
                    background: #ffffff;
                    border-radius: 12px;
                    padding: 30px 45px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.02);
                    margin-bottom: 25px;
                    min-height: 230px;
                }
                
                .welcome-text h3 {
                    font-size: 26px;
                    font-weight: 600;
                    color: #333;
                    margin: 0 0 10px 0;
                }
                
                .welcome-text p {
                    font-size: 16px;
                    color: #777;
                    margin-bottom: 30px;
                }
                
                .btn-check-now {
                    background-color: ${themeColor} !important;
                    color: #fff !important;
                    padding: 10px 32px;
                    border-radius: 10px;
                    font-weight: 500;
                    font-size: 15px;
                    text-decoration: none;
                    display: inline-block;
                }
                
                .welcome-image img {
                    max-width: 320px;
                    height: auto;
                }

                .notice-board-container {
                    margin-top: 47px; 
                }
                
                .notice-board-card {
                    background: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.02);
                    min-height: 200px;
                    width: 100%;
                }

                .notice-header {
                    padding: 18px 25px;
                    border-bottom: 1px solid #f9f9f9;
                }
                
                .notice-header h3 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                    color: #555;
                }

                .notice-body {
                    padding: 18px 25px;
                }

                .notice-item {
                    display: flex;
                    align-items: center;
                    color: #666;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    padding: 8px 10px;
                    border-radius: 6px;
                }

                .notice-item:hover {
                    background-color: #f8f9fa;
                    color: #72afd2 !important;
                    padding-left: 15px;
                }

                .notice-item:hover small {
                    color: #72afd2 !important;
                }

                .notice-item i.fa-envelope-o {
                    color: #e74c3c;
                    margin-right: 12px;
                    font-size: 17px;
                }

                .dashboard-card {
                    background: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.02);
                    margin-bottom: 25px;
                    min-height: 290px;
                }

                .card-title-bar {
                    padding: 15px 20px;
                    border-bottom: 1px solid #f9f9f9;
                }

                .card-title-bar h3 {
                    font-size: 16px;
                    font-weight: 600;
                    color: #555;
                    margin: 0;
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 20px;
                }

                .empty-state img {
                    width: 130px;
                    height: auto;
                    opacity: 0.8;
                }

                /* Subject Progress - Image-Based UI */
                .subject-progress-header {
                    background-color: #f5f5f5;
                    padding: 10px 10px;
                    margin: 0 15px;
                    display: flex;
                    justify-content: space-between;
                    font-weight: 600;
                    color: #444;
                    font-size: 13px;
                    border-radius: 4px;
                }
                .subject-progress-row {
                    padding: 8px 8px;
                    margin: 0 15px;
                    border-bottom: 1px solid #f1f1f1;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    transition: all 0.2s ease;
                }
                .subject-progress-row:hover {
                    background-color: #f9f9f9;
                }
                .subject-name-text {
                    font-size: 14px;
                    color: #333;
                    margin: 0;
                    font-weight: 500;
                }
                .progress-detail-col {
                    width: 150px;
                    text-align: right;
                }
                .progress-percent-val {
                    display: block;
                    font-size: 13px;
                    color: #333;
                    margin-bottom: 5px;
                    text-align: left;
                }
                .progress-bar-container {
                    height: 8px;
                    background-color: #f2f2f2;
                    border-radius: 10px;
                    overflow: hidden;
                    width: 100%;
                }
                .progress-bar-fill {
                    height: 100%;
                    border-radius: 10px;
                }

                /* Hide standard search and session UI */
                .sessionul, .search-form2, .search-form {
                    display: none !important;
                }

                @media (max-width: 769px) {
                    .main-sidebar { width: 0 !important; }
                    .content-wrapper, .main-header .navbar, .main-footer { margin-left: 0 !important; }
                    .main-header .logo { width: 120px !important; }
                    .main-header .logo img { width: 100px !important; }
                }
                     @media (max-width: 770px) {
                 
                    .content-wrapper { padding-top: 0px !important; } 
                }

                /* MOBILE DASHBOARD UI */
                @media (min-width: 50px) and (max-width: 770px) {
                    .main-header, .main-sidebar, .content-wrapper, .main-footer, .mobile-bottom-nav, #bottom-menu {
                        display: none !important;
                    }
                    body, html {
                        margin: 0; padding: 0;
                        background-color: #f7f7f7;
                    }
                    .mobile-dashboard-ui {
                        display: flex !important;
                        flex-direction: column;
                        min-height: 100vh;
                        background-color: #fcfcfc;
                        font-family: 'Inter', 'Roboto', sans-serif;
                    }
                    .mob-header {
                        height: 60px;
                        background: #ffffff;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        position: relative;
                        box-shadow: 0 1px 4px rgba(0,0,0,0.05);
                        z-index: 10;
                    }
                    .mob-logo {
                        height: 30px;
                        object-fit: contain;
                    }
                    .mob-header-icon {
                        position: absolute;
                        right: 20px;
                        font-size: 20px;
                        color: #000;
                    }
                    .mob-profile-section {
                        position: relative;
                        min-height: 110px;
                        padding-top: 20px;
                        margin-bottom: 20px;
                        z-index: 5;
                    }
                    .mob-profile-bar {
                        background: #cfcfcf;
                        height: 70px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        padding-left: 180px;
                        padding-right: 20px;
                        margin-top: 25px;
                    }
                    .mob-avatar-wrapper {
                        position: absolute;
                        top: 20px;
                        left: 35px;
                        width: 80px;
                        height: 80px;
                        background-color: #ffefba; 
                        border-radius: 50%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 10;
                    }
                    .mob-avatar-wrapper i {
                        font-size: 45px;
                        color: #000;
                    }
                    .mob-profile-content {
                        display: flex;
                        flex-direction: column;
                        width: 100%;
                    }
                    .mob-name {
                        text-align: left;
                        font-size: 20px;
                        font-weight: 600;
                        color: #333;
                        margin-bottom: 5px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        margin-left: -30px !important;
                    }
                    .mob-details {
                    margin-left: -30px !important;
                        display: flex;
                        justify-content: space-between;
                        font-size: 13px;
                        color: #444;
                    }
                    .mob-details span {
                        white-space: nowrap;
                    }
                    .mob-grid-container {
                        padding: 15px 10px;
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 8px;
                        flex-grow: 1;
                        align-content: start;
                        padding-bottom: 80px;
                    }
                    .mob-grid-card {
                        background: #ffffff;
                        border-radius: 4px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        padding: 10px 4px;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                        text-decoration: none !important;
                        min-height: 75px;
                        transition: transform 0.2s, background 0.2s;
                        text-align: center;
                    }
                    .mob-grid-card:active {
                        transform: scale(0.98);
                        background: #f9f9f9;
                    }
                    .mob-icon {
                        height: 30px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-bottom: 6px;
                    }
                    .mob-icon i {
                        font-size: 24px !important;
                    }
                    .mob-grid-card span {
                        font-size: 11px;
                        font-weight: 600;
                        color: #111;
                        line-height: 1.2;
                    }
                    .mob-footer {
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        height: 50px;
                        background: #ffffff;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        border-top: 1px solid #e2e2e2;
                        color: #1e3a5f;
                        font-size: 19px;
                        font-weight: 500;
                        gap: 8px;
                        z-index: 10;
                        text-decoration: none !important;
                    }
                    .mob-footer-icon-wrapper {
                        width: 28px;
                        height: 28px;
                        border-radius: 50%;
                        background-color: #ffefba; 
                        border: 1px solid #333; 
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    .mob-footer-icon-wrapper i {
                        font-size: 16px;
                        color: #000;
                    }

                    /* Switch Class Modal Styles */
                    .child-modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.6);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 10000;
                        backdrop-filter: blur(4px);
                    }

                    .child-modal-card {
                        background: white;
                        width: 90%;
                        max-width: 440px;
                        border-radius: 24px;
                        overflow: hidden;
                        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    }

                    .child-modal-header {
                        background: linear-gradient(135deg, #8f46d8 0%, #7b3fe4 100%);
                        padding: 30px 20px;
                        color: white;
                        text-align: center;
                    }

                    .child-modal-header h3 {
                        margin: 0;
                        font-size: 24px;
                        font-weight: 700;
                        color: #fff;
                    }

                    .child-modal-header p {
                        margin: 8px 0 0;
                        opacity: 0.9;
                        font-size: 14px;
                        color: #fff;
                    }

                    .child-list {
                        padding: 20px;
                        max-height: 400px;
                        overflow-y: auto;
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
                    }

                    .child-item.active {
                        border-color: #8f46d8;
                        background: #f9f5ff;
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
                    }

                    .child-item.active .child-select-indicator {
                        color: #8f46d8;
                    }

                    .child-modal-footer {
                        padding: 24px 20px 30px;
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
                        transition: all 0.2s ease;
                    }

                    .modal-submit-btn:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
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
                    }
                }
                @media (min-width: 770px) {
                    .mobile-dashboard-ui {
                        display: none !important;
                    }
                }
                
                /* Extracted UserDashboard Classes */
                .ud-content-top-margin { margin-top: 40px; }
                .ud-welcome-heading { margin-left: 25px !important; }
                .ud-dashboard-card-flex { display: flex; flex-direction: column; }
                .ud-shrink-0 { flex-shrink: 0; }
                .ud-notice-body-scroll { flex: 1; overflow-y: auto; max-height: 180px; }
                .ud-notice-no-data { margin-top: 20px; }
                .ud-notice-item-border { border-bottom: 1px solid #f1f1f1; }
                .ud-notice-item-no-border { border-bottom: none; }
                .ud-flex-1 { flex: 1; }
                .ud-card-body-nopad { flex: 1; padding: 0; }
                .ud-subject-prog-span { margin-right: 85px; }
                .ud-subject-prog-scroll { max-height: 240px; overflow-y: auto; }
                .ud-card-body-scroll { flex: 1; overflow-y: auto; max-height: 240px; padding: 15px 20px; }
                
                .ud-day-heading { font-size: 14px; font-weight: bold; padding-left: 8px; margin-bottom: 12px; }
                .ud-timetable-card { background-color: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border: 1px solid #f1f1f1; padding: 7px 12px; margin-bottom: 10px; }
                .ud-tt-avatar-wrap { flex-shrink: 0; margin-right: 12px; }
                .ud-tt-avatar-img { width: 45px; height: 45px; border-radius: 50%; object-fit: cover; border: 2px solid #f8f9fa; }
                .ud-tt-info-wrap { flex: 1; min-width: 0; }
                .ud-tt-subject { color: #333; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .ud-tt-teacher { font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
                .ud-tt-right-info { flex-shrink: 0; text-align: right; margin-left: 10px; }
                .ud-tt-room { font-size: 12px; font-weight: bold; }
                .ud-tt-time { font-size: 11px; color: #999; margin-top: 2px; }
                
                .ud-hw-subject { color: #333; }
                
                .ud-mob-header-actions { position: absolute; right: 15px; }
                .ud-mob-exchange-icon { cursor: pointer; font-size: 20px; color: #000; }
                .ud-mob-loading { width: 100%; text-align: center; grid-column: 1 / -1; padding: 40px 0; color: #999; }
                .ud-mob-spinner { font-size: 24px; }
                .ud-mob-menu-icon { width: 28px; height: auto; filter: brightness(0); }
                .ud-mob-child-user-icon { font-size: 24px; }
            `}</style>
            <div className="content-wrapper ud-content-top-margin">
                <section className="content">
                    <div className="row">
                        <div className="col-lg-8 col-md-8">
                            <div className="welcome-card">
                                <div className="welcome-text">
                                    <h3 className="ud-welcome-heading">Hello {userData.name}</h3>
                                    <p>Check your personalized profile</p>
                                    <Link to="/user/profile" className="btn-check-now">Check Now</Link>
                                </div>
                                <div className="welcome-image">
                                    <img src="/images/dash_illustration.png" alt="Welcome" />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-4">
                            <div className="notice-board-container">
                                <div className="notice-board-card ud-dashboard-card-flex">
                                    <div className="notice-header ud-shrink-0">
                                        <h3>Notice Board</h3>
                                    </div>
                                    <div className="notice-body ud-notice-body-scroll">
                                        {dashboardData.notifications.length === 0 ? (
                                            <p className="text-muted text-center ud-notice-no-data">No new notifications</p>
                                        ) : (
                                            dashboardData.notifications.map((note, idx) => (
                                                <div
                                                    className={`notice-item ${idx !== dashboardData.notifications.length - 1 ? 'ud-notice-item-border' : 'ud-notice-item-no-border'}`}
                                                    key={idx}
                                                    onClick={() => navigate('/user/notice_board')}
                                                >
                                                    <i className="fa fa-envelope-o"></i>
                                                    <span className="ud-flex-1">{note.title} <br /><small className="text-muted">{note.date}</small></span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-lg-4 col-md-4">
                            <div className="dashboard-card ud-dashboard-card-flex">
                                <div className="card-title-bar ud-shrink-0">
                                    <h3>Subject Progress</h3>
                                </div>
                                <div className="card-body ud-card-body-nopad">
                                    {dashboardData.subjects_progress.length > 0 && (
                                        <div className="subject-progress-header">
                                            <span>Subject</span>
                                            <span className="ud-subject-prog-span">Progress</span>
                                        </div>
                                    )}
                                    <div className="ud-subject-prog-scroll">
                                        {dashboardData.subjects_progress.length === 0 ? (
                                            <div className="empty-state">
                                                <img src="/images/addnewitem.svg" alt="No data" />
                                            </div>
                                        ) : (
                                            dashboardData.subjects_progress.map((sub, idx) => {
                                                const complete = parseFloat(sub.complete || 0);
                                                if (!sub.subject_name && complete === 0 && dashboardData.subjects_progress.length > 1) return null;

                                                return (
                                                    <div key={idx} className="subject-progress-row">
                                                        <div className="subject-name-text">
                                                            {sub.subject_name} ({sub.code || ''})
                                                        </div>
                                                        <div className="progress-detail-col">
                                                            <span className="progress-percent-val">{complete}%</span>
                                                            <div className="progress-bar-container">
                                                                <div
                                                                    className="progress-bar-fill"
                                                                    style={{
                                                                        width: `${complete}%`,
                                                                        backgroundColor: complete >= 75 ? '#4CAF50' : complete >= 40 ? '#FFC107' : '#72afd2'
                                                                    }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-4">
                            <div className="dashboard-card ud-dashboard-card-flex">
                                <div className="card-title-bar ud-shrink-0">
                                    <h3>Upcoming Classes</h3>
                                </div>
                                <div className="card-body ud-card-body-scroll">
                                    {Object.keys(dashboardData.timetable).length === 0 ? (
                                        <div className="empty-state">
                                            <p className="text-muted">No classes scheduled.</p>
                                        </div>
                                    ) : (
                                        ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                                            const dayClasses = dashboardData.timetable[day] || [];
                                            if (dayClasses.length === 0) return null;
                                            return (
                                                <div key={day} className="mb-4">
                                                    <h5 className="ud-day-heading" style={{ color: themeColor, borderLeft: `3px solid ${themeColor}` }}>{day}</h5>
                                                    {dayClasses.map((cls, idx) => (
                                                        <div key={idx} className="timetable-card d-flex align-items-center ud-timetable-card">

                                                            {/* Teacher Avatar */}
                                                            <div className="ud-tt-avatar-wrap">
                                                                <img
                                                                    src={cls.image && userData.baseUrl ? `${userData.baseUrl}uploads/staff_images/${cls.image}` : "/images/default_image.jpg"}
                                                                    alt="Teacher"
                                                                    className="ud-tt-avatar-img"
                                                                    onError={(e) => { e.target.src = "/images/default_image.jpg"; }}
                                                                />
                                                            </div>

                                                            {/* Left Info: Subject & Teacher */}
                                                            <div className="ud-tt-info-wrap">
                                                                <h6 className="m-0 font-weight-bold ud-tt-subject">{cls.subject_name}</h6>
                                                                <small className="text-muted ud-tt-teacher">{cls.name} {cls.surname}</small>
                                                            </div>

                                                            {/* Right Info: Room & Time */}
                                                            <div className="ud-tt-right-info">
                                                                <div className="ud-tt-room" style={{ color: themeColor }}>{cls.room_no ? `Room: ${cls.room_no}` : '--'}</div>
                                                                <div className="ud-tt-time">{cls.time_from} - {cls.time_to}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-4">
                            <div className="dashboard-card ud-dashboard-card-flex">
                                <div className="card-title-bar ud-shrink-0">
                                    <h3>Pending Homework</h3>
                                </div>
                                <div className="card-body ud-card-body-scroll">
                                    {dashboardData.homework.length === 0 ? (
                                        <div className="empty-state">
                                            <img src="/images/addnewitem.svg" alt="No data" />
                                            <p className="text-muted mt-2">No pending homework.</p>
                                        </div>
                                    ) : (
                                        dashboardData.homework.map((hw, idx) => (
                                            <div key={idx} className="mb-3 border-bottom pb-2">
                                                <h6 className="font-weight-bold mb-1 ud-hw-subject">{hw.subject_name}</h6>
                                                <small className="text-muted d-block"><i className="fa fa-calendar"></i> Due: {hw.homework_date}</small>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            {/* MOBILE DASHBOARD UI */}
            <div className="mobile-dashboard-ui">
                <div className="mob-header">
                    <img src={userData.adminLogoUrl || "/images/wisibles_logo.png"} alt="Wisibles" className="mob-logo" />
                    <div className="mob-header-actions ud-mob-header-actions">
                        <i className="fa fa-exchange ud-mob-exchange-icon" onClick={handleSwitchClassClick}></i>
                    </div>
                </div>

                <div className="mob-profile-section">
                    <div className="mob-profile-bar">
                        <div className="mob-profile-content">
                            <div className="mob-name">{userData.name || 'User'}</div>
                            <div className="mob-details">
                                <span>Adm No: {userData.admission_no || ''}</span>
                                <span>Class: {dashboardData.class_name || ''}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mob-avatar-wrapper">
                        <i className="fa fa-user"></i>
                    </div>
                </div>

                <div className="mob-grid-container">
                    {!permissionsLoaded ? (
                        <div className="ud-mob-loading">
                            <i className="fa fa-spinner fa-spin ud-mob-spinner"></i>
                        </div>
                    ) : (
                        filteredMenus.map((menu, idx) => (
                            <Link key={idx} to={menu.url} className="mob-grid-card">
                                <div className="mob-icon">
                                    <img
                                        src={`/images/${menu.icon}`}
                                        alt={menu.label}
                                        className="ud-mob-menu-icon"
                                    />
                                </div>
                                <span>{menu.label}</span>
                            </Link>
                        ))
                    )}
                </div>

                <Link to="/user/profile" className="mob-footer">
                    <div className="mob-footer-icon-wrapper">
                        <i className="fa fa-user"></i>
                    </div>
                    <span>My Profile</span>
                </Link>
            </div>

            {/* Switch Class Modal */}
            {isSwitchClassModalOpen && (
                <div className="child-modal-overlay">
                    <div className="child-modal-card">
                        <div className="child-modal-header">
                            <h3>Switch Class</h3>
                            <p>Please select a student profile to continue</p>
                        </div>

                        <div className="child-list">
                            {availableClasses.map((cl) => (
                                <div
                                    key={cl.student_session_id}
                                    className={`child-item ${String(selectedClassId) === String(cl.student_session_id) ? 'active' : ''}`}
                                    onClick={() => setSelectedClassId(cl.student_session_id)}
                                >
                                    <div className="child-avatar">
                                        <i className="fa fa-user ud-mob-child-user-icon"></i>
                                    </div>
                                    <div className="child-info">
                                        <div className="child-name">{cl.firstname} {cl.lastname}</div>
                                        <div className="child-class">{cl.class} ({cl.section})</div>
                                    </div>
                                    {cl.is_active === 'yes' && <span className="current-badge">Active</span>}
                                    <div className="child-select-indicator">
                                        <i className="fa fa-chevron-right"></i>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="child-modal-footer">
                            <button className="modal-cancel-btn" onClick={() => setIsSwitchClassModalOpen(false)}>
                                Cancel
                            </button>
                            <button
                                className="modal-submit-btn"
                                onClick={handleUpdateClass}
                                disabled={isSwitchingClass}
                            >
                                {isSwitchingClass ? (
                                    <>
                                        <i className="fa fa-spinner fa-spin"></i> Switching...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserDashboard;