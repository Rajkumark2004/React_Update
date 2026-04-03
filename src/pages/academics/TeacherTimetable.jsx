import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';

const TeacherTimetable = () => {
    const navigate = useNavigate();
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [timetable, setTimetable] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [hasSearched, setHasSearched] = useState(false);
    const [staffList, setStaffList] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [fullTimetableData, setFullTimetableData] = useState(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            setFetchLoading(true);
            try {
                const data = await api.getTeacherTimetable();
                if (data.status === 'success') {
                    setStaffList(data.staff_list || []);
                    setIsAdmin(data.is_admin || false);
                    setFullTimetableData(data.timetable || {});
                } else {
                    toast.error(data.message || 'Failed to load data');
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
                toast.error('Failed to load initial data');
            } finally {
                setFetchLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!selectedTeacher) {
            toast.error('Please select a teacher');
            return;
        }
        setLoading(true);
        setHasSearched(true);
        setTimetable(null);

        try {
            const data = await api.searchTeacherTimetable(selectedTeacher);
            if (data && data.timetable) {
                setTimetable(data.timetable);
            } else {
                setTimetable(data || {});
            }
        } catch (error) {
            console.error('Error searching teacher timetable:', error);
            toast.error('Failed to fetch timetable data');
            setTimetable({});
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-mortar-board"></i> Timetable
                    </h1>
                </section>

                <section className="content" style={{ marginTop: '0px' }}>
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
                                                    {staffList.map(teacher => (
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
