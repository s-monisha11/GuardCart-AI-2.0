
import { CheckCircle2 } from "lucide-react";

import PageHeader from "../components/common/PageHeader";
import ChatInterface from "../components/shopping/ChatInterface";
import ProductCard from "../components/shopping/ProductCard";
import { products } from "../data/products";

export default function AIShopping() {
    return (
        <>
            <PageHeader
                title="AI Shopping Assistant"
                description="Discover and compare products using natural language."
            />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <ChatInterface />
                </div>

                <div className="panel">
                    <h2 className="mb-5 font-bold">Demo Spending Policy</h2>

                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between">
                            <span>Maximum Transaction</span>
                            <strong>$50</strong>
                        </div>

                        <div className="flex justify-between">
                            <span>Daily Spending Limit</span>
                            <strong>$100</strong>
                        </div>

                        <div className="flex justify-between">
                            <span>Approval Required</span>
                            <strong className="text-teal-700">Yes</strong>
                        </div>

                        <div className="flex items-center gap-2 rounded-xl bg-teal-50 p-3 text-teal-800">
                            <CheckCircle2 size={18} />
                            Demo policy — Not backend verified
                        </div>
                    </div>
                </div>
            </div>

            <h2 className="mb-5 mt-9 text-xl font-bold">
                Sample Product Recommendations
            </h2>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </>
    );
}
