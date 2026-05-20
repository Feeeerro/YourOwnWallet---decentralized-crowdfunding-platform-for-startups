import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const { user } = useAuth();

    return (
        <div style={styles.container}>
            <div style={styles.hero}>
                <h1 style={styles.title}>Welcome to YourOwnWallet</h1>
                <p style={styles.subtitle}>
                    A decentralized crowdfunding platform where startups meet investors.
                </p>
                <div style={styles.buttons}>
                    <Link to="/campaigns" style={styles.primaryButton}>
                        Browse Campaigns
                    </Link>
                    <Link to="/startups" style={styles.secondaryButton}>
                        Browse Startups
                    </Link>
                </div>
                {!user && (
                    <p style={styles.cta}>
                        <Link to="/register">Create an account</Link> to start investing or
                        launching your startup.
                    </p>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        padding: '2rem',
    },
    hero: { textAlign: 'center', maxWidth: '600px' },
    title: { fontSize: '2.5rem', marginBottom: '1rem', color: '#1e1b4b' },
    subtitle: { fontSize: '1.2rem', color: '#666', marginBottom: '2rem' },
    buttons: { display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem' },
    primaryButton: {
        background: '#4f46e5',
        color: '#fff',
        padding: '0.75rem 2rem',
        borderRadius: '6px',
        textDecoration: 'none',
        fontWeight: 'bold',
    },
    secondaryButton: {
        background: '#fff',
        color: '#4f46e5',
        padding: '0.75rem 2rem',
        borderRadius: '6px',
        textDecoration: 'none',
        fontWeight: 'bold',
        border: '2px solid #4f46e5',
    },
    cta: { color: '#666', marginTop: '1rem' },
};
