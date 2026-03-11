import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../utils/include_files.js';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useSession } from '../../context/SessionContext';
import { api } from '../../services/api.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import StudentIdCard from '../../components/StudentIdCard';

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

    const handleLogout = () => {
        clearSession();
        localStorage.removeItem('isLoggedIn');
        navigate('/');
    };

    const userData = JSON.parse(localStorage.getItem('user')) || {
        name: 'Admin User',
        role: 'Super Admin',
        avatar: '/uploads/staff_images/default_male.jpg'
    };
    const sessionYear = currentSession?.session || '2024-25';

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
                setGeneratedData(response.data);
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
        const fullName = `${s?.firstname || ''} ${s?.lastname || ''}`.trim();
        return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s?.admission_no?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="wrapper" style={{ marginTop: '0px' }}>
            <Header appName="School Management System" userData={userData} handleLogout={handleLogout} />
            <Sidebar sessionYear={sessionYear} currentUrl="/admin/generateidcard" />

            <div className="content-wrapper" style={{ minHeight: '600px' }}>
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
                                        <div style={{ borderTop: '1px solid #f4f4f4', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3 className="box-title" style={{ fontSize: '20px' }}>Student List</h3>
                                            <h3 className="box-title" style={{ fontSize: '20px' }}>Student List</h3>
                                            <button
                                                className="btn btn-info btn-sm"
                                                onClick={handleGenerate}
                                                disabled={generatingPdf}
                                            >
                                                {generatingPdf ? 'Generating PDF...' : 'Generate'}
                                            </button>
                                        </div>

                                        <div className="row pb10">
                                            <div className="col-sm-6">
                                                <div className="pull-left">
                                                    <label style={{ fontWeight: 'normal' }}>Search:
                                                        <input
                                                            type="search"
                                                            className="form-control input-sm"
                                                            placeholder=""
                                                            style={{ display: 'inline-block', width: 'auto', marginLeft: '5px' }}
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-sm-6">
                                                <div className="dt-buttons btn-group pull-right">
                                                    <button className="btn btn-default btn-sm" title="Copy"><i className="fa fa-copy"></i></button>
                                                    <button className="btn btn-default btn-sm" title="Excel"><i className="fa fa-file-excel-o"></i></button>
                                                    <button className="btn btn-default btn-sm" title="CSV"><i className="fa fa-file-text-o"></i></button>
                                                    <button className="btn btn-default btn-sm" title="PDF"><i className="fa fa-file-pdf-o"></i></button>
                                                    <button className="btn btn-default btn-sm" title="Print"><i className="fa fa-print"></i></button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="table-responsive">
                                            <table className="table table-striped table-bordered table-hover" style={{ fontSize: '13px' }}>
                                                <thead>
                                                    <tr>
                                                        <th><input type="checkbox" onChange={handleSelectAll} checked={studentList.length > 0 && selectedStudents.length === studentList.length} /></th>
                                                        <th>Student Name</th>
                                                        <th>Class</th>
                                                        <th>Father Name</th>
                                                        <th>Date of Birth</th>
                                                        <th>Gender</th>
                                                        <th>Category</th>
                                                        <th>Mobile No</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredStudents.length > 0 ? filteredStudents.map(student => (
                                                        <tr key={student.id}>
                                                            <td className="text-center" style={{ verticalAlign: 'middle' }}>
                                                                <input type="checkbox" className="checkbox center-block" checked={selectedStudents.includes(student.id)} onChange={() => handleSelectStudent(student.id)} />
                                                            </td>
                                                            <td>{`${student.firstname || ''} ${student.lastname || ''}`.trim()}</td>
                                                            <td>{student.class} ({student.section})</td>
                                                            <td>{student.father_name}</td>
                                                            <td>{student.dob}</td>
                                                            <td>{student.gender}</td>
                                                            <td>{student.category}</td>
                                                            <td>{student.mobileno}</td>
                                                        </tr>
                                                    )) : (
                                                        <tr>
                                                            <td colSpan="8" className="text-center text-danger">No Record Found</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="row mt10">
                                            <div className="col-sm-5">
                                                <div className="dataTables_info">
                                                    Records: 1 to {filteredStudents.length} of {filteredStudents.length}
                                                </div>
                                            </div>
                                            <div className="col-sm-7">
                                                <div className="pull-right">
                                                    <ul className="pagination pagination-sm" style={{ margin: 0 }}>
                                                        <li className="disabled"><span>&lt;</span></li>
                                                        <li className="active"><span>1</span></li>
                                                        <li className="disabled"><span>&gt;</span></li>
                                                    </ul>
                                                </div>
                                            </div>
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
