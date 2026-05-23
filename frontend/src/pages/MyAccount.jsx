import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import CampaignCard from '../components/CampaignCard';
import StartupCard from '../components/StartupCard';

export default function MyAccount() {
    const { user } = useAuth();
    const [startups, setStartups] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [pendingCampaigns, setPendingCampaigns] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [startupRes, campaignRes, txRes] = await Promise.all([
                    api.get('/startup/'),
                    api.get('/campaign/'),
                    api.get('/transaction/'),
                ]);

                setStartups(
                    startupRes.data.filter(
                        (s) =>
                            s.created_by === `${user.first_name} ${user.last_name} (${user.email})`
                    )
                );
                setCampaigns(
                    campaignRes.data.filter(
                        (c) =>
                            c.created_by === `${user.first_name} ${user.last_name} (${user.email})`
                    )
                );
                setTransactions(txRes.data);

                if (user.role === 'judge') {
                    const pendingList = campaignRes.data.filter((c) => c.status === 'pending');
                    const unvoted = [];
                    for (const campaign of pendingList) {
                        try {
                            const judgeRes = await api.get(
                                `/campaign/${campaign.id}/judge-status/`
                            );
                            if (!judgeRes.data.has_voted) unvoted.push(campaign);
                        } catch {
                            unvoted.push(campaign);
                        }
                    }
                    setPendingCampaigns(unvoted);
                }
            } catch {
                // silently fail
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getBadgeClass = (status) => {
        switch (status) {
            case 'active':
                return 'bg-emerald-100 text-emerald-700';
            case 'completed':
                return 'bg-blue-100 text-blue-700';
            case 'failed':
                return 'bg-red-100 text-red-700';
            case 'rejected':
                return 'bg-gray-100 text-gray-600';
            default:
                return 'bg-amber-100 text-amber-700';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gray-900 text-white">
                <div className="max-w-4xl mx-auto px-6 py-12">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold mb-1">
                                {user.first_name} {user.last_name}
                            </h1>
                            <p className="text-gray-400">{user.email}</p>
                        </div>
                        <span className="bg-indigo-600 text-white text-sm font-medium px-4 py-1.5 rounded-full capitalize">
                            {user.role}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
                {/* Profile info */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
                        {user.role === 'startupper' && (
                            <Link
                                to="/startups/create"
                                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                            >
                                + Create Startup
                            </Link>
                        )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                                Username
                            </p>
                            <p className="text-sm text-gray-800 font-medium">{user.username}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                                Country
                            </p>
                            <p className="text-sm text-gray-800">{user.country || '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                                City
                            </p>
                            <p className="text-sm text-gray-800">{user.city || '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                                Phone
                            </p>
                            <p className="text-sm text-gray-800">{user.phone || '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                                Address
                            </p>
                            <p className="text-sm text-gray-800">{user.address || '—'}</p>
                        </div>
                        <div className="col-span-2 md:col-span-3">
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                                Wallet Address
                            </p>
                            <p className="text-sm text-indigo-600 font-mono break-all">
                                {user.wallet_address}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Judge — pending campaigns */}
                {user.role === 'judge' && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Campaigns Awaiting Your Vote (
                            {loading ? '...' : pendingCampaigns.length})
                        </h2>
                        {loading && <p className="text-gray-500 text-sm">Loading...</p>}
                        {!loading && pendingCampaigns.length === 0 && (
                            <p className="text-gray-500 text-sm">
                                No campaigns waiting for your vote.
                            </p>
                        )}
                        {!loading && pendingCampaigns.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pendingCampaigns.map((campaign) => (
                                    <CampaignCard key={campaign.id} campaign={campaign} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Startupper — my startups */}
                {user.role === 'startupper' && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            My Startups ({startups.length})
                        </h2>
                        {loading && <p className="text-gray-500 text-sm">Loading...</p>}
                        {!loading && startups.length === 0 && (
                            <p className="text-gray-500 text-sm">
                                You haven't created any startups yet.{' '}
                                <Link
                                    to="/startups/create"
                                    className="text-indigo-600 hover:text-indigo-500"
                                >
                                    Create your first one
                                </Link>
                            </p>
                        )}
                        {!loading && startups.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {startups.map((startup) => (
                                    <StartupCard key={startup.id} startup={startup} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Startupper — my campaigns */}
                {user.role === 'startupper' && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            My Campaigns ({campaigns.length})
                        </h2>
                        {loading && <p className="text-gray-500 text-sm">Loading...</p>}
                        {!loading && campaigns.length === 0 && (
                            <p className="text-gray-500 text-sm">
                                You haven't created any campaigns yet.
                            </p>
                        )}
                        {!loading && campaigns.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {campaigns.map((campaign) => (
                                    <CampaignCard key={campaign.id} campaign={campaign} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Investor — my investments */}
                {user.role === 'investor' && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            My Investments (
                            {loading
                                ? '...'
                                : Object.keys(
                                      transactions.reduce((acc, tx) => {
                                          acc[tx.campaign] = true;
                                          return acc;
                                      }, {})
                                  ).length}
                            )
                        </h2>
                        {loading && <p className="text-gray-500 text-sm">Loading...</p>}
                        {!loading && transactions.length === 0 && (
                            <p className="text-gray-500 text-sm">
                                You haven't invested in any campaign yet.
                            </p>
                        )}
                        {!loading && transactions.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.values(
                                    transactions.reduce((acc, tx) => {
                                        if (!acc[tx.campaign]) {
                                            acc[tx.campaign] = {
                                                campaign_id: tx.campaign,
                                                campaign_name: tx.campaign_name,
                                                total: 0,
                                                count: 0,
                                            };
                                        }
                                        acc[tx.campaign].total += parseFloat(tx.amount);
                                        acc[tx.campaign].count += 1;
                                        return acc;
                                    }, {})
                                ).map((investment) => (
                                    <Link
                                        to={`/campaigns/${investment.campaign_id}`}
                                        key={investment.campaign_id}
                                        className="border border-gray-200 rounded-lg p-4 hover:border-indigo-200 hover:shadow-sm transition-all group"
                                    >
                                        <p className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors mb-1">
                                            {investment.campaign_name}
                                        </p>
                                        <p className="text-sm text-indigo-600 font-semibold">
                                            {investment.total.toFixed(2)} ETH invested
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {investment.count} transaction
                                            {investment.count > 1 ? 's' : ''}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
