/*
 * Minimal inline SVG icon set (Lucide-style, 24px grid, 1.75 stroke).
 * Decorative by default (aria-hidden); pass `title` for a meaningful icon.
 */
const PATHS = {
    'chevron-left': <path d="m15 18-6-6 6-6" />,
    'chevron-right': <path d="m9 18 6-6-6-6" />,
    'arrow-left': (
        <>
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
        </>
    ),
    'arrow-up-right': (
        <>
            <path d="M7 7h10v10" />
            <path d="M7 17 17 7" />
        </>
    ),
    menu: (
        <>
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
        </>
    ),
    x: (
        <>
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </>
    ),
    globe: (
        <>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            <path d="M2 12h20" />
        </>
    ),
    'map-pin': (
        <>
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
            <circle cx="12" cy="10" r="3" />
        </>
    ),
    calendar: (
        <>
            <path d="M8 2v4" />
            <path d="M16 2v4" />
            <rect width="18" height="18" x="3" y="4" rx="2" />
            <path d="M3 10h18" />
        </>
    ),
    rocket: (
        <>
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </>
    ),
    scale: (
        <>
            <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
            <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
            <path d="M7 21h10" />
            <path d="M12 3v18" />
            <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
        </>
    ),
    coins: (
        <>
            <circle cx="8" cy="8" r="6" />
            <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
            <path d="M7 6h1v4" />
            <path d="m16.71 13.88.7.71-2.82 2.82" />
        </>
    ),
    layers: (
        <>
            <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
            <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
            <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
        </>
    ),
    target: (
        <>
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </>
    ),
    wallet: (
        <>
            <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
            <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
        </>
    ),
    plus: (
        <>
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </>
    ),
    check: <path d="M20 6 9 17l-5-5" />,
    alert: (
        <>
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
        </>
    ),
    pause: (
        <>
            <rect x="14" y="4" width="4" height="16" rx="1" />
            <rect x="6" y="4" width="4" height="16" rx="1" />
        </>
    ),
    play: <path d="M6 3v18l14-9L6 3Z" />,
    link: (
        <>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </>
    ),
    shield: (
        <>
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
            <path d="m9 12 2 2 4-4" />
        </>
    ),
    user: (
        <>
            <circle cx="12" cy="8" r="5" />
            <path d="M20 21a8 8 0 0 0-16 0" />
        </>
    ),
    filter: <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />,
    inbox: (
        <>
            <path d="M22 12h-6l-2 3h-4l-2-3H2" />
            <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </>
    ),
    logout: (
        <>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="m16 17 5-5-5-5" />
            <path d="M21 12H9" />
        </>
    ),
};

export default function Icon({ name, className = 'size-4', title, strokeWidth = 1.75 }) {
    if (name === 'eth') {
        return (
            <svg
                viewBox="0 0 24 24"
                className={className}
                fill="currentColor"
                aria-hidden={title ? undefined : true}
                role={title ? 'img' : undefined}
            >
                {title && <title>{title}</title>}
                <path d="M12 1.5 5.25 12.4 12 16.35l6.75-3.95L12 1.5Z" opacity="0.9" />
                <path d="M12 17.62 5.25 13.68 12 22.5l6.75-8.82L12 17.62Z" opacity="0.6" />
            </svg>
        );
    }

    return (
        <svg
            viewBox="0 0 24 24"
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden={title ? undefined : true}
            role={title ? 'img' : undefined}
        >
            {title && <title>{title}</title>}
            {PATHS[name]}
        </svg>
    );
}
