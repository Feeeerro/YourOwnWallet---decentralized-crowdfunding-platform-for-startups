import { Link } from 'react-router-dom';
import Icon from './Icon';
import { ProgressBar, SmartImage, StatusBadge } from './ui';
import { coverUrl, formatEth, formatMonthYear, logoUrl } from '../lib/visuals';

/*
 * Launchpad-style campaign card: cover banner, startup logo, campaign name,
 * startup row + deadline, Target / Raised / Progress strip and progress bar.
 */
export default function CampaignCard({ campaign }) {
    const funded = Number(campaign.funded) || 0;
    const target = Number(campaign.target) || 0;
    const progress = target > 0 ? Math.min((funded / target) * 100, 100) : 0;
    const startupName = campaign.startup_name || 'Startup';

    return (
        <Link
            to={`/campaigns/${campaign.id}`}
            className="glass glass-hover group flex h-full flex-col p-2.5"
        >
            <SmartImage
                src={coverUrl(`${campaign.campaign_name}-${campaign.id}`)}
                seed={campaign.campaign_name}
                className="aspect-[2.2/1] rounded-xl [&_img]:transition-transform [&_img]:duration-500 group-hover:[&_img]:scale-105"
            />

            <div className="relative z-10 -mt-8 flex items-end justify-between px-3">
                <SmartImage
                    src={logoUrl(startupName)}
                    seed={`${startupName}-logo`}
                    className="size-14 rounded-xl ring-4 ring-[#0d0c18]"
                />
                <StatusBadge status={campaign.status} className="mb-1" />
            </div>

            <div className="mt-3 flex items-start justify-between gap-3 px-3">
                <div className="min-w-0">
                    <h3 className="line-clamp-1 text-lg font-semibold text-white transition-colors group-hover:text-accent-soft">
                        {campaign.campaign_name}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-white/65">
                        <Icon name="eth" className="size-3.5 shrink-0 text-accent" />
                        {startupName}
                    </p>
                </div>
                <p className="mt-6 shrink-0 text-xs text-white/45">
                    Ends {formatMonthYear(campaign.deadline)}
                </p>
            </div>

            <dl className="mt-4 grid grid-cols-3 divide-x divide-white/10 px-3">
                <div className="pr-3">
                    <dt className="text-[11px] text-white/45">Target</dt>
                    <dd className="mt-0.5 flex items-center gap-1 text-sm font-semibold tabular-nums">
                        {formatEth(target)}
                        <Icon name="eth" className="size-3 text-white/60" />
                    </dd>
                </div>
                <div className="px-3">
                    <dt className="text-[11px] text-white/45">Raised</dt>
                    <dd className="mt-0.5 flex items-center gap-1 text-sm font-semibold tabular-nums">
                        {formatEth(funded)}
                        <Icon name="eth" className="size-3 text-white/60" />
                    </dd>
                </div>
                <div className="pl-3">
                    <dt className="text-[11px] text-white/45">Progress</dt>
                    <dd className="mt-0.5 text-sm font-semibold tabular-nums">{progress.toFixed(0)}%</dd>
                </div>
            </dl>

            <div className="mt-4 px-3">
                <ProgressBar value={progress} />
            </div>

            {campaign.description && (
                <p className="mt-4 line-clamp-2 px-3 text-sm leading-relaxed text-white/50">
                    {campaign.description}
                </p>
            )}

            <span className="mt-auto pt-4">
                <span className="btn btn-ghost w-full py-2.5 text-xs">
                    See campaign
                    <Icon
                        name="arrow-up-right"
                        className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                </span>
            </span>
        </Link>
    );
}
