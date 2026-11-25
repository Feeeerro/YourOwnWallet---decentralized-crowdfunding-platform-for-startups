import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import { fallbackGradient } from '../lib/visuals';

/* ─── Status badge (dot + text, never colour alone) ───────────────── */

const STATUS_STYLES = {
    active: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/25',
    pending: 'bg-amber-400/10 text-amber-300 ring-amber-400/25',
    completed: 'bg-sky-400/10 text-sky-300 ring-sky-400/25',
    failed: 'bg-rose-400/10 text-rose-300 ring-rose-400/25',
    rejected: 'bg-white/5 text-white/55 ring-white/15',
    inactive: 'bg-white/5 text-white/55 ring-white/15',
};

export function StatusBadge({ status, className = '' }) {
    const style = STATUS_STYLES[status] || STATUS_STYLES.inactive;
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset backdrop-blur ${style} ${className}`}
        >
            <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
            {status}
        </span>
    );
}

/* ─── Image with gradient fallback (no layout shift) ─────────────── */

export function SmartImage({ src, seed, alt = '', className = '', loading = 'lazy' }) {
    const [failed, setFailed] = useState(false);
    return (
        <div
            className={`overflow-hidden ${className}`}
            style={{ backgroundImage: fallbackGradient(seed || alt) }}
        >
            {!failed && (
                <img
                    src={src}
                    alt={alt}
                    loading={loading}
                    decoding="async"
                    onError={() => setFailed(true)}
                    className="h-full w-full object-cover"
                />
            )}
        </div>
    );
}

/* ─── Page header with grid + glow ───────────────────────────────── */

export function PageHeader({ eyebrow, title, subtitle, back, actions, children, width = 'max-w-7xl' }) {
    return (
        <header className="relative overflow-hidden border-b border-line">
            <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
            <div
                className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[48rem] -translate-x-1/2 rounded-full bg-accent-strong/25 blur-[120px]"
                aria-hidden="true"
            />
            <div className={`relative mx-auto ${width} px-5 py-12 sm:px-8 md:py-16`}>
                {back && (
                    <Link
                        to={back.to}
                        className="mb-6 inline-flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-white"
                    >
                        <Icon name="arrow-left" />
                        {back.label}
                    </Link>
                )}
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div className="min-w-0">
                        {eyebrow && <p className="eyebrow mb-3 text-accent-soft/80">{eyebrow}</p>}
                        <h1 className="text-gradient text-4xl font-semibold tracking-tight md:text-5xl">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/55">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
                </div>
                {children}
            </div>
        </header>
    );
}

/* ─── Loading / error / empty states ─────────────────────────────── */

export function LoadingState({ label = 'Loading...' }) {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4" role="status">
            <span className="size-8 animate-spin rounded-full border-2 border-white/10 border-t-accent" />
            <p className="text-sm text-white/55">{label}</p>
        </div>
    );
}

export function ErrorState({ message }) {
    return (
        <div className="flex min-h-[60vh] items-center justify-center px-5">
            <div className="alert-error flex items-center gap-3" role="alert">
                <Icon name="alert" className="size-5 shrink-0" />
                {message}
            </div>
        </div>
    );
}

export function EmptyState({ icon = 'inbox', title, children }) {
    return (
        <div className="glass flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-accent/10 text-accent">
                <Icon name={icon} className="size-6" />
            </span>
            <p className="font-medium text-white/85">{title}</p>
            {children && <div className="mt-2 text-sm text-white/50">{children}</div>}
        </div>
    );
}

/* ─── Section panel used on detail / account pages ──────────────── */

export function Panel({ title, action, children, className = '' }) {
    return (
        <section className={`glass p-6 md:p-7 ${className}`}>
            {(title || action) && (
                <div className="mb-5 flex items-center justify-between gap-4">
                    {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
                    {action}
                </div>
            )}
            {children}
        </section>
    );
}

export function ProgressBar({ value, className = 'h-1.5' }) {
    const pct = Math.max(0, Math.min(Number(value) || 0, 100));
    return (
        <div
            className={`overflow-hidden rounded-full bg-white/[0.07] ${className}`}
            role="progressbar"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
        >
            <div
                className="h-full rounded-full bg-gradient-to-r from-accent-strong via-accent to-fuchsia-300 transition-[width] duration-700"
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}
