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
                        results[s.id] = 'pass';
                        nextWorking[s.id] = 'countinue';
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
            setSelectedStudentIds(studentList.map(s => s.id));
        } else {
            setSelectedStudentIds([]);
        }
    };

    const handleStudentSelect = (studentId) => {
        setSelectedStudentIds(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const handleResultChange = (studentId, value) => {
        setStudentResults(prev => ({ ...prev, [studentId]: value }));
    };

    const handleNextWorkingChange = (studentId, value) => {
        setStudentNextSessionStatus(prev => ({ ...prev, [studentId]: value }));
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
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
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
                                                <table className="table table-striped" style={{ width: '100%', minWidth: '800px' }}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ textAlign: 'left', width: '50px', padding: '10px 5px' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    className="checkbox"
                                                                    id="select_all"
                                                                    onChange={handleSelectAll}
                                                                    checked={selectedStudentIds.length === studentList.length && studentList.length > 0}
                                                                /> All
                                                            </th>
                                                            <th style={{ textAlign: 'left', minWidth: '100px', padding: '10px 5px' }}>Admission No</th>
                                                            <th style={{ textAlign: 'left', minWidth: '150px', padding: '10px 5px' }}>Student Name</th>
                                                            <th style={{ textAlign: 'left', minWidth: '150px', padding: '10px 5px' }}>Father Name</th>
                                                            <th style={{ textAlign: 'left', minWidth: '110px', padding: '10px 5px' }}>Date of Birth</th>
                                                            <th style={{ textAlign: 'left', minWidth: '140px', padding: '10px 5px' }}>Current Result</th>
                                                            <th style={{ textAlign: 'left', minWidth: '160px', padding: '10px 5px' }}>Next Session Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {studentList.map(student => (
                                                            <tr key={student.id}>
                                                                <td style={{ textAlign: 'left', padding: '8px 5px' }}>
                                                                    <input
                                                                        type="checkbox"
                                                                        className="checkbox student-checkbox"
                                                                        value={student.id}
                                                                        checked={selectedStudentIds.includes(student.id)}
                                                                        onChange={() => handleStudentSelect(student.id)}
                                                                    />
                                                                </td>
                                                                <td style={{ textAlign: 'left', padding: '8px 5px' }}>{student.admission_no}</td>
                                                                <td style={{ textAlign: 'left', padding: '8px 5px' }}>{student.firstname} {student.lastname}</td>
                                                                <td style={{ textAlign: 'left', padding: '8px 5px' }}>{student.father_name}</td>
                                                                <td style={{ textAlign: 'left', padding: '8px 5px' }}>{student.dob}</td>
                                                                <td style={{ textAlign: 'left', padding: '8px 5px', whiteSpace: 'nowrap' }}>
                                                                    <div className="radio-inline">
                                                                        <label>
                                                                            <input
                                                                                type="radio"
                                                                                name={`result_${student.id}`}
                                                                                value="pass"
                                                                                checked={studentResults[student.id] === 'pass'}
                                                                                onChange={(e) => handleResultChange(student.id, e.target.value)}
                                                                            /> Pass
                                                                        </label>
                                                                    </div>
                                                                    <div className="radio-inline" style={{ marginLeft: '10px' }}>
                                                                        <label>
                                                                            <input
                                                                                type="radio"
                                                                                name={`result_${student.id}`}
                                                                                value="fail"
                                                                                checked={studentResults[student.id] === 'fail'}
                                                                                onChange={(e) => handleResultChange(student.id, e.target.value)}
                                                                            /> Fail
                                                                        </label>
                                                                    </div>
                                                                </td>
                                                                <td style={{ textAlign: 'left', padding: '8px 5px', whiteSpace: 'nowrap' }}>
                                                                    <div className="radio-inline">
                                                                        <label>
                                                                            <input
                                                                                type="radio"
                                                                                name={`next_working_${student.id}`}
                                                                                value="countinue"
                                                                                checked={studentNextSessionStatus[student.id] === 'countinue'}
                                                                                onChange={(e) => handleNextWorkingChange(student.id, e.target.value)}
                                                                            /> Continue
                                                                        </label>
                                                                    </div>
                                                                    <div className="radio-inline" style={{ marginLeft: '10px' }}>
                                                                        <label>
                                                                            <input
                                                                                type="radio"
                                                                                name={`next_working_${student.id}`}
                                                                                value="leave"
                                                                                checked={studentNextSessionStatus[student.id] === 'leave'}
                                                                                onChange={(e) => handleNextWorkingChange(student.id, e.target.value)}
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
