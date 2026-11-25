import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import CampaignCard from '../components/CampaignCard';
import StartupCard from '../components/StartupCard';
import Icon from '../components/Icon';
import { PageHeader } from '../components/ui';

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


    return (
        <div>
            <PageHeader
                eyebrow="My Account"
                title={`${user.first_name} ${user.last_name}`}
                subtitle={user.email}
                width="max-w-5xl"
                actions={
                    <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent-soft capitalize">
                        <Icon name="user" />
                        {user.role}
                    </span>
                }
            />

            <div className="mx-auto max-w-5xl space-y-6 px-5 py-10 sm:px-8">
                {/* Profile info */}
                <div className="glass p-6 md:p-7">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-white">Profile</h2>
                        {user.role === 'startupper' && (
                            <Link
                                to="/startups/create"
                                className="btn btn-primary px-5 py-2"
                            >
                                <Icon name="plus" />
                                Create Startup
                            </Link>
                        )}
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                        <div>
                            <p className="eyebrow mb-1.5">
                                Username
                            </p>
                            <p className="text-sm font-medium text-white/90">{user.username}</p>
                        </div>
                        <div>
                            <p className="eyebrow mb-1.5">
                                Country
                            </p>
                            <p className="text-sm text-white/85">{user.country || '—'}</p>
                        </div>
                        <div>
                            <p className="eyebrow mb-1.5">
                                City
                            </p>
                            <p className="text-sm text-white/85">{user.city || '—'}</p>
                        </div>
                        <div>
                            <p className="eyebrow mb-1.5">
                                Phone
                            </p>
                            <p className="text-sm text-white/85">{user.phone || '—'}</p>
                        </div>
                        <div>
                            <p className="eyebrow mb-1.5">
                                Address
                            </p>
                            <p className="text-sm text-white/85">{user.address || '—'}</p>
                        </div>
                        <div className="sm:col-span-2 md:col-span-3">
                            <p className="eyebrow mb-1.5">
                                Wallet Address
                            </p>
                            <p className="font-mono text-sm break-all text-accent-soft">
                                {user.wallet_address}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Judge — pending campaigns */}
                {user.role === 'judge' && (
                    <div className="glass p-6 md:p-7">
                        <h2 className="text-lg font-semibold text-white mb-4">
                            Campaigns Awaiting Your Vote (
                            {loading ? '...' : pendingCampaigns.length})
                        </h2>
                        {loading && <p className="text-sm text-white/50">Loading...</p>}
                        {!loading && pendingCampaigns.length === 0 && (
                            <p className="text-sm text-white/50">
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
                    <div className="glass p-6 md:p-7">
                        <h2 className="text-lg font-semibold text-white mb-4">
                            My Startups ({startups.length})
                        </h2>
                        {loading && <p className="text-sm text-white/50">Loading...</p>}
                        {!loading && startups.length === 0 && (
                            <p className="text-sm text-white/50">
                                You haven't created any startups yet.{' '}
                                <Link
                                    to="/startups/create"
                                    className="text-accent hover:text-accent-soft"
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
                    <div className="glass p-6 md:p-7">
                        <h2 className="text-lg font-semibold text-white mb-4">
                            My Campaigns ({campaigns.length})
                        </h2>
                        {loading && <p className="text-sm text-white/50">Loading...</p>}
                        {!loading && campaigns.length === 0 && (
                            <p className="text-sm text-white/50">
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
                    <div className="glass p-6 md:p-7">
                        <h2 className="text-lg font-semibold text-white mb-4">
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
                        {loading && <p className="text-sm text-white/50">Loading...</p>}
                        {!loading && transactions.length === 0 && (
                            <p className="text-sm text-white/50">
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
                                        className="glass glass-hover group block p-5"
                                    >
                                        <p className="mb-1 font-medium text-white transition-colors group-hover:text-accent-soft">
                                            {investment.campaign_name}
                                        </p>
                                        <p className="text-sm font-semibold text-accent">
                                            {investment.total.toFixed(2)} ETH invested
                                        </p>
                                        <p className="mt-1 text-xs text-white/45">
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
