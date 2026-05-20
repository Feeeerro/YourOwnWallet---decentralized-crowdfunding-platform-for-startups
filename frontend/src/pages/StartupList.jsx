import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function StartupList() {
    const [startups, setStartups]         = useState([]);
    const [filtered, setFiltered]         = useState([]);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [categories, setCategories]     = useState([]);

    useEffect(() => {
        api.get('/startup/')
            .then(res => {
                setStartups(res.data);
                setFiltered(res.data);
                // extract unique categories from startups
                const unique = [...new Set(res.data.map(s => s.category).filter(Boolean))];
                setCategories(unique);
            })
            .catch(() => setError('Failed to load startups'))
            .finally(() => setLoading(false));
    }, []);

    // apply filters whenever they change
    useEffect(() => {
        let result = startups;

        if (statusFilter) {
            result = result.filter(s => s.status === statusFilter);
        }

        if (categoryFilter) {
            result = result.filter(s => s.category === categoryFilter);
        }

        setFiltered(result);
    }, [statusFilter, categoryFilter, startups]);

    const handleReset = () => {
        setStatusFilter('');
        setCategoryFilter('');
    };

    if (loading) return <p style={styles.center}>Loading...</p>;
    if (error)   return <p style={styles.center}>{error}</p>;

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Startups</h1>

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
                    <option value="inactive">Inactive</option>
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
                    {filtered.length} of {startups.length} startups
                </span>
            </div>

            {/* Startup list */}
            {filtered.length === 0 ? (
                <p style={styles.center}>No startups match your filters.</p>
            ) : (
                <div style={styles.grid}>
                    {filtered.map(startup => (
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
    title:           { marginBottom: '1.5rem', color: '#1e1b4b' },
    filters:         { display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' },
    select:          { padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.95rem', cursor: 'pointer' },
    resetButton:     { padding: '0.5rem 1rem', background: '#f3f4f6', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontSize: '0.95rem' },
    count:           { color: '#666', fontSize: '0.9rem', marginLeft: 'auto' },
    grid:            { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' },
    card:            { background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textDecoration: 'none', color: 'inherit', display: 'block' },
    cardTitle:       { marginBottom: '0.5rem', color: '#1e1b4b' },
    cardMeta:        { color: '#666', fontSize: '0.9rem', marginBottom: '0.75rem' },
    cardDescription: { color: '#444', fontSize: '0.95rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
    badge:           { padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 'bold' },
    center:          { textAlign: 'center', marginTop: '3rem', color: '#666' },
};