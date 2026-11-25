import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Pagination from '../components/Pagination';
import StartupCard from '../components/StartupCard';
import Icon from '../components/Icon';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '../components/ui';
import { buildStartupStats } from '../lib/visuals';

const ITEMS_PER_PAGE = 12;

export default function StartupList() {
    const { user } = useAuth();
    const [startups, setStartups] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
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

        // campaign numbers are only used for the card stats: failures are not blocking
        api.get('/campaign/')
            .then((res) => setCampaigns(res.data))
            .catch(() => {});
    }, []);

    useEffect(() => {
        let result = startups;
        if (statusFilter) result = result.filter((s) => s.status === statusFilter);
        if (categoryFilter) result = result.filter((s) => s.category === categoryFilter);
        setFiltered(result);
        setCurrentPage(1);
    }, [statusFilter, categoryFilter, startups]);

    const statsById = useMemo(() => buildStartupStats(campaigns), [campaigns]);

    const handleReset = () => {
        setStatusFilter('');
        setCategoryFilter('');
    };

    const paginated = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    if (loading) return <LoadingState label="Loading startups..." />;
    if (error) return <ErrorState message={error} />;

    return (
        <div>
            <PageHeader
                eyebrow="Explore"
                title="Startups"
                subtitle="Discover innovative startups looking for investment"
                actions={
                    user?.role === 'startupper' && (
                        <Link to="/startups/create" className="btn btn-primary">
                            <Icon name="plus" />
                            Create Startup
                        </Link>
                    )
                }
            />

            <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
                {/* Filters */}
                <div className="glass mb-10 flex flex-wrap items-center gap-3 p-3">
                    <span className="hidden items-center gap-2 pl-2 text-sm text-white/50 sm:flex">
                        <Icon name="filter" />
                        Filter
                    </span>
                    <label className="sr-only" htmlFor="status-filter">
                        Status
                    </label>
                    <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="field-input w-auto min-w-40 cursor-pointer"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    <label className="sr-only" htmlFor="category-filter">
                        Category
                    </label>
                    <select
                        id="category-filter"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="field-input w-auto min-w-44 cursor-pointer"
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>

                    {(statusFilter || categoryFilter) && (
                        <button onClick={handleReset} className="btn btn-ghost py-2.5">
                            <Icon name="x" />
                            Reset filters
                        </button>
                    )}

                    <span className="ml-auto pr-2 text-sm text-white/50 tabular-nums">
                        {filtered.length} of {startups.length} startups
                    </span>
                </div>

                {/* Grid */}
                {filtered.length === 0 ? (
                    <EmptyState title="No startups match your filters." />
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {paginated.map((startup) => (
                                <StartupCard
                                    key={startup.id}
                                    startup={startup}
                                    stats={statsById[startup.id]}
                                />
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
