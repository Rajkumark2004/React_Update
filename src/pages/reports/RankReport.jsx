import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import '../../styles/reports.css';

const RankReport = () => {
    const navigate = useNavigate();

    const [showFilters, setShowFilters] = useState(false);

    // Form states
    const [examGroupId, setExamGroupId] = useState('');
    const [examId, setExamId] = useState('');
    const [sessionId, setSessionId] = useState('');
    const [classId, setClassId] = useState('');
    const [sectionId, setSectionId] = useState('');

    // Table search state
    const [tableSearch, setTableSearch] = useState('');

    // Data states
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    // --- MOCK DATA ---
    const examGroups = [
        { id: '1', name: 'General Examination' },
        { id: '2', name: 'Competitive Exams' },
    ];

    const examsMap = {
        '1': [
            { id: '101', name: 'Mid Term' },
            { id: '102', name: 'Final Exam' },
        ],
        '2': [
            { id: '201', name: 'Mock Test 1' },
            { id: '202', name: 'Scholarship Exam' },
        ]
    };

    const sessions = [
        { id: '1', session: '2024-25' },
        { id: '2', session: '2023-24' },
    ];

    const classes = [
        { id: '1', class: 'Class 10' },
        { id: '2', class: 'Class 12' },
    ];

    const sectionsMap = {
        '1': [{ id: '1', section: 'A' }, { id: '2', section: 'B' }],
        '2': [{ id: '3', section: 'A' }, { id: '4', section: 'Science' }],
    };

    const mockSubjects = [
        { id: 's1', name: 'Physics', code: 'PHY101', min_marks: 33, max_marks: 100 },
        { id: 's2', name: 'Chemistry', code: 'CHE101', min_marks: 33, max_marks: 100 },
        { id: 's3', name: 'Mathematics', code: 'MAT101', min_marks: 33, max_marks: 100 },
        { id: 's4', name: 'English', code: 'ENG101', min_marks: 33, max_marks: 100 },
    ];

    const mockStudents = [
        { rank: 1, admission_no: 'ADM/001', roll_no: '101', name: 'John Doe', results: { 's1': { marks: 85, grade: 'A' }, 's2': { marks: 90, grade: 'A+' }, 's3': { marks: 95, grade: 'A+' }, 's4': { marks: 88, grade: 'A' } }, grand_total: '358.00 / 400.00', percentage: '89.50', result: 'Pass' },
        { rank: 2, admission_no: 'ADM/005', roll_no: '105', name: 'Emily Smith', results: { 's1': { marks: 78, grade: 'B' }, 's2': { marks: 82, grade: 'A' }, 's3': { marks: 80, grade: 'A' }, 's4': { marks: 75, grade: 'B' } }, grand_total: '315.00 / 400.00', percentage: '78.75', result: 'Pass' },
        { rank: 3, admission_no: 'ADM/012', roll_no: '112', name: 'Robert Wilson', results: { 's1': { marks: 30, grade: 'F' }, 's2': { marks: 45, grade: 'D' }, 's3': { marks: 35, grade: 'D' }, 's4': { marks: 40, grade: 'D' } }, grand_total: '150.00 / 400.00', percentage: '37.50', result: 'Fail' }
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setReportData({ subjects: mockSubjects, students: mockStudents });
            setSearched(true);
            setLoading(false);
        }, 800);
    };

    const filteredStudents = reportData ? reportData.students.filter(s =>
        s.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
        s.admission_no.toLowerCase().includes(tableSearch.toLowerCase())
    ) : [];

    const handleCopy = () => { alert('Data copied to clipboard!'); };

    const handleReportLinkClick = (e) => {
        e.preventDefault();
        setShowFilters(true);
    };

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />
            <style>{`
                .rank-table th, .rank-table td { padding: 10px 15px !important; text-align: center; vertical-align: middle !important; }
                .rank-table th { background: #f9f9f9; font-size: 11px; white-space: nowrap; }
                .label-success { background-color: #5cb85c; }
                .label-danger { background-color: #d9534f; }
                .text-small { font-size: 10px; color: #777; }
                .form-row-custom { display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end; }
                .form-col-custom { flex: 1; min-width: 150px; }
                .form-btn-col { flex: 0 0 auto; }
            `}</style>

            <div className="content-wrapper" style={{ minHeight: '946px' }}>
                <section className="content">
                    <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="box-title"><i className="fa fa-search"></i> Examinations Report</h3>
                        <button onClick={() => navigate('/admin/reports/student_information')} className="btn btn-primary btn-sm">
                            <i className="fa fa-arrow-left"></i> Back
                        </button>
                    </div>
                    {/* Navigation Header */}
                    <div className="row" style={{ marginTop: '16px' }}>
                        <div className="col-md-12">
                            <div className="box box-primary border0 mb0 margesection">
                                <div className="box-header with-border">
                                    <h3 className="box-title"><i className="fa fa-search"></i> Examinations Report</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => navigate('/admin/reports/student_information')} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="">
                                    <ul className="reportlists" style={{ listStyle: 'none', padding: '15px 0', borderBottom: '1px solid #eee', overflow: 'hidden' }}>
                                        <li className="col-lg-4 col-md-4 col-sm-6" style={{ marginBottom: '10px' }}>
                                            <a href="#" className={showFilters ? "active" : ""} onClick={handleReportLinkClick} style={{ color: showFilters ? '#337ab7' : '#555', fontWeight: showFilters ? '600' : 'normal' }}>
                                                <i className="fa fa-file-text-o"></i> Rank Report
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {showFilters && (
                        <>
                            {/* Search Criteria - One Line Layout */}
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="box removeboxmius">
                                        <div className="box-header with-border">
                                            <h3 className="box-title"><i className="fa fa-search"></i> Select Criteria</h3>
                                        </div>
                                        <form onSubmit={handleSearch}>
                                            <div className="box-body">
                                                <div className="row">
                                                    <div className="col-md-2">
                                                        <div className="form-group">
                                                            <label>Exam Group <small className="req">*</small></label>
                                                            <select className="form-control" value={examGroupId} onChange={(e) => { setExamGroupId(e.target.value); setExamId(''); }} required>
                                                                <option value="">Select</option>
                                                                {examGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-2">
                                                        <div className="form-group">
                                                            <label>Exam <small className="req">*</small></label>
                                                            <select className="form-control" value={examId} onChange={(e) => setExamId(e.target.value)} required>
                                                                <option value="">Select</option>
                                                                {examGroupId && examsMap[examGroupId]?.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-2">
                                                        <div className="form-group">
                                                            <label>Session <small className="req">*</small></label>
                                                            <select className="form-control" value={sessionId} onChange={(e) => setSessionId(e.target.value)} required>
                                                                <option value="">Select</option>
                                                                {sessions.map(s => <option key={s.id} value={s.id}>{s.session}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-2">
                                                        <div className="form-group">
                                                            <label>Class <small className="req">*</small></label>
                                                            <select className="form-control" value={classId} onChange={(e) => { setClassId(e.target.value); setSectionId(''); }} required>
                                                                <option value="">Select</option>
                                                                {classes.map(c => <option key={c.id} value={c.id}>{c.class}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-2">
                                                        <div className="form-group">
                                                            <label>Section <small className="req">*</small></label>
                                                            <select className="form-control" value={sectionId} onChange={(e) => setSectionId(e.target.value)} required>
                                                                <option value="">Select</option>
                                                                {classId && sectionsMap[classId]?.map(s => <option key={s.id} value={s.id}>{s.section}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-12">
                                                        <button type="submit" className="btn btn-primary btn-sm pull-right">
                                                            <i className="fa fa-search"></i> Search
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>

                            {loading && <div className="box-body text-center">Loading...</div>}

                            {searched && reportData && (
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="box removeboxmius">
                                            <div className="box-body">
                                                <div className="box-header ptbnull" style={{ paddingLeft: 0 }}>
                                                    <h3 className="box-title titlefix" style={{ fontSize: '18px', margin: '15px 0' }}>
                                                        <i className="fa fa-users"></i> Student List
                                                    </h3>
                                                </div>

                                                <div className="row mb10">
                                                    <div className="col-sm-12">
                                                        <div className="pull-left">
                                                            <div className="form-group mb0">
                                                                <i className="fa fa-search" style={{ color: '#999', marginRight: '5px' }}></i>
                                                                <input type="text" className="form-control input-sm" placeholder="Search..." style={{ width: '200px', display: 'inline-block' }} value={tableSearch} onChange={(e) => setTableSearch(e.target.value)} />
                                                            </div>
                                                        </div>
                                                        <div className="pull-right">
                                                            <div className="dt-buttons btn-group">
                                                                <button className="btn btn-default dt-button" onClick={handleCopy}><i className="fa fa-copy"></i></button>
                                                                <button className="btn btn-default dt-button"><i className="fa fa-file-excel-o"></i></button>
                                                                <button className="btn btn-default dt-button"><i className="fa fa-file-text-o"></i></button>
                                                                <button className="btn btn-default dt-button"><i className="fa fa-file-pdf-o"></i></button>
                                                                <button className="btn btn-default dt-button" onClick={() => window.print()}><i className="fa fa-print"></i></button>
                                                                <button className="btn btn-default dt-button"><i className="fa fa-columns"></i></button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="table-responsive">
                                                    <table className="table table-striped table-bordered table-hover rank-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Rank</th>
                                                                <th>Admission No</th>
                                                                <th>Roll Number</th>
                                                                <th>Student Name</th>
                                                                {reportData.subjects.map(sub => (
                                                                    <th key={sub.id}>
                                                                        {sub.name}<br />
                                                                        <span className="text-small">({sub.min_marks}/{sub.max_marks} - {sub.code})</span>
                                                                    </th>
                                                                ))}
                                                                <th>Grand Total</th>
                                                                <th>Percent (%)</th>
                                                                <th>Result</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {filteredStudents.length === 0 ? (
                                                                <tr><td colSpan={7 + reportData.subjects.length} className="text-center">No data available</td></tr>
                                                            ) : (
                                                                filteredStudents.map((student, idx) => (
                                                                    <tr key={idx}>
                                                                        <td>{student.rank}</td>
                                                                        <td>{student.admission_no}</td>
                                                                        <td>{student.roll_no}</td>
                                                                        <td style={{ textAlign: 'left' }}>{student.name}</td>
                                                                        {reportData.subjects.map(sub => {
                                                                            const res = student.results[sub.id];
                                                                            return <td key={sub.id}>{res ? `${res.marks} [${res.grade}]` : '-'}</td>;
                                                                        })}
                                                                        <td>{student.grand_total}</td>
                                                                        <td>{student.percentage} [A]</td>
                                                                        <td><span className={`label ${student.result === 'Pass' ? 'label-success' : 'label-danger'}`}>{student.result}</span></td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default RankReport;
