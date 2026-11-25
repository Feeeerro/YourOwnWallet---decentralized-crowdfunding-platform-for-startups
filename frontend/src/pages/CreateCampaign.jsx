import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Icon from '../components/Icon';
import { PageHeader } from '../components/ui';

export default function CreateCampaign() {
    const navigate = useNavigate();
    const { user } = useAuth();

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

    useEffect(() => {
        api.get('/startup/')
            .then((res) => {
                const myStartups = res.data.filter(
                    (s) => s.created_by === `${user.first_name} ${user.last_name} (${user.email})`
                );
                setStartups(myStartups);
                if (myStartups.length === 0)
                    setError('You have no startups yet. Create a startup first.');
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
            const res = await api.post('/campaign/', { ...formData, status: 'pending' });
            navigate(`/campaigns/${res.data.id}`);
        } catch (err) {
            const data = err.response?.data;
            if (data?.error) {
                if (data.error.includes('Cannot connect'))
                    setError('Cannot connect to the blockchain. Make sure Ganache is running.');
                else if (data.error.includes('Not enough judges'))
                    setError('Not enough judges registered. At least 3 judges are needed.');
                else setError(data.error);
            } else if (data) {
                const messages = Object.entries(data)
                    .map(
                        ([field, errors]) =>
                            `${field.replace('_', ' ')}: ${Array.isArray(errors) ? errors.join(', ') : errors}`
                    )
                    .join('\n');
                setError(messages);
            } else {
                setError('Failed to create campaign. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const inputClass = 'field-input';

    return (
        <div>
            <PageHeader title="Create Campaign" subtitle="Launch a new fundraising campaign" width="max-w-2xl" />

            <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
                <div className="glass p-6 sm:p-8">
                    {error && (
                        <div className="alert-error mb-6">
                            {error.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="campaign_name" className="field-label">
                                Campaign Name
                            </label>
                            <input
                                id="campaign_name"
                                name="campaign_name"
                                value={formData.campaign_name}
                                onChange={handleChange}
                                className={inputClass}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="field-label">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className={inputClass}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="target" className="field-label">
                                    Funding Target (ETH)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    id="target"
                                    name="target"
                                    value={formData.target}
                                    onChange={handleChange}
                                    className={inputClass}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="deadline" className="field-label">
                                    Deadline
                                </label>
                                <input
                                    type="date"
                                    id="deadline"
                                    name="deadline"
                                    value={formData.deadline}
                                    onChange={handleChange}
                                    className={inputClass}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="startup" className="field-label">
                                Startup
                            </label>
                            <select
                                id="startup"
                                name="startup"
                                value={formData.startup}
                                onChange={handleChange}
                                className={inputClass}
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

                        <div className="alert-warning flex gap-3">
                            <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
                            <p>
                                Creating a campaign will automatically deploy smart contracts on
                                the blockchain. This may take a few seconds.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full py-3"
                        >
                            {loading ? 'Creating... (deploying contracts)' : 'Create Campaign'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
