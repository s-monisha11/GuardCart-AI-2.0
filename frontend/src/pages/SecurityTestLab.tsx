
import { useState } from "react";
import { ShieldCheck } from "lucide-react";

import ScenarioCard from "../components/security/ScenarioCard";
import { scenarios } from "../data/securityScenarios";
import { runSecurityTest } from "../services/securityService";
import { DEMO_MODE } from "../services/api";

import type {
    ScenarioId,
    SecurityResult,
} from "../data/securityScenarios";

export default function SecurityTestLab() {
    const [results, setResults] = useState<
        Partial<Record<ScenarioId, SecurityResult>>
    >({});

    const [errors, setErrors] = useState<
        Partial<Record<ScenarioId, string>>
    >({});

    const [running, setRunning] = useState<ScenarioId | null>(null);

    const completed = Object.values(results);
    const blocked = completed.filter(
        (result) => result.decision === "BLOCK"
    ).length;
    const allowed = completed.filter(
        (result) => result.decision === "ALLOW"
    ).length;

    async function handleRun(id: ScenarioId) {
        setRunning(id);
        setErrors((prev) => ({ ...prev, [id]: undefined }));
        setResults((prev) => ({ ...prev, [id]: undefined }));

        try {
            const result = await runSecurityTest(id);
            setResults((prev) => ({ ...prev, [id]: result }));
        } catch (error) {
            setErrors((prev) => ({
                ...prev,
                [id]: error instanceof Error
                    ? error.message
                    : "Security test failed",
            }));
        } finally {
            setRunning(null);
        }
    }

    return (
        <div>
            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="text-teal-700" size={30} />
                    <h1 className="text-3xl font-bold">
                        Security Test Lab
                    </h1>
                </div>

                <p className="mt-3 text-slate-500">
                    Test how GuardCart handles safe and unsafe purchases.
                </p>
            </div>

            <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                {DEMO_MODE
                    ? "DEMO MODE — Results are simulated. No real gateway or PayPal actions are executed."
                    : "LIVE API MODE — Results come from your configured FastAPI backend."}
            </div>

            <div className="mb-8 grid gap-4 sm:grid-cols-3">
                <div className="panel">
                    <p className="text-sm text-slate-500">Scenarios Tested</p>
                    <h2 className="mt-2 text-3xl font-bold">
                        {completed.length}
                    </h2>
                </div>

                <div className="panel">
                    <p className="text-sm text-slate-500">Blocked Results</p>
                    <h2 className="mt-2 text-3xl font-bold text-red-600">
                        {blocked}
                    </h2>
                </div>

                <div className="panel">
                    <p className="text-sm text-slate-500">Allowed Results</p>
                    <h2 className="mt-2 text-3xl font-bold text-teal-700">
                        {allowed}
                    </h2>
                </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {scenarios.map((scenario) => (
                    <ScenarioCard
                        key={scenario.id}
                        scenario={scenario}
                        result={results[scenario.id]}
                        error={errors[scenario.id]}
                        loading={running === scenario.id}
                        disabled={running !== null}
                        onRun={() => handleRun(scenario.id)}
                    />
                ))}
            </div>
        </div>
    );
}
