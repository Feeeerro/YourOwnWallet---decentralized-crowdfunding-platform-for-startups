import Icon from './Icon';

export default function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange }) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    const base =
        'grid h-11 min-w-11 cursor-pointer place-items-center rounded-full px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-30';

    return (
        <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`${base} border border-white/10 text-white/70 hover:border-white/30 hover:text-white`}
                aria-label="Previous page"
            >
                <Icon name="chevron-left" />
            </button>

            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    aria-current={page === currentPage ? 'page' : undefined}
                    className={`${base} ${
                        page === currentPage
                            ? 'btn-primary'
                            : 'border border-white/10 text-white/70 hover:border-white/30 hover:text-white'
                    }`}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`${base} border border-white/10 text-white/70 hover:border-white/30 hover:text-white`}
                aria-label="Next page"
            >
                <Icon name="chevron-right" />
            </button>
        </nav>
    );
}
