import React from 'react';
import { useLocation } from 'react-router-dom';

const StaffIdCardView = () => {
    const location = useLocation();
    const { staffs } = location.state || { staffs: [] };

    if (!staffs || !Array.isArray(staffs) || staffs.length === 0) {
        return <div className="text-center p-5">No staff selected or invalid data</div>;
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <table cellPadding="0" cellSpacing="0" width="100%">
                <tbody>
                    {staffs.reduce((rows, staff, index) => {
                        if (index % 3 === 0) rows.push([]);
                        rows[rows.length - 1].push(staff);
                        return rows;
                    }, []).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((staff, colIndex) => (
                                <td key={colIndex} style={{ padding: '10px', verticalAlign: 'top' }}>
                                    <div style={{ height: '300px', width: '190px', position: 'relative', margin: '0 auto' }}>
                                        {/* Background Image */}
                                        <img
                                            src="https://newlayout.wisibles.com/uploads/staff_id_card/background/sis_hyd_bg.jpeg"
                                            style={{ width: '190px', position: 'absolute', zIndex: -1, height: '299px', left: 0, top: 0 }}
                                            alt="Background"
                                        />

                                        {/* Logo Section */}
                                        <div className="front-logo-section" style={{ paddingTop: '10px', paddingBottom: '10px', textAlign: 'center' }}>
                                            <img
                                                className="id-photo3"
                                                src="https://newlayout.wisibles.com/uploads/school_content/logo/1.png" // Placeholder logo
                                                style={{ width: '50px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
                                                alt="Logo"
                                            />
                                        </div>

                                        {/* Staff Image and Name */}
                                        <div style={{ margin: '0 10px', textAlign: 'center' }}>
                                            {staff.image ? (
                                                <img
                                                    src={`https://newlayout.wisibles.com/uploads/staff_images/${staff.image}`}
                                                    style={{ width: '85px', height: '85px', borderRadius: '5px', border: '1px solid #ddd' }}
                                                    alt={staff.name}
                                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://newlayout.wisibles.com/uploads/staff_images/no_image.png"; }}
                                                />
                                            ) : (
                                                <img
                                                    src="https://newlayout.wisibles.com/uploads/staff_images/no_image.png"
                                                    style={{ width: '85px', height: '85px', borderRadius: '5px', border: '1px solid #ddd' }}
                                                    alt="No Image"
                                                />
                                            )}
                                            <h3 style={{ marginTop: '5px', marginBottom: '0', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', wordSpacing: '2px' }}>
                                                {staff.name} {staff.surname}
                                            </h3>
                                            <h5 style={{ marginTop: '2px', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', wordSpacing: '2px', color: '#ff0000' }}>
                                                {staff.designation || staff.role}
                                            </h5>
                                        </div>

                                        {/* Details Section */}
                                        <div style={{ padding: '10px 0px', paddingLeft: '15px', fontSize: '8px' }}>
                                            <div style={{ display: 'flex', marginBottom: '2px' }}>
                                                <div style={{ width: '60px', textTransform: 'uppercase', fontWeight: '100', lineHeight: '10px' }}>Employee Id</div>
                                                <div style={{ width: '10px', textTransform: 'uppercase', fontWeight: '100', lineHeight: '10px' }}>:</div>
                                                <div style={{ flex: 1, textTransform: 'uppercase', fontWeight: '100', lineHeight: '10px' }}>{staff.employee_id}</div>
                                            </div>
                                            <div style={{ display: 'flex', marginBottom: '2px' }}>
                                                <div style={{ width: '60px', textTransform: 'uppercase', fontWeight: '100', lineHeight: '10px' }}>Blood Group</div>
                                                <div style={{ width: '10px', textTransform: 'uppercase', fontWeight: '100', lineHeight: '10px' }}>:</div>
                                                <div style={{ flex: 1, textTransform: 'uppercase', fontWeight: '100', lineHeight: '10px' }}>B+</div> {/* Mock/Default */}
                                            </div>
                                            <div style={{ display: 'flex', marginBottom: '2px' }}>
                                                <div style={{ width: '60px', textTransform: 'uppercase', fontWeight: '100', lineHeight: '10px' }}>Emergency No</div>
                                                <div style={{ width: '10px', textTransform: 'uppercase', fontWeight: '100', lineHeight: '10px' }}>:</div>
                                                <div style={{ flex: 1, textTransform: 'uppercase', fontWeight: '100', lineHeight: '10px' }}>{staff.contact_no}</div>
                                            </div>
                                        </div>

                                        {/* Address Section */}
                                        <div className="branch-address" style={{ position: 'absolute', bottom: '20px', width: '100%', textAlign: 'center' }}>
                                            <p style={{ fontSize: '7px', fontWeight: '100', margin: '0', lineHeight: '1.2' }}>
                                                Wisibles School<br />
                                                HIG 448, 5th Floor, beside Santhosh Dabha<br />
                                                K P H B Phase 6, Hyderabad<br />
                                                Telangana 500072
                                            </p>
                                        </div>
                                    </div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StaffIdCardView;
