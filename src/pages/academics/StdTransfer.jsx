import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';
import '../../../utils/include_files';

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
    const [isSearching, setIsSearching] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Mock Data
    const classes = [
        { id: 0, class: 'Nursery' },
        { id: 1, class: 'LKG' },
        { id: 2, class: 'UKG' },
        { id: 3, class: 'Class 1' },
        { id: 4, class: 'Class 2' },
        { id: 5, class: 'Class 3' },
        { id: 6, class: 'Class 4' },
        { id: 7, class: 'Class 5' },
        { id: 8, class: 'Class 6' },
        { id: 9, class: 'Class 7' },
        { id: 10, class: 'Class 8' },
        { id: 11, class: 'Class 9' },
        { id: 12, class: 'Class 10' },
        { id: 13, class: '11' }
    ];

    const sections = {
        1: [{ id: 1, section: 'A' }, { id: 2, section: 'B' }],
        2: [{ id: 1, section: 'A' }, { id: 3, section: 'C' }],
        3: [{ id: 2, section: 'B' }]
    };

    const sessions = [
        { id: 1, session: '2016-17' },
        { id: 2, session: '2017-18' },
        { id: 3, session: '2018-19' },
        { id: 4, session: '2019-20' },
        { id: 5, session: '2020-21' },
        { id: 6, session: '2021-22' },
        { id: 7, session: '2022-23' },
        { id: 8, session: '2023-24' },
        { id: 9, session: '2024-25' },
        { id: 10, session: '2025-26' },
        { id: 11, session: '2026-27' },
        { id: 12, session: '2027-28' },
        { id: 13, session: '2028-29' },
        { id: 14, session: '2029-30' },
      
    ];

    const mockStudents = [
        { id: 101, admission_no: '18001', firstname: 'John', lastname: 'Doe', father_name: 'David Doe', dob: '2010-05-15' },
        { id: 102, admission_no: '18002', firstname: 'Jane', lastname: 'Smith', father_name: 'Michael Smith', dob: '2010-08-20' },
        { id: 103, admission_no: '18003', firstname: 'Sam', lastname: 'Wilson', father_name: 'Robert Wilson', dob: '2011-01-10' }
    ];

    // Effects
    useEffect(() => {
        if (classId) {
            setSectionOptions(sections[classId] || []);
        } else {
            setSectionOptions([]);
        }
    }, [classId]);

    useEffect(() => {
        if (promoteClassId) {
            setPromoteSectionOptions(sections[promoteClassId] || []);
        } else {
            setPromoteSectionOptions([]);
        }
    }, [promoteClassId]);

    // Handlers
    const handleSearch = (e) => {
        e.preventDefault();
        if (classId && sectionId && sessionId && promoteClassId && promoteSectionId) {
            setIsSearching(true);
            // Simulate fetch
            setTimeout(() => {
                setStudentList(mockStudents);
                setIsSearching(false);
            }, 500);
        } else {
            alert('Please select all required fields.');
        }
    };

    const handleSelectAll = (e) => {
        const checked = e.target.checked;
        const checkboxes = document.querySelectorAll('.student-checkbox');
        checkboxes.forEach(cb => cb.checked = checked);
    };

    const handleSave = () => {
        // Simulate save
        setShowModal(false);
        alert('Students are successfully promoted');
        window.location.reload();
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

                <section className="content" style={{ marginTop: '18px' }}>
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
                                                        {classes.map(c => <option key={c.id} value={c.id}>{c.class}</option>)}
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
                                                        {sectionOptions.map(s => <option key={s.id} value={s.id}>{s.section}</option>)}
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
                                                        {sessions.map(s => <option key={s.id} value={s.id}>{s.session}</option>)}
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
                                                        {classes.map(c => <option key={c.id} value={c.id}>{c.class}</option>)}
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
                                                        {promoteSectionOptions.map(s => <option key={s.id} value={s.id}>{s.section}</option>)}
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
                                                                <input type="checkbox" className="checkbox" id="select_all" onChange={handleSelectAll} /> All
                                                            </th>
                                                            <th>Admission No</th>
                                                            <th>Student Name</th>
                                                            <th>Father Name</th>
                                                            <th>Date of Birth</th>
                                                            <th>Current Result</th>
                                                            <th>Next Session Status</th>
                                                        </tr>
                                                        {studentList.map(student => (
                                                            <tr key={student.id}>
                                                                <td>
                                                                    <input type="checkbox" className="checkbox student-checkbox" value={student.id} />
                                                                </td>
                                                                <td>{student.admission_no}</td>
                                                                <td>{student.firstname} {student.lastname}</td>
                                                                <td>{student.father_name}</td>
                                                                <td>{student.dob}</td>
                                                                <td>
                                                                    <div className="radio-inline">
                                                                        <label>
                                                                            <input type="radio" name={`result_${student.id}`} value="pass" defaultChecked /> Pass
                                                                        </label>
                                                                    </div>
                                                                    <div className="radio-inline">
                                                                        <label>
                                                                            <input type="radio" name={`result_${student.id}`} value="fail" /> Fail
                                                                        </label>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="radio-inline">
                                                                        <label>
                                                                            <input type="radio" name={`next_working_${student.id}`} value="continue" defaultChecked /> Continue
                                                                        </label>
                                                                    </div>
                                                                    <div className="radio-inline">
                                                                        <label>
                                                                            <input type="radio" name={`next_working_${student.id}`} value="leave" /> Leave
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
