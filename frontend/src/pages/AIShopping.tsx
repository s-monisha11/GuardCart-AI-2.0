
import { useState } from "react";

import PageHeader from "../components/common/PageHeader";
import ChatInterface from "../components/shopping/ChatInterface";
import ProductCard from "../components/shopping/ProductCard";
import ProductComparison from "../components/shopping/ProductComparison";

import { sendShoppingMessage } from "../services/shoppingService";
import { DEMO_MODE } from "../services/api";
import { products } from "../data/products";

import type { Product } from "../data/products";
import type { ChatMessage } from "../components/shopping/ChatInterface";

export default function AIShopping() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "Hello! What would you like to shop for?",
        },
    ]);

    const [recommendations, setRecommendations] = useState<Product[]>(
        DEMO_MODE ? products : []
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSend(message: string) {
        if (loading) return;

        const id = Date.now().toString();

        setMessages((prev) => [
            ...prev,
            { id: `${id}-user`, role: "user", content: message },
        ]);

        setLoading(true);
        setError(null);
        setRecommendations([]);

        try {
            const result = await sendShoppingMessage(message);

            setMessages((prev) => [
                ...prev,
                {
                    id: `${id}-assistant`,
                    role: "assistant",
                    content: result.reply,
                },
            ]);

            setRecommendations(result.recommendations);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to contact shopping service"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <PageHeader
                title="AI Shopping Assistant"
                description="Discover and compare products using natural language."
            />

            <div className="mb-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
                {DEMO_MODE
                    ? "DEMO MODE — Product results are sample data, not AI-generated recommendations."
                    : "LIVE API MODE — Chat results come from your configured FastAPI backend."}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <ChatInterface
                        messages={messages}
                        loading={loading}
                        error={error}
                        onSend={handleSend}
                    />
                </div>

                <div className="panel">
                    <h2 className="mb-5 font-bold">Spending Policy Preview</h2>

                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between">
                            <span>Transaction Limit</span>
                            <strong>$50</strong>
                        </div>

                        <div className="flex justify-between">
                            <span>Daily Limit</span>
                            <strong>$100</strong>
                        </div>

                        <div className="flex justify-between">
                            <span>Human Approval</span>
                            <strong>Required</strong>
                        </div>

                        <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                            Example settings only. The backend must enforce
                            actual financial policies.
                        </p>
                    </div>
                </div>
            </div>

            <h2 className="mb-5 mt-8 text-xl font-bold">
                {DEMO_MODE
                    ? "Sample Product Recommendations"
                    : "AI Product Recommendations"}
            </h2>

            {recommendations.length === 0 ? (
                <div className="panel text-slate-500">
                    {loading
                        ? "Finding products..."
                        : "Enter a shopping request to see recommendations."}
                </div>
            ) : (
                <>
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {recommendations.map((product) => (
                          <ProductCard
    key={product.id}
                     product={product}
                     reviewEnabled={!DEMO_MODE}
               />
                        ))}
                    </div>

                    <ProductComparison products={recommendations} />
                </>
            )}
        </>
    );
}
