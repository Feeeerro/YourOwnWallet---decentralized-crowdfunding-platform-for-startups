import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Icon from '../components/Icon';
import StartupCarousel from '../components/StartupCarousel';
import { buildStartupStats, formatEth } from '../lib/visuals';

const STEPS = [
    {
        icon: 'rocket',
        title: 'Create a Startup',
        text: 'Register your startup and present your idea to the world. Build your profile and attract investors.',
    },
    {
        icon: 'scale',
        title: 'Get Approved',
        text: 'A panel of 3 independent judges reviews and approves your campaign before it goes live to ensure quality.',
    },
    {
        icon: 'coins',
        title: 'Raise Funds',
        text: 'Investors fund your campaign directly on the blockchain. Funds are held securely until the goal is reached.',
    },
];

export default function Home() {
    const { user } = useAuth();
    const [startups, setStartups] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([api.get('/startup/'), api.get('/campaign/')])
            .then(([s, c]) => {
                setStartups(s.data);
                setCampaigns(c.data);
            })
            .catch(() => {
                /* the hero still works without data */
            })
            .finally(() => setLoading(false));
    }, []);

    const statsById = useMemo(() => buildStartupStats(campaigns), [campaigns]);

    // featured = up to 8 startups, active ones and best funded first
    const featured = useMemo(
        () =>
            [...startups]
                .sort(
                    (a, b) =>
                        (b.status === 'active') - (a.status === 'active') ||
                        (statsById[b.id]?.raised || 0) - (statsById[a.id]?.raised || 0)
                )
                .slice(0, 8),
        [startups, statsById]
    );

    const totals = useMemo(
        () => ({
            raised: campaigns.reduce((sum, c) => sum + (Number(c.funded) || 0), 0),
            live: campaigns.filter((c) => c.status === 'active').length,
        }),
        [campaigns]
    );

    return (
        <div className="overflow-x-clip">
            {/* ─── Hero ─────────────────────────────────────────────── */}
            <section className="relative px-3 pt-6 sm:px-6">
                {/* top glow */}
                <div
                    className="pointer-events-none absolute -top-24 left-1/2 h-96 w-[56rem] max-w-[120vw] -translate-x-1/2 rounded-full bg-accent-strong/30 blur-[140px]"
                    aria-hidden="true"
                />

                {/* framed window like the reference */}
                <div className="relative mx-auto max-w-7xl">
                    <div
                        className="absolute inset-x-0 top-0 bottom-40 rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
                        aria-hidden="true"
                    >
                        <div className="bg-grid absolute inset-0 rounded-[2rem]" />
                        {/* sparkle points on the grid */}
                        <span className="absolute top-[88px] left-[176px] size-1 rounded-full bg-white/70 shadow-[0_0_12px_2px_rgba(255,255,255,0.5)]" />
                        <span className="absolute top-[176px] right-[176px] size-1 rounded-full bg-white/70 shadow-[0_0_12px_2px_rgba(255,255,255,0.5)]" />
                    </div>

                    <div className="relative px-5 pt-20 pb-6 text-center md:pt-28">
                        <p className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/70">
                            <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.6)]" />
                            {loading ? 'Live on the blockchain' : `${totals.live} campaigns live on-chain`}
                        </p>
                        <h1 className="text-gradient mx-auto max-w-4xl text-4xl leading-[1.05] font-semibold tracking-tight sm:text-6xl md:text-7xl">
                            Decentralized Crowdfunding For The Next Big Startup
                        </h1>
                        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60 md:text-lg">
                            A blockchain-powered platform where startups meet investors. Transparent,
                            secure and fully decentralized.
                        </p>
                        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Link to="/campaigns" className="btn btn-primary px-7 py-3">
                                Browse Campaigns
                            </Link>
                            <Link to="/startups" className="btn btn-outline px-7 py-3">
                                Browse Startups
                            </Link>
                        </div>
                        {!user && (
                            <p className="mt-6 text-sm text-white/45">
                                Already have an account?{' '}
                                <Link to="/login" className="font-medium text-accent hover:text-accent-soft">
                                    Login here
                                </Link>
                            </p>
                        )}
                    </div>

                    {/* Featured startups carousel */}
                    <div className="relative mt-6">
                        {loading ? (
                            <div className="flex h-[400px] items-center justify-center gap-6 sm:h-[450px] lg:h-[470px]" aria-hidden="true">
                                {[0, 1, 2].map((i) => (
                                    <div
                                        key={i}
                                        className={`glass h-[370px] w-[280px] sm:h-[400px] sm:w-[310px] shrink-0 animate-pulse ${
                                            i === 1 ? '' : 'hidden opacity-60 md:block'
                                        }`}
                                    />
                                ))}
                            </div>
                        ) : featured.length > 0 ? (
                            <StartupCarousel startups={featured} statsById={statsById} />
                        ) : (
                            <p className="py-16 text-center text-sm text-white/45">
                                No startups yet — be the first to launch one.
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* ─── Proof strip ──────────────────────────────────────── */}
            <section className="mx-auto mt-16 max-w-5xl px-5 sm:px-8">
                <dl className="glass grid grid-cols-1 divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    {[
                        { label: 'Startups', value: startups.length },
                        { label: 'Campaigns', value: campaigns.length },
                        { label: 'ETH raised', value: formatEth(totals.raised) },
                    ].map((s) => (
                        <div key={s.label} className="px-6 py-6 text-center">
                            <dt className="eyebrow">{s.label}</dt>
                            <dd className="mt-2 font-display text-3xl font-semibold tabular-nums">
                                {loading ? '—' : s.value}
                            </dd>
                        </div>
                    ))}
                </dl>
            </section>

            {/* ─── How it works ─────────────────────────────────────── */}
            <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
                <div className="mb-12 text-center">
                    <p className="eyebrow mb-3 text-accent-soft/80">Three simple steps</p>
                    <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">How it works</h2>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {STEPS.map((step, i) => (
                        <div key={step.title} className="glass glass-hover relative overflow-hidden p-8">
                            <span
                                className="absolute top-4 right-6 font-display text-6xl font-semibold text-white/[0.04]"
                                aria-hidden="true"
                            >
                                0{i + 1}
                            </span>
                            <div className="mb-6 grid size-12 place-items-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/20">
                                <Icon name={step.icon} className="size-6" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-white">{step.title}</h3>
                            <p className="text-sm leading-relaxed text-white/55">{step.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── CTA ──────────────────────────────────────────────── */}
            {!user && (
                <section className="mx-auto max-w-7xl px-5 sm:px-8">
                    <div className="glass relative overflow-hidden px-6 py-16 text-center">
                        <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
                        <div
                            className="pointer-events-none absolute -bottom-32 left-1/2 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-accent-strong/35 blur-[110px]"
                            aria-hidden="true"
                        />
                        <div className="relative">
                            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                                Ready to get started?
                            </h2>
                            <p className="mx-auto mt-4 max-w-md text-white/55">
                                Join the platform as an investor, startupper or judge.
                            </p>
                            <Link to="/register" className="btn btn-primary mt-8 px-7 py-3">
                                Create an account
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
