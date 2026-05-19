import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function MyAccount() {
    const { user, logout } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState('');

    useEffect(() => {
        api.get('/transaction/')
            .then(res => setTransactions(res.data))
            .catch(() => setError('Failed to load transactions'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={styles.container}>

            {/* Profile section */}
            <div style={styles.card}>
                <h1 style={styles.title}>My Account</h1>
                <div style={styles.profileGrid}>
                    <div style={styles.profileItem}>
                        <span style={styles.label}>Full Name</span>
                        <span>{user.first_name} {user.last_name}</span>
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

            {/* Transaction history */}
            <div style={styles.card}>
                <h2 style={styles.sectionTitle}>My Transactions</h2>
                {loading && <p style={styles.empty}>Loading...</p>}
                {error   && <p style={styles.empty}>{error}</p>}
                {!loading && !error && transactions.length === 0 && (
                    <p style={styles.empty}>No transactions yet.</p>
                )}
                {!loading && transactions.length > 0 && (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Campaign</th>
                                <th style={styles.th}>Amount</th>
                                <th style={styles.th}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(tx => (
                                <tr key={tx.id}>
                                    <td style={styles.td}>{tx.campaign_name}</td>
                                    <td style={styles.td}>{tx.amount} ETH</td>
                                    <td style={styles.td}>{new Date(tx.date).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

        </div>
    );
}

const styles = {
    container:   { padding: '2rem', maxWidth: '900px', margin: '0 auto' },
    card:        { background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '1.5rem' },
    title:       { color: '#1e1b4b', marginBottom: '1.5rem' },
    sectionTitle: { color: '#1e1b4b', marginBottom: '1rem' },
    profileGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' },
    profileItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
    label:       { fontSize: '0.8rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' },
    badge:       { display: 'inline-block', padding: '0.25rem 0.75rem', background: '#ede9fe', color: '#4f46e5', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 'bold', width: 'fit-content' },
    wallet:      { fontFamily: 'monospace', fontSize: '0.85rem', color: '#4f46e5', wordBreak: 'break-all' },
    table:       { width: '100%', borderCollapse: 'collapse' },
    th:          { textAlign: 'left', padding: '0.75rem', borderBottom: '2px solid #e5e7eb', color: '#1e1b4b' },
    td:          { padding: '0.75rem', borderBottom: '1px solid #e5e7eb', color: '#444' },
    empty:       { color: '#666' },
};