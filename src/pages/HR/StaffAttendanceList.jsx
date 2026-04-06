import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const StaffAttendanceList = () => {
    const navigate = useNavigate();
    console.log('StaffAttendanceList mounted');
    const { currentSession } = useSession();
    const sessionYear = currentSession?.session || '2024-25';

    const [roleList, setRoleList] = useState([]);
    const [userTypeId, setUserTypeId] = useState('select');
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [resultlist, setResultlist] = useState(null);
    const [attendanceTypes, setAttendanceTypes] = useState([
        { id: 1, type: 'Present', key_value: 'P' },
        { id: 2, type: 'Late', key_value: 'L' },
        { id: 3, type: 'Absent', key_value: 'A' },
        { id: 4, type: 'Half Day', key_value: 'F' },
        { id: 5, type: 'Holiday', key_value: 'H' }
    ]);
    const [isHoliday, setIsHoliday] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const [isAttendanceMarked, setIsAttendanceMarked] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await api.getStaffAttendanceIndex();
                if (response && response.status === 'success' && response.rolelist) {
                    setRoleList(response.rolelist);
                }
            } catch (error) {
                console.error("Error fetching roles:", error);
            }
        };
        fetchRoles();
    }, []);

    // Filter staff list search term
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        setErrors({});
        if (userTypeId === 'select') {
            setErrors({ role: 'Role is required' });
            toast.error('Please select a role');
            return;
        }

        const selectedRole = roleList.find(r => r.id === userTypeId);
        const roleType = selectedRole ? selectedRole.type : userTypeId;

        const formattedDate = attendanceDate.replace(/-/g, '/');

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('user_id', roleType);
            formData.append('date', formattedDate);
            const response = await api.searchStaffAttendance(formData);
            if (response && response.status === 'success') {
                if (response.attendencetypeslist) {
                    setAttendanceTypes(response.attendencetypeslist.map(t => ({
                        ...t,
                        id: Number(t.id) // Ensure ID is a number for consistent comparison
                    })));
                }

                // Map result list and ensure staff_attendance_type_id is handled
                const mappedResults = (response.resultlist || []).map(staff => ({
                    ...staff,
                    staff_attendance_type_id: staff.staff_attendance_type_id ? Number(staff.staff_attendance_type_id) : null,
                    remark: staff.remark || ''
                }));

                setResultlist(mappedResults);
                setSearchPerformed(true);

                // Check if any staff member has attendance already marked
                const attendanceMarked = (response.resultlist || []).some(staff => staff.staff_attendance_type_id !== null && staff.staff_attendance_type_id !== undefined);
                setIsAttendanceMarked(attendanceMarked);
            } else {
                toast.error(response?.message || 'Failed to fetch attendance');
            }
        } catch (error) {
            console.error('Error searching staff attendance:', error);
            toast.error('An error occurred while fetching attendance');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsHoliday = () => {
        const newVal = !isHoliday;
        if (newVal) {
            if (window.confirm('Are you sure you want to mark as holiday?')) {
                setIsHoliday(true);
            }
        } else {
            setIsHoliday(false);
        }
    };

    const handleAttendanceChange = (staffId, typeId) => {
        if (isHoliday) return;
        setResultlist(prev => prev.map(staff =>
            staff.staff_id === staffId ? { ...staff, staff_attendance_type_id: typeId } : staff
        ));
    };

    const handleRemarkChange = (staffId, remark) => {
        setResultlist(prev => prev.map(staff =>
            staff.staff_id === staffId ? { ...staff, remark: remark } : staff
        ));
    };

    const handleSaveAttendance = async (e) => {
        e.preventDefault();
        setLoading(true);

        const selectedRole = roleList.find(r => r.id === userTypeId);
        const roleType = selectedRole ? selectedRole.type : userTypeId;

        const formattedDate = attendanceDate.replace(/-/g, '/');

        try {
            const formData = new FormData();
            formData.append('search', 'saveattendence');
            formData.append('user_id', roleType);
            formData.append('date', formattedDate);

            resultlist.forEach(staff => {
                const sId = staff.staff_id;
                formData.append('student_session[]', sId); // Use [] for array field

                // If isHoliday is true, all should be set to Holiday type ID (usually 5)
                // Otherwise use the selected staff_attendance_type_id or default to 1 (Present)
                const attendanceType = isHoliday ? 5 : (staff.staff_attendance_type_id || 1);

                formData.append(`attendencetype${sId}`, attendanceType.toString());
                formData.append(`remark${sId}`, staff.remark || '');
            });

            const response = await api.searchStaffAttendance(formData);
            if (response && response.status === 'success') {
                toast.success('Attendance saved successfully');
            } else {
                toast.error(response?.message || 'Failed to save attendance');
            }
        } catch (error) {
            console.error('Error saving attendance:', error);
            toast.error('An error occurred while saving attendance');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                .radio { padding-left: 20px; }
                .radio label { display: inline-block; vertical-align: middle; position: relative; padding-left: 5px; cursor: pointer; }
                .radio label::before { content: ""; display: inline-block; position: absolute; width: 17px; height: 17px; left: 0; margin-left: -20px; border: 1px solid #cccccc; border-radius: 50%; background-color: #fff; transition: border 0.15s ease-in-out; }
                .radio label::after { display: inline-block; position: absolute; content: " "; width: 11px; height: 11px; left: 3px; top: 3px; margin-left: -20px; border-radius: 50%; background-color: #555555; transform: scale(0, 0); transition: transform 0.1s cubic-bezier(0.8, -0.33, 0.2, 1.33); }
                .radio input[type="radio"] { opacity: 0; z-index: 1; margin: 0; position: absolute; width: 17px; height: 17px; left: 0; cursor: pointer; }
                .radio input[type="radio"]:checked + label::after { transform: scale(1, 1); }
                .radio-info input[type="radio"]:checked + label::before { border-color: #5bc0de; }
                .radio-info input[type="radio"]:checked + label::after { background-color: #5bc0de; }
                .radio.radio-inline { margin-top: 0; display: inline-block; margin-right: 15px; }
                @media (max-width:767px){ .radio.radio-inline { display: block; margin-bottom: 10px; } }
                .button-checkbox button { min-width: 140px; }
                .req { color: red; margin-left: 2px; }
            `}} />
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content-header">
                    <h1><i className="fa fa-sitemap"></i> Human Resource</h1>
                </section>
                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title"><i className="fa fa-search"></i> Select Criteria</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <form id="form1" onSubmit={handleSearch}>
                                    <div className="box-body">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>Role</label><span className="req"> *</span>
                                                    <select
                                                        autoFocus
                                                        className="form-control"
                                                        value={userTypeId}
                                                        onChange={(e) => {
                                                            setUserTypeId(e.target.value);
                                                            if (e.target.value !== 'select') setErrors({});
                                                        }}
                                                    >
                                                        <option value="select">Select</option>
                                                        {roleList.map((role) => (
                                                            <option key={role.id} value={role.id}>{role.type}</option>
                                                        ))}
                                                    </select>
                                                    {errors.role && <span className="text-danger" style={{ fontSize: '11px', display: 'block', marginTop: '2px' }}>{errors.role}</span>}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>Attendance Date</label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        value={attendanceDate}
                                                        onChange={(e) => setAttendanceDate(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <button type="submit" className="btn btn-primary btn-sm pull-right">
                                                    <i className="fa fa-search"></i> Search
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>

                                {searchPerformed && resultlist && (
                                    <>
                                        <div className="box-header ptbnull"></div>
                                        <div className="box-header with-border">
                                            <h3 className="box-title"><i className="fa fa-users"></i> Staff List</h3>
                                        </div>
                                        <div className="box-body">
                                            {isAttendanceMarked && (
                                                <div className="alert alert-success alert-dismissible">
                                                    Staff attendance is already marked. You can update it.
                                                </div>
                                            )}
                                            <form onSubmit={handleSaveAttendance}>
                                                <div className="mailbox-controls">
                                                    <span className="button-checkbox">
                                                        <button
                                                            type="button"
                                                            className={`btn btn-sm ${isHoliday ? 'btn-primary active' : 'btn-primary'}`}
                                                            onClick={handleMarkAsHoliday}
                                                        >
                                                            <i className={`fa ${isHoliday ? 'fa-check-square-o' : 'fa-square-o'}`}></i> Mark As Holiday
                                                        </button>
                                                    </span>
                                                    <div className="pull-right">
                                                        <button
                                                            type="submit"
                                                            className="btn btn-primary btn-sm"
                                                            disabled={loading}
                                                        >
                                                            {loading ? <i className="fa fa-spinner fa-spin"></i> : <i className="fa fa-save"></i>} Save Attendance
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="table-responsive" style={{ marginTop: '15px' }}>
                                                    <table className="table table-hover table-striped">
                                                        <thead>
                                                            <tr>
                                                                <th>#</th>
                                                                <th>Staff ID</th>
                                                                <th>Name</th>
                                                                <th>Role</th>
                                                                <th>Attendance</th>
                                                                <th className="text-right">Note</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {resultlist.length === 0 ? (
                                                                <tr>
                                                                    <td colSpan="6" className="text-center">No Record Found</td>
                                                                </tr>
                                                            ) : (
                                                                resultlist.map((staff, index) => (
                                                                    <tr key={staff.staff_id}>
                                                                        <td>{index + 1}</td>
                                                                        <td>{staff.employee_id}</td>
                                                                        <td>{staff.name} {staff.surname}</td>
                                                                        <td>{staff.user_type}</td>
                                                                        <td>
                                                                            {attendanceTypes.filter(t => t.key_value !== 'H').map((type, tIdx) => (
                                                                                <div key={tIdx} className="radio radio-info radio-inline">
                                                                                    <input
                                                                                        type="radio"
                                                                                        id={`att-${staff.staff_id}-${type.id}`}
                                                                                        name={`attendance-${staff.staff_id}`}
                                                                                        value={type.id}
                                                                                        checked={isHoliday ? false : (staff.staff_attendance_type_id === type.id || (!staff.staff_attendance_type_id && type.id === 1))}
                                                                                        disabled={isHoliday}
                                                                                        onChange={() => handleAttendanceChange(staff.staff_id, type.id)}
                                                                                    />
                                                                                    <label htmlFor={`att-${staff.staff_id}-${type.id}`}>
                                                                                        {type.type}
                                                                                    </label>
                                                                                </div>
                                                                            ))}
                                                                        </td>
                                                                        <td className="text-right">
                                                                            <input
                                                                                type="text"
                                                                                className="form-control input-sm"
                                                                                value={staff.remark}
                                                                                onChange={(e) => handleRemarkChange(staff.staff_id, e.target.value)}
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </form>
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

export default StaffAttendanceList;
