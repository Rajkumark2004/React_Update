import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import '../../styles/reports.css';

const SubjectLessonPlanReport = () => {
    const navigate = useNavigate();

    // Form states
    const [classId, setClassId] = useState('');
    const [sectionId, setSectionId] = useState('');
    const [subjectGroupId, setSubjectGroupId] = useState('');
    const [subjectId, setSubjectId] = useState('');

    // Table search state
    const [tableSearch, setTableSearch] = useState('');

    // Data states
    const [sectionOptions, setSectionOptions] = useState([]);
    const [subjectGroupOptions, setSubjectGroupOptions] = useState([]);
    const [subjectOptions, setSubjectOptions] = useState([]);
    const [reportData, setReportData] = useState(null);
    const [flattenedResults, setFlattenedResults] = useState([]);
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

    const subjectsMap = {
        '1': [{ id: '101', name: 'English', code: 'ENG101' }, { id: '102', name: 'Hindi', code: 'HIN102' }],
        '2': [{ id: '201', name: 'Physics', code: 'PHY201' }, { id: '202', name: 'Chemistry', code: 'CHE202' }],
    };

    const mockReportResult = {
        subject_name: 'Physics (PHY201)',
        subject_complete: 75,
        data: [
            {
                teacher_name: 'Mr. Rajesh Kumar',
                summary: [
                    { lesson_name: 'Lesson 1: Introduction to Mechanics', topic_name: 'Topic 1.1: Motion', sub_topic: 'Linear Motion', date: '2025-03-01', time_from: '09:00 AM', time_to: '10:00 AM' },
                    { lesson_name: 'Lesson 1: Introduction to Mechanics', topic_name: 'Topic 1.2: Force', sub_topic: 'Newton\'s Laws', date: '2025-03-02', time_from: '09:00 AM', time_to: '10:00 AM' },
                ]
            },
            {
                teacher_name: 'Ms. Sneha Sharma',
                summary: [
                    { lesson_name: 'Lesson 2: Thermodynamics', topic_name: 'Topic 2.1: Heat Transfer', sub_topic: 'Conduction', date: '2025-03-05', time_from: '11:00 AM', time_to: '12:00 PM' },
                ]
            }
        ]
    };

    // Effects for cascading dropdowns
    useEffect(() => {
        if (classId) {
            setSectionOptions(sectionsMap[classId] || []);
        } else {
            setSectionOptions([]);
        }
        setSectionId('');
        setSubjectGroupId('');
        setSubjectId('');
    }, [classId]);

    useEffect(() => {
        if (classId && sectionId) {
            setSubjectGroupOptions(subjectGroupsMap[`${classId}_${sectionId}`] || []);
        } else {
            setSubjectGroupOptions([]);
        }
        setSubjectGroupId('');
        setSubjectId('');
    }, [classId, sectionId]);

    useEffect(() => {
        if (subjectGroupId) {
            setSubjectOptions(subjectsMap[subjectGroupId] || []);
        } else {
            setSubjectOptions([]);
        }
        setSubjectId('');
    }, [subjectGroupId]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!classId || !sectionId || !subjectGroupId || !subjectId) {
            alert('Please select all required fields');
            return;
        }

        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setReportData(mockReportResult);
            // Flatten the results for easier table handling
            const flattened = [];
            mockReportResult.data.forEach(teacher => {
                teacher.summary.forEach(row => {
                    flattened.push({
                        teacher: teacher.teacher_name,
                        ...row
                    });
                });
            });
            setFlattenedResults(flattened);
            setSearched(true);
            setLoading(false);
        }, 800);
    };

    // Filter results based on table search
    const filteredResults = flattenedResults.filter(item =>
        Object.values(item).some(val =>
            String(val).toLowerCase().includes(tableSearch.toLowerCase())
        )
    );

    // Table action handlers
    const handleCopy = () => {
        const headers = 'Teacher\tLesson Name\tTopic Name\tSub Topic\tDate\tTime From\tTime To';
        const text = filteredResults.map(row =>
            `${row.teacher}\t${row.lesson_name}\t${row.topic_name}\t${row.sub_topic}\t${row.date}\t${row.time_from}\t${row.time_to}`
        ).join('\n');
        navigator.clipboard.writeText(headers + '\n' + text);
        alert('Copied to clipboard!');
    };

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />
            <style>{`
                .slp-table th, .slp-table td {
                    padding: 10px 15px !important;
                    white-space: nowrap;
                }
                .slp-table td:nth-child(2), .slp-table th:nth-child(2) {
                    white-space: normal;
                    min-width: 200px;
                }
            `}</style>

            <div className="content-wrapper" style={{ minHeight: '946px' }}>
                <section className="content">
                    <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="box-title"><i className="fa fa-search"></i> Subject Lesson Plan Report</h3>
                        <button onClick={() => navigate('/admin/reports/student_information')} className="btn btn-primary btn-sm">
                            <i className="fa fa-arrow-left"></i> Back
                        </button>
                    </div>
                    {/* Top Navigation Links */}
                    <div className="row" style={{ marginTop: '16px' }}>
                        <div className="col-md-12">
                            <div className="box box-primary border0 mb0 margesection">
                                <div className="box-header with-border">
                                    <h3 className="box-title"><i className="fa fa-search"></i> Subject Lesson Plan Report</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => navigate('/admin/reports/student_information')} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="">
                                    <ul className="reportlists" style={{ listStyle: 'none', padding: '15px 0', borderBottom: '1px solid #eee', overflow: 'hidden' }}>
                                        <li className="col-lg-4 col-md-4 col-sm-6" style={{ marginBottom: '10px' }}>
                                            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/report/lesson_plan'); }} style={{ color: '#555' }}>
                                                <i className="fa fa-file-text-o"></i> Syllabus Status Report
                                            </a>
                                        </li>
                                        <li className="col-lg-4 col-md-4 col-sm-6" style={{ marginBottom: '10px' }}>
                                            <a href="#" className="active" style={{ color: '#337ab7', fontWeight: '600' }}>
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
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label>Class</label><small className="req"> *</small>
                                            <select className="form-control" value={classId} onChange={(e) => setClassId(e.target.value)}>
                                                <option value="">Select</option>
                                                {classList.map(c => <option key={c.id} value={c.id}>{c.class}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label>Section</label><small className="req"> *</small>
                                            <select className="form-control" value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
                                                <option value="">Select</option>
                                                {sectionOptions.map(s => <option key={s.section_id} value={s.section_id}>{s.section}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label>Subject Group</label><small className="req"> *</small>
                                            <select className="form-control" value={subjectGroupId} onChange={(e) => setSubjectGroupId(e.target.value)}>
                                                <option value="">Select</option>
                                                {subjectGroupOptions.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label>Subject</label><small className="req"> *</small>
                                            <select className="form-control" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                                                <option value="">Select</option>
                                                {subjectOptions.map(s => <option key={s.id} value={s.id}>{s.name} {s.code && `(${s.code})`}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary btn-sm pull-right">
                                    <i className="fa fa-search"></i> Search
                                </button>
                            </div>
                        </form>

                        {loading && (
                            <div className="box-body text-center" style={{ padding: '20px' }}>
                                <div>Loading report...</div>
                            </div>
                        )}

                        {searched && (
                            <div className="box-body" id="transfee">
                                <div className="box-header ptbnull" style={{ paddingLeft: 0 }}>
                                    <h3 className="box-title titlefix" style={{ fontSize: '18px', margin: '15px 0' }}>
                                        <i className="fa fa-file-text-o"></i> Subject Lesson Plan Report For: {reportData?.subject_name}
                                        {reportData && (
                                            <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#00a65a', marginLeft: '10px' }}>
                                                Complete {reportData.subject_complete}%
                                            </span>
                                        )}
                                    </h3>
                                </div>

                                {/* Table toolbar */}
                                <div className="row mb10">
                                    <div className="col-sm-12">
                                        <div className="pull-left">
                                            <div className="form-group mb0" style={{ paddingBottom: '5px' }}>
                                                <i className="fa fa-search" style={{ color: '#999', marginRight: '5px' }}></i>
                                                <input
                                                    type="text"
                                                    className="form-control input-sm"
                                                    placeholder="Search..."
                                                    style={{ width: '200px', border: 'none', display: 'inline-block', background: 'transparent', boxShadow: 'none' }}
                                                    value={tableSearch}
                                                    onChange={(e) => setTableSearch(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="pull-right">
                                            <div className="dt-buttons btn-group" style={{ paddingBottom: '2px' }}>
                                                <button className="btn btn-default dt-button" title="Copy" onClick={handleCopy} style={{ border: 'none', padding: '5px 5px', background: 'transparent', boxShadow: 'none' }}><i className="fa fa-copy"></i></button>
                                                <button className="btn btn-default dt-button" title="Excel" style={{ border: 'none', padding: '5px 5px', background: 'transparent', boxShadow: 'none' }}><i className="fa fa-file-excel-o"></i></button>
                                                <button className="btn btn-default dt-button" title="CSV" style={{ border: 'none', padding: '5px 5px', background: 'transparent', boxShadow: 'none' }}><i className="fa fa-file-text-o"></i></button>
                                                <button className="btn btn-default dt-button" title="PDF" style={{ border: 'none', padding: '5px 5px', background: 'transparent', boxShadow: 'none' }}><i className="fa fa-file-pdf-o"></i></button>
                                                <button className="btn btn-default dt-button" title="Print" onClick={() => window.print()} style={{ border: 'none', padding: '5px 5px', background: 'transparent', boxShadow: 'none' }}><i className="fa fa-print"></i></button>
                                                <button className="btn btn-default dt-button" title="Columns" style={{ border: 'none', padding: '5px 5px', background: 'transparent', boxShadow: 'none' }}><i className="fa fa-columns"></i></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="table-responsive">
                                    <table className="table table-striped table-bordered table-hover slp-table">
                                        <thead>
                                            <tr>
                                                <th className="text-left">Teacher</th>
                                                <th className="text-left">Lesson Name</th>
                                                <th className="text-left">Topic Name</th>
                                                <th className="text-left">Sub Topic</th>
                                                <th className="text-left">Date</th>
                                                <th className="text-left">Time From</th>
                                                <th className="text-left">Time To</th>
                                                <th className="text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredResults.length === 0 ? (
                                                <tr><td colSpan="8" className="text-center">No data available in table</td></tr>
                                            ) : (
                                                filteredResults.map((row, idx) => (
                                                    <tr key={idx}>
                                                        <td className="text-left">{row.teacher}</td>
                                                        <td className="text-left">{row.lesson_name}</td>
                                                        <td className="text-left">{row.topic_name}</td>
                                                        <td className="text-left">{row.sub_topic}</td>
                                                        <td className="text-left">{row.date}</td>
                                                        <td className="text-left">{row.time_from}</td>
                                                        <td className="text-left">{row.time_to}</td>
                                                        <td className="text-right">
                                                            <button className="btn btn-default btn-xs" title="View" style={{ border: 'none', background: 'transparent' }}>
                                                                <i className="fa fa-reorder"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Record count and pagination */}
                                <div className="row" style={{ marginTop: '10px' }}>
                                    <div className="col-sm-5">
                                        <div className="dataTables_info" style={{ paddingLeft: '10px', fontSize: '12px' }}>
                                            Records: {filteredResults.length > 0 ? 1 : 0} to {filteredResults.length} of {filteredResults.length}
                                            {tableSearch && flattenedResults.length !== filteredResults.length && ` (filtered from ${flattenedResults.length} total)`}
                                        </div>
                                    </div>
                                    <div className="col-sm-7">
                                        <div className="dataTables_paginate paging_simple_numbers" style={{ textAlign: 'right', paddingRight: '10px' }}>
                                            <ul className="pagination" style={{ margin: '0', float: 'right', fontSize: '12px' }}>
                                                <li className="paginate_button previous disabled">
                                                    <a href="#" onClick={(e) => e.preventDefault()} style={{ padding: '5px 10px', border: 'none', background: 'transparent' }}>&lt;</a>
                                                </li>
                                                <li className="paginate_button active">
                                                    <a href="#" onClick={(e) => e.preventDefault()} style={{ padding: '5px 10px' }}>1</a>
                                                </li>
                                                <li className="paginate_button next disabled">
                                                    <a href="#" onClick={(e) => e.preventDefault()} style={{ padding: '5px 10px', border: 'none', background: 'transparent' }}>&gt;</a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default SubjectLessonPlanReport;
