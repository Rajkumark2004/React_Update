import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import '../../utils/include_files';

const SendReminders = () => {
    const navigate = useNavigate();

    // Form states
    const [classId, setClassId] = useState('');
    const [sectionId, setSectionId] = useState('');
    const [showResult, setShowResult] = useState(false);

    // Data states
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [groupedStudents, setGroupedStudents] = useState({});
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [checkAll, setCheckAll] = useState(false);

    // Search and Pagination states
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Mock data initialization
    useEffect(() => {
        setClasses([
            { id: 1, class: 'Nursery' },
            { id: 2, class: 'L.K.G' },
            { id: 3, class: 'U.K.G' },
            { id: 4, class: 'Class 1' },
            { id: 5, class: 'Class 2' },
            { id: 6, class: 'Class 3' },
            { id: 7, class: 'Class 4' },
            { id: 8, class: 'Class 5' },
            { id: 9, class: 'Class 6' },
            { id: 10, class: 'Class 7' },
            { id: 11, class: 'Class 8' },
            { id: 12, class: 'Class 9' },
            { id: 13, class: 'Class 10' },
            { id: 14, class: 'Class 11' },
            { id: 15, class: 'Class 12' }
        ]);

        setSections([
            { id: 1, section: 'A' },
            { id: 2, section: 'B' },
            { id: 3, section: 'C' },
            { id: 4, section: 'D' },
            { id: 5, section: 'E' },
            { id: 6, section: 'F' }
        ]);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        // Mocking the PHP 'resultarray' structure: { "Group Name": [students...] }
        const mockData = {
            "Class 1 ( A )": [
                {
                    id: 1,
                    student_session_id: 101,
                    admission_no: '18001',
                    name: 'John Doe',
                    class: 'Class 1',
                    section: 'A',
                    roll_no: '101',
                    father_name: 'Robert Doe',
                    father_phone: '9876543210',
                    feetypeBalances: { 'Tution Fee': 5000, 'Late Fee': 200, 'Exam Fee': 1000 },
                    balance: 6200
                },
                {
                    id: 2,
                    student_session_id: 102,
                    admission_no: '18002',
                    name: 'Jane Smith',
                    class: 'Class 1',
                    section: 'A',
                    roll_no: '102',
                    father_name: 'Samuel Smith',
                    father_phone: '9876543211',
                    feetypeBalances: { 'Tution Fee': 3000, 'Late Fee': 0, 'Exam Fee': 500 },
                    balance: 3500
                }
            ],
            "Class 1 ( B )": [
                {
                    id: 3,
                    student_session_id: 103,
                    admission_no: '18003',
                    name: 'Robert Wilson',
                    class: 'Class 1',
                    section: 'B',
                    roll_no: '201',
                    father_name: 'David Wilson',
                    father_phone: '9876543212',
                    feetypeBalances: { 'Tution Fee': 4500, 'Late Fee': 100, 'Exam Fee': 0 },
                    balance: 4600
                }
            ]
        };
        setGroupedStudents(mockData);
        setShowResult(true);
    };

    // Flatten logic for search and select all
    const allStudents = Object.values(groupedStudents).flat();

    const filteredStudents = allStudents.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.admission_no.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCheckAll = () => {
        const newCheckAll = !checkAll;
        setCheckAll(newCheckAll);
        if (newCheckAll) {
            setSelectedStudents(filteredStudents.map(s => s.student_session_id));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleStudentCheck = (sessionId) => {
        if (selectedStudents.includes(sessionId)) {
            const nextSelected = selectedStudents.filter(id => id !== sessionId);
            setSelectedStudents(nextSelected);
            setCheckAll(false);
        } else {
            const nextSelected = [...selectedStudents, sessionId];
            setSelectedStudents(nextSelected);
            if (nextSelected.length === filteredStudents.length) {
                setCheckAll(true);
            }
        }
    };

    const handleSendReminder = () => {
        if (selectedStudents.length === 0) {
            alert('Please select at least one student.');
            return;
        }

        // Collate data to send (similar to PHP AJAX)
        const studentsToSend = allStudents
            .filter(s => selectedStudents.includes(s.student_session_id))
            .map(s => ({
                stu_session_id: s.student_session_id,
                father_phone: s.father_phone,
                balance: s.balance,
                name: s.name,
                adno: s.admission_no,
                class: s.class
            }));

        console.log('Sending Reminders for:', studentsToSend);
        alert(`Reminders sent successfully for ${studentsToSend.length} students!`);
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Grouping current items for display
    const groupedCurrentItems = currentItems.reduce((acc, student) => {
        const key = `${student.class} ( ${student.section} )`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(student);
        return acc;
    }, {});

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '658px', marginTop: '16px' }}>
                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header with-border">
                                    <h3 className="box-title"><i className="fa fa-search"></i> Select Criteria</h3>
                                    <div className="btn-group pull-right">
                                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-xs">
                                            <i className="fa fa-arrow-left"></i> Back
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <form onSubmit={handleSearch}>
                                        <div className="row">
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label>Class</label>
                                                    <select
                                                        autoFocus
                                                        className="form-control"
                                                        value={classId}
                                                        onChange={(e) => setClassId(e.target.value)}
                                                    >
                                                        <option value="">Select</option>
                                                        {classes.map(c => (
                                                            <option key={c.id} value={c.id}>{c.class}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label>Section</label>
                                                    <select
                                                        className="form-control"
                                                        value={sectionId}
                                                        onChange={(e) => setSectionId(e.target.value)}
                                                    >
                                                        <option value="">Select</option>
                                                        {sections.map(s => (
                                                            <option key={s.id} value={s.id}>{s.section}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-3" style={{ marginTop: '25px' }}>
                                                <button type="submit" className="btn btn-primary btn-sm">
                                                    <i className="fa fa-search"></i> Search
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                {showResult && (
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="box-header ptbnull">
                                                <h3 className="box-title titlefix"><i className="fa fa-users"></i> Un-paid Fees Students List</h3>
                                                <button onClick={handleSendReminder} type="button" className="btn btn-primary btn-sm pull-right">Send Reminder</button>
                                            </div>

                                            <div className="box-body" style={{ overflow: 'visible' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                                                    <div className="dataTables_filter" style={{ textAlign: 'left', width: '300px' }}>
                                                        <input
                                                            type="search"
                                                            placeholder="Search..."
                                                            className="form-control"
                                                            value={searchTerm}
                                                            onChange={(e) => {
                                                                setSearchTerm(e.target.value);
                                                                setCurrentPage(1);
                                                            }}
                                                            style={{ border: '0', borderBottom: '1px solid #f4f4f4', background: 'transparent', boxShadow: 'none' }}
                                                        />
                                                    </div>
                                                    <div className="dt-buttons btn-group">
                                                        <a className="btn btn-default buttons-copy buttons-html5 btn-sm" title="Copy"><span><i className="fa fa-files-o"></i></span></a>
                                                        <a className="btn btn-default buttons-csv buttons-html5 btn-sm" title="CSV"><span><i className="fa fa-file-text-o"></i></span></a>
                                                        <a className="btn btn-default buttons-excel buttons-html5 btn-sm" title="Excel"><span><i className="fa fa-file-excel-o"></i></span></a>
                                                        <a className="btn btn-default buttons-pdf buttons-html5 btn-sm" title="PDF"><span><i className="fa fa-file-pdf-o"></i></span></a>
                                                        <a className="btn btn-default buttons-print btn-sm" title="Print"><span><i className="fa fa-print"></i></span></a>
                                                        <a className="btn btn-default buttons-collection buttons-colvis btn-sm" title="Columns"><span><i className="fa fa-columns"></i></span></a>
                                                    </div>
                                                </div>

                                                <div style={{ overflow: 'visible' }}>
                                                    <table className="table table-striped table-hover" style={{ width: '100%' }}>
                                                        <thead>
                                                            <tr>
                                                                <th style={{ width: '100px' }}>Select All<br /><input type="checkbox" checked={checkAll} onChange={handleCheckAll} /></th>
                                                                <th>S.No</th>
                                                                <th>Ad no</th>
                                                                <th>Class</th>
                                                                <th>Roll No</th>
                                                                <th>Student Name</th>
                                                                <th>Father Name</th>
                                                                <th>Father Phone</th>
                                                                {allStudents.length > 0 && Object.keys(allStudents[0].feetypeBalances).map(type => (
                                                                    <th key={type}>{type}</th>
                                                                ))}
                                                                <th className="text-right">Balance</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {Object.entries(groupedCurrentItems).map(([groupTitle, students]) => (
                                                                <React.Fragment key={groupTitle}>
                                                                    <tr>
                                                                        <td style={{ fontWeight: 'bold' }} colSpan="3">{groupTitle}</td>
                                                                        <td colSpan={6 + (allStudents.length > 0 ? Object.keys(allStudents[0].feetypeBalances).length : 0)}></td>
                                                                    </tr>
                                                                    {students.map((student, index) => (
                                                                        <tr key={student.student_session_id}>
                                                                            <td>
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={selectedStudents.includes(student.student_session_id)}
                                                                                    onChange={() => handleStudentCheck(student.student_session_id)}
                                                                                />
                                                                            </td>
                                                                            <td>{indexOfFirstItem + index + 1}</td>
                                                                            <td>{student.admission_no}</td>
                                                                            <td>{`${student.class} ( ${student.section} )`}</td>
                                                                            <td>{student.roll_no}</td>
                                                                            <td>{student.name}</td>
                                                                            <td>{student.father_name}</td>
                                                                            <td>{student.father_phone}</td>
                                                                            {Object.values(student.feetypeBalances).map((bal, i) => (
                                                                                <td key={i}>{bal.toFixed(2)}</td>
                                                                            ))}
                                                                            <td className="text-right">{student.balance.toFixed(2)}</td>
                                                                        </tr>
                                                                    ))}
                                                                </React.Fragment>
                                                            ))}
                                                            {filteredStudents.length === 0 && (
                                                                <tr>
                                                                    <td colSpan="12" className="text-center">No record found</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                <div className="row" style={{ marginTop: '10px' }}>
                                                    <div className="col-sm-5">
                                                        <div className="dataTables_info" role="status" aria-live="polite" style={{ fontSize: '11px', color: '#666' }}>
                                                            Records: {filteredStudents.length === 0 ? '0 to 0 of 0' : `${indexOfFirstItem + 1} to ${Math.min(indexOfLastItem, filteredStudents.length)} of ${filteredStudents.length}`}
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-7">
                                                        <div className="pull-right">
                                                            <ul className="pagination" style={{ margin: '0', float: 'right' }}>
                                                                <li className={`paginate_button previous ${currentPage === 1 ? 'disabled' : ''}`}>
                                                                    <a href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) paginate(currentPage - 1); }}>
                                                                        <i className="fa fa-angle-left"></i>
                                                                    </a>
                                                                </li>
                                                                {[...Array(totalPages)].map((_, i) => (
                                                                    <li key={i} className={`paginate_button ${currentPage === i + 1 ? 'active' : ''}`}>
                                                                        <a href="#" onClick={(e) => { e.preventDefault(); paginate(i + 1); }}>{i + 1}</a>
                                                                    </li>
                                                                ))}
                                                                <li className={`paginate_button next ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                                                                    <a href="#" onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) paginate(currentPage + 1); }}>
                                                                        <i className="fa fa-angle-right"></i>
                                                                    </a>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default SendReminders;
