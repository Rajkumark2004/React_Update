import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../utils/include_files.js';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';
import { api } from '../../services/api.js';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable } from '../../utils/tableExport';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import StudentIdCard from '../../components/StudentIdCard';
import Pagination from '../../utils/Pagination';
import TableToolbar from '../../utils/TableToolbar';

const GenerateIdCard = () => {
    const navigate = useNavigate();
    const { currentSession, clearSession } = useSession();

    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [idCardTemplates, setIdCardTemplates] = useState([]);
    const [studentList, setStudentList] = useState([]);
    const [formData, setFormData] = useState({
        class_id: '',
        section_id: '',
        id_card: ''
    });
    const [searched, setSearched] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [generatedData, setGeneratedData] = useState(null);
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const columns = [
        { key: 'student_name', label: 'Student Name' },
        { key: 'class', label: 'Class' },
        { key: 'father_name', label: 'Father Name' },
        { key: 'dob', label: 'Date of Birth' },
        { key: 'mother_name', label: 'Mother Name' },
        { key: 'gender', label: 'Gender' },
        { key: 'category', label: 'Category' },
        { key: 'mobile_no', label: 'Mobile No' },
    ];

    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(c => c.key)));

    const toggleColumnVisibility = (key) => {
        setVisibleColumns(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const response = await api.getGenerateIdCardSearchData();
            if (response.status && response.data) {
                setClassList(response.data.classlist || []);
                setIdCardTemplates(response.data.idcardlist || []);
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    const fetchSections = async (classId) => {
        if (!classId) {
            setSectionList([]);
            return;
        }
        try {
            const response = await api.getSectionsByClass(classId);
            if (response.status) {
                setSectionList(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'class_id') {
            setFormData(prev => ({ ...prev, section_id: '' }));
            fetchSections(value);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const response = await api.searchStudentsForIdCard({
                class_id: formData.class_id,
                section_id: formData.section_id,
                id_card: formData.id_card
            });
            if (response.status && response.data) {
                setStudentList(Array.isArray(response.data.resultlist) ? response.data.resultlist : []);
                setSearched(true);
            } else {
                setStudentList([]);
                setSearched(true);
            }
        } catch (error) {
            console.error('Error searching students:', error);
            alert(error.message || 'Failed to fetch students');
            setStudentList([]);
            setSearched(false);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedStudents(studentList.map(s => s.id));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleSelectStudent = (id) => {
        setSelectedStudents(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleGenerate = async () => {
        if (selectedStudents.length === 0) {
            alert('No record selected');
            return;
        }

        setGeneratingPdf(true);
        try {
            const payload = {
                class_id: formData.class_id,
                id_card: formData.id_card,
                students: selectedStudents.map(id => ({ student_id: id }))
            };

            const response = await api.generateIdCards(payload);
            if (response.status && response.data) {
                // Map API response fields to what StudentIdCard component expects
                const mappedData = {
                    id_card: response.data.idcardResult || response.data.id_card || [],
                    students: response.data.resultlist || response.data.students || [],
                    sch_setting: response.data.sch_setting ? [response.data.sch_setting] : (response.data.sch_setting || [])
                };
                setGeneratedData(mappedData);
                // PDF generation triggering is handled by useEffect
            } else {
                alert(response.message || 'Failed to generate ID cards');
                setGeneratingPdf(false);
            }
        } catch (error) {
            console.error('Error generating ID cards:', error);
            alert(error.message || 'Error occurred while generating ID cards');
            setGeneratingPdf(false);
        }
    };

    useEffect(() => {
        if (generatedData && generatedData.students && generatedData.students.length > 0) {
            generatePDF();
        }
    }, [generatedData]);

    const generatePDF = async () => {
        // Wait for a moment to ensure new DOM elements are rendered and images started loading
        await new Promise(resolve => setTimeout(resolve, 1000));

        const cards = document.getElementsByClassName('student-id-card-print');
        if (!cards || cards.length === 0) {
            console.error("No cards found to print");
            setGeneratingPdf(false);
            return;
        }

        // Check for vertical card setting
        const isVertical = generatedData.id_card[0].enable_vertical_card === "1";
        const orientation = isVertical ? 'p' : 'l';

        const doc = new jsPDF(orientation, 'mm', 'a4');
        const pageWidth = isVertical ? 210 : 297;
        const pageHeight = isVertical ? 297 : 210;

        // Standard CR80 dimensions: 85.6mm x 53.98mm
        const cardWidth = isVertical ? 54 : 86;
        const cardHeight = isVertical ? 86 : 54;

        const marginX = 10;
        const marginY = 10;
        const gapX = 5;
        const gapY = 5;

        // Calculate columns and rows based on page size and card dimensions
        const cols = Math.floor((pageWidth - 2 * marginX) / (cardWidth + gapX));
        const rows = Math.floor((pageHeight - 2 * marginY) / (cardHeight + gapY));
        const itemsPerPage = cols * rows;

        for (let i = 0; i < cards.length; i++) {
            // Add page if needed
            if (i > 0 && i % itemsPerPage === 0) {
                doc.addPage();
            }

            const card = cards[i];
            try {
                const canvas = await html2canvas(card, {
                    scale: 3, // Higher scale for better quality
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff'
                });

                const imgData = canvas.toDataURL('image/png');

                // Calculate position
                const indexOnPage = i % itemsPerPage;
                const col = indexOnPage % cols;
                const row = Math.floor(indexOnPage / cols);

                const x = marginX + col * (cardWidth + gapX);
                const y = marginY + row * (cardHeight + gapY);

                doc.addImage(imgData, 'PNG', x, y, cardWidth, cardHeight);

            } catch (err) {
                console.error("Error processing card " + i, err);
            }
        }

        doc.save('student_id_cards.pdf');

        // Cleanup
        setGeneratedData(null);
        setGeneratingPdf(false);
        alert("ID Cards PDF generated successfully!");
    };

    const filteredStudents = (Array.isArray(studentList) ? studentList : []).filter(s => {
        const fullName = `${s?.firstname || ''} ${s?.lastname || ''}`.trim().toLowerCase();
        const searchLow = searchTerm.toLowerCase();
        const admissionNo = (s?.admission_no || '').toLowerCase();
        
        return fullName.includes(searchLow) || admissionNo.includes(searchLow);
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(50);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, studentList?.length]);

    const indexOfLastItem = currentPage * recordsPerPage;
    const indexOfFirstItem = indexOfLastItem - recordsPerPage;
    const currentData = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);

    const getExportData = () => {
        const headers = [];
        const rows = [];
        
        const allColumns = [
            { key: 'student_name', label: 'Student Name' },
            { key: 'class', label: 'Class' },
            { key: 'father_name', label: 'Father Name' },
            { key: 'dob', label: 'Date of Birth' },
            { key: 'mother_name', label: 'Mother Name' },
            { key: 'gender', label: 'Gender' },
            { key: 'category', label: 'Category' },
            { key: 'mobile_no', label: 'Mobile No' },
        ];

        allColumns.forEach(col => {
            if (visibleColumns.has(col.key)) {
                headers.push(col.label);
            }
        });

        filteredStudents.forEach(s => {
            const row = [];
            if (visibleColumns.has('student_name')) row.push(`${s.firstname || ''} ${s.lastname || ''}`.trim());
            if (visibleColumns.has('class')) row.push(`${s.class || ''} (${s.section || ''})`);
            if (visibleColumns.has('father_name')) row.push(s.father_name || '');
            if (visibleColumns.has('dob')) row.push(s.dob || '');
            if (visibleColumns.has('mother_name')) row.push(s.mother_name || '');
            if (visibleColumns.has('gender')) row.push(s.gender || '');
            if (visibleColumns.has('category')) row.push(s.category || '');
            if (visibleColumns.has('mobile_no')) row.push(s.mobileno || '');
            rows.push(row);
        });

        return { headers, rows };
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content-header">
                    <h1><i className="fa fa-newspaper-o"></i> Certificate</h1>
                </section>
                <section className="content" style={{ minHeight: '608px' }}>
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
                                            <div className="col-sm-4">
                                                <div className="form-group">
                                                    <label>Class</label><small className="req"> *</small>
                                                    <select name="class_id" className="form-control" value={formData.class_id} onChange={handleInputChange} required>
                                                        <option value="">Select</option>
                                                        {classList.map(c => <option key={c.id} value={c.id}>{c.class}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-sm-4">
                                                <div className="form-group">
                                                    <label>Section</label>
                                                    <select name="section_id" className="form-control" value={formData.section_id} onChange={handleInputChange}>
                                                        <option value="">Select</option>
                                                        {sectionList.map(s => (
                                                            <option key={s.id} value={s.section_id}>{s.section}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-sm-4">
                                                <div className="form-group">
                                                    <label>ID Card Template</label><small className="req"> *</small>
                                                    <select name="id_card" className="form-control" value={formData.id_card} onChange={handleInputChange} required>
                                                        <option value="">Select</option>
                                                        {idCardTemplates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-sm-12">
                                                <div className="form-group">
                                                    <button type="submit" className="btn btn-primary btn-sm pull-right checkbox-toggle"><i className="fa fa-search"></i> Search</button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                {searched && (
                                    <div className="box-body">
                                        <div style={{ borderTop: '1px solid #f4f4f4', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                            <h3 className="box-title" style={{ fontSize: '18px', margin: 0 }}>Student List</h3>
                                            <button
                                                className="btn btn-info btn-sm"
                                                onClick={handleGenerate}
                                                disabled={generatingPdf}
                                            >
                                                {generatingPdf ? 'Generating PDF...' : 'Generate'}
                                            </button>
                                        </div>

                                        <TableToolbar
                                            searchTerm={searchTerm}
                                            onSearchChange={setSearchTerm}
                                            recordsPerPage={recordsPerPage}
                                            onRecordsPerPageChange={setRecordsPerPage}
                                            columns={columns}
                                            visibleColumns={visibleColumns}
                                            onToggleColumn={toggleColumnVisibility}
                                            getExportData={getExportData}
                                            exportFileName="Student_ID_Card_List"
                                            exportTitle="Student ID Card List"
                                        />

                                        <div className="table-responsive">
                                            <table className="table table-striped table-bordered table-hover" style={{ fontSize: '13px', width: '100%', minWidth: '800px' }}>
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: '30px' }}><input type="checkbox" onChange={handleSelectAll} checked={studentList.length > 0 && selectedStudents.length === studentList.length} /></th>
                                                        {visibleColumns.has('student_name') && <th>Student Name</th>}
                                                        {visibleColumns.has('class') && <th>Class</th>}
                                                        {visibleColumns.has('father_name') && <th>Father Name</th>}
                                                        {visibleColumns.has('dob') && <th>Date of Birth</th>}
                                                        {visibleColumns.has('mother_name') && <th>Mother Name</th>}
                                                        {visibleColumns.has('gender') && <th>Gender</th>}
                                                        {visibleColumns.has('category') && <th>Category</th>}
                                                        {visibleColumns.has('mobile_no') && <th>Mobile No</th>}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentData.length > 0 ? currentData.map(student => (
                                                        <tr key={student.id}>
                                                            <td className="text-center" style={{ verticalAlign: 'middle' }}>
                                                                <input type="checkbox" className="checkbox center-block" checked={selectedStudents.includes(student.id)} onChange={() => handleSelectStudent(student.id)} />
                                                            </td>
                                                            {visibleColumns.has('student_name') && <td>{`${student.firstname || ''} ${student.lastname || ''}`.trim()}</td>}
                                                            {visibleColumns.has('class') && <td>{student.class} ({student.section})</td>}
                                                            {visibleColumns.has('father_name') && <td>{student.father_name}</td>}
                                                            {visibleColumns.has('dob') && <td>{student.dob}</td>}
                                                            {visibleColumns.has('mother_name') && <td>{student.mother_name}</td>}
                                                            {visibleColumns.has('gender') && <td>{student.gender}</td>}
                                                            {visibleColumns.has('category') && <td>{student.category}</td>}
                                                            {visibleColumns.has('mobile_no') && <td>{student.mobileno}</td>}
                                                        </tr>
                                                    )) : (
                                                        <tr>
                                                            <td colSpan={1 + visibleColumns.size} className="text-center text-danger">No Record Found</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="pt15 pb15 no-print">
                                            <Pagination
                                                totalItems={filteredStudents.length}
                                                itemsPerPage={recordsPerPage}
                                                currentPage={currentPage}
                                                onPageChange={(page) => setCurrentPage(page)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
                {/* Hidden Render Area for PDF Generation */}
                {generatedData && (
                    <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                        {generatedData.students.map((student, index) => (
                            <div key={index} className="student-id-card-print">
                                <StudentIdCard
                                    student={student}
                                    cardSettings={generatedData.id_card[0]}
                                    schoolSettings={generatedData.sch_setting[0]}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default GenerateIdCard;
