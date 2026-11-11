
import { api, DEMO_MODE } from "./api";
import { products } from "../data/products";
import type { Product } from "../data/products";

export interface ShoppingReply {
    reply: string;
    recommendations: Product[];
}

function isProduct(value: unknown): value is Product {
    if (!value || typeof value !== "object") return false;

    const p = value as Record<string, unknown>;

    return (
        typeof p.id === "number" &&
        typeof p.name === "string" &&
        typeof p.price === "number" &&
        Number.isFinite(p.price) &&
        typeof p.merchant === "string" &&
        typeof p.description === "string" &&
        Array.isArray(p.features) &&
        p.features.every((f) => typeof f === "string")
    );
}

export async function sendShoppingMessage(
    message: string
): Promise<ShoppingReply> {
    if (DEMO_MODE) {
        await new Promise((resolve) => setTimeout(resolve, 500));

        return {
            reply:
                "DEMO: Here are three sample products. " +
                "These are not personalized AI recommendations.",
            recommendations: products,
        };
    }

    const response = await api.post<unknown>(
        "/api/agent/chat",
        { message }
    );

    if (!response.data || typeof response.data !== "object") {
        throw new Error("Invalid AI response");
    }

    const data = response.data as Record<string, unknown>;
    const recommendations = data.recommendations ?? [];

    if (
        typeof data.reply !== "string" ||
        !Array.isArray(recommendations) ||
        !recommendations.every(isProduct)
    ) {
        throw new Error("AI API response format does not match the frontend contract");
    }

    return {
        reply: data.reply,
        recommendations: recommendations as Product[],
    };
}
