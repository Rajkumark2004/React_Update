import React, { useState } from 'react';
import '../backend/calender/zabuto_calendar.css';

const MONTH_LABELS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const DOW_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const ZabutoCalendar = ({ events = [], onDateClick, today = true, cellBorder = false }) => {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth()); // 0-indexed

    const isToday = (y, m, d) => {
        const todayObj = new Date();
        const dateObj = new Date(y, m, d);
        return dateObj.toDateString() === todayObj.toDateString();
    };

    const dateAsString = (y, m, d) => {
        const dd = d < 10 ? '0' + d : d;
        const mm = m + 1 < 10 ? '0' + (m + 1) : m + 1;
        return `${y}-${mm}-${dd}`;
    };

    const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();

    const getFirstDayOfWeek = (y, m) => {
        let dow = new Date(y, m, 1).getDay();
        // Convert Sun=0 to Mon-based (Mon=0, Sun=6)
        return dow === 0 ? 6 : dow - 1;
    };

    const hasEvent = (dateStr) => {
        return events.find(e => e.date === dateStr);
    };

    const handlePrev = () => {
        if (month === 0) {
            setYear(year - 1);
            setMonth(11);
        } else {
            setMonth(month - 1);
        }
    };

    const handleNext = () => {
        if (month === 11) {
            setYear(year + 1);
            setMonth(0);
        } else {
            setMonth(month + 1);
        }
    };

    const handleDayClick = (dateStr, event) => {
        if (onDateClick) {
            onDateClick({ date: dateStr, hasEvent: !!event, event });
        }
    };

    // Build weeks
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
                week.push(null);
            } else {
                week.push(currentDay);
                currentDay++;
            }
        }
        weeks.push(week);
    }

    const tableClass = `table${cellBorder ? ' table-bordered' : ''}`;

    return (
        <div className="zabuto_calendar">
            <table className={tableClass}>
                {/* Month Header */}
                <thead>
                    <tr className="calendar-month-header">
                        <th>
                            <div className="calendar-month-navigation" onClick={handlePrev} style={{ cursor: 'pointer' }}>
                                <span><i className="fa fa-chevron-left"></i></span>
                            </div>
                        </th>
                        <th colSpan="5">
                            <span style={{ cursor: 'pointer' }}>
                                {MONTH_LABELS[month]} {year}
                            </span>
                        </th>
                        <th>
                            <div className="calendar-month-navigation" onClick={handleNext} style={{ cursor: 'pointer' }}>
                                <span><i className="fa fa-chevron-right"></i></span>
                            </div>
                        </th>
                    </tr>
                    {/* Day of Week Header */}
                    <tr className="calendar-dow-header">
                        {DOW_LABELS.map((label, i) => (
                            <th key={i}>{label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {weeks.map((week, wi) => (
                        <tr className="calendar-dow" key={wi}>
                            {week.map((day, di) => {
                                if (day === null) {
                                    return <td key={di}></td>;
                                }
                                const dateStr = dateAsString(year, month, day);
                                const event = hasEvent(dateStr);
                                const isTodayDate = today && isToday(year, month, day);
                                const tdClassName = event
                                    ? (event.classname ? 'event-styled' : 'event')
                                    : '';
                                const clickable = onDateClick ? ' dow-clickable' : '';

                                return (
                                    <td
                                        key={di}
                                        className={`${tdClassName}${clickable}`}
                                        title={event?.title || ''}
                                        onClick={() => handleDayClick(dateStr, event)}
                                    >
                                        <div className={`day${event?.classname ? ' ' + event.classname : ''}`}>
                                            {isTodayDate ? (
                                                <span className="badge badge-today">{day}</span>
                                            ) : event?.badge ? (
                                                <span className={`badge badge-event${typeof event.badge === 'string' ? ' badge-' + event.badge : ''}`}>{day}</span>
                                            ) : (
                                                day
                                            )}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ZabutoCalendar;
