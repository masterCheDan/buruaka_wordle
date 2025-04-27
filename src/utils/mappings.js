// src/utils/mappings.js

export const schoolMap = {
    'Trinity': '圣三一',
    'Gehenna': '格黑娜',
    // ...
};

export const attackTypeMap = {
    'Explosion': '爆发',
    'Piercing': '贯通',
    // ...
};

// ... export other maps ...

// Optional: A central function to apply mappings
export function mapValue(key, value) {
    if (value === undefined || value === null) return '-';

    switch (key) {
        case 'school': return schoolMap[value] || value;
        case 'attackType': return attackTypeMap[value] || value;
        // ... other cases using imported maps ...
        case 'rarity': return typeof value === 'number' ? `${value}★` : value;
        case 'height': return typeof value === 'number' ? `${value}cm` : value;
        case 'combatEnvironment': return Array.isArray(value) ? value.join(', ') : value;
        default: return value;
    }
}