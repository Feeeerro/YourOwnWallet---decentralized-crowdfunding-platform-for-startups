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
        <div className="relative flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden px-4 py-12">
            <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
            <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[50rem] max-w-[120vw] -translate-x-1/2 rounded-full bg-accent-strong/30 blur-[130px]" aria-hidden="true" />
            <div className="relative w-full max-w-lg">
                <div className="text-center mb-8">
                    <h1 className="text-gradient text-3xl font-semibold tracking-tight sm:text-4xl">Create an account</h1>
                    <p className="mt-2 text-white/55">Join the platform today</p>
                </div>

                <div className="glass p-6 sm:p-8">
                    {error && (
                        <div className="alert-error mb-6">
                            {error.split('\n').map((line, i) => (
                                <p key={i} className="mb-1">
                                    {line}
                                </p>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="first_name" className="field-label">
                                    First Name
                                </label>
                                <input
                                    id="first_name"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    required
                                    className="field-input"
                                />
                            </div>
                            <div>
                                <label htmlFor="last_name" className="field-label">
                                    Last Name
                                </label>
                                <input
                                    id="last_name"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    required
                                    className="field-input"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="username" className="field-label">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                className="field-input"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="field-label">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="field-input"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="field-label">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="field-input"
                            />
                        </div>

                        <div>
                            <label htmlFor="role" className="field-label">
                                Role
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="field-input"
                            >
                                <option value="investor">Investor</option>
                                <option value="startupper">Startupper</option>
                                <option value="judge">Judge</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="country" className="field-label">
                                    Country
                                </label>
                                <input
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="field-input"
                                />
                            </div>
                            <div>
                                <label htmlFor="city" className="field-label">
                                    City
                                </label>
                                <input
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="field-input"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phone" className="field-label">
                                Phone
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="field-input"
                            />
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
                                className="field-input"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full py-3"
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-white/50">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="font-medium text-accent hover:text-accent-soft"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
