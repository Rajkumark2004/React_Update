import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import '../../utils/include_files';
import { useSession } from '../../context/SessionContext';
import { api } from '../../services/api';
import DragDropFileUpload from '../../components/DragDropFileUpload';
import toast from 'react-hot-toast';
import ViewTemplate from './ViewTemplate';
import TableToolbar from '../../utils/TableToolbar';
import Pagination from '../../utils/Pagination';


const Template = () => {
    const navigate = useNavigate();
    const { sessionYear } = useSession();
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [viewData, setViewData] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const [linkExamData, setLinkExamData] = useState(null);
    const [linkExamLoading, setLinkExamLoading] = useState(false);
    const [linkExamFormData, setLinkExamFormData] = useState({
        exams: [],
        weightages: {},
        term_weightage: {},
        terms: [],
        grading: '',
        teacher_remark: ''
    });
    const [currentTemplateId, setCurrentTemplateId] = useState(null);
    const [marksheetType, setMarksheetType] = useState('');
    const [marksheetList, setMarksheetList] = useState([]);
    const [errors, setErrors] = useState({});

    // Dropdown state
    const [isSectionOpen, setIsSectionOpen] = useState(false);
    const [selectedSections, setSelectedSections] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        class_id: '',
        marksheet_type: 'exam_wise',
        orientation: 'P',
        school_name: '',
        exam_center: '',
        date: '',
        content: '',
        content_footer: '',
        description: '',
        is_name: false,
        is_father_name: false,
        is_mother_name: false,
        exam_session: false,
        is_admission_no: false,
        is_roll_no: false,
        is_photo: false,
        is_class: false,
        is_section: false,
        is_division: false,
        is_dob: false,
        remark: false
    });

    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [classList, setClassList] = useState([]);
    const [sectionList, setSectionList] = useState([]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await api.getCBSETemplates();
            console.log("Fetch Templates Response:", response);

            let data = [];
            if (response && response.data) {
                if (response.data.marksheet) {
                    setMarksheetList(response.data.marksheet);
                }
                if (response.data.classlist && Array.isArray(response.data.classlist)) {
                    setClassList(response.data.classlist);
                }
                if (response.data.result && Array.isArray(response.data.result)) {
                    data = response.data.result;
                } else if (response.data.resultlist && Array.isArray(response.data.resultlist)) {
                    data = response.data.resultlist;
                } else if (Array.isArray(response.data)) {
                    data = response.data;
                }
            } else if (Array.isArray(response)) {
                data = response;
            } else if (response && response.result && Array.isArray(response.result)) {
                data = response.result;
            }

            console.log("Fetched templates count:", data.length);
            setTemplates(data);
        } catch (error) {
            console.error("Failed to fetch templates", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch Classes
                const classResponse = await api.getClasses();

                let classes = [];
                if (classResponse) {
                    if (classResponse.class_sections && Array.isArray(classResponse.class_sections)) {
                        classes = classResponse.class_sections;
                    } else if (classResponse.data && classResponse.data.class_sections && Array.isArray(classResponse.data.class_sections)) {
                        classes = classResponse.data.class_sections;
                    } else if (classResponse.data && Array.isArray(classResponse.data)) {
                        classes = classResponse.data;
                    } else if (Array.isArray(classResponse)) {
                        classes = classResponse;
                    }
                }
                setClassList(classes);

                // Fetch Templates
                await fetchTemplates();
            } catch (error) {
                console.error("Failed to fetch initial data", error);
            }
        };

        fetchInitialData();
    }, []);

    const handleClassChange = async (e) => {
        const classId = e.target.value;
        const newFormData = { ...formData, class_id: classId };
        setFormData(newFormData);
        setSectionList([]);
        setSelectedSections([]);

        if (classId) {
            try {
                // Use api.getSectionsByClass() as requested
                const response = await api.getSectionsByClass(classId);

                let sections = [];
                if (response.status && response.data && Array.isArray(response.data)) {
                    sections = response.data;
                } else if (response && response.data && Array.isArray(response.data)) {
                    sections = response.data;
                } else if (Array.isArray(response)) {
                    sections = response;
                }

                setSectionList(sections);
            } catch (error) {
                console.error("Failed to fetch sections", error);
            }
        }
    };

    const handleFileSelect = (name, file) => {
        setFormData(prev => ({
            ...prev,
            [name]: file
        }));
    };

    const toggleSection = (id) => {
        if (selectedSections.includes(id)) {
            setSelectedSections(selectedSections.filter(sid => sid !== id));
        } else {
            setSelectedSections([...selectedSections, id]);
        }
    };

    const handleEdit = async (id) => {
        try {
            setLoading(true);
            const response = await api.getCBSETemplateData(id);

            // Check for status true and data object as per user provided JSON
            if (response.status && response.data && response.data.template) {
                const tmpl = response.data.template;
                const classId = response.data.selected_class_id || tmpl.class_id || '';
                const rawSecs = response.data.selected_section_id || response.data.sections || [];
                const secs = Array.isArray(rawSecs) ? rawSecs : (typeof rawSecs === 'string' ? rawSecs.split(',').filter(Boolean) : []);

                // Map sections to IDs (using class_section_id/section_id to match api.getSections generic list)
                // Handle objects or direct IDs
                const selectedSecs = secs.map(s => {
                    if (typeof s === 'object' && s !== null) return s.class_section_id || s.section_id || s.id;
                    return s;
                });

                if (response.data.classlist && Array.isArray(response.data.classlist)) {
                    setClassList(response.data.classlist);
                }

                // Ensure section list is loaded specifically for this class.
                if (classId) {
                    try {
                        const secResponse = await api.getSectionsByClass(classId);
                        let sections = [];
                        if (secResponse.status && secResponse.data && Array.isArray(secResponse.data)) {
                            sections = secResponse.data;
                        } else if (secResponse && secResponse.data && Array.isArray(secResponse.data)) {
                            sections = secResponse.data;
                        } else if (Array.isArray(secResponse)) {
                            sections = secResponse;
                        }
                        setSectionList(sections);
                    } catch (err) {
                        console.error("Failed to load sections for edit", err);
                    }
                }


                setFormData({
                    id: tmpl.id,
                    name: tmpl.name || tmpl.template || '',
                    class_id: classId,
                    marksheet_type: tmpl.marksheet_type || 'exam_wise',
                    description: tmpl.description || '',
                    school_name: tmpl.school_name,
                    exam_center: tmpl.exam_center,
                    date: tmpl.date,
                    orientation: tmpl.orientation || 'P',
                    content: tmpl.content || '',
                    content_footer: tmpl.content_footer || '',
                    exam_session: tmpl.exam_session == "1",
                    is_name: tmpl.is_name == "1",
                    is_father_name: tmpl.is_father_name == "1",
                    is_mother_name: tmpl.is_mother_name == "1",
                    is_admission_no: tmpl.is_admission_no == "1",
                    is_roll_no: tmpl.is_roll_no == "1",
                    is_photo: tmpl.is_photo == "1",
                    is_class: tmpl.is_class == "1",
                    is_section: tmpl.is_section == "1",
                    is_division: tmpl.is_division == "1",
                    is_dob: tmpl.is_dob == "1",
                    remark: tmpl.is_remark == "1",
                });

                setSelectedSections(selectedSecs);
                setIsEditing(true);
                setShowAddModal(true);
            } else {
                toast.error("Failed to load template data");
            }
        } catch (error) {
            console.error("Fetch Edit Data Error", error);
            toast.error("Error loading data");
        } finally {
            setLoading(false);
        }
    };

    const handleView = async (id) => {
        try {
            setViewLoading(true);
            setShowViewModal(true);
            const response = await api.viewCBSETemplate(id);
            if (response.status && response.data && response.data.template) {
                setViewData(response.data.template);
            } else {
                toast.error("Failed to load template details");
                setShowViewModal(false);
            }
        } catch (error) {
            console.error("View Template Error", error);
            toast.error("Error loading template details");
            setShowViewModal(false);
        } finally {
            setViewLoading(false);
        }
    };

    const fetchExamData = async (type, templateId) => {
        if (type && templateId) {
            try {
                setLinkExamLoading(true);
                const response = await api.getCBSEExamData({
                    marksheet_type: type,
                    template_id: templateId
                });
                if (response.status) {
                    const data = response.data || {};
                    setLinkExamData(data);

                    if (data.marksheet) {
                        setMarksheetList(data.marksheet);
                    }

                    // Initialize linkExamFormData from response
                    const templatedata = data.template || data.templatedata || {};
                    const initialExams = [];
                    const initialWeightages = {};
                    const initialTermWeightage = {};
                    const initialTerms = [];

                    if (templatedata.exam_without_term) {
                        Object.keys(templatedata.exam_without_term).forEach(id => {
                            initialExams.push(parseInt(id));
                        });
                    }
                    if (templatedata.exam_without_termweigtage) {
                        Object.assign(initialWeightages, templatedata.exam_without_termweigtage);
                    }
                    if (templatedata.term_details) {
                        Object.keys(templatedata.term_details).forEach(id => {
                            initialTermWeightage[id] = templatedata.term_details[id].weightage;
                        });
                    }
                    if (templatedata.term_exam) {
                        Object.keys(templatedata.term_exam).forEach(termId => {
                            initialTerms.push(parseInt(termId));
                            const termExams = templatedata.term_exam[termId];
                            Object.keys(termExams).forEach(examId => {
                                initialExams.push(parseInt(examId));
                                // For term_wise/all_term, weightage might be within term_exam structure
                                if (termExams[examId].weightage) {
                                    initialWeightages[examId] = termExams[examId].weightage;
                                }
                            });
                        });
                    }

                    setLinkExamFormData({
                        exams: initialExams,
                        weightages: initialWeightages,
                        term_weightage: initialTermWeightage,
                        terms: initialTerms,
                        grading: templatedata.gradeexam_id || '',
                        teacher_remark: templatedata.remarkexam_id || ''
                    });
                } else {
                    toast.error(response.message || "Failed to fetch exam data");
                }
            } catch (error) {
                console.error("Link Exam Data Error", error);
                toast.error("Error fetching exam data");
            } finally {
                setLinkExamLoading(false);
            }
        } else {
            setLinkExamData(null);
        }
    };

    const handleOpenLinkExam = (id, type) => {
        setCurrentTemplateId(id);
        const initialType = type || '';
        setMarksheetType(initialType);
        setLinkExamData(null);
        setLinkExamFormData({
            exams: [],
            weightages: {},
            grading: '',
            teacher_remark: ''
        });
        setShowLinkModal(true);
        if (initialType) {
            fetchExamData(initialType, id);
        }
    };

    const handleMarksheetTypeChange = async (e) => {
        const type = e.target.value;
        setMarksheetType(type);
        fetchExamData(type, currentTemplateId);
    };

    const handleExamCheckboxChange = (examId, isChecked) => {
        setLinkExamFormData(prev => {
            const newExams = isChecked
                ? [...prev.exams, examId]
                : prev.exams.filter(id => id !== examId);

            return {
                ...prev,
                exams: newExams
            };
        });
    };

    const handleWeightageChange = (examId, value) => {
        setLinkExamFormData(prev => ({
            ...prev,
            weightages: {
                ...prev.weightages,
                [examId]: value
            }
        }));
    };

    const getFlatExams = () => {
        if (!linkExamData) return [];
        const source = linkExamData.result || linkExamData.exam_data;
        if (!source) return [];

        const terms = Array.isArray(source) ? source : Object.values(source);
        const exams = [];
        terms.forEach(term => {
            if (term.exam && Array.isArray(term.exam)) {
                exams.push(...term.exam);
            }
        });
        return exams;
    };

    const handleLinkExamSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('template_id', currentTemplateId);
            formData.append('marksheet', marksheetType);
            formData.append('grading', linkExamFormData.grading || '');
            formData.append('teacher_remark', linkExamFormData.teacher_remark || '');

            if (marksheetType === 'term_wise' || marksheetType === 'all_term') {
                // Append terms and their weightages
                linkExamFormData.terms.forEach(termId => {
                    formData.append('terms[]', termId);
                    if (linkExamFormData.term_weightage[termId]) {
                        formData.append(`term_weightage[${termId}]`, linkExamFormData.term_weightage[termId]);
                    }
                });

                const source = linkExamData.result || linkExamData.exam_data || [];
                const terms = Array.isArray(source) ? source : Object.entries(source).map(([id, val]) => ({ ...val, id: id }));

                terms.forEach(term => {
                    const termId = term.id;
                    if (linkExamFormData.terms.includes(parseInt(termId))) {
                        const examsForTerm = (term.exam || [])
                            .filter(ex => linkExamFormData.exams.includes(parseInt(ex.id)))
                            .map(ex => parseInt(ex.id));

                        examsForTerm.forEach(examId => {
                            formData.append(`exam[${termId}][${examId}]`, examId);
                            // Exam level weightage removed as per requirement
                        });
                    }
                });
            } else {
                // Flat format for exam_wise
                linkExamFormData.exams.forEach(examId => {
                    formData.append('exam[]', examId);
                    // Exam level weightage removed as per requirement
                });
            }

            const response = await api.linkCBSEExams(formData);
            if (response.status) {
                toast.success(response.message || "Record Saved Successfully");
                setShowLinkModal(false);
                fetchTemplates();
            } else {
                toast.error(response.message || "Failed to save link");
            }
        } catch (error) {
            console.error("Link Exam Save Error", error);
            toast.error("Error saving link");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const newErrors = {};
        if (!formData.name) newErrors.name = "The Template Name field is required.";
        if (!formData.class_id) newErrors.class_id = "The Class field is required.";
        if (selectedSections.length === 0) newErrors.sections = "The Section field is required.";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('class_id', formData.class_id);
            formDataToSend.append('marksheet_type', formData.marksheet_type);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('school_name', formData.school_name || '');
            formDataToSend.append('exam_center', formData.exam_center || '');
            formDataToSend.append('date', formData.date || '');
            formDataToSend.append('orientation', formData.orientation);
            formDataToSend.append('content', formData.content || '');
            formDataToSend.append('content_footer', formData.content_footer || '');
            formDataToSend.append('exam_session', formData.exam_session ? "1" : "0");
            formDataToSend.append('is_name', formData.is_name ? "1" : "0");
            formDataToSend.append('is_father_name', formData.is_father_name ? "1" : "0");
            formDataToSend.append('is_mother_name', formData.is_mother_name ? "1" : "0");
            formDataToSend.append('is_admission_no', formData.is_admission_no ? "1" : "0");
            formDataToSend.append('is_roll_no', formData.is_roll_no ? "1" : "0");
            formDataToSend.append('is_photo', formData.is_photo ? "1" : "0");
            formDataToSend.append('is_class', formData.is_class ? "1" : "0");
            formDataToSend.append('is_section', formData.is_section ? "1" : "0");
            formDataToSend.append('is_division', formData.is_division ? "1" : "0");
            formDataToSend.append('is_dob', formData.is_dob ? "1" : "0");
            formDataToSend.append('is_remark', formData.remark ? "1" : "0");
            formDataToSend.append('remark', formData.remark ? "1" : "0");

            // Append sections
            selectedSections.forEach(secId => {
                formDataToSend.append('section[]', secId);
            });

            // Append images/files
            if (formData.header_image instanceof File) {
                formDataToSend.append('header_image', formData.header_image);
            }
            if (formData.left_sign instanceof File) {
                formDataToSend.append('left_sign', formData.left_sign);
            }
            if (formData.middle_sign instanceof File) {
                formDataToSend.append('middle_sign', formData.middle_sign);
            }
            if (formData.right_sign instanceof File) {
                formDataToSend.append('right_sign', formData.right_sign);
            }
            if (formData.background_img instanceof File) {
                formDataToSend.append('background_img', formData.background_img);
            }

            console.log("Submitting FormData forTemplate...");

            let response;
            if (isEditing) {
                formDataToSend.append('record_id', formData.id);
                formDataToSend.append('templateid', formData.id);
                response = await api.updateCBSETemplate(formDataToSend);
            } else {
                response = await api.addCBSETemplate(formDataToSend);
            }

            if (response.status) {
                toast.success(response.message || (isEditing ? "Record Updated Successfully" : "Record Saved Successfully"));
                setShowAddModal(false);
                resetForm();
                // Refresh list with a small delay to ensure DB consistency
                setTimeout(async () => {
                    await fetchTemplates();
                }, 500);
            } else {
                toast.error(response.message || "Failed to save record");
            }
        } catch (error) {
            console.error("Error saving template:", error);
            toast.error("Failed to save record");
        }
    };

    const toggleSelectAll = () => {
        if (selectedSections.length === sectionList.length) {
            setSelectedSections([]);
        } else {
            setSelectedSections(sectionList.map(s => s.id));
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const resetForm = () => {
        setFormData({
            name: '', class_id: '', marksheet_type: 'exam_wise', orientation: 'P', school_name: '', exam_center: '', date: '',
            content: '', content_footer: '', description: '',
            is_name: false, is_father_name: false, is_mother_name: false, exam_session: false,
            is_admission_no: false, is_roll_no: false, is_photo: false, is_class: false, is_section: false,
            is_division: false, is_dob: false, remark: false
        });
        setSelectedSections([]);
        setIsSectionOpen(false);
        setErrors({});
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                const response = await api.deleteCBSETemplate(id);
                if (response.status === '1' || response.status === 1 || response.status === true) {
                    toast.success(response.message || "Record Deleted Successfully");
                    // Refresh list
                    await fetchTemplates();
                } else {
                    toast.error(response.message || "Failed to delete record");
                }
            } catch (error) {
                console.error("Delete Error", error);
                toast.error("Error deleting record");
            }
        }
    };

    const filteredTemplates = templates.filter(t =>
        (t.name || t.template || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate pagination
    const totalItems = filteredTemplates.length;
    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentItems = filteredTemplates.slice(indexOfFirstItem, indexOfLastItem);

    const tableColumns = [
        { key: 'template', label: 'Template' },
        { key: 'class_sections', label: 'Class (Sections)' },
        { key: 'description', label: 'Template Description' }
    ];

    const [visibleColumns, setVisibleColumns] = useState(
        () => new Set(tableColumns.map(c => c.key))
    );

    const handleToggleColumn = (key) => {
        setVisibleColumns(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const getExportData = () => {
        const visibleCols = tableColumns.filter(c => visibleColumns.has(c.key));
        const headers = visibleCols.map(c => c.label);

        const fieldMap = {
            template: t => t.name,
            class_sections: t => t.class_sections,
            description: t => t.description
        };

        const rows = filteredTemplates.map(template =>
            visibleCols.map(c => String(fieldMap[c.key]?.(template) ?? ''))
        );

        return { headers, rows };
    };

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content-header">
                    <h1><i className="fa fa-money"></i> State Examination</h1>
                </section>
                <section className="content">
                    <div className="row" style={{ marginTop: '0px' }}>
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix">Template List</h3>
                                    <div className="box-tools pull-right">
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-primary"
                                                onClick={() => { resetForm(); setIsEditing(false); setShowAddModal(true); }}
                                                style={{ borderRadius: '20px', padding: '5px 12px' }}
                                            >
                                                <i className="fa fa-plus"></i> Add
                                            </button>
                                            <button
                                                onClick={() => window.history.back()}
                                                className="btn btn-primary btn-sm"
                                                style={{ borderRadius: '20px', padding: '5px 12px' }}
                                            >
                                                <i className="fa fa-arrow-left"></i> Back
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="box-body">
                                    <style>
                                        {`
                                            .action-button-boxed {
                                                display: flex;
                                                align-items: center;
                                                justify-content: center;
                                                width: 24px;
                                                height: 24px;
                                                background: #fff;
                                                border: none;
                                                cursor: pointer;
                                                transition: all 0.2s;
                                            }
                                            .action-button-boxed:hover {
                                                background: #f1f1f1;
                                            }
                                            .hover-main-entry:hover {
                                                background-color: #fcfcfc !important;
                                            }
                                            .modal-header.modal-header-responsive {
                                                padding: 12px 20px !important;
                                                border-bottom: none !important;
                                                min-height: auto !important;
                                                margin-bottom: 0 !important;
                                                display: flex !important;
                                                flex-direction: row !important;
                                                flex-wrap: nowrap !important;
                                                align-items: center !important;
                                                justify-content: space-between !important;
                                                background: #9754ca !important;
                                                width: 100% !important;
                                            }
                                            .modal-header-responsive::before,
                                            .modal-header-responsive::after {
                                                display: none !important;
                                            }
                                            .modal-header-responsive .modal-title {
                                                margin: 0 !important;
                                                padding: 0 !important;
                                                line-height: 1 !important;
                                                font-size: 16px !important;
                                                color: #fff !important;
                                                font-weight: bold !important;
                                                display: inline-block !important;
                                            }
                                            .modal-header-responsive .close-btn-custom {
                                                margin: 0 !important;
                                                padding: 0 !important;
                                                float: none !important;
                                                color: #fff !important;
                                                opacity: 1 !important;
                                                font-size: 35px !important;
                                                font-weight: bold !important;
                                                line-height: 1 !important;
                                                display: flex !important;
                                                align-items: center !important;
                                                justify-content: center !important;
                                                background: none !important;
                                                border: none !important;
                                                cursor: pointer !important;
                                                transition: transform 0.5s ease !important;
                                            }
                                            .modal-header-responsive .close-btn-custom:hover {
                                                transform: rotate(90deg) !important;
                                                opacity: 0.8 !important;
                                            }
                                            .modal-body-responsive {
                                                padding: 20px !important;
                                            }
                                            .button{
                                                margin-top: -100px;
                                            }
                                            @media (max-width: 767px) {
                                                .modal-body-responsive {
                                                    padding: 15px 20px 0px 20px !important;
                                                }
                                                .modal-dialog {
                                                    width: 95% !important;
                                                    margin: 10px auto !important;
                                                }
                                                .mailbox-messages {
                                                    border: 1px solid #ddd;
                                                    border-radius: 4px;
                                                    margin-top: 10px;
                                                }
                                                .mobile-stack {
                                                    display: flex;
                                                    flex-direction: column;
                                                    align-items: center !important;
                                                    gap: 15px !important;
                                                    text-align: center !important;
                                                    width: 100% !important;
                                                    margin: 0 auto !important;
                                                }
                                                .mobile-stack > div {
                                                    width: 100% !important;
                                                    display: flex !important;
                                                    justify-content: center !important;
                                                    text-align: center !important;
                                                    margin-bottom: 5px;
                                                }
                                                .mobile-stack .pull-left,
                                                .mobile-stack .pull-right {
                                                    float: none !important;
                                                    display: flex !important;
                                                    justify-content: center !important;
                                                    align-items: center !important;
                                                    margin: 0 auto !important;
                                                    width: 100% !important;
                                                }
                                                .DTED_Action_Buttons {
                                                    justify-content: center !important;
                                                }
                                                .modal-body-inner {
                                                    overflow-x: auto;
                                                    -webkit-overflow-scrolling: touch;
                                                    border: 1px solid #ddd;
                                                    border-radius: 4px;
                                                    -ms-overflow-style: none;
                                                    scrollbar-width: none;
                                                    text-align: center;
                                                }
                                                .modal-body-inner::-webkit-scrollbar {
                                                    display: none;
                                                }
                                                .modal-body-inner .marksheet-container {
                                                    min-width: 700px;
                                                    display: inline-block;
                                                    text-align: left;
                                                }
                                                #viewTemplateModal .modal-body {
                                                    padding: 15px !important;
                                                }
                                            }
                                        `}
                                    </style>
                                    <TableToolbar
                                        searchTerm={searchTerm}
                                        onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
                                        recordsPerPage={recordsPerPage}
                                        onRecordsPerPageChange={(val) => { setRecordsPerPage(val); setCurrentPage(1); }}
                                        columns={tableColumns}
                                        visibleColumns={visibleColumns}
                                        onToggleColumn={handleToggleColumn}
                                        getExportData={getExportData}
                                        exportFileName="Template_List"
                                        exportTitle="Template List"
                                    />
                                    <div className="mailbox-messages" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                                        <table className="table no-margin" style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse', fontSize: '13px', tableLayout: 'fixed' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#fff' }}>
                                                    {visibleColumns.has('template') && <th style={{ width: '20%', fontWeight: '600', padding: '12px 8px', color: '#000' }}>Template</th>}
                                                    {visibleColumns.has('class_sections') && <th style={{ width: '20%', fontWeight: '600', padding: '12px 8px', color: '#000' }}>Class (Sections)</th>}
                                                    {visibleColumns.has('description') && <th style={{ width: '42%', fontWeight: '600', padding: '12px 8px', color: '#000' }}>Template Description</th>}
                                                    <th style={{ width: '18%', fontWeight: '600', padding: '12px 8px', color: '#000', textAlign: 'right' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentItems.map(template => (
                                                    <tr key={template.id} className="hover-main-entry" style={{ borderBottom: '1px solid #f4f4f4', transition: 'background-color 0.2s' }}>
                                                        {visibleColumns.has('template') && <td style={{ verticalAlign: 'top', padding: '15px 8px', borderTop: 'none', whiteSpace: 'normal', overflowWrap: 'break-word', wordBreak: 'break-all' }}><strong>{template.name}</strong></td>}
                                                        {visibleColumns.has('class_sections') && <td style={{ verticalAlign: 'top', padding: '15px 8px', borderTop: 'none', whiteSpace: 'normal', overflowWrap: 'break-word', wordBreak: 'break-all' }}>{template.class_sections}</td>}
                                                        {visibleColumns.has('description') && <td style={{ verticalAlign: 'top', padding: '15px 8px', borderTop: 'none', whiteSpace: 'normal', overflowWrap: 'break-word', wordBreak: 'break-all' }}>{template.description}</td>}
                                                        <td style={{ verticalAlign: 'top', textAlign: 'right', padding: '15px 8px', borderTop: 'none' }}>
                                                            <div className="DTED_Action_Buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', whiteSpace: 'nowrap' }}>
                                                                <div onClick={() => handleView(template.id)} className="action-button-boxed" title="View">
                                                                    <i className="fa fa-reorder" style={{ color: '#555', fontSize: '12px' }}></i>
                                                                </div>
                                                                <div onClick={() => handleOpenLinkExam(template.id, template.marksheet_type)} className="action-button-boxed" title="Link Exam">
                                                                    <i className="fa fa-newspaper-o" style={{ color: '#555', fontSize: '12px' }}></i>
                                                                </div>
                                                                <div onClick={() => handleEdit(template.id)} className="action-button-boxed" title="Edit">
                                                                    <i className="fa fa-pencil" style={{ color: '#555', fontSize: '12px' }}></i>
                                                                </div>
                                                                <div onClick={() => navigate(`/cbseexam/template/templatewiserank/${template.id}`)} className="action-button-boxed" title="Generate Rank">
                                                                    <i className="fa fa-list-alt" style={{ color: '#555', fontSize: '12px' }}></i>
                                                                </div>
                                                                <div onClick={() => handleDelete(template.id)} className="action-button-boxed" title="Delete">
                                                                    <i className="fa fa-remove" style={{ color: '#000', fontSize: '13px', fontWeight: 'bold' }}></i>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {currentItems.length === 0 && (
                                                    <tr>
                                                        <td colSpan="4" className="text-center" style={{ padding: '20px' }}>No data found</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="pt15 pb15" style={{ padding: '15px 0' }}>
                                        <Pagination
                                            totalItems={totalItems}
                                            itemsPerPage={recordsPerPage}
                                            currentPage={currentPage}
                                            onPageChange={(page) => setCurrentPage(page)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div id="myModal" className="modal fade in hide-scrollbar" role="dialog" style={{ display: 'flex', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1050, overflowY: 'auto' }}>
                    <div className="modal-dialog modal-xl" style={{ margin: '30px auto' }}>
                        <div className="modal-content">
                            <div className="modal-header modal-header-responsive">
                                <h4 className="modal-title" id="modal-title">{isEditing ? "Edit Template" : "Add Template"}</h4>
                                <button type="button" className="close-btn-custom" onClick={() => setShowAddModal(false)}>&times;</button>
                            </div>
                            <form role="form" id="form1" onSubmit={handleSubmit} method="post" encType="multipart/form-data">
                                <div className="modal-body modal-body-responsive">
                                    {isEditing && <div id="templatedata"></div>}
                                    <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
                                        <label>Template</label><small className="req"> *</small>
                                        <input type="text" id="name" name="name" className="form-control" value={formData.name} onChange={handleInputChange} />
                                        {errors.name && <span className="text-danger">{errors.name}</span>}
                                    </div>
                                    <div className="row">
                                        <div className="col-md-4">
                                            <div className={`form-group ${errors.class_id ? 'has-error' : ''}`}>
                                                <label>Class</label><small className="req"> *</small>
                                                <select autoFocus id="searchclassid" name="class_id" className="form-control" value={formData.class_id} onChange={handleClassChange}>
                                                    <option value="">Select</option>
                                                    {classList?.map(cls => (
                                                        <option key={cls.id} value={cls.id}>{cls.class}</option>
                                                    ))}
                                                </select>
                                                {errors.class_id && <span className="text-danger">{errors.class_id}</span>}
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className={`form-group relative z-index-6 ${errors.sections ? 'has-error' : ''}`}>
                                                <label>Section</label><small className="req"> *</small>
                                                <div id="checkbox-dropdown-container">
                                                    <div className="custom-select" id="custom-select" onClick={() => setIsSectionOpen(!isSectionOpen)}>
                                                        {selectedSections.length > 0 ? `${selectedSections.length} Selected` : "Select"}
                                                    </div>
                                                    {isSectionOpen && (
                                                        <div className="custom-select-option-box" id="custom-select-option-box" style={{ display: 'block' }}>
                                                            <div className="custom-select-option checkbox">
                                                                <label className="vertical-middle line-h-18">
                                                                    <input className="custom-select-option-checkbox select_all" type="checkbox" name="select_all" id="select_all" checked={sectionList.length > 0 && selectedSections.length === sectionList.length} onChange={toggleSelectAll} /> Select All
                                                                </label>
                                                            </div>
                                                            {sectionList.map(s => (
                                                                <div key={s.id} className="custom-select-option checkbox">
                                                                    <label className="vertical-middle line-h-18">
                                                                        <input className="custom-select-option-checkbox" type="checkbox" name="section[]" checked={selectedSections.some(sid => String(sid) === String(s.id))} onChange={() => toggleSection(s.id)} /> {s.section}
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                {errors.sections && <span className="text-danger">{errors.sections}</span>}
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="col-sm-12">
                                                <div className="form-group">
                                                    <label htmlFor="input-type">Marksheet Type</label>
                                                    <div id="input-type" className="row">
                                                        <div className="col-sm-4">
                                                            <label className="radio-inline">
                                                                <input name="orientation" className="orientation" id="input-type-student" value="L" type="radio" checked={formData.orientation === 'L'} onChange={handleInputChange} />Landscape </label>
                                                        </div>
                                                        <div className="col-sm-4">
                                                            <label className="radio-inline">
                                                                <input name="orientation" className="orientation" id="input-type-student" value="P" type="radio" checked={formData.orientation === 'P'} onChange={handleInputChange} />Portrait</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label>School Name</label>
                                                <input autoFocus id="line" name="school_name" placeholder="" type="text" className="form-control" value={formData.school_name} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label>Exam Center</label>
                                                <input id="exam_center" name="exam_center" placeholder="" type="text" className="form-control" value={formData.exam_center} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label>Printing Date</label>
                                                <input id="date" name="date" placeholder="" type="text" className="form-control date" value={formData.date} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <DragDropFileUpload
                                            label="Header Image (965px X 150px)"
                                            name="header_image"
                                            currentFile={formData.header_image}
                                            onFileSelect={handleFileSelect}
                                            height="40px"
                                        />
                                        <span className="text-danger" id="error_header_image"></span>
                                    </div>


                                    <div className="form-group">
                                        <label>Header Text (Content)</label>
                                        <textarea className="form-control" name="content" value={formData.content} onChange={handleInputChange}></textarea>
                                    </div>

                                    <div className="form-group">
                                        <label>Footer Text</label>
                                        <textarea className="form-control" id="question_textbox" name="content_footer" value={formData.content_footer} onChange={handleInputChange}></textarea>
                                        <span className="text-danger" id="error_content_footer"></span>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <DragDropFileUpload
                                                    label="Left Sign (100px X 50px)"
                                                    name="left_sign"
                                                    currentFile={formData.left_sign}
                                                    onFileSelect={handleFileSelect}
                                                    height="40px"
                                                />
                                                <span className="text-danger" id="error_left_sign"></span>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <DragDropFileUpload
                                                    label="Middle Sign (100px X 50px)"
                                                    name="middle_sign"
                                                    currentFile={formData.middle_sign}
                                                    onFileSelect={handleFileSelect}
                                                    height="40px"
                                                />
                                                <span className="text-danger" id="error_middle_sign"></span>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <DragDropFileUpload
                                                    label="Right Sign (100px X 50px)"
                                                    name="right_sign"
                                                    currentFile={formData.right_sign}
                                                    onFileSelect={handleFileSelect}
                                                    height="40px"
                                                />
                                                <span className="text-danger" id="error_right_sign"></span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <DragDropFileUpload
                                            label="Background Image"
                                            name="background_img"
                                            currentFile={formData.background_img}
                                            onFileSelect={handleFileSelect}
                                            height="40px"
                                        />
                                        <span className="text-danger" id="error_background_img"></span>
                                    </div>
                                    <div className="form-group">
                                        <label>Template Description</label>
                                        <textarea name="description" cols="115" rows="3" className="form-control" value={formData.description} onChange={handleInputChange}></textarea>
                                    </div>

                                    <div className="form-group switch-inline">
                                        <label>Student Name</label>
                                        <div className="material-switch switchcheck">
                                            <input id="is_name" name="is_name" type="checkbox" className="chk" checked={formData.is_name} onChange={handleInputChange} />
                                            <label htmlFor="is_name" className="label-success"></label>
                                        </div>
                                    </div>
                                    <div className="form-group switch-inline">
                                        <label>Father Name</label>
                                        <div className="material-switch switchcheck">
                                            <input id="is_father_name" name="is_father_name" type="checkbox" className="chk" checked={formData.is_father_name} onChange={handleInputChange} />
                                            <label htmlFor="is_father_name" className="label-success"></label>
                                        </div>
                                    </div>
                                    <div className="form-group switch-inline">
                                        <label>Mother Name</label>
                                        <div className="material-switch switchcheck">
                                            <input id="is_mother_name" name="is_mother_name" type="checkbox" className="chk" checked={formData.is_mother_name} onChange={handleInputChange} />
                                            <label htmlFor="is_mother_name" className="label-success"></label>
                                        </div>
                                    </div>
                                    <div className="form-group switch-inline">
                                        <label>Template Academic Session</label>
                                        <div className="material-switch switchcheck">
                                            <input id="exam_session" name="exam_session" type="checkbox" className="chk" checked={formData.exam_session} onChange={handleInputChange} />
                                            <label htmlFor="exam_session" className="label-success"></label>
                                        </div>
                                    </div>
                                    <div className="form-group switch-inline">
                                        <label>Admission No</label>
                                        <div className="material-switch switchcheck">
                                            <input id="is_admission_no" name="is_admission_no" type="checkbox" className="chk" checked={formData.is_admission_no} onChange={handleInputChange} />
                                            <label htmlFor="is_admission_no" className="label-success"></label>
                                        </div>
                                    </div>
                                    <div className="form-group switch-inline">
                                        <label>Roll No</label>
                                        <div className="material-switch switchcheck">
                                            <input id="is_roll_no" name="is_roll_no" type="checkbox" className="chk" checked={formData.is_roll_no} onChange={handleInputChange} />
                                            <label htmlFor="is_roll_no" className="label-success"></label>
                                        </div>
                                    </div>
                                    <div className="form-group switch-inline">
                                        <label>Photo</label>
                                        <div className="material-switch switchcheck">
                                            <input id="is_photo" name="is_photo" type="checkbox" className="chk" checked={formData.is_photo} onChange={handleInputChange} />
                                            <label htmlFor="is_photo" className="label-success"></label>
                                        </div>
                                    </div>
                                    <div className="form-group switch-inline">
                                        <label>Class</label>
                                        <div className="material-switch switchcheck">
                                            <input id="is_class" name="is_class" type="checkbox" className="chk" checked={formData.is_class} onChange={handleInputChange} />
                                            <label htmlFor="is_class" className="label-success"></label>
                                        </div>
                                    </div>
                                    <div className="form-group switch-inline">
                                        <label>Section</label>
                                        <div className="material-switch switchcheck">
                                            <input id="is_section" name="is_section" type="checkbox" className="chk" checked={formData.is_section} onChange={handleInputChange} />
                                            <label htmlFor="is_section" className="label-success"></label>
                                        </div>
                                    </div>
                                    <div className="form-group switch-inline">
                                        <label>Division</label>
                                        <div className="material-switch switchcheck">
                                            <input id="is_division" name="is_division" type="checkbox" className="chk" checked={formData.is_division} onChange={handleInputChange} />
                                            <label htmlFor="is_division" className="label-success"></label>
                                        </div>
                                    </div>
                                    <div className="form-group switch-inline">
                                        <label>Date of Birth</label>
                                        <div className="material-switch switchcheck">
                                            <input id="is_dob" name="is_dob" type="checkbox" className="chk" checked={formData.is_dob} onChange={handleInputChange} />
                                            <label htmlFor="is_dob" className="label-success"></label>
                                        </div>
                                    </div>
                                    <div className="form-group switch-inline">
                                        <label>Teacher Remark</label>
                                        <div className="material-switch switchcheck">
                                            <input id="remark" name="remark" type="checkbox" className="chk" checked={formData.remark} onChange={handleInputChange} />
                                            <label htmlFor="remark" className="label-success"></label>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer clearboth">
                                    <button type="submit" className="btn btn-primary pull-right" data-loading-text="Submitting" value="" style={{ borderRadius: '20px' }}>Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div >
            )}
            <div className={`modal-backdrop fade in ${showAddModal ? '' : 'hide'}`} onClick={() => setShowAddModal(false)}></div>

            {/* Link Exam Modal */}
            {
                showLinkModal && (
                    <div id="linkexamModal" className="modal fade in hide-scrollbar" role="dialog" style={{ display: 'flex', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1050, overflowY: 'auto' }}>
                        <div className="modal-dialog modal-xl" style={{ margin: '30px auto' }}>
                            <div className="modal-content">
                                <div className="modal-header modal-header-responsive">
                                    <h4 className="modal-title">Link Exam</h4>
                                    <button type="button" className="close-btn-custom" onClick={() => setShowLinkModal(false)}>&times;</button>
                                </div>
                                <form role="form" id="formlink" onSubmit={handleLinkExamSubmit}>
                                    <div className="modal-body modal-body-responsive">
                                        <div className="form-group">
                                            <input type="hidden" name="template_id" id="template_id" value={currentTemplateId || ''} />
                                            <label style={{ fontWeight: 'bold', fontSize: '13px' }}>Marksheet Type <span style={{ color: 'red' }}>*</span></label>
                                            <select id="marksheet" name="marksheet" className="form-control" value={marksheetType} onChange={handleMarksheetTypeChange} required style={{ height: '36px', fontSize: '13px', width: '250px' }}>
                                                <option value="">Select</option>
                                                {marksheetList.map(m => (
                                                    <option key={m.id} value={m.short_code}>{m.name}</option>
                                                ))}
                                            </select>
                                            <span className="text-danger" id="error_marksheet"></span>
                                        </div>

                                        <div id="examdata" style={{ marginTop: '15px' }}>
                                            {linkExamLoading ? (
                                                <div className="text-center" style={{ padding: '20px' }}>
                                                    <i className="fa fa-spinner fa-spin fa-2x"></i>
                                                    <p>Loading exams...</p>
                                                </div>
                                            ) : linkExamData && (linkExamData.result || linkExamData.exam_data || linkExamData.subjectgroupList) ? (
                                                <div style={{ overflowX: 'auto' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                                        <thead>
                                                            <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                                                                <th style={{ padding: '10px 12px', fontWeight: 'bold', textAlign: 'left', width: '20%', borderBottom: '2px solid #ddd' }}>Term</th>
                                                                <th style={{ padding: '10px 12px', fontWeight: 'bold', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Exam Name</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {(linkExamData.result || linkExamData.exam_data) ? (
                                                                (Array.isArray(linkExamData.result || linkExamData.exam_data)
                                                                    ? (linkExamData.result || linkExamData.exam_data)
                                                                    : Object.entries(linkExamData.result || linkExamData.exam_data || {}).map(([id, val]) => ({ ...val, id: id }))
                                                                ).map(term => (
                                                                    <React.Fragment key={term.id || Math.random()}>
                                                                        <tr>
                                                                            <td style={{ padding: '10px 12px', fontWeight: 'bold', verticalAlign: 'top', borderBottom: '1px solid #eee', color: '#333' }}>{term.name}</td>
                                                                            <td style={{ borderBottom: '1px solid #eee' }}></td>
                                                                        </tr>
                                                                        {(term.exam || []).map(exam => (
                                                                            <tr key={exam.id}>
                                                                                <td style={{ borderBottom: '1px solid #eee' }}></td>
                                                                                <td style={{ padding: '8px 12px', borderBottom: '1px solid #eee' }}>
                                                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontWeight: 'normal', cursor: 'pointer' }}>
                                                                                        <input
                                                                                            type="radio"
                                                                                            name="link_exam_selection"
                                                                                            value={exam.id}
                                                                                            checked={linkExamFormData.exams.includes(parseInt(exam.id))}
                                                                                            onChange={() => {
                                                                                                setLinkExamFormData(prev => ({
                                                                                                    ...prev,
                                                                                                    exams: [parseInt(exam.id)]
                                                                                                }));
                                                                                            }}
                                                                                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                                                                        />
                                                                                        <span>{exam.name}</span>
                                                                                    </label>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </React.Fragment>
                                                                ))) : (
                                                                <tr>
                                                                    <td colSpan={2} style={{ textAlign: 'center', padding: '20px', color: '#999' }}>No exams found</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : marksheetType ? (
                                                <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>No exams found for this marksheet type</div>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="modal-footer" style={{ borderTop: '1px solid #e5e5e5', padding: '15px 20px', textAlign: 'right' }}>
                                        <button type="submit" className="btn" style={{
                                            borderRadius: '25px',
                                            background: '#9754ca',
                                            color: '#fff',
                                            border: 'none',
                                            padding: '8px 30px',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            cursor: 'pointer'
                                        }}>Save</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }
            <div className={`modal-backdrop fade in ${showLinkModal ? '' : 'hide'}`} onClick={() => setShowLinkModal(false)}></div>

            {/* View Template Modal */}
            {
                showViewModal && (
                    <div id="viewTemplateModal" className="modal fade in hide-scrollbar" role="dialog" style={{ display: 'flex', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1050, overflowY: 'auto' }}>
                        <div className="modal-dialog modal-xl" style={{ margin: '30px auto', width: '95%', maxWidth: '1300px' }}>
                            <div className="modal-content" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)' }}>
                                <div className="modal-header modal-header-responsive">
                                    <h4 className="modal-title">{viewData ? viewData.name : 'Template'}</h4>
                                    <button type="button" className="close-btn-custom" onClick={() => setShowViewModal(false)}>&times;</button>
                                </div>
                                <div className="modal-body" style={{
                                    padding: '5px',
                                    overflowY: 'auto',
                                    overflowX: 'hidden',
                                    flex: 1,
                                    minHeight: 0
                                }}>
                                    {viewLoading ? (
                                        <div className="text-center p10">
                                            <i className="fa fa-spinner fa-spin fa-3x"></i>
                                            <p>Loading template details...</p>
                                        </div>
                                    ) : viewData ? (
                                        <div className="modal-body-inner" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', border: 'none', borderRadius: '0' }}>
                                            <ViewTemplate template={viewData} />
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <i className="fa fa-file-text-o fa-5x"></i>
                                            <p>No template data found.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            <div className={`modal-backdrop fade in ${showViewModal ? '' : 'hide'}`} onClick={() => setShowViewModal(false)}></div>

            <Footer />
        </div >
    );
};

export default Template;
