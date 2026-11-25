import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    /* Function to handle the real-time content of the input field in the form */
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(formData.username, formData.password);
            navigate('/');
        } catch {
            setError('Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden px-4 py-12">
            <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
            <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[50rem] max-w-[120vw] -translate-x-1/2 rounded-full bg-accent-strong/30 blur-[130px]" aria-hidden="true" />
            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-gradient text-3xl font-semibold tracking-tight sm:text-4xl">Welcome back</h1>
                    <p className="mt-2 text-white/55">Sign in to your account</p>
                </div>

                <div className="glass p-6 sm:p-8">
                    {error && (
                        <div className="alert-error mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
                        <div>
                            <label htmlFor="username" className="field-label">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                autoComplete="username"
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
                                autoComplete="current-password"
                                required
                                className="field-input"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full py-3"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-white/50">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="font-medium text-accent hover:text-accent-soft"
                        >
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
