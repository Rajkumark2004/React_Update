import React from 'react';

const ViewTemplate = ({ template, marksheetData, appName = "Smart School" }) => {
    if (!template) return null;

    // Helper to get base URL for images - adjust as per your backend structure
    const getUploadUrl = (type, filename) => {
        if (!filename) return "";
        return `https://newlayout.wisibles.com/uploads/cbseexam/template/${type}/${filename}`;
    };

    const studentImageUrl = "https://newlayout.wisibles.com/uploads/student_images/default_male.jpg?1685767171"; // Fallback or from session

    return (
        <div style={{ padding: '10px', background: '#fff' }}>
            <style>
                {`
                .marksheet-container {
                    color: #000;
                    font-family: Arial, sans-serif;
                    line-height: 20px;
                    font-size: 12px;
                    width: 100%;
                    margin: 0 auto;
                    position: relative;
                }
                .denifittable table {
                    border-collapse: collapse;
                    width: 100%;
                }
                .denifittable th,
                .denifittable td {
                    border: 1px solid #999;
                    border-collapse: collapse;
                    padding: 3px 10px;
                    font-weight: bold;
                }
                .denifittable-small table {
                    border-collapse: collapse;
                    text-align: center;
                    width: 100%;
                }
                .denifittable-small th,
                .denifittable-small td {
                    border: 1px solid #999;
                    border-collapse: collapse;
                    padding: 0px 10px;
                    font-weight: bold;
                    text-align: center;
                }
                .tcmybg {
                    background: top center;
                    background-size: 100% 100%;
                    position: absolute;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    z-index: 0;
                    width: 100%;
                    height: 100%;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .pull-right { float: right; }
                .clearboth { clear: both; }
                .fw-bold { font-weight: bold; }
                .signature { text-align: center; }
                .minheight260 { min-height: 260px; }
                `}
            </style>

            <div className="marksheet-container">
                {template.background_img && (
                    <img
                        src={getUploadUrl('background_img', template.background_img)}
                        className="tcmybg"
                        alt="Background"
                    />
                )}

                <div style={{ width: '100%', height: '100%', margin: '0 auto', position: 'relative' }}>
                    {template.header_image && (
                        <div className="text-center" style={{ marginTop: '2vh' }}>
                            <img
                                src={getUploadUrl('header_image', template.header_image)}
                                width="100%"
                                height="auto"
                                alt="Header"
                            />
                        </div>
                    )}

                    <table cellPadding="0" cellSpacing="0" width="100%">
                        <tbody>
                            <tr>
                                <td valign="top">
                                    <table cellPadding="0" cellSpacing="0" width="100%">
                                        <tbody>
                                            <tr>
                                                <td valign="top" style={{ paddingBottom: '10px' }}>
                                                    {/* {template.exam_session && (
                                                        // <h4 style={{ fontWeight: 'bold', textAlign: 'center', paddingTop: '5px' }}>
                                                        //     Academic Session: {template.session_name || "2024-25"}
                                                        // </h4>
                                                    )} */}
                                                    <h4 style={{ fontWeight: 'bold', textAlign: 'center', paddingTop: '5px' }}>
                                                        REPORT CARD
                                                    </h4>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>

                            <tr>
                                <td valign="top">
                                    <table cellPadding="0" cellSpacing="0" width="100%">
                                        <tbody>
                                            <tr>
                                                <td valign="top" width="80%">
                                                    <table cellPadding="0" cellSpacing="0" width="100%">
                                                        <tbody>
                                                            <tr>
                                                                {template.is_roll_no === "1" && (
                                                                    <>
                                                                        <td valign="top" style={{ fontWeight: 'bold', paddingBottom: '2px' }}>Roll No.</td>
                                                                        <td valign="top">: 101</td>
                                                                    </>
                                                                )}
                                                                {template.is_admission_no === "1" && (
                                                                    <>
                                                                        <td valign="top" style={{ fontWeight: 'bold', paddingBottom: '2px' }}>Admission No.</td>
                                                                        <td valign="top">: 18001</td>
                                                                    </>
                                                                )}
                                                            </tr>
                                                            <tr>
                                                                {template.is_name === "1" && (
                                                                    <>
                                                                        <td valign="top" style={{ fontWeight: 'bold', paddingBottom: '2px' }}>Student's Name</td>
                                                                        <td valign="top">: Edward Thomas</td>
                                                                    </>
                                                                )}
                                                                {template.is_dob === "1" && (
                                                                    <>
                                                                        <td valign="top" style={{ fontWeight: 'bold', paddingBottom: '2px' }}>Date of Birth</td>
                                                                        <td valign="top">: 03-11-2014</td>
                                                                    </>
                                                                )}
                                                            </tr>
                                                            <tr>
                                                                {template.is_father_name === "1" && (
                                                                    <>
                                                                        <td valign="top" style={{ fontWeight: 'bold', paddingBottom: '2px' }}>Father's Name</td>
                                                                        <td valign="top">: Olivier Thomas</td>
                                                                    </>
                                                                )}
                                                                {template.date && (
                                                                    <>
                                                                        <td valign="top" style={{ fontWeight: 'bold', paddingBottom: '2px' }}>Result Declaration Date</td>
                                                                        <td valign="top">: {template.date}</td>
                                                                    </>
                                                                )}
                                                            </tr>
                                                            <tr>
                                                                {template.is_mother_name === "1" && (
                                                                    <>
                                                                        <td valign="top" style={{ fontWeight: 'bold', paddingBottom: '2px' }}>Mother's Name</td>
                                                                        <td valign="top">: Caroline Thomas</td>
                                                                    </>
                                                                )}
                                                                {(template.is_class === "1" || template.is_section === "1") && (
                                                                    <>
                                                                        <td valign="top" style={{ fontWeight: 'bold', paddingBottom: '2px' }}>
                                                                            {template.is_class === "1" && template.is_section === "1" ? "Class Section" : (template.is_class === "1" ? "Class" : "Section")}
                                                                        </td>
                                                                        <td valign="top">
                                                                            : {template.is_class === "1" && template.is_section === "1" ? "Class 3-A" : (template.is_class === "1" ? "Class 3" : "A")}
                                                                        </td>
                                                                    </>
                                                                )}
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                                {template.is_photo === "1" && (
                                                    <td valign="top" align="right" width="20%">
                                                        <img
                                                            src={studentImageUrl}
                                                            width="102"
                                                            height="120"
                                                            style={{ border: '1px solid #000' }}
                                                            alt="Student"
                                                        />
                                                    </td>
                                                )}
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>

                            <tr><td valign="top" style={{ height: '5px' }}></td></tr>

                            <tr>
                                <td valign="top">
                                    <div className="denifittable">
                                        <table cellPadding="0" cellSpacing="0">
                                            <tbody>
                                                <tr>
                                                    <td valign="top" className="text-center">Scholastic Areas:</td>
                                                    <td valign="top" className="text-center" colSpan="4">T1</td>
                                                    <td valign="top" className="text-center" colSpan="4">T2</td>
                                                    <td valign="top" className="text-center" colSpan="2">T1+T2</td>
                                                    <td valign="top" className="text-center" rowSpan="2">Rank</td>
                                                </tr>
                                                <tr>
                                                    <td valign="top" className="text-center">Subject</td>
                                                    <td valign="top" className="text-center">PT-I(10)</td>
                                                    <td valign="top" className="text-center">Multiple Assessment (10)</td>
                                                    <td valign="top" className="text-center">Half Yearly(80)</td>
                                                    <td valign="top" className="text-center">Total(100)</td>
                                                    <td valign="top" className="text-center">PT-II(10)</td>
                                                    <td valign="top" className="text-center">Multiple Assessment-2 (10)</td>
                                                    <td valign="top" className="text-center">Annual(80)</td>
                                                    <td valign="top" className="text-center">Total(100)</td>
                                                    <td valign="top" className="text-center">Marks Obtained (100%)</td>
                                                    <td valign="top" className="text-center">Grade</td>
                                                </tr>
                                                {/* Simulated Subject Rows */}
                                                {['ENGLISH (001)', 'HINDI (001)', 'MATHEMATICS (001)', 'EVS (001)', 'COMPUTER (001)'].map(subject => (
                                                    <tr key={subject}>
                                                        <td valign="top">{subject}</td>
                                                        <td valign="top">3.50</td>
                                                        <td valign="top">8.00</td>
                                                        <td valign="top">48.50</td>
                                                        <td valign="top">60.00</td>
                                                        <td valign="top">3.50</td>
                                                        <td valign="top">8.00</td>
                                                        <td valign="top">28.00</td>
                                                        <td valign="top">39.50</td>
                                                        <td valign="top">9.75</td>
                                                        <td valign="top">c2</td>
                                                        <td valign="top">28</td>
                                                    </tr>
                                                ))}
                                                <tr>
                                                    <td valign="top" className="text-left" colSpan="12">
                                                        Grading Scale: A+ (100% - 90%), B+ (80% - 89.99%), C+ (50% - 79.99%), D (40% - 49.99%), E (0% - 39.99%)
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </td>
                            </tr>

                            <tr><td valign="top" style={{ height: '10px' }}></td></tr>

                            <tr>
                                <td>
                                    <div className="denifittable">
                                        <table cellPadding="0" cellSpacing="0">
                                            <tbody>
                                                <tr>
                                                    <td>Overall Marks : 270.00/350</td>
                                                    <td>Percentage: 77.14</td>
                                                    <td>Grade : C+</td>
                                                    <td>Rank : 1</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </td>
                            </tr>

                            <tr><td valign="top" style={{ height: '10px' }}></td></tr>

                            <tr>
                                <td>
                                    <b>Attendance :</b> 200/300
                                    <br />
                                    {template.is_remark === "1" && (
                                        <>
                                            <b>Teacher Remark :</b> please do extra classes
                                        </>
                                    )}
                                </td>
                            </tr>

                            <tr><td valign="top" style={{ height: '10px' }}></td></tr>

                            <tr>
                                <td valign="top" width="100%" align="center">
                                    <table cellPadding="0" cellSpacing="0" width="100%" style={{ borderBottom: '1px solid #999', marginBottom: '10px' }}>
                                        <tbody>
                                            <tr>
                                                {template.left_sign && (
                                                    <td valign="top" width="33%" className="signature text-center">
                                                        <img src={getUploadUrl('left_sign', template.left_sign)} width="100" height="50" style={{ paddingBottom: '5px' }} alt="Left Sign" />
                                                    </td>
                                                )}
                                                {template.middle_sign && (
                                                    <td valign="top" width="33%" className="signature text-center">
                                                        <img src={getUploadUrl('middle_sign', template.middle_sign)} width="100" height="50" style={{ paddingBottom: '5px' }} alt="Middle Sign" />
                                                    </td>
                                                )}
                                                {template.right_sign && (
                                                    <td valign="top" width="33%" className="signature text-center">
                                                        <img src={getUploadUrl('right_sign', template.right_sign)} width="100" height="50" style={{ paddingBottom: '5px' }} alt="Right Sign" />
                                                    </td>
                                                )}
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>

                            <tr>
                                <td valign="top">
                                    <table cellPadding="0" cellSpacing="0" width="100%">
                                        <tbody>
                                            <tr>
                                                <td valign="top" width="50%">
                                                    <table cellPadding="0" cellSpacing="0" width="90%" className="denifittable-small">
                                                        <tbody>
                                                            <tr>
                                                                <td valign="top" width="50%">Marks Range</td>
                                                                <td valign="top" width="50%">Grade</td>
                                                            </tr>
                                                            {[
                                                                ['91-100', 'A1'], ['81-90', 'A2'], ['71-80', 'B1'],
                                                                ['61-70', 'B2'], ['51-60', 'C1'], ['41-50', 'C2'],
                                                                ['33-40', 'D'], ['32 & Below', 'E (Needs improvement)']
                                                            ].map(([range, grade]) => (
                                                                <tr key={range}>
                                                                    <td valign="top">{range}</td>
                                                                    <td valign="top">{grade}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </td>
                                                <td valign="top" width="50%">
                                                    <table cellPadding="0" cellSpacing="0" width="90%" className="denifittable-small">
                                                        <tbody>
                                                            <tr>
                                                                <td valign="top" width="50%">Marks Range</td>
                                                                <td valign="top" width="50%">Grade</td>
                                                            </tr>
                                                            {[
                                                                ['91-100', 'A1'], ['81-90', 'A2'], ['71-80', 'B1'],
                                                                ['61-70', 'B2'], ['51-60', 'C1'], ['41-50', 'C2'],
                                                                ['33-40', 'D'], ['32 & Below', 'E (Needs improvement)']
                                                            ].map(([range, grade]) => (
                                                                <tr key={`${range}-2`}>
                                                                    <td valign="top">{range}</td>
                                                                    <td valign="top">{grade}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>

                            {template.content_footer && (
                                <tr>
                                    <td valign="top" dangerouslySetInnerHTML={{ __html: template.content_footer }}>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ViewTemplate;
