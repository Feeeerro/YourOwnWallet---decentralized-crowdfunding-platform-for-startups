import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';

const linkClass = ({ isActive }) =>
    `relative rounded-full px-3 py-2 text-sm font-medium transition-colors ${
        isActive ? 'text-white' : 'text-white/60 hover:text-white'
    }`;

const mobileLinkClass = ({ isActive }) =>
    `rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
        isActive ? 'bg-white/[0.06] text-white' : 'text-white/70 hover:bg-white/[0.04] hover:text-white'
    }`;

export function Brand() {
    return (
        <Link to="/" className="group flex items-center gap-2.5" aria-label="YourOwnWallet home">
            <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-accent-soft to-accent-strong text-[#1a1033] shadow-[0_0_24px_-4px_rgba(167,139,250,0.8)]">
                <Icon name="wallet" className="size-4" strokeWidth={2.25} />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-white">
                YourOwn<span className="text-accent">Wallet</span>
            </span>
        </Link>
    );
}

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setMenuOpen(false);
    };

    return (
        <nav className="sticky top-0 z-50 border-b border-line bg-ink/70 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
                <Brand />

                {/* Desktop links (centered) */}
                <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
                    <NavLink to="/startups" className={linkClass}>
                        Startups
                    </NavLink>
                    <NavLink to="/campaigns" className={linkClass}>
                        Campaigns
                    </NavLink>
                    {user && (
                        <NavLink to="/account" className={linkClass}>
                            My Account
                        </NavLink>
                    )}
                </div>

                {/* Desktop actions */}
                <div className="hidden items-center gap-3 md:flex">
                    {user ? (
                        <>
                            <span className="hidden items-center gap-2 text-sm text-white/55 lg:flex">
                                <Icon name="user" />
                                {user.username}
                            </span>
                            <button onClick={handleLogout} className="btn btn-outline px-5 py-2">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className={linkClass}>
                                Login
                            </NavLink>
                            <Link to="/register" className="btn btn-outline px-5 py-2">
                                Register
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile hamburger */}
                <button
                    className="grid size-11 cursor-pointer place-items-center rounded-xl text-white/75 hover:bg-white/5 hover:text-white md:hidden"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={menuOpen}
                    aria-controls="mobile-menu"
                >
                    <Icon name={menuOpen ? 'x' : 'menu'} className="size-6" />
                </button>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div
                    id="mobile-menu"
                    className="flex flex-col gap-1 border-t border-line bg-ink/95 px-5 py-4 md:hidden"
                >
                    <NavLink to="/startups" className={mobileLinkClass} onClick={() => setMenuOpen(false)}>
                        Startups
                    </NavLink>
                    <NavLink to="/campaigns" className={mobileLinkClass} onClick={() => setMenuOpen(false)}>
                        Campaigns
                    </NavLink>
                    {user ? (
                        <>
                            <NavLink to="/account" className={mobileLinkClass} onClick={() => setMenuOpen(false)}>
                                My Account
                            </NavLink>
                            <button onClick={handleLogout} className="btn btn-outline mt-2 w-full">
                                <Icon name="logout" />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className={mobileLinkClass} onClick={() => setMenuOpen(false)}>
                                Login
                            </NavLink>
                            <Link
                                to="/register"
                                onClick={() => setMenuOpen(false)}
                                className="btn btn-primary mt-2 w-full"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
