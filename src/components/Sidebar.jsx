import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { LogOut } from 'lucide-react';
import TopSidebar from './TopSidebar';
import { usePermissions } from '../context/PermissionContext';

const Sidebar = ({
    sidebarMenus = [],
    mobileNavItems = [],
    handleSearch,
    sessionYear,
    currentUrl, // To determine active state
    loading = false,
    isSidebarOpen = false,
    toggleSidebar
}) => {
    const location = useLocation();
    const currentPath = location.pathname;

    // Function to check if a menu item is active
    const isMenuActive = (menuUrl) => {
        if (menuUrl === '#') return false;

        // Help Desk - active for /admin/enquiry and related paths
        if (menuUrl === '/admin/enquiry' && (
            currentPath.startsWith('/admin/enquiry') ||
            currentPath.startsWith('/admin/source') ||
            currentPath.startsWith('/admin/reference')
        )) return true;

        // SIS - active for /student paths but NOT /student-attendance, plus related admin paths
        if (menuUrl === '/student/search' && (
            (currentPath.startsWith('/student') && !currentPath.startsWith('/student-attendance') && !currentPath.startsWith('/studentfee')) ||
            currentPath.startsWith('/admin/onlinestudent') ||
            currentPath.startsWith('/admin/disable-reason') ||
            currentPath.startsWith('/admin/disable_reason')
        )) return true;

        // Attendance - active for /student-attendance and submenus
        if (menuUrl === '/student-attendance' && (
            currentPath.startsWith('/student-attendance') ||
            currentPath.startsWith('/attendance-by-date') ||
            currentPath.startsWith('/approve_leave')
        )) return true;

        // Fees - active for /studentfee and its submenus
        if (menuUrl === '/studentfee' && (
            currentPath.startsWith('/studentfee') ||
            currentPath.startsWith('/admin/feemaster') ||
            currentPath.startsWith('/admin/feegroup') ||
            currentPath.startsWith('/admin/feetype') ||
            currentPath.startsWith('/admin/feesforward') ||
            currentPath.startsWith('/admin/feereminder') ||
            currentPath.startsWith('/admin/feesreceipt') ||
            currentPath.startsWith('/fee/')
        )) return true;

        // Transport - active for /admin/route and submenus
        if (menuUrl === '/admin/route' && (
            currentPath.startsWith('/admin/route') ||
            currentPath.startsWith('/admin/vehicle') ||
            currentPath.startsWith('/admin/vehroute') ||
            currentPath.startsWith('/admin/pickuppoint') ||
            currentPath.startsWith('/admin/routepickuppoint')
        )) return true;

        // Income - active for /admin/income and /admin/incomehead
        if (menuUrl === '/admin/income' && (currentPath.startsWith('/admin/income') || currentPath.startsWith('/admin/incomehead'))) return true;

        // Expense - active for /admin/expense and /admin/expensehead
        if (menuUrl === '/admin/expense' && (currentPath.startsWith('/admin/expense') || currentPath.startsWith('/admin/expensehead'))) return true;

        // Human Resource - active for /admin/staff and HR related paths
        if (menuUrl === '/admin/staff/search' && (
            currentPath.startsWith('/admin/staff') ||
            currentPath.startsWith('/admin/leaverequest') ||
            currentPath.startsWith('/admin/leavetypes') ||
            currentPath.startsWith('/admin/designation') ||
            currentPath.startsWith('/admin/department') ||
            currentPath.startsWith('/admin/payroll')
        )) return true;

        // State Examination - active for /cbseexam and /admin/rank paths
        if (menuUrl === '/cbseexam/exam' && (currentPath.startsWith('/cbseexam') || currentPath.startsWith('/admin/rank') || currentPath.startsWith('/admin/cbseexam'))) return true;

        // Settings - active for /settings paths
        if (menuUrl === '/settings' && currentPath.startsWith('/settings')) return true;

        // Courses - active for /admin/onlinecourse
        if (menuUrl === '/admin/onlinecourse' && currentPath.startsWith('/admin/onlinecourse')) return true;

        // Messages - active for /admin/notification and related paths (Mail, SMS, WhatsApp)
        if (menuUrl === '/admin/notification' && (
            currentPath.startsWith('/admin/notification') ||
            currentPath.startsWith('/admin/mail') ||
            currentPath.startsWith('/admin/mailsms') ||
            currentPath.startsWith('/admin/sendwhatsapp')
        )) return true;

        // Hostel - active for /admin/hostelroom and related paths
        if (menuUrl === '/admin/hostelroom' && (
            currentPath.startsWith('/admin/hostelroom') ||
            currentPath.startsWith('/admin/studenthostelreport') ||
            currentPath.startsWith('/admin/roomtype') ||
            currentPath.startsWith('/admin/hostel')
        )) return true;

        // Download Center - active for its sub-routes
        if (menuUrl === '/admin/content/assignment' && (currentPath.startsWith('/admin/content/') || currentPath.startsWith('/admin/video_tutorial'))) return true;

        // Academics - active for academics sub-routes
        if (menuUrl === '/admin/timetable/classreport' && (
            currentPath.startsWith('/admin/timetable') ||
            currentPath.startsWith('/admin/teacher/assign_') ||
            currentPath.startsWith('/admin/stdtransfer') ||
            currentPath.startsWith('/admin/subject') ||
            currentPath.startsWith('/admin/classes') ||
            currentPath.startsWith('/admin/section')
        )) return true;

        // Certificate - active for /admin/certificate submenus
        if (menuUrl === '/admin/certificate/student_id_card' && currentPath.startsWith('/admin/certificate')) return true;

        // Reports - active for all /admin/reports paths
        if (menuUrl === '/admin/reports/student_information' && currentPath.startsWith('/admin/reports/')) return true;

        // Exact match for any other routes
        return currentPath === menuUrl;
    };

    // Available routes in the app - only these will have working links
    const availableRoutes = [
        '/dashboard',
        '/settings',
        '/settings/logo',
        '/settings/login-page-background',
        '/settings/mobile-app',
        '/settings/front-cms',
        '/sessions',
        '/sms-settings',
        '/email-settings',
        '/print-header-footer',
        '/student/search',
        '/student/create',
        '/admin/onlinestudent',
        '/cbseexam/exam',
        '/admin/rank',
        '/admin/staff/search',
        '/admin/source',
        '/admin/reference',
        '/homework',
        '/admin/mail',
        '/admin/mail/email_sms_log',
        '/admin/mail/email_template',
        '/admin/notification',
        '/admin/mailsms/compose',
        '/admin/mailsms/compose_sms',
        '/admin/sendwhatsapp/compose_sms',
        '/admin/notification_class/index',
        '/admin/mail/sms_template',
        '/admin/mail/schedule_log',
        '/admin/mail/send_reminders',
        '/admin/notification_class/add',
        '/admin/notification_class/edit',
        '/admin/mailsms/edit_schedule',
        '/admin/income',
        '/admin/incomehead',
        '/admin/expense',
        '/admin/expensehead',
        '/admin/onlinecourse',
        '/admin/hostelroom',
        '/admin/studenthostelreport',
        '/admin/roomtype',
        '/admin/roomtype/edit',
        '/admin/hostel',
        '/admin/hostel/edit',
        '/admin/hostel/edit',
        '/admin/content/assignment',
        '/admin/content/studymaterial',
        '/admin/content/syllabus',
        '/admin/content/other',
        '/admin/content/worksheets',
        '/admin/content/createcontent',
        '/admin/content/edit',
        '/admin/content/editpost',
        '/admin/content/search',
        '/admin/video_tutorial',
        '/admin/reports/student_information',
        '/cbseexam/exam',
        '/cbseexam/examschedule',
        '/cbseexam/result/marksheet',
        '/cbseexam/examgrade',
        '/cbseexam/assessment',
        '/cbseexam/term',
        '/cbseexam/template',
        '/cbseexam/report',
        '/cbseexam/settings',
        '/admin/reports/student_information',
        '/admin/reports/finance',
        '/admin/reports/attendance',
        '/admin/reports/staff',
        '/admin/reports/rank',
        '/admin/reports/transport',
        '/admin/reports/hostel',
        '/admin/reports/alumni',
        '/admin/reports/user_log',
        '/admin/reports/audit_trail',
        '/admin/certificate/student_certificate',
        '/admin/certificate/generate_certificate',
        '/admin/certificate/student_id_card',
        '/admin/certificate/generate_id_card',
        '/admin/certificate/staff_id_card',
        '/admin/certificate/generate_staff_id_card',
        '/admin/timetable/classreport',
        '/admin/timetable/mytimetable',
        '/admin/teacher/assign_class_teacher',
        '/admin/teacher/assign_subject_teacher',
        '/admin/stdtransfer',
        '/admin/subject',
        '/admin/subjectgroup',
        '/admin/classes',
        '/admin/section',
        '/settings/notification-setting',
        '/settings/payment_methods',
        '/settings/roles',
        '/settings/modules'
    ];


    // --- Permission-based filtering from Context ---
    const { permissionList, permissionsLoaded, isSuperAdmin } = usePermissions();

    const defaultSidebarMenus = [
        { id: 1, icon: 'helpdesk.png', label: 'Help Desk', url: '/admin/enquiry', permissionShortCode: 'front_office' },
        { id: 2, icon: 'sis.png', label: 'SIS', url: '/student/search', permissionShortCode: 'student_information' },
        { id: 3, icon: 'attendance.png', label: 'Attendance', url: '/student-attendance', permissionShortCode: 'student_attendance' },
        { id: 4, icon: 'homework.png', label: 'Homework', url: '/homework', permissionShortCode: 'homework' },
        { id: 5, icon: 'Fees.png', label: 'Fees', url: '/studentfee', permissionShortCode: 'fees_collection' },
        { id: 6, icon: 'academics.png', label: 'Academics', url: '/admin/timetable/classreport', permissionShortCode: 'academics' },
        { id: 7, icon: 'state_examination.png', label: 'State Examinations', url: '/cbseexam/exam', permissionShortCode: 'cbseexam' },
        { id: 8, icon: 'courses.png', label: 'Courses', url: '/admin/onlinecourse', permissionShortCode: 'online_course' },
        { id: 9, icon: 'transport_admin.png', label: 'Transport', url: '/admin/route', permissionShortCode: 'transport' },
        { id: 10, icon: 'messages.png', label: 'Messages', url: '/admin/notification', permissionShortCode: 'communicate' },
        { id: 11, icon: 'hr.png', label: 'Human Resource', url: '/admin/staff/search', permissionShortCode: 'human_resource' },
        { id: 12, icon: 'download_resouces.png', label: 'Download Center', url: '/admin/content/createcontent', permissionShortCode: 'download_center' },
        { id: 13, icon: 'certificate.png', label: 'Certificate', url: '/admin/certificate/student_id_card', permissionShortCode: 'certificate' },
        { id: 14, icon: 'income.png', label: 'Income', url: '/admin/income', permissionShortCode: 'income' },
        { id: 15, icon: 'expenses.png', label: 'Expenses', url: '/admin/expense', permissionShortCode: 'expense' },
        { id: 16, icon: 'hostle.png', label: 'Hostel', url: '/admin/hostelroom', permissionShortCode: 'hostel' },
        { id: 17, icon: 'reports.png', label: 'Reports', url: '/admin/reports/student_information', permissionShortCode: 'reports' },
        { id: 18, icon: 'settings.png', label: 'System Settings', url: '/settings', permissionShortCode: 'system_settings' }
    ];

    // Build a Set of active short_codes for O(1) lookup
    const activePermissions = useMemo(() => {
        const set = new Set();
        permissionList.forEach(p => {
            if (p.is_active === '1') set.add(p.short_code);
        });
        return set;
    }, [permissionList]);


    const allMenus = sidebarMenus.length > 0 ? sidebarMenus : defaultSidebarMenus;

    // Filter menus: Super Admin sees all; otherwise check permissions
    const menus = useMemo(() => {
        if (isSuperAdmin) return allMenus;
        return allMenus.filter(menu => {
            if (menu.alwaysVisible) return true;
            if (!menu.permissionShortCode) return true; // no restriction
            return activePermissions.has(menu.permissionShortCode);
        });
    }, [allMenus, isSuperAdmin, activePermissions]);

    // Mobile Menu State
    const [showMobileMore, setShowMobileMore] = React.useState(false);
    const [expandedMobileModule, setExpandedMobileModule] = React.useState(null);

    // Sub-modules for each main module (keyed by module id)
    const mobileSubModules = {
        1: [ // Help Desk
            { label: 'Admission Enquiry', url: '/admin/enquiry', icon: 'fa fa-question-circle' },
            { label: 'Setup Front Office', url: '/admin/source', icon: 'fa fa-cogs' }
        ],
        2: [ // SIS
            { label: 'Student Details', url: '/student/search', icon: 'fa fa-users' },
            { label: 'Student Admission', url: '/student/create', icon: 'fa fa-user-plus' },
            { label: 'Online Admission', url: '/admin/onlinestudent', icon: 'fa fa-globe' },
            { label: 'Disabled Students', url: '/student/disabled', icon: 'fa fa-ban' },
            { label: 'Bulk Delete', url: '/student/bulkdelete', icon: 'fa fa-trash' },
            { label: 'Disable Reason', url: '/admin/disable-reason', icon: 'fa fa-exclamation-circle' }
        ],
        3: [ // Attendance
            { label: 'Student Attendance', url: '/student-attendance', icon: 'fa fa-calendar-check-o' },
            { label: 'Attendance By Date', url: '/attendance-by-date', icon: 'fa fa-calendar' },
            { label: 'Approve Leave', url: '/approve_leave', icon: 'fa fa-check-circle' }
        ],
        5: [ // Fees
            { label: 'Collect Fees', url: '/studentfee', icon: 'fa fa-money' },
            { label: 'Search Fees Payment', url: '/studentfee/searchpayment', icon: 'fa fa-search' },
            { label: 'Fees Master', url: '/admin/feemaster', icon: 'fa fa-list-alt' },
            { label: 'Fees Group', url: '/admin/feegroup', icon: 'fa fa-object-group' },
            { label: 'Fees Type', url: '/admin/feetype', icon: 'fa fa-tag' },
            { label: 'Fees Carry Forward', url: '/admin/feesforward', icon: 'fa fa-forward' },
            { label: 'Fees Reminder', url: '/admin/feereminder/setting', icon: 'fa fa-bell' },
            { label: 'Fees Receipt 24', url: '/admin/feesreceipt/feesreceipt_24', icon: 'fa fa-file-text' }
        ],
        6: [ // Academics
            { label: 'Class Timetable', url: '/admin/timetable/classreport', icon: 'fa fa-clock-o' },
            { label: 'Teachers Timetable', url: '/admin/timetable/mytimetable', icon: 'fa fa-calendar-check-o' },
            { label: 'Assign Class Teacher', url: '/admin/teacher/assign_class_teacher', icon: 'fa fa-user' },
            { label: 'Promote Students', url: '/admin/stdtransfer', icon: 'fa fa-exchange' },
            { label: 'Subject Group', url: '/admin/subjectgroup', icon: 'fa fa-reorder' },
            { label: 'Subjects', url: '/admin/subject', icon: 'fa fa-book' },
            { label: 'Class', url: '/admin/classes', icon: 'fa fa-graduation-cap' },
            { label: 'Sections', url: '/admin/section', icon: 'fa fa-th-large' },
            { label: 'Assign Subject Teacher', url: '/admin/teacher/assign_subject_teacher', icon: 'fa fa-user-plus' }
        ],
        7: [ // State Examinations
            { label: 'Exam', url: '/cbseexam/exam', icon: 'fa fa-pencil-square-o' },
            { label: 'Exam Schedule', url: '/cbseexam/examschedule', icon: 'fa fa-calendar' },
            { label: 'Print Marksheet', url: '/cbseexam/result/marksheet', icon: 'fa fa-file-text-o' },
            { label: 'Exam Grade', url: '/cbseexam/examgrade', icon: 'fa fa-list-ol' },
            { label: 'Assessment', url: '/cbseexam/assessment', icon: 'fa fa-columns' },
            { label: 'Term', url: '/cbseexam/term', icon: 'fa fa-th-list' },
            { label: 'Template', url: '/cbseexam/template', icon: 'fa fa-file-code-o' },
            { label: 'Reports', url: '/cbseexam/report', icon: 'fa fa-bar-chart' },
            { label: 'Setting', url: '/cbseexam/settings', icon: 'fa fa-cogs' },
            //{ label: 'Rank', url: '/admin/rank', icon: 'fa fa-trophy' }
        ],
        9: [ // Transport
            { label: 'Routes', url: '/admin/route', icon: 'fa fa-road' },
            { label: 'Vehicles', url: '/admin/vehicle', icon: 'fa fa-bus' },
            { label: 'Assign Vehicle', url: '/admin/vehroute', icon: 'fa fa-link' }
        ],
        10: [ // Messages
            { label: 'Notice Board', url: '/admin/notification', icon: 'fa fa-bullhorn' },
            { label: 'Send Email', url: '/admin/mailsms/compose', icon: 'fa fa-envelope-o' },
            { label: 'Send SMS', url: '/admin/mailsms/compose_sms', icon: 'fa fa-commenting-o' },
            { label: 'Send Whatsapp', url: '/admin/sendwhatsapp/compose_sms', icon: 'fa fa-whatsapp' },
            { label: 'Circular', url: '/admin/notification_class/index', icon: 'fa fa-file-text-o' }
        ],
        11: [ // Human Resource
            { label: 'Staff Directory', url: '/admin/staff/search', icon: 'fa fa-address-book' },
            { label: 'Staff Attendance', url: '/admin/staff/attendance', icon: 'fa fa-calendar-check-o' },
            { label: 'Approve Leave Request', url: '/admin/leaverequest', icon: 'fa fa-check' },
            { label: 'Apply Leave', url: '/admin/staff/leaverequest', icon: 'fa fa-paper-plane' },
            { label: 'Leave Type', url: '/admin/leavetypes', icon: 'fa fa-list' },
            { label: 'Department', url: '/admin/department', icon: 'fa fa-building' },
            { label: 'Designation', url: '/admin/designation', icon: 'fa fa-id-badge' }
        ],
        12: [ // Download Center
            { label: 'Create Content', url: '/admin/content/createcontent', icon: 'fa fa-plus-circle' },
            { label: 'Assignment', url: '/admin/content/assignment', icon: 'fa fa-tasks' },
            { label: 'Study Material', url: '/admin/content/studymaterial', icon: 'fa fa-book' },
            { label: 'Syllabus', url: '/admin/content/syllabus', icon: 'fa fa-file-text' },
            { label: 'Other', url: '/admin/content/other', icon: 'fa fa-folder' },
            { label: 'Worksheets', url: '/admin/content/worksheets', icon: 'fa fa-file-o' },
            { label: 'Video Tutorial', url: '/admin/video_tutorial', icon: 'fa fa-video-camera' }
        ],
        13: [ // Certificate
            // { label: 'Student Certificate', url: '/admin/certificate/student_certificate', icon: 'fa fa-newspaper-o' },
            // { label: 'Generate Certificate', url: '/admin/certificate/generate_certificate', icon: 'fa fa-check-square-o' },
            { label: 'Student ID Card', url: '/admin/certificate/student_id_card', icon: 'fa fa-id-card-o' },
            { label: 'Generate ID Card', url: '/admin/certificate/generate_id_card', icon: 'fa fa-id-badge' },
            { label: 'Staff ID Card', url: '/admin/certificate/staff_id_card', icon: 'fa fa-id-card' },
            { label: 'Generate Staff ID Card', url: '/admin/certificate/generate_staff_id_card', icon: 'fa fa-address-card-o' }
        ],
        14: [ // Income
            { label: 'Income', url: '/admin/income', icon: 'fa fa-line-chart' },
            { label: 'Income Head', url: '/admin/incomehead', icon: 'fa fa-list-alt' }
        ],
        15: [ // Expenses
            { label: 'Expense', url: '/admin/expense', icon: 'fa fa-credit-card' },
            { label: 'Expense Head', url: '/admin/expensehead', icon: 'fa fa-list-alt' }
        ],
        16: [ // Hostel
            { label: 'Hostel Room', url: '/admin/hostelroom', icon: 'fa fa-bed' },
          //  { label: 'Student Hostel Report', url: '/admin/studenthostelreport', icon: 'fa fa-bar-chart' },
            { label: 'Room Type', url: '/admin/roomtype', icon: 'fa fa-th' },
            { label: 'Hostel', url: '/admin/hostel', icon: 'fa fa-home' }
        ],
        17: [ // Reports
            { label: 'Student Information Report', url: '/admin/reports/student_information', icon: 'fa fa-users' },
            { label: 'Finance Report', url: '/admin/reports/finance', icon: 'fa fa-money' },
            { label: 'Attendance Report', url: '/admin/reports/attendance', icon: 'fa fa-calendar-check-o' },
            //  { label: 'Staff Report', url: '/admin/reports/staff', icon: 'fa fa-address-book' },
            // { label: 'Exam Rank Report', url: '/admin/reports/rank', icon: 'fa fa-trophy' },
            // { label: 'Transport Report', url: '/admin/reports/transport', icon: 'fa fa-bus' },
            //{ label: 'Hostel Report', url: '/admin/reports/hostel', icon: 'fa fa-building-o' },
            // { label: 'Alumni Report', url: '/admin/reports/alumni', icon: 'fa fa-graduation-cap' },
            { label: 'User Log', url: '/admin/reports/user_log', icon: 'fa fa-user-secret' },
            //{ label: 'Audit Trail', url: '/admin/reports/audit_trail', icon: 'fa fa-history' }
        ],
        18: [ // System Settings
            { label: 'General Setting', url: '/settings', icon: 'fa fa-gear' },
            { label: 'Session Setting', url: '/sessions', icon: 'fa fa-calendar-plus-o' },
            { label: 'Notification Setting', url: '/settings/notification-setting', icon: 'fa fa-bell-o' },
            { label: 'SMS Setting', url: '/sms-settings', icon: 'fa fa-commenting-o' },
            { label: 'Email Setting', url: '/email-settings', icon: 'fa fa-envelope-o' },
            { label: 'Payment Methods', url: '/settings/payment_methods', icon: 'fa fa-credit-card' },
            { label: 'Print Header Footer', url: '/print-header-footer', icon: 'fa fa-print' },
            { label: 'Front CMS Setting', url: '/settings/front-cms', icon: 'fa fa-television' },
            { label: 'Roles Permissions', url: '/settings/roles', icon: 'fa fa-key' },
            { label: 'Modules', url: '/settings/modules', icon: 'fa fa-th-large' }
        ]
    };

    // Default mobile nav items
    const defaultMobileNavItems = [
        { id: 1, icon: 'helpdesk.png', label: 'Dashboard', url: '/dashboard' },
        { id: 2, icon: 'Fees.png', label: 'Fees', url: '/studentfee' },
        { id: 3, icon: 'attendance.png', label: 'Attendance', url: '/student-attendance' }, // Updated to daily report as per recent work
        { id: 4, icon: 'more', label: 'More', url: '#', isMore: true },
        { id: 5, icon: 'logout', label: 'Logout', url: '#', isLogout: true }
    ];

    const mobileItems = mobileNavItems.length > 0 ? mobileNavItems : defaultMobileNavItems;

    const navigate = useNavigate();

    const handleMobileLogout = async (e) => {
        e.preventDefault();
        try {
            await api.logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Handle click for disabled links
    const handleDisabledClick = (e, url) => {
        if (url === '#') {
            e.preventDefault();
        }
    };

    // Logout specific icon
    const logoutIconUrl = "https://newlayout.wisibles.com/backend/images/sidebar/logout.png";

    // Auto-scroll sidebar to the active module only if it's out of view
    useEffect(() => {
        const activeIndex = menus.findIndex(menu => isMenuActive(menu.url));
        if (activeIndex > -1) {
            const sidebarElement = document.getElementById('alert2');
            if (sidebarElement) {
                const activeLi = sidebarElement.querySelector('li.active');
                if (activeLi) {
                    const itemRect = activeLi.getBoundingClientRect();
                    const sidebarRect = sidebarElement.getBoundingClientRect();

                    if (itemRect.top < sidebarRect.top || itemRect.bottom > sidebarRect.bottom) {
                        activeLi.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                }
            }
        }
    }, [currentPath, menus]);

    // Delay the skin-blue background until permissions load to prevent layout flashes
    useEffect(() => {
        if (permissionsLoaded) {
            document.body.classList.add('skin-blue');
        } else {
            document.body.classList.remove('skin-blue');
        }
    }, [permissionsLoaded]);

    return (
        <>
            {/* Sidebar Overlay - Close sidebar when clicking outside on mobile */}
            {isSidebarOpen && (
                <div
                    className="sidebar-overlay hide-desktop"
                    onClick={toggleSidebar}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 805,
                        display: 'block'
                    }}
                ></div>
            )}

            {/* Desktop Sidebar - Hidden on Mobile via CSS transform, slides in via .sidebar-open */}
            {permissionsLoaded && (
                <aside
                    className={`main-sidebar ${isSidebarOpen ? 'open' : ''}`}
                    id="alert2"
                    style={{ overflowX: 'hidden', overflowY: 'auto' }}
                >
                    {/* Sidebar Search Form */}
                    <form className="navbar-form navbar-left search-form2" role="search" onSubmit={(e) => {
                        e.preventDefault();
                        if (handleSearch) handleSearch(e);
                    }}>
                        <div className="input-group">
                            <input
                                type="text"
                                name="search_text"
                                className="form-control search-form"
                                placeholder="Search by student name"
                            />
                            <span className="input-group-btn">
                                <button
                                    type="submit"
                                    className="btn btn-flat"
                                    style={{
                                        padding: '3px 12px',
                                        borderRadius: '0px 30px 30px 0px',
                                        background: '#fff'
                                    }}
                                >
                                    <i className="fa fa-search"></i>
                                </button>
                            </span>
                        </div>
                    </form>

                    <section className="sidebar" id="sibe-box">
                        <TopSidebar sessionYear={sessionYear} />

                        <ul className="sidebar-menu verttop" style={{ paddingLeft: '0px' }}>
                            {menus.map((menu, index) => {
                                const active = isMenuActive(menu.url);
                                return (
                                    <li
                                        key={menu.id}
                                        data-index={index}
                                        className={`treeview ${active ? 'active' : ''}`}
                                        style={{
                                            position: 'relative',
                                            minHeight: '60px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {/* Active indicator - white bar on right */}
                                        {active && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    left: 0,
                                                    top: 0,
                                                    width: '2px',
                                                    height: '100%',
                                                    backgroundColor: '#fff',
                                                    borderRadius: '0 1px 1px 0'
                                                }}
                                            />
                                        )}
                                        {menu.url === '#' ? (
                                            <a
                                                href="#"
                                                onClick={(e) => e.preventDefault()}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    padding: '6px 0'
                                                }}
                                            >
                                                <img
                                                    width="28px"
                                                    src={`/images/${menu.icon}`}
                                                    alt={menu.label}
                                                    className="img-fluid"
                                                    style={{ marginBottom: '5px' }}
                                                />
                                                <span
                                                    className="sidebar-small-text"
                                                    style={{
                                                        display: 'block',
                                                        whiteSpace: 'normal',
                                                        wordWrap: 'break-word',
                                                        textAlign: 'center',
                                                        maxWidth: '70px',
                                                        overflow: 'hidden',
                                                        lineHeight: '1.2',
                                                        color: '#fff',
                                                        fontWeight: '700',
                                                        fontSize: '11pt'
                                                    }}>
                                                    {menu.label}
                                                </span>
                                            </a>
                                        ) : (
                                            <Link
                                                to={menu.url}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    padding: '6px 0'
                                                }}
                                            >
                                                <img
                                                    width="28px"
                                                    src={`/images/${menu.icon}`}
                                                    alt={menu.label}
                                                    className="img-fluid"
                                                    style={{ marginBottom: '5px' }}
                                                />
                                                <span
                                                    className="sidebar-small-text"
                                                    style={{
                                                        display: 'block',
                                                        whiteSpace: 'normal',
                                                        wordWrap: 'break-word',
                                                        textAlign: 'center',
                                                        maxWidth: '70px',
                                                        overflow: 'hidden',
                                                        lineHeight: '1.2',
                                                        color: '#fff',
                                                        fontWeight: '700',
                                                        fontSize: '11px'
                                                    }}>
                                                    {menu.label}
                                                </span>
                                            </Link>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                </aside>
            )}

            {/* Mobile Bottom Navigation - Visible on Mobile Only */}
            <nav className="mobile-bottom-nav hide-desktop shadow-sm" id="bottom-menu">
                <ul className="bottom-menu-list" style={{ background: '#9854cb' }}>
                    {mobileItems.map((item) => (
                        <li key={item.id} className="mobile-nav-item">
                            {item.isMore ? (
                                <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); setShowMobileMore(!showMobileMore); }}
                                    className={showMobileMore ? 'active' : ''}
                                >
                                    <div className="mobile-icon-container">
                                        <img src="https://newlayout.wisibles.com/backend/images/sidebar/dots.png" alt="More" style={{ width: '20px', height: '20px' }} />
                                    </div>
                                    <span>More</span>
                                </a>
                            ) : item.isLogout ? (
                                <a href="#" onClick={handleMobileLogout}>
                                    <div className="mobile-icon-container">
                                        <img src={logoutIconUrl} alt="Logout" style={{ width: '20px', height: '20px' }} />
                                    </div>
                                    <span>Logout</span>
                                </a>
                            ) : (
                                <Link to={item.url}>
                                    <div className="mobile-icon-container">
                                        <img src={`/images/${item.icon}`} alt={item.label} style={{ width: '20px', height: '20px' }} />
                                    </div>
                                    <span>{item.label}</span>
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Mobile More Menu Overlay */}
            {showMobileMore && (
                <div className="mobile-more-overlay hide-desktop">
                    <div className="mobile-more-content">
                        <div className="mobile-more-header">
                            {expandedMobileModule ? (
                                <>
                                    <button
                                        onClick={() => setExpandedMobileModule(null)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '20px',
                                            cursor: 'pointer',
                                            padding: '0 10px 0 0',
                                            color: '#333',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <i className="fa fa-arrow-left"></i>
                                    </button>
                                    <h4 style={{ margin: 0 }}>{menus.find(m => m.id === expandedMobileModule)?.label || 'Sub Modules'}</h4>
                                </>
                            ) : (
                                <h4>Menu</h4>
                            )}
                            <button onClick={() => { setShowMobileMore(false); setExpandedMobileModule(null); }} className="close-btn">&times;</button>
                        </div>

                        {expandedMobileModule ? (
                            /* Sub-module list view */
                            <div className="mobile-submenu-list" style={{ padding: '10px 15px' }}>
                                {(mobileSubModules[expandedMobileModule] || []).map((sub, idx) => (
                                    <Link
                                        key={idx}
                                        to={sub.url}
                                        className="mobile-submenu-item"
                                        onClick={() => { setShowMobileMore(false); setExpandedMobileModule(null); }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '12px 15px',
                                            borderBottom: '1px solid #f0f0f0',
                                            textDecoration: 'none',
                                            color: '#333',
                                            fontSize: '14px',
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            backgroundColor: '#9854cb',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '12px',
                                            flexShrink: 0
                                        }}>
                                            <i className={sub.icon} style={{ color: '#fff', fontSize: '15px' }}></i>
                                        </div>
                                        <span style={{ fontWeight: '500' }}>{sub.label}</span>
                                        <i className="fa fa-angle-right" style={{ marginLeft: 'auto', color: '#aaa', fontSize: '16px' }}></i>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            /* Main module grid view */
                            <div className="mobile-more-grid">
                                {menus.map((menu) => {
                                    const hasSubs = mobileSubModules[menu.id] && mobileSubModules[menu.id].length > 0;
                                    return (
                                        <a
                                            key={menu.id}
                                            href={hasSubs ? '#' : (menu.url !== '#' ? menu.url : '#')}
                                            className="mobile-more-item"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (hasSubs) {
                                                    setExpandedMobileModule(menu.id);
                                                } else if (menu.url !== '#') {
                                                    navigate(menu.url);
                                                    setShowMobileMore(false);
                                                }
                                            }}
                                            style={{ position: 'relative' }}
                                        >
                                            <div className="more-icon" style={{ backgroundColor: '#9854cb', padding: '10px', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 5px' }}>
                                                <img src={`/images/${menu.icon}`} alt={menu.label} style={{ width: '22px', height: 'auto' }} />
                                            </div>
                                            <span style={{ fontSize: '11px', marginTop: '5px', display: 'block', color: '#333' }}>{menu.label}</span>
                                            {hasSubs && (
                                                <i className="fa fa-angle-right" style={{
                                                    position: 'absolute',
                                                    top: '5px',
                                                    right: '5px',
                                                    fontSize: '12px',
                                                    color: '#999'
                                                }}></i>
                                            )}
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
