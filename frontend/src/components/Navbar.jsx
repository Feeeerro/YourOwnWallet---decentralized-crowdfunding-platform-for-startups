import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate         = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={styles.nav}>
            <Link to="/" style={styles.brand}>YourOwnWallet</Link>
            <div style={styles.links}>
                <Link to="/startups" style={styles.link}>Startups</Link>
                <Link to="/campaigns" style={styles.link}>Campaigns</Link>
                {user ? (
                    <>
                        <Link to="/account" style={styles.link}>My Account</Link>
                        <button onClick={handleLogout} style={styles.button}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={styles.link}>Login</Link>
                        <Link to="/register" style={styles.linkButton}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

const styles = {
    nav:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#4f46e5', color: '#fff' },
    brand:      { color: '#fff', textDecoration: 'none', fontSize: '1.25rem', fontWeight: 'bold' },
    links:      { display: 'flex', alignItems: 'center', gap: '1.5rem' },
    link:       { color: '#fff', textDecoration: 'none' },
    linkButton: { textDecoration: 'none', background: '#fff', color: '#4f46e5', padding: '0.4rem 1rem', borderRadius: '4px', fontWeight: 'bold' },
    button:     { background: 'transparent', color: '#fff', border: '1px solid #fff', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer' },
};