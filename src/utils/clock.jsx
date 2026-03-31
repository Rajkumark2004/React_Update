import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

/**
 * ClockInput — scrollable column-based time picker.
 * Two scrollable columns (hour + minute) with an AM/PM toggle.
 * Uses a portal to render the dropdown at the document body level,
 * so it is never clipped by parent overflow or modals.
 */

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

function parseTimeString(val) {
    if (!val) return { hour12: 12, minute: 0, period: 'AM' };
    const m24 = val.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (m24) {
        let h = parseInt(m24[1], 10);
        const m = parseInt(m24[2], 10);
        const period = h >= 12 ? 'PM' : 'AM';
        let h12 = h % 12; if (h12 === 0) h12 = 12;
        return { hour12: h12, minute: m, period };
    }
    const m12 = val.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (m12) return { hour12: parseInt(m12[1], 10), minute: parseInt(m12[2], 10), period: m12[3].toUpperCase() };
    return { hour12: 12, minute: 0, period: 'AM' };
}

function to24h(h12, min, period) {
    let h = h12;
    if (period === 'AM' && h === 12) h = 0;
    if (period === 'PM' && h !== 12) h += 12;
    return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

function toDisplay(h12, min, period) {
    return `${String(h12).padStart(2, '0')}:${String(min).padStart(2, '0')} ${period}`;
}

export const ClockInput = ({ value, onChange, required = false }) => {
    const [open, setOpen] = useState(false);
    const parsed = parseTimeString(value);
    const [hour, setHour] = useState(parsed.hour12);
    const [minute, setMinute] = useState(parsed.minute);
    const [period, setPeriod] = useState(parsed.period);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);
    const hourColRef = useRef(null);
    const minColRef = useRef(null);
    const [pos, setPos] = useState({ top: 0, left: 0 });

    // Sync from prop
    useEffect(() => {
        const p = parseTimeString(value);
        setHour(p.hour12);
        setMinute(p.minute);
        setPeriod(p.period);
    }, [value]);

    // Calculate position when opening
    useEffect(() => {
        if (open && inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            setPos({
                top: rect.bottom + 4,
                left: rect.left
            });
        }
    }, [open]);

    // Scroll selected into view when dropdown opens
    useEffect(() => {
        if (open) {
            setTimeout(() => {
                const hEl = hourColRef.current?.querySelector('.active');
                if (hEl) hEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
                const mEl = minColRef.current?.querySelector('.active');
                if (mEl) mEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }, 50);
        }
    }, [open]);

    // Click outside to close
    useEffect(() => {
        const handler = (e) => {
            if (
                inputRef.current && !inputRef.current.contains(e.target) &&
                dropdownRef.current && !dropdownRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    // Escape to close
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
        if (open) document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open]);

    const emit = useCallback((h, m, p) => { if (onChange) onChange(to24h(h, m, p)); }, [onChange]);

    const pickHour = (h) => { setHour(h); emit(h, minute, period); };
    const pickMinute = (m) => { setMinute(m); emit(hour, m, period); };
    const pickPeriod = (p) => { setPeriod(p); emit(hour, minute, p); };

    const display = value ? toDisplay(hour, minute, period) : '';

    // Render dropdown via portal so it's never clipped
    const dropdown = open ? ReactDOM.createPortal(
        <div
            className="clock-dropdown"
            ref={dropdownRef}
            role="dialog"
            aria-label="Time picker"
            style={{ position: 'fixed', top: pos.top, left: pos.left }}
        >
            <div className="clock-columns">
                {/* Hour column */}
                <div className="clock-col" ref={hourColRef}>
                    <div className="clock-col-header">Hr</div>
                    <div className="clock-col-scroll">
                        {HOURS.map(h => (
                            <div
                                key={h}
                                className={`clock-col-item ${hour === h ? 'active' : ''}`}
                                onClick={() => pickHour(h)}
                                role="option"
                                aria-selected={hour === h}
                            >
                                {String(h).padStart(2, '0')}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Minute column */}
                <div className="clock-col" ref={minColRef}>
                    <div className="clock-col-header">Min</div>
                    <div className="clock-col-scroll">
                        {MINUTES.map(m => (
                            <div
                                key={m}
                                className={`clock-col-item ${minute === m ? 'active' : ''}`}
                                onClick={() => pickMinute(m)}
                                role="option"
                                aria-selected={minute === m}
                            >
                                {String(m).padStart(2, '0')}
                            </div>
                        ))}
                    </div>
                </div>

                {/* AM/PM column */}
                <div className="clock-col clock-col-period">
                    <div className="clock-col-header"></div>
                    <div className="clock-col-scroll">
                        <div
                            className={`clock-col-item period-item ${period === 'AM' ? 'active' : ''}`}
                            onClick={() => pickPeriod('AM')}
                            role="option"
                            aria-selected={period === 'AM'}
                        >
                            AM
                        </div>
                        <div
                            className={`clock-col-item period-item ${period === 'PM' ? 'active' : ''}`}
                            onClick={() => pickPeriod('PM')}
                            role="option"
                            aria-selected={period === 'PM'}
                        >
                            PM
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <div className="clock-input-wrapper">
            <input
                ref={inputRef}
                type="text"
                className="form-control"
                value={display}
                onClick={() => setOpen(!open)}
                readOnly
                placeholder="Select time"
                required={required}
                style={{ cursor: 'pointer', backgroundColor: '#fff' }}
                aria-label="Select time"
                aria-expanded={open}
            />
            {dropdown}
        </div>
    );
};
