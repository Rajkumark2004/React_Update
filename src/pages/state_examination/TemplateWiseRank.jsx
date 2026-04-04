import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { useSession } from "../../context/SessionContext";
import { api } from "../../services/api";
import toast from "react-hot-toast";

const TemplateWiseRank = () => {
    const { id: templateId } = useParams();
    const { currentSession } = useSession();

    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [templateDetails, setTemplateDetails] = useState(null);
    const [studentList, setStudentList] = useState([]);
    const [schSetting, setSchSetting] = useState({});
    const [hasRanksGenerated, setHasRanksGenerated] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (templateId) {
            fetchTemplateRankData();
        }
    }, [templateId]);

    const fetchTemplateRankData = async () => {
        setLoading(true);
        try {
            const response = await api.getCBSETemplateWiseRank(templateId);
            if (response && response.status) {
                setSchSetting(response.school_setting || {});
                setTemplateDetails(response.template || {});
                const students = response.student_list || [];
                setStudentList(students);

                const exists = students.some(s => s.rank !== null && s.rank !== "" && s.rank !== undefined);
                setHasRanksGenerated(exists);
            } else {
                toast.error(response.message || "Failed to fetch rank data");
            }
        } catch (error) {
            console.error("Error fetching template rank data:", error);
            toast.error("An error occurred while fetching data.");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateRank = async (e) => {
        e.preventDefault();
        setGenerating(true);
        try {
            if (selectedStudents.length === 0) {
                toast.error("Please select at least one student.");
                setGenerating(false);
                return;
            }

            const payload = {
                cbse_template_id: parseInt(templateId),
                student_session_id: selectedStudents
            };

            const response = await api.generateCBSETemplateWiseRank(payload);
            if (response && response.status) {
                toast.success(response.message || "Rank Generated Successfully");
                fetchTemplateRankData();
            } else {
                toast.error("Failed to generate rank. " + (response.message || ""));
            }
        } catch (error) {
            console.error("Error generating rank:", error);
            toast.error("An error occurred while generating rank.");
        } finally {
            setGenerating(false);
        }
    };

    const handleSelectStudent = (id) => {
        setSelectedStudents(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedStudents(filteredStudents.map(s => parseInt(s.student_session_id)));
        } else {
            setSelectedStudents([]);
        }
    };

    const filteredStudents = studentList.filter(s => {
        const fullName = `${s.firstname} ${s.middlename || ""} ${s.lastname || ""}`.toLowerCase();
        const admissionNo = (s.admission_no || "").toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) || admissionNo.includes(searchTerm.toLowerCase());
    });

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

    if (loading) {
        return (
            <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Header />
                <Sidebar />
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
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">
                                        Generate Rank : {templateDetails?.name}
                                    </h3>
                                </div>

                                <div className="box-body">
                                    <div className="row" style={{ marginBottom: '10px' }}>
                                        <div className="col-md-6">
                                            <div className="download_label">Generate Rank</div>
                                        </div>
                                        <div className="col-md-6 text-right">
                                            <input
                                                type="search"
                                                placeholder="Search..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                style={{ border: 'none', borderBottom: '1px solid #ccc', outline: 'none', padding: '5px 0', background: 'transparent', width: '200px' }}
                                            />
                                        </div>
                                    </div>

                                    {hasRanksGenerated && (
                                        <div className="alert alert-info" role="alert">
                                            Rank has already generated, you can update rank
                                        </div>
                                    )}

                                    {studentList && studentList.length > 0 ? (
                                        <form onSubmit={handleGenerateRank} id="rankgenerate">
                                            <input type="hidden" name="cbse_template_id" value={templateId} />

                                            <div className="table-responsive">
                                                <table
                                                    className="table table-striped table-bordered table-hover"
                                                    cellSpacing="0"
                                                    width="100%"
                                                >
                                                    <thead>
                                                        <tr>
                                                            <th width="30">
                                                                <input
                                                                    type="checkbox"
                                                                    onChange={handleSelectAll}
                                                                    checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length}
                                                                />
                                                            </th>
                                                            <th>Admission No</th>
                                                            <th>Student Name</th>
                                                            <th>Class</th>
                                                            <th>Father Name</th>
                                                            <th>Date Of Birth</th>
                                                            <th>Gender</th>
                                                            <th className="">Mobile No</th>
                                                            <th className="text-center">Rank</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredStudents.map((student, index) => (
                                                            <tr key={index}>
                                                                <td>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedStudents.includes(parseInt(student.student_session_id))}
                                                                        onChange={() => handleSelectStudent(parseInt(student.student_session_id))}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        type="hidden"
                                                                        name="student_session_id[]"
                                                                        value={student.student_session_id}
                                                                    />
                                                                    {student.admission_no}
                                                                </td>
                                                                <td>
                                                                    <Link to={`/student/view/${student.id}`}>
                                                                        {getFullName(student)}
                                                                    </Link>
                                                                </td>
                                                                <td>
                                                                    {student.class} ({student.section})
                                                                </td>
                                                                <td>{student.father_name}</td>
                                                                <td>{formatDate(student.dob)}</td>
                                                                <td style={{ textTransform: 'capitalize' }}>{student.gender}</td>
                                                                <td>{student.mobileno}</td>
                                                                <td className="text-center">{student.rank}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="col-sm-12">
                                                <div className="form-group" style={{ marginTop: '10px' }}>
                                                    <button
                                                        type="submit"
                                                        name="search"
                                                        className="btn btn-primary pull-right btn-sm checkbox-toggle"
                                                        disabled={generating}
                                                    >
                                                        <i
                                                            className={`fa ${generating
                                                                ? "fa-spinner fa-spin"
                                                                : ""
                                                                }`}
                                                        ></i>{" "}
                                                        {generating ? "Generating..." : "Generate Rank"}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="box-body row">
                                            <div className="col-md-12">
                                                <div className="alert alert-danger">No record found</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <Footer />
        </div>
    );
};

export default TemplateWiseRank;
