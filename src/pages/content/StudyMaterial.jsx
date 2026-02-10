import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import ContentSidebar from './ContentSidebar';
import { useSession } from '../../context/SessionContext';

const StudyMaterial = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();
    const sessionYear = currentSession?.session || '2024-25';

    const handleLogout = () => {
        clearSession();
        localStorage.removeItem('isLoggedIn');
        navigate('/');
    };

    const userData = JSON.parse(localStorage.getItem('user')) || {
        name: 'Admin User',
        role: 'Super Admin',
        avatar: '/uploads/staff_images/default_male.jpg'
    };

    // Mock data based on studymaterial.php structure
    const [list, setList] = useState([
        {
            id: 1,
            title: 'Week 1 Schedule',
            type: 'Study Material',
            date: '2024-01-22',
            is_public: 'Yes',
            class: 'All Classes',
            file: '#',
            note: 'Schedule for the first week'
        },
        {
            id: 2,
            title: 'Exam Prep Guide',
            type: 'Study Material',
            date: '2024-02-01',
            is_public: 'No',
            class: 'Class 10 (A)',
            file: '#',
            note: ''
        }
    ]);

    return (
        <div className="wrapper">
            <Header appName="School Management System" userData={userData} handleLogout={handleLogout} />
            <Sidebar sessionYear={sessionYear} currentUrl="/admin/content/studymaterial" />

            <div className="content-wrapper">
                <section className="content-header">
                    <h1>
                        <i className="fa fa-download"></i> Download Center
                    </h1>
                </section>

                <section className="content">
                    <div className="row">
                        <div className="col-md-3">
                            <ContentSidebar />
                        </div>
                        <div className="col-md-9">
                            <div className="box box-primary" id="study_material">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Weekly Schedule</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="mailbox-controls">
                                        <div className="pull-right">
                                        </div>
                                    </div>
                                    <div className="mailbox-messages table-responsive">
                                        <div className="download_label">Weekly Schedule</div>
                                        <table className="table table-striped table-bordered table-hover example">
                                            <thead>
                                                <tr>
                                                    <th>Content Title</th>
                                                    <th>Type</th>
                                                    <th>Date</th>
                                                    <th>Available For</th>
                                                    <th className="text-right no-print">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {list.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" className="text-center text-danger">No Record Found</td>
                                                    </tr>
                                                ) : (
                                                    list.map((data) => (
                                                        <tr key={data.id}>
                                                            <td className="mailbox-name">
                                                                <a href="#" data-toggle="popover" className="detail_popover">{data.title}</a>
                                                                <div className="fee_detail_popover" style={{ display: 'block', fontSize: '12px', marginTop: '5px' }}>
                                                                    {data.note === "" ? (
                                                                        <p className="text text-danger">No Description</p>
                                                                    ) : (
                                                                        <p className="text text-info">{data.note}</p>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="mailbox-name">
                                                                {data.type}
                                                            </td>
                                                            <td className="mailbox-name">
                                                                {data.date}
                                                            </td>
                                                            <td className="mailbox-name">
                                                                {data.is_public === "Yes" ? "ALL Classes" : data.class}
                                                            </td>
                                                            <td className="mailbox-date pull-right no-print">
                                                                <a data-placement="left" href={data.file} target="_blank" className="btn btn-default btn-xs" data-toggle="tooltip" title="Download">
                                                                    <i className="fa fa-download"></i>
                                                                </a>
                                                                <a data-placement="left" href="#" className="btn btn-default btn-xs" data-toggle="tooltip" title="Delete" onClick={(e) => { e.preventDefault(); if (window.confirm('Are you sure you want to delete?')) { console.log('Delete', data.id); } }} style={{ marginLeft: '5px' }}>
                                                                    <i className="fa fa-remove"></i>
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default StudyMaterial;
