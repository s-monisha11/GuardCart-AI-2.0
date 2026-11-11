
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
    ShieldCheck,
    ShoppingBag,
    ArrowLeft,
    LockKeyhole,
    AlertTriangle,
    CreditCard,
} from "lucide-react";

import PageHeader from "../components/common/PageHeader";
import PurchaseChecks from "../components/purchase/PurchaseChecks";
import PayPalCheckout from "../components/payment/PayPalCheckout";

import { products } from "../data/products";
import { DEMO_MODE } from "../services/api";

import {
    proposePurchase,
    approvePurchase,
} from "../services/purchaseService";

import type {
    PurchaseProposal,
    PurchaseApprovalResponse,
} from "../types/purchase";

export default function PurchaseApprovals() {
    const navigate = useNavigate();
    const [params] = useSearchParams();

    const productId = Number(params.get("product"));

    const product = products.find(
        (item) => item.id === productId
    );

    // Purchase state
    const [quantity, setQuantity] = useState(1);

    const [proposal, setProposal] =
        useState<PurchaseProposal | null>(null);

    const [approval, setApproval] =
        useState<PurchaseApprovalResponse | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Reset when user selects another product
    useEffect(() => {
        setQuantity(1);
        setProposal(null);
        setApproval(null);
        setError("");
    }, [productId]);

    // Only use validation for the current exact selection
    const currentProposal =
        proposal &&
            product &&
            proposal.product_id === product.id &&
            proposal.quantity === quantity
            ? proposal
            : null;

    // ===================================
    // VALIDATE PURCHASE
    // ===================================

    async function handleValidate() {
        if (!product || loading || DEMO_MODE) return;

        setLoading(true);
        setError("");
        setProposal(null);
        setApproval(null);

        try {
            const result = await proposePurchase(
                product.id,
                quantity
            );

            setProposal(result);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to validate purchase."
            );
        } finally {
            setLoading(false);
        }
    }

    // ===================================
    // APPROVE PURCHASE
    // ===================================

    async function handleApprove() {
        if (
            !currentProposal ||
            currentProposal.decision !== "ALLOW" ||
            loading ||
            DEMO_MODE
        ) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await approvePurchase(
                currentProposal.id
            );

            setApproval(result);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Purchase approval failed."
            );
        } finally {
            setLoading(false);
        }
    }

    // ===================================
    // QUANTITY CHANGE
    // ===================================

    function handleQuantityChange(value: number) {
        const newQuantity = Math.min(
            5,
            Math.max(1, value || 1)
        );

        setQuantity(newQuantity);

        // A changed order requires fresh validation
        setProposal(null);
        setApproval(null);
        setError("");
    }

    // ===================================
    // NO PRODUCT SELECTED
    // ===================================

    if (!product) {
        return (
            <>
                <PageHeader
                    title="Purchase Approvals"
                    description="Review purchases before payment authorization."
                />

                <div className="panel mx-auto max-w-xl text-center">
                    <ShoppingBag
                        className="mx-auto mb-5 text-teal-700"
                        size={48}
                    />

                    <h2 className="text-2xl font-bold">
                        No Product Selected
                    </h2>

                    <p className="mt-3 text-slate-500">
                        Select a product from the catalog
                        to review your purchase.
                    </p>

                    <button
                        className="primary-btn mt-6"
                        onClick={() => navigate("/catalog")}
                    >
                        Browse Products
                    </button>
                </div>
            </>
        );
    }

    const estimatedTotal = product.price * quantity;

    const approved =
        currentProposal !== null &&
        approval?.proposal_id === currentProposal.id &&
        approval?.approval_status === "APPROVED";

    // ===================================
    // PURCHASE REVIEW PAGE
    // ===================================

    return (
        <>
            <button
                className="mb-5 flex items-center gap-2 text-sm text-slate-500 hover:text-teal-700"
                onClick={() => navigate("/catalog")}
            >
                <ArrowLeft size={18} />
                Back to Product Catalog
            </button>

            <PageHeader
                title="Purchase Review & Approval"
                description="Review your order and verify security before payment."
            />

            {/* DEMO MODE WARNING */}
            {DEMO_MODE && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <AlertTriangle size={22} />

                    <p>
                        <strong>DEMO MODE:</strong> Backend security
                        validation, purchase approval and PayPal
                        payments are not connected yet.
                    </p>
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">

                {/* ============================ */}
                {/* PRODUCT & ORDER SUMMARY */}
                {/* ============================ */}

                <div className="panel lg:col-span-2">
                    <div className="mb-6 flex items-center gap-3">
                        <ShoppingBag className="text-teal-700" />

                        <h2 className="text-xl font-bold">
                            Order Summary
                        </h2>
                    </div>

                    <div className="flex flex-col gap-6 sm:flex-row">
                        <div className="flex h-44 w-full items-center justify-center rounded-xl bg-slate-100 sm:w-48">
                            <ShoppingBag
                                size={55}
                                className="text-slate-400"
                            />
                        </div>

                        <div className="flex-1">
                            <h3 className="text-xl font-bold">
                                {product.name}
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                                Merchant: {product.merchant}
                            </p>

                            <p className="mt-4 text-slate-600">
                                {product.description}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {product.features.map((feature) => (
                                    <span
                                        key={feature}
                                        className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                                    >
                                        {feature}
                                    </span>
                                ))}
                            </div>

                            <p className="mt-5 text-2xl font-bold">
                                ${product.price.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    {/* QUANTITY */}
                    <div className="mt-8 border-t border-slate-200 pt-6">
                        <label
                            htmlFor="quantity"
                            className="mb-3 block font-semibold"
                        >
                            Quantity
                        </label>

                        <input
                            id="quantity"
                            type="number"
                            min={1}
                            max={5}
                            value={quantity}
                            disabled={loading || approved}
                            onChange={(event) =>
                                handleQuantityChange(
                                    Number(event.target.value)
                                )
                            }
                            className="field max-w-32"
                        />
                    </div>

                    {/* PRICE SUMMARY */}
                    <div className="mt-7 rounded-xl bg-slate-50 p-5">
                        <h3 className="mb-5 font-bold">
                            Payment Summary
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span>Unit Price</span>

                                <span>
                                    ${product.price.toFixed(2)}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span>Quantity</span>
                                <span>{quantity}</span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span>Merchant</span>
                                <span>{product.merchant}</span>
                            </div>

                            <div className="flex justify-between border-t border-slate-200 pt-4 text-xl font-bold">
                                <span>Estimated Total</span>

                                <span className="text-teal-700">
                                    ${estimatedTotal.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* VALIDATION BUTTON */}
                    <button
                        className="primary-btn mt-6 w-full"
                        onClick={() => void handleValidate()}
                        disabled={loading || DEMO_MODE || approved}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <ShieldCheck size={18} />

                            {loading
                                ? "Processing..."
                                : "Validate Purchase"}
                        </span>
                    </button>

                    <p className="mt-3 text-xs text-slate-500">
                        Final payable amount and security rules
                        are determined by the backend.
                    </p>
                </div>

                {/* ============================ */}
                {/* SECURITY REVIEW */}
                {/* ============================ */}

                <div className="panel">
                    <div className="mb-6 flex items-center gap-3">
                        <ShieldCheck
                            className="text-teal-700"
                            size={28}
                        />

                        <h2 className="text-xl font-bold">
                            Security Review
                        </h2>
                    </div>

                    {/* NO VALIDATION */}
                    {!currentProposal && (
                        <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
                            <LockKeyhole
                                size={20}
                                className="mb-2"
                            />

                            Waiting for backend security validation.
                        </div>
                    )}

                    {/* BACKEND VALIDATION */}
                    {currentProposal && (
                        <>
                            <div className="mb-5 rounded-xl bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">
                                    Gateway Decision
                                </p>

                                <p
                                    className={`mt-2 text-xl font-bold ${currentProposal.decision === "ALLOW"
                                            ? "text-teal-700"
                                            : "text-red-600"
                                        }`}
                                >
                                    {currentProposal.decision}
                                </p>

                                <p className="mt-3 text-sm">
                                    Validated Amount:{" "}
                                    <strong>
                                        {currentProposal.currency}{" "}
                                        {currentProposal.total_amount.toFixed(2)}
                                    </strong>
                                </p>
                            </div>

                            <h3 className="mb-4 font-semibold">
                                Security Checks
                            </h3>

                            <PurchaseChecks
                                checks={currentProposal.checks}
                            />

                            {/* ORDER INTEGRITY */}
                            {currentProposal.snapshot_sha256 && (
                                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                                    <p className="text-sm font-semibold">
                                        Order Snapshot SHA-256
                                    </p>

                                    <p className="mt-2 break-all text-xs text-slate-500">
                                        {currentProposal.snapshot_sha256}
                                    </p>

                                    <p className="mt-2 text-xs text-slate-500">
                                        Hash supplied by the backend.
                                        Its presence alone does not prove
                                        integrity verification.
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                    {/* ERROR */}
                    {error && (
                        <div
                            role="alert"
                            className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"
                        >
                            {error}
                        </div>
                    )}

                    {/* APPROVAL BUTTON */}
                    <button
                        className="primary-btn mt-6 w-full"
                        disabled={
                            loading ||
                            DEMO_MODE ||
                            !currentProposal ||
                            currentProposal.decision !== "ALLOW" ||
                            approved
                        }
                        onClick={() => void handleApprove()}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <LockKeyhole size={18} />

                            {approved
                                ? "Purchase Approved"
                                : "Approve Purchase"}
                        </span>
                    </button>

                    {/* APPROVAL RESULT */}
                    {approval && currentProposal && (
                        <div
                            role="status"
                            className={`mt-5 rounded-xl p-4 text-sm ${approved
                                    ? "bg-green-50 text-green-800"
                                    : "bg-amber-50 text-amber-800"
                                }`}
                        >
                            <strong>
                                Backend Approval: {approval.approval_status}
                            </strong>
                        </div>
                    )}

                    {/* ============================ */}
                    {/* PAYPAL CHECKOUT */}
                    {/* ============================ */}

                    {approved && currentProposal && (
                        <PayPalCheckout
                            proposalId={currentProposal.id}
                        />
                    )}

                    {/* PAYMENT INFORMATION */}
                    <div className="mt-6 border-t border-slate-200 pt-5 text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-600">
                            <CreditCard size={19} />

                            <span className="text-sm font-semibold">
                                PayPal Sandbox
                            </span>
                        </div>

                        <p className="mt-3 text-xs text-slate-400">
                            Payment requires PayPal buyer authorization
                            and backend-verified capture.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
