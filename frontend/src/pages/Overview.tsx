
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
    ShoppingBag,
    CreditCard,
    ShieldAlert,
    Clock3,
    Bot,
    ShieldCheck,
    ArrowRight,
    RefreshCw,
} from "lucide-react";

import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";

import { useTransactions } from "../hooks/useTransactions";
import { DEMO_MODE } from "../services/api";

export default function Overview() {
    const navigate = useNavigate();

    const {
        transactions,
        loading,
        error,
        refresh,
    } = useTransactions();

    // Dashboard statistics
    const statistics = useMemo(() => {
        return {
            total: transactions.length,

            completed: transactions.filter(
                (tx) => tx.payment_status === "COMPLETED"
            ).length,

            blocked: transactions.filter(
                (tx) => tx.payment_status === "BLOCKED"
            ).length,

            pending: transactions.filter(
                (tx) => tx.payment_status === "PENDING"
            ).length,
        };
    }, [transactions]);

    // Five most recent transactions
    const recentTransactions = useMemo(() => {
        return [...transactions]
            .sort(
                (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
            )
            .slice(0, 5);
    }, [transactions]);

    return (
        <>
            <div className="flex flex-wrap items-start justify-between gap-4">
                <PageHeader
                    title="Overview Dashboard"
                    description="Monitor purchases, transactions and AI security activity."
                />

                <button
                    className="secondary-btn flex items-center gap-2"
                    onClick={refresh}
                    disabled={loading}
                >
                    <RefreshCw
                        size={17}
                        className={loading ? "animate-spin" : ""}
                    />
                    Refresh
                </button>
            </div>

            {/* Demo Mode Notice */}
            {DEMO_MODE && (
                <div className="mb-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
                    DEMO MODE — Dashboard statistics are calculated
                    from simulated transaction records.
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div
                    role="alert"
                    className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700"
                >
                    {error}
                    <button
                        className="ml-3 font-semibold underline"
                        onClick={refresh}
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="panel mb-6 text-slate-500">
                    Loading dashboard statistics...
                </div>
            )}

            {/* Statistics Cards */}
            {!loading && !error && (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total Transactions"
                        value={statistics.total}
                        icon={ShoppingBag}
                    />

                    <StatCard
                        title="Completed Payments"
                        value={statistics.completed}
                        icon={CreditCard}
                    />

                    <StatCard
                        title="Blocked Transactions"
                        value={statistics.blocked}
                        icon={ShieldAlert}
                    />

                    <StatCard
                        title="Pending Transactions"
                        value={statistics.pending}
                        icon={Clock3}
                    />
                </div>
            )}

            {/* Quick Actions */}
            <div className="mt-7 grid gap-6 lg:grid-cols-2">
                <div className="panel">
                    <Bot size={32} className="mb-4 text-teal-700" />

                    <h2 className="text-xl font-bold">
                        AI Shopping Assistant
                    </h2>

                    <p className="my-4 text-sm text-slate-500">
                        Find, compare and review products using
                        conversational shopping.
                    </p>

                    <button
                        className="primary-btn flex items-center gap-2"
                        onClick={() => navigate("/shopping")}
                    >
                        Start Shopping
                        <ArrowRight size={18} />
                    </button>
                </div>

                <div className="panel">
                    <ShieldCheck
                        size={32}
                        className="mb-4 text-teal-700"
                    />

                    <h2 className="text-xl font-bold">
                        Security Test Lab
                    </h2>

                    <p className="my-4 text-sm text-slate-500">
                        Test how the security gateway responds
                        to suspicious purchase requests.
                    </p>

                    <button
                        className="primary-btn flex items-center gap-2"
                        onClick={() => navigate("/security-lab")}
                    >
                        Open Security Lab
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="panel mt-7">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-bold">
                        Recent Transactions
                    </h2>

                    <button
                        className="text-sm font-semibold text-teal-700 hover:underline"
                        onClick={() => navigate("/transactions")}
                    >
                        View All Transactions
                    </button>
                </div>

                {loading && (
                    <p className="text-sm text-slate-500">
                        Loading transactions...
                    </p>
                )}

                {!loading && !error && recentTransactions.length === 0 && (
                    <p className="text-sm text-slate-500">
                        No transactions available.
                    </p>
                )}

                {!loading && !error && (
                    <div className="space-y-3">
                        {recentTransactions.map((tx) => (
                            <div
                                key={tx.id}
                                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 p-4"
                            >
                                <div>
                                    <p className="font-semibold text-slate-900">
                                        {tx.product_name}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        {tx.merchant}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        {new Date(tx.created_at).toLocaleString(
                                            "en-LK",
                                            {
                                                timeZone: "Asia/Colombo",
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            }
                                        )}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p className="font-bold">
                                        {tx.currency} {tx.amount.toFixed(2)}
                                    </p>

                                    <span
                                        className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${tx.payment_status === "COMPLETED"
                                                ? "bg-green-100 text-green-700"
                                                : tx.payment_status === "BLOCKED"
                                                    ? "bg-red-100 text-red-700"
                                                    : tx.payment_status === "PENDING"
                                                        ? "bg-amber-100 text-amber-700"
                                                        : "bg-slate-100 text-slate-600"
                                            }`}
                                    >
                                        {tx.payment_status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Platform Workflow */}
            <div className="panel mt-7">
                <h2 className="text-xl font-bold">
                    How GuardCart AI Works
                </h2>

                <div className="mt-5 grid gap-4 md:grid-cols-4">
                    {[
                        "AI Recommends",
                        "Gateway Validates",
                        "Human Approves",
                        "PayPal Processes",
                    ].map((step, index) => (
                        <div
                            key={step}
                            className="rounded-xl bg-slate-50 p-4"
                        >
                            <p className="text-xs font-bold text-teal-700">
                                STEP {index + 1}
                            </p>

                            <p className="mt-2 font-semibold">
                                {step}
                            </p>
                        </div>
                    ))}
                </div>

                <p className="mt-4 text-xs text-slate-500">
                    This illustrates the intended workflow.
                    Actual payment completion requires backend
                    verification.
                </p>
            </div>
        </>
    );
}
