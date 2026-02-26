import React, { useState, useEffect } from 'react';
import Header from './user_components/Header_user';
import Sidebar from './user_components/Sidebar_user';
import Footer from '../../components/Footer';
import { api_users } from '../../services/api_users';

const MONTH_LABELS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const DOW_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const AttendanceUser = () => {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());

    // Data from API
    const [attendanceData, setAttendanceData] = useState(null);
    const [attendanceType, setAttendanceType] = useState('0');
    const [attendanceView, setAttendanceView] = useState('daily');
    const [resultList, setResultList] = useState([]);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => { fetchAttendance(); }, []);

    useEffect(() => {
        fetchAttendanceEvents(year, month);
    }, [year, month]);

    const fetchAttendanceEvents = async (y, m) => {
        try {
            const startStr = `${y}-${String(m + 1).padStart(2, '0')}-01`;
            const endStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(getDaysInMonth(y, m)).padStart(2, '0')}`;
            const response = await api_users.getAttendance(startStr, endStr);
            if (response.status && response.data) {
                setCalendarEvents(response.data);
            }
        } catch (err) {
            console.error('Events fetch error:', err);
        }
    };

    const fetchAttendance = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api_users.getUserAttendance();
            console.log('Attendance data:', response);
            if (response.status && response.data) {
                setAttendanceData(response.data);
                setAttendanceType(response.data.attendance_type || '0');
                setAttendanceView(response.data.attendance_view || 'daily');
                setResultList(response.data.resultList || []);
            }
        } catch (err) {
            console.error('Attendance fetch error:', err);
            setError(err.message || 'Failed to fetch attendance data');
        } finally {
            setLoading(false);
        }
    };

    // ========== Date Helpers ==========
    const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfWeek = (y, m) => {
        let dow = new Date(y, m, 1).getDay();
        return dow === 0 ? 6 : dow - 1;
    };
    const dateToString = (d) => {
        const yr = d.getFullYear();
        const mn = String(d.getMonth() + 1).padStart(2, '0');
        const dy = String(d.getDate()).padStart(2, '0');
        return `${yr}-${mn}-${dy}`;
    };

    // Find attendance record for a given date
    const getAttendanceForDate = (dateStr) => {
        return resultList.find(item => {
            const itemDate = item.date || item.attendance_date;
            return itemDate === dateStr;
        });
    };

    // Get attendance status color
    const getAttendanceColor = (record) => {
        if (!record) return null;
        const status = (record.status || record.attendence_type || record.type || '').toString().toLowerCase();
        if (status === 'present' || status === '1' || status === 'p') return '#4CAF50'; // Green
        if (status === 'absent' || status === '0' || status === 'a') return '#f44336'; // Red
        if (status === 'late' || status === '2' || status === 'l') return '#FF9800'; // Orange
        if (status === 'half day' || status === 'halfday' || status === '3' || status === 'h') return '#2196F3'; // Blue
        if (status === 'holiday' || status === '4') return '#9C27B0'; // Purple
        return '#9e9e9e'; // Grey for unknown
    };

    // Get attendance status label
    const getAttendanceLabel = (record) => {
        if (!record) return '';
        const status = (record.status || record.attendence_type || record.type || '').toString().toLowerCase();
        if (status === 'present' || status === '1' || status === 'p') return 'Present';
        if (status === 'absent' || status === '0' || status === 'a') return 'Absent';
        if (status === 'late' || status === '2' || status === 'l') return 'Late';
        if (status === 'half day' || status === 'halfday' || status === '3' || status === 'h') return 'Half Day';
        if (status === 'holiday' || status === '4') return 'Holiday';
        return record.status || record.attendence_type || '';
    };

    // ========== Navigation ==========
    const handlePrev = () => {
        if (month === 0) { setYear(year - 1); setMonth(11); }
        else { setMonth(month - 1); }
    };

    const handleNext = () => {
        if (month === 11) { setYear(year + 1); setMonth(0); }
        else { setMonth(month + 1); }
    };

    const handleToday = () => {
        const today = new Date();
        setYear(today.getFullYear());
        setMonth(today.getMonth());
    };

    // ========== Build Month Grid ==========
    const buildMonthGrid = () => {
        const daysInMonth = getDaysInMonth(year, month);
        const firstDow = getFirstDayOfWeek(year, month);
        const weeks = [];
        let currentDay = 1;
        const totalCells = firstDow + daysInMonth;
        const totalWeeks = Math.ceil(totalCells / 7);

        for (let w = 0; w < totalWeeks; w++) {
            const week = [];
            for (let d = 0; d < 7; d++) {
                const cellIndex = w * 7 + d;
                if (cellIndex < firstDow || currentDay > daysInMonth) {
                    if (cellIndex < firstDow) {
                        const prevDays = getDaysInMonth(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1);
                        week.push({ day: prevDays - (firstDow - cellIndex - 1), currentMonth: false });
                    } else {
                        week.push({ day: currentDay - daysInMonth, currentMonth: false });
                        currentDay++;
                    }
                } else {
                    week.push({ day: currentDay, currentMonth: true });
                    currentDay++;
                }
            }
            weeks.push(week);
        }
        return weeks;
    };

    // ========== Compute Stats ==========
    const computeStats = () => {
        let present = 0, absent = 0, late = 0, halfDay = 0, holiday = 0, total = 0;
        resultList.forEach(record => {
            const status = (record.status || record.attendence_type || record.type || '').toString().toLowerCase();
            total++;
            if (status === 'present' || status === '1' || status === 'p') present++;
            else if (status === 'absent' || status === '0' || status === 'a') absent++;
            else if (status === 'late' || status === '2' || status === 'l') late++;
            else if (status === 'half day' || status === 'halfday' || status === '3' || status === 'h') halfDay++;
            else if (status === 'holiday' || status === '4') holiday++;
        });
        return { present, absent, late, halfDay, holiday, total };
    };

    // ========== RENDER: Month Calendar ==========
    const renderMonthView = () => {
        const weeks = buildMonthGrid();
        return (
            <table className="cal-month-table">
                <thead>
                    <tr>
                        {DOW_LABELS.map((label, i) => (
                            <th key={i}>{label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {weeks.map((week, wi) => (
                        <tr key={wi}>
                            {week.map((cell, di) => {
                                const isToday = cell.currentMonth && new Date(year, month, cell.day).toDateString() === new Date().toDateString();
                                const dateStr = cell.currentMonth ? dateToString(new Date(year, month, cell.day)) : '';

                                const dayEvents = cell.currentMonth ? calendarEvents.filter(e => {
                                    const evtStart = e.start ? e.start.split(' ')[0] : '';
                                    const evtEnd = e.end ? e.end.split(' ')[0] : evtStart;
                                    return dateStr >= evtStart && dateStr <= evtEnd;
                                }) : [];

                                // Fallback for color if no events, but we still want to show today's highlight
                                const defaultTodayColor = '#8E44D3';
                                const highlightColor = dayEvents.length > 0 ? (dayEvents[0].backgroundColor || defaultTodayColor) : defaultTodayColor;

                                return (
                                    <td key={di} style={{
                                        backgroundColor: isToday ? '#faf6ff' : '#fff',
                                        cursor: cell.currentMonth ? 'default' : 'default',
                                        position: 'relative',
                                        minHeight: '120px',
                                        height: '120px',
                                        verticalAlign: 'top',
                                        padding: '5px'
                                    }}>
                                        <div className="cal-day-num" style={{ textAlign: 'center', marginBottom: '5px' }}>
                                            <span className={cell.currentMonth ? '' : 'other-month'}
                                                style={isToday
                                                    ? { color: highlightColor, fontWeight: 700, fontSize: '15px' }
                                                    : cell.currentMonth ? { color: '#333' } : { color: '#ccc' }}>
                                                {cell.day}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            {dayEvents.map((evt, idx) => (
                                                <div key={idx} style={{
                                                    backgroundColor: evt.backgroundColor || '#9854cb',
                                                    color: '#fff',
                                                    fontSize: '10px',
                                                    padding: '2px 4px',
                                                    borderRadius: '3px',
                                                    textAlign: 'center',
                                                    fontWeight: 600,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}>
                                                    {evt.title || evt.event_type}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };



    const stats = computeStats();

    return (
        <div className="wrapper theme-white-skin">
            <style>{`
                /* REVERTING SIDEBAR TO THE GOOD PREVIOUS STATE */
                .content-wrapper, .main-footer {
                    margin-left: 80px !important;
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
            `}</style>
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '828px' }}>
                <section className="content-header">
                    <h1><i className="fa fa-calendar-check-o"></i> {attendanceData?.title || 'Attendance'}</h1>
                </section>

                <section className="content">
                    {/* Summary Stats Cards */}
                    {resultList.length > 0 && (
                        <div className="row" style={{ marginBottom: '20px' }}>
                            <div className="col-md-2 col-sm-4 col-xs-6" style={{ marginBottom: '10px' }}>
                                <div style={{
                                    background: '#4CAF50', color: '#fff', borderRadius: '8px',
                                    padding: '15px', textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '28px', fontWeight: 700 }}>{stats.present}</div>
                                    <div style={{ fontSize: '12px', opacity: 0.9 }}>Present</div>
                                </div>
                            </div>
                            <div className="col-md-2 col-sm-4 col-xs-6" style={{ marginBottom: '10px' }}>
                                <div style={{
                                    background: '#f44336', color: '#fff', borderRadius: '8px',
                                    padding: '15px', textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '28px', fontWeight: 700 }}>{stats.absent}</div>
                                    <div style={{ fontSize: '12px', opacity: 0.9 }}>Absent</div>
                                </div>
                            </div>
                            <div className="col-md-2 col-sm-4 col-xs-6" style={{ marginBottom: '10px' }}>
                                <div style={{
                                    background: '#FF9800', color: '#fff', borderRadius: '8px',
                                    padding: '15px', textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '28px', fontWeight: 700 }}>{stats.late}</div>
                                    <div style={{ fontSize: '12px', opacity: 0.9 }}>Late</div>
                                </div>
                            </div>
                            <div className="col-md-2 col-sm-4 col-xs-6" style={{ marginBottom: '10px' }}>
                                <div style={{
                                    background: '#2196F3', color: '#fff', borderRadius: '8px',
                                    padding: '15px', textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '28px', fontWeight: 700 }}>{stats.halfDay}</div>
                                    <div style={{ fontSize: '12px', opacity: 0.9 }}>Half Day</div>
                                </div>
                            </div>
                            <div className="col-md-2 col-sm-4 col-xs-6" style={{ marginBottom: '10px' }}>
                                <div style={{
                                    background: '#9C27B0', color: '#fff', borderRadius: '8px',
                                    padding: '15px', textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '28px', fontWeight: 700 }}>{stats.holiday}</div>
                                    <div style={{ fontSize: '12px', opacity: 0.9 }}>Holiday</div>
                                </div>
                            </div>
                            <div className="col-md-2 col-sm-4 col-xs-6" style={{ marginBottom: '10px' }}>
                                <div style={{
                                    background: '#607D8B', color: '#fff', borderRadius: '8px',
                                    padding: '15px', textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '28px', fontWeight: 700 }}>{stats.total}</div>
                                    <div style={{ fontSize: '12px', opacity: 0.9 }}>Total Days</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Legend */}
                    <div className="row" style={{ marginBottom: '15px' }}>
                        <div className="col-md-12">
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', fontSize: '12px' }}>
                                <span><span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#4CAF50', marginRight: '5px' }}></span> Present</span>
                                <span><span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#f44336', marginRight: '5px' }}></span> Absent</span>
                                <span><span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#FF9800', marginRight: '5px' }}></span> Late</span>
                                <span><span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#2196F3', marginRight: '5px' }}></span> Half Day</span>
                                <span><span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#9C27B0', marginRight: '5px' }}></span> Holiday</span>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-12 col-sm-12">
                            <div className="box box-primary">
                                <div className="box-body" style={{ padding: 0 }}>
                                    {/* Toolbar */}
                                    <div className="cal-toolbar">
                                        <div className="cal-nav-btns">
                                            <button className="btn btn-sm" onClick={handlePrev}>
                                                <i className="fa fa-chevron-left"></i>
                                            </button>
                                            <button className="btn btn-sm" onClick={handleNext}>
                                                <i className="fa fa-chevron-right"></i>
                                            </button>
                                            <button className="btn btn-sm" onClick={handleToday}>Today</button>
                                        </div>
                                        <h3 className="cal-title">
                                            {`${MONTH_LABELS[month]} ${year}`}
                                        </h3>
                                        <div className="cal-view-btns btn-group">
                                            <button className={`btn btn-sm ${attendanceView === 'daily' || attendanceView === 'month' ? '' : ''} active`}
                                                style={{ cursor: 'default' }}>
                                                <i className="fa fa-calendar"></i> Calendar View
                                            </button>
                                        </div>
                                    </div>

                                    {/* Loading State */}
                                    {loading && (
                                        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                                            <i className="fa fa-spinner fa-spin" style={{ fontSize: '32px', color: '#9854cb' }}></i>
                                            <p style={{ marginTop: '15px', color: '#999' }}>Loading attendance data...</p>
                                        </div>
                                    )}

                                    {/* Error State */}
                                    {!loading && error && (
                                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#f44336' }}>
                                            <i className="fa fa-exclamation-triangle" style={{ fontSize: '32px', marginBottom: '10px', display: 'block' }}></i>
                                            <p>{error}</p>
                                            <button className="btn btn-sm btn-primary" onClick={fetchAttendance} style={{ marginTop: '10px' }}>
                                                <i className="fa fa-refresh"></i> Retry
                                            </button>
                                        </div>
                                    )}

                                    {/* Calendar View */}
                                    {!loading && !error && renderMonthView()}
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

export default AttendanceUser;
