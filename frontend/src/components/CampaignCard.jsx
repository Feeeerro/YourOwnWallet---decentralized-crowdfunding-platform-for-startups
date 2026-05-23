import { Link } from 'react-router-dom';

const getBadgeClass = (status) => {
    switch (status) {
        case 'active':
            return 'bg-emerald-100 text-emerald-700';
        case 'pending':
            return 'bg-amber-100 text-amber-700';
        case 'completed':
            return 'bg-blue-100 text-blue-700';
        case 'failed':
            return 'bg-red-100 text-red-700';
        case 'rejected':
            return 'bg-gray-100 text-gray-600';
        default:
            return 'bg-gray-100 text-gray-600';
    }
};

export default function CampaignCard({ campaign }) {
    const progress = Math.min((campaign.funded / campaign.target) * 100, 100);

    return (
        <Link
            to={`/campaigns/${campaign.id}`}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-indigo-200 transition-all group flex flex-col"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors flex-1 mr-2">
                    {campaign.campaign_name}
                </h2>
                <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${getBadgeClass(campaign.status)}`}
                >
                    {campaign.status}
                </span>
            </div>

            {/* Startup name */}
            <p className="text-sm text-indigo-600 font-medium mb-3">{campaign.startup_name}</p>

            {/* Description */}
            <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{campaign.description}</p>

            {/* Progress bar */}
            <div className="bg-gray-100 rounded-full h-1.5 mb-3">
                <div
                    className="bg-indigo-600 h-1.5 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Stats */}
            <div className="flex justify-between text-xs text-gray-500">
                <span>
                    {campaign.funded} / {campaign.target} ETH
                </span>
                <span>{new Date(campaign.deadline).toLocaleDateString()}</span>
            </div>
        </Link>
    );
}
