import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../../components/Loader';
import SISLayout from './SISLayout';
import { useSISCounts } from '../../context/SISCountContext';
import FollowUpModal from '../../components/FollowUpModal';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import Pagination from '../../utils/Pagination';
import PremiumTableToolbar from '../../utils/PremiumTableToolbar';
import { buildExportData } from '../../utils/tableExport';
import './StudentSearch.css';

const OnlineStudentList = () => {
    const { updateCount } = useSISCounts();
    // State
    const [students, setStudents] = useState([]);

    // UI Form State
    const [formData, setFormData] = useState({
        class_id: '',
        section_id: '',
        search_text: ''
    });

    // Active filters applied after "Apply" is clicked
    const [activeFilters, setActiveFilters] = useState({
        class_id: '',
        section_id: '',
        search_text: ''
    });

    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [showFollowUpModal, setShowFollowUpModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [printLoading, setPrintLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(100);

    const columns = [
        { key: 'ref_no', label: 'Reference No' },
        { key: 'name', label: 'Student Name', width: '200px' },
        { key: 'class_name', label: 'Class', width: '140px' },
        { key: 'father_name', label: 'Father Name' },
        { key: 'dob', label: 'Date Of Birth' },
        { key: 'gender', label: 'Gender' },
        { key: 'category', label: 'Category' },
        { key: 'mobile', label: 'Mobile Number' },
        { key: 'form_status', label: 'Form Status' },
        { key: 'enrolled', label: 'Enrolled' },
        { key: 'created_at', label: 'Created At' }
    ];

    const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(col => col.key)));

    const handleToggleColumn = (columnKey) => {
        setVisibleColumns(prev => {
            const newSet = new Set(prev);
            if (newSet.has(columnKey)) {
                newSet.delete(columnKey);
            } else {
                newSet.add(columnKey);
            }
            return newSet;
        });
    };

    // Fetch classes
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await api.getStudentSearchInfo();
                if (response && response.data && Array.isArray(response.data.classlist)) {
                    setClasses(response.data.classlist);
                }
            } catch (err) {
                console.warn('Failed to fetch classes:', err);
            }
        };
        fetchClasses();
    }, []);

    // Fetch students
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await api.getOnlineStudentList();
                if (response && response.data) {
                    const formattedStudents = response.data.map(student => ({
                        id: student.id,
                        ref_no: student.reference_no,
                        name: student.name,
                        class_name: `${student.class} (${student.section})`,
                        class_raw: student.class,
                        section_raw: student.section,
                        class_id: student.class_id,
                        section_id: student.section_id,
                        father_name: student.father_name,
                        dob: student.dob,
                        gender: student.gender,
                        category: student.category,
                        mobile: student.mobile,
                        form_status: student.form_status,
                        payment_status: student.payment_status,
                        enrolled: student.is_enrolled ? 'Yes' : 'No',
                        created_at: student.created_at,
                    }));
                    setStudents(formattedStudents);
                }
            } catch (error) {
                console.error("Error fetching online student list", error);
            } finally {
                setInitialLoading(false);
            }
        };

        fetchStudents();
    }, []);

    const handleClassChange = async (e) => {
        const classId = e.target.value;
        setFormData(prev => ({
            ...prev,
            class_id: classId,
            section_id: ''
        }));
        setSections([]);

        if (classId) {
            try {
                const response = await api.getSectionsByClass(classId);
                if (response && response.data) {
                    setSections(response.data);
                } else if (response && Array.isArray(response)) {
                    setSections(response);
                }
            } catch (error) { }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFormData({ class_id: '', section_id: '', search_text: '' });
        setActiveFilters({ class_id: '', section_id: '', search_text: '' });
        setCurrentPage(1);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setActiveFilters({ ...formData });
        setCurrentPage(1);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                const response = await api.deleteOnlineStudent(id);
                if (response && response.status) {
                    toast.success(response.message || 'Record deleted successfully');
                    setStudents(prev => prev.filter(student => student.id !== id));
                } else {
                    toast.error('Failed to delete record');
                }
            } catch (error) {
                console.error("Error deleting record", error);
                toast.error('An error occurred while deleting');
            }
        }
    };

    const handlePrint = async (refNo) => {
        setPrintLoading(true);
        try {
            const response = await api.getOnlineAdmissionReview(refNo);
            if (response && response.status) {
                await printAdmission(response);
            } else {
                toast.error('Failed to fetch admission review');
            }
        } catch (error) {
            console.error("Error fetching admission review", error);
            toast.error('An error occurred while fetching details');
        } finally {
            setPrintLoading(false);
        }
    };

    const printAdmission = async (d) => {
        try {
            let headerImgUrl = '';
            let footerText = '';
            try {
                const settingsRes = await api.getPrintHeaderFooterSettings();
                if (settingsRes?.status === 'success' && settingsRes?.result) {
                    const baseUrl = 'https://newlayout.wisibles.com/uploads/print_headerfooter';
                    const admissionItem = settingsRes.result.find(i => i.print_type === 'online_admission_receipt');
                    if (admissionItem) {
                        if (admissionItem.header_image)
                            headerImgUrl = `${baseUrl}/online_admission_receipt/${admissionItem.header_image}`;
                        footerText = admissionItem.footer_content || '';
                    }
                }
            } catch (e) { }

            const refNo = d.reference_no || '-';
            const formStatus = d.form_status === '1' ? 'Submitted' : 'Not Submitted';
            const formStatusColor = d.form_status === '1' ? '#3c763d' : '#a94442';

            const printHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Online Admission - ${refNo}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 11px; color: #333; }
    .print-header img { width: 100%; height: auto; display: block; max-height: 80px; object-fit: cover; }
    .print-body { padding: 8px 18px; }
    .meta-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .meta-badges { display: flex; gap: 6px; }
    .badge-box { border: 1px solid #ddd; border-radius: 4px; padding: 3px 10px; text-align: center; font-size: 10px; }
    .badge-box .label { font-size: 9px; color: #777; display: block; }
    .badge-box .value { font-weight: bold; }
    .form-status-val { color: ${formStatusColor}; font-weight: bold; }
    .section-card { border: 1px solid #ddd; border-radius: 4px; margin-bottom: 7px; overflow: hidden; }
    .section-title { background: #f5f5f5; padding: 4px 12px; font-weight: bold; font-size: 11px; border-bottom: 1px solid #ddd; }
    .section-body { padding: 5px 12px; }
    .field-row { display: flex; flex-wrap: wrap; margin-bottom: 4px; }
    .field-col { flex: 1 1 25%; min-width: 100px; }
    .field-col .field-label { font-size: 9px; color: #777; }
    .field-col .field-value { font-size: 11px; color: #333; margin-top: 1px; }
    @media print {
      @page { margin: 6mm; size: A4; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="print-header">${headerImgUrl ? `<img src="${headerImgUrl}" />` : ''}</div>
  <div class="print-body">
    <div class="meta-row">
      <div class="meta-badges">
        <div class="badge-box"><span class="label">Reference No</span><span class="value">${refNo}</span></div>
        <div class="badge-box"><span class="label">Form Status</span><span class="value form-status-val">${formStatus}</span></div>
      </div>
    </div>
    <div class="section-card"><div class="section-title">Basic Details</div><div class="section-body">
      <div class="field-row">
        <div class="field-col"><div class="field-label">First Name</div><div class="field-value">${d.student?.firstname || '-'}</div></div>
        <div class="field-col"><div class="field-label">Last Name</div><div class="field-value">${d.student?.lastname || '-'}</div></div>
        <div class="field-col"><div class="field-label">Mobile Number</div><div class="field-value">${d.contact?.mobile || '-'}</div></div>
      </div>
    </div></div>
  </div>
  <div style="text-align:center; margin: 10px;" class="no-print">
    <button onclick="window.print()">Print</button>
  </div>
</body>
</html>`;

            const printWin = window.open('', '_blank', 'width=900,height=700');
            printWin.document.open();
            printWin.document.write(printHtml);
            printWin.document.close();
        } catch (error) {
            console.error('Print error:', error);
        }
    };

    const handleCloseFollowUp = () => {
        setShowFollowUpModal(false);
        setSelectedStudent(null);
    };

    // Sorting Logic
    const sortedStudents = useMemo(() => {
        let sortableStudents = [...students];
        if (sortConfig.key) {
            sortableStudents.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableStudents;
    }, [students, sortConfig]);

    // Filtering Logic
    const filteredStudents = useMemo(() => {
        return sortedStudents.filter(student => {
            // Filter by search keyword
            if (activeFilters.search_text) {
                const searchLower = activeFilters.search_text.toLowerCase();
                const matchesKeyword = Object.values(student).some(val =>
                    String(val).toLowerCase().includes(searchLower)
                );
                if (!matchesKeyword) return false;
            }

            // Filter by class
            if (activeFilters.class_id) {
                // If API returned class_id, use exact match
                if (student.class_id) {
                    if (String(student.class_id) !== String(activeFilters.class_id)) return false;
                } else {
                    // Fallback to name comparison
                    const selectedClassObj = classes.find(c => String(c.id) === String(activeFilters.class_id));
                    if (selectedClassObj && student.class_raw !== selectedClassObj.class) {
                        return false;
                    }
                }
            }

            // Filter by section
            if (activeFilters.section_id) {
                if (student.section_id) {
                    if (String(student.section_id) !== String(activeFilters.section_id)) return false;
                } else {
                    // Fallback to name comparison
                    // Note: section dropdown uses section_id or id
                    const selectedSectionObj = sections.find(s => String(s.section_id || s.id) === String(activeFilters.section_id));
                    if (selectedSectionObj && student.section_raw !== selectedSectionObj.section) {
                        return false;
                    }
                }
            }

            return true;
        });
    }, [sortedStudents, activeFilters, classes, sections]);

    // Pagination Logic
    const totalItems = filteredStudents.length;

    // Update layout count when filteredStudents changes
    useEffect(() => {
        updateCount('online', totalItems);
    }, [totalItems, updateCount]);

    const safeRecordsPerPage = recordsPerPage === -1 ? totalItems || 1 : recordsPerPage;
    const indexOfLastItem = currentPage * safeRecordsPerPage;
    const indexOfFirstItem = indexOfLastItem - safeRecordsPerPage;
    const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
    const getExportData = () => buildExportData(columns, [], students, (row, key) => row[key]);

    return (
        <SISLayout activeTab="online">
            {initialLoading ? (
                <Loader />
            ) : (
                <div className="sis-content-container">
                    {/* Bottom List Container */}
                    <div className="sis-list-container">
                        <div className="sis-list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>Online Admission List ({totalItems})</h3>
                            <PremiumTableToolbar
                                columns={columns}
                                visibleColumns={visibleColumns}
                                onToggleColumn={handleToggleColumn}
                                getExportData={getExportData}
                                exportFileName="online_student_list"
                                exportTitle="Online Student List"
                                recordsPerPage={recordsPerPage}
                                onRecordsPerPageChange={(num) => {
                                    setRecordsPerPage(num);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        <div className="sis-list-body" style={{ padding: '0' }}>
                            {currentItems.length === 0 ? (
                                <div className="sis-empty-state">
                                    <p>No applications found</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-striped table-bordered table-hover example" style={{ margin: 0 }}>
                                        <thead>
                                            <tr>
                                                {columns.filter(col => visibleColumns.has(col.key)).map(col => (
                                                    <th key={col.key} style={col.width ? { width: col.width } : {}}>{col.label}</th>
                                                ))}
                                                <th className="text-right noExport">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentItems.map((student) => (
                                                <tr key={student.id}>
                                                    {columns.filter(col => visibleColumns.has(col.key)).map(col => (
                                                        <td key={col.key}>
                                                            {col.key === 'form_status' ? (
                                                                <span className={`label ${student.form_status === 'submitted' ? 'label-success' : 'label-danger'}`}>
                                                                    {student.form_status ? student.form_status.replace(/_/g, ' ') : ''}
                                                                </span>
                                                            ) : col.key === 'enrolled' ? (
                                                                <i className={`fa ${student.enrolled === 'Yes' ? 'fa-check' : 'fa-times'}`} style={{ color: student.enrolled === 'Yes' ? 'green' : 'red' }}></i>
                                                            ) : col.key === 'name' ? (
                                                                <Link to={`/student/view/${student.id}`}>{student.name}</Link>
                                                            ) : (student[col.key] || '')}
                                                        </td>
                                                    ))}
                                                    <td className="text-right white-space-nowrap noExport">
                                                        <button className="btn btn-default btn-xs" data-toggle="tooltip" title="Print" style={{ marginRight: '4px' }} onClick={() => handlePrint(student.ref_no)} disabled={printLoading}>
                                                            <i className="fa fa-print"></i>
                                                        </button>
                                                        <button className="btn btn-default btn-xs" data-toggle="tooltip" title="Delete" onClick={() => handleDelete(student.id)}>
                                                            <i className="fa fa-remove"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Pagination Footer */}
                        {!loading && filteredStudents.length > 0 && (
                            <div style={{
                                padding: '20px 24px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: '#ffffff',
                                borderTop: '1px solid #f1f5f9',
                                borderBottomLeftRadius: '12px',
                                borderBottomRightRadius: '12px'
                            }}>
                                <div style={{ color: '#64748b', fontSize: '14px' }}>
                                    Showing {(currentPage - 1) * recordsPerPage + 1} to {Math.min(currentPage * recordsPerPage, filteredStudents.length)} of {filteredStudents.length} entries
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        className="btn btn-default btn-sm"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        style={{ borderRadius: '6px', border: '1px solid #e2e8f0', background: '#ffffff', color: currentPage === 1 ? '#cbd5e1' : '#475569' }}
                                    >
                                        <i className="fa fa-angle-left"></i>
                                    </button>
                                    <button className="btn btn-sm" style={{
                                        borderRadius: '6px',
                                        background: '#7c3aed',
                                        color: '#ffffff',
                                        minWidth: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: '600'
                                    }}>
                                        {currentPage}
                                    </button>
                                    <button
                                        className="btn btn-default btn-sm"
                                        disabled={currentPage >= Math.ceil(filteredStudents.length / recordsPerPage)}
                                        onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredStudents.length / recordsPerPage), prev + 1))}
                                        style={{ borderRadius: '6px', border: '1px solid #e2e8f0', background: '#ffffff', color: currentPage >= Math.ceil(filteredStudents.length / recordsPerPage) ? '#cbd5e1' : '#475569' }}
                                    >
                                        <i className="fa fa-angle-right"></i>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <FollowUpModal
                isOpen={showFollowUpModal}
                onClose={handleCloseFollowUp}
                studentId={selectedStudent?.id}
                studentName={selectedStudent?.name}
            />
        </SISLayout>
    );
};

export default OnlineStudentList;
