import React, { useEffect, useState } from 'react';

const BASE_URL = 'https://newlayout.wisibles.com/';

const StudentMarksheetPrint = () => {
    const [dataList, setDataList] = useState([]);
    const [template, setTemplate] = useState(null);
    const [students, setStudents] = useState([]);

    useEffect(() => {
        try {
            const storedData = localStorage.getItem('studentMarksheetData');
            if (storedData) {
                const parsed = JSON.parse(storedData);

                // Handle new format: { marks, template, students }
                if (parsed.marks && parsed.template) {
                    setTemplate(parsed.template);
                    setStudents(parsed.students || []);
                    const marksData = parsed.marks;
                    let list = [];
                    if (Array.isArray(marksData)) {
                        list = marksData;
                    } else if (marksData.labels) {
                        list = [marksData];
                    } else if (marksData && typeof marksData === 'object') {
                        // Dictionary format: { studentSessionId: { labels, marks, ... } }
                        list = Object.entries(marksData).map(([sessionId, data]) => ({
                            ...data,
                            student_session_id: sessionId
                        }));
                    }
                    setDataList(list);
                } else {
                    // Legacy format: just marks data
                    let list = [];
                    if (Array.isArray(parsed)) {
                        list = parsed;
                    } else if (parsed.labels) {
                        list = [parsed];
                    } else if (parsed && typeof parsed === 'object') {
                        list = Object.entries(parsed).map(([sessionId, data]) => ({
                            ...data,
                            student_session_id: sessionId
                        }));
                    }
                    setDataList(list);
                }
            }
        } catch (error) {
            console.error("Failed to load marksheet data", error);
        }
    }, []);

    // Find student info by student_session_id
    const findStudent = (data) => {
        if (!students || students.length === 0) return null;
        const sessionId = data.student_session_id;
        if (sessionId) {
            const found = students.find(s =>
                String(s.student_session_id) === String(sessionId) ||
                String(s.id) === String(sessionId)
            );
            if (found) return found;
        }
        // Try matching by admission_no
        if (data.admission_number) {
            const admNos = Object.keys(data.admission_number);
            for (const admNo of admNos) {
                const found = students.find(s => String(s.admission_no) === String(admNo));
                if (found) return found;
            }
        }
        return null;
    };

    const getImageUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${BASE_URL}uploads/marksheet/${path}`;
    };

    const getStudentImageUrl = (path) => {
        if (!path) return `${BASE_URL}uploads/student_images/no_image.png`;
        if (path.startsWith('http')) return path;
        return `${BASE_URL}${path}`;
    };

    if (!dataList || dataList.length === 0) return <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'Arial' }}>No data found.</div>;

    const t = template || {};

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', color: '#000', fontSize: '14px', lineHeight: 'normal' }}>
            <style>{`
                * { padding: 0; margin: 0; }
                @media print {
                    .page-break { display: block; page-break-after: always; }
                    .no-print { display: none !important; }
                }
                @media screen {
                    .page-break { margin-bottom: 40px; border-bottom: 2px dashed #ccc; padding-bottom: 20px; }
                }
                .denifittable th { border-top: 1px solid #999; }
                .denifittable th,
                .denifittable td { border-bottom: 1px solid #999; border-collapse: collapse; border-left: 1px solid #999; }
                .denifittable tr th { padding: 10px; font-weight: bold; }
                .denifittable tr td { padding: 10px; font-weight: bold; }
                .marksheet-container {
                    width: 100%;
                    max-width: 800px;
                    margin: 0 auto;
                    position: relative;
                }
                .tcmybg {
                    background: top center;
                    background-size: 100% 100%;
                    position: absolute;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    z-index: 0;
                }
            `}</style>

            {/* Print Button */}
            <div className="no-print" style={{ textAlign: 'right', padding: '10px 20px' }}>
                <button
                    onClick={() => window.print()}
                    style={{
                        padding: '8px 20px',
                        cursor: 'pointer',
                        background: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px'
                    }}
                >
                    <i className="fa fa-print" style={{ marginRight: '5px' }}></i> Print
                </button>
            </div>

            {dataList.map((data, index) => {
                const { labels, marks, maxmarks, total_marks } = data;
                const subjects = Object.entries(labels || {});
                const student = findStudent(data);

                let totalObtained = 0;
                let totalMax = 0;
                let totalMin = 0;
                let resultStatus = true;

                subjects.forEach(([id]) => {
                    const m = parseFloat(marks?.[id] || 0);
                    const mm = parseFloat(maxmarks?.[id] || 0);
                    const tm = parseFloat(total_marks?.[id] || 0);
                    if (marks?.[id] != null) totalObtained += m;
                    if (maxmarks?.[id] != null) totalMax += mm;
                    totalMin += tm;
                    // Check pass/fail (marks < min_marks)
                    if (m < tm) resultStatus = false;
                });

                const percentage = totalMax > 0 ? ((totalObtained * 100) / totalMax).toFixed(2) : '0.00';

                return (
                    <div key={index} className="marksheet-container">
                        <div style={{
                            width: '100%',
                            margin: '0 auto',
                            border: '1px solid #000',
                            padding: '0px 5px 5px',
                            position: 'relative'
                        }}>
                            {/* Background Image */}
                            {t.background_img && (
                                <img
                                    src={getImageUrl(t.background_img)}
                                    className="tcmybg"
                                    width="100%"
                                    height="100%"
                                    alt=""
                                />
                            )}

                            {/* Header Image */}
                            {t.header_image && (
                                <img
                                    src={getImageUrl(t.header_image)}
                                    width="100%"
                                    height="300px"
                                    alt="Header"
                                    style={{ display: 'block' }}
                                />
                            )}

                            <table cellPadding="0" cellSpacing="0" width="100%">
                                <tbody>
                                    {/* Heading & Title */}
                                    {(t.heading || t.title) && (
                                        <tr>
                                            <td valign="top">
                                                <table cellPadding="0" cellSpacing="0" width="100%">
                                                    <tbody>
                                                        {t.heading && (
                                                            <tr>
                                                                <td valign="top" style={{ fontSize: '42px', fontWeight: 'bold', textAlign: 'center' }}>
                                                                    {t.heading}
                                                                </td>
                                                            </tr>
                                                        )}
                                                        {t.title && (
                                                            <tr>
                                                                <td valign="top" style={{ fontSize: '20px', fontWeight: '900', textAlign: 'center', textTransform: 'uppercase' }}>
                                                                    {t.title}
                                                                </td>
                                                            </tr>
                                                        )}
                                                        <tr><td valign="top" height="5"></td></tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    )}

                                    {/* Logo Row: Left Logo | Exam Name + Session | Right Logo */}
                                    <tr>
                                        <td valign="top">
                                            <table cellPadding="0" cellSpacing="0" width="100%">
                                                <tbody>
                                                    <tr>
                                                        <td width="100" valign="top" align="center">
                                                            {t.left_logo && (
                                                                <img src={getImageUrl(t.left_logo)} width="70" height="70" alt="Left Logo" />
                                                            )}
                                                        </td>
                                                        <td valign="top">
                                                            <table cellPadding="0" cellSpacing="0" width="100%">
                                                                <tbody>
                                                                    {t.exam_name && (
                                                                        <tr>
                                                                            <td valign="top" style={{ fontSize: '20px', fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase' }}>
                                                                                {t.exam_name}
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                    <tr><td valign="top" height="5"></td></tr>
                                                                    {t.exam_session && (
                                                                        <tr>
                                                                            <td style={{ textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' }} valign="top">
                                                                                {t.exam_session}
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                        <td width="100" valign="top" align="center">
                                                            {t.right_logo && (
                                                                <img src={getImageUrl(t.right_logo)} width="70" height="70" alt="Right Logo" />
                                                            )}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>

                                    <tr><td valign="top" height="10"></td></tr>

                                    {/* Admission No / Roll No + Photo Row */}
                                    {(t.is_admission_no || t.is_roll_no || t.is_photo) && (
                                        <tr>
                                            <td valign="top">
                                                <table cellPadding="0" cellSpacing="0" width="100%">
                                                    <tbody>
                                                        <tr>
                                                            <td valign="top">
                                                                <table cellPadding="0" cellSpacing="0" width="98%" className="denifittable">
                                                                    <tbody>
                                                                        <tr>
                                                                            {t.is_admission_no && (
                                                                                <th valign="top" style={{ textAlign: 'center', textTransform: 'uppercase' }} width="50%">
                                                                                    Admission No
                                                                                </th>
                                                                            )}
                                                                            {t.is_roll_no && (
                                                                                <th valign="top" style={{ textAlign: 'center', textTransform: 'uppercase', borderRight: '1px solid #999' }} width="50%">
                                                                                    Roll Number
                                                                                </th>
                                                                            )}
                                                                        </tr>
                                                                        <tr>
                                                                            {t.is_admission_no && (
                                                                                <td style={{ textTransform: 'uppercase', textAlign: 'center' }} width="50%">
                                                                                    {student?.admission_no || '—'}
                                                                                </td>
                                                                            )}
                                                                            {t.is_roll_no && (
                                                                                <td style={{ textTransform: 'uppercase', textAlign: 'center', borderRight: '1px solid #999' }} width="50%">
                                                                                    {student?.roll_no || '—'}
                                                                                </td>
                                                                            )}
                                                                        </tr>
                                                                        <tr>
                                                                            <td valign="top" colSpan="5" style={{ textAlign: 'center', textTransform: 'uppercase', border: 0 }}>
                                                                                Certificated That
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                            {t.is_photo && (
                                                                <td valign="top" align="right" style={{ border: '1px solid #000', width: '120px', padding: '2px' }}>
                                                                    <img
                                                                        src={getStudentImageUrl(student?.image)}
                                                                        width="120"
                                                                        height="150"
                                                                        alt="Student"
                                                                    />
                                                                </td>
                                                            )}
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    )}

                                    <tr><td valign="top" height="5"></td></tr>

                                    {/* Student Info */}
                                    <tr>
                                        <td valign="top">
                                            <table cellPadding="0" cellSpacing="0" width="100%">
                                                <tbody>
                                                    {t.is_name !== false && student && (
                                                        <tr>
                                                            <td valign="top" style={{ textTransform: 'uppercase', paddingBottom: '15px' }}>
                                                                Name of Candidate &nbsp;&nbsp;&nbsp;
                                                                <span style={{ fontWeight: 'bold' }}>
                                                                    {[student.firstname, student.middlename, student.lastname].filter(Boolean).join(' ')}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {t.is_father_name !== false && student && (
                                                        <tr>
                                                            <td valign="top" style={{ textTransform: 'uppercase', paddingBottom: '15px' }}>
                                                                Father's Name &nbsp;&nbsp;&nbsp;
                                                                <span style={{ fontWeight: 'bold' }}>{student.father_name || '—'}</span>
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {t.is_mother_name !== false && student && (
                                                        <tr>
                                                            <td valign="top" style={{ textTransform: 'uppercase', paddingBottom: '15px' }}>
                                                                Mother's Name &nbsp;&nbsp;&nbsp;
                                                                <span style={{ fontWeight: 'bold' }}>{student.mother_name || '—'}</span>
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {t.is_dob !== false && student && (
                                                        <tr>
                                                            <td valign="top" style={{ textTransform: 'uppercase', paddingBottom: '15px' }}>
                                                                Date of Birth &nbsp;&nbsp;&nbsp;
                                                                <span style={{ fontWeight: 'bold' }}>{student.dob || '—'}</span>
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {(t.is_class !== false || t.is_section !== false) && student && (
                                                        <tr>
                                                            <td valign="top" style={{ textTransform: 'uppercase', paddingBottom: '15px' }}>
                                                                Class &nbsp;&nbsp;&nbsp;
                                                                <span style={{ fontWeight: 'bold' }}>
                                                                    {t.is_class !== false && t.is_section !== false
                                                                        ? `${student.class || ''} (${student.section || ''})`
                                                                        : t.is_class !== false
                                                                            ? student.class || ''
                                                                            : `(${student.section || ''})`
                                                                    }
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {t.school_name && (
                                                        <tr>
                                                            <td valign="top" style={{ textTransform: 'uppercase', paddingBottom: '15px' }}>
                                                                School Name &nbsp;&nbsp;&nbsp;
                                                                <span style={{ fontWeight: 'bold' }}>{t.school_name}</span>
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {t.exam_center && (
                                                        <tr>
                                                            <td valign="top" style={{ textTransform: 'uppercase', paddingBottom: '15px' }}>
                                                                Exam Center &nbsp;&nbsp;&nbsp;
                                                                <span style={{ fontWeight: 'bold' }}>{t.exam_center}</span>
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {t.content && (
                                                        <tr>
                                                            <td valign="top" style={{ textTransform: 'uppercase', paddingBottom: '15px', lineHeight: 'normal' }}
                                                                dangerouslySetInnerHTML={{ __html: t.content }}
                                                            />
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>

                                    {/* Marks Table */}
                                    {subjects.length > 0 && (
                                        <tr>
                                            <td valign="top">
                                                <table cellPadding="0" cellSpacing="0" width="100%" className="denifittable" style={{ textAlign: 'center', textTransform: 'uppercase' }}>
                                                    <tbody>
                                                        <tr>
                                                            <th valign="middle" width="35%">Subjects</th>
                                                            <th valign="middle" style={{ textAlign: 'center' }}>Max Marks</th>
                                                            <th valign="middle" style={{ textAlign: 'center' }}>Min Marks</th>
                                                            <th valign="top" style={{ textAlign: 'center' }}>Marks Obtained</th>
                                                            <th valign="middle" style={{ borderRight: '1px solid #999', textAlign: 'center' }}>Note</th>
                                                        </tr>
                                                        {subjects.map(([id, subjectName]) => {
                                                            const obtained = marks?.[id];
                                                            const maxMark = maxmarks?.[id] || 0;
                                                            const minMark = total_marks?.[id] || 0;
                                                            const isFail = obtained !== null && obtained !== undefined && parseFloat(obtained) < parseFloat(minMark);

                                                            return (
                                                                <tr key={id}>
                                                                    <td valign="top" style={{ textAlign: 'left' }}>{subjectName}</td>
                                                                    <td valign="top" style={{ textAlign: 'center' }}>{maxMark}</td>
                                                                    <td valign="top" style={{ textAlign: 'center' }}>{minMark}</td>
                                                                    <td valign="top" style={{ textAlign: 'center' }}>
                                                                        {obtained === null ? 'AB' : obtained}
                                                                    </td>
                                                                    <td valign="top" style={{ textAlign: 'left', borderRight: '1px solid #999' }}>
                                                                        {isFail ? '(F)' : ''}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                        {/* Grand Total Row */}
                                                        <tr>
                                                            <td valign="top"></td>
                                                            <td valign="top" style={{ borderLeft: 0 }}>
                                                                {totalMax.toFixed(2)}
                                                            </td>
                                                            <td valign="top">Grand Total</td>
                                                            <td valign="top" style={{ textAlign: 'center' }}>
                                                                {totalObtained.toFixed(2)}
                                                            </td>
                                                            <td valign="top" style={{ textAlign: 'left', borderRight: '1px solid #999' }}></td>
                                                        </tr>
                                                        {/* Percentage Row */}
                                                        <tr>
                                                            <td valign="top">Percentage</td>
                                                            <td valign="top">{percentage}</td>
                                                            <td valign="top">Result</td>
                                                            <td valign="top">
                                                                {resultStatus && parseFloat(percentage) > 40 ? 'Pass' : 'Fail'}
                                                            </td>
                                                            <td valign="top" style={{ textAlign: 'left', borderRight: '1px solid #999' }}></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    )}

                                    {/* Result */}
                                    <tr>
                                        <td valign="top" style={{ paddingTop: '10px' }}>
                                            <table cellPadding="0" cellSpacing="0" width="100%">
                                                <tbody>
                                                    <tr>
                                                        <td valign="top" width="30%">Result</td>
                                                        <td valign="top" style={{ fontWeight: 'bold' }}>
                                                            {resultStatus && parseFloat(percentage) > 40 ? 'Pass' : 'Fail'}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>

                                    {/* Division */}
                                    {t.is_division && (
                                        <tr>
                                            <td valign="top" style={{ paddingTop: '10px' }}>
                                                <table cellPadding="0" cellSpacing="0" width="100%">
                                                    <tbody>
                                                        <tr>
                                                            <td valign="top" width="30%">Division</td>
                                                            <td valign="top" style={{ fontWeight: 'bold' }}>
                                                                {parseFloat(percentage) >= 60 ? 'First' : parseFloat(percentage) >= 45 ? 'Second' : parseFloat(percentage) >= 33 ? 'Third' : '—'}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    )}

                                    {/* Date */}
                                    <tr>
                                        <td valign="top" style={{ paddingTop: '10px' }}>
                                            <table cellPadding="0" cellSpacing="0" width="100%">
                                                <tbody>
                                                    <tr>
                                                        <td valign="top" width="30%">Date</td>
                                                        <td valign="top" style={{ fontWeight: 'bold' }}>{t.date || new Date().toLocaleDateString('en-GB')}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>

                                    <tr><td valign="top" height="30"></td></tr>

                                    {/* Footer Content */}
                                    {t.content_footer && (
                                        <tr>
                                            <td valign="bottom" style={{ fontSize: '12px' }}
                                                dangerouslySetInnerHTML={{ __html: t.content_footer }}
                                            />
                                        </tr>
                                    )}

                                    {/* Signatures */}
                                    {(t.left_sign || t.middle_sign || t.right_sign) && (
                                        <tr>
                                            <td valign="top">
                                                <table cellPadding="0" cellSpacing="0" width="100%">
                                                    <tbody>
                                                        <tr>
                                                            {t.left_sign && (
                                                                <td valign="bottom" align="center" style={{ textTransform: 'uppercase' }}>
                                                                    <img src={getImageUrl(t.left_sign)} width="100" height="50" alt="Signature" />
                                                                </td>
                                                            )}
                                                            {t.middle_sign && (
                                                                <td valign="bottom" align="center" style={{ textTransform: 'uppercase' }}>
                                                                    <img src={getImageUrl(t.middle_sign)} width="100" height="50" alt="Signature" />
                                                                </td>
                                                            )}
                                                            {t.right_sign && (
                                                                <td valign="middle" align="center" style={{ textTransform: 'uppercase' }}>
                                                                    <img src={getImageUrl(t.right_sign)} width="100" height="50" alt="Signature" />
                                                                </td>
                                                            )}
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    )}

                                    <tr><td valign="top" height="20"></td></tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Page break between students */}
                        {index < dataList.length - 1 && <div className="page-break"></div>}
                    </div>
                );
            })}
        </div>
    );
};

export default StudentMarksheetPrint;
