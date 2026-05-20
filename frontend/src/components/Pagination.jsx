export default function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange }) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div style={styles.container}>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{ ...styles.button, ...(currentPage === 1 ? styles.disabled : {}) }}
            >
                ← Prev
            </button>

            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    style={{
                        ...styles.button,
                        ...(page === currentPage ? styles.active : {}),
                    }}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{ ...styles.button, ...(currentPage === totalPages ? styles.disabled : {}) }}
            >
                Next →
            </button>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.5rem',
        marginTop: '2rem',
    },
    button: {
        padding: '0.5rem 0.75rem',
        borderRadius: '6px',
        border: '1px solid #ccc',
        background: '#fff',
        cursor: 'pointer',
        fontSize: '0.9rem',
        color: '#4f46e5',
    },
    active: {
        background: '#4f46e5',
        color: '#fff',
        border: '1px solid #4f46e5',
        fontWeight: 'bold',
    },
    disabled: {
        color: '#ccc',
        cursor: 'not-allowed',
    },
};
