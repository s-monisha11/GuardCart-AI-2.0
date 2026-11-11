
import { Settings as SettingsIcon } from "lucide-react";

import PageHeader from "../components/common/PageHeader";
import IntegrationChecks from "../components/common/IntegrationChecks";
import { DEMO_MODE } from "../services/api";

export default function Settings() {
    return (
        <>
            <PageHeader
                title="Settings"
                description="Manage application configuration and API integration."
            />

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="panel">
                    <div className="mb-5 flex items-center gap-3">
                        <SettingsIcon className="text-teal-700" />
                        <h2 className="text-lg font-bold">
                            Application Configuration
                        </h2>
                    </div>

                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between">
                            <span>Application</span>
                            <strong>GuardCart AI 2.0</strong>
                        </div>

                        <div className="flex justify-between">
                            <span>Mode</span>
                            <strong>
                                {DEMO_MODE ? "Demo" : "API"}
                            </strong>
                        </div>

                        <div className="flex justify-between">
                            <span>Payment Provider</span>
                            <strong>PayPal Sandbox</strong>
                        </div>

                        <div>
                            <p className="mb-2 text-slate-500">
                                Backend API URL
                            </p>
                            <code className="block break-all rounded-lg bg-slate-100 p-3">
                                {import.meta.env.VITE_API_BASE_URL ||
                                    "http://localhost:8000"}
                            </code>
                        </div>
                    </div>
                </div>

                <IntegrationChecks />
            </div>
        </>
    );
}
