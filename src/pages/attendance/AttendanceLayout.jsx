import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useAttendanceCounts } from '../../context/AttendanceCountContext';
import './AttendanceLayout.css';

import { api } from '../../services/api';

const AttendanceLayout = ({ children, activeTab }) => {
    const { counts, updateCount } = useAttendanceCounts();

    React.useEffect(() => {
        const fetchAllCounts = async () => {
            try {
                // 1. Student Attendance Count (Total Students)
                const resDash = await api.getDashboardData();
                if (resDash && resDash.data && resDash.data.total_students) {
                    updateCount('studentAttendance', resDash.data.total_students);
                }

                // 2. Attendance By Date (Daily Attendance Count - today)
                const resDate = await api.getDailyAttendanceReport();
                if (resDate && resDate.all_present !== undefined) {
                    updateCount('attendanceByDate', resDate.all_present);
                }

                // 3. Approve Leave Count
                const resLeave = await api.getApproveLeaveList();
                if (resLeave && resLeave.results) {
                    updateCount('approveLeave', resLeave.results.length);
                }

                // 4. Late Entries Count
                const resLate = await api.getLateEntriesReport();
                if (resLate) {
                    const lateData = Array.isArray(resLate) ? resLate : (resLate.data || []);
                    updateCount('lateEntries', lateData.length);
                }
            } catch (error) {
                console.error('Error fetching attendance counts:', error);
            }
        };
        fetchAllCounts();
    }, [updateCount]);

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)', backgroundColor: '#f8fafc' }}>
                <section className="attendance-header-section">
                    <div className="attendance-header-content">
                        <div className="attendance-titles">
                            <h1>Attendance</h1>
                            <p>Track student attendance, manage leaves and late entries</p>
                        </div>
                    </div>

                    <div className="attendance-summary-cards">
                        {/* 1. Student Attendance */}
                        <Link to="/student-attendance" className={`attendance-card ${activeTab === 'student' ? 'active' : ''}`}>
                            <div className="attendance-card-header">
                                <span className="attendance-card-title">Student Attendance</span>
                                <i className="fa fa-calendar-check-o attendance-card-icon" style={{ color: activeTab === 'student' ? '#3b82f6' : '#94a3b8' }}></i>
                            </div>
                            <div className="attendance-card-value">{counts.studentAttendance}</div>
                            <div className="attendance-card-subtitle">Total records</div>
                        </Link>

                        {/* 2. Attendance By Date */}
                        <Link to="/attendance-by-date" className={`attendance-card ${activeTab === 'date' ? 'active' : ''}`}>
                            <div className="attendance-card-header">
                                <span className="attendance-card-title">Attendance By Date</span>
                                <i className="fa fa-calendar attendance-card-icon" style={{ color: activeTab === 'date' ? '#10b981' : '#94a3b8' }}></i>
                            </div>
                            <div className="attendance-card-value">{counts.attendanceByDate}</div>
                            <div className="attendance-card-subtitle">Today's attendance count</div>
                        </Link>

                        {/* 3. Approve Leave */}
                        <Link to="/approve_leave" className={`attendance-card ${activeTab === 'approve' ? 'active' : ''}`}>
                            <div className="attendance-card-header">
                                <span className="attendance-card-title">Approve Leave</span>
                                <i className="fa fa-check-square-o attendance-card-icon" style={{ color: activeTab === 'approve' ? '#f59e0b' : '#94a3b8' }}></i>
                            </div>
                            <div className="attendance-card-value">{counts.approveLeave}</div>
                            <div className="attendance-card-subtitle">Leave requests</div>
                        </Link>

                        {/* 4. Late Entries */}
                        <Link to="/late-entries" className={`attendance-card ${activeTab === 'late' ? 'active' : ''}`}>
                            <div className="attendance-card-header">
                                <span className="attendance-card-title">Late Entries</span>
                                <i className="fa fa-clock-o attendance-card-icon" style={{ color: activeTab === 'late' ? '#ef4444' : '#94a3b8' }}></i>
                            </div>
                            <div className="attendance-card-value">{counts.lateEntries}</div>
                            <div className="attendance-card-subtitle">Total late entries</div>
                        </Link>
                    </div>
                </section>

                <section className="content">
                    {children}
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default AttendanceLayout;
