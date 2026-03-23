import React, { useState, useEffect } from 'react';
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
                                    <td key={di} className={`au-cal-cell ${isToday ? 'today' : ''}`}>
                                        <div className="cal-day-num au-day-num">
                                            <span className={`au-day-text ${cell.currentMonth ? '' : 'other-month'} ${isToday ? 'today' : ''}`}
                                                style={isToday ? { color: highlightColor } : {}}>
                                                {cell.day}
                                            </span>
                                        </div>
                                        <div className="au-event-list">
                                            {dayEvents.map((evt, idx) => (
                                                <div key={idx}
                                                    title={evt.title || evt.event_type}
                                                    className="au-event-item"
                                                    style={{ backgroundColor: evt.backgroundColor || '#9854cb' }}>
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
        <>
            <style>{`
                .content-wrapper {
                    padding: 59px 0px 10px 5px !important;
                }

                .cal-toolbar {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                    padding: 15px 10px;
                }
                .cal-nav-btns {
                    position: absolute;
                    left: 10px;
                    display: flex;
                    gap: 5px;
                }
                .cal-nav-btns .btn {
                    padding: 5px 10px;
                    background: #fff;
                    border: 1px solid #ddd;
                    font-size: 13px;
                }
                .cal-nav-btns .btn:hover {
                    background: #f4f4f4;
                }
                .cal-title {
                    margin: 0;
                    text-align: center;
                    font-weight: 400;
                    font-size: 20px;
                    color: #333;
                }

                @media (max-width: 767px) {
                    .cal-toolbar {
                        flex-direction: column;
                        gap: 15px;
                        padding: 15px 0;
                    }
                    .cal-nav-btns {
                        position: static;
                        justify-content: center;
                        width: 100%;
                        order: 2;
                    }
                    .cal-title {
                        width: 100%;
                        order: 1;
                    }
                    .content{
                        padding:8px 8px 10px 2px !important;
                    }
                }
                .mobile-box-back-btn {
                    display: flex !important;
                    align-items: center;
                    gap: 5px;
                    background-color: #9c68e4 !important;
                    color: #fff !important;
                    border: none;
                    padding: 6px 15px;
                    margin-top: -3px !important;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 600;
                    text-decoration: none !important;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    cursor: pointer;
                }

                /* Refactored Internal Classes */
                .au-cal-cell { position: relative; min-height: 150px; height: 150px; vertical-align: top; padding: 5px; cursor: default; background-color: #fff; }
                .au-cal-cell.today { background-color: #faf6ff; }
                .au-day-num { text-align: center; margin-bottom: 8px; }
                .au-day-text { color: #333; }
                .au-day-text.other-month { color: #ccc; }
                .au-day-text.today { font-weight: 700; font-size: 15px; }
                .au-event-list { display: flex; flex-direction: column; gap: 3px; }
                .au-event-item { color: #fff; font-size: 11px; padding: 5px 4px; border-radius: 3px; text-align: center; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .au-stats-row { margin-bottom: 20px; }
                .au-stat-col { margin-bottom: 10px; }
                .au-stat-card { color: #fff; border-radius: 8px; padding: 15px; text-align: center; }
                .au-stat-bg-present { background: #4CAF50; }
                .au-stat-bg-absent { background: #f44336; }
                .au-stat-bg-late { background: #FF9800; }
                .au-stat-bg-halfday { background: #2196F3; }
                .au-stat-bg-holiday { background: #9C27B0; }
                .au-stat-bg-total { background: #607D8B; }
                .au-stat-val { font-size: 28px; font-weight: 700; }
                .au-stat-lbl { font-size: 12px; opacity: 0.9; }
                .au-wrapper { min-height: 828px; }
                .au-box { box-shadow: 0 0 10px rgba(0,0,0,0.1); border: none; position: relative; }
                .au-box-header { padding: 10px 15px; border-bottom: 1px solid #f4f4f4; display: flex; align-items: center; }
                .au-box-title { margin: 0; font-size: 18px; font-weight: 400; color: #333; flex: 1; }
                .au-box-body { padding: 0px 10px 10px 10px; }
                .au-loading-wrap { text-align: center; padding: 60px 20px; }
                .au-loading-icon { font-size: 32px; color: #9854cb; }
                .au-loading-text { margin-top: 15px; color: #999; }
                .au-error-wrap { text-align: center; padding: 40px 20px; color: #f44336; }
                .au-error-icon { font-size: 32px; margin-bottom: 10px; display: block; }
                .au-btn-retry { margin-top: 10px; }
            `}</style>
            <div className="content-wrapper au-wrapper">
                <section className="content-header">
                    <h1><i className="fa fa-calendar-check-o"></i> {attendanceData?.title || 'Attendance'}</h1>
                </section>

                <section className="content">
                    {/* Summary Stats Cards */}
                    {resultList.length > 0 && (
                        <div className="row au-stats-row">
                            <div className="col-md-2 col-sm-4 col-xs-6 au-stat-col">
                                <div className="au-stat-card au-stat-bg-present">
                                    <div className="au-stat-val">{stats.present}</div>
                                    <div className="au-stat-lbl">Present</div>
                                </div>
                            </div>
                            <div className="col-md-2 col-sm-4 col-xs-6 au-stat-col">
                                <div className="au-stat-card au-stat-bg-absent">
                                    <div className="au-stat-val">{stats.absent}</div>
                                    <div className="au-stat-lbl">Absent</div>
                                </div>
                            </div>
                            <div className="col-md-2 col-sm-4 col-xs-6 au-stat-col">
                                <div className="au-stat-card au-stat-bg-late">
                                    <div className="au-stat-val">{stats.late}</div>
                                    <div className="au-stat-lbl">Late</div>
                                </div>
                            </div>
                            <div className="col-md-2 col-sm-4 col-xs-6 au-stat-col">
                                <div className="au-stat-card au-stat-bg-halfday">
                                    <div className="au-stat-val">{stats.halfDay}</div>
                                    <div className="au-stat-lbl">Half Day</div>
                                </div>
                            </div>
                            <div className="col-md-2 col-sm-4 col-xs-6 au-stat-col">
                                <div className="au-stat-card au-stat-bg-holiday">
                                    <div className="au-stat-val">{stats.holiday}</div>
                                    <div className="au-stat-lbl">Holiday</div>
                                </div>
                            </div>
                            <div className="col-md-2 col-sm-4 col-xs-6 au-stat-col">
                                <div className="au-stat-card au-stat-bg-total">
                                    <div className="au-stat-val">{stats.total}</div>
                                    <div className="au-stat-lbl">Total Days</div>
                                </div>
                            </div>
                        </div>
                    )}



                    <div className="row">
                        <div className="col-md-12 col-sm-12">
                            <div className="box box-primary au-box">
                                <div className="au-box-header">
                                    <h3 className="au-box-title">Attendance</h3>
                                    <button className="mobile-box-back-btn" onClick={() => window.location.href='/user/dashboard'}>
                                        <i className="fa fa-arrow-left"></i> Back
                                    </button>
                                </div>
                                <div className="box-body au-box-body">
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
                                    </div>

                                    {/* Loading State */}
                                    {loading && (
                                        <div className="au-loading-wrap">
                                            <i className="fa fa-spinner fa-spin au-loading-icon"></i>
                                            <p className="au-loading-text">Loading attendance data...</p>
                                        </div>
                                    )}

                                    {/* Error State */}
                                    {!loading && error && (
                                        <div className="au-error-wrap">
                                            <i className="fa fa-exclamation-triangle au-error-icon"></i>
                                            <p>{error}</p>
                                            <button className="btn btn-sm btn-primary au-btn-retry" onClick={fetchAttendance}>
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
        </>
    );
};

export default AttendanceUser;
