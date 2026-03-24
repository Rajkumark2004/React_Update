import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import { api_users } from '../../services/api_users';
import '../../utils/include_files.js';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable, buildExportData } from '../../utils/tableExport.js';

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
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [addForm, setAddForm] = useState({ subject: '', title: '', description: '', file: null, dragOver: false });
    const [editForm, setEditForm] = useState({ id: null, subject: '', title: '', description: '', file: null, dragOver: false });

    const sessionYear = currentSession?.session || '2024-25';
    const themeColor = "#9c68e4";

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const res = await api_users.getDailyAssignment();
            console.log('Daily Assignment full response:', res);
            console.log('Daily Assignment res.data keys:', res?.data ? Object.keys(res.data) : 'no data');
            if (res && res.data) {
                // Set assignment list — correct key is "daily_assignments" (confirmed from user_Homework.jsx)
                const assignments = res.data.daily_assignments || res.data.result_list || res.data.assignments || [];
                console.log('Assignments found:', assignments.length, assignments);
                setAssignmentList(Array.isArray(assignments) ? assignments : []);

                // Set subject list — correct key is "subject_list" (confirmed from user_Homework.jsx)
                const subjects = res.data.subject_list || res.data.subjects || res.data.subject_group_subjects || [];
                console.log('Subjects found:', subjects.length, subjects);
                if (Array.isArray(subjects) && subjects.length > 0) {
                    setSubjectList(subjects);
                }
            }
        } catch (error) {
            console.error("Failed to fetch daily assignments:", error);
        } finally {
            setLoading(false);
        }
    };

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

                // Fetch daily assignments and subjects
                await fetchAssignments();
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

    // --- ADD Assignment ---
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if (!addForm.subject || !addForm.title) {
            alert('Please fill Subject and Title fields.');
            return;
        }
        try {
            setSubmitting(true);
            await api_users.createDailyAssignment({
                subject_group_subject_id: addForm.subject,
                title: addForm.title,
                description: addForm.description,
                file: addForm.file
            });
            setShowAddModal(false);
            setAddForm({ subject: '', title: '', description: '', file: null, dragOver: false });
            await fetchAssignments(); // refresh list
        } catch (error) {
            console.error('Failed to create assignment:', error);
            alert('Failed to create assignment: ' + (error.message || 'Unknown error'));
        } finally {
            setSubmitting(false);
        }
    };

    // --- EDIT Assignment ---
    const handleEditClick = async (item) => {
        try {
            const id = item.id || item.assignment_id;
            const res = await api_users.getDailyAssignmentDetails(id);
            console.log('Edit details response:', res);
            const detail = res.data || res;
            setEditForm({
                id: id,
                subject: detail.subject_group_subject_id || item.subject_group_subject_id || '',
                title: detail.title || item.title || '',
                description: detail.description || item.description || '',
                file: null,
                dragOver: false
            });
            setShowEditModal(true);
        } catch (error) {
            console.error('Failed to load assignment details:', error);
            // Fallback: open edit modal with data from the table row
            setEditForm({
                id: item.id || item.assignment_id,
                subject: item.subject_group_subject_id || '',
                title: item.title || '',
                description: item.description || '',
                file: null,
                dragOver: false
            });
            setShowEditModal(true);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editForm.subject || !editForm.title) {
            alert('Please fill Subject and Title fields.');
            return;
        }
        try {
            setSubmitting(true);
            await api_users.updateDailyAssignment({
                id: editForm.id,
                subject_group_subject_id: editForm.subject,
                title: editForm.title,
                description: editForm.description,
                file: editForm.file
            });
            setShowEditModal(false);
            setEditForm({ id: null, subject: '', title: '', description: '', file: null, dragOver: false });
            await fetchAssignments(); // refresh list
        } catch (error) {
            console.error('Failed to update assignment:', error);
            alert('Failed to update assignment: ' + (error.message || 'Unknown error'));
        } finally {
            setSubmitting(false);
        }
    };

    // --- DELETE Assignment ---
    const handleDeleteClick = async (item) => {
        const id = item.id || item.assignment_id;
        if (!window.confirm('Are you sure you want to delete this assignment?')) return;
        try {
            await api_users.deleteDailyAssignment(id);
            await fetchAssignments(); // refresh list
        } catch (error) {
            console.error('Failed to delete assignment:', error);
            alert('Failed to delete assignment: ' + (error.message || 'Unknown error'));
        }
    };

    // --- DOWNLOAD Attachment ---
    const handleDownloadClick = (item) => {
        const fileUrl = item.file || item.attachment || item.document;
        if (fileUrl) {
            window.open(fileUrl, '_blank');
        } else {
            alert('No attachment available for this assignment.');
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

    const columns = [
        { key: 'subject', label: 'Subject' },
        { key: 'title', label: 'Title' },
        { key: 'description', label: 'Description' },
        { key: 'remark', label: 'Remark' },
        { key: 'submission_date', label: 'Submission Date' },
        { key: 'evaluation_date', label: 'Evaluation Date' }
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
            filteredData,
            (row, key) => {
                if (key === 'subject') return row.subject_name || '';
                if (key === 'submission_date') return row.date || '';
                return row[key] || '';
            }
        );
    };

    const handleCopy = () => {
        const { headers, rows } = getFormattedData();
        copyToClipboard(headers, rows);
    };

    const handleExportCSV = () => {
        const { headers, rows } = getFormattedData();
        downloadCSV(headers, rows, 'DailyAssignments.csv');
    };

    const handleExportExcel = () => {
        const { headers, rows } = getFormattedData();
        downloadExcel(headers, rows, 'DailyAssignments.xls');
    };

    const handleExportPDF = () => {
        const { headers, rows } = getFormattedData();
        downloadPDF(headers, rows, 'DailyAssignments.pdf', 'Daily Assignment List');
    };

    const handlePrint = () => {
        const { headers, rows } = getFormattedData();
        printTable(headers, rows, 'Daily Assignment List');
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
                .content-wrapper {
                    margin-left: 80px !important;
                  
                }
                .main-footer{
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
                .content-wrapper {
                    background-color: #f7f8fa !important;
                    padding: 0px 2px 0px 2px !important;
                    margin-top: 40px !important;
                    min-height: calc(100vh - 70px);
                }

                /* Table Styling Reference: UserHostelRoom.jsx */
                .da-box {
                    background: #fff;
                    border-radius: 4px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1) !important;
                    margin: 25px 5px 15px 10px;
                }
                .da-header {
                    padding: 8px 15px;
                    border-bottom: 1px solid #f4f4f4;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap; /* Added to allow wrapping on mobile */
                    gap: 10px;
                }
                .box-title {
                    margin: 0 !important;
                    font-size: 18px !important;
                    font-weight: 500 !important; /* Slightly bolder */
                    color: #333 !important;
                    white-space: nowrap; /* Prevent title wrapping if possible */
                    @media (max-width: 388px) {
                        font-size: 15px !important;
                        max-width: 160px !important;
                        overflow: hidden !important;
                        text-overflow: ellipsis !important;
                    }
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
                    padding: 4px 10px;
                    margin-bottom: 5px;
                    flex-wrap: wrap; /* Allow wrapping for search/export */
                    gap: 10px;
                }
                .da-search-input {
                    border: none;
                    border-bottom: 1px solid #ccc;
                    padding: 6px 2px;
                    font-size: 14px;
                    outline: none;
                    width: 100%;
                    max-width: 200px;
                    background: transparent;
                }
                .da-search-input:focus {
                    border-bottom-color: ${themeColor};
                }
                .da-export-icons {
                    display: flex;
                    gap: 4px;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 2px;
                    justify-content: flex-end;
                    flex-wrap: wrap; /* Allow icons to wrap if needed */
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
                    padding: 10px 12px;
                    border-bottom: 1px solid #eee;
                    color: #555;
                    vertical-align: middle;
                }
                .da-table tbody tr:hover { background: #f0f0f0; }

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
                    max-height: 90vh; /* Increased to prevent overflow/clipping */
                    overflow: initial; /* Removed forced scrollbar */
                    box-shadow: 0 5px 30px rgba(0,0,0,0.2);
                    position: relative;
                }
                              .da-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 25px;
                    border-bottom: 1px solid #eee;
                    background: ${themeColor};
                    border-radius: 6px 6px 0 0;
                }
                .da-modal-header h4 { margin: 0; font-size: 17px; color: #fff !important; font-weight: 600; }
                .da-modal-close { 
                    background: none; 
                    border: none; 
                    font-size: 22px; 
                    cursor: pointer; 
                    color: #fff !important; 
                    font-weight: bold; 
                    transition: transform 0.3s ease;
                }
                .da-modal-close:hover {
                    transform: rotate(90deg);
                }

                .da-modal-header h4 { margin: 0; font-size: 17px; color: #fff; font-weight: 600; }
                .da-modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: #333; font-weight: bold; }
                .da-modal-body { padding: 12px 25px 0 25px; }
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

                /* Common File Upload CSS */
                .file-upload-container {
                    border: none;
                    border-bottom: 1px solid #ddd;
                    padding: 4px 0px;
                    text-align: left;
                    cursor: pointer;
                    background: transparent;
                    border-radius: 0;
                    display: block;
                    transition: border-bottom-color 0.3s;
                }

                .file-upload-container:hover {
                    border-color: ${themeColor};
                }

                .file-upload-container input[type="file"] {
                    display: none;
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
                }                .file-selected-box {
                    position: relative;
                    background: transparent;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-top: 5px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    min-height: 70px; /* Increased to ensure both name and replace text fit */
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
                    justify-content: flex-end !important; /* Moved to bottom */
                    flex-grow: 1;
                    min-width: 0;
                    cursor: pointer;
                    height: 100%;
                    padding: 10px 70px 0px !important; /* Added 6px bottom padding */
                    margin-top: 20px !important;
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
                    margin: 0 0 0px 0 !important; /* Added small bottom margin to separate from replace text */
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
                    transform: translateY(-50%) !important;
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

                @media (max-width: 769px) {
                    .main-sidebar { width: 0 !important; }
                    .content-wrapper, .main-header .navbar, .main-footer { margin-left: 0 !important; }
                    .main-header .logo { width: 120px !important; }
                    .main-header .logo img { width: 100px !important; }
                    
                    /* Padding balancing for mobile */
                    .content-wrapper { padding: 15px 0px 0px 0px !important; margin-top: 50px !important; }
                    .content { padding: 0 8px !important; }
                    
                    .da-box { margin: 5px !important; }
                    
                                      .da-header {
                        flex-direction: row !important;
                        justify-content: space-between !important;
                        align-items: flex-start !important;
                        padding: 12px 10px 12px 15px !important;
                        gap: 12px !important;
                    }
                    
                    .da-header-actions {
                        display: flex !important;
                        flex-direction: column-reverse !important;
                        align-items: flex-end !important;
                        gap: 10px !important;
                    }
                    
                                      .da-add-btn {
                        padding: 6px 12px !important;
                        font-size: 12px !important;
                        margin-top:35px ;
                        margin-right: 0 !important;
                        width: 150px !important;
                        justify-content: center;
                        display: flex;
                        align-items: center;
                    }
                    
                    .mobile-box-back-btn {
                        position: absolute !important;
                        top: 10px !important;
                        right: 10px !important;
                        padding: 6px 12px !important;
                        font-size: 12px !important;
                        width: auto !important;
                        background: transparent;
                        border: none;
                        color: ${themeColor};
                    }
                    
                    .da-table-top {
                        flex-direction: column-reverse !important; /* Icons on top, Search below */
                        align-items: center !important;
                        gap: 0 !important; /* Using borders for spacing */
                        padding: 0 !important;
                        margin-bottom: 20px !important;
                    }
                    
                    .da-export-icons {
                        width: 170px !important;
                        justify-content: center !important;
                        padding: 2px 0 !important;
                        border-bottom: 1px solid #ddd !important;
                        border-top: none !important;
                        margin: 0 !important;
                        gap: 4px !important; /* Reduced to even tighter 4px */
                    }
                    
                    .da-export-btn {
                        font-size: 14px !important;
                        padding: 4px !important;
                    }
                    
                    .da-search {
                        width: 170px !important;
                        padding: 2px 0 !important;
                        border-bottom: 1px solid #ddd !important;
                    }
                    
                    .da-search-input {
                        max-width: 100% !important;
                        width: 100% !important;
                        margin: 0 !important;
                        text-align: start !important;
                        font-size: 14px !important;
                        border-bottom: none !important;
                        color: #777 !important;
                    }
                    
                    .da-table th, .da-table td {
                        padding: 8px 10px !important;
                        font-size: 12px !important;
                    }
                    
                    .da-table-footer {
                        flex-direction: column !important;
                        gap: 10px !important;
                        align-items: center !important;
                        padding: 15px !important;
                    }
                    
                    /* Modal Mobile Refinements */
                    .da-modal {
                        width: 95% !important;
                        margin: 10px auto !important;
                    }
                    .da-modal-header, .da-modal-body, .da-modal-footer {
                        padding: 10px 15px !important;
                    }
                    .da-modal-body {
                        max-height: 70vh !important;
                        overflow-y: auto !important;
                    }
                }
                @media (min-width: 770px) {
                    .mobile-box-back-btn { display: none !important; }
                }

                /* DailyAssignment page specific */
                .da-content { padding: 4px; }
                .da-hide-mobile-spacer { margin-bottom: 10px; }
                .da-box-wrapper { position: relative; }
                .da-header-actions { display: flex; gap: 10px; }
                .da-export-wrap { position: relative; }
                .da-sort-icon { color: #ccc; margin-left: 4px; }
                .da-th-action { text-align: right; }
                .da-td-empty { text-align: center; padding: 20px; }
                .da-empty-text-style { color: #dd4b39; font-size: 14px; margin-bottom: 20px; }
                .da-empty-img { width: 200px; height: 170px; margin-bottom: 20px; }
                .da-empty-hint-style { color: #3c763d; font-size: 13px; font-weight: bold; }
                .da-empty-hint-icon { margin-right: 5px; }
                .da-td-action { text-align: right; }
                .da-file-preview-wrap { padding: 2px; display: flex; justify-content: center; align-items: center; }
                .da-file-noimage { color: #666; text-align: center; }
                .da-file-noimage-icon { font-size: 24px; margin-right: 8px; vertical-align: middle; }
                .da-file-noimage-name { vertical-align: middle; font-size: 13px; }
                .da-file-info-label { margin: 0; width: 100%; color: #777777; }
                .da-file-upload-block { display: block; }
                .da-file-upload-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; color: #777777; }
                .da-file-hidden { display: none; }
            `}</style>
            <div className="content-wrapper">
                <section className="content da-content">
                    <div className="hide-mobile da-hide-mobile-spacer">                    </div>

                    <div className="da-box da-box-wrapper">
                        <div className="da-header">
                            <h3 className="box-title">Daily Assignment List</h3>
                            <div className="da-header-actions">
                                <button className="da-add-btn" onClick={() => setShowAddModal(true)}>
                                    <i className="fa fa-plus"></i> Daily Assignment
                                </button>
                                <button className="mobile-box-back-btn" onClick={() => navigate('/user/dashboard')}>
                                    <i className="fa fa-arrow-left"></i> Back
                                </button>
                            </div>
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
                                <div className="da-export-icons da-export-wrap" ref={dropdownRef}>
                                    <button className="da-export-btn" title="Copy" onClick={handleCopy}><i className="fa fa-copy"></i></button>
                                    <button className="da-export-btn" title="Excel" onClick={handleExportExcel}><i className="fa fa-file-excel-o"></i></button>
                                    <button className="da-export-btn" title="CSV" onClick={handleExportCSV}><i className="fa fa-file-text-o"></i></button>
                                    <button className="da-export-btn" title="PDF" onClick={handleExportPDF}><i className="fa fa-file-pdf-o"></i></button>
                                    <button className="da-export-btn" title="Print" onClick={handlePrint}><i className="fa fa-print"></i></button>
                                    <button className="da-export-btn" title="Columns" onClick={() => setShowColumnDropdown(!showColumnDropdown)}><i className="fa fa-columns"></i></button>

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

                            <div className="table-responsive">
                                <table className="da-table">
                                    <thead>
                                        <tr>
                                            {visibleColumns.has('subject') && <th>Subject <i className="fa fa-caret-down da-sort-icon"></i></th>}
                                            {visibleColumns.has('title') && <th>Title <i className="fa fa-caret-down da-sort-icon"></i></th>}
                                            {visibleColumns.has('description') && <th>Description <i className="fa fa-caret-down da-sort-icon"></i></th>}
                                            {visibleColumns.has('remark') && <th>Remark <i className="fa fa-caret-down da-sort-icon"></i></th>}
                                            {visibleColumns.has('submission_date') && <th>Submission Date <i className="fa fa-caret-down da-sort-icon"></i></th>}
                                            {visibleColumns.has('evaluation_date') && <th>Evaluation Date <i className="fa fa-caret-down da-sort-icon"></i></th>}
                                            <th className="da-th-action">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.length === 0 ? (
                                            <tr>
                                                <td colSpan={visibleColumns.size + 1} className="da-td-empty">
                                                    <div className="da-empty-state">
                                                        <div className="da-empty-text da-empty-text-style">No data available in table</div>
                                                        <img src="/images/addnewitem.svg" alt="empty" className="da-empty-img" />
                                                        <div className="da-empty-hint da-empty-hint-style">
                                                            <i className="fa fa-arrow-left da-empty-hint-icon"></i>
                                                            Add new record or search with different criteria.
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredData.map((item, index) => (
                                                <tr key={index}>
                                                    {visibleColumns.has('subject') && <td>{item.subject_name}</td>}
                                                    {visibleColumns.has('title') && <td>{item.title}</td>}
                                                    {visibleColumns.has('description') && <td>{item.description}</td>}
                                                    {visibleColumns.has('remark') && <td>{item.remark}</td>}
                                                    {visibleColumns.has('submission_date') && <td>{item.date}</td>}
                                                    {visibleColumns.has('evaluation_date') && <td>{item.evaluation_date}</td>}
                                                    <td className="da-td-action">
                                                        <button className="da-action-btn" title="Edit" onClick={() => handleEditClick(item)}><i className="fa fa-pencil"></i></button>
                                                        <button className="da-action-btn" title="Delete" onClick={() => handleDeleteClick(item)}><i className="fa fa-remove"></i></button>
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
                            <h4 className='box-title'>Add Daily Assignment</h4>
                            <button className="da-modal-close" onClick={() => setShowAddModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleAddSubmit}>
                            <div className="da-modal-body">
                                <div className="da-form-group">
                                    <label>Subject <span className="req">*</span></label>
                                    <select name="subject" required value={addForm.subject} onChange={handleAddFormChange}>
                                        <option value="">Select</option>
                                        {subjectList.map((sub, idx) => (
                                            <option key={idx} value={sub.subject_group_subject_id || sub.id}>{sub.subject_name || sub.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="da-form-group">
                                    <label>Title <span className="req">*</span></label>
                                    <input type="text" name="title" required value={addForm.title} onChange={handleAddFormChange} />
                                </div>
                                <div className="da-form-group">
                                    <label>Description</label>
                                    <textarea name="description" rows="4" value={addForm.description} onChange={handleAddFormChange}></textarea>
                                </div>
                                <div className="da-form-group">
                                    <label>Attach Document</label>
                                    {addForm.file ? (
                                        <div className="file-selected-box" title={addForm.file.name}>
                                            <div className="da-file-preview-wrap">
                                                {addForm.file.type && addForm.file.type.startsWith('image/') ? (
                                                    <img src={URL.createObjectURL(addForm.file)} alt="Preview" className="file-preview-img" />
                                                ) : (
                                                    <div className="da-file-noimage">
                                                        <i className="fa fa-file-text-o da-file-noimage-icon"></i>
                                                        <span className="da-file-noimage-name">{addForm.file.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="file-overlay">
                                                <label className="file-info-col da-file-info-label">
                                                    <span className="file-name-text">{addForm.file.name}</span>
                                                    <span className="file-replace-text">Drag and drop or click to replace</span>
                                                    <input type="file" className="da-file-hidden" onChange={(e) => setAddForm({ ...addForm, file: e.target.files[0] })} />
                                                </label>
                                                <button
                                                    type="button"
                                                    className="btn-remove-file"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setAddForm({ ...addForm, file: null });
                                                        const fileInputs = document.querySelectorAll('input[type="file"]');
                                                        fileInputs.forEach(input => input.value = '');
                                                    }}
                                                >
                                                    REMOVE
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="file-upload-container da-file-upload-block">
                                            <div className="file-upload-content">
                                                <i className="fa fa-cloud-upload"></i>
                                                <span className="da-file-upload-text">
                                                    Drag and drop a file here or click
                                                </span>
                                            </div>
                                            <input
                                                type="file"
                                                onChange={(e) => setAddForm({ ...addForm, file: e.target.files[0] })}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                            <div className="da-modal-footer">
                                <button type="submit" className="da-save-btn" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {showEditModal && (
                <div className="da-modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="da-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="da-modal-header">
                            <h4 className='box-title'>Edit Daily Assignment</h4>
                            <button className="da-modal-close" onClick={() => setShowEditModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            <div className="da-modal-body">
                                <div className="da-form-group">
                                    <label>Subject <span className="req">*</span></label>
                                    <select name="subject" required value={editForm.subject} onChange={handleEditFormChange}>
                                        <option value="">Select</option>
                                        {subjectList.map((sub, idx) => (
                                            <option key={idx} value={sub.subject_group_subject_id || sub.id}>{sub.subject_name || sub.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="da-form-group">
                                    <label>Title <span className="req">*</span></label>
                                    <input type="text" name="title" required value={editForm.title} onChange={handleEditFormChange} />
                                </div>
                                <div className="da-form-group">
                                    <label>Description</label>
                                    <textarea name="description" rows="4" value={editForm.description} onChange={handleEditFormChange}></textarea>
                                </div>
                                <div className="da-form-group">
                                    <label>Attach Document</label>
                                    {editForm.file ? (
                                        <div className="file-selected-box" title={editForm.file.name}>
                                            <div className="da-file-preview-wrap">
                                                {editForm.file.type && editForm.file.type.startsWith('image/') ? (
                                                    <img src={URL.createObjectURL(editForm.file)} alt="Preview" className="file-preview-img" />
                                                ) : (
                                                    <div className="da-file-noimage">
                                                        <i className="fa fa-file-text-o da-file-noimage-icon"></i>
                                                        <span className="da-file-noimage-name">{editForm.file.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="file-overlay">
                                                <label className="file-info-col da-file-info-label">
                                                    <span className="file-name-text">{editForm.file.name}</span>
                                                    <span className="file-replace-text">Drag and drop or click to replace</span>
                                                    <input type="file" className="da-file-hidden" onChange={(e) => setEditForm({ ...editForm, file: e.target.files[0] })} />
                                                </label>
                                                <button
                                                    type="button"
                                                    className="btn-remove-file"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setEditForm({ ...editForm, file: null });
                                                    }}
                                                >
                                                    REMOVE
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="file-upload-container da-file-upload-block">
                                            <div className="file-upload-content">
                                                <i className="fa fa-cloud-upload"></i>
                                                <span className="da-file-upload-text">
                                                    Drag and drop a file here or click
                                                </span>
                                            </div>
                                            <input
                                                type="file"
                                                onChange={(e) => setEditForm({ ...editForm, file: e.target.files[0] })}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                            <div className="da-modal-footer">
                                <button type="submit" className="da-save-btn" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default DailyAssignment;