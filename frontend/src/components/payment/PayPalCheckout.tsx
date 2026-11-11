
import { useState } from "react";
import { CreditCard, LockKeyhole } from "lucide-react";

import { createPayPalOrder } from "../../services/paymentService";
import { DEMO_MODE } from "../../services/api";

interface Props {
    proposalId: string;
}

export default function PayPalCheckout({ proposalId }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleCheckout() {
        setLoading(true);
        setError("");

        try {
            const order = await createPayPalOrder(proposalId);

            window.location.assign(order.approval_url);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Could not start PayPal checkout."
            );
            setLoading(false);
        }
    }

    return (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
                <CreditCard className="text-teal-700" size={26} />
                <div>
                    <h3 className="font-bold">PayPal Checkout</h3>
                    <p className="text-xs text-slate-500">
                        Sandbox Test Environment
                    </p>
                </div>
            </div>

            <p className="mt-4 text-sm text-slate-600">
                Continue to PayPal Sandbox to authorize
                your test purchase.
            </p>

            <button
                className="primary-btn mt-5 w-full"
                disabled={loading || DEMO_MODE}
                onClick={() => void handleCheckout()}
            >
                <span className="flex items-center justify-center gap-2">
                    <LockKeyhole size={18} />
                    {loading ? "Preparing Checkout..." : "Continue to PayPal"}
                </span>
            </button>

            {error && (
                <p role="alert" className="mt-3 text-sm text-red-600">
                    {error}
                </p>
            )}

            {DEMO_MODE && (
                <p className="mt-3 text-xs text-amber-700">
                    Checkout disabled until live backend integration.
                </p>
            )}
        </div>
    );
}
