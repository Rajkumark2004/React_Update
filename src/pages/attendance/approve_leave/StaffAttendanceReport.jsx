import React, { useState } from 'react';
import AttendanceLayout from '../AttendanceLayout';
import '../../../utils/include_files';

const StaffAttendanceReport = () => {
    const [role, setRole] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [showResult, setShowResult] = useState(false);

    // Mock Data
    const roles = ["Admin", "Teacher", "Accountant", "Librarian", "Receptionist", "Super Admin"];
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const years = [2023, 2024, 2025, 2026];

    // Mock Staff Data with Indian Names
    const staffData = [
        { id: 101, name: "Rajesh Kumar", role: "Teacher", present: 22, late: 2, absent: 1, half_day: 0, holiday: 5, gross_percent: 96 },
        { id: 102, name: "Priya Sharma", role: "Teacher", present: 24, late: 0, absent: 0, half_day: 1, holiday: 5, gross_percent: 98 },
        { id: 103, name: "Amit Patel", role: "Accountant", present: 20, late: 0, absent: 5, half_day: 0, holiday: 5, gross_percent: 80 },
        { id: 104, name: "Sunita Gupta", role: "Librarian", present: 23, late: 1, absent: 1, half_day: 0, holiday: 5, gross_percent: 92 },
        { id: 105, name: "Vikram Singh", role: "Admin", present: 25, late: 0, absent: 0, half_day: 0, holiday: 5, gross_percent: 100 },
        { id: 106, name: "Anita Desai", role: "Receptionist", present: 21, late: 3, absent: 1, half_day: 0, holiday: 5, gross_percent: 88 },
    ];

    // Generate days for the selected month (assuming 30 days for simplicity in mock)
    const daysInMonth = 30;
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Mock daily status generator
    const getStatusForDay = (staffId, day) => {
        // Randomly assign status for demo purposes
        const rand = Math.random();
        if (day % 7 === 0) return { label: 'H', class: 'text-danger' }; 
        if (rand > 0.9) return { label: 'A', class: 'text-danger' };
        if (rand > 0.85) return { label: 'L', class: 'text-warning' };
        if (rand > 0.8) return { label: 'F', class: 'text-warning' };
        return { label: 'P', class: 'text-success' };
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setShowResult(true);
    };

    return (
        <AttendanceLayout activeTab="staff_attendance">
            <div className="sis-search-bar-container" style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <div className="sis-search-bar-header">
                    <h3 className="sis-search-title" style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600', color: '#1e293b' }}>Select Criteria</h3>
                </div>
                <form onSubmit={handleSearch}>
                    <div className="sis-filter-row" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div className="sis-filter-col" style={{ flex: '1', minWidth: '200px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>Role</label>
                            <select className="form-control sis-filter-select" value={role} onChange={(e) => setRole(e.target.value)} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }}>
                                <option value="">Select</option>
                                {roles.map((r, i) => <option key={i} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div className="sis-filter-col" style={{ flex: '1', minWidth: '200px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>Month <span className="req">*</span></label>
                            <select className="form-control sis-filter-select" value={month} onChange={(e) => setMonth(e.target.value)} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }}>
                                <option value="">Select</option>
                                {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                            </select>
                        </div>
                        <div className="sis-filter-col" style={{ flex: '1', minWidth: '200px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>Year</label>
                            <select className="form-control sis-filter-select" value={year} onChange={(e) => setYear(e.target.value)} style={{ borderRadius: '8px', border: '1px solid #e2e8f0', height: '40px' }}>
                                <option value="">Select</option>
                                {years.map((y, i) => <option key={i} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <div className="sis-filter-col" style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <button type="submit" className="btn btn-primary sis-apply-btn" style={{ height: '40px', padding: '0 24px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="fa fa-search"></i> Search
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {showResult && (
                <div className="sis-list-container" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                    <div className="sis-list-header" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>Staff Attendance Report</h3>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                            <span style={{ fontWeight: '600' }}><span style={{ color: '#22c55e' }}>P:</span> Present</span>
                            <span style={{ fontWeight: '600' }}><span style={{ color: '#eab308' }}>L:</span> Late</span>
                            <span style={{ fontWeight: '600' }}><span style={{ color: '#ef4444' }}>A:</span> Absent</span>
                            <span style={{ fontWeight: '600' }}><span style={{ color: '#f97316' }}>F:</span> Half Day</span>
                            <span style={{ fontWeight: '600' }}><span style={{ color: '#94a3b8' }}>H:</span> Holiday</span>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover" style={{ margin: 0 }}>
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    <th style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0', minWidth: '200px' }}>Staff / Date</th>
                                    <th style={{ padding: '12px 10px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>(%)</th>
                                    <th style={{ padding: '12px 10px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>P</th>
                                    <th style={{ padding: '12px 10px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>L</th>
                                    <th style={{ padding: '12px 10px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>A</th>
                                    <th style={{ padding: '12px 10px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>F</th>
                                    <th style={{ padding: '12px 10px', fontSize: '13px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>H</th>
                                    {daysArray.map(day => (
                                        <th key={day} style={{ padding: '12px 8px', fontSize: '11px', fontWeight: '600', color: '#475569', borderBottom: '1px solid #e2e8f0', textAlign: 'center', minWidth: '35px' }}>
                                            {day}<br />
                                            <span style={{ color: '#94a3b8', fontSize: '10px' }}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'][day % 7]}</span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {staffData.map((staff, index) => (
                                    <tr key={staff.id}>
                                        <td style={{ padding: '12px 24px', borderBottom: '1px solid #f1f5f9' }}>
                                            <div style={{ fontWeight: '600', color: '#1e293b' }}>{staff.name}</div>
                                            <div style={{ fontSize: '11px', color: '#64748b' }}>ID: {staff.id}</div>
                                        </td>
                                        <td style={{ padding: '12px 10px', borderBottom: '1px solid #f1f5f9' }}>
                                            <span className={`badge ${staff.gross_percent >= 95 ? 'bg-success' : staff.gross_percent < 75 ? 'bg-danger' : 'bg-warning'}`} style={{ borderRadius: '4px' }}>
                                                {staff.gross_percent}%
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 10px', borderBottom: '1px solid #f1f5f9', fontWeight: '600' }}>{staff.present}</td>
                                        <td style={{ padding: '12px 10px', borderBottom: '1px solid #f1f5f9', fontWeight: '600' }}>{staff.late}</td>
                                        <td style={{ padding: '12px 10px', borderBottom: '1px solid #f1f5f9', fontWeight: '600' }}>{staff.absent}</td>
                                        <td style={{ padding: '12px 10px', borderBottom: '1px solid #f1f5f9', fontWeight: '600' }}>{staff.half_day}</td>
                                        <td style={{ padding: '12px 10px', borderBottom: '1px solid #f1f5f9', fontWeight: '600' }}>{staff.holiday}</td>
                                        {daysArray.map(day => {
                                            const status = getStatusForDay(staff.id, day);
                                            return (
                                                <td key={day} style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', fontWeight: '700', borderBottom: '1px solid #f1f5f9' }} className={status.class}>
                                                    {status.label}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </AttendanceLayout>
    );
};

export default StaffAttendanceReport;
