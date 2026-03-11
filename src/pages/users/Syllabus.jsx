import React, { useState, useEffect } from 'react';
import Header_user from './user_components/Header_user';
import Sidebar_user from './user_components/Sidebar_user';
import Footer from './user_components/Footer';
import { api_users } from '../../services/api_users';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

const Syllabus = () => {
    const [loading, setLoading] = useState(true);
    const [syllabusData, setSyllabusData] = useState(null);
    const [weekDates, setWeekDates] = useState(null);
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const response = await api_users.getSyllabusIndex();
            if (response.status) {
                setWeekDates({
                    this_week_start: response.data.this_week_start,
                    this_week_end: response.data.this_week_end,
                    prev_week_start: response.data.prev_week_start || '',
                    next_week_start: response.data.next_week_start || ''
                });
                // After getting index, fetch the details for this week
                await fetchWeekDetails(response.data.this_week_start);
            }
        } catch (error) {
            console.error('Error fetching syllabus index:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWeekDetails = async (date) => {
        setLoading(true);
        try {
            const response = await api_users.getSyllabusWeekDates(date);
            if (response.status) {
                setSyllabusData(response.data.student_data || []);
                setWeekDates({
                    this_week_start: response.data.this_week_start,
                    this_week_end: response.data.this_week_end,
                    prev_week_start: response.data.prev_week_start,
                    next_week_start: response.data.next_week_start
                });
            }
        } catch (error) {
            console.error('Error fetching week details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrevWeek = () => {
        if (weekDates?.prev_week_start) {
            fetchWeekDetails(weekDates.prev_week_start);
        }
    };

    const handleNextWeek = () => {
        if (weekDates?.next_week_start) {
            fetchWeekDetails(weekDates.next_week_start);
        }
    };

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    // Helper to get lessons for a specific day from student_data
    const getLessonsForDay = (dayName) => {
        if (!syllabusData) return [];
        return syllabusData.filter(item => item.day === dayName);
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
            <Sidebar_user currentUrl="/user/syllabus" />

            <div className="content-wrapper" style={{ minHeight: 'calc(100vh - 100px)', background: '#f4f6f9' }}>
                <section className="content-header" style={{ padding: '15px' }}>
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>Lesson Plan</h1>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="content" style={{ padding: '0 15px' }}>
                    <div className="card" style={{ borderTop: '3px solid #3c8dbc', boxShadow: '0 1px 1px rgba(0,0,0,0.1)' }}>
                        <div className="card-header" style={{ background: '#fff', padding: '15px' }}>
                            <div className="d-flex justify-content-center align-items-center">
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={handlePrevWeek}
                                    disabled={!weekDates?.prev_week_start || loading}
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span style={{ margin: '0 20px', fontSize: '16px', fontWeight: '600' }}>
                                    {weekDates ? `${weekDates.this_week_start} To ${weekDates.this_week_end}` : 'Loading...'}
                                </span>
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={handleNextWeek}
                                    disabled={!weekDates?.next_week_start || loading}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="card-body p-0">
                            {loading ? (
                                <div className="d-flex justify-content-center align-items-center p-5">
                                    <Loader2 className="animate-spin text-primary" size={40} />
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <div className="syllabus-grid" style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                        minHeight: '400px',
                                        borderTop: '1px solid #dee2e6'
                                    }}>
                                        {days.map((day, idx) => {
                                            const dayLessons = getLessonsForDay(day);
                                            return (
                                                <div key={idx} style={{ borderRight: '1px solid #dee2e6', borderBottom: '1px solid #dee2e6' }}>
                                                    <div style={{
                                                        background: '#f8f9fa',
                                                        padding: '10px',
                                                        textAlign: 'center',
                                                        borderBottom: '1px solid #dee2e6',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {day}
                                                    </div>
                                                    <div style={{ padding: '10px' }}>
                                                        {dayLessons.length > 0 ? (
                                                            dayLessons.map((lesson, lIdx) => (
                                                                <div key={lIdx} style={{
                                                                    background: '#fff',
                                                                    border: '1px solid #e3e6f0',
                                                                    borderRadius: '4px',
                                                                    padding: '8px',
                                                                    marginBottom: '10px',
                                                                    fontSize: '12px'
                                                                }}>
                                                                    <div style={{ fontWeight: 'bold', color: '#3c8dbc' }}>{lesson.subject_name}</div>
                                                                    <div>{lesson.lesson_name}</div>
                                                                    <div className="text-muted">{lesson.topic_name}</div>
                                                                    <div className="mt-1" style={{ fontSize: '11px' }}>
                                                                        {lesson.time_from} - {lesson.time_to}
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-center text-muted mt-3" style={{ fontSize: '13px' }}>
                                                                No lesson
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default Syllabus;
