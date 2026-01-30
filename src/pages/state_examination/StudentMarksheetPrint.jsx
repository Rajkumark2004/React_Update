import React, { useEffect, useState } from 'react';

const StudentMarksheetPrint = () => {
    const [dataList, setDataList] = useState([]);

    useEffect(() => {
        try {
            const storedData = localStorage.getItem('studentMarksheetData');
            if (storedData) {
                const parsed = JSON.parse(storedData);
                // Normalize input: if object but not array, wrap in array. 
                // However, bulk response is dictionary {id: {}, id2: {}}.
                // Single response was { labels, marks...} directly.

                let list = [];
                if (Array.isArray(parsed)) {
                    list = parsed;
                } else {
                    // Check if it's the bulk dictionary format (keys are IDs, values are data objects)
                    // Or single data object (has "labels" key directly)
                    if (parsed.labels) {
                        list = [parsed];
                    } else if (parsed && typeof parsed === 'object') {
                        // Assume dictionary of students
                        list = Object.values(parsed);
                    }
                }
                setDataList(list);
            }
        } catch (error) {
            console.error("Failed to load marksheet data", error);
        }
    }, []);

    if (!dataList || dataList.length === 0) return <div className="text-center p-5">No data found.</div>;

    return (
        <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <style>
                {`
                @media print {
                    .page-break { display: block; page-break-after: always; }
                    button { display: none; }
                }
                .marks-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                .marks-table th, .marks-table td { border: 1px solid #000; padding: 8px; text-align: center; }
                .text-left { text-align: left !important; }
                .student-card { margin-bottom: 30px; }
                `}
            </style>

            <div className="text-right p-2">
                <button onClick={() => window.print()} style={{ padding: '5px 10px', cursor: 'pointer' }}>Print</button>
            </div>

            {dataList.map((data, index) => {
                const { labels, marks, maxmarks } = data;
                const subjects = Object.entries(labels || {});

                let totalObtained = 0;
                let totalMax = 0;

                subjects.forEach(([id]) => {
                    const m = parseFloat(marks[id] || 0);
                    const mm = parseFloat(maxmarks[id] || 0);
                    if (marks[id] != null) totalObtained += m;
                    if (maxmarks[id] != null) totalMax += mm;
                });

                return (
                    <div key={index} className="student-card">
                        <h2 style={{ textAlign: 'center' }}>Student Marksheet</h2>

                        <table className="marks-table">
                            <thead>
                                <tr>
                                    <th className="text-left">Subject</th>
                                    <th>Max Marks</th>
                                    <th>Marks Obtained</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjects.map(([id, subjectName]) => (
                                    <tr key={id}>
                                        <td className="text-left">{subjectName}</td>
                                        <td>{maxmarks[id]}</td>
                                        <td>{marks[id] === null ? "AB" : marks[id]}</td>
                                    </tr>
                                ))}
                                <tr style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
                                    <td className="text-left">Total</td>
                                    <td>{totalMax}</td>
                                    <td>{totalObtained.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>

                        {index < dataList.length - 1 && <div className="page-break"></div>}
                    </div>
                );
            })}
        </div>
    );
};

export default StudentMarksheetPrint;
