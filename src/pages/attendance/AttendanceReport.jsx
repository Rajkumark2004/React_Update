import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';
import AttendanceSidebar from '../../components/AttendanceSidebar';
import { api } from '../../services/api';
import '../../utils/include_files';

const AttendanceReport = () => {
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [studentList, setStudentList] = useState([]);
    const [formData, setFormData] = useState({
        class_id: '',
        section_id: '',
        date: new Date().toLocaleDateString('en-GB') // Default to current date DD/MM/YYYY
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    // Helper map for attendance badges based on PHP file styles
    const getAttendanceBadge = (typeId) => {
        // IDs: 1:Present, 2:Late, 3:Absent, 4:Half Day, 5:Holiday, 6:Half Day? (checking PHP logic)
        // PHP Logic:
        // 1 -> success (Present)
        // 3 -> warning (Absent in PHP logic? Wait, PHP says: 3 -> label-warning. Let's verify text)
        // 2 -> primary (Late in PHP?)
        // 6 -> info (Half Day?)
        // 5 -> default (Holiday?)
        // else -> danger

        // Standard mapping from StudentAttendance to be safe, but taking colors from PHP report:
        // Type ID 1 (Present) -> label-success
        // Type ID 3 (Absent) -> label-warning (In PHP code it shows warning for id 3, usually Absent is danger. Let's double check PHP)
        /* 
           PHP Code:
           if ($type['id'] == "1") -> label-success
           elseif ($type['id'] == "3") -> label-warning
           elseif ($type['id'] == "2") -> label-primary
           elseif ($type['id'] == "6") -> label-info
           elseif ($type['id'] == "5") -> label-default
           else -> label-danger
        */

        switch (parseInt(typeId)) {
            case 1: return { label: 'Present', className: 'label label-success' };
            case 2: return { label: 'Late', className: 'label label-primary' };
            case 3: return { label: 'Absent', className: 'label label-warning' };
            case 4: return { label: 'Half Day', className: 'label label-info' }; // Assuming 4 or 6 is Half Day. PHP uses 6 for info.
            case 5: return { label: 'Holiday', className: 'label label-default' };
            case 6: return { label: 'Half Day', className: 'label label-info' };
            default: return { label: 'Unspecified', className: 'label label-danger' };
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await api.getClasses();
            if (response && (response.classsectionlist || response.data)) {
                const classesData = response.classsectionlist || response.data || [];
                if (Array.isArray(classesData)) {
                    setClassList([...classesData].reverse());
                } else {
                    setClassList([]);
                }
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
        } finally {
            setInitialLoading(false);
        }
    };

    const handleClassChange = async (e) => {
        const classId = e.target.value;
        setFormData(prev => ({ ...prev, class_id: classId, section_id: '' }));
        setSectionList([]);

        if (classId) {
            try {
                const response = await api.getSectionsByClass(classId);
                if (response && response.status === 'success' && response.data) {
                    setSectionList(response.data);
                } else if (Array.isArray(response)) {
                    setSectionList(response);
                } else if (response && response.sections) {
                    setSectionList(response.sections);
                } else {
                    setSectionList(response.data || []);
                }
            } catch (error) {
                console.error('Error fetching sections:', error);
            }
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setStudentList([]);

        if (!formData.class_id || !formData.section_id || !formData.date) {
            setMessage({ type: 'error', text: 'Class, Section and Date are required' });
            return;
        }

        setLoading(true);
        try {
            // Ensure date is in DD-MM-YYYY format for the API
            const formattedDate = formData.date.replace(/\//g, '-');
            const data = await api.searchAttendance(formData.class_id, formData.section_id, formattedDate);

            if (data.status && data.students) {
                setStudentList(data.students);
            } else {
                setMessage({ type: 'error', text: data.message || 'Attendance not submitted for this class' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Search failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="wrapper theme-white-skin">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '946px' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-calendar-check-o"></i> Attendance <small>by date</small>
                    </h1>
                </section>
                <section className="content">
                    {initialLoading ? (
                        <Loader />
                    ) : (
                        <div className="row">
                            <div className="col-md-12">
                                <div className="box box-primary">
                                    <div className="box-header with-border">
                                        <h3 className="box-title"><i className="fa fa-search"></i> Select Criteria</h3>
                                        <div className="btn-group pull-right">
                                            <button onClick={() => window.history.back()} className="btn btn-primary btn-xs">
                                                <i className="fa fa-arrow-left"></i> Back
                                            </button>
                                        </div>
                                    </div>
                                    <form onSubmit={handleSearch}>
                                        <div className="box-body">
                                            <div className="row">
                                                {message.text && (
                                                    <div className={`col-md-12 alert alert-${message.type === 'error' ? 'danger' : 'success'}`}>
                                                        {message.text}
                                                    </div>
                                                )}
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label>Class <small className="req"> *</small></label>
                                                        <select
                                                            className="form-control"
                                                            value={formData.class_id}
                                                            onChange={handleClassChange}
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
                                                        <label>Section <small className="req"> *</small></label>
                                                        <select
                                                            className="form-control"
                                                            value={formData.section_id}
                                                            onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
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
                                                        <label>Attendance Date</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={formData.date}
                                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                            placeholder="DD/MM/YYYY"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="form-group">
                                                        <button type="submit" className="btn btn-primary btn-sm pull-right checkbox-toggle">
                                                            <i className="fa fa-search"></i> Search
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </form>

                                    {studentList.length > 0 && (
                                        <div className="">
                                            <div className="box-header ptbnull"></div>
                                            <div className="box-header with-border">
                                                <h3 className="box-title"><i className="fa fa-users"></i> Attendance List</h3>
                                            </div>
                                            <div className="box-body">
                                                <div className="mailbox-controls">
                                                    <div className="pull-right"></div>
                                                </div>
                                                <div className="download_label">Attendance List</div>
                                                <div className="table-responsive">
                                                    <table className="table table-hover table-striped example">
                                                        <thead>
                                                            <tr>
                                                                <th>#</th>
                                                                <th>Admission No</th>
                                                                <th>Roll Number</th>
                                                                <th>Name</th>
                                                                <th>Attendance</th>
                                                                <th>Note</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {studentList.map((student, index) => {
                                                                const badge = getAttendanceBadge(student.attendence_type_id);
                                                                return (
                                                                    <tr key={index}>
                                                                        <td>{index + 1}</td>
                                                                        <td>{student.admission_no}</td>
                                                                        <td>{student.roll_no}</td>
                                                                        <td>{student.firstname} {student.lastname}</td>
                                                                        <td>
                                                                            <small className={badge.className}>
                                                                                {badge.label}
                                                                            </small>
                                                                        </td>
                                                                        <td>{student.remark}</td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default AttendanceReport;
