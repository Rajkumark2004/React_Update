import React, { useState, useEffect } from 'react';
import Header_user from './user_components/Header_user';
import Sidebar_user from './user_components/Sidebar_user';
import Footer from './user_components/Footer';
import { api_users } from '../../services/api_users';
import { Loader2, BookOpen, CheckCircle2, ChevronRight, Download, Printer } from 'lucide-react';

const SyllabusStatus = () => {
    const [loading, setLoading] = useState(true);
    const [subjectsData, setSubjectsData] = useState([]);

    useEffect(() => {
        fetchSyllabusStatus();
    }, []);

    const fetchSyllabusStatus = async () => {
        setLoading(true);
        try {
            // API not created yet, using mock data for UI testing
            const mockData = {
                "1": {
                    "lebel": "Mathematics (101)",
                    "complete": 0,
                    "incomplete": 0,
                    "id": "1_101",
                    "total": 0,
                    "name": "Mathematics",
                    "graph_id": "112345",
                    "lesson_summary": []
                },
                "2": {
                    "lebel": "Science (102)",
                    "complete": 0,
                    "incomplete": 0,
                    "id": "2_102",
                    "total": 0,
                    "name": "Science",
                    "graph_id": "212345",
                    "lesson_summary": []
                },
                "3": {
                    "lebel": "History (103)",
                    "complete": 0,
                    "incomplete": 0,
                    "id": "3_103",
                    "total": 0,
                    "name": "History",
                    "graph_id": "312345",
                    "lesson_summary": []
                }
            };

            let d = mockData;
            if (typeof d === 'object' && !Array.isArray(d)) {
                d = Object.values(d);
            }
            setSubjectsData(d);
        } catch (error) {
            console.error('Error fetching syllabus status:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (status) => {
        // Handle both string "1"/"0" and number 1/0
        const s = String(status);
        if (s === '1') return 'Complete';
        if (s === '0') return 'Incomplete';
        return 'No Status';
    };

    return (
        <div className="wrapper">
            <style>{`
                /* Hide standard search and session UI */
                .sessionul, .search-form2, .search-form {
                    display: none !important;
                }

                /* NAVBAR USER MENU DROPDOWN FIX */
                .navbar-custom-menu {
                   overflow: visible !important;
                }
                .navbar-custom-menu .nav {
                   overflow: visible !important;
                }
                .navbar-custom-menu .nav > li:not(.user-menu) {
                    display: none !important;
                }
                .navbar-custom-menu .nav > li.user-menu {
                    display: block !important;
                    overflow: visible !important;
                }
                
                /* Ensure dropdown menu is on top of everything */
                .dropdown-user {
                    display: none;
                    z-index: 9999 !important;
                    position: absolute !important;
                    right: 0 !important;
                    top: 100% !important;
                }
                .user-menu.open .dropdown-user {
                    display: block !important;
                }

                /* REVERTING SIDEBAR TO THE GOOD PREVIOUS STATE */
                .content-wrapper, .main-footer {
                    margin-left: 80px !important;
                }

                .sidebar {
                    height: calc(100vh - 50px) !important;
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                    padding-bottom: 20px !important;
                }

                .sidebar::-webkit-scrollbar {
                    width: 5px;
                }
                .sidebar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .sidebar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                }

                .sidebar-menu > li > a {
                    padding: 12px 5px !important;
                    text-align: center !important;
                }
                
                .sidebar-menu li img {
                    filter: brightness(0) invert(1) !important;
                    width: 24px !important;
                    margin: 0 auto !important;
                }

                .sidebar-menu > li > a span {
                    color: #ffffff !important;
                    font-weight: 500 !important;
                    margin-top: 5px !important;
                    display: block !important;
                    font-size: 10px !important;
                    line-height: 1.2 !important;
                }

                .sidebar-menu > li:hover > a, .sidebar-menu > li.active > a {
                    background: rgba(255, 255, 255, 0.1) !important;
                }

                .content-wrapper {
                    background-color: #f7f8fa !important;
                    padding-top: 25px !important;
                    margin-top: 50px !important;
                    min-height: calc(100vh - 50px);
                }

                @media (max-width: 991px) {
                    .main-sidebar { width: 0 !important; }
                    .content-wrapper, .main-header .navbar, .main-footer { margin-left: 0 !important; }
                    .main-header .logo { width: 120px !important; }
                    .main-header .logo img { width: 100px !important; }
                }

                /* Sidebar mega menu cards logic override if needed */
                .fixedmenu { display: none !important; }
            `}</style>
            <Header_user />
            <Sidebar_user currentUrl="/user/syllabus/status" />

            <div className="content-wrapper" style={{ minHeight: 'calc(100vh - 100px)', background: '#f4f6f9' }}>
                <section className="content-header" style={{ padding: '15px' }}>
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                                    <BookOpen className="inline-block mr-2" size={24} />
                                    Syllabus Status
                                </h1>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="content" style={{ padding: '0 15px' }}>
                    <div className="card" style={{ borderTop: '3px solid #3c8dbc', boxShadow: '0 1px 1px rgba(0,0,0,0.1)' }}>
                        <div className="card-body">
                            {loading ? (
                                <div className="d-flex justify-content-center align-items-center p-5">
                                    <Loader2 className="animate-spin text-primary" size={40} />
                                </div>
                            ) : subjectsData.length === 0 ? (
                                <div className="alert alert-danger" style={{ background: '#f2dede', borderColor: '#ebccd1', color: '#a94442', padding: '15px', borderRadius: '4px' }}>
                                    No Record Found
                                </div>
                            ) : (
                                <>
                                    <div className="row mb-4">
                                        <div className="col-12 text-center" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                                            {subjectsData.map((subject, idx) => {
                                                const complete = parseFloat(subject.complete || 0);
                                                const incomplete = complete === 0 && parseFloat(subject.incomplete || 0) === 0 ? 100 : 100 - complete;

                                                return (
                                                    <div key={idx} className="col-md-2 col-xs-6 text-center mb-4" style={{ minWidth: '150px' }}>
                                                        <b style={{ display: 'block', marginBottom: '15px', color: '#333' }}>{subject.label || subject.lebel}</b>
                                                        <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto' }}>
                                                            {/* SVG Doughnut Chart */}
                                                            <svg width="100%" height="100%" viewBox="0 0 42 42" className="donut" style={{ transform: 'rotate(-90deg)' }}>
                                                                <circle className="donut-hole" cx="21" cy="21" r="15.91549430918954" fill="#fff"></circle>
                                                                <circle className="donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#cfcfcf" strokeWidth="6"></circle>
                                                                {complete > 0 && (
                                                                    <circle className="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#4CAF50" strokeWidth="6"
                                                                        strokeDasharray={`${complete} ${100 - complete}`}
                                                                        strokeDashoffset="0"></circle>
                                                                )}
                                                            </svg>
                                                            {/* Text inside Doughnut */}
                                                            <div style={{
                                                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                fontSize: '12px', fontWeight: 'bold', color: '#333'
                                                            }}>
                                                                {complete}%
                                                            </div>
                                                        </div>
                                                        <span className="label lbcolor" style={{ display: 'inline-block', marginTop: '10px', backgroundColor: complete === 0 ? '#cfcfcf' : '#4CAF50', color: complete === 0 ? '#333' : 'white', padding: '0.2em 0.6em 0.3em', fontSize: '75%', fontWeight: 700, lineHeight: 1, textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'baseline', borderRadius: '0.25em' }}>
                                                            Complete {complete} %
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mb-4 border-top pt-4">
                                        <h5 className="font-weight-bold">Syllabus Status Report</h5>
                                        <div className="btn-group">
                                            <button className="btn btn-sm btn-outline-secondary" title="Print"><Printer size={16} /></button>
                                            <button className="btn btn-sm btn-outline-secondary" title="Download"><Download size={16} /></button>
                                        </div>
                                    </div>

                                    <div className="table-responsive">
                                        <table className="table table-bordered table-striped">
                                            <thead style={{ background: '#f8f9fa' }}>
                                                <tr>
                                                    <th>Subject Lesson Topic</th>
                                                    <th className="text-right" style={{ width: '120px' }}>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {subjectsData.map((subject, sIdx) => (
                                                    <tr key={sIdx}>
                                                        <td>
                                                            <div className="d-flex justify-content-between mb-2">
                                                                <h6 className="font-weight-bold text-primary mb-0">{subject.label}</h6>
                                                                <span className="badge badge-info">{subject.complete}% Complete</span>
                                                            </div>
                                                            {subject.lesson_summary?.map((lesson, lIdx) => (
                                                                <div key={lIdx} className="ml-3 mt-3">
                                                                    <div className="d-flex justify-content-between align-items-center border-bottom pb-1 mb-2">
                                                                        <span className="font-weight-bold text-dark">{lIdx + 1}. {lesson.name}</span>
                                                                        <small className="text-muted">{lesson.complete_percent}% Complete</small>
                                                                    </div>
                                                                    <ul className="list-unstyled ml-4">
                                                                        {lesson.topics?.map((topic, tIdx) => (
                                                                            <li key={tIdx} className="d-flex justify-content-between align-items-center mb-1">
                                                                                <span style={{ fontSize: '13px' }}>
                                                                                    <ChevronRight size={12} className="inline mr-1" />
                                                                                    {lIdx + 1}.{tIdx + 1} {topic.name}
                                                                                </span>
                                                                                <small className={`px-2 py-0 rounded ${String(topic.status) === '1' ? 'bg-success text-white' : 'bg-light text-muted'}`} style={{ fontSize: '11px' }}>
                                                                                    {getStatusLabel(topic.status)}
                                                                                    {String(topic.status) === '1' && topic.complete_date ? ` (${topic.complete_date})` : ''}
                                                                                </small>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            ))}
                                                        </td>
                                                        <td className="text-right align-middle">
                                                            <div className="progress progress-sm" style={{ height: '10px' }}>
                                                                <div
                                                                    className="progress-bar bg-success"
                                                                    role="progressbar"
                                                                    style={{ width: `${subject.complete}%` }}
                                                                    aria-valuenow={subject.complete}
                                                                    aria-valuemin="0"
                                                                    aria-valuemax="100"
                                                                ></div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default SyllabusStatus;
