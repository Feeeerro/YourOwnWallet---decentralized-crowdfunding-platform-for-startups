import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

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

    if (loading)
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    if (error)
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    if (!startup)
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Startup not found.</p>
            </div>
        );

    const isOwner =
        user && startup.created_by === `${user.first_name} ${user.last_name} (${user.email})`;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gray-900 text-white">
                <div className="max-w-4xl mx-auto px-6 py-12">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">{startup.startup_name}</h1>
                            <p className="text-gray-400">
                                {startup.category} · {startup.country} · {startup.continent}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                            <span
                                className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                                    startup.status === 'active'
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-amber-500 text-white'
                                }`}
                            >
                                {startup.status}
                            </span>
                            {isOwner && (
                                <Link
                                    to="/campaigns/create"
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                                >
                                    + Create Campaign
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
                {/* About */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">{startup.description}</p>
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                                Address
                            </p>
                            <p className="text-sm text-gray-700">{startup.address}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                                Created by
                            </p>
                            <p className="text-sm text-gray-700">{startup.created_by}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                                Created at
                            </p>
                            <p className="text-sm text-gray-700">
                                {new Date(startup.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Campaigns */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Campaigns ({campaigns.length})
                    </h2>
                    {campaigns.length === 0 ? (
                        <p className="text-gray-500 text-sm">No campaigns for this startup yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {campaigns.map((campaign) => (
                                <Link
                                    to={`/campaigns/${campaign.id}`}
                                    key={campaign.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:border-indigo-200 hover:shadow-sm transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                                            {campaign.campaign_name}
                                        </h3>
                                        <span
                                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                campaign.status === 'active'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : campaign.status === 'completed'
                                                      ? 'bg-blue-100 text-blue-700'
                                                      : campaign.status === 'failed'
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-amber-100 text-amber-700'
                                            }`}
                                        >
                                            {campaign.status}
                                        </span>
                                    </div>
                                    <div className="bg-gray-100 rounded-full h-1.5 mb-2">
                                        <div
                                            className="bg-indigo-600 h-1.5 rounded-full"
                                            style={{
                                                width: `${Math.min((campaign.funded / campaign.target) * 100, 100)}%`,
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>
                                            {campaign.funded} / {campaign.target} ETH
                                        </span>
                                        <span>
                                            Deadline:{' '}
                                            {new Date(campaign.deadline).toLocaleDateString()}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
