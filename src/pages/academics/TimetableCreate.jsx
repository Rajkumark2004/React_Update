import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const TimetableCreate = () => {
    // Top Level Criteria
    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [subjectGroupList, setSubjectGroupList] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedSubjectGroup, setSelectedSubjectGroup] = useState('');

    // Quick Generation Fields
    const [startTime, setStartTime] = useState('');
    const [duration, setDuration] = useState('');
    const [interval, setInterval] = useState('0');
    const [roomNo, setRoomNo] = useState('');

    // State for Tabs and Data
    const [daysList, setDaysList] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
    const [activeTab, setActiveTab] = useState(0);
    const [timetableByDay, setTimetableByDay] = useState({});
    const [initialRecordIdsByDay, setInitialRecordIdsByDay] = useState({});
    const [staffList, setStaffList] = useState([]);
    const [subjectList, setSubjectList] = useState([]);

    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showTimetable, setShowTimetable] = useState(false);

    // Initial Data Fetch (Classes, Staff, Subjects)
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                // Using assign_subject_teacher endpoint as it returns classes, staff and subjects
                const data = await api.getAssignSubjectTeacher();
                if (data && (data.status === 'success' || data.status === true)) {
                    setClassList(data.classlist || []);
                    setStaffList(data.staff_list || []);
                    setSubjectList(data.batch_subjects || []);
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
                toast.error('Failed to load initial data');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    // Handle Class Change -> Fetch Sections
    const handleClassChange = async (classId) => {
        setSelectedClass(classId);
        setSelectedSection('');
        setSelectedSubjectGroup('');
        setSectionList([]);
        setSubjectGroupList([]);
        if (!classId) return;

        try {
            const data = await api.getSectionsByClass(classId);
            if (data && (data.status === 'success' || data.status === true)) {
                setSectionList(data.data || data.sections || []);
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
        }
    };

    // Handle Section Change -> Fetch Subject Groups
    const handleSectionChange = async (sectionId) => {
        setSelectedSection(sectionId);
        setSelectedSubjectGroup('');
        setSubjectGroupList([]);
        if (!selectedClass || !sectionId) return;

        try {
            const data = await api.getGroupByClassandSection(selectedClass, sectionId);
            if (Array.isArray(data)) {
                setSubjectGroupList(data);
            } else if (data && data.data) {
                setSubjectGroupList(data.data);
            }
        } catch (error) {
            console.error('Error fetching subject groups:', error);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!selectedClass || !selectedSection || !selectedSubjectGroup) {
            toast.error('Please select all criteria');
            return;
        }

        setSearchLoading(true);
        try {
            const payload = {
                class_id: selectedClass,
                section_id: selectedSection,
                subject_group_id: selectedSubjectGroup
            };
            const response = await api.createTimetable(payload);

            // Extract metadata from response if available
            if (response.getDaysnameList) {
                setDaysList(Object.values(response.getDaysnameList));
            }
            if (response.staff) {
                setStaffList(response.staff);
            }
            if (response.subject) {
                setSubjectList(response.subject);
            }

            const daysToUse = response.getDaysnameList ? Object.values(response.getDaysnameList) : daysList;
            const newTimetable = {};
            const initialIds = {};

            daysToUse.forEach(day => {
                const dayKey = day.toLowerCase();
                const existingRows = response.timetable_data?.[dayKey] || [];

                initialIds[day] = existingRows.map(r => r.id).filter(id => id);

                newTimetable[day] = existingRows.length > 0 ? existingRows.map(r => ({
                    ...r,
                    id: r.id || Date.now() + Math.random(),
                    subject_id: r.subject_group_subject_id || r.subject_id || '',
                    staff_id: r.staff_id || '',
                    time_from: r.time_from || '',
                    time_to: r.time_to || '',
                    room_no: r.room_no || '',
                    prev_id: r.id || '0'
                })) : [{
                    id: Date.now() + Math.random(),
                    subject_id: '',
                    staff_id: '',
                    time_from: '',
                    time_to: '',
                    room_no: '',
                    prev_id: '0'
                }];
            });

            setTimetableByDay(newTimetable);
            setInitialRecordIdsByDay(initialIds);
            setShowTimetable(true);
        } catch (error) {
            console.error('Error searching timetable:', error);
            toast.error('Failed to fetch timetable data');
        } finally {
            setSearchLoading(false);
        }
    };

    const handleApplyParameters = (e) => {
        e.preventDefault();
        if (!startTime || !duration) {
            toast.error('Please enter start time and duration');
            return;
        }

        const currentDay = daysList[activeTab];
        const rows = [...(timetableByDay[currentDay] || [])];
        if (rows.length === 0) return;

        const parseTime = (timeStr) => {
            if (!timeStr) return new Date();
            // Handle HH:mm or hh:mm A
            const [time, modifier] = timeStr.split(' ');
            let [hours, minutes] = time.split(':');
            if (hours === '12') hours = '00';
            if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
            const d = new Date();
            d.setHours(hours, minutes, 0, 0);
            return d;
        };

        const formatTime = (date) => {
            let hours = date.getHours();
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            return `${hours}:${minutes} ${ampm}`;
        };

        let lastTime = parseTime(startTime);
        const durationMin = parseInt(duration, 10);
        const intervalMin = parseInt(interval, 10) || 0;

        const updatedRows = rows.map(row => {
            const timeFrom = formatTime(lastTime);
            lastTime.setMinutes(lastTime.getMinutes() + durationMin);
            const timeTo = formatTime(lastTime);
            lastTime.setMinutes(lastTime.getMinutes() + intervalMin);
            return { ...row, time_from: timeFrom, time_to: timeTo, room_no: roomNo || row.room_no };
        });

        setTimetableByDay(prev => ({ ...prev, [currentDay]: updatedRows }));
    };

    const handleAddRow = () => {
        const currentDay = daysList[activeTab];
        const newRow = {
            id: Date.now() + Math.random(),
            subject_id: '',
            staff_id: '',
            time_from: '',
            time_to: '',
            room_no: '',
            prev_id: '0'
        };
        setTimetableByDay(prev => ({
            ...prev,
            [currentDay]: [...(prev[currentDay] || []), newRow]
        }));
    };

    const handleDeleteRow = (index) => {
        const currentDay = daysList[activeTab];
        const rows = [...(timetableByDay[currentDay] || [])];
        if (rows[index].prev_id !== '0') {
            if (!window.confirm('Are you sure you want to delete this scheduled period?')) return;
        }
        rows.splice(index, 1);
        setTimetableByDay(prev => ({
            ...prev,
            [currentDay]: rows
        }));
    };

    const handleInputChange = (index, field, value) => {
        const currentDay = daysList[activeTab];
        const rows = [...(timetableByDay[currentDay] || [])];
        rows[index] = { ...rows[index], [field]: value };
        setTimetableByDay(prev => ({
            ...prev,
            [currentDay]: rows
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const currentDay = daysList[activeTab];
        const rows = timetableByDay[currentDay] || [];

        // Validation
        const isValid = rows.every(r => r.subject_id && r.staff_id && r.time_from && r.time_to);
        if (!isValid) {
            toast.error('Please fill all fields for all rows in the current day');
            return;
        }

        const payload = {
            day: currentDay,
            class_id: selectedClass,
            section_id: selectedSection,
            subject_group_id: selectedSubjectGroup,
            prev_array: initialRecordIdsByDay[currentDay] || [],
            total_row: rows.map((_, i) => i + 1),
            // Map rows to the structure expected by the PHP controller (1-indexed)
            ...rows.reduce((acc, row, idx) => {
                const rowNum = idx + 1;
                acc[`subject_${rowNum}`] = row.subject_id;
                acc[`staff_${rowNum}`] = row.staff_id;
                acc[`time_from_${rowNum}`] = row.time_from;
                acc[`time_to_${rowNum}`] = row.time_to;
                acc[`room_no_${rowNum}`] = row.room_no;
                acc[`prev_id_${rowNum}`] = row.prev_id;
                return acc;
            }, {})
        };

        try {
            const response = await api.saveTimetableGroup(payload);
            if (response.status === 'success' || response.status === true || response.message?.includes('Successfully')) {
                toast.success(response.message || 'Timetable saved successfully for ' + currentDay);
            } else {
                toast.error(response.message || 'Failed to save timetable');
            }
        } catch (error) {
            console.error('Error saving timetable:', error);
            toast.error('An error occurred while saving');
        }
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .select2-container--default .select2-selection--single .select2-selection__rendered { line-height: 22px !important; border-radius: 0 !important; padding-left: 0 !important;}
                    .input-group-addon .glyphicon{font-size: 12px;}
                    .relative{position: relative;}
                    .addbtnright{ position: absolute;right: 15px;top: -10px; z-index: 10;}
                    .astrike { color: red; }
                `}} />

                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            {/* Search Criteria */}
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title"><i className="fa fa-search"></i> Select Criteria</h3>
                                </div>
                                <form onSubmit={handleSearch}>
                                    <div className="box-body">
                                        <div className="row">
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>Class<small className="req"> *</small></label>
                                                    <select
                                                        className="form-control"
                                                        value={selectedClass}
                                                        onChange={(e) => handleClassChange(e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Select</option>
                                                        {classList.map(c => <option key={c.id} value={c.id}>{c.class}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>Section<small className="req"> *</small></label>
                                                    <select
                                                        className="form-control"
                                                        value={selectedSection}
                                                        onChange={(e) => handleSectionChange(e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Select</option>
                                                        {sectionList.map(s => <option key={s.section_id} value={s.section_id}>{s.section}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>Subject Group<small className="req"> *</small></label>
                                                    <select
                                                        className="form-control"
                                                        value={selectedSubjectGroup}
                                                        onChange={(e) => setSelectedSubjectGroup(e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Select</option>
                                                        {subjectGroupList.map(sg => <option key={sg.subject_group_id || sg.id} value={sg.subject_group_id || sg.id}>{sg.name}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <button type="submit" className="btn btn-primary pull-right btn-sm" disabled={searchLoading}>
                                            {searchLoading ? <i className="fa fa-spinner fa-spin"></i> : <i className="fa fa-search"></i>} Search
                                        </button>
                                    </div>
                                </form>

                                {showTimetable && (
                                    <>
                                        {/* Quick Parameter Form */}
                                        <div className="box-header with-border">
                                            <h3 className="box-title"><i className="fa fa-search"></i> Select Parameter to Generate Time Table Quickly</h3>
                                        </div>
                                        <div className="box-body">
                                            <form onSubmit={handleApplyParameters}>
                                                <div className="row">
                                                    <div className="col-sm-2">
                                                        <div className="form-group">
                                                            <label>Period Start Time<small className="req"> *</small></label>
                                                            <div className="input-group">
                                                                <input type="text" className="form-control" placeholder="10:00 AM" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                                                                <div className="input-group-addon"><i className="fa fa-clock-o"></i></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-2">
                                                        <div className="form-group">
                                                            <label>Duration (min)<small className="req"> *</small></label>
                                                            <div className="input-group">
                                                                <input type="number" className="form-control" value={duration} onChange={(e) => setDuration(e.target.value)} required />
                                                                <div className="input-group-addon"><i className="fa fa-hourglass-start"></i></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-2">
                                                        <div className="form-group">
                                                            <label>Interval (min)<small className="req"> *</small></label>
                                                            <div className="input-group">
                                                                <input type="number" className="form-control" value={interval} onChange={(e) => setInterval(e.target.value)} />
                                                                <div className="input-group-addon"><i className="fa fa-hourglass-start"></i></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-2">
                                                        <div className="form-group">
                                                            <label>Room No</label>
                                                            <input type="text" className="form-control" value={roomNo} onChange={(e) => setRoomNo(e.target.value)} />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-2">
                                                        <div className="form-group">
                                                            <label>&nbsp;</label>
                                                            <button type="submit" className="btn btn-primary btn-sm btn-block">Apply</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>

                                        {/* Dynamic Tabs */}
                                        <div className="nav-tabs-custom" style={{ marginTop: '20px' }}>
                                            <ul className="nav nav-tabs">
                                                {daysList.map((day, idx) => (
                                                    <li key={day} className={activeTab === idx ? 'active' : ''}>
                                                        <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab(idx); }}>{day}</a>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="tab-content">
                                                {daysList.map((day, dIdx) => (
                                                    <div key={day} className={`tab-pane ${activeTab === dIdx ? 'active' : ''}`}>
                                                        <div className="row relative">
                                                            <button type="button" onClick={handleAddRow} className="btn btn-primary btn-sm addbtnright">
                                                                <i className="fa fa-plus"></i> Add New
                                                            </button>
                                                            <div className="col-md-12">
                                                                <form onSubmit={handleSave}>
                                                                    <div className="table-responsive" style={{ marginTop: '20px' }}>
                                                                        <table className="table table-bordered table-hover">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Subject</th>
                                                                                    <th>Teacher</th>
                                                                                    <th>Time From<small className="astrike"> *</small></th>
                                                                                    <th>Time To<small className="astrike"> *</small></th>
                                                                                    <th>Room No</th>
                                                                                    <th className="text-right">Action</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {(timetableByDay[day] || []).map((row, rIdx) => (
                                                                                    <tr key={row.id}>
                                                                                        <td>
                                                                                            <select
                                                                                                className="form-control"
                                                                                                value={row.subject_id}
                                                                                                onChange={(e) => handleInputChange(rIdx, 'subject_id', e.target.value)}
                                                                                                required
                                                                                            >
                                                                                                <option value="">Select</option>
                                                                                                {subjectList.map(s => <option key={s.id} value={s.id}>{s.name} {s.code && `(${s.code})`}</option>)}
                                                                                            </select>
                                                                                        </td>
                                                                                        <td>
                                                                                            <select
                                                                                                className="form-control"
                                                                                                value={row.staff_id}
                                                                                                onChange={(e) => handleInputChange(rIdx, 'staff_id', e.target.value)}
                                                                                                required
                                                                                            >
                                                                                                <option value="">Select</option>
                                                                                                {staffList.map(t => <option key={t.id} value={t.id}>{t.name} {t.surname} ({t.employee_id})</option>)}
                                                                                            </select>
                                                                                        </td>
                                                                                        <td>
                                                                                            <div className="input-group">
                                                                                                <input type="text" className="form-control" placeholder="10:00 AM" value={row.time_from} onChange={(e) => handleInputChange(rIdx, 'time_from', e.target.value)} required />
                                                                                                <div className="input-group-addon"><i className="fa fa-clock-o"></i></div>
                                                                                            </div>
                                                                                        </td>
                                                                                        <td>
                                                                                            <div className="input-group">
                                                                                                <input type="text" className="form-control" placeholder="11:00 AM" value={row.time_to} onChange={(e) => handleInputChange(rIdx, 'time_to', e.target.value)} required />
                                                                                                <div className="input-group-addon"><i className="fa fa-clock-o"></i></div>
                                                                                            </div>
                                                                                        </td>
                                                                                        <td>
                                                                                            <input type="text" className="form-control" value={row.room_no} onChange={(e) => handleInputChange(rIdx, 'room_no', e.target.value)} />
                                                                                        </td>
                                                                                        <td className="text-right">
                                                                                            <button type="button" onClick={() => handleDeleteRow(rIdx)} className="btn btn-danger btn-sm">
                                                                                                <i className="fa fa-trash"></i>
                                                                                            </button>
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                    <button type="submit" className="btn btn-primary btn-sm pull-right" style={{ marginTop: '10px' }}>
                                                                        <i className="fa fa-save"></i> Save
                                                                    </button>
                                                                </form>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default TimetableCreate;
