import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

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

    const inputClass =
        'w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gray-900 text-white">
                <div className="max-w-2xl mx-auto px-6 py-12">
                    <h1 className="text-4xl font-bold mb-2">Create Campaign</h1>
                    <p className="text-gray-400">Launch a new fundraising campaign</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 py-8">
                <div className="bg-white rounded-xl border border-gray-200 p-8">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                            {error.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Campaign Name
                            </label>
                            <input
                                name="campaign_name"
                                value={formData.campaign_name}
                                onChange={handleChange}
                                className={inputClass}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className={inputClass}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Funding Target (ETH)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    name="target"
                                    value={formData.target}
                                    onChange={handleChange}
                                    className={inputClass}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Deadline
                                </label>
                                <input
                                    type="date"
                                    name="deadline"
                                    value={formData.deadline}
                                    onChange={handleChange}
                                    className={inputClass}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Startup
                            </label>
                            <select
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

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <p className="text-amber-700 text-sm">
                                ⚠️ Creating a campaign will automatically deploy smart contracts on
                                the blockchain. This may take a few seconds.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
                        >
                            {loading ? 'Creating... (deploying contracts)' : 'Create Campaign'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
