import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                {/* Brand */}
                <Link to="/" className="text-white font-bold text-xl tracking-tight">
                    YourOwn<span className="text-indigo-400">Wallet</span>
                </Link>

                {/* Navigation links */}
                <div className="flex items-center gap-8">
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
            </div>
        </nav>
    );
}
