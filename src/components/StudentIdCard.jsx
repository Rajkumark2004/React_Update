
import React from 'react';

const StudentIdCard = ({ student, cardSettings, schoolSettings }) => {

    const isVertical = cardSettings.enable_vertical_card === "1";

    // Default styles for the container
    // Horizontal: 330px x 200px (approx CR80 landscape)
    // Vertical: 200px x 330px (approx CR80 portrait)
    const width = isVertical ? '200px' : '330px';
    const height = isVertical ? '330px' : '200px';

    const cardStyles = {
        width: width,
        height: height,
        position: 'relative',
        margin: '0 auto',
        overflow: 'hidden',
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
    };

    // Construct image URLs safely
    const backgroundUrl = cardSettings.background ? `https://newlayout.wisibles.com/uploads/student_id_card/background/${cardSettings.background}` : null;
    const logoUrl = cardSettings.logo ? `https://newlayout.wisibles.com/uploads/student_id_card/logo/${cardSettings.logo}` : 'https://newlayout.wisibles.com/uploads/school_content/logo/app_logo.png';
    const studentImageUrl = student.image ? `https://newlayout.wisibles.com/uploads/student_images/${student.image}` : 'https://newlayout.wisibles.com/uploads/student_images/no_image.png';

    const headerColor = cardSettings.header_color || '#000';

    return (
        <div style={cardStyles}>
            {/* Background Image */}
            {backgroundUrl && (
                <img
                    src={backgroundUrl}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, objectFit: 'cover' }}
                    alt="Background"
                    crossOrigin="anonymous"
                />
            )}

            {/* Header / School Name */}
            <div style={{
                backgroundColor: headerColor,
                color: '#fff',
                padding: '5px 10px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: isVertical ? 'column' : 'row',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '40px'
            }}>
                {cardSettings.logo && (
                    <img
                        src={logoUrl}
                        style={{ height: '30px', marginRight: isVertical ? '0' : '10px', marginBottom: isVertical ? '5px' : '0' }}
                        alt="Logo"
                        crossOrigin="anonymous"
                    />
                )}
                <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase' }}>{cardSettings.school_name}</h3>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ display: 'flex', padding: '10px', flex: 1, flexDirection: isVertical ? 'column' : 'row', alignItems: isVertical ? 'center' : 'stretch' }}>

                {/* Left: Student Image */}
                <div style={{ width: '80px', flexShrink: 0, marginRight: isVertical ? '0' : '10px', marginBottom: isVertical ? '10px' : '0', textAlign: 'center' }}>
                    <div style={{
                        width: '80px',
                        height: '100px',
                        border: '1px solid #ddd',
                        marginBottom: '5px',
                        backgroundImage: `url(${studentImageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        margin: '0 auto' // Center in vertical layout
                    }}>
                    </div>
                </div>

                {/* Right: Details */}
                <div style={{ flex: 1, fontSize: '10px', lineHeight: '1.4', width: '100%', textAlign: isVertical ? 'center' : 'left' }}>

                    {cardSettings.enable_student_name === "1" && (
                        <div style={{ marginBottom: '2px', fontWeight: 'bold', fontSize: '12px', color: headerColor }}>
                            {student.firstname} {student.lastname}
                        </div>
                    )}

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: isVertical ? '5px' : '0' }}>
                        <tbody>
                            {cardSettings.enable_admission_no === "1" && (
                                <tr>
                                    <td style={{ width: isVertical ? '50%' : '80px', fontWeight: 'bold', textAlign: isVertical ? 'right' : 'left', paddingRight: isVertical ? '5px' : '0' }}>Admission No</td>
                                    <td style={{ textAlign: 'left', paddingLeft: isVertical ? '5px' : '0' }}>: {student.admission_no}</td>
                                </tr>
                            )}
                            {cardSettings.enable_class === "1" && (
                                <tr>
                                    <td style={{ fontWeight: 'bold', textAlign: isVertical ? 'right' : 'left', paddingRight: isVertical ? '5px' : '0' }}>Class</td>
                                    <td style={{ textAlign: 'left', paddingLeft: isVertical ? '5px' : '0' }}>: {student.class} - {student.section}</td>
                                </tr>
                            )}
                            {cardSettings.enable_fathers_name === "1" && (
                                <tr>
                                    <td style={{ fontWeight: 'bold', textAlign: isVertical ? 'right' : 'left', paddingRight: isVertical ? '5px' : '0' }}>Father's Name</td>
                                    <td style={{ textAlign: 'left', paddingLeft: isVertical ? '5px' : '0' }}>: {student.father_name}</td>
                                </tr>
                            )}
                            {cardSettings.enable_mothers_name === "1" && (
                                <tr>
                                    <td style={{ fontWeight: 'bold', textAlign: isVertical ? 'right' : 'left', paddingRight: isVertical ? '5px' : '0' }}>Mother's Name</td>
                                    <td style={{ textAlign: 'left', paddingLeft: isVertical ? '5px' : '0' }}>: {student.mother_name}</td>
                                </tr>
                            )}
                            {cardSettings.enable_dob === "1" && (
                                <tr>
                                    <td style={{ fontWeight: 'bold', textAlign: isVertical ? 'right' : 'left', paddingRight: isVertical ? '5px' : '0' }}>D.O.B</td>
                                    <td style={{ textAlign: 'left', paddingLeft: isVertical ? '5px' : '0' }}>: {student.dob}</td>
                                </tr>
                            )}
                            {cardSettings.enable_blood_group === "1" && student.blood_group && (
                                <tr>
                                    <td style={{ fontWeight: 'bold', textAlign: isVertical ? 'right' : 'left', paddingRight: isVertical ? '5px' : '0' }}>Blood Group</td>
                                    <td style={{ textAlign: 'left', paddingLeft: isVertical ? '5px' : '0' }}>: {student.blood_group}</td>
                                </tr>
                            )}
                            {cardSettings.enable_phone === "1" && (
                                <tr>
                                    <td style={{ fontWeight: 'bold', textAlign: isVertical ? 'right' : 'left', paddingRight: isVertical ? '5px' : '0' }}>Phone</td>
                                    <td style={{ textAlign: 'left', paddingLeft: isVertical ? '5px' : '0' }}>: {student.mobileno}</td>
                                </tr>
                            )}
                            {cardSettings.enable_address === "1" && (
                                <tr>
                                    <td style={{ fontWeight: 'bold', verticalAlign: 'top', textAlign: isVertical ? 'right' : 'left', paddingRight: isVertical ? '5px' : '0' }}>Address</td>
                                    <td style={{ textAlign: 'left', paddingLeft: isVertical ? '5px' : '0' }}>: {student.current_address || student.permanent_address}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer / Address / Barcode */}
            <div style={{
                padding: '5px',
                textAlign: 'center',
                fontSize: '8px',
                borderTop: '1px solid #eee',
                backgroundColor: '#f9f9f9'
            }}>
                <div>{cardSettings.school_address}</div>
            </div>
        </div>
    );
};

export default StudentIdCard;
