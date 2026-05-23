import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Pagination from '../components/Pagination';
import StartupCard from '../components/StartupCard';

const ITEMS_PER_PAGE = 12;

export default function StartupList() {
    const [startups, setStartups] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        api.get('/startup/')
            .then((res) => {
                setStartups(res.data);
                setFiltered(res.data);
                const unique = [...new Set(res.data.map((s) => s.category).filter(Boolean))];
                setCategories(unique);
            })
            .catch(() => setError('Failed to load startups'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        let result = startups;
        if (statusFilter) result = result.filter((s) => s.status === statusFilter);
        if (categoryFilter) result = result.filter((s) => s.category === categoryFilter);
        setFiltered(result);
        setCurrentPage(1);
    }, [statusFilter, categoryFilter, startups]);

    const handleReset = () => {
        setStatusFilter('');
        setCategoryFilter('');
    };

    const paginated = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    if (loading)
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Loading startups...</p>
            </div>
        );

    if (error)
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-red-500">{error}</p>
            </div>
        );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <h1 className="text-4xl font-bold mb-2">Startups</h1>
                    <p className="text-gray-400">
                        Discover innovative startups looking for investment
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8 flex flex-wrap gap-4 items-center">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>

                    {(statusFilter || categoryFilter) && (
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                        >
                            Reset filters
                        </button>
                    )}

                    <span className="ml-auto text-sm text-gray-500">
                        {filtered.length} of {startups.length} startups
                    </span>
                </div>

                {/* Grid */}
                {filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500">No startups match your filters.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginated.map((startup) => (
                                <StartupCard key={startup.id} startup={startup} />
                            ))}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalItems={filtered.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
