import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import StartupCard from './StartupCard';

const AUTOPLAY_MS = 5000;

function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(
        () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    );
    useEffect(() => {
        const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
        if (!mq) return;
        const onChange = (e) => setReduced(e.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);
    return reduced;
}

/*
 * Coverflow-style carousel: the active card sits in the centre (lifted,
 * glowing), neighbours fan out to the sides and fade towards the edges.
 * Accessible: prev/next + dot controls, pause button, arrow-key support,
 * pauses on hover/focus and never auto-rotates with reduced motion.
 */
export default function StartupCarousel({ startups, statsById = {} }) {
    const n = startups.length;
    const [active, setActive] = useState(0);
    const [userPaused, setUserPaused] = useState(false);
    const [hoverPaused, setHoverPaused] = useState(false);
    const reducedMotion = usePrefersReducedMotion();
    const touchStart = useRef(null);

    const autoplay = n > 1 && !userPaused && !hoverPaused && !reducedMotion;

    const go = useCallback((delta) => setActive((a) => (a + delta + n) % n), [n]);

    useEffect(() => {
        if (!autoplay) return;
        const id = setInterval(() => go(1), AUTOPLAY_MS);
        return () => clearInterval(id);
    }, [autoplay, go]);

    if (n === 0) return null;

    // shortest signed distance from the active slide (wraps around)
    const offsetOf = (i) => {
        let d = i - active;
        if (d > n / 2) d -= n;
        if (d < -n / 2) d += n;
        return d;
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            go(1);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            go(-1);
        }
    };

    const onTouchStart = (e) => (touchStart.current = e.touches[0].clientX);
    const onTouchEnd = (e) => {
        if (touchStart.current == null) return;
        const dx = e.changedTouches[0].clientX - touchStart.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        touchStart.current = null;
    };

    return (
        <section
            role="region"
            aria-roledescription="carousel"
            aria-label="Featured startups"
            className="relative"
            onMouseEnter={() => setHoverPaused(true)}
            onMouseLeave={() => setHoverPaused(false)}
            onFocus={() => setHoverPaused(true)}
            onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setHoverPaused(false);
            }}
            onKeyDown={handleKeyDown}
        >
            {/* Glow under the active card */}
            <div
                className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-[36rem] max-w-full -translate-x-1/2 translate-y-1/3 rounded-full bg-accent-strong/40 blur-[110px]"
                aria-hidden="true"
            />

            <div
                className="relative h-[400px] overflow-hidden sm:h-[450px] lg:h-[470px] [--card-w:280px] sm:[--card-w:310px] lg:[--card-w:340px] [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                aria-live={autoplay ? 'off' : 'polite'}
            >
                {startups.map((startup, i) => {
                    const offset = offsetOf(i);
                    const abs = Math.abs(offset);
                    const isActive = offset === 0;
                    const visible = abs <= 2;

                    return (
                        <div
                            key={startup.id}
                            role="group"
                            aria-roledescription="slide"
                            aria-label={`${i + 1} of ${n}: ${startup.startup_name}`}
                            aria-hidden={!isActive}
                            inert={!isActive}
                            onClickCapture={(e) => {
                                // clicking a side card brings it to the centre first
                                if (!isActive) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setActive(i);
                                }
                            }}
                            className={`absolute top-6 left-1/2 w-[var(--card-w)] transition-[transform,opacity,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                isActive ? '' : 'cursor-pointer'
                            }`}
                            style={{
                                marginLeft: 'calc(var(--card-w) / -2)',
                                transform: `translateX(calc(${offset} * (var(--card-w) + 1.5rem))) translateY(${
                                    isActive ? '-8px' : '16px'
                                }) scale(${isActive ? 1 : 0.94})`,
                                opacity: visible ? (abs === 2 ? 0.35 : isActive ? 1 : 0.8) : 0,
                                filter: isActive ? 'none' : 'saturate(0.75)',
                                zIndex: 10 - abs,
                                pointerEvents: visible ? 'auto' : 'none',
                            }}
                        >
                            <StartupCard
                                startup={startup}
                                stats={statsById[startup.id]}
                                featured={isActive}
                                compact
                                tabIndex={isActive ? 0 : -1}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Controls */}
            {n > 1 && (
                <div className="relative z-20 mt-4 flex items-center justify-center gap-4">
                    <button
                        type="button"
                        onClick={() => go(-1)}
                        className="grid size-11 cursor-pointer place-items-center rounded-full border border-white/15 bg-white/[0.03] text-white/80 transition-colors hover:border-white/35 hover:text-white"
                        aria-label="Previous startup"
                    >
                        <Icon name="chevron-left" className="size-5" />
                    </button>

                    <div className="flex items-center gap-1" role="group" aria-label="Choose a startup">
                        {startups.map((s, i) => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => setActive(i)}
                                aria-label={`Show ${s.startup_name}`}
                                aria-current={i === active ? 'true' : undefined}
                                className="group grid h-6 cursor-pointer place-items-center px-1"
                            >
                                <span
                                    className={`block h-1.5 rounded-full transition-all duration-300 ${
                                        i === active ? 'w-6 bg-accent' : 'w-1.5 bg-white/25 group-hover:bg-white/50'
                                    }`}
                                />
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => go(1)}
                        className="grid size-11 cursor-pointer place-items-center rounded-full border border-white/15 bg-white/[0.03] text-white/80 transition-colors hover:border-white/35 hover:text-white"
                        aria-label="Next startup"
                    >
                        <Icon name="chevron-right" className="size-5" />
                    </button>

                    {!reducedMotion && (
                        <button
                            type="button"
                            onClick={() => setUserPaused((p) => !p)}
                            className="grid size-11 cursor-pointer place-items-center rounded-full text-white/55 transition-colors hover:bg-white/5 hover:text-white"
                            aria-label={userPaused ? 'Start automatic rotation' : 'Pause automatic rotation'}
                        >
                            <Icon name={userPaused ? 'play' : 'pause'} className="size-4" />
                        </button>
                    )}
                </div>
            )}
        </section>
    );
}
