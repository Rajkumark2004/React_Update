import React, { createContext, useContext, useState, useCallback } from 'react';

export const AttendanceCountContext = createContext();

export const useAttendanceCounts = () => {
    const context = useContext(AttendanceCountContext);
    if (!context) {
        return { counts: {}, updateCount: () => {} };
    }
    return context;
};

let _cachedCounts = {
    studentAttendance: '...',
    attendanceByDate: '...',
    approveLeave: '...',
    lateEntries: '...'
};

export const AttendanceCountProvider = ({ children }) => {
    const [counts, setCounts] = useState(_cachedCounts);

    const updateCount = useCallback((key, count) => {
        setCounts(prev => {
            const next = { ...prev, [key]: count };
            _cachedCounts = next;
            return next;
        });
    }, []);

    return (
        <AttendanceCountContext.Provider value={{ counts, updateCount }}>
            {children}
        </AttendanceCountContext.Provider>
    );
};
