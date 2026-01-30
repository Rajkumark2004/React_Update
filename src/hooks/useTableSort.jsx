import React, { useState, useMemo } from 'react';

export const useTableSort = (data = []) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = useMemo(() => {
        let sortableItems = [...data];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle string comparisons case-insensitively
                if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                }
                if (typeof bValue === 'string') {
                    bValue = bValue.toLowerCase();
                }

                // Handle null/undefined values safely (push to bottom or top?)
                // Current logic follows standard JS sort for mixed types generally
                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [data, sortConfig]);

    const getSortIcon = (name) => {
        if (sortConfig.key === name) {
            return sortConfig.direction === 'ascending'
                ? <i className="fa fa-angle-up" style={{ fontSize: '12px', marginLeft: '3px' }}></i>
                : <i className="fa fa-angle-down" style={{ fontSize: '12px', marginLeft: '3px' }}></i>;
        }
        return <i className="fa fa-angle-up" style={{ fontSize: '12px', marginLeft: '3px', opacity: 0.3 }}></i>;
    };

    return { sortedData, requestSort, getSortIcon, sortConfig };
};
