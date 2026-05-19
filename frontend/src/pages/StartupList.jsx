import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function StartupList() {
    const [startups, setStartups] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');

    useEffect(() => {
        api.get('/startup/')
            .then(res => setStartups(res.data))
            .catch(() => setError('Failed to load startups'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p style={styles.center}>Loading...</p>;
    if (error)   return <p style={styles.center}>{error}</p>;

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Startups</h1>
            {startups.length === 0 ? (
                <p style={styles.center}>No startups found.</p>
            ) : (
                <div style={styles.grid}>
                    {startups.map(startup => (
                        <Link to={`/startups/${startup.id}`} key={startup.id} style={styles.card}>
                            <h2 style={styles.cardTitle}>{startup.startup_name}</h2>
                            <p style={styles.cardMeta}>{startup.category} · {startup.country}</p>
                            <p style={styles.cardDescription}>{startup.description}</p>
                            <span style={{
                                ...styles.badge,
                                background: startup.status === 'active' ? '#d1fae5' : '#fef3c7',
                                color: startup.status === 'active' ? '#065f46' : '#92400e',
                            }}>
                                {startup.status}
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

const styles = {
    container:       { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
    title:           { marginBottom: '2rem', color: '#1e1b4b' },
    grid:            { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' },
    card:            { background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textDecoration: 'none', color: 'inherit', display: 'block' },
    cardTitle:       { marginBottom: '0.5rem', color: '#1e1b4b' },
    cardMeta:        { color: '#666', fontSize: '0.9rem', marginBottom: '0.75rem' },
    cardDescription: { color: '#444', fontSize: '0.95rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
    badge:           { padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 'bold' },
    center:          { textAlign: 'center', marginTop: '3rem', color: '#666' },
};