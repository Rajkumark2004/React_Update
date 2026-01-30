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

    // Mock exam data
    const exams = [
        { id: '1', name: 'First Term Exam' },
        { id: '2', name: 'Mid Term Exam' },
        { id: '3', name: 'Final Term Exam' },
    ];

    // Mock student results data
    const mockResults = {
        '1': [
            { id: 101, student_session_id: 'ss_101', admission_no: '1001', firstname: 'John', middlename: '', lastname: 'Doe', class: 'Class 1', section: 'A', father_name: 'Robert Doe', dob: '2010-05-15', gender: 'Male', mobileno: '9876543210', rank: 1 },
            { id: 102, student_session_id: 'ss_102', admission_no: '1002', firstname: 'Sarah', middlename: 'Jane', lastname: 'Smith', class: 'Class 1', section: 'A', father_name: 'James Smith', dob: '2010-08-20', gender: 'Female', mobileno: '9876543211', rank: 2 },
            { id: 103, student_session_id: 'ss_103', admission_no: '1003', firstname: 'Michael', middlename: 'Anthony', lastname: 'Brown', class: 'Class 1', section: 'B', father_name: 'David Brown', dob: '2010-02-10', gender: 'Male', mobileno: '9876543212', rank: 3 },
        ],
        '2': [
            { id: 201, student_session_id: 'ss_201', admission_no: '2001', firstname: 'Alice', middlename: '', lastname: 'Johnson', class: 'Class 2', section: 'B', father_name: 'Tom Johnson', dob: '2009-03-12', gender: 'Female', mobileno: '9876543220', rank: 1 },
        ],
        '3': []
    };

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

    const appName = "Smart School";
    const userData = {
        name: "Joe",
        pimage: "/images/userprofile.jpg",
        role: "Super Admin"
    };

    const sidebarMenus = [
        { id: 1, icon: 'helpdesk.png', label: 'Help Desk', url: '#' },
        { id: 2, icon: 'sis.png', label: 'SIS', url: '/student/search' },
        { id: 5, icon: 'state_examination.png', label: 'State Examinations', url: '/cbseexam/exam' }
    ];

    return (
        <div className="wrapper" style={{ height: 'auto', minHeight: '100%' }}>
            <Header appName={appName} userData={userData} />
            <Sidebar menus={sidebarMenus} />

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
