
import { useState } from "react";
import { Settings as SettingsIcon, Server } from "lucide-react";

import PageHeader from "../components/common/PageHeader";
import { api, DEMO_MODE } from "../services/api";

export default function Settings() {
    const [checking, setChecking] = useState(false);
    const [status, setStatus] = useState("Not checked");

    async function checkBackend() {
        setChecking(true);
        setStatus("Checking...");

        try {
            await api.get("/api/health");
            setStatus("Backend responding");
        } catch {
            setStatus("Backend unavailable or health endpoint missing");
        } finally {
            setChecking(false);
        }
    }

    return (
        <>
            <PageHeader
                title="Settings"
                description="Manage application information and connectivity."
            />

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="panel">
                    <div className="mb-5 flex items-center gap-3">
                        <SettingsIcon className="text-teal-700" />
                        <h2 className="text-lg font-bold">
                            Application Information
                        </h2>
                    </div>

                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between">
                            <span>Application</span>
                            <strong>GuardCart AI 2.0</strong>
                        </div>

                        <div className="flex justify-between">
                            <span>Environment</span>
                            <strong>
                                {DEMO_MODE ? "Demo Mode" : "API Mode"}
                            </strong>
                        </div>

                        <div className="flex justify-between">
                            <span>Payment Environment</span>
                            <strong>Sandbox Planned</strong>
                        </div>

                        <div className="flex justify-between">
                            <span>Frontend</span>
                            <strong>React + TypeScript</strong>
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="mb-5 flex items-center gap-3">
                        <Server className="text-teal-700" />
                        <h2 className="text-lg font-bold">
                            Backend Connection
                        </h2>
                    </div>

                    <p className="mb-3 text-sm text-slate-500">
                        Configured API URL:
                    </p>

                    <code className="block break-all rounded-lg bg-slate-100 p-3 text-sm">
                        {import.meta.env.VITE_API_BASE_URL ||
                            "http://localhost:8000"}
                    </code>

                    <p role="status" className="mt-4 text-sm">
                        Status: <strong>{status}</strong>
                    </p>

                    <button
                        className="primary-btn mt-5"
                        onClick={checkBackend}
                        disabled={checking}
                    >
                        {checking ? "Checking..." : "Check Connection"}
                    </button>

                    <p className="mt-4 text-xs text-slate-500">
                        This checks only API reachability, not payment
                        integration or financial security.
                    </p>
                </div>
            </div>
        </>
    );
}
