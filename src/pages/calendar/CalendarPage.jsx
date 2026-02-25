import React, { useState, useEffect, useRef } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import '../../backend/calender/zabuto_calendar.css';
import './CalendarPage.css';

const MONTH_LABELS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const DOW_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DOW_LABELS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_EVENT_COLORS = [
    '#03a9f4', '#c53da9', '#757575', '#8e24aa',
    '#d81b60', '#7cb342', '#fb8c00', '#fb3b3b'
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);

// Defined outside CalendarPage to prevent re-creation on every render (fixes input focus loss)
const ModalBackdrop = ({ show, onClose, children }) => {
    if (!show) return null;
    return (
        <>
            <div className="modal-backdrop fade in" onClick={onClose} style={{ zIndex: 1040 }}></div>
            <div className="modal fade in" role="dialog" style={{ display: 'block', zIndex: 1050 }} onClick={onClose}>
                <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-content">{children}</div>
                </div>
            </div>
        </>
    );
};

const ColorPicker = ({ colors, selectedColor, onSelect }) => (
    <div className="cpicker-wrapper" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {colors.map((color) => (
            <div key={color} onClick={() => onSelect(color)} style={{
                background: color, border: `2px solid ${color}`, borderRadius: '100px',
                width: selectedColor === color ? '28px' : '20px', height: selectedColor === color ? '28px' : '20px',
                cursor: 'pointer', display: 'inline-block', transition: 'all 0.15s ease'
            }} />
        ))}
    </div>
);

