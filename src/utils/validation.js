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
export const sanitizeName = (value) =>
    value.replace(/[^a-zA-Z\s.\-]/g, '').slice(0, 50);

/** Letters, numbers, spaces, dots, hyphens only. Max 50 chars. */
export const sanitizeNameWithNumbers = (value) =>
    value.replace(/[^a-zA-Z0-9\s.\-]/g, '').slice(0, 50);

/** Digits only. Max 15 chars. */
export const sanitizePhone = (value) =>
    value.replace(/[^0-9]/g, '').slice(0, 15);

/** Letters and spaces only. Max 100 chars. */
export const sanitizeAlphaWithSpaces = (value) =>
    value.replace(/[^a-zA-Z\s]/g, '').slice(0, 100);

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
