import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import CampaignCard from '../components/CampaignCard';
import Icon from '../components/Icon';
import { EmptyState, ErrorState, LoadingState, Panel, SmartImage, StatusBadge } from '../components/ui';
import {
    CONTINENT_LABELS,
    coverUrl,
    formatDate,
    formatEth,
    logoUrl,
    ownerLabel,
} from '../lib/visuals';

export default function StartupDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [startup, setStartup] = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        Promise.all([api.get(`/startup/${id}/`), api.get('/campaign/')])
            .then(([startupRes, campaignsRes]) => {
                setStartup(startupRes.data);
                setCampaigns(campaignsRes.data.filter((c) => c.startup === parseInt(id)));
            })
            .catch(() => setError('Failed to load startup'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} />;
    if (!startup) return <ErrorState message="Startup not found." />;

    const isOwner = user && startup.created_by === ownerLabel(user);
    const raised = campaigns.reduce((sum, c) => sum + (Number(c.funded) || 0), 0);
    const name = startup.startup_name;

    return (
        <div>
            {/* Cover hero */}
            <header className="relative">
                <div className="mx-auto max-w-6xl px-3 pt-6 sm:px-6">
                    <Link
                        to="/startups"
                        className="mb-4 ml-2 inline-flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-white"
                    >
                        <Icon name="arrow-left" />
                        All startups
                    </Link>
                    <div className="relative">
                        <SmartImage
                            src={coverUrl(name, 1400, 480)}
                            seed={name}
                            loading="eager"
                            className="aspect-[2.4/1] rounded-3xl border border-line sm:aspect-[3.6/1]"
                        />
                        <div
                            className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-t from-ink via-ink/30 to-transparent"
                            aria-hidden="true"
                        />
                    </div>

                    <div className="relative -mt-14 flex flex-col gap-5 px-3 sm:-mt-16 sm:px-8 md:flex-row md:items-end md:justify-between">
                        <div className="flex items-end gap-5">
                            <SmartImage
                                src={logoUrl(name)}
                                seed={`${name}-logo`}
                                className="size-24 shrink-0 rounded-2xl ring-[6px] ring-ink sm:size-28"
                            />
                            <div className="min-w-0 pb-1">
                                <StatusBadge status={startup.status} className="mb-2" />
                                <h1 className="text-gradient text-3xl font-semibold tracking-tight sm:text-4xl">
                                    {name}
                                </h1>
                                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/55">
                                    <span className="flex items-center gap-1.5">
                                        <Icon name="eth" className="size-3.5 text-accent" />
                                        {startup.category}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Icon name="globe" />
                                        {startup.country} · {CONTINENT_LABELS[startup.continent] || startup.continent}
                                    </span>
                                </p>
                            </div>
                        </div>
                        {isOwner && (
                            <Link to="/campaigns/create" className="btn btn-primary self-start md:self-auto">
                                <Icon name="plus" />
                                Create Campaign
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-6xl space-y-6 px-5 py-10 sm:px-8">
                {/* Key numbers */}
                <dl className="glass grid grid-cols-1 divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    <div className="p-6">
                        <dt className="eyebrow">Total raised</dt>
                        <dd className="mt-2 flex items-center gap-2 font-display text-2xl font-semibold tabular-nums">
                            {formatEth(raised)} <Icon name="eth" className="size-5 text-accent" />
                        </dd>
                    </div>
                    <div className="p-6">
                        <dt className="eyebrow">Campaigns</dt>
                        <dd className="mt-2 font-display text-2xl font-semibold tabular-nums">
                            {campaigns.length}
                        </dd>
                    </div>
                    <div className="p-6">
                        <dt className="eyebrow">Active now</dt>
                        <dd className="mt-2 font-display text-2xl font-semibold tabular-nums">
                            {campaigns.filter((c) => c.status === 'active').length}
                        </dd>
                    </div>
                </dl>

                {/* About */}
                <Panel title="About">
                    <p className="mb-6 leading-relaxed text-white/70">{startup.description}</p>
                    <div className="grid grid-cols-1 gap-5 border-t border-white/10 pt-5 sm:grid-cols-3">
                        <div>
                            <p className="eyebrow mb-1.5">Address</p>
                            <p className="flex items-start gap-2 text-sm text-white/85">
                                <Icon name="map-pin" className="mt-0.5 size-4 shrink-0 text-white/40" />
                                {startup.address}
                            </p>
                        </div>
                        <div>
                            <p className="eyebrow mb-1.5">Created by</p>
                            <p className="flex items-start gap-2 text-sm break-words text-white/85">
                                <Icon name="user" className="mt-0.5 size-4 shrink-0 text-white/40" />
                                <span className="min-w-0 [overflow-wrap:anywhere]">{startup.created_by}</span>
                            </p>
                        </div>
                        <div>
                            <p className="eyebrow mb-1.5">Created at</p>
                            <p className="flex items-start gap-2 text-sm text-white/85">
                                <Icon name="calendar" className="mt-0.5 size-4 shrink-0 text-white/40" />
                                {formatDate(startup.created_at)}
                            </p>
                        </div>
                    </div>
                </Panel>

                {/* Campaigns */}
                <section>
                    <h2 className="mb-5 text-xl font-semibold">
                        Campaigns <span className="text-white/40">({campaigns.length})</span>
                    </h2>
                    {campaigns.length === 0 ? (
                        <EmptyState title="No campaigns for this startup yet." />
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {campaigns.map((campaign) => (
                                <CampaignCard key={campaign.id} campaign={campaign} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
