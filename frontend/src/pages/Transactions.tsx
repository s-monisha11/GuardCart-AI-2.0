
import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, X } from "lucide-react";

import TransactionGrid from "../components/transactions/TransactionGrid";
import { loadTransactions } from "../services/transactionService";
import { DEMO_MODE } from "../services/api";

import type {
    PaymentStatus,
    Transaction,
} from "../types/transaction";

type StatusFilter = "ALL" | PaymentStatus;

export default function Transactions() {
    const [records, setRecords] = useState<Transaction[]>([]);
    const [selected, setSelected] = useState<Transaction | null>(null);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<StatusFilter>("ALL");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const refresh = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await loadTransactions();
            setRecords(data);
            setSelected(null);
        } catch (err) {
            setRecords([]);
            setSelected(null);
            setError(
                err instanceof Error
                    ? err.message
                    : "Could not load transactions"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const filtered = useMemo(
        () =>
            status === "ALL"
                ? records
                : records.filter((t) => t.payment_status === status),
        [records, status]
    );

    const blocked = records.filter(
        (t) => t.payment_status === "BLOCKED"
    ).length;

    const completed = records.filter(
        (t) => t.payment_status === "COMPLETED"
    ).length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Transaction History</h1>
                <p className="mt-2 text-slate-500">
                    Monitor purchases, payment outcomes and security decisions.
                </p>
            </div>

            {DEMO_MODE && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                    DEMO MODE — All transactions, PayPal IDs and payment
                    statuses are simulated examples.
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
                {[
                    ["Total Records", records.length],
                    ["Completed", completed],
                    ["Blocked", blocked],
                ].map(([label, value]) => (
                    <div className="panel" key={label}>
                        <p className="text-sm text-slate-500">{label}</p>
                        <h2 className="mt-2 text-3xl font-bold">{value}</h2>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="flex min-w-56 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4">
                    <Search size={18} className="text-slate-400" />
                    <input
                        aria-label="Search transactions"
                        className="w-full py-3 outline-none"
                        placeholder="Search transactions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <select
                    aria-label="Filter payment status"
                    className="field max-w-52"
                    value={status}
                    onChange={(e) =>
                        setStatus(e.target.value as StatusFilter)
                    }
                >
                    <option value="ALL">All Statuses</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="BLOCKED">Blocked</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>

                <button
                    className="secondary-btn flex items-center gap-2"
                    onClick={() => void refresh()}
                    disabled={loading}
                >
                    <RefreshCw size={17} />
                    Refresh
                </button>
            </div>

            {error && (
                <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="panel">Loading transaction records...</div>
            ) : (
                <TransactionGrid
                    transactions={filtered}
                    search={search}
                    onSelect={setSelected}
                />
            )}

            {selected && (
                <div className="panel space-y-4">
                    <div className="flex justify-between">
                        <h2 className="text-xl font-bold">
                            Transaction Details
                        </h2>
                        <button
                            aria-label="Close transaction details"
                            onClick={() => setSelected(null)}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="grid gap-4 text-sm sm:grid-cols-2">
                        {[
                            ["Transaction ID", selected.id],
                            ["Product", selected.product_name],
                            ["Original Request", selected.original_request],
                            ["Merchant", selected.merchant],
                            ["Amount", `${selected.currency} ${selected.amount.toFixed(2)}`],
                            ["Payment Status", selected.payment_status],
                            ["Security Decision", selected.security_decision],
                            ["Violated Rule", selected.violated_rule ?? "None"],
                            ["Approval", selected.approval_status],
                            ["Order Integrity", selected.integrity_status],
                            ["PayPal Order", selected.paypal_order_id ?? "Not created"],
                            ["Capture ID", selected.capture_id ?? "Not captured"],
                        ].map(([label, value]) => (
                            <div key={label} className="rounded-lg bg-slate-50 p-3">
                                <p className="text-slate-500">{label}</p>
                                <p className="mt-1 break-all font-semibold">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