const CalendarPage = () => {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());
    const [view, setView] = useState('month');
    const [selectedDate, setSelectedDate] = useState(new Date(now.getFullYear(), now.getMonth(), now.getDate()));

    // Data
    const [events, setEvents] = useState([]);
    const [todos, setTodos] = useState([]);
    const [eventColors, setEventColors] = useState(DEFAULT_EVENT_COLORS);
    const [_loading, setLoading] = useState(true);

    // Add Event Modal
    const [showAddEvent, setShowAddEvent] = useState(false);
    const [eventForm, setEventForm] = useState({
        title: '', description: '', event_from: '', event_to: '',
        eventcolor: DEFAULT_EVENT_COLORS[0], event_type: 'private'
    });

    // View/Edit Event Modal
    const [showViewEvent, setShowViewEvent] = useState(false);
    const [editEventForm, setEditEventForm] = useState({
        eventid: '', title: '', description: '', event_from: '', event_to: '',
        eventcolor: DEFAULT_EVENT_COLORS[0], eventtype: 'private'
    });

    // Add Task Modal
    const [showAddTask, setShowAddTask] = useState(false);
    const [taskForm, setTaskForm] = useState({ task_title: '', task_date: '', eventid: '' });
    const [taskModalTitle, setTaskModalTitle] = useState('Add Task');

    // Drag-to-select time range
    const [dragInfo, setDragInfo] = useState({ isDragging: false, dateStr: '', startHour: null, endHour: null });
    const dragRef = useRef(dragInfo);
    dragRef.current = dragInfo;

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Get user id and role_id from localStorage
            let userId = '1';
            let roleId = '7';
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    userId = user.id || '1';
                    const roles = user.roles || {};
                    roleId = Object.values(roles)[0] || '7';
                }
            } catch (e) {
                console.error('Failed to parse user data:', e);
            }

            // Call both APIs in parallel
            const [calendarRes, barEventsRes] = await Promise.allSettled([
                api.getCalendarEvents(userId, roleId),
                api.getCalendarBarEvents(userId, roleId)
            ]);

            // Extract event_colors and to-do tasks from GET /calendar/events
            let todoList = [];
            if (calendarRes.status === 'fulfilled') {
                const res = calendarRes.value;
                if (res && Array.isArray(res.event_colors) && res.event_colors.length > 0) {
                    setEventColors(res.event_colors);
                }
                const allItems = Array.isArray(res.data) ? res.data : [];
                todoList = allItems.filter(item => item.event_type === 'task');
                setTodos(todoList);
            }

            // Extract calendar bar events from POST /calendar/getevents
            let barEvents = [];
            if (barEventsRes.status === 'fulfilled') {
                const barData = barEventsRes.value;
                barEvents = Array.isArray(barData) ? barData : [];
            }

            // Normalize todos to match bar event format and merge for calendar display
            const normalizedTodos = todoList.map(t => ({
                id: t.id,
                title: t.event_title || t.title || '',
                start: t.start_date || '',
                end: t.end_date || t.start_date || '',
                description: t.event_description || '',
                backgroundColor: t.event_color || '#000',
                borderColor: t.event_color || '#000',
                event_type: 'task'
            }));
            setEvents([...barEvents, ...normalizedTodos]);
        } catch (err) {
            console.error('Calendar fetch error:', err);
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
    const isTodayDate = (dateObj) => dateObj.toDateString() === new Date().toDateString();
    const dateToString = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    const getEventsForDate = (dateStr) => {
        return events.filter(e => {
            const start = e.start_date || e.start || e.date;
            const end = e.end_date || e.end;
            if (!start) return false;
            const startDate = start.split(' ')[0];
            const endDate = end ? end.split(' ')[0] : startDate;
            return dateStr >= startDate && dateStr <= endDate;
        });
    };

    // Get the Monday of the week containing selectedDate
    const getWeekStart = (date) => {
        const d = new Date(date);
        const dow = d.getDay();
        const diff = dow === 0 ? -6 : 1 - dow; // Monday
        d.setDate(d.getDate() + diff);
        return d;
    };

    const getWeekDays = () => {
        const monday = getWeekStart(selectedDate);
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            return d;
        });
    };

    // ========== Navigation ==========
    const handlePrev = () => {
        if (view === 'month') {
            if (month === 0) { setYear(year - 1); setMonth(11); }
            else { setMonth(month - 1); }
        } else if (view === 'week') {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() - 7);
            setSelectedDate(newDate);
            setYear(newDate.getFullYear());
            setMonth(newDate.getMonth());
        } else {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() - 1);
            setSelectedDate(newDate);
            setYear(newDate.getFullYear());
            setMonth(newDate.getMonth());
        }
    };

    const handleNext = () => {
        if (view === 'month') {
            if (month === 11) { setYear(year + 1); setMonth(0); }
            else { setMonth(month + 1); }
        } else if (view === 'week') {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() + 7);
            setSelectedDate(newDate);
            setYear(newDate.getFullYear());
            setMonth(newDate.getMonth());
        } else {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() + 1);
            setSelectedDate(newDate);
            setYear(newDate.getFullYear());
            setMonth(newDate.getMonth());
        }
    };

    const handleToday = () => {
        const today = new Date();
        setYear(today.getFullYear());
        setMonth(today.getMonth());
        setSelectedDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
    };

    // ========== Title ==========
    const getTitle = () => {
        if (view === 'month') {
            return `${MONTH_LABELS[month]} ${year}`;
        } else if (view === 'week') {
            const weekDays = getWeekDays();
            const first = weekDays[0];
            const last = weekDays[6];
            const formatShort = (d) => `${MONTH_LABELS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
            if (first.getFullYear() !== last.getFullYear()) {
                return `${formatShort(first)}, ${first.getFullYear()} – ${formatShort(last)}, ${last.getFullYear()}`;
            } else if (first.getMonth() !== last.getMonth()) {
                return `${formatShort(first)} – ${formatShort(last)}, ${last.getFullYear()}`;
            } else {
                return `${MONTH_LABELS[first.getMonth()]} ${first.getDate()} – ${last.getDate()}, ${first.getFullYear()}`;
            }
        } else {
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return `${dayNames[selectedDate.getDay()]}, ${MONTH_LABELS[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`;
        }
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

    const formatHour = (h) => {
        if (h === 0) return '12 am';
        if (h < 12) return `${h} am`;
        if (h === 12) return '12 pm';
        return `${h - 12} pm`;
    };

    // ========== Event CRUD ==========
    const handleAddEventSubmit = async (e) => {
        e.preventDefault();
        if (!eventForm.title.trim() || !eventForm.event_from || !eventForm.event_to) {
            toast.error('Please fill required fields'); return;
        }
        try {
            // Get staff_id and role_id from localStorage
            let staffId = '1';
            let roleId = '7';
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    staffId = user.id || '1';
                    const roles = user.roles || {};
                    roleId = Object.values(roles)[0] || '7';
                }
            } catch (ex) { console.error('Failed to parse user:', ex); }

            // Format date from YYYY-MM-DD or YYYY-MM-DDTHH:MM to DD/MM/YYYY HH:MM AM/PM
            const formatEventDate = (dateStr) => {
                if (!dateStr) return '';
                let datePart, timePart;
                if (dateStr.includes('T')) {
                    [datePart, timePart] = dateStr.split('T');
                } else {
                    datePart = dateStr.split(' ')[0];
                    timePart = null;
                }
                const [y, m, d] = datePart.split('-');
                if (timePart) {
                    const [hh, mm] = timePart.split(':');
                    let hour = parseInt(hh, 10);
                    const ampm = hour >= 12 ? 'PM' : 'AM';
                    if (hour > 12) hour -= 12;
                    if (hour === 0) hour = 12;
                    return `${d}/${m}/${y} ${String(hour).padStart(2, '0')}:${mm} ${ampm}`;
                }
                return `${d}/${m}/${y} 12:00 AM`;
            };

            const payload = {
                title: eventForm.title,
                description: eventForm.description || '',
                event_from: formatEventDate(eventForm.event_from),
                event_to: formatEventDate(eventForm.event_to),
                eventcolor: eventForm.eventcolor,
                event_type: eventForm.event_type
            };
            await api.addCalendarEvent(payload);
            toast.success('Event added successfully');
            setShowAddEvent(false);
            setEventForm({ title: '', description: '', event_from: '', event_to: '', eventcolor: eventColors[0], event_type: 'private' });
            fetchData();
        } catch (err) { toast.error(err.message || 'Failed to add event'); }
    };

    const handleUpdateEventSubmit = async (e) => {
        e.preventDefault();
        try {
            // Get staff_id and role_id from localStorage
            let staffId = '1';
            let roleId = '7';
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    staffId = user.id || '1';
                    const roles = user.roles || {};
                    roleId = Object.values(roles)[0] || '7';
                }
            } catch (ex) { console.error('Failed to parse user:', ex); }

            // Format date from YYYY-MM-DD to DD/MM/YYYY HH:MM AM
            const formatEventDate = (dateStr) => {
                if (!dateStr) return '';
                const datePart = dateStr.split(' ')[0];
                if (datePart.includes('-')) {
                    const [y, m, d] = datePart.split('-');
                    return `${d}/${m}/${y} 05:30 AM`;
                }
                return dateStr;
            };

            const payload = {
                title: editEventForm.title,
                description: editEventForm.description || '',
                event_from: formatEventDate(editEventForm.event_from),
                event_to: formatEventDate(editEventForm.event_to),
                eventid: Number(editEventForm.eventid),
                eventcolor: editEventForm.eventcolor,
                event_type: editEventForm.eventtype
            };
            await api.updateCalendarEvent(payload);
            toast.success('Event updated successfully');
            setShowViewEvent(false);
            fetchData();
        } catch (err) { toast.error(err.message || 'Failed to update event'); }
    };

    const handleDeleteEvent = async () => {
        if (!editEventForm.eventid) return;
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        try {
            await api.deleteCalendarEvent(editEventForm.eventid);
            toast.success('Event deleted successfully');
            setShowViewEvent(false);
            fetchData();
        } catch (err) { toast.error(err.message || 'Failed to delete event'); }
    };

    const openViewEvent = async (event) => {
        try {
            const res = await api.viewCalendarEvent(event.id);
            const evt = res.data || res;
            setEditEventForm({
                eventid: evt.id || event.id,
                title: evt.title || evt.event_title || '',
                description: evt.description || evt.event_description || '',
                event_from: evt.start || evt.start_date || '',
                event_to: evt.end || evt.end_date || '',
                eventcolor: evt.backgroundColor || evt.event_color || eventColors[0],
                eventtype: evt.event_type || 'private'
            });
            setShowViewEvent(true);
        } catch (err) {
            // Fallback to local data if API fails
            setEditEventForm({
                eventid: event.id,
                title: event.event_title || event.title || '',
                description: event.event_description || event.description || '',
                event_from: event.start_date || event.start || '',
                event_to: event.end_date || event.end || '',
                eventcolor: event.event_color || event.color || eventColors[0],
                eventtype: event.event_type || 'private'
            });
            setShowViewEvent(true);
        }
    };

    const openAddEventForDate = (dateStr, startHour, endHour) => {
        // Format hour to HH:00 for datetime-local input
        const formatTime = (h) => {
            if (h === undefined || h === null) return '';
            return `${String(h).padStart(2, '0')}:00`;
        };
        const fromVal = startHour !== undefined ? `${dateStr}T${formatTime(startHour)}` : dateStr;
        const toVal = endHour !== undefined ? `${dateStr}T${formatTime(endHour + 1)}` : dateStr;
        setEventForm(prev => ({ ...prev, event_from: fromVal, event_to: toVal }));
        setShowAddEvent(true);
    };

    // Drag handlers for time selection
    const handleDragStart = (dateStr, hour) => {
        setDragInfo({ isDragging: true, dateStr, startHour: hour, endHour: hour });
    };

    const handleDragEnter = (dateStr, hour) => {
        if (dragRef.current.isDragging && dragRef.current.dateStr === dateStr) {
            setDragInfo(prev => ({ ...prev, endHour: hour }));
        }
    };

    const handleDragEnd = () => {
        const { isDragging, dateStr, startHour, endHour } = dragRef.current;
        if (isDragging && startHour !== null) {
            const minH = Math.min(startHour, endHour);
            const maxH = Math.max(startHour, endHour);
            openAddEventForDate(dateStr, minH, maxH);
        }
        setDragInfo({ isDragging: false, dateStr: '', startHour: null, endHour: null });
    };

    const isHourInDragRange = (dateStr, hour) => {
        if (!dragInfo.isDragging || dragInfo.dateStr !== dateStr) return false;
        const minH = Math.min(dragInfo.startHour, dragInfo.endHour);
        const maxH = Math.max(dragInfo.startHour, dragInfo.endHour);
        return hour >= minH && hour <= maxH;
    };

    // Global mouseup to end drag
    useEffect(() => {
        const onMouseUp = () => {
            if (dragRef.current.isDragging) handleDragEnd();
        };
        window.addEventListener('mouseup', onMouseUp);
        return () => window.removeEventListener('mouseup', onMouseUp);
    }, []);

    // ========== To-Do CRUD ==========
    const handleAddTaskSubmit = async (e) => {
        e.preventDefault();
        if (!taskForm.task_title.trim() || !taskForm.task_date) {
            toast.error('Please fill required fields'); return;
        }
        try {
            // Get staff_id and role_id from localStorage
            let staffId = '1';
            let roleId = '7';
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    staffId = user.id || '1';
                    const roles = user.roles || {};
                    roleId = Object.values(roles)[0] || '7';
                }
            } catch (ex) { console.error('Failed to parse user:', ex); }

            // Format date as DD/MM/YYYY
            let formattedDate = taskForm.task_date;
            if (taskForm.task_date && taskForm.task_date.includes('-')) {
                const [y, m, d] = taskForm.task_date.split('-');
                formattedDate = `${d}/${m}/${y}`;
            }

            const payload = {
                task_title: taskForm.task_title,
                task_date: formattedDate,
                eventid: taskForm.eventid || '',
                staff_id: staffId,
                role_id: roleId
            };
            await api.addToDo(payload);
            toast.success('Task saved successfully');
            setShowAddTask(false);
            setTaskForm({ task_title: '', task_date: '', eventid: '' });
            fetchData();
        } catch (err) { toast.error(err.message || 'Failed to save task'); }
    };

    const handleMarkComplete = async (id, currentStatus) => {
        const newStatus = currentStatus === 'yes' ? 'no' : 'yes';
        try {
            await api.markToDoComplete(id, newStatus);
            toast.success('Task updated');
            fetchData();
        } catch (err) { toast.error(err.message || 'Failed to update task'); }
    };

    const handleDeleteTodo = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await api.deleteToDoTask(id);
            toast.success('Task deleted');
            fetchData();
        } catch (err) { toast.error(err.message || 'Failed to delete task'); }
    };

    const handleEditTodo = async (id) => {
        try {
            const res = await api.getToDoById(id);
            const task = res.data || res;
            setTaskModalTitle('Edit Task');
            // Convert "2026-02-23 00:00:00" to "2026-02-23" for date input
            let taskDate = task.start_date || '';
            if (taskDate.includes(' ')) taskDate = taskDate.split(' ')[0];
            setTaskForm({
                task_title: task.event_title || '',
                task_date: taskDate,
                eventid: task.id || id
            });
            setShowAddTask(true);
        } catch (err) { toast.error(err.message || 'Failed to fetch task'); }
    };

    const openAddTask = () => {
        setTaskModalTitle('Add Task');
        setTaskForm({ task_title: '', task_date: new Date().toISOString().slice(0, 10), eventid: '' });
        setShowAddTask(true);
    };


    // ========== RENDER: Month View ==========
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
                                const todayCheck = cell.currentMonth && new Date(year, month, cell.day).toDateString() === new Date().toDateString();
                                const dateStr = cell.currentMonth ? dateToString(new Date(year, month, cell.day)) : '';
                                const dayEvents = cell.currentMonth ? getEventsForDate(dateStr) : [];
                                const firstEventColor = dayEvents.length > 0 ? (dayEvents[0].backgroundColor || dayEvents[0].event_color || dayEvents[0].color || '#3c8dbc') : null;

                                return (
                                    <td key={di} style={{
                                        backgroundColor: todayCheck ? '#faf6ff' : '#fff',
                                        cursor: cell.currentMonth ? 'pointer' : 'default'
                                    }} onClick={() => cell.currentMonth && openAddEventForDate(dateStr)}>
                                        <div className="cal-day-num">
                                            <span className={cell.currentMonth ? '' : 'cal-day-num other-month'}
                                                style={todayCheck
                                                    ? { color: firstEventColor || '#8E44D3', fontWeight: 700, fontSize: '15px' }
                                                    : cell.currentMonth ? { color: '#333' } : {}}>
                                                {cell.day}
                                            </span>
                                        </div>
                                        {dayEvents.map((evt, ei) => (
                                            <div key={ei} className="cal-event-chip"
                                                onClick={(e) => { e.stopPropagation(); openViewEvent(evt); }}
                                                style={{ backgroundColor: evt.backgroundColor || evt.event_color || evt.color || '#3c8dbc' }}>
                                                {evt.title || evt.event_title}
                                            </div>
                                        ))}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    const renderWeekView = () => {
        const weekDays = getWeekDays();
        return (
            <div style={{ overflowY: 'auto', maxHeight: '600px' }}>
                <table className="cal-month-table" style={{ tableLayout: 'fixed' }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                        <tr>
                            <th style={{ width: '65px' }}></th>
                            {weekDays.map((d, i) => {
                                const isToday = isTodayDate(d);
                                const dateStr = dateToString(d);
                                const dEvents = getEventsForDate(dateStr);
                                const todayColor = dEvents.length > 0 ? (dEvents[0].backgroundColor || dEvents[0].event_color || dEvents[0].color || '#8E44D3') : '#8E44D3';
                                return (
                                    <th key={i} style={{
                                        color: isToday ? todayColor : undefined,
                                        background: isToday ? '#f3ecfa' : undefined
                                    }}>
                                        <div>{DOW_LABELS[i]}</div>
                                        <div style={{ fontSize: '20px', fontWeight: isToday ? 800 : 600, marginTop: '2px' }}>
                                            {d.getDate()}
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {/* All-day events row */}
                        <tr>
                            <td style={{ padding: '4px 6px', fontSize: '10px', color: '#aaa', verticalAlign: 'top', textAlign: 'right', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', borderRight: '2px solid #f0edf4' }}>all-day</td>
                            {weekDays.map((d, i) => {
                                const dateStr = dateToString(d);
                                const dayEvents = getEventsForDate(dateStr);
                                return (
                                    <td key={i} style={{ verticalAlign: 'top', padding: '4px 4px', minHeight: '30px', borderBottom: '2px solid #f0edf4' }}
                                        onClick={() => openAddEventForDate(dateStr)}>
                                        {dayEvents.map((evt, ei) => (
                                            <div key={ei} className="cal-event-chip"
                                                onClick={(e) => { e.stopPropagation(); openViewEvent(evt); }}
                                                style={{ backgroundColor: evt.backgroundColor || evt.event_color || evt.color || '#3c8dbc' }}>
                                                {evt.title || evt.event_title}
                                            </div>
                                        ))}
                                    </td>
                                );
                            })}
                        </tr>
                        {/* Hour rows */}
                        {HOURS.map((hour) => (
                            <tr key={hour}>
                                <td style={{
                                    padding: '2px 8px', fontSize: '11px', color: '#aaa', textAlign: 'right',
                                    verticalAlign: 'top', borderRight: '2px solid #f0edf4', width: '65px', fontWeight: 500
                                }}>
                                    {formatHour(hour)}
                                </td>
                                {weekDays.map((d, i) => {
                                    const dateStr = dateToString(d);
                                    return (
                                        <td key={i} style={{
                                            height: '44px', verticalAlign: 'top', padding: '1px 2px',
                                            backgroundColor: isHourInDragRange(dateStr, hour) ? 'rgba(142,68,211,0.15)' : isTodayDate(d) ? '#fdfaff' : '#fff',
                                            cursor: 'pointer', userSelect: 'none', borderBottom: '1px solid #f5f3f8'
                                        }}
                                            onMouseDown={(e) => { e.preventDefault(); handleDragStart(dateStr, hour); }}
                                            onMouseEnter={() => handleDragEnter(dateStr, hour)}
                                        >
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

    // ========== RENDER: Day View ==========
    const renderDayView = () => {
        const dateStr = dateToString(selectedDate);
        const dayEvents = getEventsForDate(dateStr);
        const isToday = isTodayDate(selectedDate);

        return (
            <div style={{ overflowY: 'auto', maxHeight: '600px' }}>
                <table className="cal-month-table" style={{ tableLayout: 'fixed' }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                        <tr>
                            <th style={{ width: '65px' }}></th>
                            {(() => {
                                const dayColor = dayEvents.length > 0 ? (dayEvents[0].backgroundColor || dayEvents[0].event_color || dayEvents[0].color || '#8E44D3') : '#8E44D3';
                                return (
                                    <th style={{
                                        color: isToday ? dayColor : undefined,
                                        background: isToday ? '#f3ecfa' : undefined
                                    }}>
                                        <div>{DOW_LABELS_FULL[selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1]}</div>
                                        <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '2px' }}>
                                            {selectedDate.getDate()}
                                        </div>
                                    </th>
                                );
                            })()}
                        </tr>
                    </thead>
                    <tbody>
                        {/* All-day events row */}
                        <tr>
                            <td style={{ padding: '4px 6px', fontSize: '10px', color: '#aaa', verticalAlign: 'top', textAlign: 'right', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', borderRight: '2px solid #f0edf4' }}>all-day</td>
                            <td style={{ verticalAlign: 'top', padding: '4px 8px', minHeight: '40px', borderBottom: '2px solid #f0edf4' }}
                                onClick={() => openAddEventForDate(dateStr)}>
                                {dayEvents.map((evt, ei) => (
                                    <div key={ei} className="cal-event-chip"
                                        onClick={(e) => { e.stopPropagation(); openViewEvent(evt); }}
                                        style={{ backgroundColor: evt.backgroundColor || evt.event_color || evt.color || '#3c8dbc' }}>
                                        {evt.title || evt.event_title}
                                    </div>
                                ))}
                            </td>
                        </tr>
                        {/* Hour rows */}
                        {HOURS.map((hour) => (
                            <tr key={hour}>
                                <td style={{
                                    padding: '2px 8px', fontSize: '11px', color: '#aaa', textAlign: 'right',
                                    verticalAlign: 'top', width: '65px', borderRight: '2px solid #f0edf4', fontWeight: 500
                                }}>
                                    {formatHour(hour)}
                                </td>
                                <td style={{
                                    height: '44px', verticalAlign: 'top', padding: '2px 4px',
                                    backgroundColor: isHourInDragRange(dateStr, hour) ? 'rgba(142,68,211,0.15)' : isToday ? '#fdfaff' : '#fff',
                                    cursor: 'pointer', userSelect: 'none', borderBottom: '1px solid #f5f3f8'
                                }}
                                    onMouseDown={(e) => { e.preventDefault(); handleDragStart(dateStr, hour); }}
                                    onMouseEnter={() => handleDragEnter(dateStr, hour)}
                                >
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="wrapper theme-white-skin">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '828px' }}>
                <section className="content-header">
                    <h1><i className="fa fa-calendar"></i> Calendar</h1>
                </section>

                <section className="content">
                    <div className="row">
                        {/* Main Calendar - col-md-9 */}
                        <div className="col-md-9 col-sm-9">
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
                                            {getTitle()}
                                        </h3>
                                        <div className="cal-view-btns btn-group">
                                            <button className={`btn btn-sm ${view === 'month' ? 'active' : ''}`} onClick={() => setView('month')}>Month</button>
                                            <button className={`btn btn-sm ${view === 'week' ? 'active' : ''}`} onClick={() => setView('week')}>Week</button>
                                            <button className={`btn btn-sm ${view === 'day' ? 'active' : ''}`} onClick={() => setView('day')}>Day</button>
                                        </div>
                                    </div>

                                    {/* View Content */}
                                    {view === 'month' && renderMonthView()}
                                    {view === 'week' && renderWeekView()}
                                    {view === 'day' && renderDayView()}
                                </div>
                            </div>
                        </div>

                        {/* To Do List Sidebar - col-md-3 */}
                        <div className="col-md-3 col-sm-3">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title">To Do List</h3>
                                    <div className="box-tools pull-right">
                                        <button className="btn btn-primary btn-sm pull-right" onClick={openAddTask}>
                                            <i className="fa fa-plus"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="">
                                    {todos.length === 0 ? (
                                        <div className="text-center" style={{ padding: '40px 20px', color: '#bbb' }}>
                                            <i className="fa fa-check-circle-o" style={{ fontSize: '32px', display: 'block', marginBottom: '10px' }}></i>
                                            No tasks found
                                        </div>
                                    ) : (
                                        todos.map((task) => (
                                            <React.Fragment key={task.id}>
                                                <div className="media mt5" style={{ padding: '0 10px' }}>
                                                    <div className="media-left">
                                                        <input type="checkbox"
                                                            checked={task.is_active === 'yes'}
                                                            onChange={() => handleMarkComplete(task.id, task.is_active)}
                                                        />
                                                    </div>
                                                    <div className="media-body">
                                                        <p className="tododesc"
                                                            style={task.is_active === 'yes' ? { textDecoration: 'line-through', color: '#4f881d' } : { color: 'red' }}
                                                        >{task.event_title}</p>
                                                        <small className="tododate">
                                                            {formatDateDisplay(task.start_date)}
                                                            <a href="#" className="pull-right text-muted" onClick={(e) => { e.preventDefault(); handleDeleteTodo(task.id); }} title="Delete">
                                                                <i className="fa fa-remove"></i>
                                                            </a>
                                                            <a href="#" className="pull-right text-muted mright5" style={{ marginRight: '5px' }} onClick={(e) => { e.preventDefault(); handleEditTodo(task.id); }} title="Edit">
                                                                <i className="fa fa-pencil"></i>
                                                            </a>
                                                        </small>
                                                    </div>
                                                </div>
                                                <div className="todo_divider"></div>
                                            </React.Fragment>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />

            {/* ========== Add Event Modal ========== */}
            <ModalBackdrop show={showAddEvent} onClose={() => setShowAddEvent(false)}>
                <div className="modal-header">
                    <button type="button" className="close" onClick={() => setShowAddEvent(false)}>&times;</button>
                    <h4 className="modal-title">Add New Event</h4>
                </div>
                <div className="modal-body pb0">
                    <form id="addevent_form" onSubmit={handleAddEventSubmit}>
                        <div className="form-group col-md-12">
                            <label>Event Title <small className="req"> *</small></label>
                            <input className="form-control" name="title" value={eventForm.title}
                                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
                        </div>
                        <div className="form-group col-md-12">
                            <label>Event Description</label>
                            <textarea className="form-control" name="description" value={eventForm.description}
                                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} />
                        </div>
                        <div className="row" style={{ padding: '0 15px' }}>
                            <div className="form-group col-md-6">
                                <label>Event From <small className="req"> *</small></label>
                                <div className="input-group">
                                    <div className="input-group-addon"><i className="fa fa-calendar"></i></div>
                                    <input type="datetime-local" className="form-control" name="event_from" value={eventForm.event_from}
                                        onChange={(e) => setEventForm({ ...eventForm, event_from: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group col-md-6">
                                <label>Event To <small className="req"> *</small></label>
                                <div className="input-group">
                                    <div className="input-group-addon"><i className="fa fa-calendar"></i></div>
                                    <input type="datetime-local" className="form-control" name="event_to" value={eventForm.event_to}
                                        onChange={(e) => setEventForm({ ...eventForm, event_to: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <div className="form-group col-md-12">
                            <label>Event Color</label>
                            <ColorPicker colors={eventColors} selectedColor={eventForm.eventcolor}
                                onSelect={(c) => setEventForm({ ...eventForm, eventcolor: c })} />
                        </div>
                        <div className="form-group col-md-12">
                            <label>Event Type</label><br />
                            {['public', 'private', 'sameforall', 'protected'].map(type => (
                                <label className="radio-inline" key={type}>
                                    <input type="radio" name="event_type" value={type}
                                        checked={eventForm.event_type === type}
                                        onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })}
                                    /> {type === 'sameforall' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                                </label>
                            ))}
                        </div>
                        <div className="row">
                            <div className="box-footer clearboth">
                                <input type="submit" className="btn btn-primary pull-right" value="Save" />
                            </div>
                        </div>
                    </form>
                </div>
            </ModalBackdrop>

            {/* ========== View/Edit Event Modal ========== */}
            <ModalBackdrop show={showViewEvent} onClose={() => setShowViewEvent(false)}>
                <div className="modal-header">
                    <button type="button" className="close" onClick={() => setShowViewEvent(false)}>&times;</button>
                    <h4 className="modal-title">View Event</h4>
                </div>
                <div className="modal-body">
                    <form id="updateevent_form" onSubmit={handleUpdateEventSubmit}>
                        <div className="row">
                            <div className="form-group col-md-12">
                                <label>Event Title <small className="req"> *</small></label>
                                <input className="form-control" name="title" value={editEventForm.title}
                                    onChange={(e) => setEditEventForm({ ...editEventForm, title: e.target.value })} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="form-group col-md-12">
                                <label>Event Description</label>
                                <textarea className="form-control" name="description" value={editEventForm.description}
                                    onChange={(e) => setEditEventForm({ ...editEventForm, description: e.target.value })} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="form-group col-md-6">
                                <label>Event From</label>
                                <div className="input-group">
                                    <div className="input-group-addon"><i className="fa fa-calendar"></i></div>
                                    <input type="date" className="form-control" name="event_from"
                                        value={editEventForm.event_from ? editEventForm.event_from.split(' ')[0] : ''}
                                        onChange={(e) => setEditEventForm({ ...editEventForm, event_from: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group col-md-6">
                                <label>Event To</label>
                                <div className="input-group">
                                    <div className="input-group-addon"><i className="fa fa-calendar"></i></div>
                                    <input type="date" className="form-control" name="event_to"
                                        value={editEventForm.event_to ? editEventForm.event_to.split(' ')[0] : ''}
                                        onChange={(e) => setEditEventForm({ ...editEventForm, event_to: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <input type="hidden" name="eventid" value={editEventForm.eventid} />
                        <div className="row">
                            <div className="form-group col-md-12">
                                <label>Event Color</label>
                                <ColorPicker colors={eventColors} selectedColor={editEventForm.eventcolor}
                                    onSelect={(c) => setEditEventForm({ ...editEventForm, eventcolor: c })} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="form-group col-md-12">
                                <label>Event Type</label><br />
                                {['public', 'private', 'sameforall', 'protected'].map(type => (
                                    <label className="radio-inline" key={type}>
                                        <input type="radio" name="eventtype" value={type}
                                            checked={editEventForm.eventtype === type}
                                            onChange={(e) => setEditEventForm({ ...editEventForm, eventtype: e.target.value })}
                                        /> {type === 'sameforall' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="row" style={{ marginTop: '15px' }}>
                            <div className="col-xs-6">
                                <input type="button" className="btn btn-danger" value="Delete" onClick={handleDeleteEvent} />
                            </div>
                            <div className="col-xs-6 text-right">
                                <input type="submit" className="btn btn-primary" value="Save" />
                            </div>
                        </div>
                    </form>
                </div>
            </ModalBackdrop>

            {/* ========== Add/Edit Task Modal ========== */}
            <ModalBackdrop show={showAddTask} onClose={() => setShowAddTask(false)}>
                <div className="modal-header">
                    <button type="button" className="close" onClick={() => setShowAddTask(false)}>&times;</button>
                    <h4 className="modal-title">{taskModalTitle}</h4>
                </div>
                <div className="modal-body pb0">
                    <form id="addtodo_form" onSubmit={handleAddTaskSubmit}>
                        <div className="form-group col-md-12">
                            <label>Task Title <small className="req"> *</small></label>
                            <input className="form-control" name="task_title" value={taskForm.task_title}
                                onChange={(e) => setTaskForm({ ...taskForm, task_title: e.target.value })} />
                        </div>
                        <div className="form-group col-md-12">
                            <label>Date <small className="req"> *</small></label>
                            <input className="form-control" type="date" name="task_date" value={taskForm.task_date}
                                onChange={(e) => setTaskForm({ ...taskForm, task_date: e.target.value })} />
                            <input type="hidden" name="eventid" value={taskForm.eventid} />
                        </div>
                        <div className="row">
                            <div className="box-footer clearboth">
                                <input type="submit" className="btn btn-primary pull-right" value="Save" />
                            </div>
                        </div>
                    </form>
                </div>
            </ModalBackdrop>
        </div>
    );
};

export default CalendarPage;
