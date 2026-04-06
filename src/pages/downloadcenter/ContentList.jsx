import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../utils/include_files.js';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';
import api from '../../services/api';

const ContentList = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    // State for Mock Data
    const [contentList, setContentList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter/Search State
    const [searchTerm, setSearchTerm] = useState('');

    // Sort State
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Mock User Data
    const [loggedInUser, setLoggedInUser] = useState(null);
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setLoggedInUser(JSON.parse(storedUser));
            } catch (e) { }
        }

        // Mock Data Loading
        setTimeout(() => {
            setContentList([
                { id: 1, title: 'Math Assignment 1', send_to: 'Class 10-A', share_date: '01/15/2025', valid_upto: '01/20/2025', shared_by: 'Admin User', description: 'Chapter 1 Exercises', link: 'http://example.com/doc1' },
                { id: 2, title: 'Science Project Guidelines', send_to: 'All Students', share_date: '01/10/2025', valid_upto: '02/01/2025', shared_by: 'Teacher John', description: 'Guidelines for final project', link: 'http://example.com/doc2' },
                { id: 3, title: 'Holiday List', send_to: 'All Staff', share_date: '01/01/2025', valid_upto: '12/31/2025', shared_by: 'Super Admin', description: 'List of holidays for 2025', link: 'http://example.com/doc3' }
            ]);
            setLoading(false);
        }, 500);

    }, []);

    const userData = loggedInUser ? {
        name: loggedInUser.username,
        role: Object.keys(loggedInUser.roles || {})[0] || 'User',
        id: loggedInUser.id,
        avatar: loggedInUser.image || '/uploads/staff_images/default_male.jpg'
    } : {
        name: 'Admin User',
        role: 'Super Admin',
        id: 1,
        avatar: '/uploads/staff_images/default_male.jpg'
    };

    const sessionYear = currentSession?.session || '2024-25';

    // Sidebar Menus
    const sidebarMenus = [
        { id: 1, icon: 'helpdesk.png', label: 'Help Desk', url: '/admin/enquiry' },
        { id: 2, icon: 'sis.png', label: 'SIS', url: '/student/search' },
        { id: 3, icon: 'Fees.png', label: 'Fees Collection', url: '#' },
        { id: 4, icon: 'attendance.png', label: 'Attendance', url: '/student-attendance' },
        { id: 5, icon: 'state_examination.png', label: 'State Examinations', url: '#' },
        { id: 6, icon: 'courses.png', label: 'Courses', url: '#' },
        { id: 7, icon: 'homework.png', label: 'Homework', url: '#' },
        { id: 8, icon: 'transport.png', label: 'Transport', url: '#', active: false },
        { id: 9, icon: 'messages.png', label: 'Messages', url: '#' },
        { id: 10, icon: 'hr.png', label: 'Human Resource', url: '#' },
        { id: 11, icon: 'download_resouces.png', label: 'Download Center', url: '/admin/contenttype' },
        { id: 12, icon: 'certificate.png', label: 'Certificate', url: '#' },
        { id: 13, icon: 'income.png', label: 'Income', url: '#' },
        { id: 14, icon: 'expenses.png', label: 'Expenses', url: '#' },
        { id: 15, icon: 'hostle.png', label: 'Hostel', url: '#' },
        { id: 16, icon: 'reports.png', label: 'Reports', url: '#' },
        { id: 17, icon: 'settings.png', label: 'System Settings', url: '/settings' }
    ];

    const mobileNavItems = [
        { id: 1, icon: 'sis.png', label: 'SIS', url: '/student/search' },
        { id: 2, icon: 'Fees.png', label: 'Fees', url: '#' },
        { id: 3, icon: 'attendance.png', label: 'Attendance', url: '/student-attendance' },
        { id: 4, icon: 'settings.png', label: 'More', url: '/settings' },
        { id: 5, icon: 'logout', label: 'Logout', url: '#', isLogout: true }
    ];

    const handleLogout = async () => {
        try { await api.logout(); } catch (e) { }
        clearSession();
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Search triggered');
    };

    const filteredContent = contentList.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedContent = React.useMemo(() => {
        let sortableItems = [...filteredContent];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredContent, sortConfig]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'asc' ? 'fa-sort-asc' : 'fa-sort-desc';
        }
        return 'fa-sort';
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <style>{`
                .content-wrapper { min-height: 90vh; background-color: #f4f6f9; }
                .box { position: relative; border-radius: 3px; background: #ffffff; border-top: 3px solid #d2d6de; margin-bottom: 20px; width: 100%; box-shadow: 0 1px 1px rgba(0,0,0,0.1); }
                .box.box-primary { border-top-color: #3c8dbc; }
                .box-header { color: #444; display: block; padding: 10px; position: relative; }
                .box-header.with-border { border-bottom: 1px solid #f4f4f4; }
                .box-title { display: inline-block; font-size: 18px; margin: 0; line-height: 1; }
                .box-body { border-top-left-radius: 0; border-top-right-radius: 0; border-bottom-right-radius: 3px; border-bottom-left-radius: 3px; padding: 10px; }
                .titlefix { margin-top: 5px; }
                .pull-right { float: right!important; }
                .btn-primary { background-color: #337ab7; border-color: #2e6da4; color: #fff; }
                .btn-xs { padding: 1px 5px; font-size: 12px; line-height: 1.5; border-radius: 3px; }
                .table-striped>tbody>tr:nth-of-type(odd) { background-color: #f9f9f9; }
                .table-bordered { border: 1px solid #f4f4f4; }
                .noExport { display: block; }
                .box.border0 { border-top: 0 !important; }
                
                /* Toolbar Styles */
                .dt-buttons .btn { border: none; background: transparent; box-shadow: none; border-bottom: 1px solid #ccc; border-radius: 0; }
                .dt-buttons .btn:hover { background: #f0f0f0; }
                .mailbox-messages input[type="search"] { border: none; border-bottom: 1px solid #ccc; box-shadow: none; border-radius: 0; outline: none; }
                .mailbox-messages input[type="search"]:focus { border-bottom: 1px solid #3c8dbc; }
            `}</style>

            <Header appName="School Management System" userData={userData} pendingTasks={[]} handleLogout={handleLogout} />
            <Sidebar sidebarMenus={sidebarMenus} mobileNavItems={mobileNavItems} handleSearch={handleSearch} sessionYear={sessionYear} currentUrl="/admin/content/list" />

            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content">
                    <div className="row" style={{ marginTop: '20px' }}>
                        <div className="col-md-12">
                            <div className="box box-primary border0">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Content Share List</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                    <div className="box-tools pull-right"></div>
                                </div>
                                <div className="box-body">
                                    <div className="table-responsive mailbox-messages overflow-visible-lg">

                                        {/* Toolbar */}
                                        <div style={{ padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'inline-block' }}>
                                                <label>Search: <input type="search" className="form-control input-sm" placeholder="" aria-controls="example" style={{ display: 'inline-block', width: 'auto' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></label>
                                            </div>

                                            <div className="dt-buttons btn-group" style={{ marginBottom: '10px' }}>
                                                <button className="btn btn-default btn-sm" title="Copy"><i className="fa fa-copy"></i></button>
                                                <button className="btn btn-default btn-sm" title="Excel"><i className="fa fa-file-excel-o"></i></button>
                                                <button className="btn btn-default btn-sm" title="CSV"><i className="fa fa-file-text-o"></i></button>
                                                <button className="btn btn-default btn-sm" title="PDF"><i className="fa fa-file-pdf-o"></i></button>
                                                <button className="btn btn-default btn-sm" title="Print"><i className="fa fa-print"></i></button>
                                                <div className="btn-group">
                                                    <button className="btn btn-default btn-sm dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="Columns">
                                                        <i className="fa fa-columns"></i>
                                                    </button>
                                                    <ul className="dropdown-menu">
                                                        <li><a href="#">Title</a></li>
                                                        <li><a href="#">Send To</a></li>
                                                        <li><a href="#">Share Date</a></li>
                                                        <li><a href="#">Action</a></li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        <table className="table table-striped table-bordered table-hover content-list">
                                            <thead>
                                                <tr>
                                                    <th className="sorting" onClick={() => requestSort('title')} style={{ cursor: 'pointer' }}>Title <i className={`fa ${getSortIcon('title')} pull-right`} style={{ color: sortConfig.key === 'title' ? '#333' : '#ccc' }}></i></th>
                                                    <th className="sorting" onClick={() => requestSort('send_to')} style={{ cursor: 'pointer' }}>Send To <i className={`fa ${getSortIcon('send_to')} pull-right`} style={{ color: sortConfig.key === 'send_to' ? '#333' : '#ccc' }}></i></th>
                                                    <th className="sorting" onClick={() => requestSort('share_date')} style={{ cursor: 'pointer' }}>Share Date <i className={`fa ${getSortIcon('share_date')} pull-right`} style={{ color: sortConfig.key === 'share_date' ? '#333' : '#ccc' }}></i></th>
                                                    <th className="sorting" onClick={() => requestSort('valid_upto')} style={{ cursor: 'pointer' }}>Valid Upto <i className={`fa ${getSortIcon('valid_upto')} pull-right`} style={{ color: sortConfig.key === 'valid_upto' ? '#333' : '#ccc' }}></i></th>
                                                    <th className="sorting" onClick={() => requestSort('shared_by')} style={{ cursor: 'pointer' }}>Shared By <i className={`fa ${getSortIcon('shared_by')} pull-right`} style={{ color: sortConfig.key === 'shared_by' ? '#333' : '#ccc' }}></i></th>
                                                    <th className="sorting" onClick={() => requestSort('description')} style={{ cursor: 'pointer' }}>Description <i className={`fa ${getSortIcon('description')} pull-right`} style={{ color: sortConfig.key === 'description' ? '#333' : '#ccc' }}></i></th>
                                                    <th className="pull-right noExport">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr><td colSpan="7" className="text-center">Loading...</td></tr>
                                                ) : sortedContent.map((item) => (
                                                    <tr key={item.id}>
                                                        <td>{item.title}</td>
                                                        <td>{item.send_to}</td>
                                                        <td>{item.share_date}</td>
                                                        <td>{item.valid_upto}</td>
                                                        <td>{item.shared_by}</td>
                                                        <td>{item.description}</td>
                                                        <td className="pull-right noExport">
                                                            <a href="#" className="btn btn-default btn-xs" onClick={(e) => { e.preventDefault(); }} title="Link">
                                                                <i className="fa fa-link"></i>
                                                            </a>
                                                            <a href="#" className="btn btn-default btn-xs" onClick={(e) => { e.preventDefault(); }} title="View">
                                                                <i className="fa fa-eye"></i>
                                                            </a>
                                                            <a href="#" className="btn btn-default btn-xs" onClick={(e) => { e.preventDefault(); }} title="Delete">
                                                                <i className="fa fa-trash"></i>
                                                            </a>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div style={{ padding: '5px', fontSize: '12px' }}>
                                            Records: {filteredContent.length > 0 ? 1 : 0} to {filteredContent.length} of {filteredContent.length}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <Footer />
            <div className="control-sidebar-bg"></div>
        </div>
    );
};

export default ContentList;
