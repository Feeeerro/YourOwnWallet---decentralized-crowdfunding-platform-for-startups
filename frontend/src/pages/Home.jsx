import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero section */}
            <div className="bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-6 py-24 text-center">
                    <h1 className="text-5xl font-bold tracking-tight mb-6">
                        Decentralized Crowdfunding
                        <span className="block text-indigo-400 mt-2">for the next generation</span>
                    </h1>
                    <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-10">
                        A blockchain-powered platform where startups meet investors. Transparent,
                        secure and fully decentralized.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link
                            to="/campaigns"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                        >
                            Browse Campaigns
                        </Link>
                        <Link
                            to="/startups"
                            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-8 py-3 rounded-lg border border-gray-700 transition-colors"
                        >
                            Browse Startups
                        </Link>
                    </div>
                    {!user && (
                        <p className="text-gray-500 mt-8 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
                                Login here
                            </Link>
                        </p>
                    )}
                </div>
            </div>

            {/* Features section */}
            <div className="max-w-7xl mx-auto px-6 py-20">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How it works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-indigo-600 text-2xl">🚀</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Create a Startup
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Register your startup and present your idea to the world. Build your
                            profile and attract investors.
                        </p>
                    </div>
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-indigo-600 text-2xl">⚖️</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Approved</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            A panel of 3 independent judges reviews and approves your campaign
                            before it goes live to ensure quality.
                        </p>
                    </div>
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-indigo-600 text-2xl">💰</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Raise Funds</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Investors fund your campaign directly on the blockchain. Funds are held
                            securely until the goal is reached.
                        </p>
                    </div>
                </div>
            </div>

            {/* CTA section */}
            {!user && (
                <div className="bg-gray-900 text-white">
                    <div className="max-w-7xl mx-auto px-6 py-16 text-center">
                        <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
                        <p className="text-gray-400 mb-8">
                            Join the platform as an investor, startupper or judge.
                        </p>
                        <Link
                            to="/register"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                        >
                            Create an account
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
