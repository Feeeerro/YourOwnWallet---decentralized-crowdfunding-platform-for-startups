import { Link } from 'react-router-dom';
import Icon from './Icon';
import { SmartImage, StatusBadge } from './ui';
import { CONTINENT_LABELS, coverUrl, formatEth, formatMonthYear, logoUrl } from '../lib/visuals';

/*
 * Launchpad-style startup card: cover banner, overlapping logo,
 * name + category row, 3-column stats strip and a "See startup" bar.
 * `stats` (optional) = { count, raised } aggregated from the campaigns.
 */
export default function StartupCard({ startup, stats, featured = false, compact = false, tabIndex }) {
    const name = startup.startup_name;

    return (
        <Link
            to={`/startups/${startup.id}`}
            tabIndex={tabIndex}
            className={`glass glass-hover group flex h-full flex-col p-2.5 ${
                featured ? 'border-accent/30 shadow-[0_30px_80px_-30px_rgba(139,92,246,0.7)]' : ''
            }`}
        >
            {/* Cover */}
            <SmartImage
                src={coverUrl(name)}
                seed={name}
                className="relative aspect-[2.2/1] rounded-xl [&_img]:transition-transform [&_img]:duration-500 group-hover:[&_img]:scale-105"
            />

            {/* Logo + status */}
            <div className="relative z-10 -mt-8 flex items-end justify-between px-3">
                <SmartImage
                    src={logoUrl(name)}
                    seed={`${name}-logo`}
                    className="size-14 rounded-xl ring-4 ring-[#0d0c18]"
                />
                <StatusBadge status={startup.status} className="mb-1" />
            </div>

            {/* Title */}
            <div className="mt-3 flex items-start justify-between gap-3 px-3">
                <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold text-white transition-colors group-hover:text-accent-soft">
                        {name}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-white/65">
                        <Icon name="eth" className="size-3.5 text-accent" />
                        {startup.category || 'Uncategorized'}
                    </p>
                </div>
                <p className="mt-6 shrink-0 text-xs text-white/45">
                    Since {formatMonthYear(startup.created_at)}
                </p>
            </div>

            {/* Stats */}
            <dl className="mt-4 grid grid-cols-3 divide-x divide-white/10 px-3">
                <div className="pr-3">
                    <dt className="text-[11px] text-white/45">Total raise</dt>
                    <dd className="mt-0.5 flex items-center gap-1 truncate text-sm font-semibold tabular-nums">
                        {formatEth(stats?.raised)}
                        <Icon name="eth" className="size-3 text-white/60" />
                    </dd>
                </div>
                <div className="px-3">
                    <dt className="text-[11px] text-white/45">Campaigns</dt>
                    <dd className="mt-0.5 text-sm font-semibold tabular-nums">{stats?.count ?? 0}</dd>
                </div>
                <div className="pl-3">
                    <dt className="text-[11px] text-white/45">Region</dt>
                    <dd className="mt-0.5 truncate text-sm font-semibold" title={startup.country}>
                        {CONTINENT_LABELS[startup.continent] || startup.country || '—'}
                    </dd>
                </div>
            </dl>

            {/* Description (hidden in compact carousel cards) */}
            {!compact && startup.description && (
                <p className="mt-4 line-clamp-2 px-3 text-sm leading-relaxed text-white/50">
                    {startup.description}
                </p>
            )}

            <span className="mt-auto pt-4">
                <span className="btn btn-ghost w-full py-2.5 text-xs">
                    See startup
                    <Icon
                        name="arrow-up-right"
                        className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                </span>
            </span>
        </Link>
    );
}
