import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function CreateCampaign() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        campaign_name: '',
        description: '',
        target: '',
        deadline: '',
        startup: '',
    });
    const [startups, setStartups] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Load the user's startups to populate the dropdown
    useEffect(() => {
        api.get('/startup/')
            .then((res) => {
                // filter only startups owned by the current user
                const myStartups = res.data.filter(
                    (s) => s.created_by === `${user.first_name} ${user.last_name} (${user.email})`
                );
                setStartups(myStartups);
                if (myStartups.length === 0) {
                    setError('You have no startups yet. Create a startup first.');
                }
            })
            .catch(() => setError('Failed to load startups'));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/campaign/', {
                ...formData,
                status: 'pending',
            });
            navigate(`/campaigns/${res.data.id}`);
        } catch (err) {
            const data = err.response?.data;
            if (data?.error) {
                // blockchain error
                if (data.error.includes('Cannot connect')) {
                    setError('Cannot connect to the blockchain. Make sure Ganache is running.');
                } else if (data.error.includes('Not enough judges')) {
                    setError(
                        'Not enough judges registered. At least 3 judges are needed to create a campaign.'
                    );
                } else {
                    setError(data.error);
                }
            } else if (data) {
                const messages = Object.entries(data)
                    .map(([field, errors]) => {
                        const fieldName = field.replace('_', ' ');
                        const errorText = Array.isArray(errors) ? errors.join(', ') : errors;
                        return `${fieldName}: ${errorText}`;
                    })
                    .join('\n');
                setError(messages);
            } else {
                setError('Failed to create campaign. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Create Campaign</h1>
                {error && <p style={styles.error}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div style={styles.field}>
                        <label>Campaign Name</label>
                        <input
                            name="campaign_name"
                            value={formData.campaign_name}
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
                    <div style={styles.row}>
                        <div style={styles.field}>
                            <label>Funding Target (ETH)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                name="target"
                                value={formData.target}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                        </div>
                        <div style={styles.field}>
                            <label>Deadline</label>
                            <input
                                type="date"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                        </div>
                    </div>
                    <div style={styles.field}>
                        <label>Startup</label>
                        <select
                            name="startup"
                            value={formData.startup}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        >
                            <option value="">Select a startup</option>
                            {startups.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.startup_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" style={styles.button} disabled={loading}>
                        {loading ? 'Creating... (deploying contracts)' : 'Create Campaign'}
                    </button>
                    <p style={styles.note}>
                        * Creating a campaign will automatically deploy smart contracts on the
                        blockchain. This may take a few seconds.
                    </p>
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
    note: { color: '#666', fontSize: '0.85rem', marginTop: '0.75rem', textAlign: 'center' },
};
