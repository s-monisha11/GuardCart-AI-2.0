
import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CreditCard, CheckCircle2, AlertCircle } from "lucide-react";

import PageHeader from "../components/common/PageHeader";
import { capturePayPalOrder } from "../services/paymentService";
import { DEMO_MODE } from "../services/api";
import type { PayPalCaptureResponse } from "../types/payment";

export default function PaymentReturn() {
    const [params] = useSearchParams();

    const orderId = params.get("token");

    const [result, setResult] =
        useState<PayPalCaptureResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function confirmPayment() {
        if (!orderId) return;

        setLoading(true);
        setError("");

        try {
            const response = await capturePayPalOrder(orderId);
            setResult(response);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to verify payment."
            );
        } finally {
            setLoading(false);
        }
    }

    const completed =
        result?.status === "COMPLETED" &&
        Boolean(result.capture_id);

    return (
        <>
            <PageHeader
                title="PayPal Payment Status"
                description="Verify your Sandbox payment."
            />

            <div className="panel mx-auto max-w-xl text-center">
                <CreditCard
                    size={42}
                    className="mx-auto mb-5 text-teal-700"
                />

                <h2 className="text-xl font-bold">
                    Payment Verification
                </h2>

                <p className="mt-3 break-all text-sm text-slate-500">
                    Order: {orderId || "No PayPal order reference"}
                </p>

                {!result && (
                    <button
                        className="primary-btn mt-6"
                        disabled={!orderId || loading || DEMO_MODE}
                        onClick={() => void confirmPayment()}
                    >
                        {loading
                            ? "Verifying..."
                            : "Confirm Sandbox Payment"}
                    </button>
                )}

                {completed && (
                    <div role="status" className="mt-6 rounded-xl bg-green-50 p-5">
                        <CheckCircle2
                            className="mx-auto text-green-700"
                            size={32}
                        />

                        <p className="mt-3 font-bold text-green-800">
                            Payment Completed
                        </p>

                        <p className="mt-2 break-all text-sm">
                            Capture ID: {result?.capture_id}
                        </p>

                        <p className="mt-2 text-xs">
                            Confirmed by the backend payment response.
                        </p>
                    </div>
                )}

                {result && !completed && (
                    <div role="status" className="mt-6 rounded-xl bg-amber-50 p-4">
                        <p className="font-semibold">
                            Payment Status: {result.status}
                        </p>
                        <p className="mt-2 text-sm">
                            Payment completion has not been confirmed.
                        </p>
                    </div>
                )}

                {error && (
                    <div role="alert" className="mt-5 rounded-xl bg-red-50 p-4">
                        <AlertCircle className="mx-auto text-red-600" />
                        <p className="mt-2 text-sm text-red-700">{error}</p>
                        <button
                            className="secondary-btn mt-3"
                            onClick={() => void confirmPayment()}
                            disabled={loading || !orderId || DEMO_MODE}
                        >
                            Retry Verification
                        </button>
                    </div>
                )}

                <Link
                    to="/transactions"
                    className="mt-6 inline-block text-sm font-medium text-teal-700"
                >
                    View Transaction History
                </Link>
            </div>
        </>
    );
}
