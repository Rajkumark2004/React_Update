import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import '../../utils/include_files';
import { useSession } from '../../context/SessionContext';

const CBSESettings = () => {
    const { sessionYear } = useSession();
    const navigate = useNavigate();

    // Layout Mock Data (copied from CBSEExamList for consistency)
    const appName = "Smart School";
    const userData = {
        name: "Joe",
        pimage: "/public/images/userprofile.jpg",
        role: "Super Admin"
    };

    const sidebarMenus = [
        { id: 1, icon: 'helpdesk.png', label: 'Help Desk', url: '/admin/enquiry' },
        { id: 2, icon: 'sis.png', label: 'SIS', url: '/student/search' },
        { id: 3, icon: 'Fees.png', label: 'Fees', url: '#' },
        { id: 4, icon: 'attendance.png', label: 'Attendance', url: '/student-attendance' },
        { id: 5, icon: 'state_examination.png', label: 'State Examinations', url: '/cbseexam/exam' },
        { id: 6, icon: 'courses.png', label: 'Courses', url: '#' },
        { id: 7, icon: 'homework.png', label: 'Homework', url: '#' },
        { id: 8, icon: 'transport.png', label: 'Transport', url: '#' },
        { id: 9, icon: 'messages.png', label: 'Messages', url: '#' },
        { id: 10, icon: 'hr.png', label: 'Human Resource', url: '/admin/staff' },
        { id: 11, icon: 'download_resouces.png', label: 'Download Center', url: '#' },
        { id: 12, icon: 'certificate.png', label: 'Certificate', url: '#' },
        { id: 13, icon: 'income.png', label: 'Income', url: '#' },
        { id: 14, icon: 'expenses.png', label: 'Expenses', url: '#' },
        { id: 15, icon: 'hostle.png', label: 'Hostel', url: '#' },
        { id: 16, icon: 'reports.png', label: 'Reports', url: '#' },
        { id: 17, icon: 'settings.png', label: 'System Settings', url: '/settings' }
    ];

    const handleLogout = () => console.log("Logout");
    const handleSearch = (term) => console.log("Search:", term);

    return (
        <div className="wrapper">
            <Header appName={appName} userData={userData} handleLogout={handleLogout} />
            <Sidebar
                sidebarMenus={sidebarMenus}
                sessionYear={sessionYear}
                currentUrl="/cbseexam/exam"
                handleSearch={handleSearch}
            />

            <div className="content-wrapper" style={{ marginTop: '17px', minHeight: '560px' }}>
                <section className="content-header">
                    <h1><i className="fa fa-ioxhost" style={{ marginRight: '5px' }}></i> Setting</h1>
                </section>
                <section className="content">
                    <div className="row">
                        {/* Left Column */}
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix"><i className="fa fa-gear" style={{ marginRight: '5px' }}></i> Setting</h3>
                                    <div className="btn-group pull-right">
                                        <button
                                            onClick={() => navigate('/cbseexam/exam')}
                                            className="btn btn-primary btn-xs"
                                        >
                                            <i className="fa fa-arrow-left" style={{ marginRight: '3px' }}></i> Back
                                        </button>
                                    </div>
                                </div>{/* /.box-header */}
                                <div className="">
                                    <div className="box-body">
                                        <div className="row">
                                            <div className="row">
                                                {/* Content is empty in the source file, so keeping it empty here */}
                                            </div>
                                        </div>{/*./row*/}
                                    </div>{/* /.box-body */}
                                    <div className="box-footer">
                                        <div className="pull-right">Version 1.0.0</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>{/* /.content */}
            </div>
            <Footer />
        </div>
    );
};

export default CBSESettings;
