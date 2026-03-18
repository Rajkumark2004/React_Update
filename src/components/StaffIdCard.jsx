
import React from 'react';

const StaffIdCard = ({ staff, cardSettings, schoolSettings }) => {

    const isVertical = cardSettings.enable_vertical_card == 1;

    // Default styles for the container (CR80 size approximately)
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
                <div style={{ flex: 1, fontSize: '10px', lineHeight: '1.4', width: '100%', textAlign: isVertical ? 'center' : 'left', display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', overflow: 'hidden' }}>

                    {cardSettings.enable_name == 1 && (
                        <div style={{ marginBottom: '2px', fontWeight: 'bold', fontSize: '12px', color: headerColor }}>
                            {staff.name} {staff.surname}
                        </div>
                    )}

                    <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#ff0000', marginBottom: '4px', textTransform: 'uppercase' }}>
                        {staff.designation || staff.role}
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: isVertical ? '5px' : '0', height: '100%' }}>
                        <tbody>
                            {cardSettings.enable_name == 1 && (
                                <tr>
                                    <td style={{ width: isVertical ? '50%' : '75px', fontWeight: 'bold', textAlign: isVertical ? 'right' : 'left', paddingRight: '3px', whiteSpace: 'nowrap' }}>Name</td>
                                    <td style={{ width: '10px' }}>:</td>
                                    <td style={{ textAlign: 'left' }}>{(staff.name || '') + ' ' + (staff.surname || '')}</td>
                                </tr>
                            )}
                            <tr>
                                <td style={{ width: isVertical ? '50%' : '75px', fontWeight: 'bold', textAlign: isVertical ? 'right' : 'left', paddingRight: '3px', whiteSpace: 'nowrap' }}>Staff ID</td>
                                <td style={{ width: '10px' }}>:</td>
                                <td style={{ textAlign: 'left' }}>{staff.employee_id || ''}</td>
                            </tr>
                            {cardSettings.enable_fathers_name == 1 && (
                                <tr>
                                    <td style={{ fontWeight: 'bold', textAlign: isVertical ? 'right' : 'left', paddingRight: '3px', whiteSpace: 'nowrap' }}>Father Name</td>
                                    <td style={{ width: '10px' }}>:</td>
                                    <td style={{ textAlign: 'left' }}>{staff.father_name || ''}</td>
                                </tr>
                            )}
                            {cardSettings.enable_mothers_name == 1 && (
                                <tr>
                                    <td style={{ fontWeight: 'bold', textAlign: isVertical ? 'right' : 'left', paddingRight: '3px', whiteSpace: 'nowrap' }}>Mother Name</td>
                                    <td style={{ width: '10px' }}>:</td>
                                    <td style={{ textAlign: 'left' }}>{staff.mother_name || ''}</td>
                                </tr>
                            )}
                            {cardSettings.enable_date_of_joining == 1 && (
                                <tr>
                                    <td style={{ fontWeight: 'bold', textAlign: isVertical ? 'right' : 'left', paddingRight: '3px', whiteSpace: 'nowrap' }}>Date of Joining</td>
                                    <td style={{ width: '10px' }}>:</td>
                                    <td style={{ textAlign: 'left' }}>{staff.date_of_joining || ''}</td>
                                </tr>
                            )}
                            {cardSettings.enable_permanent_address == 1 && (
                                <tr>
                                    <td style={{ fontWeight: 'bold', verticalAlign: 'top', textAlign: isVertical ? 'right' : 'left', paddingRight: '3px', whiteSpace: 'nowrap' }}>Address</td>
                                    <td style={{ width: '10px', verticalAlign: 'top' }}>:</td>
                                    <td style={{ textAlign: 'left' }}>{staff.local_address || staff.permanent_address || ''}</td>
                                </tr>
                            )}
                            {cardSettings.enable_designation == 1 && (
                                <tr>
                                    <td style={{ fontWeight: 'bold', textAlign: isVertical ? 'right' : 'left', paddingRight: '3px', whiteSpace: 'nowrap' }}>Designation</td>
                                    <td style={{ width: '10px' }}>:</td>
                                    <td style={{ textAlign: 'left' }}>{staff.designation || ''}</td>
                                </tr>
                            )}
                            {cardSettings.enable_staff_department == 1 && (
                                <tr>
                                    <td style={{ fontWeight: 'bold', textAlign: isVertical ? 'right' : 'left', paddingRight: '3px', whiteSpace: 'nowrap' }}>Department</td>
                                    <td style={{ width: '10px' }}>:</td>
                                    <td style={{ textAlign: 'left' }}>{staff.department || ''}</td>
                                </tr>
                            )}
                            {cardSettings.enable_staff_phone == 1 && (
                                <tr>
                                    <td style={{ fontWeight: 'bold', textAlign: isVertical ? 'right' : 'left', paddingRight: '3px', whiteSpace: 'nowrap' }}>Phone</td>
                                    <td style={{ width: '10px' }}>:</td>
                                    <td style={{ textAlign: 'left' }}>{staff.contact_no || ''}</td>
                                </tr>
                            )}
                            {cardSettings.enable_staff_dob == 1 && (
                                <tr>
                                    <td style={{ fontWeight: 'bold', textAlign: isVertical ? 'right' : 'left', paddingRight: '3px', whiteSpace: 'nowrap' }}>D.O.B</td>
                                    <td style={{ width: '10px' }}>:</td>
                                    <td style={{ textAlign: 'left' }}>{staff.dob || ''}</td>
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
