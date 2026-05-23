import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
        <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                {/* Brand */}
                <Link to="/" className="text-white font-bold text-xl tracking-tight">
                    YourOwn<span className="text-indigo-400">Wallet</span>
                </Link>

                {/* Desktop links */}
                <div className="hidden md:flex items-center gap-8">
                    <Link
                        to="/startups"
                        className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
                    >
                        Startups
                    </Link>
                    <Link
                        to="/campaigns"
                        className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
                    >
                        Campaigns
                    </Link>
                    {user ? (
                        <>
                            <Link
                                to="/account"
                                className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
                            >
                                My Account
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-sm font-medium text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 px-4 py-2 rounded-lg transition-all"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile hamburger button */}
                <button
                    className="md:hidden text-gray-300 hover:text-white"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden bg-gray-900 border-t border-gray-800 px-6 py-4 flex flex-col gap-4">
                    <Link
                        to="/startups"
                        onClick={() => setMenuOpen(false)}
                        className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
                    >
                        Startups
                    </Link>
                    <Link
                        to="/campaigns"
                        onClick={() => setMenuOpen(false)}
                        className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
                    >
                        Campaigns
                    </Link>
                    {user ? (
                        <>
                            <Link
                                to="/account"
                                onClick={() => setMenuOpen(false)}
                                className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
                            >
                                My Account
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-left text-sm font-medium text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 px-4 py-2 rounded-lg transition-all w-fit"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                onClick={() => setMenuOpen(false)}
                                className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                onClick={() => setMenuOpen(false)}
                                className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors w-fit"
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
