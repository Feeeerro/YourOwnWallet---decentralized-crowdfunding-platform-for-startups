import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function CampaignList() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState('');

    useEffect(() => {
        api.get('/campaign/')
            .then(res => setCampaigns(res.data))
            .catch(() => setError('Failed to load campaigns'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p style={styles.center}>Loading...</p>;
    if (error)   return <p style={styles.center}>{error}</p>;

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Campaigns</h1>
            {campaigns.length === 0 ? (
                <p style={styles.center}>No campaigns found.</p>
            ) : (
                <div style={styles.grid}>
                    {campaigns.map(campaign => (
                        <Link to={`/campaigns/${campaign.id}`} key={campaign.id} style={styles.card}>

                            {/* Header */}
                            <div style={styles.cardHeader}>
                                <h2 style={styles.cardTitle}>{campaign.campaign_name}</h2>
                                <span style={{
                                    ...styles.badge,
                                    background: campaign.status === 'active' ? '#d1fae5' : campaign.status === 'pending' ? '#fef3c7' : '#f3f4f6',
                                    color: campaign.status === 'active' ? '#065f46' : campaign.status === 'pending' ? '#92400e' : '#374151',
                                }}>
                                    {campaign.status}
                                </span>
                            </div>

                            {/* Startup name */}
                            <p style={styles.startup}>{campaign.startup_name}</p>

                            {/* Description */}
                            <p style={styles.description}>{campaign.description}</p>

                            {/* Progress bar */}
                            <div style={styles.progressBar}>
                                <div style={{
                                    ...styles.progressFill,
                                    width: `${Math.min((campaign.funded / campaign.target) * 100, 100)}%`
                                }} />
                            </div>

                            {/* Stats */}
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
    container:   { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
    title:       { marginBottom: '2rem', color: '#1e1b4b' },
    grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' },
    card:        { background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textDecoration: 'none', color: 'inherit', display: 'block' },
    cardHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' },
    cardTitle:   { color: '#1e1b4b', fontSize: '1.1rem' },
    badge:       { padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 'bold', whiteSpace: 'nowrap' },
    startup:     { color: '#4f46e5', fontSize: '0.9rem', marginBottom: '0.75rem' },
    description: { color: '#444', fontSize: '0.95rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
    progressBar: { background: '#e5e7eb', borderRadius: '999px', height: '8px', marginBottom: '0.75rem' },
    progressFill: { background: '#4f46e5', height: '100%', borderRadius: '999px' },
    stats:       { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666' },
    center:      { textAlign: 'center', marginTop: '3rem', color: '#666' },
};