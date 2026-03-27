import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';

const ExamRank = () => {
    const { sessionYear } = useSession();
    const navigate = useNavigate();
    const [selectedExam, setSelectedExam] = useState('');
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [studentList, setStudentList] = useState([]);
    const [searchPerformed, setSearchPerformed] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!selectedExam) {
            alert('Please select an exam');
            return;
        }
        setLoading(true);
        setSearchPerformed(true);

        // Simulate API call
        setTimeout(() => {
            setStudentList(mockResults[selectedExam] || []);
            setLoading(false);
        }, 500);
    };

    const handleGenerateRank = (e) => {
        e.preventDefault();
        setGenerating(true);
        // Simulate rank generation
        setTimeout(() => {
            alert('Rank generated successfully!');
            setGenerating(false);
            // In real app, we would refresh the list
            handleSearch(e);
        }, 800);
    };

    return (
        <div className="wrapper" style={{ height: 'auto', minHeight: '100%' }}>
            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ minHeight: '946px' }}>
                <section className="content-header">
                    <h1>
                        <i className="fa fa-map-o"></i> examinations <small>student fee1</small>
                    </h1>
                </section>

                <section className="content" style={{ marginTop: '30px' }}>
                    {/* Placeholder for _generate_rank view if any */}

                    <div className="row">
                        <div className="col-md-12">
                            <div className="box removeboxmius">
                                <div className="box-header with-border">
                                    <h3 className="box-title"><i className="fa fa-search"></i> exam wise rank</h3>
                                </div>
                                <div className="box-body">
                                    <form onSubmit={handleSearch} className="row class_search_form">
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label>exam</label><small className="req"> *</small>
                                                <select
                                                    className="form-control"
                                                    value={selectedExam}
                                                    onChange={(e) => setSelectedExam(e.target.value)}
                                                >
                                                    <option value="">select</option>
                                                    {exams.map(exam => (
                                                        <option key={exam.id} value={exam.id}>{exam.name}</option>
                                                    ))}
                                                </select>
                                                {!selectedExam && searchPerformed && <span className="text-danger">The exam field is required.</span>}
                                            </div>
                                        </div>
                                        <div className="col-sm-12">
                                            <div className="form-group">
                                                <button type="submit" name="search" value="search_full" className="btn btn-primary pull-right btn-sm" disabled={loading}>
                                                    <i className="fa fa-search"></i> {loading ? 'Searching...' : 'search'}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                <div className="studentlist">
                                    {loading ? (
                                        <div className="text-center" style={{ padding: '50px' }}>
                                            <i className="fa fa-spinner fa-spin fa-3x"></i>
                                            <p style={{ marginTop: '10px' }}>Loading...</p>
                                        </div>
                                    ) : (
                                        searchPerformed && (
                                            studentList.length > 0 ? (
                                                <form onSubmit={handleGenerateRank} id="rankgenerate">
                                                    <input type="hidden" name="exam_id" value={selectedExam} />
                                                    <div className="box-header ptbnull"></div>
                                                    <div className="box-body">
                                                        <div className="tab-pane active table-responsive no-padding">
                                                            <table className="table table-striped table-bordered table-hover" cellspacing="0" width="100%">
                                                                <thead>
                                                                    <tr>
                                                                        <th>admission no</th>
                                                                        <th>student name</th>
                                                                        <th>class</th>
                                                                        <th>father name</th>
                                                                        <th>date of birth</th>
                                                                        <th>gender</th>
                                                                        <th>mobile no</th>
                                                                        <th className="text-center">Rank</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {studentList.map(student => (
                                                                        <tr key={student.id}>
                                                                            <td>
                                                                                <input type="hidden" name="student_session_id[]" value={student.student_session_id} />
                                                                                {student.admission_no}
                                                                            </td>
                                                                            <td>
                                                                                <a href={`/student/view/${student.id}`}>
                                                                                    {`${student.firstname} ${student.middlename} ${student.lastname}`.trim().replace(/\s+/g, ' ')}
                                                                                </a>
                                                                            </td>
                                                                            <td>{`${student.class}(${student.section})`}</td>
                                                                            <td>{student.father_name}</td>
                                                                            <td>{student.dob}</td>
                                                                            <td>{student.gender}</td>
                                                                            <td>{student.mobileno}</td>
                                                                            <td className="text-center">{student.rank}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                        <div className="col-sm-12">
                                                            <div className="form-group" style={{ marginTop: '15px' }}>
                                                                <button type="submit" name="search" className="btn btn-primary pull-right btn-sm" disabled={generating}>
                                                                    <i className="fa fa-search"></i> {generating ? 'Processing...' : 'Generate Rank'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div className="box-body row">
                                                    <div className="col-md-12">
                                                        <div className="alert alert-danger">
                                                            no record found
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )
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

export default ExamRank;
