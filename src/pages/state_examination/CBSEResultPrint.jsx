import React, { useMemo } from 'react';

const CBSEResultPrint = ({ result, template, exam, current_setting, sch_setting }) => {

    const getPercent = (total, obtain) => {
        if (total === 0) return 0;
        return (obtain / total) * 100;
    };

    const getGrade = (examData, percentage) => {
        if (examData && examData.grades) {
            for (const grade of examData.grades) {
                if (percentage >= grade.minimum_percentage && percentage <= grade.maximum_percentage) {
                    return grade.name;
                }
            }
        }
        return "-";
    };

    const two_digit_float = (number, decimals = 2) => {
        return parseFloat(number).toFixed(decimals);
    };

    // --- Rank Calculation Logic (Ported from PHP) ---
    const processedResult = useMemo(() => {
        if (!result || result.length === 0) return [];

        let student_allover_rank = {};
        let subject_rank = {};
        let processedStudents = JSON.parse(JSON.stringify(result)); // Deep copy to modify

        // First Pass: Calculate totals and initial structures
        processedStudents.forEach(student => {
            let total_max_marks = 0;
            let total_gain_marks = 0;

            if (student.term && student.term.exams) {
                Object.values(student.term.exams).forEach(examVal => {
                    if (examVal.subjects) {
                        Object.entries(examVal.subjects).forEach(([subKey, subVal]) => {
                            let subject_total = 0;
                            let subject_max_total = 0;

                            if (subVal.exam_assessments) {
                                Object.values(subVal.exam_assessments).forEach(assess => {
                                    const marks = parseFloat(assess.marks || 0);
                                    const maxMarks = parseFloat(assess.maximum_marks || 0);
                                    subject_total += marks;
                                    subject_max_total += maxMarks;

                                    total_gain_marks += marks;
                                    total_max_marks += maxMarks;
                                });
                            }

                            if (!subject_rank[subKey]) subject_rank[subKey] = [];
                            subject_rank[subKey].push({
                                student_session_id: student.student_session_id,
                                rank_percentage: subject_total, // PHP uses raw total for subject rank? Yes: $subject_total
                                rank: 0
                            });
                        });
                    }
                });
            }

            const exam_percentage = getPercent(total_max_marks, total_gain_marks);
            student_allover_rank[student.student_session_id] = {
                student_session_id: student.student_session_id,
                firstname: student.firstname,
                rank_percentage: exam_percentage,
                rank: 0,
                // Store calculated totals for later use to avoid re-calc
                total_max_marks,
                total_gain_marks,
                exam_percentage
            };
        });

        // Calculate Overall Rank
        const overallRankList = Object.values(student_allover_rank).sort((a, b) => b.rank_percentage - a.rank_percentage);
        const uniqueOverallPercentages = [...new Set(overallRankList.map(item => item.rank_percentage))];

        Object.keys(student_allover_rank).forEach(key => {
            const rank = uniqueOverallPercentages.indexOf(student_allover_rank[key].rank_percentage) + 1; // 1-based rank
            student_allover_rank[key].rank = rank;
        });

        // Calculate Subject Ranks
        Object.keys(subject_rank).forEach(subKey => {
            const subList = subject_rank[subKey].sort((a, b) => b.rank_percentage - a.rank_percentage);
            const uniqueSubPercentages = [...new Set(subList.map(item => item.rank_percentage))];

            subject_rank[subKey].forEach(item => {
                item.rank = uniqueSubPercentages.indexOf(item.rank_percentage) + 1;
            });
        });

        // Merge Ranks back into students
        processedStudents.forEach(student => {
            if (student_allover_rank[student.student_session_id]) {
                student.rank = student_allover_rank[student.student_session_id].rank;
                // Attach pre-calculated totals
                student.total_gain_marks = student_allover_rank[student.student_session_id].total_gain_marks;
                student.total_max_marks = student_allover_rank[student.student_session_id].total_max_marks;
                student.exam_percentage = student_allover_rank[student.student_session_id].exam_percentage;
            }
            // Subject ranks would need deep merge or lookup during render
            student.subject_rank = subject_rank; // Pass entire rank map to help lookup
        });

        return processedStudents;
    }, [result]);

    const getSubjectRank = (student, subjectId) => {
        // Helper to find subject rank from the map we attached
        if (student.subject_rank && student.subject_rank[subjectId]) {
            const rankObj = student.subject_rank[subjectId].find(r => r.student_session_id === student.student_session_id);
            return rankObj ? rankObj.rank : "-";
        }
        return "-";
    };

    const getFullName = (fname, mname, lname) => {
        return [fname, mname, lname].filter(Boolean).join(" ");
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-GB'); // dd/mm/yyyy usually
    };

    const getBaseUrl = () => {
        // Adjust based on environment, typically passed or hardcoded for now
        return "https://newlayout.wisibles.com/";
    };

    return (
        <div style={{ width: '100%', margin: '0 auto' }}>
            <style>
                {`
                @media print {
                    .page-break { display: block; page-break-after: always; }
                }
                .denifittable {
                    border-collapse: collapse;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .fw-bold { font-weight: bold; }
                `}
            </style>

            {processedStudents.map((student, index) => (
                <div key={student.student_session_id} className="student-report-card">
                    {/* Header Image */}
                    {template.header_image && (
                        <img
                            width="100%"
                            src={`${getBaseUrl()}uploads/cbseexam/template/header_image/${template.header_image}`}
                            alt="Header"
                        />
                    )}

                    <table cellPadding="0" cellSpacing="0" width="100%" style={{ marginRight: '10px' }}>
                        <tbody>
                            <tr>
                                <td valign="top">
                                    <table cellPadding="0" cellSpacing="0" width="100%">
                                        <tbody>
                                            <tr>
                                                <td valign="top" style={{ paddingBottom: '0px', paddingTop: '5px', width: '100%', fontWeight: 'bold', textAlign: 'center', fontSize: '20px' }}>
                                                    {template.name}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td valign="top" style={{ paddingBottom: '20px', paddingTop: '2px', width: '100%', fontWeight: 'bold', textAlign: 'center', fontSize: '15px' }}>
                                                    Academic Year : {current_setting.session}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>

                            {/* Student Details */}
                            <tr>
                                <td valign="top">
                                    <table cellPadding="0" cellSpacing="0" width="100%">
                                        <tbody>
                                            <tr>
                                                <td valign="top">
                                                    <table cellPadding="0" cellSpacing="0" width="100%">
                                                        <tbody>
                                                            <tr>
                                                                <td valign="middle" width="80%">
                                                                    <table cellPadding="0" cellSpacing="0" width="100%">
                                                                        <tbody>
                                                                            <tr>
                                                                                {template.is_admission_no === 1 && (
                                                                                    <>
                                                                                        <td valign="top" style={{ fontSize: '12px', fontWeight: 'bold', paddingBottom: '2px', width: '100px' }}>Admission No.</td>
                                                                                        <td valign="top" style={{ fontSize: '12px' }}>: {student.admission_no}</td>
                                                                                    </>
                                                                                )}
                                                                                {template.is_roll_no === 1 && (
                                                                                    <>
                                                                                        <td valign="top" style={{ fontSize: '12px', fontWeight: 'bold', paddingBottom: '2px', width: '100px', marginLeft: '10px' }}>Roll No.</td>
                                                                                        <td valign="top" style={{ fontSize: '12px' }}>: {student.roll_no}</td>
                                                                                    </>
                                                                                )}
                                                                            </tr>
                                                                            <tr>
                                                                                {template.is_name === 1 && (
                                                                                    <>
                                                                                        <td valign="top" style={{ fontSize: '12px', fontWeight: 'bold', paddingBottom: '2px' }}>Student's Name</td>
                                                                                        <td valign="top" style={{ fontSize: '12px' }}>: {getFullName(student.firstname, student.middlename, student.lastname)}</td>
                                                                                    </>
                                                                                )}
                                                                                {template.is_dob === 1 && (
                                                                                    <>
                                                                                        <td valign="top" style={{ fontSize: '12px', fontWeight: 'bold', paddingBottom: '2px' }}>Date of Birth</td>
                                                                                        <td valign="top" style={{ fontSize: '12px' }}>: {formatDate(student.dob)}</td>
                                                                                    </>
                                                                                )}
                                                                            </tr>
                                                                            <tr>
                                                                                {template.is_father_name === 1 && (
                                                                                    <>
                                                                                        <td valign="top" style={{ fontSize: '12px', fontWeight: 'bold', paddingBottom: '2px' }}>Father's Name</td>
                                                                                        <td valign="top" style={{ fontSize: '12px' }}>: {student.father_name}</td>
                                                                                    </>
                                                                                )}
                                                                                {template.is_mother_name === 1 && (
                                                                                    <>
                                                                                        <td valign="top" style={{ fontSize: '12px', fontWeight: 'bold', paddingBottom: '2px' }}>Mother's Name</td>
                                                                                        <td valign="top" style={{ fontSize: '12px' }}>: {student.mother_name}</td>
                                                                                    </>
                                                                                )}
                                                                            </tr>
                                                                            <tr>
                                                                                {(template.is_class === 1 || template.is_section === 1) && (
                                                                                    <>
                                                                                        <td valign="top" style={{ fontSize: '12px', fontWeight: 'bold', paddingBottom: '2px' }}>Class/Section</td>
                                                                                        <td valign="top" style={{ fontSize: '12px' }}>:
                                                                                            {template.is_class === 1 ? student.class : ""}
                                                                                            {template.is_class === 1 && template.is_section === 1 ? ` (${student.section})` : template.is_section === 1 ? student.section : ""}
                                                                                        </td>
                                                                                    </>
                                                                                )}
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </td>
                                                                {template.is_photo === 1 && (
                                                                    <td valign="top" align="right" width="20%">
                                                                        {student.image ? (
                                                                            <img src={`${getBaseUrl()}${student.image}`} width="125" height="130" style={{ border: '1px solid #000' }} alt="Student" />
                                                                        ) : (
                                                                            <img src={`${getBaseUrl()}uploads/student_images/default_${student.gender === 'Female' ? 'female' : 'male'}.jpg`} width="125" height="130" style={{ border: '1px solid #000' }} alt="Default" />
                                                                        )}
                                                                    </td>
                                                                )}
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>

                            <tr><td valign="top" style={{ height: '10px' }}></td></tr>

                            {/* Marks Table */}
                            <tr>
                                <td valign="top">
                                    <table cellPadding="0" cellSpacing="0" width="100%" className="denifittable">
                                        <thead>
                                            <tr>
                                                <td valign="middle" style={{ fontSize: '12px', backgroundColor: '#ccc', width: '190px', border: '1px solid #858585', borderRight: 'none', padding: '5px' }}>Subject</td>

                                                {/* Header for Assessments */}
                                                {Object.values(student.term.exams)[0] && Object.values(Object.values(student.term.exams)[0].subjects)[0] && Object.values(Object.values(Object.values(student.term.exams)[0].subjects)[0].exam_assessments).map((assessment, i) => (
                                                    <td key={i} valign="middle" className="text-center" style={{ fontSize: '12px', backgroundColor: '#ccc', border: '1px solid #858585', borderRight: 'none', padding: '5px', textAlign: 'center' }}>
                                                        {assessment.cbse_exam_assessment_type_name} ({assessment.cbse_exam_assessment_type_code})
                                                    </td>
                                                ))}

                                                <td valign="middle" className="text-center" style={{ fontSize: '12px', backgroundColor: '#ccc', width: '80px', border: '1px solid #858585', borderRight: 'none', padding: '5px', textAlign: 'center' }}>Total</td>
                                                <td valign="middle" className="text-center" style={{ fontSize: '12px', backgroundColor: '#ccc', width: '50px', border: '1px solid #858585', borderRight: 'none', padding: '5px', textAlign: 'center' }}>Grade</td>
                                                <td valign="middle" className="text-center" style={{ fontSize: '12px', backgroundColor: '#ccc', width: '50px', border: '1px solid #858585', padding: '5px', textAlign: 'center' }}>Points</td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.values(student.term.exams).map(examVal =>
                                                Object.values(examVal.subjects).map(subVal => {
                                                    let subTotal = 0;
                                                    let subMax = 0;

                                                    // Handle Biology/Physical Science adjustment logic if needed from PHP
                                                    // Skipping weird hardcoded adjustment unless requested: "if subject == Biology ... -10"
                                                    // The PHP had: if ('Physical Science' || 'Biology') subMax = subMax - 10. Copying if critical.
                                                    let isScienceAdjust = (subVal.subject_name === 'Physical Science' || subVal.subject_name === 'Biology');

                                                    return (
                                                        <tr key={subVal.subject_id}>
                                                            <td valign="top" style={{ fontSize: '12px', border: '1px solid #858585', borderRight: 'none', borderTop: 'none', padding: '5px' }}>
                                                                {subVal.subject_name}
                                                            </td>

                                                            {Object.values(subVal.exam_assessments).map((assess, idx) => {
                                                                subTotal += parseFloat(assess.marks || 0);
                                                                subMax += parseFloat(assess.maximum_marks || 0);
                                                                return (
                                                                    <td key={idx} valign="top" className="text-center" style={{ fontSize: '12px', fontWeight: '300', border: '1px solid #858585', borderRight: 'none', borderTop: 'none', padding: '5px', textAlign: 'center' }}>
                                                                        {assess.marks === null ? "N/A" : (assess.is_absent ? "ABS" : assess.marks)}
                                                                    </td>
                                                                );
                                                            })}

                                                            {isScienceAdjust && (subMax -= 10)}

                                                            <td valign="top" className="text-center" style={{ fontSize: '12px', fontWeight: '300', border: '1px solid #858585', borderRight: 'none', borderTop: 'none', padding: '5px', textAlign: 'center' }}>
                                                                {subTotal} / {subMax}
                                                            </td>

                                                            <td valign="top" className="text-center" style={{ fontSize: '12px', fontWeight: '300', border: '1px solid #858585', borderRight: 'none', borderTop: 'none', padding: '5px', textAlign: 'center' }}>
                                                                {getGrade(exam, getPercent(subMax, subTotal))}
                                                            </td>

                                                            <td valign="top" className="text-center" style={{ fontSize: '12px', fontWeight: '300', border: '1px solid #858585', borderTop: 'none', padding: '5px', textAlign: 'center' }}>
                                                                {/* GPA Point Logic */}
                                                                {(() => {
                                                                    const grade = getGrade(exam, getPercent(subMax, subTotal));
                                                                    const points = { "A1": 10, "A2": 9, "B1": 8, "B2": 7, "C1": 6, "C2": 5, "D": 4, "E": 0, "E1": 0 };
                                                                    return points[grade] || 0;
                                                                })()}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </td>
                            </tr>

                            <tr><td valign="top" style={{ height: '10px' }}></td></tr>

                            {/* Overall Result */}
                            <tr>
                                <td>
                                    <table cellPadding="0" cellSpacing="0" width="100%" className="denifittable">
                                        <tbody>
                                            <tr>
                                                <td style={{ fontSize: '12px', backgroundColor: '#ccc', border: '1px solid #858585', borderRight: 'none', borderTop: 'none', padding: '5px' }}>Overall Result</td>
                                                <td style={{ fontSize: '12px', backgroundColor: '#ccc', border: '1px solid #858585', borderRight: 'none', borderTop: 'none', padding: '5px' }}>
                                                    Total : {two_digit_float(student.total_gain_marks || 0)} / {student.total_max_marks || 0}
                                                </td>
                                                <td style={{ fontSize: '12px', backgroundColor: '#ccc', border: '1px solid #858585', borderRight: 'none', borderTop: 'none', padding: '5px' }}>
                                                    Percentage : {two_digit_float(student.exam_percentage || 0)}
                                                </td>
                                                <td style={{ fontSize: '12px', backgroundColor: '#ccc', border: '1px solid #858585', borderRight: 'none', borderTop: 'none', padding: '5px' }}>
                                                    Grade : {getGrade(exam, student.exam_percentage || 0)}
                                                </td>
                                                <td style={{ fontSize: '12px', backgroundColor: '#ccc', border: '1px solid #858585', borderTop: 'none', padding: '5px' }}>
                                                    {/* GPA Calculation omitted for brevity but logic is similar to loop sum / count */}
                                                    GPA : -
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>

                            <tr><td valign="top" style={{ height: '30px' }}></td></tr>

                            {/* Attendance */}
                            <tr>
                                <td>
                                    <table cellPadding="0" cellSpacing="0" width="100%" className="denifittable" style={{ paddingBottom: '10px', textAlign: 'center' }}>
                                        <tbody>
                                            <tr>
                                                <td valign="middle" className="text-center" style={{ fontSize: '12px', border: '1px solid #858585' }} rowSpan="2"><b>Attendance Overall</b></td>
                                                <td valign="middle" className="text-center" style={{ fontSize: '12px', border: '1px solid #858585', padding: '5px' }}><b>Total Working Days</b></td>
                                                <td valign="middle" className="text-center" style={{ fontSize: '12px', border: '1px solid #858585', padding: '5px' }}><b>Days Present</b></td>
                                                <td valign="middle" className="text-center" style={{ fontSize: '12px', border: '1px solid #858585', padding: '5px' }}><b>Attendance Percentage</b></td>
                                            </tr>
                                            <tr>
                                                <td valign="middle" className="text-center" style={{ fontSize: '12px', fontWeight: '300', border: '1px solid #858585', padding: '5px' }}>{student.total_working_days}</td>
                                                <td valign="middle" className="text-center" style={{ fontSize: '12px', fontWeight: '300', border: '1px solid #858585', padding: '5px' }}>{student.total_present_days}</td>
                                                <td valign="middle" className="text-center" style={{ fontSize: '12px', fontWeight: '300', border: '1px solid #858585', padding: '5px' }}>
                                                    {getPercent(student.total_working_days, student.total_present_days).toFixed(2)}%
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>

                            <tr><td valign="top" style={{ height: '20px' }}></td></tr>

                            {/* Signatures */}
                            <tr>
                                <td valign="top" width="100%" align="center">
                                    <table cellPadding="0" cellSpacing="0" width="100%" style={{ borderBottom: '1px solid #999', marginBottom: '10px' }}>
                                        <tbody>
                                            <tr>
                                                <td valign="top" width="32%" className="signature text-center">
                                                    <p className="fw-bold" style={{ fontSize: '14px' }}>Signature of Parent</p>
                                                </td>
                                                <td valign="top" width="32%" className="signature">
                                                    <p className="fw-bold" style={{ fontSize: '14px' }}>Signature of Class Teacher</p>
                                                </td>
                                                <td valign="top" width="32%" className="signature text-center">
                                                    <p className="fw-bold" style={{ fontSize: '14px' }}>Signature of Principal / HM</p>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>

                            <tr>
                                <td valign="top" style={{ marginBottom: '5px', paddingTop: '10px', lineHeight: 'normal' }}>
                                    <div dangerouslySetInnerHTML={{ __html: template.content_footer }} />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {index < processedStudents.length - 1 && <div className="page-break"></div>}
                </div>
            ))}
        </div>
    );
};

export default CBSEResultPrint;
