import React, { useState, useEffect } from 'react';
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
            const mockData = {
                "1": { "name": "Telugu", "complete": 0, "lesson_summary": [] },
                "2": { "name": "Hindi", "complete": 0, "lesson_summary": [] },
                "3": { "name": "English", "complete": 0, "lesson_summary": [] }
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

    const handlePrint = () => {
        window.print();
    };

    const handleExportCSV = () => {
        const headers = ["Subject Name", "Completion Percentage (%)"];
        const rows = subjectsData.map(subject => [
            subject.name,
            `${subject.complete}%`
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "syllabus_status_report.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <style>{`
                /* Global Footer Fix */
                html, body {
                    margin: 0;
                    padding: 0;
                    height: 100%;
                }

                .wrapper {
                    display: flex;
                    flex-direction: column;
                    min-height: 100vh;
                    background: #f7f8fa;
                }

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
                .content-wrapper {
                    margin-left: 80px !important;
                    padding-top: 0px !important;
                }

                .main-footer {
                    margin-left: 10px !important;
                }

                .main-header {
                    z-index: 1030 !important;
                    position: relative;
                }

                .main-sidebar {
                    z-index: 1020 !important;
                }

                .sidebar {
                    height: calc(100vh - 50px) !important;
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                    padding-bottom: 20px !important;
                    z-index: 1021 !important;
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
                    margin-left: 80px !important;
                    margin-top: 40px !important;
                    padding-top: 20px !important;
                    background: #f7f8fa !important;
                    width: calc(100% - 80px) !important;
                    display: block !important;
                    min-height: calc(100vh - 100px);
                }

                .syllabus-card {
                    background: #fff;
                    border-radius: 4px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    padding: 0;
                    border: 1px solid #dcdcdc;
                    width: 100%;
                }

                .syllabus-header {
                    padding: 15px 15px 0px;
                    font-size: 18px;
                    font-weight: 500;
                    color: #444;
                }

                .charts-row {
                    display: flex;
                    justify-content: flex-start;
                    gap: 120px;
                    padding: 30px 40px 40px;
                    flex-wrap: wrap;
                }

                .chart-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 150px;
                }

                .subject-name {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 25px;
                    color: #000;
                }

                .donut-container {
                    position: relative;
                    width: 110px;
                    height: 110px;
                    margin-bottom: 15px;
                }

                /* Circular Motion Animation */
                .progress-circle {
                    stroke-dasharray: 100;
                    stroke-dashoffset: 100;
                    animation: fillProgress 1.5s ease-out forwards;
                    stroke-linecap: butt;
                }

                @keyframes fillProgress {
                    to {
                        /* stroke-dashoffset will be set via inline style based on completion */
                    }
                }

                .complete-badge {
                    background: #111;
                    color: #fff;
                    font-size: 10px;
                    padding: 3px 5px;
                    border-radius: 4px;
                    font-weight: bold;
                }

                .action-icons-row {
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                    padding: 0px 15px 10px;
                }

                .icon-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #fdfdfd;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #999;
                    cursor: pointer;
                    border: 1px solid #e0e0e0;
                    transition: all 0.2s;
                }

                .icon-btn:hover {
                    background: #f5f5f5;
                    color: #333;
                }

                .report-header {
                    padding: 10px 15px;
                    font-size: 14px;
                    font-weight: 500;
                    color: #333;
                    border-top: 1px solid #f0f0f0;
                    background: #fff;
                }

                .report-list {
                    background: #fff;
                    padding: 0;
                }

                .report-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 15px;
                    border-top: 1px solid #f9f9f9;
                    font-size: 14px;
                    color: #444;
                }

                .report-percent {
                    color: #555;
                    font-weight: 500;
                }

                .main-footer {
                    margin-left: 80px !important;
                    background: #ececec !important;
                    border-top: 1px solid #d2d6de !important;
                    text-align: right;
                    padding: 2px 15px;
                    color: #5f5249;
                    font-size: 10px;
                }
                
                .report-list {
                    background: #fff;
                    padding: 0;
                    border-top: 1px dashed #ddd;
                }

                @media (max-width: 769px) {
                    .main-sidebar { width: 0 !important; }
                    .content-wrapper, .main-header .navbar, .main-footer { margin-left: 0 !important; }
                    .main-header .logo { width: 120px !important; }
                    .main-header .logo img { width: 100px !important; }
                    /* Padding balancing for mobile */
                    .content-wrapper { padding-left: 0px !important; padding-right: 0px !important; }
                    .content { padding-left: 10px !important; padding-right: 10px !important; }
                    .content-wrapper { 
                        width: 100% !important; 
                        padding-top: 60px !important; 
                        margin-top: 0 !important;
                    }
                }

                @media (max-width: 769px) {
                    .mobile-box-back-btn {
                        display: flex !important;
                        align-items: center;
                        gap: 5px;
                        background-color: #9c68e4 !important;
                        color: #fff !important;
                        border: none;
                        padding: 6px 15px;
                        border-radius: 20px;
                        font-size: 13px;
                        font-weight: 600;
                        position: absolute !important;
                        top: 8px !important;
                        right: 10px !important;
                        z-index: 100 !important;
                        text-decoration: none !important;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                }
                @media (min-width: 770px) {
                    .mobile-box-back-btn { display: none !important; }
                }

                /* Syllabus page specific */
                .syllabus-content { padding: 8px 10px 10px 10px; }
                .syllabus-card-wrapper { position: relative; }
                .syllabus-donut-rotate { transform: rotate(-90.3deg); }
                .syllabus-action-row { display: flex; justify-content: flex-end; gap: 5px; padding: 0 15px 10px; }
                .syllabus-icon-btn { width: 30px; height: 30px; border-radius: 50%; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center; background: #f9f9f9; cursor: pointer; }
                .syllabus-icon-btn-icon { font-size: 14px; color: #666; }
            `}</style>

            <div className="content-wrapper">
                <section className="content syllabus-content">
                    <div className="syllabus-card syllabus-card-wrapper">
                        <div className="syllabus-header">
                            Syllabus Status
                            <button className="mobile-box-back-btn" onClick={() => window.location.href='/user/dashboard'}>
                                <i className="fa fa-arrow-left"></i> Back
                            </button>
                        </div>

                        <div className="charts-row">
                            {subjectsData.map((subject, idx) => (
                                <div key={idx} className="chart-item">
                                    <div className="subject-name">{subject.name}</div>
                                    <div className="donut-container">
                                        {/* rotate starts slightly off to center the 0.5 gap at 12 o'clock */}
                                        <svg width="100%" height="100%" viewBox="0 0 42 42" className="syllabus-donut-rotate">
                                            <circle
                                                cx="21"
                                                cy="21"
                                                r="15.915"
                                                fill="transparent"
                                                stroke="#d3d3d3"
                                                strokeWidth="10"
                                                strokeDasharray="99.5 0.5"
                                                strokeDashoffset="0"
                                            ></circle>
                                            {subject.complete >= 0 && (
                                                <circle
                                                    className="progress-circle"
                                                    cx="21"
                                                    cy="21"
                                                    r="15.915"
                                                    fill="transparent"
                                                    stroke="#4CAF50"
                                                    strokeWidth="10"
                                                    strokeDashoffset={100 - subject.complete}
                                                ></circle>
                                            )}
                                        </svg>
                                    </div>
                                    <div className="complete-badge">Complete {subject.complete} %</div>
                                </div>
                            ))}
                        </div>

                        <div className="action-icons-row syllabus-action-row">
                            <div className="icon-btn syllabus-icon-btn" title="Export" onClick={handleExportCSV}>
                                <i className="fa fa-file-excel-o syllabus-icon-btn-icon"></i>
                            </div>
                            <div className="icon-btn syllabus-icon-btn" title="Print" onClick={handlePrint}>
                                <i className="fa fa-print syllabus-icon-btn-icon"></i>
                            </div>
                        </div>

                        <div className="report-header">Subject - Lesson - Topic Status</div>
                        <div className="report-list">
                            {subjectsData.map((subject, idx) => (
                                <div key={idx} className="report-item">
                                    <div className="report-subject">{subject.name}</div>
                                    <div className="report-percent">{subject.complete}% Complete</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default SyllabusStatus;
