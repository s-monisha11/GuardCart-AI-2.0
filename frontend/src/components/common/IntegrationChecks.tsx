
import { useState } from "react";
import {
    CheckCircle2,
    XCircle,
    RefreshCw,
    Server,
} from "lucide-react";

import { runIntegrationChecks } from "../../services/integrationService";
import type { IntegrationResult } from "../../types/integration";

export default function IntegrationChecks() {
    const [results, setResults] = useState<IntegrationResult[]>([]);
    const [loading, setLoading] = useState(false);

    async function handleCheck() {
        if (loading) return;

        setLoading(true);
        setResults([]);

        try {
            const data = await runIntegrationChecks();
            setResults(data);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="panel">
            <div className="mb-5 flex items-center gap-3">
                <Server size={24} className="text-teal-700" />
                <h2 className="text-lg font-bold">
                    API Integration Check
                </h2>
            </div>

            <p className="mb-5 text-sm text-slate-500">
                Test whether the FastAPI backend is reachable
                and whether the transaction endpoint responds
                with the expected format.
            </p>

            <button
                className="primary-btn flex items-center gap-2"
                onClick={() => void handleCheck()}
                disabled={loading}
            >
                <RefreshCw
                    size={17}
                    className={loading ? "animate-spin" : ""}
                />

                {loading ? "Checking..." : "Run Integration Check"}
            </button>

            <div className="mt-6 space-y-3">
                {results.map((result) => {
                    const success = result.status === "success";

                    return (
                        <div
                            key={result.id}
                            className="rounded-xl border border-slate-200 p-4"
                        >
                            <div className="flex items-center gap-3">
                                {success ? (
                                    <CheckCircle2
                                        size={21}
                                        className="text-green-700"
                                    />
                                ) : (
                                    <XCircle
                                        size={21}
                                        className="text-red-600"
                                    />
                                )}

                                <div>
                                    <h3 className="font-semibold">
                                        {result.name}
                                    </h3>

                                    <p className="text-xs text-slate-500">
                                        GET {result.endpoint}
                                    </p>
                                </div>
                            </div>

                            <p className="mt-3 text-sm text-slate-600">
                                {result.message}
                            </p>
                        </div>
                    );
                })}
            </div>

            {results.length > 0 && (
                <p className="mt-5 text-xs text-slate-500">
                    Successful checks confirm endpoint availability,
                    not payment or gateway security readiness.
                </p>
            )}
        </div>
    );
}
