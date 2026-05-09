import React from 'react';
import { Link } from 'react-router-dom';

const getInitials = (name) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

const getAvatarColor = (name) => {
    const colors = [
        { bg: '#e0f2fe', text: '#0284c7' }, // light blue
        { bg: '#f3e8ff', text: '#9333ea' }, // light purple
        { bg: '#dcfce7', text: '#16a34a' }, // light green
        { bg: '#fef3c7', text: '#d97706' }, // light yellow
        { bg: '#ffe4e6', text: '#e11d48' }, // light pink
    ];
    let hash = 0;
    if (name) {
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
    }
    return colors[Math.abs(hash) % colors.length];
};

export const renderName = (name, studentId) => {
    const color = getAvatarColor(name);
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
                width: '32px', height: '32px', borderRadius: '50%', 
                backgroundColor: color.bg, color: color.text,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '600', fontSize: '13px', flexShrink: 0
            }}>
                {getInitials(name)}
            </div>
            <Link to={`/student/view/${studentId}`} style={{ color: '#1e293b', fontWeight: '500' }}>
                {name}
            </Link>
        </div>
    );
};

export const renderClass = (className) => (
    <span style={{
        background: '#eff6ff',
        color: '#1d4ed8',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '500',
        whiteSpace: 'nowrap',
        display: 'inline-block'
    }}>
        {className}
    </span>
);

export const renderGender = (gender) => {
    if (!gender) return null;
    const isMale = gender.toLowerCase() === 'male';
    const isFemale = gender.toLowerCase() === 'female';
    
    // Default fallback for other genders
    let bg = '#f1f5f9';
    let color = '#475569';
    let icon = 'fa-user';

    if (isMale) {
        bg = '#eff6ff'; // light blue
        color = '#2563eb'; // blue
        icon = 'fa-mars'; // male symbol
    } else if (isFemale) {
        bg = '#fdf2f8'; // light pink
        color = '#db2777'; // pink
        icon = 'fa-venus'; // female symbol
    }

    return (
        <span style={{
            background: bg,
            color: color,
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            minWidth: '85px' // Ensures both Male and Female pills are the same size
        }}>
            <i className={`fa ${icon}`} style={{ fontSize: '14px' }}></i> {gender}
        </span>
    );
};
