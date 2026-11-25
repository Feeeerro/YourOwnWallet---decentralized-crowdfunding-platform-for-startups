import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Pagination from '../components/Pagination';
import CampaignCard from '../components/CampaignCard';
import Icon from '../components/Icon';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '../components/ui';

const ITEMS_PER_PAGE = 12;

export default function CampaignList() {
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        api.get('/campaign/')
            .then((res) => {
                setCampaigns(res.data);
                setFiltered(res.data);
                const unique = [...new Set(res.data.map((c) => c.category).filter(Boolean))];
                setCategories(unique);
            })
            .catch(() => setError('Failed to load campaigns'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        let result = campaigns;
        if (statusFilter) result = result.filter((c) => c.status === statusFilter);
        if (categoryFilter) result = result.filter((c) => c.category === categoryFilter);
        setFiltered(result);
        setCurrentPage(1);
    }, [statusFilter, categoryFilter, campaigns]);

    const handleReset = () => {
        setStatusFilter('');
        setCategoryFilter('');
    };

    const paginated = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    if (loading) return <LoadingState label="Loading campaigns..." />;
    if (error) return <ErrorState message={error} />;

    return (
        <div>
            <PageHeader
                eyebrow="Invest"
                title="Campaigns"
                subtitle="Browse and invest in blockchain-verified campaigns"
                actions={
                    user?.role === 'startupper' && (
                        <Link to="/campaigns/create" className="btn btn-primary">
                            <Icon name="plus" />
                            Create Campaign
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
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                        <option value="rejected">Rejected</option>
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
                        {filtered.length} of {campaigns.length} campaigns
                    </span>
                </div>

                {/* Grid */}
                {filtered.length === 0 ? (
                    <EmptyState title="No campaigns match your filters." />
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {paginated.map((campaign) => (
                                <CampaignCard key={campaign.id} campaign={campaign} />
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
