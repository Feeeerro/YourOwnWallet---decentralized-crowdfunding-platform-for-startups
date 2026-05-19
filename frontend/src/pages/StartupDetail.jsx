import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function StartupDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [startup, setStartup]   = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');

    useEffect(() => {
        Promise.all([
            api.get(`/startup/${id}/`),
            api.get('/campaign/')
        ])
        .then(([startupRes, campaignsRes]) => {
            setStartup(startupRes.data);
            // filter campaigns belonging to this startup
            setCampaigns(campaignsRes.data.filter(c => c.startup === parseInt(id)));
        })
        .catch(() => setError('Failed to load startup'))
        .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <p style={styles.center}>Loading...</p>;
    if (error)   return <p style={styles.center}>{error}</p>;
    if (!startup) return <p style={styles.center}>Startup not found.</p>;

    return (
        <div style={styles.container}>

            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>{startup.startup_name}</h1>
                    <p style={styles.meta}>{startup.category} · {startup.country} · {startup.continent}</p>
                </div>
                <span style={{
                    ...styles.badge,
                    background: startup.status === 'active' ? '#d1fae5' : '#fef3c7',
                    color: startup.status === 'active' ? '#065f46' : '#92400e',
                }}>
                    {startup.status}
                </span>
                {/* Show create campaign button only to the startup owner */}
                {user && startup.created_by === `${user.first_name} ${user.last_name} (${user.email})` && (
                    <Link to="/campaigns/create" style={styles.createButton}>+ Create Campaign</Link>
                )}
            </div>

            {/* Details */}
            <div style={styles.card}>
                <h2 style={styles.sectionTitle}>About</h2>
                <p style={styles.description}>{startup.description}</p>
                <div style={styles.infoGrid}>
                    <div><strong>Address</strong><p>{startup.address}</p></div>
                    <div><strong>Created by</strong><p>{startup.created_by}</p></div>
                    <div><strong>Created at</strong><p>{new Date(startup.created_at).toLocaleDateString()}</p></div>
                </div>
            </div>

            {/* Campaigns */}
            <div style={styles.card}>
                <h2 style={styles.sectionTitle}>Campaigns</h2>
                {campaigns.length === 0 ? (
                    <p style={styles.empty}>No campaigns for this startup yet.</p>
                ) : (
                    <div style={styles.campaignGrid}>
                        {campaigns.map(campaign => (
                            <Link to={`/campaigns/${campaign.id}`} key={campaign.id} style={styles.campaignCard}>
                                <h3 style={styles.campaignTitle}>{campaign.campaign_name}</h3>
                                <p style={styles.campaignMeta}>
                                    Target: {campaign.target} ETH · Funded: {campaign.funded} ETH
                                </p>
                                <div style={styles.progressBar}>
                                    <div style={{
                                        ...styles.progressFill,
                                        width: `${Math.min((campaign.funded / campaign.target) * 100, 100)}%`
                                    }} />
                                </div>
                                <p style={styles.campaignMeta}>
                                    Deadline: {new Date(campaign.deadline).toLocaleDateString()}
                                </p>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}

const styles = {
    container:     { padding: '2rem', maxWidth: '900px', margin: '0 auto' },
    header:        { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' },
    title:         { color: '#1e1b4b', marginBottom: '0.5rem' },
    meta:          { color: '#666' },
    badge:         { padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.9rem', fontWeight: 'bold' },
    card:          { background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '1.5rem' },
    sectionTitle:  { color: '#1e1b4b', marginBottom: '1rem' },
    description:   { color: '#444', lineHeight: '1.6', marginBottom: '1.5rem' },
    infoGrid:      { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' },
    empty:         { color: '#666' },
    campaignGrid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' },
    campaignCard:  { background: '#f8f7ff', padding: '1rem', borderRadius: '6px', textDecoration: 'none', color: 'inherit', display: 'block' },
    campaignTitle: { color: '#1e1b4b', marginBottom: '0.5rem' },
    campaignMeta:  { color: '#666', fontSize: '0.85rem', marginBottom: '0.5rem' },
    progressBar:   { background: '#e5e7eb', borderRadius: '999px', height: '8px', marginBottom: '0.5rem' },
    progressFill:  { background: '#4f46e5', height: '100%', borderRadius: '999px', transition: 'width 0.3s' },
    center:        { textAlign: 'center', marginTop: '3rem', color: '#666' },
    headerRight:  { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' },
    createButton: { background: '#4f46e5', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', whiteSpace: 'nowrap' },  
};