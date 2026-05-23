import { Link } from 'react-router-dom';

export default function StartupCard({ startup }) {
    return (
        <Link
            to={`/startups/${startup.id}`}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-indigo-200 transition-all group"
        >
            <div className="flex justify-between items-start mb-3">
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {startup.startup_name}
                </h2>
                <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        startup.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                    }`}
                >
                    {startup.status}
                </span>
            </div>
            <p className="text-sm text-indigo-600 font-medium mb-2">
                {startup.category} · {startup.country}
            </p>
            <p className="text-sm text-gray-500 line-clamp-3">{startup.description}</p>
        </Link>
    );
}
