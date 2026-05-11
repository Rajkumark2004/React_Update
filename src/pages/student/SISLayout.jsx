import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { api } from '../../services/api';
import { useSISCounts } from '../../context/SISCountContext';
import './SISLayout.css';

const SISLayout = ({ children, activeTab }) => {
    const { counts, updateCount } = useSISCounts();

    useEffect(() => {
        const fetchCounts = async () => {
            // Helper to update global count if it's currently placeholders
            const checkAndUpdate = async (key, fetchFn, tabName) => {
                // If it's a placeholder '...', fetch it
                if (counts[key] === '...') {
                    try {
                        const res = await fetchFn();
                        const count = res.total || (Array.isArray(res.data) ? res.data.length : (Array.isArray(res) ? res.length : 0));
                        updateCount(tabName, count);
                    } catch (err) {
                        updateCount(tabName, 0);
                    }
                }
            };

            await checkAndUpdate('totalStudents', () => api.getStudentList('', '', { srch_type: 'search_full', search: '' }), 'details');
            await checkAndUpdate('disabledStudents', () => api.searchDisabledStudents(''), 'disabled');
            await checkAndUpdate('onlineAdmissions', () => api.getOnlineStudentList(), 'online');
            await checkAndUpdate('bulkCount', () => api.getStudentList('', '', { srch_type: 'search_full', search: '' }), 'bulk');
            await checkAndUpdate('disableReasons', () => api.getDisableReasonsList(), 'reason');
        };

        fetchCounts();
    }, [counts, updateCount]);

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)', backgroundColor: '#f8fafc' }}>
                <section className="sis-header-section">
                    <div className="sis-header-content">
                        <div className="sis-titles">
                            <h1>Students Information</h1>
                            <p>Manage All student records & related information</p>
                        </div>
                        <div className="sis-actions">
                            <Link to="/student/create" className="btn btn-primary btn-add-student">
                                <i className="fa fa-user-plus"></i> Add Student
                            </Link>
                        </div>
                    </div>

                    <div className="sis-summary-cards">
                        {/* 1. Student Details */}
                        <Link to="/student/search" className={`sis-card ${activeTab === 'details' ? 'active' : ''}`}>
                            <div className="sis-card-header">
                                <span className="sis-card-title">Student Details</span>
                                <i className="fa fa-graduation-cap sis-card-icon"></i>
                            </div>
                            <div className="sis-card-value">{counts.totalStudents}</div>
                            <div className="sis-card-subtitle">Total students</div>
                        </Link>

                        {/* 2. Online Admission */}
                        <Link to="/admin/onlinestudent" className={`sis-card ${activeTab === 'online' ? 'active' : ''}`}>
                            <div className="sis-card-header">
                                <span className="sis-card-title">Online Admission</span>
                                <i className="fa fa-globe sis-card-icon"></i>
                            </div>
                            <div className="sis-card-value">{counts.onlineAdmissions}</div>
                            <div className="sis-card-subtitle">total online admissions</div>
                        </Link>

                        {/* 3. Disabled Students */}
                        <Link to="/student/disabled" className={`sis-card ${activeTab === 'disabled' ? 'active' : ''}`}>
                            <div className="sis-card-header">
                                <span className="sis-card-title">Disabled Students</span>
                                <i className="fa fa-user-times sis-card-icon"></i>
                            </div>
                            <div className="sis-card-value">{counts.disabledStudents}</div>
                            <div className="sis-card-subtitle">total disabled students</div>
                        </Link>

                        {/* 4. Disable Reason */}
                        <Link to="/admin/disable-reason" className={`sis-card ${activeTab === 'reason' ? 'active' : ''}`}>
                            <div className="sis-card-header">
                                <span className="sis-card-title">Disable Reason</span>
                                <i className="fa fa-list-alt sis-card-icon"></i>
                            </div>
                            <div className="sis-card-value">{counts.disableReasons}</div>
                            <div className="sis-card-subtitle">total disabled reasons</div>
                        </Link>

                        {/* 5. Bulk Delete */}
                        <Link to="/student/bulkdelete" className={`sis-card ${activeTab === 'bulk' ? 'active' : ''}`}>
                            <div className="sis-card-header">
                                <span className="sis-card-title">Bulk Delete</span>
                                <i className="fa fa-trash sis-card-icon"></i>
                            </div>
                            <div className="sis-card-value">{counts.bulkCount}</div>
                            <div className="sis-card-subtitle">total records available</div>
                        </Link>
                    </div>
                </section>

                <section className="content">
                    {children}
                </section>
            </div>
        </div>
    );
};

export default SISLayout;
