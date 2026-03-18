
import React from 'react';

const StudentIdCard = ({ student, cardSettings, schoolSettings }) => {

    const isVertical = cardSettings.enable_vertical_card == 1;

    // Standard CR80 card dimensions for rendering
    const width = isVertical ? '280px' : '462px';
    const height = isVertical ? '462px' : '280px';

    const cardStyles = {
        width: width,
        height: height,
        position: 'relative',
        margin: '0 auto',
        overflow: 'hidden',
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        background: '#fff'
    };

    const BASE_URL = 'https://newlayout.wisibles.com';

    // Standardized image URL helper (matches StudentIdCard page implementation)
    const getImageUrl = (type, filename) => {
        if (!filename || filename === '') {
            if (type === 'student') {
                return student.gender === 'Female' 
                    ? `${BASE_URL}/uploads/student_images/default_female.jpg` 
                    : `${BASE_URL}/uploads/student_images/default_male.jpg`;
            }
            return '';
        }

        if (filename.startsWith('http')) return filename;
        if (filename.startsWith('uploads/')) return `${BASE_URL}/${filename}`;
        if (filename.startsWith('/uploads/')) return `${BASE_URL}${filename}`;

        switch (type) {
            case 'background':
                return `${BASE_URL}/uploads/student_id_card/background/${filename}`;
            case 'logo':
                return `${BASE_URL}/uploads/student_id_card/logo/${filename}`;
            case 'signature':
                return `${BASE_URL}/uploads/student_id_card/signature/${filename}`;
            case 'student':
                return `${BASE_URL}/${filename}`;
            default:
                return `${BASE_URL}/uploads/student_images/no_image.png`;
        }
    };

    // Construct image URLs safely, handling both background/background_image and logo/logo_img
    const backgroundUrl = getImageUrl('background', cardSettings.background || cardSettings.background_image);
    const logoUrl = getImageUrl('logo', cardSettings.logo || cardSettings.logo_img);
    const signatureUrl = getImageUrl('signature', cardSettings.sign_image);
    const studentImageUrl = getImageUrl('student', student.image);

    const headerColor = cardSettings.header_color || '#000';

    // Build student full name
    const studentName = [student.firstname, student.middlename, student.lastname].filter(Boolean).join(' ');

    return (
        <div style={cardStyles}>
            {/* Background Image */}
            {backgroundUrl && (
                <img
                    src={backgroundUrl}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, objectFit: 'fill' }}
                    alt="Background"
                    crossOrigin="anonymous"
                />
            )}

            {/* Content wrapper on top of background */}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>

                {/* Header / School Name */}
                <div style={{
                    backgroundColor: headerColor,
                    color: '#fff',
                    padding: '5px 8px',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                }}>
                    {(cardSettings.logo || cardSettings.logo_img) && (
                        <img
                            src={logoUrl}
                            style={{ height: '25px', width: '25px', objectFit: 'contain' }}
                            alt="Logo"
                            crossOrigin="anonymous"
                        />
                    )}
                    <div style={{ fontSize: isVertical ? '12px' : '14px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {cardSettings.school_name}
                    </div>
                </div>

                {/* School Address */}
                {cardSettings.school_address && (
                    <div style={{
                        textAlign: 'center',
                        padding: '2px 5px',
                        fontSize: '7px',
                        color: '#333',
                        lineHeight: '1.3'
                    }}>
                        {cardSettings.school_address}
                    </div>
                )}

                {/* Title Bar */}
                {cardSettings.title && (
                    <div style={{
                        backgroundColor: headerColor,
                        color: '#fff',
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        padding: '2px 0',
                        fontSize: isVertical ? '10px' : '11px',
                        fontWeight: 'bold',
                        letterSpacing: '1px'
                    }}>
                        {cardSettings.title}
                    </div>
                )}

                {/* Main Content */}
                <div style={{
                    display: 'flex',
                    padding: isVertical ? '8px 10px' : '8px 10px',
                    flex: 1,
                    flexDirection: isVertical ? 'column' : 'row',
                    alignItems: isVertical ? 'center' : 'flex-start',
                    overflow: 'hidden'
                }}>

                    {/* Student Image */}
                    <div style={{
                        flexShrink: 0,
                        marginRight: isVertical ? '0' : '10px',
                        marginBottom: isVertical ? '5px' : '0',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: isVertical ? '60px' : '70px',
                            height: isVertical ? '70px' : '80px',
                            border: '1px solid #ddd',
                            borderRadius: '3px',
                            backgroundImage: `url(${studentImageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            margin: '0 auto'
                        }}>
                        </div>
                    </div>

                    {/* Details */}
                    <div style={{
                        flex: 1,
                        fontSize: isVertical ? '9px' : '10px',
                        lineHeight: '1.4',
                        width: '100%',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-evenly'
                    }}>

                        {/* Student Name displayed prominently */}
                        {cardSettings.enable_student_name == 1 && studentName && (
                            <div style={{
                                marginBottom: '3px',
                                fontWeight: 'bold',
                                fontSize: isVertical ? '10px' : '11px',
                                color: headerColor,
                                textAlign: isVertical ? 'center' : 'left',
                                textTransform: 'uppercase'
                            }}>
                                {studentName}
                            </div>
                        )}

                        <table style={{ width: '100%', borderCollapse: 'collapse', height: '100%' }}>
                            <tbody>
                                {cardSettings.enable_admission_no == 1 && (
                                    <tr>
                                        <td style={{ width: isVertical ? '50%' : '75px', fontWeight: 'bold', textAlign: isVertical ? 'right' : 'left', paddingRight: '3px', whiteSpace: 'nowrap' }}>Adm. No</td>
                                        <td style={{ width: '10px' }}>:</td>
                                        <td style={{ textAlign: 'left' }}>{student.admission_no || ''}</td>
                                    </tr>
                                )}
                                {cardSettings.enable_class == 1 && (
                                    <tr>
                                        <td style={{ fontWeight: 'bold', textAlign: isVertical ? 'right' : 'left', paddingRight: '3px', whiteSpace: 'nowrap' }}>Class</td>
                                        <td style={{ width: '10px' }}>:</td>
                                        <td style={{ textAlign: 'left' }}>{student.class}{student.section ? ` - ${student.section}` : ''}</td>
                                    </tr>
                                )}
                                {cardSettings.enable_fathers_name == 1 && (
                                    <tr>
                                        <td style={{ fontWeight: 'bold', textAlign: isVertical ? 'right' : 'left', paddingRight: '3px', whiteSpace: 'nowrap' }}>Father Name</td>
                                        <td style={{ width: '10px' }}>:</td>
                                        <td style={{ textAlign: 'left' }}>{student.father_name || ''}</td>
                                    </tr>
                                )}
                                {cardSettings.enable_mothers_name == 1 && (
                                    <tr>
                                        <td style={{ fontWeight: 'bold', textAlign: isVertical ? 'right' : 'left', paddingRight: '3px', whiteSpace: 'nowrap' }}>Mother Name</td>
                                        <td style={{ width: '10px' }}>:</td>
                                        <td style={{ textAlign: 'left' }}>{student.mother_name || ''}</td>
                                    </tr>
                                )}
                                {cardSettings.enable_dob == 1 && (
                                    <tr>
                                        <td style={{ fontWeight: 'bold', textAlign: isVertical ? 'right' : 'left', paddingRight: '3px', whiteSpace: 'nowrap' }}>D.O.B</td>
                                        <td style={{ width: '10px' }}>:</td>
                                        <td style={{ textAlign: 'left' }}>{student.dob || ''}</td>
                                    </tr>
                                )}
                                {cardSettings.enable_blood_group == 1 && (
                                    <tr>
                                        <td style={{ fontWeight: 'bold', textAlign: isVertical ? 'right' : 'left', paddingRight: '3px', whiteSpace: 'nowrap' }}>Blood Group</td>
                                        <td style={{ width: '10px' }}>:</td>
                                        <td style={{ textAlign: 'left' }}>{student.blood_group || ''}</td>
                                    </tr>
                                )}
                                {cardSettings.enable_phone == 1 && (
                                    <tr>
                                        <td style={{ fontWeight: 'bold', textAlign: isVertical ? 'right' : 'left', paddingRight: '3px', whiteSpace: 'nowrap' }}>Phone</td>
                                        <td style={{ width: '10px' }}>:</td>
                                        <td style={{ textAlign: 'left' }}>{student.mobileno || student.guardian_phone || ''}</td>
                                    </tr>
                                )}
                                {cardSettings.enable_address == 1 && (
                                    <tr>
                                        <td style={{ fontWeight: 'bold', verticalAlign: 'top', textAlign: isVertical ? 'right' : 'left', paddingRight: '3px', whiteSpace: 'nowrap' }}>Address</td>
                                        <td style={{ width: '10px', verticalAlign: 'top' }}>:</td>
                                        <td style={{ textAlign: 'left' }}>{student.current_address || student.permanent_address || ''}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Signature Section */}
                {signatureUrl && (
                    <div style={{ padding: '0 10px', textAlign: 'right' }}>
                        <img src={signatureUrl} alt="Signature" style={{ height: '20px' }} crossOrigin="anonymous" />
                        <p style={{ margin: 0, fontSize: '6px', borderTop: '0.5px solid #000', display: 'inline-block' }}>Signature</p>
                    </div>
                )}

                {/* Barcode Section */}
                {cardSettings.enable_student_barcode == 1 && (
                    <div style={{ padding: '2px 10px 5px 10px', textAlign: 'center' }}>
                        <div style={{
                            height: '25px',
                            background: 'repeating-linear-gradient(90deg, #000 0, #000 1px, transparent 1px, transparent 3px)',
                            margin: '0 auto',
                            maxWidth: '150px'
                        }}></div>
                        <p style={{ margin: '1px 0 0 0', fontSize: '7px', fontWeight: 'bold' }}>
                            {student.admission_no || ''}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentIdCard;
