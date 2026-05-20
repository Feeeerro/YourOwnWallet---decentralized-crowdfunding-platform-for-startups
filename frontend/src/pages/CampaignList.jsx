import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function CampaignList() {
    const [campaigns, setCampaigns]       = useState([]);
    const [filtered, setFiltered]         = useState([]);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [categories, setCategories]     = useState([]);

    const getBadgeStyle = (status) => ({
        padding: '0.25rem 0.75rem',
        borderRadius: '999px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
        background: status === 'active' ? '#d1fae5'
                : status === 'pending' ? '#fef3c7'
                : status === 'completed' ? '#dbeafe'
                : status === 'failed' ? '#fee2e2'
                : status === 'rejected' ? '#f3f4f6'
                : '#f3f4f6',
        color: status === 'active' ? '#065f46'
            : status === 'pending' ? '#92400e'
            : status === 'completed' ? '#1e40af'
            : status === 'failed' ? '#991b1b'
            : status === 'rejected' ? '#374151'
            : '#374151',
    });

    useEffect(() => {
        api.get('/campaign/')
            .then(res => {
                setCampaigns(res.data);
                setFiltered(res.data);
                // extract unique categories from campaigns
                const unique = [...new Set(res.data.map(c => c.category).filter(Boolean))];
                setCategories(unique);
            })
            .catch(() => setError('Failed to load campaigns'))
            .finally(() => setLoading(false));
    }, []);

    // apply filters whenever they change
    useEffect(() => {
        let result = campaigns;

        if (statusFilter) {
            result = result.filter(c => c.status === statusFilter);
        }

        if (categoryFilter) {
            result = result.filter(c => c.category === categoryFilter);
        }

        setFiltered(result);
    }, [statusFilter, categoryFilter, campaigns]);

    const handleReset = () => {
        setStatusFilter('');
        setCategoryFilter('');
    };

    if (loading) return <p style={styles.center}>Loading...</p>;
    if (error)   return <p style={styles.center}>{error}</p>;

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Campaigns</h1>

            {/* Filters */}
            <div style={styles.filters}>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    style={styles.select}
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="failed">Failed</option>
                    <option value="rejected">Rejected</option>
                </select>

                <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    style={styles.select}
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                {(statusFilter || categoryFilter) && (
                    <button onClick={handleReset} style={styles.resetButton}>
                        Reset filters
                    </button>
                )}

                <span style={styles.count}>
                    {filtered.length} of {campaigns.length} campaigns
                </span>
            </div>

            {/* Campaign list */}
            {filtered.length === 0 ? (
                <p style={styles.center}>No campaigns match your filters.</p>
            ) : (
                <div style={styles.grid}>
                    {filtered.map(campaign => (
                        <Link to={`/campaigns/${campaign.id}`} key={campaign.id} style={styles.card}>
                            <div style={styles.cardHeader}>
                                <h2 style={styles.cardTitle}>{campaign.campaign_name}</h2>
                                <span style={getBadgeStyle(campaign.status)}>
                                    {campaign.status}
                                </span>
                            </div>
                            <p style={styles.startup}>{campaign.startup_name}</p>
                            <p style={styles.description}>{campaign.description}</p>
                            <div style={styles.progressBar}>
                                <div style={{
                                    ...styles.progressFill,
                                    width: `${Math.min((campaign.funded / campaign.target) * 100, 100)}%`
                                }} />
                            </div>
                            <div style={styles.stats}>
                                <span>{campaign.funded} / {campaign.target} ETH</span>
                                <span>Deadline: {new Date(campaign.deadline).toLocaleDateString()}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

const styles = {
    container:    { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
    title:        { marginBottom: '1.5rem', color: '#1e1b4b' },
    filters:      { display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' },
    select:       { padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.95rem', cursor: 'pointer' },
    resetButton:  { padding: '0.5rem 1rem', background: '#f3f4f6', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontSize: '0.95rem' },
    count:        { color: '#666', fontSize: '0.9rem', marginLeft: 'auto' },
    grid:         { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' },
    card:         { background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textDecoration: 'none', color: 'inherit', display: 'block' },
    cardHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' },
    cardTitle:    { color: '#1e1b4b', fontSize: '1.1rem' },
    badge:        { padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 'bold', whiteSpace: 'nowrap' },
    startup:      { color: '#4f46e5', fontSize: '0.9rem', marginBottom: '0.75rem' },
    description:  { color: '#444', fontSize: '0.95rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
    progressBar:  { background: '#e5e7eb', borderRadius: '999px', height: '8px', marginBottom: '0.75rem' },
    progressFill: { background: '#4f46e5', height: '100%', borderRadius: '999px' },
    stats:        { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666' },
    center:       { textAlign: 'center', marginTop: '3rem', color: '#666' },
};