import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import { api_users } from '../../services/api_users';
import '../../utils/include_files.js';
import toast from 'react-hot-toast';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable, buildExportData } from '../../utils/tableExport.js';

const ApplyLeave = () => {
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
    const [leaveList, setLeaveList] = useState([]);
    const [studentSessionId, setStudentSessionId] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchLeaveRecords = async () => {
        setLoading(true);
        try {
            const response = await api_users.getApplyLeave();
            if (response && response.status && response.data) {
                if (response.data.leave_records) {
                    setLeaveList(response.data.leave_records);
                }
                if (response.data.student_session_id) {
                    setStudentSessionId(response.data.student_session_id);
                }
            }
        } catch (error) {
            console.error("Failed to fetch leave records:", error);
        } finally {
            setLoading(false);
        }
    };

    // Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [leaveData, setLeaveData] = useState({
        id: null,
        apply_date: new Date().toLocaleDateString('en-GB').split('/').join('-'),
        from_date: '',
        to_date: '',
        reason: '',
        file: null
    });

    const sessionYear = currentSession?.session || '2024-25';
    const themeColor = "#9c68e4";

    useEffect(() => {
        const loadData = async () => {
            await fetchUserData();
            await fetchLeaveRecords();
        };
        loadData();
    }, []);

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

    const handleSave = async () => {
        if (!leaveData.from_date || !leaveData.to_date) {
            toast.error("Please fill in the required dates.");
            return;
        }

        try {
            const result = await api_users.addApplyLeave({
                student_session_id: studentSessionId,
                apply_date: leaveData.apply_date.split('/').join('-'),
                from_date: leaveData.from_date.split('-').reverse().join('-'),
                to_date: leaveData.to_date.split('-').reverse().join('-'),
                message: leaveData.reason,
                files: leaveData.file
            });

            if (result.status) {
                toast.success(result.message || "Leave applied successfully");
                fetchLeaveRecords();
                resetLeaveData();
                setShowAddModal(false);
            }
        } catch (err) {
            toast.error(err.message || 'Failed to apply leave');
        }
    };

    const handleUpdate = async () => {
        if (!leaveData.from_date || !leaveData.to_date) {
            toast.error("Please fill in the required dates.");
            return;
        }

        try {
            const result = await api_users.addApplyLeave({
                leave_id: leaveData.id,
                student_session_id: studentSessionId,
                apply_date: leaveData.apply_date,
                from_date: leaveData.from_date.split('-').reverse().join('-'),
                to_date: leaveData.to_date.split('-').reverse().join('-'),
                message: leaveData.reason,
                files: leaveData.file
            });

            if (result.status) {
                toast.success(result.message || "Leave updated successfully");
                fetchLeaveRecords();
                setShowEditModal(false);
                resetLeaveData();
            }
        } catch (err) {
            toast.error(err.message || 'Failed to update leave');
        }
    };

    const resetLeaveData = () => {
        setLeaveData({
            id: null,
            apply_date: new Date().toLocaleDateString('en-GB').split('/').join('-'),
            from_date: '',
            to_date: '',
            reason: '',
            file: null
        });
    };

    const handleEditClick = async (leave) => {
        try {
            // Fetch the details first
            const apiResponse = await api_users.getApplyLeaveDetails(leave.id);
            const details = apiResponse && apiResponse.status ? apiResponse.data : null;

            if (!details) {
                toast.error("Failed to load leave details.");
                return;
            }

            // Note: API returns dates like "02/04/2026"
            const parseDate = (dString) => {
                if (!dString || dString.includes('-0001')) return '';
                // "17/04/2026" -> ["17", "04", "2026"]
                const parts = dString.split('/');
                if (parts.length === 3) {
                    return `${parts[2]}-${parts[1]}-${parts[0]}`; // yyyy-mm-dd
                }
                return dString; // fallback
            };

            setLeaveData({
                id: leave.id, // Taking id from index method which is already called
                apply_date: (details.apply_date && !details.apply_date.includes('-0001'))
                    ? details.apply_date.split('/').join('-')
                    : new Date().toLocaleDateString('en-GB').split('/').join('-'),
                from_date: parseDate(details.from_date),
                to_date: parseDate(details.to_date),
                reason: details.reason || '',
                file: null
            });
            setShowEditModal(true);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load leave details for editing");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this leave record?")) {
            try {
                const response = await api_users.deleteApplyLeave(id);
                if (response && response.status) {
                    toast.success(response.message || 'Leave deleted successfully');
                    fetchLeaveRecords();
                } else {
                    toast.error(response.message || 'Failed to delete leave');
                }
            } catch (error) {
                console.error("Delete Error:", error);
                toast.error(error.message || 'Failed to delete leave');
            }
        }
    };

    const filteredList = (leaveList || []).filter(leave => {
        const search = searchTerm.toLowerCase();
        return (
            (leave.class || "").toLowerCase().includes(search) ||
            (leave.section || "").toLowerCase().includes(search) ||
            (leave.reason || "").toLowerCase().includes(search) ||
            (leave.from_date || "").includes(search) ||
            (leave.to_date || "").includes(search)
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

    const getStatusInfo = (status) => {
        switch (status) {
            case "0":
                return { label: "Pending", color: "#ab5f61" };
            case "1":
                return { label: "Approved", color: "#00a65a" };
            case "2":
                return { label: "Disapproved", color: "#dd4b39" };
            default:
                return { label: "Unknown", color: "#666" };
        }
    };

    const columns = [
        { key: 'class', label: 'Class' },
        { key: 'section', label: 'Section' },
        { key: 'apply_date', label: 'Apply Date' },
        { key: 'from_date', label: 'From Date' },
        { key: 'to_date', label: 'To Date' },
        { key: 'reason', label: 'Reason' },
        { key: 'status', label: 'Status' }
    ];

    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));
    const [showColumnDropdown, setShowColumnDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowColumnDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getFormattedData = () => {
        return buildExportData(
            columns,
            visibleColumns,
            sortedList,
            (row, key) => {
                if (key === 'status') {
                    return getStatusInfo(row[key])?.label || '';
                }
                return row[key];
            }
        );
    };

    const handleCopy = () => {
        const { headers, rows } = getFormattedData();
        copyToClipboard(headers, rows);
    };

    const handleExportCSV = () => {
        const { headers, rows } = getFormattedData();
        downloadCSV(headers, rows, 'ApplyLeave.csv');
    };

    const handleExportExcel = () => {
        const { headers, rows } = getFormattedData();
        downloadExcel(headers, rows, 'ApplyLeave.xls');
    };

    const handleExportPDF = () => {
        const { headers, rows } = getFormattedData();
        downloadPDF(headers, rows, 'ApplyLeave.pdf', 'Leave List');
    };

    const handlePrint = () => {
        const { headers, rows } = getFormattedData();
        printTable(headers, rows, 'Leave List');
    };

    const toggleColumn = (key) => {
        const newVisible = new Set(visibleColumns);
        if (newVisible.has(key)) {
            newVisible.delete(key);
        } else {
            newVisible.add(key);
        }
        setVisibleColumns(newVisible);
    };

    const handleRestoreVisibility = () => {
        setVisibleColumns(new Set(columns.map(c => c.key)));
    };

    return (
        <>
            <style>{`
                /* Hide standard search and session UI */
                .sessionul, .search-form2, .search-form {
                    display: none !important;
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

                /* REVERTING SIDEBAR TO THE GOOD PREVIOUS STATE */
                .content-wrapper{
                    margin-left: 80px !important;
                    padding-right: 0px !important;
                }
                .main-footer {
                margin-left: 80px !important;
                padding-right: 15px !important;
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

                .content-wrapper {
                    background-color: #f4f4f4 !important;
                    background-image: none !important;
                    padding: 5px !important;
                    margin-left: 80px !important;
                    margin-top: 40px !important;
                    min-height: calc(100vh - 50px);
                }

                /* TABLE BOX STYLING */
                .box-leave {
                    background: #fff !important;
                    border-radius: 8px !important;
                    margin: 25px 5px 15px 10px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
                    border: 1px solid #ddd !important;
                    overflow: hidden;
                }
                .box-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 15px;
                    background: #fff !important;
                    border-bottom: 2px solid #eee !important;
                    border-radius: 4px 4px 0 0;
                }

                .box-title {
                   margin: 0;
                    font-size: 20px;
                    font-weight: 500;
                    color: #333;
                    flex: 1;
                }
                .add-btn {
                    background: ${themeColor} !important;
                    color: #fff !important;
                    border: none !important;
                    border-radius: 25px !important;
                    padding: 5px 12px !important;
                    font-size: 13px !important;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    cursor: pointer;
                    font-weight: 500;
                    text-decoration: none;
                    white-space: nowrap;
                }

                .box-body {
                    padding: 5px 5px 0px 5px;
                    background: #fff !important;
                    border-radius: 0 0 4px 4px;
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

                .search-input {
                    border: none;
                    border-bottom: 1px solid #ccc;
                    padding: 4px 2px;
                    font-size: 13px;
                    width: 180px;
                    outline: none;
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

                .column-dropdown {
                    position: absolute;
                    right: 0;
                    top: 100%;
                    background: #7d7d7d;
                    border-radius: 4px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    z-index: 1000;
                    min-width: 180px;
                    overflow: hidden;
                    padding: 0;
                    margin-top: 5px;
                    border: 1px solid rgba(0,0,0,0.1);
                }

                .column-item {
                    padding: 4px 15px;
                    font-size: 14px;
                    cursor: pointer;
                    color: #fff;
                    background: #7d7d7d;
                    transition: all 0.2s;
                    display: block;
                    width: 100%;
                    text-align: left;
                    border: none;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }

                .column-item:hover {
                    background: #6e6e6e;
                }

                .column-item.active-col {
                    background: #7d7d7d;
                    color: #fff;
                }

                .column-item.hidden-col {
                    background: #fff;
                    color: #555;
                }

                .restore-visibility {
                    background: #fff;
                    color: #555;
                    padding: 4px 15px;
                    font-size: 14px;
                    cursor: pointer;
                    text-align: left;
                    font-weight: 400;
                    display: block;
                    width: 100%;
                    border: none;
                }
                
                .restore-visibility:hover {
                    background: #f9f9f9;
                }

                .table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 13px;
                    margin-bottom: 0 !important;
                }
                .table-responsive { margin-bottom: 0 !important; }

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

                .table td {
                    padding: 4px 12px;
                    border-bottom: 1px solid #eee;
                    color: #555;
                }

                .table tr:hover {
                    background: #fafafa;
                }

                .action-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #666;
                    padding: 4px 8px;
                    transition: all 0.2s;
                    border-radius: 2px;
                    font-size: 13px;
                }

                .table tr:hover .action-btn {
                    background: #fff !important;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.15);
                    color: #000;
                }

                .action-btn:hover {
                    background: #fff !important;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.2) !important;
                    transform: translateY(-1px);
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 0px;
                }

                .empty-state-text {
                    color: #f5a0a0;
                    font-size: 14px;
                }

                .empty-state img {
                    width: 200px;
                    height: 170px;
                }

                .add-record-text {
                    color: #3c763d;
                    font-size: 13px;
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
                    max-width: 600px;
                    max-height: 90vh; /* Replicated from DailyAssignment */
                    overflow: auto; /* Allow scrolling if needed, but remove forced overflow-y: auto if it was there */
                    box-shadow: 0 5px 30px rgba(0,0,0,0.2);
                    position: relative;
                }

                              .modal-header {
                    background: ${themeColor} !important;
                    padding: 10px 25px;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-radius: 6px 6px 0 0;
                }

                .modal-header h4 {
                    margin: 0;
                    font-size: 17px;
                    font-weight: 600;
                    color: #fff;
                }

                .modal-close-icon {
                    background: none;
                    border: none;
                    font-size: 22px;
                    cursor: pointer;
                    color: #fff;
                    font-weight: bold;
                    padding: 0;
                    line-height: 1;
                    transition: transform 0.3s ease;
                }

                .modal-close-icon:hover {
                    transform: rotate(90deg);
                }



                .modal-body {
                    padding: 10px 25px 0 25px;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #333;
                }

                .form-group label > span {
                    color: #dd4b39;
                    margin-left: 2px;
                }

                .form-value-text {
                    font-size: 13px;
                    color: #555;
                    padding: 4px 0;
                    border-bottom: 1px solid #ddd;
                    width: 100%;
                }

                .form-control-underlined {
                    width: 100%;
                    padding: 4px 0;
                    border: none;
                    border-bottom: 1px solid #ddd;
                    border-radius: 0;
                    font-size: 13px;
                    outline: none;
                    background: transparent;
                    color: #555;
                    font-family: inherit;
                    -webkit-appearance: none;
                }

                .form-control-underlined::-webkit-calendar-picker-indicator {
                    display: none;
                }

                .form-control-underlined::placeholder {
                    color: transparent;
                }
                
                input[type="date"]::-webkit-datetime-edit {
                    color: transparent;
                }
                
                input[type="date"]:focus::-webkit-datetime-edit,
                input[type="date"]:valid::-webkit-datetime-edit {
                    color: #555 !important;
                }

                .form-control-underlined:focus {
                    border-bottom-color: ${themeColor};
                }

                textarea.form-control-underlined {
                    min-height: 40px;
                    resize: vertical;
                }

                /* File Upload Area */
                .file-upload-container {
                    border: none;
                    border-bottom: 1px solid #ddd;
                    padding: 0px 0 0px 0;
                    text-align: left;
                    cursor: pointer;
                    border-radius: 0;
                    background: transparent;
                    transition: border-bottom-color 0.2s;
                    margin-top: 5px;
                }

                .file-upload-container:hover {
                    border-color: ${themeColor};
                }

                .file-upload-content {
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    gap: 12px;
                    color: #999;
                    font-size: 13px;
                }

                .file-upload-content i {
                    font-size: 24px;
                    color: #bbb;
                }

                .file-selected-box {
                    position: relative;
                    background: transparent;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-top: 5px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    min-height: 70px; /* Replicated from DailyAssignment */
                    overflow: hidden;
                    cursor: pointer;
                    width: 100%;
                }

                .file-preview-img {
                    max-height: 34px;
                    max-width: 100%;
                    object-fit: contain;
                }

                .file-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.75);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 0;
                    opacity: 0;
                    transition: opacity 0.2s;
                }

                .file-selected-box:hover .file-overlay {
                    opacity: 1;
                }
                
                .file-info-col {
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    justify-content: flex-end !important; /* Replicated from DailyAssignment */
                    flex-grow: 1;
                    min-width: 0;
                    cursor: pointer;
                    height: 100%;
                    padding: 10px 70px 0px !important; /* User's preferred padding */
                    margin-top: 20px !important; /* User's preferred margin */
                }
                
                .file-name-text {
                    font-weight: 500 !important;
                    font-size: 13px !important;
                    color: #ffffff !important;
                    white-space: nowrap !important;
                    overflow: hidden !important;
                    text-overflow: ellipsis !important;
                    max-width: 100% !important;
                    display: block !important;
                    line-height: normal !important;
                    margin: 0px 0 0px 0 !important; /* Replicated from DailyAssignment */
                }
                
                .file-replace-text {
                
                    font-size: 10px !important;
                    color: #cccccc !important;
                    margin-top: 0px !important;
                    font-weight: 400 !important;
                    display: block !important;
                    line-height: normal !important;
                }
                
                .btn-remove-file {
                    position: absolute !important;
                    right: 8px;
                    top: 50% !important;
                    transform: translateY(-50%) !important; /* Replicated from DailyAssignment */
                    background: transparent;
                    border: 1px solid #777;
                    color: #fff;
                    padding: 3px 8px;
                    font-size: 10px;
                    cursor: pointer;
                    border-radius: 2px;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                
                .btn-remove-file:hover {
                    background: rgba(255,255,255,0.1);
                    border-color: #fff;
                }

                .modal-footer {
                    padding: 8px 25px;
                    display: flex;
                    justify-content: flex-end;
                    border-top: 1px solid #f4f4f4;
                }

                .btn-save-purple {
                    background: ${themeColor};
                    color: #fff;
                    border: none;
                    border-radius: 20px;
                    padding: 7px 20px;
                    font-size: 13px;
                    cursor: pointer;
                    font-weight: 500;
                    box-shadow: 0 2px 4px rgba(156, 104, 228, 0.3);
                }

                @media (max-width: 769px) {
              
                    .main-sidebar { width: 0 !important; }
                    .content-wrapper, .main-header .navbar, .main-footer { margin-left: 0 !important; }
                    .main-header .logo { width: 120px !important; }
                    .main-header .logo img { width: 100px !important; }
                    .content-wrapper { padding: 10px 5px 0px 10px !important; margin: 0 !important; background: #f4f4f4 !important; }
                    .box-leave { margin: 60px 0px 15px 0px !important; border-radius: 0 !important; border: none !important; box-shadow: none !important; background: transparent !important; }
                    .leave-back-btn { display: inline-flex !important; }
                    
                    /* Responsive Card Layout */
                    .hide-on-mobile { display: none !important; }
                    .leave-card-list { display: block !important; padding: 10px 5px !important; }
                    .box-header { background: #fff !important; border-radius: 0 !important; border-bottom: 2px solid #eee !important; padding: 10px 15px !important; }
                    .box-title { font-size: 22px !important; font-weight: 500 !important; color: #333 !important; }
                }

                .leave-card-list { display: none; }
                
                .leave-card {
                    background: #fff;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    border: 1px solid #e0e0e0;
                    overflow: hidden;
                    box-shadow: none !important;
                }

                .leave-card-header {
                    background: #efefef;
                    padding: 12px 15px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .leave-card-title {
                    font-size: 18px;
                    font-weight: 500;
                    color: #444;
                    margin: 0;
                }

                .leave-card-actions {
                    display: flex;
                    gap: 10px;
                }

                .card-action-btn {
                    width: 34px;
                    height: 34px;
                    background: #fff;
                    border: 1px solid #eee;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #555;
                    font-size: 14px;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .leave-card-body {
                    padding: 20px 15px;
                    position: relative;
                }

                .leave-card-row {
                    margin-bottom: 10px;
                    font-size: 14px;
                    color: #333;
                    font-weight: 400;
                }

                .leave-card-status {
                    position: absolute;
                    right: 15px;
                    bottom: 20px;
                }

                .status-badge-custom {
                    padding: 4px 15px;
                    border-radius: 5px;
                    color: #fff;
                    font-size: 13px;
                    font-weight: 500;
                }

                .leave-back-btn { 
                    display: none; 
                    background: #9c68e4;
                    color: #fff !important;
                    border: none;
                    padding: 5px 12px !important;
                    border-radius: 25px !important;
                    font-size: 13px !important;
                    cursor: pointer;
                    font-weight: 500;
                    text-decoration: none;
                    white-space: nowrap;
                    margin-left: 8px;
                    align-items: center;
                    gap: 6px;
                }
                .leave-back-btn:hover { opacity: 0.9; }

                /* ApplyLeave Specific CSS */
                .al-content { padding: 0px 6px 0px 0px; }
                .al-header-actions { display: flex; gap: 0px; align-items: center; }
                .al-export-icons-wrap { position: relative; }
                .al-th-sortable { cursor: pointer; }
                .al-sort-icon { color: #ccc; margin-left: 4px; }
                .al-th-action { text-align: right !important; }
                .al-td-loading { text-align: center; padding: 20px; }
                .al-status-badge { color: #fff; padding: 2px 8px; border-radius: 2px; font-size: 11px; }
                .al-td-action { text-align: right; white-space: nowrap; }
                .al-action-btn-edit { margin-right: 5px; }
                .al-td-empty { text-align: center; padding: 20px; border-bottom: 1px solid #dee2e6; }
                .al-empty-img { width: 200px; height: 170px; }
                .al-add-record-hint { cursor: pointer; }
                .al-modal-row { display: flex; gap: 10px; justify-content: flex-start; }
                .al-modal-grp-half { width: 265px; }
                .al-file-preview-wrap { padding: 2px; display: flex; justify-content: center; align-items: center; }
                .al-file-text-wrap { color: #666; text-align: center; }
                .al-file-text-icon { font-size: 24px; margin-right: 8px; vertical-align: middle; }
                .al-file-text-name { vertical-align: middle; font-size: 13px; }
                .al-file-info { margin: 0; width: 100%; color: #777777; }
                .al-file-input { display: none; }
                .al-file-upload-lbl { display: block; }
                .al-file-upload-txt { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; color: #ababab !important; }
                .al-card-loading { text-align: center; padding: 20px; }
            `}</style>

            <div className="content-wrapper">
                <section className="content al-content">

                    <div className="box-leave">
                        <div className="box-header">
                            <h3 className="box-title">Leave List</h3>
                            <div className="al-header-actions">
                                <button className="add-btn" onClick={() => setShowAddModal(true)}>
                                    <i className="fa fa-plus"></i> Add
                                </button>
                                <Link to="/user/dashboard" className="leave-back-btn">
                                    <i className="fa fa-arrow-left"></i> Back
                                </Link>
                            </div>
                        </div>
                        <div className="box-body">
                            <div className="table-controls hide-on-mobile">
                                <div className="search-box">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="search-input"
                                    />
                                </div>
                                <div className="export-icons al-export-icons-wrap" ref={dropdownRef}>
                                    <button className="export-btn" title="Copy" onClick={handleCopy}><i className="fa fa-copy"></i></button>
                                    <button className="export-btn" title="Excel" onClick={handleExportExcel}><i className="fa fa-file-excel-o"></i></button>
                                    <button className="export-btn" title="CSV" onClick={handleExportCSV}><i className="fa fa-file-text-o"></i></button>
                                    <button className="export-btn" title="PDF" onClick={handleExportPDF}><i className="fa fa-file-pdf-o"></i></button>
                                    <button className="export-btn" title="Print" onClick={handlePrint}><i className="fa fa-print"></i></button>
                                    <button className="export-btn" title="Columns" onClick={() => setShowColumnDropdown(!showColumnDropdown)}><i className="fa fa-columns"></i></button>

                                    {showColumnDropdown && (
                                        <div className="column-dropdown">
                                            {columns.map(col => (
                                                <button
                                                    key={col.key}
                                                    className={`column-item ${visibleColumns.has(col.key) ? 'active-col' : 'hidden-col'}`}
                                                    onClick={() => toggleColumn(col.key)}
                                                >
                                                    {col.label}
                                                </button>
                                            ))}
                                            <button className="restore-visibility" onClick={handleRestoreVisibility}>
                                                Restore visibility
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="table-responsive hide-on-mobile">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            {visibleColumns.has('class') && <th className="al-th-sortable" onClick={() => handleSort('class')}>Class <i className="fa fa-caret-down al-sort-icon"></i></th>}
                                            {visibleColumns.has('section') && <th className="al-th-sortable" onClick={() => handleSort('section')}>Section <i className="fa fa-caret-down al-sort-icon"></i></th>}
                                            {visibleColumns.has('apply_date') && <th className="al-th-sortable" onClick={() => handleSort('apply_date')}>Apply Date <i className="fa fa-caret-down al-sort-icon"></i></th>}
                                            {visibleColumns.has('from_date') && <th className="al-th-sortable" onClick={() => handleSort('from_date')}>From Date <i className="fa fa-caret-down al-sort-icon"></i></th>}
                                            {visibleColumns.has('to_date') && <th className="al-th-sortable" onClick={() => handleSort('to_date')}>To Date <i className="fa fa-caret-down al-sort-icon"></i></th>}
                                            {visibleColumns.has('reason') && <th className="al-th-sortable" onClick={() => handleSort('reason')}>Reason <i className="fa fa-caret-down al-sort-icon"></i></th>}
                                            {visibleColumns.has('status') && <th className="al-th-sortable" onClick={() => handleSort('status')}>Status <i className="fa fa-caret-down al-sort-icon"></i></th>}
                                            <th className="al-th-action">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan={visibleColumns.size + 1} className="al-td-loading">Loading...</td>
                                            </tr>
                                        ) : sortedList.length > 0 ? (
                                            sortedList.map((leave, index) => {
                                                const statusInfo = getStatusInfo(leave.status);
                                                return (
                                                    <tr key={index}>
                                                        {visibleColumns.has('class') && <td>{leave.class}</td>}
                                                        {visibleColumns.has('section') && <td>{leave.section}</td>}
                                                        {visibleColumns.has('apply_date') && <td>{leave.apply_date}</td>}
                                                        {visibleColumns.has('from_date') && <td>{leave.from_date}</td>}
                                                        {visibleColumns.has('to_date') && <td>{leave.to_date}</td>}
                                                        {visibleColumns.has('reason') && <td>{leave.reason}</td>}
                                                        {visibleColumns.has('status') && (
                                                            <td>
                                                                <span className="al-status-badge" style={{ background: statusInfo.color }}>
                                                                    {statusInfo.label}
                                                                </span>
                                                            </td>
                                                        )}
                                                         <td className="al-td-action">
                                                             <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                                 {leave.docs && (
                                                                     <a
                                                                         href={`https://newlayout.wisibles.com/user/apply_leave/download/${leave.id}`}
                                                                         title="Download"
                                                                         className="action-btn"
                                                                         target="_blank"
                                                                         rel="noopener noreferrer"
                                                                     style={{ marginRight: '5px', display: 'inline-block' }}
                                                                     >
                                                                         <i className="fa fa-download"></i>
                                                                     </a>
                                                                 )}
                                                             <button title="Edit" className="action-btn al-action-btn-edit" onClick={() => handleEditClick(leave)}>
                                                                     <i className="fa fa-pencil"></i>
                                                                 </button>
                                                             <button title="Delete" className="action-btn" onClick={() => handleDelete(leave.id)}>
                                                                     <i className="fa fa-remove"></i>
                                                                 </button>
                                                             </div>
                                                         </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={visibleColumns.size + 1} className="al-td-empty">
                                                    <div className="empty-state">
                                                        <div className="empty-state-text">No data available in table</div>
                                                        <div className="empty-illustration">
                                                            <img src="/images/addnewitem.svg" alt="empty" className="al-empty-img" />
                                                        </div>
                                                        <div className="add-record-text al-add-record-hint" onClick={() => setShowAddModal(true)}>
                                                            ← Add new record or search with different criteria.
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
                                        <button className="page-arrow" disabled>
                                            <i className="fa fa-chevron-left"></i>
                                        </button>
                                        <div className="page-number">1</div>
                                        <button className="page-arrow" disabled>
                                            <i className="fa fa-chevron-right"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Card List */}
                            <div className="leave-card-list">
                                {loading ? (
                                    <div className="al-card-loading">Loading...</div>
                                ) : sortedList.length > 0 ? (
                                    sortedList.map((leave, index) => {
                                        const statusInfo = getStatusInfo(leave.status);
                                        return (
                                            <div className="leave-card" key={index}>
                                                <div className="leave-card-header">
                                                    <h4 className="leave-card-title">Apply Date: {leave.apply_date}</h4>
                                                     <div className="leave-card-actions">
                                                         {leave.docs && (
                                                             <a
                                                                 href={`https://newlayout.wisibles.com/user/apply_leave/download/${leave.id}`}
                                                                 className="card-action-btn"
                                                                 title="Download"
                                                                 target="_blank"
                                                                 rel="noopener noreferrer"
                                                             >
                                                                 <i className="fa fa-download"></i>
                                                             </a>
                                                         )}
                                                         <button className="card-action-btn" onClick={() => handleEditClick(leave)} title="Edit">
                                                             <i className="fa fa-pencil"></i>
                                                         </button>
                                                         <button className="card-action-btn" onClick={() => handleDelete(leave.id)} title="Delete">
                                                             <i className="fa fa-remove"></i>
                                                         </button>
                                                     </div>
                                                </div>
                                                <div className="leave-card-body">
                                                    <div className="leave-card-row">From Date : {leave.from_date}</div>
                                                    <div className="leave-card-row">To Date : {leave.to_date}</div>
                                                    <div className="leave-card-row">Reason : {leave.reason}</div>
                                                    <div className="leave-card-status">
                                                        <span className="status-badge-custom" style={{ background: statusInfo.color }}>
                                                            {statusInfo.label} {leave.status === '1' ? '(16/03/2026)' : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="empty-state">
                                        <div className="empty-state-text">No Leave Records Found</div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </section>
            </div>

            {
                showAddModal && (
                    <div className="modal-overlay">
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h4>Add Leave</h4>
                                <button className="modal-close-icon" onClick={() => setShowAddModal(false)}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Apply Date <span>*</span></label>
                                    <div className="form-value-text">{leaveData.apply_date}</div>
                                </div>
                                <div className="al-modal-row">
                                    <div className="form-group al-modal-grp-half">
                                        <label>From Date <span>*</span></label>
                                        <input
                                            type="date"
                                            required
                                            className="form-control-underlined"
                                            value={leaveData.from_date}
                                            onClick={(e) => e.target.showPicker()}
                                            onChange={(e) => setLeaveData({ ...leaveData, from_date: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group al-modal-grp-half">
                                        <label>To Date <span>*</span></label>
                                        <input
                                            type="date"
                                            required
                                            className="form-control-underlined"
                                            value={leaveData.to_date}
                                            onClick={(e) => e.target.showPicker()}
                                            onChange={(e) => setLeaveData({ ...leaveData, to_date: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Reason</label>
                                    <textarea
                                        className="form-control-underlined"
                                        value={leaveData.reason}
                                        placeholder=""
                                        onChange={(e) => setLeaveData({ ...leaveData, reason: e.target.value })}
                                    ></textarea>
                                </div>
                                <div className="form-group">
                                    <label>Attach Document</label>
                                    {leaveData.file ? (
                                        <div className="file-selected-box" title={leaveData.file.name}>
                                            <div className="al-file-preview-wrap">
                                                {leaveData.file.type && leaveData.file.type.startsWith('image/') ? (
                                                    <img src={URL.createObjectURL(leaveData.file)} alt="Preview" className="file-preview-img" />
                                                ) : (
                                                    <div className="al-file-text-wrap">
                                                        <i className="fa fa-file-text-o al-file-text-icon"></i>
                                                        <span className="al-file-text-name">{leaveData.file.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="file-overlay">
                                                <label className="file-info-col al-file-info">
                                                    <span className="file-name-text">{leaveData.file.name}</span>
                                                    <span className="file-replace-text">Drag and drop or click to replace</span>
                                                    <input type="file" className="al-file-input" onChange={(e) => setLeaveData({ ...leaveData, file: e.target.files[0] })} />
                                                </label>
                                                <button
                                                    type="button"
                                                    className="btn-remove-file"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setLeaveData({ ...leaveData, file: null });
                                                        const fileInputs = document.querySelectorAll('input[type="file"]');
                                                        fileInputs.forEach(input => input.value = '');
                                                    }}
                                                >
                                                    REMOVE
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="file-upload-container al-file-upload-lbl">
                                            <div className="file-upload-content">
                                                <i className="fa fa-cloud-upload"></i>
                                                <span className="al-file-upload-txt">
                                                    Drag and drop a file here or click
                                                </span>
                                            </div>
                                            <input type="file" className="al-file-input" onChange={(e) => setLeaveData({ ...leaveData, file: e.target.files[0] })} />
                                        </label>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn-save-purple" onClick={handleSave}>Save</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showEditModal && (
                    <div className="modal-overlay">
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h4>Edit Leave</h4>
                                <button className="modal-close-icon" onClick={() => setShowEditModal(false)}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Apply Date <span>*</span></label>
                                    <div className="form-value-text">{leaveData.apply_date}</div>
                                </div>
                                <div className="al-modal-row">
                                    <div className="form-group al-modal-grp-half">
                                        <label>From Date <span>*</span></label>
                                        <input
                                            type="date"
                                            required
                                            className="form-control-underlined"
                                            value={leaveData.from_date}
                                            onClick={(e) => e.target.showPicker()}
                                            onChange={(e) => setLeaveData({ ...leaveData, from_date: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group al-modal-grp-half">
                                        <label>To Date <span>*</span></label>
                                        <input
                                            type="date"
                                            required
                                            className="form-control-underlined"
                                            value={leaveData.to_date}
                                            onClick={(e) => e.target.showPicker()}
                                            onChange={(e) => setLeaveData({ ...leaveData, to_date: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Reason</label>
                                    <textarea
                                        className="form-control-underlined"
                                        value={leaveData.reason}
                                        placeholder=""
                                        onChange={(e) => setLeaveData({ ...leaveData, reason: e.target.value })}
                                    ></textarea>
                                </div>
                                <div className="form-group">
                                    <label>Attach Document</label>
                                    {leaveData.file ? (
                                        <div className="file-selected-box" title={leaveData.file.name}>
                                            <div className="al-file-preview-wrap">
                                                {leaveData.file.type && leaveData.file.type.startsWith('image/') ? (
                                                    <img src={URL.createObjectURL(leaveData.file)} alt="Preview" className="file-preview-img" />
                                                ) : (
                                                    <div className="al-file-text-wrap">
                                                        <i className="fa fa-file-text-o al-file-text-icon"></i>
                                                        <span className="al-file-text-name">{leaveData.file.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="file-overlay">
                                                <label className="file-info-col al-file-info">
                                                    <span className="file-name-text">{leaveData.file.name}</span>
                                                    <span className="file-replace-text">Drag and drop or click to replace</span>
                                                    <input type="file" className="al-file-input" onChange={(e) => setLeaveData({ ...leaveData, file: e.target.files[0] })} />
                                                </label>
                                                <button
                                                    type="button"
                                                    className="btn-remove-file"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setLeaveData({ ...leaveData, file: null });
                                                        const fileInputs = document.querySelectorAll('input[type="file"]');
                                                        fileInputs.forEach(input => input.value = '');
                                                    }}
                                                >
                                                    REMOVE
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="file-upload-container al-file-upload-lbl">
                                            <div className="file-upload-content">
                                                <i className="fa fa-cloud-upload"></i>
                                                <span className="al-file-upload-txt">
                                                    Drag and drop a file here or click
                                                </span>
                                            </div>
                                            <input type="file" className="al-file-input" onChange={(e) => setLeaveData({ ...leaveData, file: e.target.files[0] })} />
                                        </label>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn-save-purple" onClick={handleUpdate}>Save</button>
                            </div>
                        </div>
                    </div>
                )
            }

        </>
    );
};

export default ApplyLeave;