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
            console.log("Print Admit Card Response:", response);

            // The PHP backend returns status: "1" as a string, or 1 as an integer
            if (response && (response.status == "1" || response.status == 1) && response.page) {
                Popup(response.page);
            } else if (response && response.page && !response.error) {
                // Fallback: If page exists and no error, it's likely a success even if status is missing
                Popup(response.page);
            } else {
                const errorMsg = response?.error || "Backend returned success false or empty result.";
                alert(`Error: ${errorMsg}\n\nResponse: ${JSON.stringify(response)}`);
            }
        } catch (error) {
            console.error("Error generating admit card:", error);
            alert(error.message || "Network error or server failed to respond.");
        } finally {
            setGenerating(false);
        }
    };

    const Popup = (data) => {
        const frame1 = document.createElement('iframe');
        frame1.name = "frame1";
        frame1.style.position = "absolute";
        frame1.style.top = "-1000000px";
        document.body.appendChild(frame1);

        const doc = frame1.contentWindow.document;
        doc.open();
        doc.write('<html><head><title>Print Admit Card</title>');
        // Include some basic styles to ensure it looks okay in the print preview
        doc.write('<style>body { font-family: Arial, sans-serif; }</style>');
        doc.write('</head><body>');
        doc.write(data);
        doc.write('</body></html>');
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
            <div className="wrapper theme-white-skin">
                <Header appName={appName} userData={userData} />
                <Sidebar sessionYear={currentSession?.session} />
                <div className="content-wrapper">
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
        <div className="wrapper theme-white-skin">
            <Header appName={appName} userData={userData} />
            <Sidebar sessionYear={currentSession?.session} />

            <div className="content-wrapper">
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
