/**
 * Shared validation utility for input sanitization and validation.
 * 
 * Usage:
 *   import { sanitizeName, validateName } from '../../utils/validation';
 * 
 * Sanitizers  – call in onChange to block invalid chars in real-time.
 * Validators  – call in onSubmit to show error messages before API call.
 */

// ─── Sanitizers (use in onChange) ────────────────────────────────────

/** Letters, spaces, dots, hyphens only. Max 50 chars. */
export const sanitizeName = (value) => value;
//    value.replace(/[^a-zA-Z\s.\-]/g, '').slice(0, 50);

/** Letters, numbers, spaces, dots, hyphens only. Max 50 chars. */
export const sanitizeNameWithNumbers = (value) => value;
//    value.replace(/[^a-zA-Z0-9\s.\-]/g, '').slice(0, 50);

/** Digits only. Max 15 chars. */
export const sanitizePhone = (value) => value;
//    value.replace(/[^0-9]/g, '').slice(0, 15);

/** Letters and spaces only. Max 100 chars. */
export const sanitizeAlphaWithSpaces = (value) => value;
//    value.replace(/[^a-zA-Z\s]/g, '').slice(0, 100);

/** Digits only. Max 5 chars. */
export const sanitizeNumbers = (value) => value;
//    value.replace(/[^0-9]/g, '').slice(0, 5);

/** Decimal numbers only. Max 10 chars. */
export const sanitizeDecimal = (value) => value;
/* {
    // Allows at most one decimal point
    const sanitized = value.replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    if (parts.length > 2) {
        return parts[0] + '.' + parts.slice(1).join('');
    }
    return sanitized.slice(0, 10);
}; */

// ─── Validators (use in onSubmit) ───────────────────────────────────

/** Validate a name field. Returns error string or empty string. */
export const validateName = (value) => {
    const trimmed = (value || '').trim();
    if (!trimmed) return 'Name is required';
    if (trimmed.length < 3) return 'Name must be at least 3 characters';
    if (trimmed.length > 50) return 'Name must not exceed 50 characters';
    if (/[^a-zA-Z\s.\-]/.test(trimmed)) return 'Name contains invalid characters';
    return '';
};

/** Validate a phone field. Returns error string or empty string. */
export const validatePhone = (value) => {
    const trimmed = (value || '').trim();
    if (!trimmed) return 'Phone is required';
    if (/[^0-9]/.test(trimmed)) return 'Phone must contain only digits';
    if (trimmed.length < 10) return 'Phone must be at least 10 digits';
    if (trimmed.length > 10) return 'Phone must not exceed 10 digits';
    return '';
};

/** Validate a source field. Returns error string or empty string. */
export const validateSource = (value) => {
    const trimmed = (value || '').trim();
    if (!trimmed) return 'Source is required';
    if (trimmed.length > 30) return 'Source must not exceed 30 characters';
    if (/[^a-zA-Z\s]/.test(trimmed)) return 'Source contains invalid characters';
    return '';
};

/** Validate a reference field. Returns error string or empty string. */
export const validateReference = (value) => {
    const trimmed = (value || '').trim();
    if (!trimmed) return 'Reference is required';
    if (trimmed.length > 30) return 'Reference must not exceed 30 characters';
    if (/[^a-zA-Z\s]/.test(trimmed)) return 'Reference contains invalid characters';
    return '';
};

/**
 * Validate that date_to is not before date_from.
 * Both dates should be in YYYY-MM-DD format (from input type="date").
 * Returns error string or empty string.
 */
export const validateDateRange = (dateFrom, dateTo, fromLabel = 'Start Date', toLabel = 'End Date') => {
    if (!dateFrom || !dateTo) return '';
    if (new Date(dateTo) < new Date(dateFrom)) {
        return `${toLabel} cannot be before ${fromLabel}`;
    }
    return '';
};

/** Validate a generic string length. Returns error string or empty string. */
export const validateMaxLength = (value, maxLength = 50, fieldName = 'Field') => {
    const trimmed = (value || '').trim();
    if (trimmed.length > maxLength) return `${fieldName} must not exceed ${maxLength} characters`;
    return '';
};

/** Validate a room number/name field. Returns error string or empty string. */
export const validateRoomNo = (value) => {
    const trimmed = (value || '').trim();
    if (!trimmed) return 'Room Number / Name is required';
    if (trimmed.length > 50) return 'Room Number / Name must not exceed 50 characters';
    if (/[^a-zA-Z0-9\s.\-/#_,]/.test(trimmed)) return 'Room Number / Name contains invalid characters';
    return '';
};

/** Validate number of beds. Returns error string or empty string. */
export const validateNoOfBeds = (value) => {
    const trimmed = (String(value) || '').trim();
    if (!trimmed) return 'Number of beds is required';
    if (!/^[1-9][0-9]*$/.test(trimmed)) return 'Number of beds must be a positive integer';
    return '';
};

/** Validate cost per bed. Returns error string or empty string. */
export const validateCost = (value) => {
    const trimmed = (String(value) || '').trim();
    if (!trimmed) return 'Cost per bed is required';
    if (!/^[0-9]+(\.[0-9]{1,2})?$/.test(trimmed)) return 'Cost per bed must be a valid number';
    return '';
};

/** Validate description. Returns error string or empty string. */
export const validateDescription = (value) => {
    const trimmed = (value || '').trim();
    if (trimmed.length > 200) return 'Description must not exceed 200 characters';
    return '';
};
