
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';

import FollowUpModal from '../../components/FollowUpModal';

import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { copyToClipboard, downloadCSV, downloadExcel, downloadPDF, printTable, buildExportData } from '../../utils/tableExport';

const OnlineStudentList = () => {
    // State
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [showFollowUpModal, setShowFollowUpModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const [printLoading, setPrintLoading] = useState(false);

    // Mock settings (replace with actual context/API later)
    const sch_setting = {
        father_name: 1,
        mobile_no: 1,
        online_admission_payment: 'yes'
    };

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
                } else {
                    // Fallback if data is not in expected format
                    console.error("Invalid response format", response);
                }
            } catch (error) {
                console.error("Error fetching online student list", error);
            } finally {
                setInitialLoading(false);
            }
        };

        fetchStudents();
    }, []);

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
            // Fetch header/footer settings for online_admission
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
            } catch (e) {
                console.warn('Could not load print header/footer settings', e);
            }


            const studentName = [d.student?.firstname, d.student?.middlename, d.student?.lastname].filter(Boolean).join(' ');
            const refNo = d.reference_no || '-';
            const appDate = d.student?.application_date || d.created_at || '-';
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
    .guardian-avatar { text-align: center; }
    .guardian-avatar .icon { width: 36px; height: 36px; background: #f0ad4e; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 2px; }
    .guardian-avatar span { font-size: 9px; color: #555; }
    .section-card { border: 1px solid #ddd; border-radius: 4px; margin-bottom: 7px; overflow: hidden; }
    .section-title { background: #f5f5f5; padding: 4px 12px; font-weight: bold; font-size: 11px; border-bottom: 1px solid #ddd; }
    .section-body { padding: 5px 12px; }
    .field-row { display: flex; flex-wrap: wrap; margin-bottom: 4px; }
    .field-col { flex: 1 1 25%; min-width: 100px; }
    .field-col .field-label { font-size: 9px; color: #777; }
    .field-col .field-value { font-size: 11px; color: #333; margin-top: 1px; }
    .print-footer { margin-top: 8px; padding: 6px 18px; border-top: 1px solid #ddd; font-size: 10px; color: #555; }
    .no-print { }
    @media print {
      @page { margin: 6mm; size: A4; }
      body { margin: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="print-header">
    ${headerImgUrl ? `<img src="${headerImgUrl}" alt="Header" />` : ''}
  </div>
  <div class="print-body">
    <div class="meta-row">
      <div class="meta-badges">
        <div class="badge-box"><span class="label">Reference No</span><span class="value">${refNo}</span></div>
        <div class="badge-box"><span class="label">Form Status</span><span class="value form-status-val">${formStatus}</span></div>
        <div class="badge-box"><span class="label">Application Date</span><span class="value">${appDate}</span></div>
      </div>
      <div class="guardian-avatar">
        <div class="icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
        </div>
        <span>Guardian</span>
      </div>
    </div>

    <div class="section-card">
      <div class="section-title">Basic Details</div>
      <div class="section-body">
        <div class="field-row">
          <div class="field-col"><div class="field-label">Class</div><div class="field-value">${d.class?.class_name || '-'}</div></div>
          <div class="field-col"><div class="field-label">First Name</div><div class="field-value">${d.student?.firstname || '-'}</div></div>
          <div class="field-col"><div class="field-label">Last Name</div><div class="field-value">${d.student?.lastname || '-'}</div></div>
          <div class="field-col"></div>
        </div>
        <div class="field-row">
          <div class="field-col"><div class="field-label">Gender</div><div class="field-value">${d.student?.gender || '-'}</div></div>
          <div class="field-col"><div class="field-label">Date of Birth</div><div class="field-value">${d.student?.dob || '-'}</div></div>
          <div class="field-col"><div class="field-label">Mobile Number</div><div class="field-value">${d.contact?.mobile || '-'}</div></div>
          <div class="field-col"><div class="field-label">Email</div><div class="field-value">${d.contact?.email || '-'}</div></div>
        </div>
      </div>
    </div>

    <div class="section-card">
      <div class="section-title">Guardian Details</div>
      <div class="section-body">
        <div class="field-row">
          <div class="field-col"><div class="field-label">If Guardian Is</div><div class="field-value">${d.guardian?.relation || '-'}</div></div>
          <div class="field-col"><div class="field-label">Guardian Name</div><div class="field-value">${d.guardian?.name || '-'}</div></div>
          <div class="field-col"><div class="field-label">Guardian Relation</div><div class="field-value">${d.guardian?.relation || '-'}</div></div>
          <div class="field-col"><div class="field-label">Guardian Email</div><div class="field-value">${d.guardian?.email || '-'}</div></div>
        </div>
        <div class="field-row">
          <div class="field-col"><div class="field-label">Guardian Phone</div><div class="field-value">${d.guardian?.phone || '-'}</div></div>
          <div class="field-col"><div class="field-label">Guardian Occupation</div><div class="field-value">${d.guardian?.occupation || '-'}</div></div>
          <div class="field-col"><div class="field-label">Guardian Address</div><div class="field-value">${d.guardian?.address || '-'}</div></div>
          <div class="field-col"></div>
        </div>
      </div>
    </div>

    ${d.father ? `
    <div class="section-card">
      <div class="section-title">Father Details</div>
      <div class="section-body">
        <div class="field-row">
          <div class="field-col"><div class="field-label">Name</div><div class="field-value">${d.father?.name || '-'}</div></div>
          <div class="field-col"><div class="field-label">Phone</div><div class="field-value">${d.father?.phone || '-'}</div></div>
          <div class="field-col"><div class="field-label">Occupation</div><div class="field-value">${d.father?.occupation || '-'}</div></div>
          <div class="field-col"></div>
        </div>
      </div>
    </div>` : ''}

    ${d.mother ? `
    <div class="section-card">
      <div class="section-title">Mother Details</div>
      <div class="section-body">
        <div class="field-row">
          <div class="field-col"><div class="field-label">Name</div><div class="field-value">${d.mother?.name || '-'}</div></div>
          <div class="field-col"><div class="field-label">Phone</div><div class="field-value">${d.mother?.phone || '-'}</div></div>
          <div class="field-col"><div class="field-label">Occupation</div><div class="field-value">${d.mother?.occupation || '-'}</div></div>
          <div class="field-col"></div>
        </div>
      </div>
    </div>` : ''}
  </div>

  <div style="text-align:center; margin-top: 10px; margin-bottom: 10px;" class="no-print">
    <button onclick="doPrint()" style="padding: 7px 28px; background: #337ab7; color: #fff; border: none; border-radius: 4px; font-size: 13px; cursor: pointer;">
      &#128438;&nbsp; Print
    </button>
  </div>

  ${footerText ? `<div class="print-footer">${footerText}</div>` : ''}

  <script>
    function doPrint() {
      window.focus();
      window.print();
    }
  <\/script>
</body>
</html>`;

            const printWin = window.open('', '_blank', 'width=900,height=700');
            printWin.document.open();
            printWin.document.write(printHtml);
            printWin.document.close();
        } catch (error) {
            console.error('Print error:', error);
            toast.error('Failed to print');
        }
    };

    const handleListPrint = () => {
        const { headers, rows } = getExportData();
        printTable(headers, rows, 'Student List');
    };

    const handleOpenFollowUp = (student) => {
        setSelectedStudent(student);
        setShowFollowUpModal(true);
    };

    const handleCloseFollowUp = () => {
        setShowFollowUpModal(false);
        setSelectedStudent(null);
    };

    // Export helpers
    const getExportData = () => {
        const headers = ['Reference No', 'Student Name', 'Class'];
        if (sch_setting.father_name) headers.push('Father Name');
        headers.push('Date Of Birth', 'Gender', 'Category');
        if (sch_setting.mobile_no) headers.push('Mobile Number');
        headers.push('Form Status', 'Enrolled', 'Created At');

        const rows = filteredStudents.map(s => {
            const row = [s.ref_no, s.name, s.class_name];
            if (sch_setting.father_name) row.push(s.father_name);
            row.push(s.dob, s.gender, s.category);
            if (sch_setting.mobile_no) row.push(s.mobile);
            row.push(s.form_status || '', s.enrolled, s.created_at);
            return row.map(v => String(v ?? ''));
        });

        return { headers, rows };
    };

    const handleCopy = () => {
        const { headers, rows } = getExportData();
        copyToClipboard(headers, rows);
    };

    const handleDownloadCSV = () => {
        const { headers, rows } = getExportData();
        downloadCSV(headers, rows, 'online_student_list.csv');
    };

    const handleDownloadExcel = () => {
        const { headers, rows } = getExportData();
        downloadExcel(headers, rows, 'online_student_list.xls');
    };

    const handleDownloadPDF = () => {
        const { headers, rows } = getExportData();
        downloadPDF(headers, rows, 'online_student_list.pdf', 'Online Student List');
    };

    // Sorting Logic
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedStudents = React.useMemo(() => {
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
    const filteredStudents = sortedStudents.filter(student =>
        Object.values(student).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const getSortIcon = (columnName) => {
        if (sortConfig.key !== columnName) {
            return <i className="fa fa-sort pull-right" style={{ color: '#ccc', opacity: 0.5 }}></i>;
        }
        return sortConfig.direction === 'ascending' ?
            <i className="fa fa-sort-asc pull-right"></i> :
            <i className="fa fa-sort-desc pull-right"></i>;
    };

    return (
        <div className="wrapper theme-white-skin">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '828px' }}>
                <section className="content">
                    {initialLoading ? (
                        <Loader />
                    ) : (
                        <div className="row">
                            <div className="col-md-12">
                                <div className="box box-primary" id="printable-list-container">
                                    <div className="box-header with-border">
                                        <h3 className="box-title">Student List</h3>
                                        <div className="box-tools pull-right"></div>
                                        <div className="btn-group pull-right">
                                            <button onClick={() => window.history.back()} className="btn btn-primary btn-sm">
                                                <i className="fa fa-arrow-left"></i> Back
                                            </button>
                                        </div>
                                    </div>
                                    <div className="box-body">
                                        <div className="table-responsive mailbox-messages overflow-visible">

                                            {students.length > 0 && (
                                                <div className="row mb-10 no-print">
                                                    <div className="row mb-10">
                                                        <div className="col-sm-12">
                                                            <div className="pull-left">
                                                                <label>Search:
                                                                    <input
                                                                        type="search"
                                                                        className="form-control input-sm"
                                                                        placeholder=""
                                                                        aria-controls="student-list"
                                                                        value={searchTerm}
                                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                                        style={{ marginLeft: '10px', display: 'inline-block', width: 'auto' }}
                                                                    />
                                                                </label>
                                                            </div>
                                                            <div className="dt-buttons btn-group pull-right">
                                                                <button className="btn btn-default btn-xs" title="Copy" onClick={handleCopy}>
                                                                    <i className="fa fa-files-o"></i>
                                                                </button>
                                                                <button className="btn btn-default btn-xs" title="Excel" onClick={handleDownloadExcel}>
                                                                    <i className="fa fa-file-excel-o"></i>
                                                                </button>
                                                                <button className="btn btn-default btn-xs" title="CSV" onClick={handleDownloadCSV}>
                                                                    <i className="fa fa-file-text-o"></i>
                                                                </button>
                                                                <button className="btn btn-default btn-xs" title="PDF" onClick={handleDownloadPDF}>
                                                                    <i className="fa fa-file-pdf-o"></i>
                                                                </button>
                                                                <button className="btn btn-default btn-xs" title="Print" onClick={handleListPrint}>
                                                                    <i className="fa fa-print"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <table className="table table-striped table-bordered table-hover student-list">
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: '5%', cursor: 'pointer' }} onClick={() => handleSort('ref_no')}>
                                                            Reference No {getSortIcon('ref_no')}
                                                        </th>
                                                        <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                                                            Student Name {getSortIcon('name')}
                                                        </th>
                                                        <th className="white-space-nowrap" style={{ cursor: 'pointer' }} onClick={() => handleSort('class_name')}>
                                                            Class {getSortIcon('class_name')}
                                                        </th>
                                                        {sch_setting.father_name && (
                                                            <th style={{ cursor: 'pointer' }} onClick={() => handleSort('father_name')}>
                                                                Father Name {getSortIcon('father_name')}
                                                            </th>
                                                        )}
                                                        <th style={{ cursor: 'pointer' }} onClick={() => handleSort('dob')}>
                                                            Date Of Birth {getSortIcon('dob')}
                                                        </th>
                                                        <th style={{ cursor: 'pointer' }} onClick={() => handleSort('gender')}>
                                                            Gender {getSortIcon('gender')}
                                                        </th>
                                                        <th style={{ cursor: 'pointer' }} onClick={() => handleSort('category')}>
                                                            Category {getSortIcon('category')}
                                                        </th>
                                                        {sch_setting.mobile_no && (
                                                            <th style={{ width: '10%', cursor: 'pointer' }} onClick={() => handleSort('mobile')}>
                                                                Student Mobile Number {getSortIcon('mobile')}
                                                            </th>
                                                        )}
                                                        <th style={{ cursor: 'pointer' }} onClick={() => handleSort('form_status')}>
                                                            Form Status {getSortIcon('form_status')}
                                                        </th>

                                                        <th style={{ cursor: 'pointer' }} onClick={() => handleSort('enrolled')}>
                                                            Enrolled {getSortIcon('enrolled')}
                                                        </th>
                                                        <th style={{ cursor: 'pointer' }} onClick={() => handleSort('created_at')}>
                                                            Created At {getSortIcon('created_at')}
                                                        </th>
                                                        <th className="text-right noExport">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredStudents.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="13" className="dataTables_empty text-center">No data available in table</td>
                                                        </tr>
                                                    ) : (
                                                        filteredStudents.map(student => (
                                                            <tr key={student.id}>
                                                                <td>{student.ref_no}</td>
                                                                <td>{student.name}</td>
                                                                <td className="white-space-nowrap">{student.class_name}</td>
                                                                {sch_setting.father_name && <td>{student.father_name}</td>}
                                                                <td>{student.dob}</td>
                                                                <td>{student.gender}</td>
                                                                <td>{student.category}</td>
                                                                {sch_setting.mobile_no && <td>{student.mobile}</td>}
                                                                <td>
                                                                    <span className={`label ${student.form_status === 'submitted' ? 'label-success' : 'label-danger'}`}>
                                                                        {student.form_status ? student.form_status.replace(/_/g, ' ') : ''}
                                                                    </span>
                                                                </td>

                                                                <td>
                                                                    <i className={`fa ${student.enrolled === 'Yes' ? 'fa-check' : 'fa-times'}`} style={{ color: student.enrolled === 'Yes' ? 'green' : 'red' }}></i>
                                                                </td>
                                                                <td>{student.created_at}</td>
                                                                <td className="text-right white-space-nowrap noExport">
                                                                    <button className="btn btn-default btn-xs" data-toggle="tooltip" title="Print" style={{ marginRight: '3px' }} onClick={() => handlePrint(student.ref_no)} disabled={printLoading}>
                                                                        <i className="fa fa-print"></i>
                                                                    </button>
                                                                    <a href="#" className="btn btn-default btn-xs" data-toggle="tooltip" title="Delete" onClick={(e) => { e.preventDefault(); handleDelete(student.id); }}>
                                                                        <i className="fa fa-remove"></i>
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>

                                            <div className="row">
                                                <div className="col-sm-5">
                                                    <div className="dataTables_info" role="status" aria-live="polite">
                                                        Records {filteredStudents.length > 0 ? 1 : 0} to {filteredStudents.length} of {filteredStudents.length} entries
                                                    </div>
                                                </div>
                                                <div className="col-sm-7">
                                                    {/* Pagination controls can go here if pagination is implemented */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>


                <FollowUpModal
                    isOpen={showFollowUpModal}
                    onClose={handleCloseFollowUp}
                    studentId={selectedStudent?.id}
                    studentName={selectedStudent?.name}
                />
            </div>
        </div>
    );
};

export default OnlineStudentList;
