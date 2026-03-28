import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import '../../utils/include_files';
import { useSession } from '../../context/SessionContext';
import { api, API_BASE } from '../../services/api';
import AssignExamStudent from './AssignExamStudent';
import AssignExamSubjects from './AssignExamSubjects';
import TeacherRemark from './TeacherRemark';
import ExamAttendance from './ExamAttendance';
import { copyToClipboard, downloadCSV, downloadExcel, printTable, downloadPDF } from '../../utils/tableExport';

const CBSEExamList = () => {
    const { currentSession } = useSession();
    const navigate = useNavigate();
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSectionOpen, setIsSectionOpen] = useState(false);
    const [selectedSections, setSelectedSections] = useState([]);

    // New Modal States
    const [activeExam, setActiveExam] = useState(null);
    const [modalConfig, setModalConfig] = useState({ show: false, title: '', type: '' });
    const [subModalConfig, setSubModalConfig] = useState({ show: false, subject: null });

    // Exam Form State
    const [examName, setExamName] = useState('');
    const [examDescription, setExamDescription] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedAssessment, setSelectedAssessment] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('');
    const [isPublish, setIsPublish] = useState(false);
    const [isActive, setIsActive] = useState(false);

    // Master Data State
    const [termList, setTermList] = useState([]);
    const [classList, setClassList] = useState([]);
    const [assessmentList, setAssessmentList] = useState([]);
    const [gradeList, setGradeList] = useState([]);
    const [sectionsList, setSectionsList] = useState([]); // Converted to state

    const [subjectsForMarks, setSubjectsForMarks] = useState([]);
    const [marksLoading, setMarksLoading] = useState(false);
    const [subjectStudentResults, setSubjectStudentResults] = useState([]);
    const [assessmentTypesForEntry, setAssessmentTypesForEntry] = useState([]);
    const [entryLoading, setEntryLoading] = useState(false);
    const [schSetting, setSchSetting] = useState({});
    const [entryMarks, setEntryMarks] = useState({}); // { [student_id]: { [type_id]: { marks, is_absent } } }
    const [entryNotes, setEntryNotes] = useState({}); // { [student_id]: note }
    const [csvFile, setCsvFile] = useState(null);
    const [importLoading, setImportLoading] = useState(false);


    const openActionModal = (exam, title, type) => {
        setActiveExam(exam);
        setModalConfig({ show: true, title, type });
        if (type === 'marks') {
            fetchSubjectsForMarks(exam.id);
        }
    };

    const fetchSubjectsForMarks = async (examId) => {
        setMarksLoading(true);
        try {
            const response = await api.getSubjectByExam(examId);
            if (response && response.exam_subjects) {
                setSubjectsForMarks(response.exam_subjects);
            } else {
                setSubjectsForMarks([]);
            }
        } catch (error) {
            console.error("Error fetching subjects for marks:", error);
            setSubjectsForMarks([]);
        } finally {
            setMarksLoading(false);
        }
    };

    const handleEnterMarks = async (subject) => {
        setSubModalConfig({ show: true, subject });
        setEntryLoading(true);
        try {
            const payload = {
                exam_id: activeExam.id,
                subject_id: subject.subject_id,
                timetable_id: subject.id
            };
            const response = await api.getSubjectStudent(payload);
            if (response) {
                const results = Object.values(response.resultlist || {});
                setSubjectStudentResults(results);
                setAssessmentTypesForEntry(response.exam_assessment_types || []);
                setSchSetting(response.sch_setting || {});

                // Initialize entry states
                const initialMarks = {};
                const initialNotes = {};
                results.forEach(student => {
                    const marks = {};
                    let note = '';
                    if (student.marks) {
                        Object.keys(student.marks).forEach(typeId => {
                            const studentMark = student.marks[typeId];
                            marks[typeId] = {
                                marks: studentMark.marks,
                                is_absent: studentMark.is_absent === "1"
                            };
                            if (studentMark.note) note = studentMark.note;
                        });
                    }
                    initialMarks[student.exam_student_id] = marks;
                    initialNotes[student.exam_student_id] = note;
                });
                setEntryMarks(initialMarks);
                setEntryNotes(initialNotes);
            }
        } catch (error) {
            console.error("Error fetching subject students:", error);
        } finally {
            setEntryLoading(false);
        }
    };

    const handleMarkChange = (studentId, typeId, value, maxMarks) => {
        let numericValue = value;
        if (value !== '' && maxMarks !== undefined) {
            const val = parseFloat(value);
            if (val > maxMarks) numericValue = maxMarks.toString();
            if (val < 0) numericValue = "0";
        }
        setEntryMarks(prev => ({
            ...prev,
            [studentId]: {
                ...(prev[studentId] || {}),
                [typeId]: {
                    ...(prev[studentId]?.[typeId] || {}),
                    marks: numericValue
                }
            }
        }));
    };

    const handleAbsentChange = (studentId, typeId, checked) => {
        setEntryMarks(prev => ({
            ...prev,
            [studentId]: {
                ...(prev[studentId] || {}),
                [typeId]: {
                    ...(prev[studentId]?.[typeId] || {}),
                    is_absent: checked,
                    marks: checked ? 0 : (prev[studentId]?.[typeId]?.marks || '')
                }
            }
        }));
    };

    const handleNoteChange = (studentId, value) => {
        setEntryNotes(prev => ({
            ...prev,
            [studentId]: value
        }));
    };

    const handleSaveExamMarks = async () => {
        setEntryLoading(true);
        try {
            const payload = {
                cbse_exam_timetable_id: subModalConfig.subject.id,
                exam_student_id: [],
                exam_student_note: {},
                mark: {},
                absent: {}
            };

            subjectStudentResults.forEach(student => {
                const studentId = student.exam_student_id;
                payload.exam_student_id.push(studentId);

                const marksForStudent = {};
                const absentForStudent = {};

                assessmentTypesForEntry.forEach(type => {
                    const typeId = type.id;
                    const markData = entryMarks[studentId]?.[typeId] || {};

                    if (markData.is_absent) {
                        absentForStudent[typeId] = 1;
                    }
                    marksForStudent[typeId] = markData.marks !== undefined ? markData.marks : '';
                });

                payload.mark[studentId] = marksForStudent;
                if (Object.keys(absentForStudent).length > 0) {
                    payload.absent[studentId] = absentForStudent;
                }
                payload.exam_student_note[studentId] = entryNotes[studentId] || '';
            });

            const response = await api.saveExamMarks(payload);
            if (response && (response.status === 1 || response.status === true)) {
                alert(response.message || 'Marks Saved Successfully');
                setSubModalConfig({ show: false, subject: null });
            } else {
                alert(response.message || 'Failed to save marks');
            }
        } catch (error) {
            console.error("Error saving exam marks:", error);
            alert('An error occurred while saving marks');
        } finally {
            setEntryLoading(false);
        }
    };

    const handleImportMarks = async () => {
        if (!csvFile) {
            alert("Please select a CSV file first.");
            return;
        }
        setImportLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', csvFile);
            formData.append('cbse_exam_timetable_id', subModalConfig.subject.id);
            const response = await api.importExamMarks(formData);
            if (response && (response.status === "1" || response.status === 1 || response.status === true)) {
                const importedMarks = response.student_marks || [];
                const newMarks = { ...entryMarks };
                const newNotes = { ...entryNotes };

                importedMarks.forEach(item => {
                    const data = typeof item === 'string' ? JSON.parse(item) : item;
                    const student = subjectStudentResults.find(s => s.admission_no === data.adm_no);
                    if (student) {
                        const sid = student.exam_student_id;
                        const marksObj = {};
                        assessmentTypesForEntry.forEach((type, idx) => {
                            const pKey = `parameter${idx + 1}`;
                            const aKey = `attendance${idx + 1}`;
                            if (data[pKey] !== undefined) {
                                let val = data[pKey];
                                if (val !== '' && type.maximum_marks !== undefined) {
                                    const numVal = parseFloat(val);
                                    if (numVal > type.maximum_marks) val = type.maximum_marks.toString();
                                    if (numVal < 0) val = "0";
                                }
                                marksObj[type.id] = {
                                    marks: val,
                                    is_absent: data[aKey] === 1 || data[aKey] === "1"
                                };
                            }
                        });

                        newMarks[sid] = {
                            ...newMarks[sid],
                            ...marksObj
                        };
                        if (data.note !== undefined) newNotes[sid] = data.note;
                    }
                });
                setEntryMarks(newMarks);
                setEntryNotes(newNotes);
                alert("CSV file uploaded successfully.");
            } else {
                let errorMsg = "Failed to import marks";
                if (response.error) {
                    if (typeof response.error === 'object') {
                        errorMsg = Object.values(response.error).join(' ');
                    } else {
                        errorMsg = response.error;
                    }
                }
                alert(errorMsg);
            }
        } catch (error) {
            console.error("Error importing marks:", error);
            alert("Error occurred while importing marks.");
        } finally {
            setImportLoading(false);
        }
    };

    const handleDownloadSample = () => {
        const headers = ['admission_no', 'parameter1', 'parameter2', 'parameter3', 'parameter4', 'note'];
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "import_student_exam_marks_sample.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const closeActionModal = () => {
        setModalConfig({ show: false, title: '', type: '' });
        setSubModalConfig({ show: false, subject: null });
        setActiveExam(null);
    };

    const handleDelete = async (exam) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                const response = await api.deleteCBSEExam(exam.id);
                if (response && response.status) {
                    alert(response.message || 'Record Delete Successfully');
                    fetchExams(); // Refresh list
                } else {
                    alert('Failed to delete exam. Please try again.');
                }
            } catch (error) {
                console.error("Error deleting exam:", error);
                alert('Error occurred while deleting.');
            }
        }
    };

    const resetForm = () => {
        setExamName('');
        setExamDescription('');
        setSelectedTerm('');
        setSelectedClass('');
        setSelectedAssessment('');
        setSelectedGrade('');
        setIsPublish(false);
        setIsActive(false);
        setSectionsList([]);
        setSelectedSections([]);
    };

    const handleOpenAddModal = () => {
        resetForm();
        setActiveExam(null);
        setShowAddModal(true);
    };

    const handleEdit = async (exam) => {
        resetForm();
        setActiveExam(exam);
        setShowAddModal(true);
        // Fetched details will be populated
        try {
            const response = await api.getExamDetails(exam.id);
            if (response && response.status) {
                const data = response.exam;
                setExamName(data.name);
                setExamDescription(data.description || '');
                setSelectedTerm(data.cbse_term_id);
                setSelectedClass(response.class_id || '');
                setSelectedAssessment(data.cbse_exam_assessment_id);
                setSelectedGrade(data.cbse_exam_grade_id);
                setIsPublish(data.is_publish === "1");
                setIsActive(data.is_active === "1");

                // Populate Lists from response
                setTermList(response.term_list || []);
                setClassList(response.classlist || []);
                setAssessmentList(response.assessment_result || []);
                setGradeList(response.grade_result || []);
                setSchSetting(response.sch_setting || {});

                // Fetch Sections for the selected class using the API
                if (response.class_id) {
                    try {
                        const sectionResponse = await api.getSectionsByClass(response.class_id);
                        if (sectionResponse && sectionResponse.status) {
                            const formattedSections = sectionResponse.data.map(s => ({
                                id: parseInt(s.id),
                                name: s.section
                            }));
                            setSectionsList(formattedSections);
                        } else {
                            setSectionsList([]);
                        }
                    } catch (secError) {
                        console.error("Error fetching sections for class:", secError);
                        setSectionsList([]);
                    }
                }

                // Handle sections
                const selectedSecIds = response.class_section_list?.map(s => parseInt(s.class_section_id)) || [];
                setSelectedSections(selectedSecIds);
            }
        } catch (error) {
            console.error("Error fetching exam details:", error);
        }
    };

    const handleSaveExam = async (e) => {
        e.preventDefault();

        if (!examName || !selectedTerm || !selectedClass || !selectedAssessment || !selectedGrade || selectedSections.length === 0) {
            alert("Please fill all required fields");
            return;
        }

        const payload = {
            exam_id: activeExam?.id,
            exam_term_id: selectedTerm,
            assessment_id: selectedAssessment,
            grade_id: selectedGrade,
            exam_name: examName,
            exam_description: examDescription,
            class_id: selectedClass,
            section: selectedSections,
            is_active: isActive ? 1 : 0,
            is_publish: isPublish ? 1 : 0
        };

        try {
            const apiCall = activeExam ? api.updateCBSEExam : api.addCBSEExam;
            const response = await apiCall(payload);

            if (response && response.status) {
                alert(response.message || 'Record Saved Successfully');
                setShowAddModal(false);
                setActiveExam(null);
                fetchExams(); // Refresh list
            } else {
                alert(response.message || 'Failed to save exam. Please try again.');
            }
        } catch (error) {
            console.error("Error saving exam:", error);
            alert('Error occurred while saving.');
        }
    };

    const handleClassChange = async (e) => {
        const classId = e.target.value;
        setSelectedClass(classId);
        setSelectedSections([]);
        setSectionsList([]);

        if (classId) {
            try {
                const response = await api.getSectionsByClass(classId);
                if (response && response.status) {
                    const formattedSections = response.data.map(s => ({
                        id: parseInt(s.id),
                        name: s.section
                    }));
                    setSectionsList(formattedSections);
                }
            } catch (err) {
                console.error("Error fetching sections:", err);
            }
        }
    };


    /*
    const sectionsList = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 3, name: 'C' },
        { id: 4, name: 'D' }
    ];
    */

    const toggleSection = (id) => {
        if (selectedSections.includes(id)) {
            setSelectedSections(selectedSections.filter(sid => sid !== id));
        } else {
            setSelectedSections([...selectedSections, id]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedSections.length === sectionsList.length) {
            setSelectedSections([]);
        } else {
            setSelectedSections(sectionsList.map(s => s.id));
        }
    };

    // CBSE Submenu with correct routes
    const cbseSubmenu = [
        { label: 'Exam', url: '/cbseexam/exam', active: true, icon: 'https://newlayout.wisibles.com/backend/images/sidebar/submenu/state_examination/1.png' },
        { label: 'Exam Schedule', url: '/cbseexam/examschedule', active: false, icon: 'https://newlayout.wisibles.com/backend/images/sidebar/submenu/state_examination/2.png' },
        { label: 'Print Marksheet', url: '/cbseexam/result/marksheet', active: false, icon: 'https://newlayout.wisibles.com/backend/images/sidebar/submenu/state_examination/3.png' },
        { label: 'Exam Grade', url: '/cbseexam/examgrade', active: false, icon: 'https://newlayout.wisibles.com/backend/images/sidebar/submenu/state_examination/4.png' },
        // { label: 'Assign Observation', url: '#', active: false, icon: '5.png' },
        // { label: 'Observation', url: '#', active: false, icon: '6.png' },
        // { label: 'Observation Parameter', url: '#', active: false, icon: '7.png' },
        { label: 'Assessment', url: '/cbseexam/assessment', active: false, icon: 'https://newlayout.wisibles.com/backend/images/sidebar/submenu/state_examination/8.png' },
        { label: 'Term', url: '/cbseexam/term', active: false, icon: 'https://newlayout.wisibles.com/backend/images/sidebar/submenu/state_examination/9.png' },
        { label: 'Template', url: '/cbseexam/template', active: false, icon: 'https://newlayout.wisibles.com/backend/images/sidebar/submenu/state_examination/4.png' },
        { label: 'Reports', url: '/cbseexam/report', active: false, icon: 'https://newlayout.wisibles.com/backend/images/sidebar/submenu/state_examination/10.png' },
        { label: 'Setting', url: '/cbseexam/settings', active: false, icon: 'https://newlayout.wisibles.com/backend/images/sidebar/submenu/state_examination/11.png' },
    ];

    // Exam Table Data
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const response = await api.getCBSEExamList();
            if (response && response.data && response.data.result) {
                setExams(response.data.result);
            }
            // Also check for master data in index response
            if (response && response.data) {
                const data = response.data;
                if (data.term_list || data.termlist) setTermList(data.term_list || data.termlist);
                if (data.assessment_result || data.assessmentlist) setAssessmentList(data.assessment_result || data.assessmentlist);
                if (data.grade_result || data.gradelist) setGradeList(data.grade_result || data.gradelist);
                if (data.classlist) setClassList(data.classlist);
            }
        } catch (error) {
            console.error("Error fetching exams:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => console.log("Logout");
    const handleSearch = (term) => console.log("Search:", term);

    const filteredExams = exams.filter(exam =>
        exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.term_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.class_sections.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [hiddenColumns, setHiddenColumns] = useState([]);
    const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
    
    const toggleColumnVisibility = (colIndex) => {
        setHiddenColumns(prev =>
            prev.includes(colIndex) ? prev.filter(c => c !== colIndex) : [...prev, colIndex]
        );
    };

    const handleExport = (action) => {
        const allHeaders = [
            "Exam Name",
            "Class (Sections)",
            "Term",
            "Subjects Included",
            "Exam Published",
            "Published Result",
            "Description",
            "Created At"
        ];
        
        const headers = allHeaders.filter((_, i) => !hiddenColumns.includes(i));

        const rows = filteredExams.map(exam => {
            const rowData = [
                exam.name,
                exam.class_sections,
                exam.term_name,
                exam.subjectsincluded,
                Number(exam.is_active) === 1 ? "Yes" : "No",
                Number(exam.is_publish) === 1 ? "Yes" : "No",
                exam.description,
                exam.created_at
            ].map(v => String(v ?? ''));
            return rowData.filter((_, i) => !hiddenColumns.includes(i));
        });

        if (action === 'copy') copyToClipboard(headers, rows);
        if (action === 'excel') downloadExcel(headers, rows, 'Exam_List.xls');
        if (action === 'csv') downloadCSV(headers, rows, 'Exam_List.csv');
        if (action === 'pdf') downloadPDF(headers, rows, 'Exam_List.pdf', 'Exam List');
        if (action === 'print') printTable(headers, rows, 'Exam List');
    };

    return (
        <div className="wrapper theme-white-skin">
            <style>{`
                .dt-header { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center; 
                    margin-bottom: 15px; 
                    border-bottom: 1px solid #e7e7e7;
                    padding-bottom: 5px;
                    background: #fafafa;
                    padding: 5px 10px;
                }
                .dt-buttons { display: flex; gap: 2px; }
                .mb10 { margin-bottom: 10px; }
                .noExport { }
                .input-group-sm .form-control { height: 30px; }
            `}</style>
            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ marginTop: '0px' }}>
                <section className="content">
                    <div className="row">
                        {/* Left Sidebar (CBSE Submenu) */}
                        <div className="col-md-2">
                            <div className="box border0">
                                <div className="box-header with-border">
                                    <h3 className="box-title">State Examination</h3>
                                </div>
                                <ul className="tablists">
                                    {cbseSubmenu.map((item, idx) => (
                                        <li key={idx}>
                                            <Link to={item.url} className={item.active ? "active" : ""}>
                                                <img
                                                    src={item.icon}
                                                    alt={item.label}
                                                    className="img-fluid"
                                                    style={{ width: '20px', marginRight: '5px' }}
                                                />
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Right Content (Exam List) */}
                        <div className="col-md-10">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Exam List</h3>
                                    <div className="box-tools pull-right">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-primary"
                                            onClick={handleOpenAddModal}
                                        >
                                            <i className="fa fa-plus"></i> Add
                                        </button>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="dt-header">
                                                <div className="input-group">
                                                    <input
                                                        type="text"
                                                        className="form-control input-sm"
                                                        placeholder="Search..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        style={{ width: '200px' }}
                                                    />
                                                </div>
                                                <div className="dt-buttons btn-group">
                                                    <button className="btn btn-default btn-sm" title="Copy" onClick={() => handleExport('copy')}><i className="fa fa-files-o"></i></button>
                                                    <button className="btn btn-default btn-sm" title="Excel" onClick={() => handleExport('excel')}><i className="fa fa-file-excel-o"></i></button>
                                                    <button className="btn btn-default btn-sm" title="CSV" onClick={() => handleExport('csv')}><i className="fa fa-file-text-o"></i></button>
                                                    <button className="btn btn-default btn-sm" title="PDF" onClick={() => handleExport('pdf')}><i className="fa fa-file-pdf-o"></i></button>
                                                    <button className="btn btn-default btn-sm" title="Print" onClick={() => handleExport('print')}><i className="fa fa-print"></i></button>
                                                    <div className="btn-group">
                                                        <a className="btn btn-default btn-sm" title="Columns" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}><span><i className="fa fa-columns"></i></span></a>
                                                        {showColumnsDropdown && (
                                                            <ul className="dropdown-menu dt-button-collection" style={{ display: 'block', right: 0, left: 'auto' }}>
                                                                <li><label><input type="checkbox" checked={!hiddenColumns.includes(0)} onChange={() => toggleColumnVisibility(0)} /> Exam Name</label></li>
                                                                <li><label><input type="checkbox" checked={!hiddenColumns.includes(1)} onChange={() => toggleColumnVisibility(1)} /> Class (Sections)</label></li>
                                                                <li><label><input type="checkbox" checked={!hiddenColumns.includes(2)} onChange={() => toggleColumnVisibility(2)} /> Term</label></li>
                                                                <li><label><input type="checkbox" checked={!hiddenColumns.includes(3)} onChange={() => toggleColumnVisibility(3)} /> Subjects Included</label></li>
                                                                <li><label><input type="checkbox" checked={!hiddenColumns.includes(4)} onChange={() => toggleColumnVisibility(4)} /> Exam Published</label></li>
                                                                <li><label><input type="checkbox" checked={!hiddenColumns.includes(5)} onChange={() => toggleColumnVisibility(5)} /> Published Result</label></li>
                                                                <li><label><input type="checkbox" checked={!hiddenColumns.includes(6)} onChange={() => toggleColumnVisibility(6)} /> Description</label></li>
                                                                <li><label><input type="checkbox" checked={!hiddenColumns.includes(7)} onChange={() => toggleColumnVisibility(7)} /> Created At</label></li>
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="table-responsive mailbox-messages">
                                        <table className="table table-striped table-bordered table-hover example">
                                            <thead>
                                                <tr>
                                                    {!hiddenColumns.includes(0) && <th style={{ whiteSpace: 'nowrap', paddingRight: '5px' }}>Exam Name</th>}
                                                    {!hiddenColumns.includes(1) && <th style={{ paddingLeft: '5px' }}>Class (Sections)</th>}
                                                    {!hiddenColumns.includes(2) && <th>Term</th>}
                                                    {!hiddenColumns.includes(3) && <th>Subjects Included</th>}
                                                    {!hiddenColumns.includes(4) && <th>Exam Published</th>}
                                                    {!hiddenColumns.includes(5) && <th>Published Result</th>}
                                                    {!hiddenColumns.includes(6) && <th width="30%">Description</th>}
                                                    {!hiddenColumns.includes(7) && <th style={{ whiteSpace: 'nowrap' }}>Created At</th>}
                                                    <th className="text-right noExport">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredExams.map((exam) => (
                                                    <tr key={exam.id}>
                                                        {!hiddenColumns.includes(0) && <td style={{ whiteSpace: 'nowrap', paddingRight: '5px' }}>{exam.name}</td>}
                                                        {!hiddenColumns.includes(1) && <td style={{ paddingLeft: '5px' }}>{exam.class_sections}</td>}
                                                        {!hiddenColumns.includes(2) && <td>{exam.term_name}</td>}
                                                        {!hiddenColumns.includes(3) && <td>{exam.subjectsincluded}</td>}
                                                        {!hiddenColumns.includes(4) && (
                                                            <td>
                                                                {Number(exam.is_active) === 1 ? (
                                                                    <i className="fa fa-check-square-o"></i>
                                                                ) : (
                                                                    <i className="fa fa-exclamation-circle"></i>
                                                                )}
                                                            </td>
                                                        )}
                                                        {!hiddenColumns.includes(5) && (
                                                            <td>
                                                                {Number(exam.is_publish) === 1 ? (
                                                                    <i className="fa fa-check-square-o"></i>
                                                                ) : (
                                                                    <i className="fa fa-exclamation-circle"></i>
                                                                )}
                                                            </td>
                                                        )}
                                                        {!hiddenColumns.includes(6) && <td>{exam.description}</td>}
                                                        {!hiddenColumns.includes(7) && <td style={{ whiteSpace: 'nowrap' }}>{exam.created_at}</td>}
                                                        <td className="text-right white-space-nowrap">
                                                            <button
                                                                className="btn btn-default btn-xs"
                                                                title="Assign/View Student"
                                                                onClick={() => openActionModal(exam, "Assign/View Student", "assign")}
                                                            ><i className="fa fa-tag"></i></button>
                                                            <button
                                                                className="btn btn-default btn-xs"
                                                                title="Exam Subjects"
                                                                onClick={() => openActionModal(exam, "Exam Subjects", "subjects")}
                                                            ><i className="fa fa-book"></i></button>
                                                            <button
                                                                className="btn btn-default btn-xs"
                                                                title="Exam Marks"
                                                                onClick={() => openActionModal(exam, "Exam Marks", "marks")}
                                                            ><i className="fa fa-newspaper-o"></i></button>
                                                            <button
                                                                className="btn btn-default btn-xs"
                                                                title="Exam Attendance"
                                                                onClick={() => openActionModal(exam, "Exam Attendance", "attendance")}
                                                            ><i className="fa fa-calendar-check-o"></i></button>
                                                            <button
                                                                className="btn btn-default btn-xs"
                                                                title="Teacher Remark"
                                                                onClick={() => openActionModal(exam, "Teacher Remark", "remarks")}
                                                            ><i className="fa fa-comment"></i></button>
                                                            <button
                                                                className="btn btn-default btn-xs"
                                                                title="Edit"
                                                                onClick={() => handleEdit(exam)}
                                                            ><i className="fa fa-pencil"></i></button>
                                                            <a
                                                                href={`/cbseexam/exam/examwiserank/${exam.id}`}
                                                                className="btn btn-default btn-xs"
                                                                title="Generate Rank"
                                                            ><i className="fa fa-list-alt"></i></a>
                                                            <Link
                                                                to={`/cbseexam/exam/examwiseadmitcard/${exam.id}`}
                                                                className="btn btn-default btn-xs"
                                                                title="Print Hall Ticket"
                                                            ><i className="fa fa-ticket"></i></Link>
                                                            <button
                                                                className="btn btn-default btn-xs"
                                                                title="Delete"
                                                                onClick={() => handleDelete(exam)}
                                                            ><i className="fa fa-remove"></i></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Add Exam Modal */}
            {showAddModal && (
                <div className="modal fade in" style={{ display: 'block', paddingRight: '17px' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" onClick={() => { setShowAddModal(false); setActiveExam(null); }}>&times;</button>
                                <h4 className="modal-title">{activeExam ? "Edit Exam" : "Add Exam"}</h4>
                            </div>
                            <div className="scroll-area">
                                <form id="add_exam_form" onSubmit={handleSaveExam}>
                                    <div className="modal-body">
                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <label>Exam Name</label> <small className="req"> *</small>
                                                    <input
                                                        className="form-control"
                                                        name="exam_name"
                                                        required
                                                        style={{ whiteSpace: 'nowrap' }}
                                                        value={examName}
                                                        onChange={(e) => setExamName(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-2">
                                                <div className="checkbox-inline">
                                                    <label>
                                                        <input
                                                            type="checkbox"
                                                            name="is_publish"
                                                            checked={isPublish}
                                                            onChange={(e) => setIsPublish(e.target.checked)}
                                                        /> Publish
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-md-2">
                                                <div className="checkbox-inline">
                                                    <label>
                                                        <input
                                                            type="checkbox"
                                                            name="is_active"
                                                            checked={isActive}
                                                            onChange={(e) => setIsActive(e.target.checked)}
                                                        /> Active
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="form-group">
                                                    <label>Description</label>
                                                    <textarea
                                                        className="form-control"
                                                        name="exam_description"
                                                        rows="3"
                                                        value={examDescription}
                                                        onChange={(e) => setExamDescription(e.target.value)}
                                                    ></textarea>
                                                </div>
                                            </div>
                                        </div>
                                        <hr />
                                        <div className="row">
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>Term</label><small className="req"> *</small>
                                                    <select
                                                        name="exam_term_id"
                                                        className="form-control"
                                                        required
                                                        value={selectedTerm}
                                                        onChange={(e) => setSelectedTerm(e.target.value)}
                                                    >
                                                        <option value="">Select</option>
                                                        {termList.map(term => (
                                                            <option key={term.id} value={term.id}>{term.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>Class</label><small className="req"> *</small>
                                                    <select
                                                        name="class_id"
                                                        className="form-control"
                                                        required
                                                        value={selectedClass}
                                                        onChange={handleClassChange}
                                                    >
                                                        <option value="">Select</option>
                                                        {classList.map(cls => (
                                                            <option key={cls.id} value={cls.id}>{cls.class}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group relative">
                                                    <label>Section</label><small className="req"> *</small>
                                                    <div className="checkbox-dropdown-container">
                                                        <div
                                                            className="custom-select"
                                                            onClick={() => setIsSectionOpen(!isSectionOpen)}
                                                            style={{
                                                                border: '1px solid #ccc',
                                                                padding: '6px 12px',
                                                                borderRadius: '0px',
                                                                cursor: 'pointer',
                                                                background: '#fff',
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center'
                                                            }}
                                                        >
                                                            {selectedSections.length > 0
                                                                ? `${selectedSections.length} selected`
                                                                : "Select"}
                                                            <i className={`fa fa-angle-${isSectionOpen ? 'up' : 'down'}`}></i>
                                                        </div>
                                                        {isSectionOpen && (
                                                            <div className="custom-select-option-box" style={{
                                                                position: 'absolute',
                                                                zIndex: 100,
                                                                background: '#fff',
                                                                border: '1px solid #ccc',
                                                                width: '100%',
                                                                maxHeight: '200px',
                                                                overflowY: 'auto',
                                                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                                            }}>
                                                                <div className="custom-select-option checkbox" style={{ padding: '5px 10px', borderBottom: '1px solid #eee' }}>
                                                                    <label style={{ fontWeight: 'normal', cursor: 'pointer', display: 'block', margin: 0 }}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedSections.length === sectionsList.length}
                                                                            onChange={toggleSelectAll}
                                                                            style={{ marginRight: '8px' }}
                                                                        />
                                                                        Select All
                                                                    </label>
                                                                </div>
                                                                {sectionsList.map(section => (
                                                                    <div key={section.id} className="custom-select-option checkbox" style={{ padding: '5px 10px' }}>
                                                                        <label style={{ fontWeight: 'normal', cursor: 'pointer', display: 'block', margin: 0 }}>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={selectedSections.includes(section.id)}
                                                                                onChange={() => toggleSection(section.id)}
                                                                                style={{ marginRight: '8px' }}
                                                                            />
                                                                            {section.name}
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>Assessment</label><small className="req"> *</small>
                                                    <select
                                                        name="assessment_id"
                                                        className="form-control"
                                                        required
                                                        value={selectedAssessment}
                                                        onChange={(e) => setSelectedAssessment(e.target.value)}
                                                    >
                                                        <option value="">Select</option>
                                                        {assessmentList.map(assess => (
                                                            <option key={assess.id} value={assess.id}>{assess.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label>Grade</label><small className="req"> *</small>
                                                    <select
                                                        name="grade_id"
                                                        className="form-control"
                                                        required
                                                        value={selectedGrade}
                                                        onChange={(e) => setSelectedGrade(e.target.value)}
                                                    >
                                                        <option value="">Select</option>
                                                        {gradeList.map(grade => (
                                                            <option key={grade.id} value={grade.id}>{grade.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="submit" className="btn btn-primary pull-right">{activeExam ? "Update" : "Save"}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showAddModal && <div className="modal-backdrop fade in" onClick={() => setShowAddModal(false)}></div>}

            {/* Action Modals */}
            {modalConfig.show && modalConfig.type !== 'assign' && modalConfig.type !== 'subjects' && modalConfig.type !== 'remarks' && modalConfig.type !== 'attendance' && (
                <div className="modal fade in" style={{ display: 'block', paddingRight: '17px', overflow: 'auto', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1050 }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" onClick={closeActionModal}>&times;</button>
                                <h4 className="modal-title">{modalConfig.title} - {activeExam?.name}</h4>
                            </div>
                            <div className="modal-body">
                                {modalConfig.type === 'subjects' && (
                                    /* Logic moved to AssignExamSubjects component */
                                    null
                                )}
                                {modalConfig.type === 'marks' && !subModalConfig.show && (
                                    <div className="table-responsive">
                                        {marksLoading ? (
                                            <div className="text-center p-4">
                                                <i className="fa fa-spinner fa-spin fa-2x"></i>
                                                <p>Loading subjects...</p>
                                            </div>
                                        ) : (
                                            <table className="table table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th>Subject</th>
                                                        <th>Date</th>
                                                        <th>Start Time</th>
                                                        <th>Room No</th>
                                                        <th className="text-right">Enter Marks</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {subjectsForMarks.length > 0 ? (
                                                        subjectsForMarks.map((sub, idx) => (
                                                            <tr key={sub.id || idx}>
                                                                <td>{`${sub.subject_name} ${sub.subject_code ? `(${sub.subject_code})` : ''}`}</td>
                                                                <td>{sub.date}</td>
                                                                <td>{sub.time_from}</td>
                                                                <td>{sub.room_no}</td>
                                                                <td className="text-right">
                                                                    <button
                                                                        className="btn btn-default btn-xs"
                                                                        onClick={() => handleEnterMarks(sub)}
                                                                    ><i className="fa fa-newspaper-o"></i></button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="5" className="text-center text-danger">No subjects assigned to this exam.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                )}
                                {modalConfig.type === 'marks' && subModalConfig.show && (
                                    <div>
                                        <button className="btn btn-default btn-sm mb10" onClick={() => setSubModalConfig({ show: false, subject: null })}><i className="fa fa-arrow-left"></i> Back to Subjects</button>
                                        <h4>Enter {subModalConfig.subject.subject_name} Marks</h4>

                                        {/* CSV Import Section */}
                                        <div className="row mb20" style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px', border: '1px solid #eee' }}>
                                            <div className="col-md-8">
                                                <div className="form-group mb0">
                                                    <label>Select CSV File <span className="text-danger">*</span></label>
                                                    <div className="d-flex gap-2">
                                                        <input
                                                            type="file"
                                                            className="form-control"
                                                            accept=".csv"
                                                            id="csv_file"
                                                            style={{ display: 'none' }}
                                                            onChange={(e) => setCsvFile(e.target.files[0])}
                                                        />
                                                        <div
                                                            className="form-control"
                                                            onClick={() => document.getElementById('csv_file').click()}
                                                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                                                        >
                                                            <span>{csvFile ? csvFile.name : 'Select CSV File'}</span>
                                                            <i className="fa fa-folder-open-o"></i>
                                                        </div>
                                                        <button
                                                            className="btn btn-primary"
                                                            onClick={handleImportMarks}
                                                            disabled={importLoading}
                                                            style={{ backgroundColor: '#9b59b6', borderColor: '#8e44ad' }}
                                                        >
                                                            {importLoading ? <i className="fa fa-spinner fa-spin"></i> : 'Submit'}
                                                        </button>
                                                    </div>
                                                    <small className="text-muted">
                                                        <i className="fa fa-upload"></i> {csvFile ? `Selected: ${csvFile.name}` : 'Drag and drop a file here or click'}
                                                    </small>
                                                </div>
                                            </div>
                                            <div className="col-md-4 text-right">
                                                <button
                                                    onClick={handleDownloadSample}
                                                    className="btn btn-primary btn-sm"
                                                    style={{ backgroundColor: '#9b59b6', borderColor: '#8e44ad' }}
                                                >
                                                    <i className="fa fa-download"></i> Download Sample Import File
                                                </button>
                                            </div>
                                        </div>

                                        <div className="table-responsive">
                                            {entryLoading ? (
                                                <div className="text-center p-4">
                                                    <i className="fa fa-spinner fa-spin fa-2x"></i>
                                                    <p>Loading students...</p>
                                                </div>
                                            ) : (
                                                <table className="table table-striped table-bordered table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th>Admission No</th>
                                                            <th>Roll No</th>
                                                            <th>Student Name</th>
                                                            <th>Class</th>
                                                            <th>Father Name</th>
                                                            <th>Gender</th>
                                                            {assessmentTypesForEntry.map(type => (
                                                                <th key={type.id}>{type.name}</th>
                                                            ))}
                                                            <th>Note</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {subjectStudentResults.length > 0 ? (
                                                            subjectStudentResults.map(student => (
                                                                <tr key={student.exam_student_id}>
                                                                    <td>{student.admission_no}</td>
                                                                    <td>{activeExam?.use_exam_roll_no !== 0 ? student.exam_roll_no : (student.roll_no || '-')}</td>
                                                                    <td>{`${student.firstname}${student.middlename ? ' ' + student.middlename : ''}${student.lastname ? ' ' + student.lastname : ''}`}</td>
                                                                    <td>{`${student.class_name} (${student.section_name})`}</td>
                                                                    <td>{student.father_name}</td>
                                                                    <td>{student.gender}</td>
                                                                    {assessmentTypesForEntry.map(type => (
                                                                        <td key={type.id} style={{ minWidth: '150px' }}>
                                                                            <label style={{ display: 'block', fontWeight: 'normal', fontSize: '11px' }}>
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={entryMarks[student.exam_student_id]?.[type.id]?.is_absent || false}
                                                                                    onChange={(e) => handleAbsentChange(student.exam_student_id, type.id, e.target.checked)}
                                                                                /> Mark as Absent
                                                                            </label>
                                                                            <input
                                                                                type="number"
                                                                                className="form-control input-sm"
                                                                                value={entryMarks[student.exam_student_id]?.[type.id]?.marks !== undefined ? entryMarks[student.exam_student_id][type.id].marks : ''}
                                                                                onChange={(e) => handleMarkChange(student.exam_student_id, type.id, e.target.value, type.maximum_marks)}
                                                                                readOnly={entryMarks[student.exam_student_id]?.[type.id]?.is_absent}
                                                                                placeholder={`Max Marks: ${type.maximum_marks}`}
                                                                                min="0"
                                                                                max={type.maximum_marks}
                                                                            />
                                                                        </td>
                                                                    ))}
                                                                    <td>
                                                                        <input
                                                                            type="text"
                                                                            className="form-control input-sm"
                                                                            value={entryNotes[student.exam_student_id] || ''}
                                                                            onChange={(e) => handleNoteChange(student.exam_student_id, e.target.value)}
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan={7 + assessmentTypesForEntry.length} className="text-center text-danger">No students found.</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {/* Attendance moved to separate ExamAttendance modal */}
                                {/* Remarks moved to separate TeacherRemark modal */}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default" onClick={closeActionModal}>Close</button>
                                {modalConfig.type === 'marks' && subModalConfig.show ? (
                                    <button type="button" className="btn btn-primary" onClick={handleSaveExamMarks} disabled={entryLoading} style={{ backgroundColor: '#9b59b6', borderColor: '#8e44ad' }}>
                                        {entryLoading ? <i className="fa fa-spinner fa-spin"></i> : 'Save'}
                                    </button>
                                ) : (
                                    <button type="button" className="btn btn-primary" onClick={closeActionModal}>Save Changes</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {modalConfig.show && modalConfig.type === 'assign' && activeExam && (
                <AssignExamStudent examId={activeExam.id} handleClose={closeActionModal} />
            )}

            {modalConfig.show && modalConfig.type === 'subjects' && activeExam && (
                <AssignExamSubjects examId={activeExam.id} handleClose={closeActionModal} />
            )}

            {modalConfig.show && modalConfig.type === 'remarks' && activeExam && (
                <div className="modal fade in" style={{ display: 'block', paddingRight: '17px' }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" onClick={closeActionModal}>&times;</button>
                                <h4 className="modal-title">Teacher Remark - {activeExam?.name}</h4>
                            </div>
                            <div className="modal-body">
                                <TeacherRemark examId={activeExam.id} handleClose={closeActionModal} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {modalConfig.show && modalConfig.type === 'attendance' && activeExam && (
                <div className="modal fade in" style={{ display: 'block', paddingRight: '17px' }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" onClick={closeActionModal}>&times;</button>
                                <h4 className="modal-title">Exam Attendance - {activeExam?.name}</h4>
                            </div>
                            <div className="modal-body">
                                <ExamAttendance examId={activeExam.id} handleClose={closeActionModal} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {modalConfig.show && modalConfig.type !== 'assign' && modalConfig.type !== 'subjects' && modalConfig.type !== 'remarks' && modalConfig.type !== 'attendance' && <div className="modal-backdrop fade in" onClick={closeActionModal}></div>}
            {modalConfig.show && (modalConfig.type === 'remarks' || modalConfig.type === 'attendance') && <div className="modal-backdrop fade in" onClick={closeActionModal}></div>}

            <Footer />
        </div>
    );
};

export default CBSEExamList;
