/**
 * Filters the list of enquiries based on the provided filter criteria.
 * 
 * @param {Array} enquiries - The master list of enquiry objects.
 * @param {Object} filters - The filter criteria.
 * @param {string} filters.class_id - The ID of the class to filter by.
 * @param {string} filters.source - The source of the enquiry.
 * @param {string} filters.from_date - The start date for the enquiry date range.
 * @param {string} filters.to_date - The end date for the enquiry date range.
 * @param {string} filters.status - The status of the enquiry (or 'all').
 * @returns {Array} - The filtered list of enquiries.
 */
export const filterEnquiries = (enquiries, filters) => {
    if (!enquiries || !Array.isArray(enquiries)) {
        return [];
    }

    return enquiries.filter(enquiry => {
        // Filter by Class
        // Note: Check if enquiry has class_id or class property that matches the ID
        if (filters.class_id && filters.class_id !== '') {
            // Assuming enquiry.class_id or enquiry.class matches filters.class_id
            // If strictly needing comparison, ensure types match (string vs number)
            const enquiryClass = enquiry.class_id || enquiry.class;
            if (String(enquiryClass) !== String(filters.class_id)) {
                return false;
            }
        }

        // Filter by Source
        if (filters.source && filters.source !== '') {
            if (enquiry.source !== filters.source) {
                return false;
            }
        }

        // Filter by Date Range (Enquiry Date)
        if (filters.from_date && filters.from_date !== '') {
            const enquiryDate = new Date(enquiry.date);
            const fromDate = new Date(filters.from_date);
            // set hours to 0 to compare dates only
            enquiryDate.setHours(0, 0, 0, 0);
            fromDate.setHours(0, 0, 0, 0);
            if (enquiryDate < fromDate) {
                return false;
            }
        }

        if (filters.to_date && filters.to_date !== '') {
            const enquiryDate = new Date(enquiry.date);
            const toDate = new Date(filters.to_date);
            enquiryDate.setHours(0, 0, 0, 0);
            toDate.setHours(0, 0, 0, 0);
            if (enquiryDate > toDate) {
                return false;
            }
        }

        // Filter by Status
        if (filters.status && filters.status !== '' && filters.status !== 'all') {
            if (enquiry.status !== filters.status) {
                return false;
            }
        }

        return true;
    });
};
