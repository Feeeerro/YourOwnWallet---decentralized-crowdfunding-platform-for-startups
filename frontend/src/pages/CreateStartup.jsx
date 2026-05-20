import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function CreateStartup() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        startup_name: '',
        country: '',
        continent: '',
        address: '',
        description: '',
        category: '',
        status: 'pending',
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
            const res = await api.post('/startup/', formData);
            navigate(`/startups/${res.data.id}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create startup');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Create Startup</h1>
                {error && <p style={styles.error}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div style={styles.field}>
                        <label>Startup Name</label>
                        <input
                            name="startup_name"
                            value={formData.startup_name}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                    </div>
                    <div style={styles.field}>
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            style={styles.textarea}
                            rows={4}
                            required
                        />
                    </div>
                    <div style={styles.field}>
                        <label>Category</label>
                        <input
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                    </div>
                    <div style={styles.row}>
                        <div style={styles.field}>
                            <label>Country</label>
                            <input
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                        </div>
                        <div style={styles.field}>
                            <label>Continent</label>
                            <select
                                name="continent"
                                value={formData.continent}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            >
                                <option value="">Select continent</option>
                                <option value="africa">Africa</option>
                                <option value="antarctica">Antarctica</option>
                                <option value="asia">Asia</option>
                                <option value="europe">Europe</option>
                                <option value="north_america">North America</option>
                                <option value="oceania">Oceania</option>
                                <option value="south_america">South America</option>
                            </select>
                        </div>
                    </div>
                    <div style={styles.field}>
                        <label>Address</label>
                        <input
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                    </div>
                    <div style={styles.field}>
                        <label>Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            style={styles.input}
                        >
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <button type="submit" style={styles.button} disabled={loading}>
                        {loading ? 'Creating...' : 'Create Startup'}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', padding: '2rem' },
    card: {
        background: '#fff',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '600px',
    },
    title: { color: '#1e1b4b', marginBottom: '1.5rem' },
    field: { marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
    row: { display: 'flex', gap: '1rem' },
    input: { padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' },
    textarea: {
        padding: '0.5rem',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '1rem',
        resize: 'vertical',
    },
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
    error: { color: 'red', marginBottom: '1rem' },
};
