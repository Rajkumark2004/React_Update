import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import '../../styles/reports.css';

const LessonPlanReport = () => {
    const navigate = useNavigate();

    // Form states
    const [classId, setClassId] = useState('');
    const [sectionId, setSectionId] = useState('');
    const [subjectGroupId, setSubjectGroupId] = useState('');

    // Data states
    const [sectionOptions, setSectionOptions] = useState([]);
    const [subjectGroupOptions, setSubjectGroupOptions] = useState([]);
    const [subjectsData, setSubjectsData] = useState([]);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);

    // --- MOCK DATA ---
    const classList = [
        { id: '1', class: 'Class 1' },
        { id: '2', class: 'Class 2' },
        { id: '3', class: 'Class 10' },
    ];

    const sectionsMap = {
        '1': [{ section_id: '1', section: 'A' }, { section_id: '2', section: 'B' }],
        '2': [{ section_id: '3', section: 'C' }],
        '3': [{ section_id: '4', section: 'A' }, { section_id: '5', section: 'B' }, { section_id: '6', section: 'C' }],
    };

    const subjectGroupsMap = {
        "1_1": [{ id: '1', name: 'Primary Group' }],
        "3_4": [{ id: '2', name: 'Science Group' }, { id: '3', name: 'Commerce Group' }],
    };

    // Mock Data - Report Result
    const mockReportData = [
        {
            id: '101',
            lebel: 'English (ENG101)',
            name: 'English',
            complete: 60,
            incomplete: 40,
            total: 2,
            lesson_summary: [
                {
                    name: 'Lesson 1: Introduction',
                    complete_percent: 100,
                    incomplete_percent: 0,
                    topics: [
                        { name: 'Topic 1.1: Greetings', status: 1, complete_date: '2025-03-01' },
                        { name: 'Topic 1.2: Alphabets', status: 1, complete_date: '2025-03-02' }
                    ]
                },
                {
                    name: 'Lesson 2: Grammar',
                    complete_percent: 20,
                    incomplete_percent: 80,
                    topics: [
                        { name: 'Topic 2.1: Nouns', status: 1, complete_date: '2025-03-05' },
                        { name: 'Topic 2.2: Verbs', status: 0, complete_date: '' },
                        { name: 'Topic 2.3: Tenses', status: 0, complete_date: '' }
                    ]
                }
            ]
        },
        {
            id: '102',
            lebel: 'Mathematics (MATH102)',
            name: 'Mathematics',
            complete: 45,
            incomplete: 55,
            total: 1,
            lesson_summary: [
                {
                    name: 'Lesson 1: Algebra',
                    complete_percent: 45,
                    incomplete_percent: 55,
                    topics: [
                        { name: 'Topic 1.1: Linear Equations', status: 1, complete_date: '2025-03-10' },
                        { name: 'Topic 1.2: Quadratic Equations', status: 0, complete_date: '' }
                    ]
                }
            ]
        }
    ];

    useEffect(() => {
        if (classId) {
            setSectionOptions(sectionsMap[classId] || []);
        } else {
            setSectionOptions([]);
        }
        setSectionId('');
        setSubjectGroupId('');
    }, [classId]);

    useEffect(() => {
        if (classId && sectionId) {
            // In real app, this would be an API call
            setSubjectGroupOptions(subjectGroupsMap[`${classId}_${sectionId}`] || []);
        } else {
            setSubjectGroupOptions([]);
        }
        setSubjectGroupId('');
    }, [classId, sectionId]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!classId || !sectionId || !subjectGroupId) {
            alert('Please select all required fields');
            return;
        }

        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setSubjectsData(mockReportData);
            setSearched(true);
            setLoading(false);
        }, 800);
    };

    const DonutChart = ({ percentage, color = "#4CAF50" }) => {
        const radius = 35;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;

        return (
            <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto' }}>
                <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle
                        cx="50" cy="50" r={radius}
                        fill="transparent"
                        stroke="#cfcfcf"
                        strokeWidth="10"
                    />
                    <circle
                        cx="50" cy="50" r={radius}
                        fill="transparent"
                        stroke={color}
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                    />
                </svg>
                <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '14px', fontWeight: 'bold'
                }}>
                    {percentage}%
                </div>
            </div>
        );
    };

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ minHeight: '946px' }}>
                <section className="content">
                    <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="box-title"><i className="fa fa-search"></i> Lesson Plan Report</h3>
                        <button onClick={() => navigate('/admin/reports/student_information')} className="btn btn-primary btn-sm">
                            <i className="fa fa-arrow-left"></i> Back
                        </button>
                    </div>
                    {/* Top Navigation Links */}
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary border0 mb0 margesection">
                                <div className="box-header with-border">
                                    <h3 className="box-title"><i className="fa fa-search"></i> Lesson Plan Report</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => navigate('/admin/reports/student_information')} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="">
                                    <ul className="reportlists" style={{ listStyle: 'none', padding: '15px 0', borderBottom: '1px solid #eee', overflow: 'hidden' }}>
                                        <li className="col-lg-4 col-md-4 col-sm-6" style={{ marginBottom: '10px' }}>
                                            <a href="#" className="active" style={{ color: '#337ab7', fontWeight: '600' }}>
                                                <i className="fa fa-file-text-o"></i> Syllabus Status Report
                                            </a>
                                        </li>
                                        <li className="col-lg-4 col-md-4 col-sm-6" style={{ marginBottom: '10px' }}>
                                            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/report/teachersyllabusstatus'); }} style={{ color: '#555' }}>
                                                <i className="fa fa-file-text-o"></i> Subject Lesson Plan Report
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="box removeboxmius">
                        <div className="box-header ptbnull">
                            <h3 className="box-title"><i className="fa fa-search"></i> Select Criteria</h3>
                        </div>
                        <form className="assign_teacher_form" onSubmit={handleSearch}>
                            <div className="box-body">
                                <div className="row">
                                    <div className="col-md-3 col-lg-3 col-sm-6">
                                        <div className="form-group">
                                            <label>Class</label><small className="req"> *</small>
                                            <select
                                                autoFocus
                                                className="form-control"
                                                value={classId}
                                                onChange={(e) => setClassId(e.target.value)}
                                            >
                                                <option value="">Select</option>
                                                {classList.map(cls => <option key={cls.id} value={cls.id}>{cls.class}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-3 col-lg-3 col-sm-6">
                                        <div className="form-group">
                                            <label>Section</label><small className="req"> *</small>
                                            <select
                                                className="form-control"
                                                value={sectionId}
                                                onChange={(e) => setSectionId(e.target.value)}
                                            >
                                                <option value="">Select</option>
                                                {sectionOptions.map(sec => <option key={sec.section_id} value={sec.section_id}>{sec.section}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-3 col-lg-3 col-sm-6">
                                        <div className="form-group">
                                            <label>Subject Group</label><small className="req"> *</small>
                                            <select
                                                className="form-control"
                                                value={subjectGroupId}
                                                onChange={(e) => setSubjectGroupId(e.target.value)}
                                            >
                                                <option value="">Select</option>
                                                {subjectGroupOptions.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary btn-sm checkbox-toggle pull-right">
                                    <i className="fa fa-search"></i> Search
                                </button>
                            </div>
                        </form>

                        {searched && (
                            <>
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="box-header ptbnull"></div>
                                        <div className="box-header with-border">
                                            <h3 className="box-title"><i className="fa fa-users"></i> Syllabus Status Report</h3>
                                        </div>
                                        <div className="box-body">
                                            <div className="row">
                                                <div className="text-center">
                                                    {subjectsData.map(subject => (
                                                        <div key={subject.id} className="col-md-2 col-xs-6 systatus" style={{ marginBottom: '20px' }}>
                                                            <b style={{ display: 'block', marginBottom: '10px', fontSize: '12px' }}>{subject.lebel}</b>
                                                            <div className="chart ptt10">
                                                                <DonutChart percentage={subject.complete} />
                                                            </div>
                                                            <span className="label lbcolor" style={{
                                                                background: '#4CAF50', color: '#fff',
                                                                padding: '2px 8px', borderRadius: '4px',
                                                                fontSize: '11px', marginTop: '10px', display: 'inline-block'
                                                            }}>
                                                                Complete {subject.complete} %
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="box-body">
                                    <div className="table-responsive" id="transfee">
                                        <div className="download_buttons" style={{ textAlign: 'right', marginBottom: '10px' }}>
                                            <button className="btn btn-default btn-xs" style={{ marginRight: '5px' }} onClick={() => window.print()}>
                                                <i className="fa fa-print"></i>
                                            </button>
                                            <button className="btn btn-default btn-xs">
                                                <i className="fa fa-file-excel-o"></i>
                                            </button>
                                        </div>

                                        <table className="table table-bordered topicstaus">
                                            <thead>
                                                <tr>
                                                    <th style={{ background: '#f4f4f4' }}>
                                                        Subject / Lesson / Topic
                                                        <span className="pull-right">Status</span>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr id="noprint">
                                                    <td style={{ textAlign: 'right', fontSize: '11px', fontStyle: 'italic', color: '#777' }}>
                                                        Note : Subject percentage based on topic
                                                    </td>
                                                </tr>
                                                {subjectsData.map(subject => (
                                                    <tr key={subject.id}>
                                                        <td>
                                                            <h4 style={{ margin: '10px 0', fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                                                                {subject.lebel}
                                                                <span style={{ float: 'right', fontWeight: 'normal', fontSize: '13px' }}>
                                                                    {subject.complete}% Complete
                                                                </span>
                                                            </h4>
                                                            <div style={{ paddingLeft: '20px' }}>
                                                                {subject.lesson_summary.map((lesson, idx) => (
                                                                    <div key={idx} style={{ marginBottom: '15px' }}>
                                                                        <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#444' }}>
                                                                            {idx + 1} &nbsp;&nbsp;&nbsp; {lesson.name}
                                                                            <span style={{ float: 'right', fontWeight: 'normal', fontSize: '12px' }}>
                                                                                {lesson.complete_percent}% Complete
                                                                            </span>
                                                                        </h4>
                                                                        <ul className="topicstaus" style={{ listStyle: 'none', paddingLeft: '30px' }}>
                                                                            {lesson.topics.map((topic, tIdx) => (
                                                                                <li key={tIdx} style={{ padding: '5px 0', borderBottom: '1px solid #f9f9f9' }}>
                                                                                    <h5 style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                                                                                        {idx + 1}.{tIdx + 1} &nbsp;&nbsp;&nbsp; {topic.name}
                                                                                        <i style={{ float: 'right', fontStyle: 'normal', fontSize: '11px' }}>
                                                                                            <span className={`label ${topic.status === 1 ? 'label-success' : 'label-warning'}`}
                                                                                                style={{
                                                                                                    background: topic.status === 1 ? '#00a65a' : '#f39c12',
                                                                                                    color: '#fff', padding: '2px 6px', fontSize: '10px'
                                                                                                }}>
                                                                                                {topic.status === 1 ? 'Complete' : 'Incomplete'}
                                                                                            </span>
                                                                                            {topic.status === 1 && topic.complete_date && ` (${topic.complete_date})`}
                                                                                        </i>
                                                                                    </h5>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {!searched && !loading && (
                            <div className="box-body">
                                <div className="table-responsive">
                                    <table className="table table-striped table-bordered table-hover">
                                        <thead>
                                            <tr>
                                                <th>Subject / Lesson / Topic</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td colSpan="2" className="text-center">No data available in table</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {loading && (
                            <div className="box-body text-center">
                                <div className="loading">Loading report...</div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default LessonPlanReport;
