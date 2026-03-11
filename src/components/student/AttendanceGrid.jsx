import React from 'react';

const AttendanceGrid = ({ attendanceResult, year }) => {
    // Standard Academic Year Month List usually comes from backend, 
    // but we can default to April-March or Jan-Dec. 
    // Adapting to data keys if possible, or using standard 1-12.
    // 'studentShow.php' uses $monthlist.
    // We will use a standard list order. Logic in PHP seems to iterate $monthlist.
    // Let's assume keys are "01", "02", etc.

    const monthList = [
        { key: "04", val: "April" },
        { key: "05", val: "May" },
        { key: "06", val: "June" },
        { key: "07", val: "July" },
        { key: "08", val: "August" },
        { key: "09", val: "September" },
        { key: "10", val: "October" },
        { key: "11", val: "November" },
        { key: "12", val: "December" },
        { key: "01", val: "January" },
        { key: "02", val: "February" },
        { key: "03", val: "March" }
    ];

    // Helper to format date YYYY-MM-DD
    const formatDate = (y, m, d) => {
        return `${y}-${m}-${String(d).padStart(2, '0')}`;
    };

    // Helper to get attendance symbol
    const getAttendanceSymbol = (dateString) => {
        if (attendanceResult && attendanceResult[dateString]) {
            const rawKey = attendanceResult[dateString].key || '-';
            // Extract just the text value from the HTML string e.g. `<b class="text text-success">P</b>` -> `P`
            const strippedKey = rawKey.replace(/(<([^>]+)>)/gi, "");
            return strippedKey;
        }
        return '';
    };

    // Rows 1-31
    const rows = [];
    for (let day = 1; day <= 31; day++) {
        rows.push(day);
    }

    // CSS for legends
    const legends = [
        { label: 'Present', class: 'label-success' },
        { label: 'Late', class: 'label-warning' },
        { label: 'Absent', class: 'label-danger' },
        { label: 'Half Day', class: 'label-info' },
        { label: 'Holiday', class: 'label-default' }
    ];

    return (
        <div className="table-responsive">
            <table className="table table-bordered table-hover example">
                <thead>
                    <tr>
                        <th>Date / Month</th>
                        {monthList.map(m => (
                            <th key={m.key}>{m.val}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map(day => (
                        <tr key={day}>
                            <td>{day}</td>
                            {monthList.map(m => {
                                // Construct date for this cell
                                // Year logic: 
                                // Apr-Dec use current year part 1
                                // Jan-Mar use current year part 2
                                const currentYear = (year || new Date().getFullYear().toString()).toString();
                                let y = currentYear;
                                if (currentYear.includes('-')) {
                                    const [y1, y2] = currentYear.split('-');
                                    // Apr-Dec => y1
                                    // Jan-Mar => y2
                                    if (['01', '02', '03'].includes(m.key)) {
                                        y = `20${y2}`; // Assuming 25 means 2025
                                        if (y2.length === 4) y = y2;
                                    } else {
                                        y = y1;
                                    }
                                }

                                const cellDate = formatDate(y, m.key, day);
                                const symbol = getAttendanceSymbol(cellDate);

                                // Highlight cell based on symbol
                                let badgeClass = '';
                                if (symbol === 'P') badgeClass = 'text-success';
                                else if (symbol === 'A') badgeClass = 'text-danger';
                                else if (symbol === 'L') badgeClass = 'text-warning';
                                else if (symbol === 'H') badgeClass = 'text-info';
                                else if (symbol === 'F') badgeClass = 'text-default';

                                return (
                                    <td key={m.key} className="text-center">
                                        <span className={badgeClass} style={{ fontWeight: 'bold' }}>
                                            {symbol}
                                        </span>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{ marginTop: '10px' }}>
                {legends.map((l, i) => (
                    <span key={i} className={`label ${l.class}`} style={{ marginRight: '5px' }}>
                        {l.label}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default AttendanceGrid;
