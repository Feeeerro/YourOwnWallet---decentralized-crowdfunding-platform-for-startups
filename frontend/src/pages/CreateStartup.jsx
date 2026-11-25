import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { PageHeader } from '../components/ui';

const CATEGORIES = [
    'Technology',
    'Finance',
    'Healthcare',
    'Education',
    'Energy',
    'Food & Beverage',
    'Real Estate',
    'Retail',
    'Transportation',
    'Entertainment',
    'Agriculture',
    'Manufacturing',
    'Other',
];

const COUNTRIES = [
    'Afghanistan',
    'Albania',
    'Algeria',
    'Argentina',
    'Australia',
    'Austria',
    'Belgium',
    'Brazil',
    'Canada',
    'Chile',
    'China',
    'Colombia',
    'Croatia',
    'Czech Republic',
    'Denmark',
    'Egypt',
    'Finland',
    'France',
    'Germany',
    'Greece',
    'Hungary',
    'India',
    'Indonesia',
    'Iran',
    'Iraq',
    'Ireland',
    'Israel',
    'Italy',
    'Japan',
    'Jordan',
    'Kenya',
    'Malaysia',
    'Mexico',
    'Morocco',
    'Netherlands',
    'New Zealand',
    'Nigeria',
    'Norway',
    'Pakistan',
    'Peru',
    'Philippines',
    'Poland',
    'Portugal',
    'Romania',
    'Russia',
    'Saudi Arabia',
    'Serbia',
    'Singapore',
    'South Africa',
    'South Korea',
    'Spain',
    'Sweden',
    'Switzerland',
    'Thailand',
    'Turkey',
    'Ukraine',
    'United Arab Emirates',
    'United Kingdom',
    'United States',
    'Vietnam',
];

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

    const inputClass = 'field-input';

    return (
        <div>
            <PageHeader title="Create Startup" subtitle="Register your startup on the platform" width="max-w-2xl" />

            <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
                <div className="glass p-6 sm:p-8">
                    {error && (
                        <div className="alert-error mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="startup_name" className="field-label">
                                Startup Name
                            </label>
                            <input
                                id="startup_name"
                                name="startup_name"
                                value={formData.startup_name}
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

                        <div>
                            <label htmlFor="category" className="field-label">
                                Category
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className={inputClass}
                                required
                            >
                                <option value="">Select a category</option>
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="country" className="field-label">
                                    Country
                                </label>
                                <select
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className={inputClass}
                                    required
                                >
                                    <option value="">Select a country</option>
                                    {COUNTRIES.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="continent" className="field-label">
                                    Continent
                                </label>
                                <select
                                    id="continent"
                                    name="continent"
                                    value={formData.continent}
                                    onChange={handleChange}
                                    className={inputClass}
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

                        <div>
                            <label htmlFor="address" className="field-label">
                                Address
                            </label>
                            <input
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className={inputClass}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="status" className="field-label">
                                Status
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="pending">Pending</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full py-3"
                        >
                            {loading ? 'Creating...' : 'Create Startup'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
