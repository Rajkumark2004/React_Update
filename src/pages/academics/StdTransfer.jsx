import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import '../../utils/include_files';

const StdTransfer = () => {
    const navigate = useNavigate();

    // Form States
    const [classId, setClassId] = useState('');
    const [sectionId, setSectionId] = useState('');
    const [sessionId, setSessionId] = useState('');
    const [promoteClassId, setPromoteClassId] = useState('');
    const [promoteSectionId, setPromoteSectionId] = useState('');

    // Data States
    const [sectionOptions, setSectionOptions] = useState([]);
    const [promoteSectionOptions, setPromoteSectionOptions] = useState([]);
    const [studentList, setStudentList] = useState([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [studentResults, setStudentResults] = useState({});
    const [studentNextSessionStatus, setStudentNextSessionStatus] = useState({});
    const [classList, setClassList] = useState([]);
    const [sessionList, setSessionList] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Fetch Initial Data
    useEffect(() => {
        const fetchPreData = async () => {
            setLoading(true);
            try {
                const data = await api.getStdTransferPreData();
                if (data && data.status === 'success') {
                    setClassList(data.classlist || []);
                    setSessionList(data.sessionlist || []);
                }
            } catch (error) {
                console.error('Error fetching pre-data:', error);
                toast.error('Failed to load initial data');
            } finally {
                setLoading(false);
            }
        };
        fetchPreData();
    }, []);

    // Dynamic Section Fetching
    useEffect(() => {
        const fetchSections = async () => {
            if (classId) {
                try {
                    const data = await api.getSectionsByClass(classId);
                    // Handle both success object and direct array (if applicable)
                    const sectionsArray = data.data || data.sections || (Array.isArray(data) ? data : []);
                    setSectionOptions(sectionsArray);
                } catch (error) {
                    console.error('Error fetching sections:', error);
                    toast.error('Failed to load sections');
                }
            } else {
                setSectionOptions([]);
            }
        };
        fetchSections();
    }, [classId]);

    useEffect(() => {
        const fetchPromoteSections = async () => {
            if (promoteClassId) {
                try {
                    const data = await api.getSectionsByClass(promoteClassId);
                    // Handle both success object and direct array (if applicable)
                    const sectionsArray = data.data || data.sections || (Array.isArray(data) ? data : []);
                    setPromoteSectionOptions(sectionsArray);
                } catch (error) {
                    console.error('Error fetching promote sections:', error);
                    toast.error('Failed to load promote sections');
                }
            } else {
                setPromoteSectionOptions([]);
            }
        };
        fetchPromoteSections();
    }, [promoteClassId]);

    // Handlers
    const handleSearch = async (e) => {
        e.preventDefault();
        if (classId && sectionId && sessionId && promoteClassId && promoteSectionId) {
            setIsSearching(true);
            try {
                const payload = {
                    class_id: classId,
                    section_id: sectionId,
                    class_promote_id: promoteClassId,
                    section_promote_id: promoteSectionId,
                    session_id: sessionId
                };
                const data = await api.searchStdTransferStudents(payload);
                if (data && data.status === 'success') {
                    const students = data.resultlist || [];
                    setStudentList(students);

                    // Initialize results and next working status
                    const results = {};
                    const nextWorking = {};
                    students.forEach(s => {
                        results[s.student_session_id] = 'pass';
                        nextWorking[s.student_session_id] = 'continue';
                    });
                    setStudentResults(results);
                    setStudentNextSessionStatus(nextWorking);

                    if (students.length === 0) {
                        toast.error('No students found for the selected criteria');
                    }
                }
            } catch (error) {
                console.error('Error searching students:', error);
                toast.error(error.message || 'Failed to search students');
            } finally {
                setIsSearching(false);
            }
        } else {
            toast.error('Please select all required fields.');
        }
    };

    const handleSelectAll = (e) => {
        const checked = e.target.checked;
        if (checked) {
            setSelectedStudentIds(studentList.map(s => s.student_session_id));
        } else {
            setSelectedStudentIds([]);
        }
    };

    const handleStudentSelect = (studentSessionId) => {
        setSelectedStudentIds(prev =>
            prev.includes(studentSessionId)
                ? prev.filter(id => id !== studentSessionId)
                : [...prev, studentSessionId]
        );
    };

    const handleResultChange = (studentSessionId, value) => {
        setStudentResults(prev => ({ ...prev, [studentSessionId]: value }));
    };

    const handleNextWorkingChange = (studentSessionId, value) => {
        setStudentNextSessionStatus(prev => ({ ...prev, [studentSessionId]: value }));
    };

    const handleSave = async () => {
        if (selectedStudentIds.length === 0) {
            toast.error('Please select at least one student to promote');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                session_id: sessionId,
                class_promote_id: promoteClassId,
                section_promote_id: promoteSectionId,
                class_post: classId,
                section_post: sectionId,
                student_list: selectedStudentIds
            };

            // Add dynamic fields for results and next working status
            selectedStudentIds.forEach(id => {
                payload[`result_${id}`] = studentResults[id];
                payload[`next_working_${id}`] = studentNextSessionStatus[id];
            });

            const response = await api.promoteStudents(payload);
            if (response.status === 'success') {
                toast.success('Students are successfully promoted');
                setShowModal(false);
                // Refresh list or move to next
                handleSearch({ preventDefault: () => { } });
            }
        } catch (error) {
            console.error('Error promoting students:', error);
            toast.error(error.message || 'Failed to promote students');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ minHeight: '676px' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-user-plus"></i> Student Information <small>Student Fees1</small>
                    </h1>
                </section>

                <section className="content" style={{ marginTop: '0px' }}>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title">
                                        <i className="fa fa-search"></i> Select Criteria
                                    </h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => window.history.back()} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>

                                <form id="form1" onSubmit={handleSearch}>
                                    <div className="box-body">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>Class</label><small className="req"> *</small>
                                                    <select
                                                        className="form-control"
                                                        value={classId}
                                                        onChange={(e) => setClassId(e.target.value)}
                                                        autoFocus
                                                    >
                                                        <option value="">Select</option>
                                                        {classList.map(c => <option key={c.id} value={c.id}>{c.class}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label>Section</label><small className="req"> *</small>
                                                    <select
                                                        className="form-control"
                                                        value={sectionId}
                                                        onChange={(e) => setSectionId(e.target.value)}
                                                    >
                                                        <option value="">Select</option>
                                                        {sectionOptions.map(s => <option key={s.id} value={s.section_id}>{s.section}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <h4>Promote Students In Next Session</h4>
                                        <div className="row">
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>Promote In Session</label><small className="req"> *</small>
                                                    <select
                                                        className="form-control"
                                                        value={sessionId}
                                                        onChange={(e) => setSessionId(e.target.value)}
                                                    >
                                                        <option value="">Select</option>
                                                        {sessionList.map(s => <option key={s.id} value={s.id}>{s.session}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>Class</label><small className="req"> *</small>
                                                    <select
                                                        className="form-control"
                                                        value={promoteClassId}
                                                        onChange={(e) => setPromoteClassId(e.target.value)}
                                                    >
                                                        <option value="">Select</option>
                                                        {classList.map(c => <option key={c.id} value={c.id}>{c.class}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>Section</label><small className="req"> *</small>
                                                    <select
                                                        className="form-control"
                                                        value={promoteSectionId}
                                                        onChange={(e) => setPromoteSectionId(e.target.value)}
                                                    >
                                                        <option value="">Select</option>
                                                        {promoteSectionOptions.map(s => <option key={s.id} value={s.section_id}>{s.section}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="box-footer">
                                        <button type="submit" className="btn btn-primary btn-sm pull-right">Search</button>
                                    </div>
                                </form>

                                {studentList.length > 0 && (
                                    <>
                                        <div className="box-header ptbnull">
                                            <h3 className="box-title">
                                                <i className="fa fa-list"></i> Student List
                                            </h3>
                                        </div>
                                        <div className="box-body">
                                            <div className="table-responsive">
                                                <table className="table table-striped">
                                                    <tbody>
                                                        <tr>
                                                            <th>
                                                                <input
                                                                    type="checkbox"
                                                                    className="checkbox"
                                                                    id="select_all"
                                                                    onChange={handleSelectAll}
                                                                    checked={selectedStudentIds.length === studentList.length && studentList.length > 0}
                                                                /> All
                                                            </th>
                                                            <th>Admission No</th>
                                                            <th>Student Name</th>
                                                            <th>Father Name</th>
                                                            <th>Date of Birth</th>
                                                            <th>Current Result</th>
                                                            <th>Next Session Status</th>
                                                        </tr>
                                                        {studentList.map(student => (
                                                            <tr key={student.student_session_id}>
                                                                <td>
                                                                    <input
                                                                        type="checkbox"
                                                                        className="checkbox student-checkbox"
                                                                        value={student.student_session_id}
                                                                        checked={selectedStudentIds.includes(student.student_session_id)}
                                                                        onChange={() => handleStudentSelect(student.student_session_id)}
                                                                    />
                                                                </td>
                                                                <td>{student.admission_no}</td>
                                                                <td>{student.firstname} {student.lastname}</td>
                                                                <td>{student.father_name}</td>
                                                                <td>{student.dob}</td>
                                                                <td>
                                                                    <div className="radio-inline">
                                                                        <label>
                                                                            <input
                                                                                type="radio"
                                                                                name={`result_${student.student_session_id}`}
                                                                                value="pass"
                                                                                checked={studentResults[student.student_session_id] === 'pass'}
                                                                                onChange={(e) => handleResultChange(student.student_session_id, e.target.value)}
                                                                            /> Pass
                                                                        </label>
                                                                    </div>
                                                                    <div className="radio-inline">
                                                                        <label>
                                                                            <input
                                                                                type="radio"
                                                                                name={`result_${student.student_session_id}`}
                                                                                value="fail"
                                                                                checked={studentResults[student.student_session_id] === 'fail'}
                                                                                onChange={(e) => handleResultChange(student.student_session_id, e.target.value)}
                                                                            /> Fail
                                                                        </label>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="radio-inline">
                                                                        <label>
                                                                            <input
                                                                                type="radio"
                                                                                name={`next_working_${student.student_session_id}`}
                                                                                value="continue"
                                                                                checked={studentNextSessionStatus[student.student_session_id] === 'continue'}
                                                                                onChange={(e) => handleNextWorkingChange(student.student_session_id, e.target.value)}
                                                                            /> Continue
                                                                        </label>
                                                                    </div>
                                                                    <div className="radio-inline">
                                                                        <label>
                                                                            <input
                                                                                type="radio"
                                                                                name={`next_working_${student.student_session_id}`}
                                                                                value="leave"
                                                                                checked={studentNextSessionStatus[student.student_session_id] === 'leave'}
                                                                                onChange={(e) => handleNextWorkingChange(student.student_session_id, e.target.value)}
                                                                            /> Leave
                                                                        </label>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        <div className="box-footer clearfix">
                                            <button
                                                className="btn btn-sm btn-primary pull-right"
                                                onClick={() => setShowModal(true)}
                                            >
                                                Promote
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <Footer />

            {/* Modal */}
            {showModal && (
                <div className="modal show" style={{ display: 'block' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" onClick={() => setShowModal(false)}>×</button>
                                <h4 className="modal-title">Promote Confirmation</h4>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to promote confirm?</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={handleSave}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StdTransfer;
