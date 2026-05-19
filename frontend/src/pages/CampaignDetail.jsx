import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function CampaignDetail() {
    const { id } = useParams();
    const { user } = useAuth();

    const [campaign, setCampaign]         = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState('');
    const [fundAmount, setFundAmount]     = useState('');
    const [fundLoading, setFundLoading]   = useState(false);
    const [fundError, setFundError]       = useState('');
    const [fundSuccess, setFundSuccess]   = useState('');
    const [approveLoading, setApproveLoading] = useState(false);
    const [approveMessage, setApproveMessage] = useState('');
    const [judgeVoted, setJudgeVoted] = useState(false);
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [withdrawMessage, setWithdrawMessage] = useState('');
    const [refundLoading, setRefundLoading] = useState(false);
    const [refundMessage, setRefundMessage] = useState('');

    const fetchData = async () => {
        try {
            const [campaignRes, transactionsRes] = await Promise.all([
                api.get(`/campaign/${id}/`),
                api.get(`/transaction/campaign/${id}/`)
            ]);
            
            const campaignData = campaignRes.data;
            setCampaign(campaignData);
            setTransactions(transactionsRes.data);

            // auto-finalize if deadline passed and campaign is still active
            if (campaignData.status === 'active') {
                const now = new Date();
                const deadline = new Date(campaignData.deadline);
                if (now >= deadline) {
                    try {
                        await api.post(`/campaign/${id}/finalize/`);
                        // refresh after finalization
                        const updated = await api.get(`/campaign/${id}/`);
                        setCampaign(updated.data);
                    } catch (err) {
                        // finalization might fail if already finalized — ignore silently
                        console.log('Auto-finalize:', err.response?.data?.error);
                    }
                }
            }
        } catch {
            setError('Failed to load campaign');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [id]);

    const handleFund = async (e) => {
        e.preventDefault();
        setFundError('');
        setFundSuccess('');
        setFundLoading(true);
        try {
            await api.post(`/campaign/${id}/fund/`, { amount: fundAmount });
            setFundSuccess(`Successfully funded ${fundAmount} ETH!`);
            setFundAmount('');
            fetchData();
        } catch (err) {
            const data = err.response?.data;
            if (data?.error) {
                if (data.error.includes('Campaign is not active')) {
                    setFundError('This campaign is not active yet.');
                } else if (data.error.includes('deadline')) {
                    setFundError('This campaign has passed its deadline.');
                } else if (data.error.includes('Cannot connect')) {
                    setFundError('Cannot connect to the blockchain. Make sure Ganache is running.');
                } else {
                    setFundError(data.error);
                }
            } else {
                setFundError('Funding failed. Please try again.');
            }
        } finally {
            setFundLoading(false);
        }
    };

    const handleApprove = async () => {
        setApproveMessage('');
        setApproveLoading(true);
        try {
            const res = await api.post(`/campaign/${id}/approve/`);
            setApproveMessage(`✓ ${res.data.message} (${res.data.approval_count}/3 approvals)`);
            setJudgeVoted(true);
            fetchData();
        } catch (err) {
            const data = err.response?.data;
            if (data?.error) {
                if (data.error.includes('Already approved')) {
                    setApproveMessage('✗ You have already approved this campaign.');
                    setJudgeVoted(true);
                } else if (data.error.includes('not pending')) {
                    setApproveMessage('✗ This campaign is no longer pending.');
                } else {
                    setApproveMessage(`✗ ${data.error}`);
                }
            } else {
                setApproveMessage('✗ Approval failed. Please try again.');
            }
        } finally {
            setApproveLoading(false);
        }
    };

    const handleReject = async () => {
        setApproveMessage('');
        setApproveLoading(true);
        try {
            const res = await api.post(`/campaign/${id}/reject/`);
            setApproveMessage(`✓ ${res.data.message}`);
            setJudgeVoted(true);
            fetchData();
        } catch (err) {
            const data = err.response?.data;
            if (data?.error) {
                if (data.error.includes('Already rejected')) {
                    setApproveMessage('✗ This campaign has already been rejected.');
                } else if (data.error.includes('not pending')) {
                    setApproveMessage('✗ This campaign is no longer pending.');
                } else {
                    setApproveMessage(`✗ ${data.error}`);
                }
            } else {
                setApproveMessage('✗ Rejection failed. Please try again.');
            }
        } finally {
            setApproveLoading(false);
        }
    };

    const handleWithdraw = async () => {
        setWithdrawMessage('');
        setWithdrawLoading(true);
        try {
            const res = await api.post(`/campaign/${id}/withdraw/`);
            setWithdrawMessage(`✓ ${res.data.message}`);
            fetchData();
        } catch (err) {
            setWithdrawMessage(`✗ ${err.response?.data?.error || 'Withdrawal failed'}`);
        } finally {
            setWithdrawLoading(false);
        }
    };

    const handleRefund = async () => {
        setRefundMessage('');
        setRefundLoading(true);
        try {
            const res = await api.post(`/campaign/${id}/refund/`);
            setRefundMessage(`✓ ${res.data.message}`);
            fetchData();
        } catch (err) {
            setRefundMessage(`✗ ${err.response?.data?.error || 'Refund failed'}`);
        } finally {
            setRefundLoading(false);
        }
    };

    if (loading) return <p style={styles.center}>Loading...</p>;
    if (error)   return <p style={styles.center}>{error}</p>;
    if (!campaign) return <p style={styles.center}>Campaign not found.</p>;

    const progress = Math.min((campaign.funded / campaign.target) * 100, 100);

    return (
        <div style={styles.container}>

            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>{campaign.campaign_name}</h1>
                    <p style={styles.meta}>
                        By <Link to={`/startups/${campaign.startup}`} style={styles.link}>{campaign.startup_name}</Link>
                        {' · '} Created by {campaign.created_by}
                    </p>
                </div>
                <span style={{
                    ...styles.badge,
                    background: campaign.status === 'active' ? '#d1fae5' : campaign.status === 'pending' ? '#fef3c7' : '#f3f4f6',
                    color: campaign.status === 'active' ? '#065f46' : campaign.status === 'pending' ? '#92400e' : '#374151',
                }}>
                    {campaign.status}
                </span>
            </div>

            {/* Description */}
            <div style={styles.card}>
                <h2 style={styles.sectionTitle}>About</h2>
                <p style={styles.description}>{campaign.description}</p>
                <p style={styles.meta}>Deadline: {new Date(campaign.deadline).toLocaleDateString()}</p>
            </div>

            {/* Funding progress */}
            <div style={styles.card}>
                <h2 style={styles.sectionTitle}>Funding Progress</h2>
                <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${progress}%` }} />
                </div>
                <div style={styles.fundingStats}>
                    <span><strong>{campaign.funded} ETH</strong> raised</span>
                    <span><strong>{progress.toFixed(1)}%</strong></span>
                    <span>Goal: <strong>{campaign.target} ETH</strong></span>
                </div>
            </div>

            {/* Judge approval section */}
            {user && user.role === 'judge' && campaign.status === 'pending' && (
                <div style={styles.card}>
                    <h2 style={styles.sectionTitle}>Judge Actions</h2>
                    {judgeVoted ? (
                        <p style={styles.message}>✓ Your vote has been recorded.</p>
                    ) : (
                        <>
                            <p style={styles.meta}>As a judge you can approve or reject this campaign.</p>
                            {approveMessage && <p style={styles.message}>{approveMessage}</p>}
                            <div style={styles.judgeButtons}>
                                <button onClick={handleApprove} disabled={approveLoading} style={styles.approveButton}>
                                    {approveLoading ? 'Processing...' : '✓ Approve'}
                                </button>
                                <button onClick={handleReject} disabled={approveLoading} style={styles.rejectButton}>
                                    {approveLoading ? 'Processing...' : '✗ Reject'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Funding section */}
            {user && user.role === 'investor' && campaign.status === 'active'
                && campaign.created_by !== `${user.first_name} ${user.last_name} (${user.email})` && (
                <div style={styles.card}>
                    <h2 style={styles.sectionTitle}>Fund this Campaign</h2>
                    {fundError   && <p style={styles.error}>{fundError}</p>}
                    {fundSuccess && <p style={styles.success}>{fundSuccess}</p>}
                    <form onSubmit={handleFund} style={styles.fundForm}>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="Amount in ETH"
                            value={fundAmount}
                            onChange={(e) => setFundAmount(e.target.value)}
                            style={styles.input}
                            required
                        />
                        <button type="submit" style={styles.fundButton} disabled={fundLoading}>
                            {fundLoading ? 'Processing...' : 'Fund Now'}
                        </button>
                    </form>
                </div>
            )}

            {/* Withdraw section — owner after success */}
            {user && campaign.status === 'completed'
            && campaign.created_by === `${user.first_name} ${user.last_name} (${user.email})` && (
                <div style={styles.card}>
                    <h2 style={styles.sectionTitle}>Withdraw Funds</h2>
                    <p style={styles.meta}>
                        Your campaign succeeded! You can now withdraw <strong>{campaign.funded} ETH</strong>.
                    </p>
                    {withdrawMessage && <p style={styles.message}>{withdrawMessage}</p>}
                    <button
                        onClick={handleWithdraw}
                        disabled={withdrawLoading}
                        style={styles.approveButton}
                    >
                        {withdrawLoading ? 'Processing...' : `Withdraw ${campaign.funded} ETH`}
                    </button>
                </div>
            )}

            {/* Refund section — investors after failure */}
            {user && user.role === 'investor' && campaign.status === 'inactive' && (
                <div style={styles.card}>
                    <h2 style={styles.sectionTitle}>Claim Refund</h2>
                    <p style={styles.meta}>
                        This campaign did not reach its goal. You can claim a refund for your investment.
                    </p>
                    {refundMessage && <p style={styles.message}>{refundMessage}</p>}
                    <button
                        onClick={handleRefund}
                        disabled={refundLoading}
                        style={styles.rejectButton}
                    >
                        {refundLoading ? 'Processing...' : 'Claim Refund'}
                    </button>
                </div>
            )}

            {/* Transaction history */}
            <div style={styles.card}>
                <h2 style={styles.sectionTitle}>Transaction History ({transactions.length})</h2>
                {transactions.length === 0 ? (
                    <p style={styles.empty}>No transactions yet.</p>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Investor</th>
                                <th style={styles.th}>Amount</th>
                                <th style={styles.th}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(tx => (
                                <tr key={tx.id}>
                                    <td style={styles.td}>{tx.sender}</td>
                                    <td style={styles.td}>{tx.amount} ETH</td>
                                    <td style={styles.td}>{new Date(tx.date).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

        </div>
    );
}

const styles = {
    container:    { padding: '2rem', maxWidth: '900px', margin: '0 auto' },
    header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' },
    title:        { color: '#1e1b4b', marginBottom: '0.5rem' },
    meta:         { color: '#666', fontSize: '0.95rem' },
    badge:        { padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.9rem', fontWeight: 'bold', whiteSpace: 'nowrap' },
    card:         { background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '1.5rem' },
    sectionTitle: { color: '#1e1b4b', marginBottom: '1rem' },
    description:  { color: '#444', lineHeight: '1.6', marginBottom: '1rem' },
    link:         { color: '#4f46e5', textDecoration: 'none' },
    progressBar:  { background: '#e5e7eb', borderRadius: '999px', height: '12px', marginBottom: '1rem' },
    progressFill: { background: '#4f46e5', height: '100%', borderRadius: '999px', transition: 'width 0.3s' },
    fundingStats: { display: 'flex', justifyContent: 'space-between', color: '#444' },
    judgeButtons: { display: 'flex', gap: '1rem', marginTop: '1rem' },
    approveButton: { padding: '0.75rem 2rem', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' },
    rejectButton:  { padding: '0.75rem 2rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' },
    fundForm:     { display: 'flex', gap: '1rem', marginTop: '1rem' },
    input:        { padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', flex: 1 },
    fundButton:   { padding: '0.75rem 2rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' },
    message:      { color: '#4f46e5', marginBottom: '1rem' },
    error:        { color: '#dc2626', marginBottom: '1rem' },
    success:      { color: '#059669', marginBottom: '1rem' },
    empty:        { color: '#666' },
    table:        { width: '100%', borderCollapse: 'collapse' },
    th:           { textAlign: 'left', padding: '0.75rem', borderBottom: '2px solid #e5e7eb', color: '#1e1b4b' },
    td:           { padding: '0.75rem', borderBottom: '1px solid #e5e7eb', color: '#444' },
    center:       { textAlign: 'center', marginTop: '3rem', color: '#666' },
};