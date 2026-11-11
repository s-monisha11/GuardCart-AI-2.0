
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck, ShoppingBag, LockKeyhole } from "lucide-react";

import PageHeader from "../components/common/PageHeader";
import { products } from "../data/products";

export default function PurchaseApprovals() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const [quantity, setQuantity] = useState(1);

    const productId = Number(params.get("product"));
    const product = products.find((p) => p.id === productId);

    if (!product) {
        return (
            <>
                <PageHeader
                    title="Purchase Approvals"
                    description="Review purchases before authorization."
                />
                <div className="panel text-center">
                    <ShoppingBag className="mx-auto mb-4 text-teal-700" size={42} />
                    <p>No product selected.</p>
                    <button
                        className="primary-btn mt-5"
                        onClick={() => navigate("/catalog")}
                    >
                        Browse Products
                    </button>
                </div>
            </>
        );
    }

    const total = product.price * quantity;
    const budget = 50;

    return (
        <>
            <PageHeader
                title="Purchase Review & Approval"
                description="Inspect the purchase before payment authorization."
            />

            <div className="mb-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
                DEMO PREVIEW — No backend security validation or PayPal
                payment has been executed.
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="panel lg:col-span-2">
                    <h2 className="mb-5 text-xl font-bold">Order Summary</h2>

                    <div className="flex gap-5">
                        <div className="rounded-xl bg-slate-100 p-8">
                            <ShoppingBag size={44} className="text-slate-400" />
                        </div>

                        <div>
                            <h3 className="font-bold">{product.name}</h3>
                            <p className="mt-2 text-sm text-slate-500">
                                Merchant: {product.merchant}
                            </p>
                            <p className="mt-2 text-sm">{product.description}</p>
                            <p className="mt-3 text-2xl font-bold">
                                ${product.price.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    <div className="mt-7 border-t border-slate-200 pt-5">
                        <label htmlFor="quantity" className="mb-2 block font-semibold">
                            Quantity
                        </label>

                        <input
                            id="quantity"
                            className="field max-w-32"
                            type="number"
                            min={1}
                            max={5}
                            value={quantity}
                            onChange={(event) =>
                                setQuantity(
                                    Math.min(5, Math.max(1, Number(event.target.value) || 1))
                                )
                            }
                        />
                    </div>

                    <div className="mt-6 flex justify-between rounded-xl bg-slate-50 p-5">
                        <strong>Estimated Total</strong>
                        <strong className="text-xl text-teal-700">
                            ${total.toFixed(2)}
                        </strong>
                    </div>
                </div>

                <div className="panel">
                    <div className="mb-5 flex items-center gap-2">
                        <ShieldCheck className="text-teal-700" />
                        <h2 className="text-lg font-bold">Security Review</h2>
                    </div>

                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between">
                            <span>Transaction Limit</span>
                            <strong>${budget.toFixed(2)}</strong>
                        </div>

                        <div className="flex justify-between">
                            <span>Daily Limit</span>
                            <strong>$100.00</strong>
                        </div>

                        <div className="flex justify-between gap-2">
                            <span>Estimated Budget</span>
                            <strong
                                className={total <= budget ? "text-teal-700" : "text-red-600"}
                            >
                                {total <= budget ? "Within Limit" : "Exceeds Limit"}
                            </strong>
                        </div>

                        {[
                            "Merchant Authorization",
                            "Price Integrity",
                            "SHA-256 Order Integrity",
                            "Human Approval",
                        ].map((check) => (
                            <div key={check} className="flex justify-between gap-2">
                                <span>{check}</span>
                                <span className="text-amber-600">Not Verified</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                        <LockKeyhole size={18} className="mb-2" />
                        Waiting for backend purchase validation.
                    </div>

                    <button className="primary-btn mt-5 w-full" disabled>
                        Approve Purchase
                    </button>

                    <button
                        className="secondary-btn mt-3 w-full"
                        onClick={() => navigate("/catalog")}
                    >
                        Back to Catalog
                    </button>

                    <p className="mt-5 text-center text-xs text-slate-400">
                        PayPal Sandbox — Not Connected
                    </p>
                </div>
            </div>
        </>
    );
}
