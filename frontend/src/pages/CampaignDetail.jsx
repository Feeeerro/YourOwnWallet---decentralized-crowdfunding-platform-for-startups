import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';
import { ErrorState, LoadingState, Panel, ProgressBar, SmartImage, StatusBadge } from '../components/ui';
import { coverUrl, formatDate, logoUrl, ownerLabel } from '../lib/visuals';

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

    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} />;
    if (!campaign) return <ErrorState message="Campaign not found." />;

    const progress = Math.min((campaign.funded / campaign.target) * 100, 100);
    const isOwner = user && campaign.created_by === ownerLabel(user);
    const startupName = campaign.startup_name || 'Startup';
    const msgClass = (msg) => (msg?.startsWith('✗') ? 'alert-error' : 'alert-success');

    return (
        <div>
            {/* Cover hero */}
            <header className="mx-auto max-w-6xl px-3 pt-6 sm:px-6">
                <Link
                    to="/campaigns"
                    className="mb-4 ml-2 inline-flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-white"
                >
                    <Icon name="arrow-left" />
                    All campaigns
                </Link>
                <div className="relative">
                    <SmartImage
                        src={coverUrl(`${campaign.campaign_name}-${campaign.id}`, 1400, 480)}
                        seed={campaign.campaign_name}
                        loading="eager"
                        className="aspect-[2.4/1] rounded-3xl border border-line sm:aspect-[3.6/1]"
                    />
                    <div
                        className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-t from-ink via-ink/30 to-transparent"
                        aria-hidden="true"
                    />
                </div>

                <div className="relative -mt-14 flex items-end gap-5 px-3 sm:-mt-16 sm:px-8">
                    <SmartImage
                        src={logoUrl(startupName)}
                        seed={`${startupName}-logo`}
                        className="size-24 shrink-0 rounded-2xl ring-[6px] ring-ink sm:size-28"
                    />
                    <div className="min-w-0 pb-1">
                        <StatusBadge status={campaign.status} className="mb-2" />
                        <h1 className="text-gradient text-3xl font-semibold tracking-tight sm:text-4xl">
                            {campaign.campaign_name}
                        </h1>
                        <p className="mt-1 text-sm text-white/55">
                            By{' '}
                            <Link
                                to={`/startups/${campaign.startup}`}
                                className="font-medium text-accent hover:text-accent-soft"
                            >
                                {campaign.startup_name}
                            </Link>
                            <span className="[overflow-wrap:anywhere]">
                                {' · '}Created by {campaign.created_by}
                            </span>
                        </p>
                    </div>
                </div>
            </header>

            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_380px]">
                {/* ─── Main column ─── */}
                <div className="min-w-0 space-y-6">
                    {/* About */}
                    <Panel title="About">
                        <p className="mb-5 leading-relaxed text-white/70">{campaign.description}</p>
                        <p className="flex items-center gap-2 text-sm text-white/55">
                            <Icon name="calendar" className="size-4 text-white/40" />
                            Deadline:{' '}
                            <span className="font-medium text-white/90">
                                {new Date(campaign.deadline).toLocaleDateString()}
                            </span>
                        </p>
                    </Panel>

                    {/* Transaction history */}
                    <Panel title={`Transaction History (${transactions.length})`}>
                        {transactions.length === 0 ? (
                            <p className="text-sm text-white/50">No transactions yet.</p>
                        ) : (
                            <div className="-mx-2 overflow-x-auto">
                                <table className="w-full min-w-[480px] text-sm">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="px-2 py-3 text-left text-xs font-medium tracking-wide text-white/45 uppercase">
                                                Investor
                                            </th>
                                            <th className="px-2 py-3 text-left text-xs font-medium tracking-wide text-white/45 uppercase">
                                                Amount
                                            </th>
                                            <th className="px-2 py-3 text-left text-xs font-medium tracking-wide text-white/45 uppercase">
                                                Date
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((tx) => (
                                            <tr
                                                key={tx.id}
                                                className="border-b border-white/5 transition-colors hover:bg-white/[0.03]"
                                            >
                                                <td className="px-2 py-3 text-white/80">{tx.sender}</td>
                                                <td className="px-2 py-3 font-medium text-white tabular-nums">
                                                    {tx.amount} ETH
                                                </td>
                                                <td className="px-2 py-3 text-white/50">
                                                    {new Date(tx.date).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Panel>
                </div>

                {/* ─── Side column ─── */}
                <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
                    {/* Funding progress */}
                    <Panel title="Funding Progress">
                        <div className="mb-1 flex items-end justify-between">
                            <span className="flex items-center gap-1.5 font-display text-3xl font-semibold tabular-nums">
                                {campaign.funded}
                                <Icon name="eth" className="size-5 text-accent" />
                            </span>
                            <span className="text-sm font-semibold text-accent tabular-nums">
                                {progress.toFixed(1)}%
                            </span>
                        </div>
                        <p className="mb-4 text-sm text-white/50">
                            raised of <strong className="text-white/85">{campaign.target} ETH</strong> goal
                        </p>
                        <ProgressBar value={progress} className="h-2.5" />
                        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 text-sm">
                            <div>
                                <dt className="eyebrow mb-1">Transactions</dt>
                                <dd className="font-semibold tabular-nums">
                                    {campaign.transactions_count ?? transactions.length}
                                </dd>
                            </div>
                            <div>
                                <dt className="eyebrow mb-1">Ends</dt>
                                <dd className="font-semibold">{formatDate(campaign.deadline)}</dd>
                            </div>
                        </dl>
                    </Panel>

                    {/* Judge approval section */}
                    {user && user.role === 'judge' && campaign.status === 'pending' && (
                        <Panel title="Judge Actions">
                            {judgeVoted ? (
                                <p className="flex items-center gap-2 font-medium text-emerald-300">
                                    <Icon name="check" /> Your vote has been recorded.
                                </p>
                            ) : (
                                <>
                                    <p className="mb-4 text-sm text-white/55">
                                        As a judge you can approve or reject this campaign.
                                    </p>
                                    {approveMessage && (
                                        <p className={`mb-4 ${msgClass(approveMessage)}`} role="status">
                                            {approveMessage}
                                        </p>
                                    )}

                                    {!showApproveConfirm && !showRejectConfirm && (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setShowApproveConfirm(true)}
                                                className="btn btn-success flex-1"
                                            >
                                                <Icon name="check" /> Approve
                                            </button>
                                            <button
                                                onClick={() => setShowRejectConfirm(true)}
                                                className="btn btn-danger flex-1"
                                            >
                                                <Icon name="x" /> Reject
                                            </button>
                                        </div>
                                    )}

                                    {showApproveConfirm && (
                                        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4">
                                            <p className="mb-3 text-sm text-emerald-100">
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
                                                    className="btn btn-success px-5 py-2"
                                                >
                                                    {approveLoading ? 'Processing...' : 'Yes, approve'}
                                                </button>
                                                <button
                                                    onClick={() => setShowApproveConfirm(false)}
                                                    className="btn btn-outline px-5 py-2"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {showRejectConfirm && (
                                        <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-4">
                                            <p className="mb-3 text-sm text-rose-100">
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
                                                    className="btn btn-danger px-5 py-2"
                                                >
                                                    {approveLoading ? 'Processing...' : 'Yes, reject'}
                                                </button>
                                                <button
                                                    onClick={() => setShowRejectConfirm(false)}
                                                    className="btn btn-outline px-5 py-2"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </Panel>
                    )}

                    {/* Funding section */}
                    {user && user.role === 'investor' && campaign.status === 'active' && !isOwner && (
                        <Panel title="Fund this Campaign">
                            {fundError && (
                                <p className="alert-error mb-4" role="alert">
                                    {fundError}
                                </p>
                            )}
                            {fundSuccess && (
                                <p className="alert-success mb-4" role="status">
                                    {fundSuccess}
                                </p>
                            )}
                            <form onSubmit={handleFund} className="space-y-3">
                                <label htmlFor="fund-amount" className="field-label">
                                    Amount in ETH
                                </label>
                                <div className="relative">
                                    <input
                                        id="fund-amount"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        inputMode="decimal"
                                        placeholder="0.00"
                                        value={fundAmount}
                                        onChange={(e) => setFundAmount(e.target.value)}
                                        required
                                        className="field-input pr-14"
                                    />
                                    <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs font-semibold text-white/45">
                                        ETH
                                    </span>
                                </div>
                                <button
                                    type="submit"
                                    disabled={fundLoading}
                                    className="btn btn-primary w-full py-3"
                                >
                                    {fundLoading ? 'Processing...' : 'Fund Now'}
                                </button>
                            </form>
                        </Panel>
                    )}

                    {/* Withdraw section */}
                    {user && campaign.status === 'completed' && isOwner && (
                        <Panel title="Withdraw Funds">
                            {withdrawn ? (
                                <p className="flex items-center gap-2 font-medium text-emerald-300">
                                    <Icon name="check" /> Funds successfully withdrawn.
                                </p>
                            ) : (
                                <>
                                    <p className="mb-4 text-sm text-white/55">
                                        Your campaign succeeded! You can now withdraw{' '}
                                        <strong className="text-white">{campaign.funded} ETH</strong>.
                                    </p>
                                    {withdrawMessage && (
                                        <p className={`mb-3 ${msgClass(withdrawMessage)}`} role="status">
                                            {withdrawMessage}
                                        </p>
                                    )}
                                    {!showWithdrawConfirm ? (
                                        <button
                                            onClick={() => setShowWithdrawConfirm(true)}
                                            className="btn btn-success w-full"
                                        >
                                            Withdraw {campaign.funded} ETH
                                        </button>
                                    ) : (
                                        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4">
                                            <p className="mb-3 text-sm text-amber-100">
                                                Are you sure you want to withdraw{' '}
                                                <strong>{campaign.funded} ETH</strong>? This action
                                                cannot be undone.
                                            </p>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={handleWithdraw}
                                                    disabled={withdrawLoading}
                                                    className="btn btn-success px-5 py-2"
                                                >
                                                    {withdrawLoading ? 'Processing...' : 'Yes, withdraw'}
                                                </button>
                                                <button
                                                    onClick={() => setShowWithdrawConfirm(false)}
                                                    className="btn btn-outline px-5 py-2"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </Panel>
                    )}

                    {/* Refund section */}
                    {user && user.role === 'investor' && campaign.status === 'failed' && (
                        <Panel title="Claim Refund">
                            {refunded ? (
                                <p className="flex items-center gap-2 font-medium text-emerald-300">
                                    <Icon name="check" /> Refund successfully claimed.
                                </p>
                            ) : (
                                <>
                                    <p className="mb-4 text-sm text-white/55">
                                        This campaign did not reach its goal. You can claim a refund.
                                    </p>
                                    {refundMessage && (
                                        <p className={`mb-3 ${msgClass(refundMessage)}`} role="status">
                                            {refundMessage}
                                        </p>
                                    )}
                                    {!showRefundConfirm ? (
                                        <button
                                            onClick={() => setShowRefundConfirm(true)}
                                            className="btn btn-danger w-full"
                                        >
                                            Claim Refund
                                        </button>
                                    ) : (
                                        <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-4">
                                            <p className="mb-3 text-sm text-rose-100">
                                                Are you sure you want to claim your refund? This action
                                                cannot be undone.
                                            </p>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={handleRefund}
                                                    disabled={refundLoading}
                                                    className="btn btn-danger px-5 py-2"
                                                >
                                                    {refundLoading ? 'Processing...' : 'Yes, claim refund'}
                                                </button>
                                                <button
                                                    onClick={() => setShowRefundConfirm(false)}
                                                    className="btn btn-outline px-5 py-2"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </Panel>
                    )}

                    {/* Contract addresses */}
                    {campaign.campaign_address && (
                        <Panel title="Smart Contracts">
                            <dl className="space-y-3 text-sm">
                                <div>
                                    <dt className="eyebrow mb-1">Campaign</dt>
                                    <dd className="font-mono text-xs break-all text-accent-soft">
                                        {campaign.campaign_address}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="eyebrow mb-1">Approval</dt>
                                    <dd className="font-mono text-xs break-all text-accent-soft">
                                        {campaign.campaign_approval_address}
                                    </dd>
                                </div>
                            </dl>
                        </Panel>
                    )}
                </aside>
            </div>
        </div>
    );
}
