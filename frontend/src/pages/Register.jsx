import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
        country: '',
        city: '',
        address: '',
        role: 'investor',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(formData);
            navigate('/');
        } catch (err) {
            const data = err.response?.data;
            if (data) {
                // collect all field errors into one message
                const messages = Object.entries(data)
                    .map(([field, errors]) => {
                        const fieldName = field.replace('_', ' ');
                        const errorText = Array.isArray(errors) ? errors.join(', ') : errors;
                        return `${fieldName}: ${errorText}`;
                    })
                    .join('\n');
                setError(messages);
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Register</h2>
                {error && (
                    <div style={styles.error}>
                        {error.split('\n').map((line, i) => (
                            <p key={i} style={{ margin: '2px 0' }}>
                                {line}
                            </p>
                        ))}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div style={styles.row}>
                        <div style={styles.field}>
                            <label>First Name</label>
                            <input
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                        </div>
                        <div style={styles.field}>
                            <label>Last Name</label>
                            <input
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                        </div>
                    </div>
                    <div style={styles.field}>
                        <label>Username</label>
                        <input
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                    </div>
                    <div style={styles.field}>
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                    </div>
                    <div style={styles.field}>
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                    </div>
                    <div style={styles.field}>
                        <label>Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            style={styles.input}
                        >
                            <option value="investor">Investor</option>
                            <option value="startupper">Startupper</option>
                            <option value="judge">Judge</option>
                        </select>
                    </div>
                    <div style={styles.row}>
                        <div style={styles.field}>
                            <label>Country</label>
                            <input
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.field}>
                            <label>City</label>
                            <input
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        </div>
                    </div>
                    <div style={styles.field}>
                        <label>Phone</label>
                        <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.field}>
                        <label>Address</label>
                        <input
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            style={styles.input}
                        />
                    </div>
                    <button type="submit" style={styles.button} disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <p style={styles.link}>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
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
        padding: '2rem 0',
    },
    card: {
        background: '#fff',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '500px',
    },
    title: { marginBottom: '1.5rem', textAlign: 'center' },
    field: { marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
    row: { display: 'flex', gap: '1rem' },
    input: { padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' },
    button: {
        width: '100%',
        padding: '0.75rem',
        background: '#4f46e5',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        cursor: 'pointer',
        marginTop: '1rem',
    },
    error: { color: 'red', marginBottom: '1rem', textAlign: 'center' },
    link: { textAlign: 'center', marginTop: '1rem' },
};
