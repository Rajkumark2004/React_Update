import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { api } from "../../services/api";
import { useSession } from "../../context/SessionContext";

const GenerateAdmitCard = () => {
    const { id: examId } = useParams();
    const navigate = useNavigate();
    const { currentSession } = useSession();

    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [examDetails, setExamDetails] = useState(null);
    const [studentList, setStudentList] = useState([]);
    const [schSetting, setSchSetting] = useState({});
    const [selectedStudents, setSelectedStudents] = useState([]);

    useEffect(() => {
        if (examId) {
            fetchData();
        }
    }, [examId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Reusing getExamRank as it provides the student list for the exam
            const response = await api.getExamRank(examId);
            if (response && response.status && response.data) {
                const data = response.data;
                setSchSetting(data.sch_setting || {});
                setExamDetails(data.exam || {});
                setStudentList(data.studentList || []);
            }
        } catch (error) {
            console.error("Error fetching admit card data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedStudents(studentList.map(s => s.student_session_id));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleSelectStudent = (studentSessionId) => {
        setSelectedStudents(prev =>
            prev.includes(studentSessionId)
                ? prev.filter(id => id !== studentSessionId)
                : [...prev, studentSessionId]
        );
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (selectedStudents.length === 0) {
            alert("Please select student");
            return;
        }

        setGenerating(true);
        try {
            const payload = {
                exam_id: examId,
                student_session_id: selectedStudents
            };

            const response = await api.printAdmitCard(payload);
            console.log("Print Admit Card Response Debug:", response);

            if (response && (response.status === true || response.status == "1" || response.status == 1)) {
                if (response.data) {
                    // If we get JSON data, generate HTML on frontend
                    console.log("Generating HTML from JSON data...");
                    const html = generateAdmitCardHTML(response.data);
                    Popup(html, true); // true indicates full HTML
                } else if (response.page) {
                    // Backward compatibility for HTML string
                    console.log("Using provided HTML page string...");
                    Popup(response.page, false);
                } else {
                    alert("Error: Backend returned success but no data or page found in response.");
                }
            } else {
                const errorMsg = response?.message || response?.error || "Backend returned success false or empty result.";
                alert(`Error: ${errorMsg}\n\nResponse: ${JSON.stringify(response)}`);
            }
        } catch (error) {
            console.error("Error generating admit card:", error);
            alert(error.message || "Network error or server failed to respond.");
        } finally {
            setGenerating(false);
        }
    };

    const generateAdmitCardHTML = (data) => {
        const { student_details, exam_subjects, school_setting } = data;
        let html = '';

        student_details.forEach((student, index) => {
            const studentImage = student.image
                ? `https://newlayout.wisibles.com/${student.image}`
                : (student.gender === 'Female'
                    ? 'https://newlayout.wisibles.com/uploads/student_images/default_female.jpg'
                    : 'https://newlayout.wisibles.com/uploads/student_images/default_male.jpg');

            html += `
            <div class="mark-container" style="width: 1000px; margin: 0 auto; padding: 20px 30px; font-family: sans-serif; position: relative;">
                <table cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td valign="top">
                            <img src="https://newlayout.wisibles.com/uploads/cbseexam/template/header_image/abadb354d30c61d71659d65cc64cf95e.png" width="100%" />
                        </td>
                    </tr>
                    <tr><td height="10"></td></tr>
                    <tr>
                        <td valign="top">
                            <table cellpadding="0" cellspacing="0" width="100%" style="text-transform: uppercase;">
                                <tr>
                                    <td valign="top">
                                        <table cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td colspan="2" style="font-weight: bold; padding-bottom: 10px; font-size: 18px;">${student.name} (${school_setting.session})</td>
                                                <td style="font-weight: bold; padding-bottom: 10px; text-align: right; font-size: 18px;">Hall - Ticket</td>
                                            </tr>
                                            <tr>
                                                <td width="20%" style="padding-bottom: 10px;">Admission No</td>
                                                <td width="35%" style="font-weight: bold; padding-bottom: 10px;">${student.admission_no}</td>
                                                <td width="15%" style="padding-bottom: 10px;">Class</td>
                                                <td width="30%" style="font-weight: bold; padding-bottom: 10px;">${student.class} (${student.section})</td>
                                            </tr>
                                            <tr>
                                                <td style="padding-bottom: 10px;">Candidate Name</td>
                                                <td style="font-weight: bold; padding-bottom: 10px;">${student.firstname} ${student.middlename || ''} ${student.lastname || ''}</td>
                                                <td style="padding-bottom: 10px;">Roll Number</td>
                                                <td style="font-weight: bold; padding-bottom: 10px;">${student.roll_no || ''}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding-bottom: 10px;">Father's Name</td>
                                                <td style="font-weight: bold; padding-bottom: 10px;">${student.father_name || ''}</td>
                                            </tr>
                                        </table>
                                    </td>
                                    <td valign="top" width="120" align="right">
                                        <img src="${studentImage}" width="100" height="110" style="border: 1px solid #000;">
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr><td height="20"></td></tr>
                    <tr>
                        <td valign="top">
                            <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; border: 1px solid #999;">
                                <thead>
                                    <tr>
                                        <th style="border: 1px solid #999; padding: 8px; text-align: center; text-transform: uppercase; background: #f4f4f4;">Subject</th>
                                        ${exam_subjects.map(sub => `
                                            <th style="border: 1px solid #999; padding: 8px; text-align: center; text-transform: uppercase;">${sub.subject_name}</th>
                                        `).join('')}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th style="border: 1px solid #999; padding: 8px; text-align: center; text-transform: uppercase; background: #f4f4f4;">Date</th>
                                        ${exam_subjects.map(sub => `
                                            <td style="border: 1px solid #999; padding: 8px; text-align: center;">${formatDate(sub.date)}</td>
                                        `).join('')}
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    <tr><td height="60"></td></tr>
                    <tr>
                        <td valign="top">
                            <table cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td valign="bottom" style="border-top: 1px solid #000; width: 250px; text-align: center; padding-top: 5px;">Sign of the Class Teacher / Incharge</td>
                                    <td></td>
                                    <td valign="bottom" width="200" align="right" style="border-top: 1px solid #000; text-align: center; padding-top: 5px;">Sign of the Principal</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </div>
            ${index < student_details.length - 1 ? '<div style="page-break-after: always;"></div>' : ''}
            `;
        });

        return html;
    };

    const Popup = (data, isFullHTML = false) => {
        const frame1 = document.createElement('iframe');
        frame1.name = "frame1";
        frame1.style.position = "absolute";
        frame1.style.top = "-1000000px";
        document.body.appendChild(frame1);

        const doc = frame1.contentWindow.document;
        doc.open();
        if (isFullHTML) {
            doc.write('<html><head><title>Print Admit Card</title>');
            doc.write('<style>@media print { .pagebreak { page-break-after: always; } }</style>');
            doc.write('</head><body style="margin:0; padding:0;">');
            doc.write(data);
            doc.write('</body></html>');
        } else {
            doc.write('<html><head><title>Print Admit Card</title>');
            doc.write('<style>body { font-family: Arial, sans-serif; }</style>');
            doc.write('</head><body>');
            doc.write(data);
            doc.write('</body></html>');
        }
        doc.close();

        setTimeout(() => {
            frame1.contentWindow.focus();
            frame1.contentWindow.print();
            setTimeout(() => {
                document.body.removeChild(frame1);
            }, 1000);
        }, 500);
    };

    const getFullName = (s) => {
        let name = s.firstname;
        if (schSetting.middlename === "1" && s.middlename) {
            name += " " + s.middlename;
        }
        if (schSetting.lastname === "1" && s.lastname) {
            name += " " + s.lastname;
        }
        if (!schSetting.id) {
            return `${s.firstname} ${s.lastname || ''}`;
        }
        return name;
    };

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === "0000-00-00" || dateStr === "") return "";
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    const appName = "Smart School";
    const userData = {
        name: "Joe",
        pimage: "/public/images/userprofile.jpg",
        role: "Super Admin"
    };

    if (loading) {
        return (
            <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Header appName={appName} userData={userData} />
                <Sidebar sessionYear={currentSession?.session} />
                <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                    <div className="text-center" style={{ padding: "100px" }}>
                        <i className="fa fa-spinner fa-spin fa-3x"></i>
                        <p>Loading...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <form onSubmit={handleGenerate} id="printCard">
                                    <div className="box-header ptbnull">
                                        <h3 className="box-title titlefix">
                                            <i className="fa fa-users"></i> Student List
                                        </h3>
                                        <button
                                            className="btn btn-info btn-sm pull-right"
                                            type="submit"
                                            disabled={generating}
                                        >
                                            {generating ? <i className="fa fa-spinner fa-spin"></i> : <i className="fa fa-print"></i>} Generate
                                        </button>
                                    </div>

                                    <div className="box-body">
                                        <div className="download_label">Print Admit Card</div>
                                        {studentList.length > 0 ? (
                                            <div className="table-responsive">
                                                <table className="table table-striped table-bordered table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th className="text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    onChange={handleSelectAll}
                                                                    checked={selectedStudents.length === studentList.length && studentList.length > 0}
                                                                />
                                                            </th>
                                                            <th>Admission No</th>
                                                            <th>Student Name</th>
                                                            <th>Class</th>
                                                            <th>Father Name</th>
                                                            <th>Date Of Birth</th>
                                                            <th>Gender</th>
                                                            <th>Mobile No</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {studentList.map((student, index) => (
                                                            <tr key={index}>
                                                                <td className="text-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedStudents.includes(student.student_session_id)}
                                                                        onChange={() => handleSelectStudent(student.student_session_id)}
                                                                    />
                                                                </td>
                                                                <td>{student.admission_no}</td>
                                                                <td>
                                                                    <Link to={`/student/view/${student.id}`}>
                                                                        {getFullName(student)}
                                                                    </Link>
                                                                </td>
                                                                <td>{student.class} ({student.section})</td>
                                                                <td>{student.father_name}</td>
                                                                <td>{formatDate(student.dob)}</td>
                                                                <td style={{ textTransform: 'capitalize' }}>{student.gender}</td>
                                                                <td>{student.mobileno}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="alert alert-danger">No record found</div>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default GenerateAdmitCard;
