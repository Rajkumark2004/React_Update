import React, { useState, useEffect } from 'react';
import '../../utils/include_files';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';

const TeacherTimetable = () => {
    const navigate = useNavigate();
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [timetable, setTimetable] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const teachers = [
        { id: 1, name: 'Jason Sharlton', surname: '', employee_id: '90000234' },
        { id: 2, name: 'Jane', surname: 'Doe', employee_id: '90000123' }
    ];

    // Mock Timetables
    const timetables = {
        1: {
            'Monday': [
                { subject_name: 'Mathematics', subject_code: 'M101', class: 'Class 1', section: 'A', time_from: '09:00 AM', time_to: '10:00 AM', room_no: '101' },
                { subject_name: 'Science', subject_code: 'S101', class: 'Class 2', section: 'B', time_from: '10:00 AM', time_to: '11:00 AM', room_no: '102' }
            ],
            'Tuesday': [
                { subject_name: 'English', subject_code: 'E101', class: 'Class 1', section: 'A', time_from: '09:00 AM', time_to: '10:00 AM', room_no: '101' }
            ],
            'Wednesday': [],
            'Thursday': [
                { subject_name: 'History', subject_code: 'H101', class: 'Class 3', section: 'C', time_from: '11:00 AM', time_to: '12:00 PM', room_no: '104' }
            ],
            'Friday': [
                { subject_name: 'Geography', subject_code: 'G101', class: 'Class 4', section: 'A', time_from: '09:00 AM', time_to: '10:00 AM', room_no: '101' }
            ],
            'Saturday': [],
            'Sunday': []
        },
        2: {
            'Monday': [
                { subject_name: 'English', subject_code: 'E101', class: 'Class 2', section: 'B', time_from: '09:00 AM', time_to: '10:00 AM', room_no: '105' }
            ],
            'Tuesday': [],
            'Wednesday': [
                { subject_name: 'Arts', subject_code: 'A101', class: 'Class 1', section: 'A', time_from: '01:00 PM', time_to: '02:00 PM', room_no: 'Hall' }
            ],
            'Thursday': [],
            'Friday': [],
            'Saturday': [],
            'Sunday': []
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setLoading(true);
        setHasSearched(true);
        setTimetable(null);

        // Simulate Network Delay
        setTimeout(() => {
            if (selectedTeacher && timetables[selectedTeacher]) {
                setTimetable(timetables[selectedTeacher]);
            } else {
                setTimetable({}); // Empty if no data
            }
            setLoading(false);
        }, 500);
    };

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ minHeight: '676px' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-mortar-board"></i> Timetable
                    </h1>
                </section>

                <section className="content" style={{ marginTop: '18px' }}>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">
                                        <i className="fa fa-search"></i> Teacher Time Table
                                    </h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => window.history.back()} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                    <div className="box-tools pull-right"></div>
                                </div>

                                <div className="box-body">
                                    <form onSubmit={handleSearch} className="row">
                                        <div className="col-lg-4 col-md-4 col-sm-4">
                                            <div className="form-group">
                                                <label htmlFor="teacher">Teachers<small className="req"> *</small></label>
                                                <select
                                                    className="form-control"
                                                    name="teacher"
                                                    id="teacher"
                                                    value={selectedTeacher}
                                                    onChange={(e) => setSelectedTeacher(e.target.value)}
                                                >
                                                    <option value="">Select</option>
                                                    {teachers.map(teacher => (
                                                        <option key={teacher.id} value={teacher.id}>
                                                            {teacher.name} {teacher.surname} ({teacher.employee_id})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-4 col-sm-4">
                                            <div className="form-group">
                                                <label className="dhide" style={{ display: 'block', visibility: 'hidden' }}>Teacher</label>
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary btn-sm smallbtn28"
                                                    disabled={loading}
                                                >
                                                    {loading ? <><i className="fa fa-spinner fa-spin"></i> Please Wait</> : 'Search'}
                                                </button>
                                            </div>
                                        </div>
                                    </form>

                                    <div className="timetable_data table-responsive clearboth">
                                        {hasSearched && !loading && (
                                            timetable && Object.keys(timetable).length > 0 ? (
                                                <table className="table table-stripped">
                                                    <thead>
                                                        <tr>
                                                            {Object.keys(timetable).map((day) => (
                                                                <th key={day} className="text text-center" style={{ textTransform: 'capitalize' }}>
                                                                    {day}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            {Object.keys(timetable).map((day) => {
                                                                const dayData = timetable[day];
                                                                return (
                                                                    <td key={day} className="text text-center">
                                                                        {!dayData || dayData.length === 0 ? (
                                                                            <div className="attachment-block clearfix">
                                                                                <b className="text text-center">
                                                                                    <i className="fa fa-times-circle text-danger" style={{ marginRight: '5px' }}></i>
                                                                                    Not Scheduled
                                                                                </b><br />
                                                                            </div>
                                                                        ) : (
                                                                            dayData.map((item, index) => (
                                                                                <div key={index} className="attachment-block clearfix">
                                                                                    <div style={{ marginTop: '5px' }}>
                                                                                        <i className="fa fa-book" style={{ marginRight: '5px', color: '#00a65a' }}></i>
                                                                                        <b className="text-green">Subject: {item.subject_name}
                                                                                            {item.subject_code && ` (${item.subject_code})`}
                                                                                        </b>
                                                                                    </div>

                                                                                    <div style={{ marginTop: '5px' }}>
                                                                                        <i className="fa fa-list-alt" style={{ marginRight: '5px', color: '#00a65a' }}></i>
                                                                                        <strong className="text-green">Class: {item.class} ({item.section})</strong>
                                                                                    </div>

                                                                                    <div style={{ marginTop: '5px' }}>
                                                                                        <i className="fa fa-clock-o" style={{ marginRight: '5px', color: '#00a65a' }}></i>
                                                                                        <strong className="text-green">{item.time_from}</strong>
                                                                                        <b className="text text-center"> - </b>
                                                                                        <strong className="text-green">{item.time_to}</strong>
                                                                                    </div>

                                                                                    <div style={{ marginTop: '5px' }}>
                                                                                        <i className="fa fa-building" style={{ marginRight: '5px', color: '#00a65a' }}></i>
                                                                                        <strong className="text-green">Room No: {item.room_no}</strong>
                                                                                    </div>
                                                                                </div>
                                                                            ))
                                                                        )}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <div className="alert alert-info">
                                                    No Record Found
                                                </div>
                                            )
                                        )}
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
export default TeacherTimetable;
