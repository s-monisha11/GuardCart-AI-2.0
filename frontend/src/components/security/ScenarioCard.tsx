
import { FlaskConical, Play } from "lucide-react";

import type {
    SecurityScenario,
    SecurityResult,
} from "../../data/securityScenarios";

interface Props {
    scenario: SecurityScenario;
    result?: SecurityResult;
    loading: boolean;
    disabled: boolean;
    error?: string;
    onRun: () => void;
}

export default function ScenarioCard({
    scenario,
    result,
    loading,
    disabled,
    error,
    onRun,
}: Props) {
    return (
        <div className="panel flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <div className="rounded-xl bg-teal-50 p-3">
                    <FlaskConical
                        size={24}
                        className="text-teal-700"
                    />
                </div>

                <h2 className="font-bold">
                    {scenario.title}
                </h2>
            </div>

            <p className="text-sm text-slate-500">
                {scenario.description}
            </p>

            <div className="rounded-lg bg-slate-50 p-3 text-sm">
                Expected: <strong>{scenario.expected}</strong>
            </div>

            <button
                className="primary-btn flex items-center justify-center gap-2"
                onClick={onRun}
                disabled={disabled}
            >
                <Play size={16} />
                {loading ? "Running..." : "Run Test"}
            </button>

            {error && (
                <p role="alert" className="text-sm text-red-600">
                    {error}
                </p>
            )}

            {result && (
                <div
                    role="status"
                    className={`rounded-xl border p-4 text-sm ${result.decision === "ALLOW"
                            ? "border-green-200 bg-green-50"
                            : "border-red-200 bg-red-50"
                        }`}
                >
                    <p className="font-bold">
                        {result.source === "demo"
                            ? "SIMULATED"
                            : "BACKEND"}
                        : {result.decision}
                    </p>

                    <p className="mt-2">{result.reason}</p>

                    <p className="mt-2">
                        Rule: <strong>{result.rule}</strong>
                    </p>

                    <p className="mt-2 break-all text-xs">
                        Reference: {result.reference}
                    </p>

                    <p className="mt-2 text-xs">
                        Payment executed:{" "}
                        {result.payment_executed
                            ? "Reported yes"
                            : "No"}
                    </p>
                </div>
            )}
        </div>
    );
}
