import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { api } from "../../services/api";
import { useSession } from "../../context/SessionContext";

const ExamWiseRank = () => {
  const { id: examId } = useParams();
  const navigate = useNavigate();
  const { currentSession } = useSession();

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [examDetails, setExamDetails] = useState(null);
  const [studentList, setStudentList] = useState([]);
  const [schSetting, setSchSetting] = useState({});
  const [hasRanksGenerated, setHasRanksGenerated] = useState(false);

  useEffect(() => {
    if (examId) {
      fetchExamRankData();
    }
  }, [examId]);

  const fetchExamRankData = async () => {
    setLoading(true);
    try {
      const response = await api.getExamRank(examId);

      if (response && response.status && response.data) {
        const data = response.data;
        setSchSetting(data.sch_setting || {});
        setExamDetails(data.exam || {});
        const students = data.studentList || [];
        setStudentList(students);

        const exists = students.some(s => s.rank !== null && s.rank !== "" && s.rank !== undefined);
        setHasRanksGenerated(exists);
      }
    } catch (error) {
      console.error("Error fetching exam rank data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRank = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const payload = {
        exam_id: examId
      };

      const response = await api.generateExamRank(payload);
      if (response && response.status) {
        alert(response.message || "Rank Generated Successfully");
        fetchExamRankData();
      } else {
        alert("Failed to generate rank. " + (response.message || ""));
      }
    } catch (error) {
      console.error("Error generating rank:", error);
      alert("An error occurred while generating rank.");
    } finally {
      setGenerating(false);
    }
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



  if (loading) {
    return (
      <div className="wrapper theme-white-skin">
        <Header />
        <Sidebar />
        <div className="content-wrapper" style={{ marginTop: '0px' }}>
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
      <Header />
      <Sidebar />

      <div className="content-wrapper" style={{ marginTop: '0px' }}>
        <section className="content">
          <div className="row">
            <div className="col-md-12">
              <div className="box box-primary">
                <div className="box-header ptbnull">
                  <h3 className="box-title titlefix">
                    Generate Rank : {examDetails?.name}
                  </h3>
                  <div className="box-tools pull-right">
                    <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs" style={{ marginTop: '5px' }}>
                      <i className="fa fa-arrow-left"></i> Back
                    </button>
                  </div>
                </div>

                <div className="box-body">
                  <div className="download_label">Generate Rank</div>

                  {hasRanksGenerated && (
                    <div className="alert alert-info" role="alert">
                      Rank has already generated, you can update rank
                    </div>
                  )}

                  {studentList && studentList.length > 0 ? (
                    <form onSubmit={handleGenerateRank} id="rankgenerate">
                      <input type="hidden" name="exam_id" value={examId} />

                      <div className="table-responsive">
                        <table
                          className="table table-striped table-bordered table-hover"
                          cellSpacing="0"
                          width="100%"
                        >
                          <thead>
                            <tr>
                              <th>Admission No</th>
                              <th>Student Name</th>
                              <th>Class</th>
                              <th>Father Name</th>
                              <th>Date Of Birth</th>
                              <th>Gender</th>
                              <th>Mobile No</th>
                              <th className="text-center">Rank</th>
                            </tr>
                          </thead>
                          <tbody>
                            {studentList.map((student, index) => (
                              <tr key={index}>
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
                        <div className="form-group">
                          <button
                            type="submit"
                            name="search"
                            className="btn btn-primary pull-right btn-sm checkbox-toggle"
                            disabled={generating}
                          >
                            <i
                              className={`fa ${generating
                                ? "fa-spinner fa-spin"
                                : "fa-search"
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

export default ExamWiseRank;
