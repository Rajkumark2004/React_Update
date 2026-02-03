import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';

import TimetableAddRow from './TimetableAddRow';

import { Link } from 'react-router-dom';

const TimetableCreate = () => {
    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [subjectGroupList, setSubjectGroupList] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedSubjectGroup, setSelectedSubjectGroup] = useState('');
    const [showTimetableGenerator, setShowTimetableGenerator] = useState(false);
    const [loading, setLoading] = useState(false);

    // Quick Generation Fields
    const [startTime, setStartTime] = useState('');
    const [duration, setDuration] = useState('');
    const [interval, setInterval] = useState('0');
    const [roomNo, setRoomNo] = useState('');

    // Tab Logic
    const [activeTab, setActiveTab] = useState(0);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const [staffList, setStaffList] = useState([]);
    const [subjectList, setSubjectList] = useState([]);
    const [timetableByDay, setTimetableByDay] = useState({});

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const data = await api.getClassReportPreData();
            if (data && data.status === 'success') {
                setClassList(data.classlist || []);
            }
        } catch (error) {
            console.error('Error fetching class data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClassChange = async (classId) => {
        setSelectedClass(classId);
        setSelectedSection('');
        setSectionList([]);
        if (!classId) return;

        try {
            const data = await api.getSectionsByClass(classId);
            if (data && data.status && Array.isArray(data.data)) {
                setSectionList(data.data);
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
        }
    };

    const handleSectionChange = (sectionId) => {
        setSelectedSection(sectionId);
        // In a real app, this would fetch subject groups
        setSubjectGroupList([
            { id: '1', name: 'Subject Group 1' },
            { id: '2', name: 'Subject Group 2' }
        ]);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (selectedClass && selectedSection && selectedSubjectGroup) {
            setShowTimetableGenerator(true);
            // Mock staff and subjects for the dynamic rows
            setStaffList([
                { id: '1', name: 'John Doe', surname: '(E01)', employee_id: '101' },
                { id: '2', name: 'Jane Smith', surname: '(E02)', employee_id: '102' }
            ]);
            setSubjectList([
                { id: '1', name: 'Mathematics', code: 'MATH-101' },
                { id: '2', name: 'Science', code: 'SCI-102' }
            ]);
            // Initialize empty timetable for each day if needed
        }
    };

    const handleSaveTimetable = (data) => {
        console.log('Saving timetable for day:', data.day, data);
        // This would call the save API
        setTimetableByDay(prev => ({
            ...prev,
            [data.day]: data.rows
        }));
    };

    const applyQuickGeneration = (e) => {
        e.preventDefault();
        // This would apply the time generation to the active tab's rows
        // For now, it's a UI placeholder as API/Complex state management is deferred
        if (!startTime || !duration) return;

        const currentDay = days[activeTab];
        setTimetableByDay(prev => {
            const currentEntries = prev[currentDay] || [];
            let currentTime = startTime;
            const updatedEntries = currentEntries.map(row => {
                const [hours, minutes] = currentTime.split(':');
                const date = new Date();
                date.setHours(parseInt(hours));
                date.setMinutes(parseInt(minutes));

                const fromTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

                date.setMinutes(date.getMinutes() + parseInt(duration));
                const toTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

                currentTime = date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');

                // Add interval for next
                date.setMinutes(date.getMinutes() + parseInt(interval));
                currentTime = date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');

                return { ...row, timeFrom: fromTime, timeTo: toTime, roomNo: roomNo };
            });
            return { ...prev, [currentDay]: updatedEntries };
        });
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content">
                    <div className="row">
                        <div className="col-md-2">
                            <div className="box border0">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Academics</h3>
                                </div>
                                <ul className="tablists">
                                    <li>
                                        <Link to="/admin/timetable/classreport"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/academic/1.png" alt="icon1" className="img-fluid" style={{ width: '20px' }} /> Class Timetable</Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/timetable/mytimetable"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/academic/2.png" alt="icon2" className="img-fluid" style={{ width: '20px' }} /> Teachers Timetable</Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/teacher/assign_class_teacher"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/academic/3.png" alt="icon3" className="img-fluid" style={{ width: '20px' }} /> Assign Class Teacher</Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/stdtransfer"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/academic/4.png" alt="icon4" className="img-fluid" style={{ width: '20px' }} /> Promote Students</Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/subjectgroup"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/academic/5.png" alt="icon5" className="img-fluid" style={{ width: '20px' }} /> Subject Group</Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/subject"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/academic/6.png" alt="icon6" className="img-fluid" style={{ width: '20px' }} /> Subjects</Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/classes"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/academic/7.png" alt="icon7" className="img-fluid" style={{ width: '20px' }} /> Class</Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/section"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/academic/8.png" alt="icon7" className="img-fluid" style={{ width: '20px' }} /> Sections</Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/teacher/assign_subject_teacher"><img src="https://newlayout.wisibles.com/backend/images/sidebar/submenu/academic/9.png" alt="icon7" className="img-fluid" style={{ width: '20px' }} /> Assign Subject Teacher</Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-md-10">
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
                                                        {classList.map(cls => (
                                                            <option key={cls.id} value={cls.id}>{cls.class}</option>
                                                        ))}
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
                                                        {sectionList.map(sec => (
                                                            <option key={sec.section_id} value={sec.section_id}>{sec.section}</option>
                                                        ))}
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
                                                        {subjectGroupList.map(group => (
                                                            <option key={group.id} value={group.id}>{group.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <button type="submit" className="btn btn-primary pull-right btn-sm">Search</button>
                                    </div>
                                </form>

                                {showTimetableGenerator && (
                                    <>
                                        <div className="box-header with-border">
                                            <h3 className="box-title"><i className="fa fa-search"></i> Select Parameter to Generate Time Table Quickly</h3>
                                        </div>
                                        <div className="box-body">
                                            <form onSubmit={applyQuickGeneration}>
                                                <div className="row">
                                                    <div className="col-sm-3">
                                                        <div className="form-group">
                                                            <label>Period Start Time<small className="req"> *</small></label>
                                                            <div className="input-group">
                                                                <input
                                                                    type="time"
                                                                    className="form-control"
                                                                    value={startTime}
                                                                    onChange={(e) => setStartTime(e.target.value)}
                                                                />
                                                                <div className="input-group-addon"><i className="fa fa-clock-o"></i></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-2">
                                                        <div className="form-group">
                                                            <label>Duration (min)<small className="req"> *</small></label>
                                                            <div className="input-group">
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    value={duration}
                                                                    onChange={(e) => setDuration(e.target.value)}
                                                                />
                                                                <div className="input-group-addon"><i className="fa fa-hourglass-start"></i></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-2">
                                                        <div className="form-group">
                                                            <label>Interval (min)<small className="req"> *</small></label>
                                                            <div className="input-group">
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    value={interval}
                                                                    onChange={(e) => setInterval(e.target.value)}
                                                                />
                                                                <div className="input-group-addon"><i className="fa fa-hourglass-start"></i></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-3">
                                                        <div className="form-group">
                                                            <label>Room No</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={roomNo}
                                                                onChange={(e) => setRoomNo(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-2">
                                                        <div className="form-group">
                                                            <label className="displayblock">&nbsp;</label>
                                                            <button type="submit" className="btn btn-primary btn-sm btn-block">Apply</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>

                                        <div className="nav-tabs-custom">
                                            <ul className="nav nav-tabs">
                                                {days.map((day, index) => (
                                                    <li key={day} className={activeTab === index ? 'active' : ''}>
                                                        <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab(index); }}>{day}</a>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="tab-content" style={{ padding: '15px' }}>
                                                {days.map((day, index) => (
                                                    <div key={day} className={`tab-pane ${activeTab === index ? 'active' : ''}`}>
                                                        <TimetableAddRow
                                                            day={day}
                                                            classId={selectedClass}
                                                            sectionId={selectedSection}
                                                            subjectGroupId={selectedSubjectGroup}
                                                            subjects={subjectList}
                                                            staffs={staffList}
                                                            initialRecords={timetableByDay[day] || []}
                                                            onSave={handleSaveTimetable}
                                                        />
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
