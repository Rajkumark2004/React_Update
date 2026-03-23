/**
 * Converts a date string from yyyy-mm-dd to dd/mm/yyyy.
 * @param {string} dateStr - Date string in yyyy-mm-dd format.
 * @returns {string} - Date string in dd/mm/yyyy format.
 */
export const formatToDDMMYYYY = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) return dateStr; // Already in dd/mm/yyyy
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    return `${day}/${month}/${year}`;
};

/**
 * Converts a date string from dd/mm/yyyy to yyyy-mm-dd.
 * @param {string} dateStr - Date string in dd/mm/yyyy format.
 * @returns {string} - Date string in yyyy-mm-dd format.
 */
export const formatToYYYYMMDD = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('-')) return dateStr; // Already in yyyy-mm-dd
    const [day, month, year] = dateStr.split('/');
    if (!day || !month || !year) return dateStr;
    return `${year}-${month}-${day}`;
};
