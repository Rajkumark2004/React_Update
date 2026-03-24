
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import { api_users } from '../../services/api_users';
import '../../utils/include_files.js';

const StateExamResult = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    const [userData, setUserData] = useState({
        name: "User",
        role: "Student",
        id: "",
        avatar: "/uploads/student_images/no_image.png",
        adminLogoUrl: ""
    });

    const sessionYear = currentSession?.session || '2024-25';
    const themeColor = "#9c68e4";

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                let initialName = "User";
                if (storedUser) {
                    const userObj = JSON.parse(storedUser);
                    initialName = userObj.username || "User";
                    setUserData(prev => ({
                        ...prev,
                        name: initialName,
                        role: userObj.role || 'Student',
                        avatar: userObj.image || "/uploads/student_images/no_image.png"
                    }));
                }
                const res = await api_users.getUserDashboard();
                if (res && res.status && res.data && res.data.student) {
                    setUserData(prev => ({
                        ...prev,
                        name: res.data.student.name || initialName,
                        id: res.data.student.id || prev.id,
                        adminLogoUrl: res.data.sch_setting?.admin_logo && res.data.sch_setting?.base_url
                            ? `${res.data.sch_setting.base_url}uploads/school_content/admin_logo/${res.data.sch_setting.admin_logo}`
                            : ""
                    }));
                }
            } catch (error) {
                console.error("Failed to load user data:", error);
            }
        };
        fetchUserData();
    }, []);

    const handleLogout = async () => {
        try {
            await api_users.userLogout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            clearSession();
            localStorage.removeItem('user');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('token');
            navigate('/user/login');
        }
    };

    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExamResult = async () => {
            setLoading(true);
            try {
                const response = await api_users.getExamResult();
                if (response && response.status && response.data && response.data.exams) {
                    const formattedExams = response.data.exams.map(exam => {
                        const assessments = exam.exam_assessments || [];
                        const subjectsData = exam.exam_data?.subjects || {};
                        const grades = exam.grades || [];

                        let examTotalMarks = 0;
                        let examMaxMarks = 0;

                        const subjects = Object.values(subjectsData).map(sub => {
                            let subTotal = 0;
                            const marks = assessments.map(ast => {
                                const markObj = sub.exam_assessments?.[ast.id];
                                if (markObj) {
                                    const m = parseFloat(markObj.marks) || 0;
                                    subTotal += m;
                                    examTotalMarks += m;
                                    examMaxMarks += parseFloat(ast.maximum_marks) || 0;
                                    return markObj.is_absent === "1" ? "ABS" : markObj.marks;
                                }
                                return "";
                            });

                            return {
                                id: sub.subject_id,
                                name: sub.subject_name.replace('-', ''), // Remove trailing hyphens if any
                                code: sub.subject_code,
                                marks: marks,
                                total: subTotal
                            };
                        });

                        const percentage = examMaxMarks > 0 ? (examTotalMarks / examMaxMarks) * 100 : 0;

                        const calculateGrade = (percent) => {
                            if (grades.length === 0) return "-";
                            // Finding grade based on percentage range
                            const match = grades.find(g => percent <= parseFloat(g.minimum_percentage) && percent >= parseFloat(g.maximum_percentage));
                            return match ? match.name : "-";
                        };

                        return {
                            id: exam.id,
                            name: exam.name,
                            assessments: assessments,
                            subjects: subjects,
                            total_marks: `${examTotalMarks.toFixed(2)} / ${examMaxMarks.toFixed(2)}`,
                            percentage: percentage.toFixed(2),
                            grade: calculateGrade(percentage),
                            rank: exam.rank || "-"
                        };
                    });
                    setExams(formattedExams);
                }
            } catch (error) {
                console.error("Failed to fetch exam result:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchExamResult();
    }, []);

    return (
        <>
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
                    padding-top: 20px !important;
                    margin-top: 40px !important;
                    padding-right: 16px;
                    min-height: calc(100vh - 50px);
                }

                .box-primary {
                    background: #fff;
                    border-radius: 4px;
                    border: 1px solid #eee !important;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1) !important;
                    margin: 5px 80px 30px 10px;
                }

                .box-header {
                    padding: 10px 17px 10px 17px;
                    border-bottom: 1px solid #f4f4f4;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .box-title {
                   margin: 0;
                    font-size: 20px;
                    font-weight: 400;
                    color: #333;
                    flex: 1;
                }

                .box-body {
                    padding: 0px 15px 0px 15px;
                }

                .shadow-sm {
                    margin-bottom: 0px;
                    border-radius: 4px;
                }

                .pagetitleh2 {
                    font-size: 16px;
                    font-weight: 500;
                    background: #f4f4f4;
                    padding: 10px 15px;
                    margin: 10px 0 0 0;
                    color: #444;
                    text-align: center;
                }

                .table-bordered {
                    border: 1px solid #eee;
                }

                .table-bordered > thead > tr > th,
                .table-bordered > tbody > tr > th,
                .table-bordered > tfoot > tr > th,
                .table-bordered > thead > tr > td,
                .table-bordered > tbody > tr > td,
                .table-bordered > tfoot > tr > td {
                    border: 1px solid #eee;
                    padding: 8px 12px;
                    vertical-align: middle;
                    font-size: 13px;
                }

                .bg-gray-light {
                    background-color: #f9f9f9;
                }

                .bolds {
                    font-weight: bold;
                }

                .table-responsive {
                    border: none;
                }
                
                .btn-print {
                    background: #f2f2f2;
                    border: 1px solid #ccc;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s;
                }
                .btn-print:hover {
                    background: #e7e7e7;
                }

                .alert-info-custom {
                    background-color: #d9edf7;
                    border: 1px solid #bce8f1;
                    color: #31708f;
                    padding: 15px;
                    border-radius: 4px;
                    text-align: left;
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
                        padding-top: 18px !important; 
                        padding-bottom:0px !important; 
                        margin-top: 40px !important;
                    }
                    .box-primary { margin: 10px 10px 15px 10px !important; }

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
                        top: 10px !important;
                        right: 10px !important;
                        z-index: 100 !important;
                        text-decoration: none !important;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .btn-print {
                        margin-right: 80px !important;
                    }
                    .content{
                        padding:0px 20px 0px 0px !important;
                    }
                }
                @media (min-width: 770px) {
                    .mobile-box-back-btn { display: none !important; }
                }

                /* Sidebar mega menu cards logic override if needed */
                .fixedmenu { display: none !important; }

                /* StateExamResult page specific */
                .ser-content { padding: 4px; display: flex; flex-direction: column; }
                .ser-box-wrapper { position: relative; }
                .ser-header-actions { display: flex; gap: 10px; align-items: center; }
                .ser-body-padded { padding-bottom: 30px; }
                .ser-loading { padding: 20px; }
                .ser-summary-table { margin-top: -1px; }
                .ser-col-33 { width: 33%; }
                .ser-col-35 { width: 35%; }
                .ser-col-15 { width: 15%; }
                .ser-route-title { margin-top: 0; }
            `}</style>
            <div className="content-wrapper">
                <section className="content ser-content">

                    <div className="box box-primary ser-box-wrapper">
                        <div className="box-header">
                            <h3 className="box-title">State Exam Result</h3>
                            <div className="pull-right ser-header-actions">
                                <button className="mobile-box-back-btn" onClick={() => navigate('/user/dashboard')}>
                                    <i className="fa fa-arrow-left"></i> Back
                                </button>
                                <button className="btn-print" title="Print" onClick={() => window.print()}><i className="fa fa-print"></i></button>
                            </div>
                        </div>
                        <div className="box-body ser-body-padded">
                            {loading ? (
                                <div className="text-center ser-loading">Loading...</div>
                            ) : exams.length === 0 ? (
                                <div className="alert-info-custom">
                                    No Exam Assigned
                                </div>
                            ) : (
                                exams.map(exam => (
                                    <div key={exam.id} className="shadow-sm">
                                        <h3 className="pagetitleh2">{exam.name}</h3>
                                        <div className="table-responsive">
                                            <table className="table table-bordered mb0">
                                                <thead>
                                                    <tr>
                                                        <td className="bolds">Subject</td>
                                                        {exam.assessments.map((ast, idx) => (
                                                            <td key={idx} className="text-center bolds">
                                                                {ast.name} ({ast.code})
                                                                <br />
                                                                (Max {ast.maximum_marks})
                                                            </td>
                                                        ))}
                                                        <td className="bolds">Total</td>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {exam.subjects.map(sub => (
                                                        <tr key={sub.id}>
                                                            <td>{sub.name} ({sub.code})</td>
                                                            {sub.marks.map((mark, idx) => (
                                                                <td key={idx} className="text-center">{mark}</td>
                                                            ))}
                                                            <td className="bolds">{sub.total.toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <table className="table table-bordered mb0 bg-gray-light ser-summary-table">
                                                <tbody>
                                                    <tr>
                                                        <td className="bolds ser-col-33">Total Marks : {exam.total_marks}</td>
                                                        <td className="bolds ser-col-35">Percentage (%) : {exam.percentage}</td>
                                                        <td className="bolds ser-col-15">Grade : {exam.grade}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default StateExamResult;
