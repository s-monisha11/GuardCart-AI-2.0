
import { useEffect, useMemo, useState } from "react";
import { AgCharts } from "ag-charts-react";
import {
    AllCommunityModule,
    ModuleRegistry,
} from "ag-charts-community";
import type { AgChartOptions } from "ag-charts-community";

import PageHeader from "../components/common/PageHeader";
import { loadTransactions } from "../services/transactionService";
import { DEMO_MODE } from "../services/api";
import type { Transaction } from "../types/transaction";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function Analytics() {
    const [records, setRecords] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        loadTransactions()
            .then((data) => {
                if (active) setRecords(data);
            })
            .catch((err: unknown) => {
                if (active) {
                    setError(
                        err instanceof Error ? err.message : "Unable to load data"
                    );
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    const outcomes = useMemo(() => {
        const statuses = [
            "COMPLETED", "BLOCKED", "PENDING", "FAILED", "CANCELLED"
        ];

        return statuses.map((status) => ({
            status,
            count: records.filter(
                (r) => r.payment_status === status
            ).length,
        }));
    }, [records]);

    const violations = useMemo(() => {
        const counts: Record<string, number> = {};

        records.forEach((r) => {
            if (r.violated_rule) {
                counts[r.violated_rule] =
                    (counts[r.violated_rule] || 0) + 1;
            }
        });

        return Object.entries(counts).map(([rule, count]) => ({
            rule,
            count,
        }));
    }, [records]);

    const outcomeChart = useMemo<AgChartOptions>(() => ({
        data: outcomes.filter((item) => item.count > 0),
        series: [{
            type: "donut",
            angleKey: "count",
            calloutLabelKey: "status",
        }],
    }), [outcomes]);

    const violationChart = useMemo<AgChartOptions>(() => ({
        data: violations,
        series: [{
            type: "bar",
            xKey: "rule",
            yKey: "count",
            yName: "Violations",
        }],
    }), [violations]);

    const completed = records.filter(
        (r) => r.payment_status === "COMPLETED"
    );

    const totalSpent = completed.reduce(
        (sum, r) => sum + r.amount, 0
    );

    return (
        <>
            <PageHeader
                title="Security Analytics"
                description="Explore transaction outcomes and financial security activity."
            />

            {DEMO_MODE && (
                <div className="mb-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
                    DEMO MODE — Charts contain simulated transaction data.
                </div>
            )}

            {loading && <div className="panel">Loading analytics...</div>}

            {error && (
                <div role="alert" className="panel text-red-600">
                    {error}
                </div>
            )}

            {!loading && !error && (
                <>
                    <div className="mb-6 grid gap-4 md:grid-cols-3">
                        <div className="panel">
                            <p className="text-sm text-slate-500">Transactions</p>
                            <h2 className="mt-2 text-3xl font-bold">
                                {records.length}
                            </h2>
                        </div>

                        <div className="panel">
                            <p className="text-sm text-slate-500">Blocked Attempts</p>
                            <h2 className="mt-2 text-3xl font-bold text-red-600">
                                {records.filter(
                                    (r) => r.payment_status === "BLOCKED"
                                ).length}
                            </h2>
                        </div>

                        <div className="panel">
                            <p className="text-sm text-slate-500">
                                {DEMO_MODE ? "Simulated Spending" : "Completed Spending"}
                            </p>
                            <h2 className="mt-2 text-3xl font-bold">
                                ${totalSpent.toFixed(2)}
                            </h2>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="panel">
                            <h2 className="mb-4 text-lg font-bold">
                                Transaction Outcomes
                            </h2>
                            {records.length > 0 ? (
                                <div className="h-80">
                                    <AgCharts options={outcomeChart} />
                                </div>
                            ) : <p>No transaction data.</p>}
                        </div>

                        <div className="panel">
                            <h2 className="mb-4 text-lg font-bold">
                                Violations by Security Rule
                            </h2>
                            {violations.length > 0 ? (
                                <div className="h-80">
                                    <AgCharts options={violationChart} />
                                </div>
                            ) : <p>No security violations recorded.</p>}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
