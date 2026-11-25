/*
 * Visual helpers shared by cards, carousel and detail pages.
 *
 * The backend has no image fields, so every startup/campaign gets a
 * deterministic cover + logo generated from its name:
 *  - covers:  Lorem Picsum (https://picsum.photos) — photos from Unsplash,
 *             free to use under the Unsplash License, no attribution required.
 *  - logos:   DiceBear "shapes" style (https://www.dicebear.com) — CC0 1.0.
 * If an image fails to load, components fall back to the gradient below.
 */

const GRADIENTS = [
    ['#7c3aed', '#ec4899', '#f59e0b'],
    ['#4f46e5', '#06b6d4', '#a3e635'],
    ['#9333ea', '#f43f5e', '#fb923c'],
    ['#2563eb', '#8b5cf6', '#f472b6'],
    ['#0ea5e9', '#6366f1', '#d946ef'],
    ['#14b8a6', '#8b5cf6', '#facc15'],
];

const LOGO_BACKGROUNDS = ['c4b5fd', 'f9a8d4', 'a5f3fc', 'bef264', 'fde68a', 'fdba74'];

export function hashString(value = '') {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
        hash = (hash << 5) - hash + value.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

const slug = (value = '') =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'project';

export function coverUrl(seed, width = 720, height = 360) {
    return `https://picsum.photos/seed/yow-${slug(seed)}/${width}/${height}`;
}

export function logoUrl(seed) {
    const bg = LOGO_BACKGROUNDS[hashString(seed) % LOGO_BACKGROUNDS.length];
    return `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${bg}&radius=0`;
}

export function fallbackGradient(seed) {
    const [a, b, c] = GRADIENTS[hashString(seed) % GRADIENTS.length];
    return `radial-gradient(circle at 20% 20%, ${c} 0%, transparent 45%), linear-gradient(135deg, ${a} 0%, ${b} 100%)`;
}

/* ─── Formatting ───────────────────────────────────────────────────── */

export function formatEth(value) {
    const n = Number(value) || 0;
    return n.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}

export function formatMonthYear(date) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function formatDate(date) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export const CONTINENT_LABELS = {
    africa: 'Africa',
    antarctica: 'Antarctica',
    asia: 'Asia',
    europe: 'Europe',
    north_america: 'N. America',
    oceania: 'Oceania',
    south_america: 'S. America',
};

/* Aggregate campaign numbers per startup id */
export function buildStartupStats(campaigns = []) {
    return campaigns.reduce((acc, c) => {
        const s = (acc[c.startup] ??= { count: 0, raised: 0, target: 0, active: 0 });
        s.count += 1;
        s.raised += Number(c.funded) || 0;
        s.target += Number(c.target) || 0;
        if (c.status === 'active') s.active += 1;
        return acc;
    }, {});
}

/* The backend identifies owners by this string (see StringRelatedField) */
export const ownerLabel = (user) =>
    user ? `${user.first_name} ${user.last_name} (${user.email})` : '';
