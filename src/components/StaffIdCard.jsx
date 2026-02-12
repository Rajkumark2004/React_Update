
import React from 'react';

const StaffIdCard = ({ staff, cardSettings, schoolSettings }) => {

    const isVertical = cardSettings.enable_vertical_card === "1";

    // Default styles for the container (CR80 size approximately)
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
    const backgroundUrl = cardSettings.background ? `https://newlayout.wisibles.com/uploads/staff_id_card/background/${cardSettings.background}` : null;
    const logoUrl = cardSettings.logo ? `https://newlayout.wisibles.com/uploads/staff_id_card/logo/${cardSettings.logo}` : 'https://newlayout.wisibles.com/uploads/school_content/logo/app_logo.png';
    const staffImageUrl = staff.image ? `https://newlayout.wisibles.com/uploads/staff_images/${staff.image}` : 'https://newlayout.wisibles.com/uploads/staff_images/default_male.jpg';

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

                {/* Left: Staff Image */}
                <div style={{ width: '80px', flexShrink: 0, marginRight: isVertical ? '0' : '10px', marginBottom: isVertical ? '10px' : '0', textAlign: 'center' }}>
                    <div style={{
                        width: '80px',
                        height: '100px',
                        border: '1px solid #ddd',
                        marginBottom: '5px',
                        backgroundImage: `url(${staffImageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        margin: '0 auto'
                    }}>
                    </div>
                </div>

                {/* Right: Details */}
                <div style={{ flex: 1, fontSize: '10px', lineHeight: '1.4', width: '100%', textAlign: isVertical ? 'center' : 'left' }}>

                    {cardSettings.enable_name === "1" && (
                        <div style={{ marginBottom: '2px', fontWeight: 'bold', fontSize: '12px', color: headerColor }}>
                            {staff.name} {staff.surname}
                        </div>
                    )}

                    <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#ff0000', marginBottom: '4px', textTransform: 'uppercase' }}>
                        {staff.designation || staff.role}
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: isVertical ? '5px' : '0' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: isVertical ? '50%' : '80px', fontWeight: 'bold', textAlign: isVertical ? 'right' : 'left', paddingRight: isVertical ? '5px' : '0' }}>Staff ID</td>
                                <td style={{ textAlign: 'left', paddingLeft: isVertical ? '5px' : '0' }}>: {staff.employee_id}</td>
                            </tr>
                            {cardSettings.enable_father_name === "1" && (
                                <tr>
                                    <td style={{ fontWeight: 'bold', textAlign: isVertical ? 'right' : 'left', paddingRight: isVertical ? '5px' : '0' }}>Father Name</td>
                                    <td style={{ textAlign: 'left', paddingLeft: isVertical ? '5px' : '0' }}>: {staff.father_name}</td>
                                </tr>
                            )}
                            {cardSettings.enable_mother_name === "1" && (
                                <tr>
                                    <td style={{ fontWeight: 'bold', textAlign: isVertical ? 'right' : 'left', paddingRight: isVertical ? '5px' : '0' }}>Mother Name</td>
                                    <td style={{ textAlign: 'left', paddingLeft: isVertical ? '5px' : '0' }}>: {staff.mother_name}</td>
                                </tr>
                            )}
                            {cardSettings.enable_date_of_joining === "1" && (
                                <tr>
                                    <td style={{ fontWeight: 'bold', textAlign: isVertical ? 'right' : 'left', paddingRight: isVertical ? '5px' : '0' }}>Date of Joining</td>
                                    <td style={{ textAlign: 'left', paddingLeft: isVertical ? '5px' : '0' }}>: {staff.date_of_joining}</td>
                                </tr>
                            )}
                            {cardSettings.enable_permanent_address === "1" && (
                                <tr>
                                    <td style={{ fontWeight: 'bold', verticalAlign: 'top', textAlign: isVertical ? 'right' : 'left', paddingRight: isVertical ? '5px' : '0' }}>Address</td>
                                    <td style={{ textAlign: 'left', paddingLeft: isVertical ? '5px' : '0' }}>: {staff.local_address || staff.permanent_address}</td>
                                </tr>
                            )}
                            {cardSettings.enable_phone === "1" && (
                                <tr>
                                    <td style={{ fontWeight: 'bold', textAlign: isVertical ? 'right' : 'left', paddingRight: isVertical ? '5px' : '0' }}>Phone</td>
                                    <td style={{ textAlign: 'left', paddingLeft: isVertical ? '5px' : '0' }}>: {staff.contact_no}</td>
                                </tr>
                            )}
                            {cardSettings.enable_dob === "1" && (
                                <tr>
                                    <td style={{ fontWeight: 'bold', textAlign: isVertical ? 'right' : 'left', paddingRight: isVertical ? '5px' : '0' }}>D.O.B</td>
                                    <td style={{ textAlign: 'left', paddingLeft: isVertical ? '5px' : '0' }}>: {staff.dob}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer / Address */}
            <div style={{
                padding: '5px',
                textAlign: 'center',
                fontSize: '8px',
                borderTop: '1px solid #eee',
                backgroundColor: '#f9f9f9',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minHeight: '25px'
            }}>
                <div>{cardSettings.school_address}</div>
            </div>
        </div>
    );
};

export default StaffIdCard;
