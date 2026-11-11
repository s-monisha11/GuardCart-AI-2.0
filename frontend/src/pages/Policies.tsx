
import { useState } from "react";
import { ShieldCheck, Save } from "lucide-react";

import PageHeader from "../components/common/PageHeader";
import { DEMO_MODE } from "../services/api";

interface Policy {
    maxTransaction: number;
    dailyLimit: number;
    merchants: string;
    blockedCategories: string;
    requireApproval: boolean;
}

const initialPolicy: Policy = {
    maxTransaction: 50,
    dailyLimit: 100,
    merchants: "Demo Store 01",
    blockedCategories: "Restricted Items",
    requireApproval: true,
};

export default function Policies() {
    const [policy, setPolicy] = useState<Policy>(initialPolicy);
    const [saved, setSaved] = useState(false);

    function update<K extends keyof Policy>(
        field: K,
        value: Policy[K]
    ) {
        setPolicy((previous) => ({
            ...previous,
            [field]: value,
        }));
        setSaved(false);
    }

    function savePolicy(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!DEMO_MODE) return;

        setSaved(true);
    }

    return (
        <>
            <PageHeader
                title="Spending Policies"
                description="Configure your AI shopping financial restrictions."
            />

            <div className="mb-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
                {DEMO_MODE
                    ? "DEMO MODE — These settings affect this form only. Backend security policies are not changed."
                    : "Policy editing is disabled until the backend API contract is confirmed."}
            </div>

            <form onSubmit={savePolicy} className="panel max-w-3xl">
                <div className="mb-6 flex items-center gap-3">
                    <ShieldCheck className="text-teal-700" size={26} />
                    <h2 className="text-xl font-bold">
                        Financial Security Rules
                    </h2>
                </div>

                <div className="space-y-5">
                    <div>
                        <label htmlFor="maxTransaction" className="mb-2 block font-medium">
                            Maximum Transaction Amount (USD)
                        </label>
                        <input
                            id="maxTransaction"
                            className="field"
                            type="number"
                            min="1"
                            step="0.01"
                            required
                            value={policy.maxTransaction}
                            disabled={!DEMO_MODE}
                            onChange={(e) =>
                                update("maxTransaction", Number(e.target.value))
                            }
                        />
                    </div>

                    <div>
                        <label htmlFor="dailyLimit" className="mb-2 block font-medium">
                            Daily Spending Limit (USD)
                        </label>
                        <input
                            id="dailyLimit"
                            className="field"
                            type="number"
                            min="1"
                            step="0.01"
                            required
                            value={policy.dailyLimit}
                            disabled={!DEMO_MODE}
                            onChange={(e) =>
                                update("dailyLimit", Number(e.target.value))
                            }
                        />
                    </div>

                    <div>
                        <label htmlFor="merchants" className="mb-2 block font-medium">
                            Approved Merchants
                        </label>
                        <input
                            id="merchants"
                            className="field"
                            value={policy.merchants}
                            disabled={!DEMO_MODE}
                            onChange={(e) => update("merchants", e.target.value)}
                        />
                        <p className="mt-1 text-xs text-slate-500">
                            Separate merchants using commas.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="categories" className="mb-2 block font-medium">
                            Blocked Product Categories
                        </label>
                        <input
                            id="categories"
                            className="field"
                            value={policy.blockedCategories}
                            disabled={!DEMO_MODE}
                            onChange={(e) =>
                                update("blockedCategories", e.target.value)
                            }
                        />
                    </div>

                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={policy.requireApproval}
                            disabled={!DEMO_MODE}
                            onChange={(e) =>
                                update("requireApproval", e.target.checked)
                            }
                            className="h-4 w-4 accent-teal-700"
                        />
                        <span className="font-medium">Require User Approval</span>
                    </label>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                    <button
                        type="submit"
                        disabled={!DEMO_MODE}
                        className="primary-btn flex items-center gap-2"
                    >
                        <Save size={18} />
                        Save Demo Policy
                    </button>

                    <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => {
                            setPolicy(initialPolicy);
                            setSaved(false);
                        }}
                        disabled={!DEMO_MODE}
                    >
                        Reset
                    </button>
                </div>

                {saved && (
                    <p role="status" className="mt-4 text-sm text-teal-700">
                        Demo settings updated in this page only.
                        No backend policy has been saved.
                    </p>
                )}
            </form>
        </>
    );
}
