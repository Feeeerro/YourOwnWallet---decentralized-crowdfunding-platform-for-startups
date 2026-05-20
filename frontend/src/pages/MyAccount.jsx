import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function MyAccount() {
    const { user } = useAuth();
    const [startups, setStartups] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [pendingCampaigns, setPendingCampaigns] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [startupRes, campaignRes, txRes] = await Promise.all([
                    api.get('/startup/'),
                    api.get('/campaign/'),
                    api.get('/transaction/'),
                ]);

                // filter user's own startups and campaigns
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

                // investor transactions
                setTransactions(txRes.data);

                // for judges: find pending campaigns they haven't voted on yet
                if (user.role === 'judge') {
                    const pendingList = campaignRes.data.filter((c) => c.status === 'pending');
                    const unvoted = [];
                    for (const campaign of pendingList) {
                        try {
                            const judgeRes = await api.get(
                                `/campaign/${campaign.id}/judge-status/`
                            );
                            if (!judgeRes.data.has_voted) {
                                unvoted.push(campaign);
                            }
                        } catch {
                            unvoted.push(campaign);
                        }
                    }
                    setPendingCampaigns(unvoted);
                }
            } catch {
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div style={styles.container}>
            {/* Profile section */}
            <div style={styles.card}>
                <div style={styles.accountHeader}>
                    <h1 style={styles.title}>My Account</h1>
                    {user.role === 'startupper' && (
                        <Link to="/startups/create" style={styles.createButton}>
                            + Create Startup
                        </Link>
                    )}
                </div>
                <div style={styles.profileGrid}>
                    <div style={styles.profileItem}>
                        <span style={styles.label}>Full Name</span>
                        <span>
                            {user.first_name} {user.last_name}
                        </span>
                    </div>
                    <div style={styles.profileItem}>
                        <span style={styles.label}>Username</span>
                        <span>{user.username}</span>
                    </div>
                    <div style={styles.profileItem}>
                        <span style={styles.label}>Email</span>
                        <span>{user.email}</span>
                    </div>
                    <div style={styles.profileItem}>
                        <span style={styles.label}>Role</span>
                        <span style={styles.badge}>{user.role}</span>
                    </div>
                    <div style={styles.profileItem}>
                        <span style={styles.label}>Country</span>
                        <span>{user.country || '—'}</span>
                    </div>
                    <div style={styles.profileItem}>
                        <span style={styles.label}>City</span>
                        <span>{user.city || '—'}</span>
                    </div>
                    <div style={styles.profileItem}>
                        <span style={styles.label}>Phone</span>
                        <span>{user.phone || '—'}</span>
                    </div>
                    <div style={styles.profileItem}>
                        <span style={styles.label}>Address</span>
                        <span>{user.address || '—'}</span>
                    </div>
                    <div style={{ ...styles.profileItem, gridColumn: '1 / -1' }}>
                        <span style={styles.label}>Wallet Address</span>
                        <span style={styles.wallet}>{user.wallet_address}</span>
                    </div>
                </div>
            </div>

            {/* Judge — pending campaigns to vote on */}
            {user.role === 'judge' && (
                <div style={styles.card}>
                    <h2 style={styles.sectionTitle}>
                        Campaigns Awaiting Your Vote ({loading ? '...' : pendingCampaigns.length})
                    </h2>
                    {loading && <p style={styles.empty}>Loading...</p>}
                    {!loading && pendingCampaigns.length === 0 && (
                        <p style={styles.empty}>No campaigns waiting for your vote.</p>
                    )}
                    {!loading && pendingCampaigns.length > 0 && (
                        <div style={styles.itemGrid}>
                            {pendingCampaigns.map((c) => (
                                <Link to={`/campaigns/${c.id}`} key={c.id} style={styles.item}>
                                    <strong style={styles.itemTitle}>{c.campaign_name}</strong>
                                    <span style={styles.itemMeta}>{c.startup_name}</span>
                                    <span style={styles.itemMeta}>Target: {c.target} ETH</span>
                                    <span
                                        style={{
                                            ...styles.statusBadge,
                                            background: '#fef3c7',
                                            color: '#92400e',
                                        }}
                                    >
                                        pending
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Startupper — my startups */}
            {user.role === 'startupper' && (
                <div style={styles.card}>
                    <h2 style={styles.sectionTitle}>My Startups ({startups.length})</h2>
                    {loading && <p style={styles.empty}>Loading...</p>}
                    {!loading && startups.length === 0 && (
                        <p style={styles.empty}>
                            You haven't created any startups yet.{' '}
                            <Link to="/startups/create" style={styles.inlineLink}>
                                Create your first one
                            </Link>
                        </p>
                    )}
                    {!loading && startups.length > 0 && (
                        <div style={styles.itemGrid}>
                            {startups.map((s) => (
                                <Link to={`/startups/${s.id}`} key={s.id} style={styles.item}>
                                    <strong style={styles.itemTitle}>{s.startup_name}</strong>
                                    <span style={styles.itemMeta}>{s.category}</span>
                                    <span
                                        style={{
                                            ...styles.statusBadge,
                                            background:
                                                s.status === 'active' ? '#d1fae5' : '#fef3c7',
                                            color: s.status === 'active' ? '#065f46' : '#92400e',
                                        }}
                                    >
                                        {s.status}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Startupper — my campaigns */}
            {user.role === 'startupper' && (
                <div style={styles.card}>
                    <h2 style={styles.sectionTitle}>My Campaigns ({campaigns.length})</h2>
                    {loading && <p style={styles.empty}>Loading...</p>}
                    {!loading && campaigns.length === 0 && (
                        <p style={styles.empty}>You haven't created any campaigns yet.</p>
                    )}
                    {!loading && campaigns.length > 0 && (
                        <div style={styles.itemGrid}>
                            {campaigns.map((c) => (
                                <Link to={`/campaigns/${c.id}`} key={c.id} style={styles.item}>
                                    <strong style={styles.itemTitle}>{c.campaign_name}</strong>
                                    <span style={styles.itemMeta}>
                                        {c.funded} / {c.target} ETH
                                    </span>
                                    <span
                                        style={{
                                            ...styles.statusBadge,
                                            background:
                                                c.status === 'active'
                                                    ? '#d1fae5'
                                                    : c.status === 'completed'
                                                      ? '#dbeafe'
                                                      : c.status === 'failed'
                                                        ? '#fee2e2'
                                                        : '#fef3c7',
                                            color:
                                                c.status === 'active'
                                                    ? '#065f46'
                                                    : c.status === 'completed'
                                                      ? '#1e40af'
                                                      : c.status === 'failed'
                                                        ? '#991b1b'
                                                        : '#92400e',
                                        }}
                                    >
                                        {c.status}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Investor — campaigns where they invested */}
            {user.role === 'investor' && (
                <div style={styles.card}>
                    <h2 style={styles.sectionTitle}>
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
                    {loading && <p style={styles.empty}>Loading...</p>}
                    {!loading && transactions.length === 0 && (
                        <p style={styles.empty}>You haven't invested in any campaign yet.</p>
                    )}
                    {!loading && transactions.length > 0 && (
                        <div style={styles.itemGrid}>
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
                                    style={styles.item}
                                >
                                    <strong style={styles.itemTitle}>
                                        {investment.campaign_name}
                                    </strong>
                                    <span style={styles.itemMeta}>
                                        Total invested: {investment.total.toFixed(2)} ETH
                                    </span>
                                    <span style={styles.itemMeta}>
                                        {investment.count} transaction
                                        {investment.count > 1 ? 's' : ''}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

const styles = {
    container: { padding: '2rem', maxWidth: '900px', margin: '0 auto' },
    card: {
        background: '#fff',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '1.5rem',
    },
    accountHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
    },
    title: { color: '#1e1b4b' },
    sectionTitle: { color: '#1e1b4b', marginBottom: '1rem' },
    profileGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' },
    profileItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
    label: {
        fontSize: '0.8rem',
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    badge: {
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        background: '#ede9fe',
        color: '#4f46e5',
        borderRadius: '999px',
        fontSize: '0.85rem',
        fontWeight: 'bold',
        width: 'fit-content',
    },
    wallet: {
        fontFamily: 'monospace',
        fontSize: '0.85rem',
        color: '#4f46e5',
        wordBreak: 'break-all',
    },
    createButton: {
        background: '#4f46e5',
        color: '#fff',
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        textDecoration: 'none',
        fontWeight: 'bold',
    },
    itemGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1rem',
    },
    item: {
        background: '#f8f7ff',
        padding: '1rem',
        borderRadius: '6px',
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    itemTitle: { color: '#1e1b4b', fontSize: '0.95rem' },
    itemMeta: { color: '#666', fontSize: '0.85rem' },
    statusBadge: {
        padding: '0.2rem 0.6rem',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        width: 'fit-content',
    },
    inlineLink: { color: '#4f46e5', textDecoration: 'none' },
    empty: { color: '#666' },
};
