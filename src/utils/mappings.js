// src/utils/mappings.js

export const schoolMap = {
    'Trinity': '圣三一',
    'Gehenna': '格黑娜',
    'SRT': 'SRT',
    'Millennium': '千年',
    'Valkyrie': '瓦尔基里',
    'Shanhaijing': '山海经',
    'Abydos': '阿比多斯',
    'Arius': '阿里乌斯',
    'Hyakkiyako': '百鬼夜行',
    'RedWinter': '红冬',
    'Highlander': '海兰德',
    'Tokiwadai': '常磐台',
    'Sakugawa': '栅川中学',
    'ETC': '其他'
    // ...
};

export const tacticRoleMap = {
    'Supporter': '辅助',
    'Tanker': '坦克',
    'DamageDealer': '输出',
    'Healer': '治疗',
    'Vehicle': '载具支援'
    // ...
};

export const bulletTypeMap = {
    'Explosion': '爆发',
    'Pierce': '贯通',
    'Mystic': '神秘',
    'Sonic': '振动'
    // ...
};

export const armorTypeMap = {
    'LightArmor': '轻装甲',
    'HeavyArmor': '重装甲',
    'Unarmed': '特殊装甲',
    'ElasticArmor': '弹性装甲'
};

// ... export other maps ...

export const bulletTypeColorClassMap = {
    'Explosion': 'bullet-explosion',
    'Pierce': 'bullet-pierce',
    'Mystic': 'bullet-mystic',
    'Sonic': 'bullet-sonic'
};
export const armorTypeColorClassMap = {
    'LightArmor': 'armor-light',
    'HeavyArmor': 'armor-heavy',
    'Unarmed': 'armor-unarmed',
    'ElasticArmor': 'armor-elastic'
};

export function getAttributeColorClass(key, value) {
    switch (key) {
        case 'BulletType': return bulletTypeColorClassMap[value] || '';
        case 'ArmorType': return armorTypeColorClassMap[value] || '';
        default: return '';
    }
}

// Optional: A central function to apply mappings
export function mapValue(key, value) {
    if (value === undefined || value === null) return '-';

    switch (key) {
        case 'School': return schoolMap[value] || value;
        case 'ArmorType': return armorTypeMap[value] || value;
        case 'BulletType': return bulletTypeMap[value] || value;
        case 'TacticRole': return tacticRoleMap[value] || value;
        // ... other cases using imported maps ...
        case 'StarGrade': return typeof value === 'number' ? `${value}★` : value;
        default: return value;
    }
}

export function getIconPath(key, value) {
    switch (key) {
        case 'School': return `images/schoolicon/School_Icon_${String(value).toUpperCase()}_W.png`;
        case 'TacticRole': return `images/roleIcon/Role_${value}.png`;
        default: return '';
    }
}