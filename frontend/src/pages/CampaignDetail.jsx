import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function CampaignDetail() {
    const { id } = useParams();
    const { user } = useAuth();

    const [campaign, setCampaign] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [fundAmount, setFundAmount] = useState('');
    const [fundLoading, setFundLoading] = useState(false);
    const [fundError, setFundError] = useState('');
    const [fundSuccess, setFundSuccess] = useState('');
    const [approveLoading, setApproveLoading] = useState(false);
    const [approveMessage, setApproveMessage] = useState('');
    const [judgeVoted, setJudgeVoted] = useState(false);
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [withdrawMessage, setWithdrawMessage] = useState('');
    const [refundLoading, setRefundLoading] = useState(false);
    const [refundMessage, setRefundMessage] = useState('');
    const [withdrawn, setWithdrawn] = useState(false);
    const [refunded, setRefunded] = useState(false);
    const [showApproveConfirm, setShowApproveConfirm] = useState(false);
    const [showRejectConfirm, setShowRejectConfirm] = useState(false);
    const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
    const [showRefundConfirm, setShowRefundConfirm] = useState(false);

    const getBadgeClass = (status) => {
        switch (status) {
            case 'active':
                return 'bg-emerald-500 text-white';
            case 'pending':
                return 'bg-amber-500 text-white';
            case 'completed':
                return 'bg-blue-500 text-white';
            case 'failed':
                return 'bg-red-500 text-white';
            case 'rejected':
                return 'bg-gray-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const fetchData = async () => {
        try {
            const [campaignRes, transactionsRes] = await Promise.all([
                api.get(`/campaign/${id}/`),
                api.get(`/transaction/campaign/${id}/`),
            ]);

            const campaignData = campaignRes.data;
            setCampaign(campaignData);
            setTransactions(transactionsRes.data);

            if (user && user.role === 'judge' && campaignData.status === 'pending') {
                try {
                    const judgeRes = await api.get(`/campaign/${id}/judge-status/`);
                    setJudgeVoted(judgeRes.data.has_voted);
                } catch {
                    setJudgeVoted(false);
                }
            }

            if (campaignData.status === 'active') {
                const now = new Date();
                const deadline = new Date(campaignData.deadline);
                if (now >= deadline) {
                    try {
                        await api.post(`/campaign/${id}/finalize/`);
                        const updated = await api.get(`/campaign/${id}/`);
                        setCampaign(updated.data);
                    } catch (err) {
                        console.log('Auto-finalize:', err.response?.data?.error);
                    }
                }
            }

            // check withdraw/refund status from blockchain
            if (user && (campaignData.status === 'completed' || campaignData.status === 'failed')) {
                try {
                    const userStatusRes = await api.get(`/campaign/${id}/user-status/`);
                    setWithdrawn(userStatusRes.data.has_withdrawn);
                    setRefunded(userStatusRes.data.has_refunded);
                } catch {
                    // silently ignore
                }
            }
        } catch {
            setError('Failed to load campaign');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

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
                if (data.error.includes('Campaign is not active'))
                    setFundError('This campaign is not active yet.');
                else if (data.error.includes('deadline'))
                    setFundError('This campaign has passed its deadline.');
                else if (data.error.includes('Cannot connect'))
                    setFundError('Cannot connect to the blockchain. Make sure Ganache is running.');
                else setFundError(data.error);
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
                    setApproveMessage('✓ You have already approved this campaign.');
                    setJudgeVoted(true);
                } else if (data.error.includes('not pending'))
                    setApproveMessage('✗ This campaign is no longer pending.');
                else setApproveMessage(`✗ ${data.error}`);
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
                if (data.error.includes('Already rejected'))
                    setApproveMessage('✗ This campaign has already been rejected.');
                else if (data.error.includes('not pending'))
                    setApproveMessage('✗ This campaign is no longer pending.');
                else setApproveMessage(`✗ ${data.error}`);
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
            setWithdrawn(true);
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
            setRefunded(true);
            fetchData();
        } catch (err) {
            setRefundMessage(`✗ ${err.response?.data?.error || 'Refund failed'}`);
        } finally {
            setRefundLoading(false);
        }
    };

    if (loading)
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    if (error)
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    if (!campaign)
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Campaign not found.</p>
            </div>
        );

    const progress = Math.min((campaign.funded / campaign.target) * 100, 100);
    const isOwner =
        user && campaign.created_by === `${user.first_name} ${user.last_name} (${user.email})`;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gray-900 text-white">
                <div className="max-w-4xl mx-auto px-6 py-12">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">{campaign.campaign_name}</h1>
                            <p className="text-gray-400 text-sm">
                                By{' '}
                                <Link
                                    to={`/startups/${campaign.startup}`}
                                    className="text-indigo-400 hover:text-indigo-300"
                                >
                                    {campaign.startup_name}
                                </Link>
                                {' · '}Created by {campaign.created_by}
                            </p>
                        </div>
                        <span
                            className={`text-xs font-medium px-3 py-1.5 rounded-full ${getBadgeClass(campaign.status)}`}
                        >
                            {campaign.status}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
                {/* About */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">{campaign.description}</p>
                    <p className="text-sm text-gray-500">
                        Deadline:{' '}
                        <span className="font-medium text-gray-700">
                            {new Date(campaign.deadline).toLocaleDateString()}
                        </span>
                    </p>
                </div>

                {/* Funding progress */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Funding Progress</h2>
                    <div className="bg-gray-100 rounded-full h-3 mb-4">
                        <div
                            className="bg-indigo-600 h-3 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-700">
                            <strong className="text-gray-900">{campaign.funded} ETH</strong> raised
                        </span>
                        <span className="text-indigo-600 font-semibold">
                            {progress.toFixed(1)}%
                        </span>
                        <span className="text-gray-700">
                            Goal: <strong className="text-gray-900">{campaign.target} ETH</strong>
                        </span>
                    </div>
                </div>

                {/* Judge approval section */}
                {user && user.role === 'judge' && campaign.status === 'pending' && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Judge Actions</h2>
                        {judgeVoted ? (
                            <p className="text-emerald-600 font-medium">
                                ✓ Your vote has been recorded.
                            </p>
                        ) : (
                            <>
                                <p className="text-gray-500 text-sm mb-4">
                                    As a judge you can approve or reject this campaign.
                                </p>
                                {approveMessage && (
                                    <p className="text-indigo-600 text-sm mb-4">{approveMessage}</p>
                                )}

                                {!showApproveConfirm && !showRejectConfirm && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowApproveConfirm(true)}
                                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
                                        >
                                            ✓ Approve
                                        </button>
                                        <button
                                            onClick={() => setShowRejectConfirm(true)}
                                            className="bg-red-600 hover:bg-red-500 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
                                        >
                                            ✗ Reject
                                        </button>
                                    </div>
                                )}

                                {showApproveConfirm && (
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                        <p className="text-emerald-800 text-sm mb-3">
                                            Are you sure you want to <strong>approve</strong> this
                                            campaign? This action cannot be undone.
                                        </p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    setShowApproveConfirm(false);
                                                    handleApprove();
                                                }}
                                                disabled={approveLoading}
                                                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-white font-semibold px-5 py-2 rounded-lg transition-colors text-sm"
                                            >
                                                {approveLoading ? 'Processing...' : 'Yes, approve'}
                                            </button>
                                            <button
                                                onClick={() => setShowApproveConfirm(false)}
                                                className="border border-gray-300 text-gray-600 hover:border-gray-400 px-5 py-2 rounded-lg transition-colors text-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {showRejectConfirm && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-red-800 text-sm mb-3">
                                            Are you sure you want to <strong>reject</strong> this
                                            campaign? This action cannot be undone.
                                        </p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    setShowRejectConfirm(false);
                                                    handleReject();
                                                }}
                                                disabled={approveLoading}
                                                className="bg-red-600 hover:bg-red-500 disabled:bg-red-300 text-white font-semibold px-5 py-2 rounded-lg transition-colors text-sm"
                                            >
                                                {approveLoading ? 'Processing...' : 'Yes, reject'}
                                            </button>
                                            <button
                                                onClick={() => setShowRejectConfirm(false)}
                                                className="border border-gray-300 text-gray-600 hover:border-gray-400 px-5 py-2 rounded-lg transition-colors text-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Funding section */}
                {user && user.role === 'investor' && campaign.status === 'active' && !isOwner && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">
                            Fund this Campaign
                        </h2>
                        {fundError && <p className="text-red-600 text-sm mb-3">{fundError}</p>}
                        {fundSuccess && (
                            <p className="text-emerald-600 text-sm mb-3">{fundSuccess}</p>
                        )}
                        <form onSubmit={handleFund} className="flex gap-3">
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="Amount in ETH"
                                value={fundAmount}
                                onChange={(e) => setFundAmount(e.target.value)}
                                required
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                                type="submit"
                                disabled={fundLoading}
                                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
                            >
                                {fundLoading ? 'Processing...' : 'Fund Now'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Withdraw section */}
                {user && campaign.status === 'completed' && isOwner && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Withdraw Funds</h2>
                        {withdrawn ? (
                            <p className="text-emerald-600 font-medium">
                                ✓ Funds successfully withdrawn.
                            </p>
                        ) : (
                            <>
                                <p className="text-gray-500 text-sm mb-4">
                                    Your campaign succeeded! You can now withdraw{' '}
                                    <strong className="text-gray-900">{campaign.funded} ETH</strong>
                                    .
                                </p>
                                {withdrawMessage && (
                                    <p className="text-sm mb-3">{withdrawMessage}</p>
                                )}
                                {!showWithdrawConfirm ? (
                                    <button
                                        onClick={() => setShowWithdrawConfirm(true)}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
                                    >
                                        Withdraw {campaign.funded} ETH
                                    </button>
                                ) : (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                        <p className="text-amber-800 text-sm mb-3">
                                            Are you sure you want to withdraw{' '}
                                            <strong>{campaign.funded} ETH</strong>? This action
                                            cannot be undone.
                                        </p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleWithdraw}
                                                disabled={withdrawLoading}
                                                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-white font-semibold px-5 py-2 rounded-lg transition-colors text-sm"
                                            >
                                                {withdrawLoading
                                                    ? 'Processing...'
                                                    : 'Yes, withdraw'}
                                            </button>
                                            <button
                                                onClick={() => setShowWithdrawConfirm(false)}
                                                className="border border-gray-300 text-gray-600 hover:border-gray-400 px-5 py-2 rounded-lg transition-colors text-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Refund section */}
                {user && user.role === 'investor' && campaign.status === 'failed' && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Claim Refund</h2>
                        {refunded ? (
                            <p className="text-emerald-600 font-medium">
                                ✓ Refund successfully claimed.
                            </p>
                        ) : (
                            <>
                                <p className="text-gray-500 text-sm mb-4">
                                    This campaign did not reach its goal. You can claim a refund.
                                </p>
                                {refundMessage && <p className="text-sm mb-3">{refundMessage}</p>}
                                {!showRefundConfirm ? (
                                    <button
                                        onClick={() => setShowRefundConfirm(true)}
                                        className="bg-red-600 hover:bg-red-500 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
                                    >
                                        Claim Refund
                                    </button>
                                ) : (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-red-800 text-sm mb-3">
                                            Are you sure you want to claim your refund? This action
                                            cannot be undone.
                                        </p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleRefund}
                                                disabled={refundLoading}
                                                className="bg-red-600 hover:bg-red-500 disabled:bg-red-300 text-white font-semibold px-5 py-2 rounded-lg transition-colors text-sm"
                                            >
                                                {refundLoading
                                                    ? 'Processing...'
                                                    : 'Yes, claim refund'}
                                            </button>
                                            <button
                                                onClick={() => setShowRefundConfirm(false)}
                                                className="border border-gray-300 text-gray-600 hover:border-gray-400 px-5 py-2 rounded-lg transition-colors text-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Transaction history */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Transaction History ({transactions.length})
                    </h2>
                    {transactions.length === 0 ? (
                        <p className="text-gray-500 text-sm">No transactions yet.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left py-3 text-gray-500 font-medium">
                                        Investor
                                    </th>
                                    <th className="text-left py-3 text-gray-500 font-medium">
                                        Amount
                                    </th>
                                    <th className="text-left py-3 text-gray-500 font-medium">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx) => (
                                    <tr
                                        key={tx.id}
                                        className="border-b border-gray-50 hover:bg-gray-50"
                                    >
                                        <td className="py-3 text-gray-700">{tx.sender}</td>
                                        <td className="py-3 text-gray-700 font-medium">
                                            {tx.amount} ETH
                                        </td>
                                        <td className="py-3 text-gray-500">
                                            {new Date(tx.date).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
