
import { api, DEMO_MODE } from "./api";
import { demoTransactions } from "../data/demoTransactions";
import type { Transaction } from "../types/transaction";

function isTransaction(value: unknown): value is Transaction {
    if (!value || typeof value !== "object") return false;

    const item = value as Record<string, unknown>;

    return (
        typeof item.id === "string" &&
        typeof item.product_name === "string" &&
        typeof item.merchant === "string" &&
        typeof item.amount === "number" &&
        typeof item.currency === "string" &&
        typeof item.created_at === "string" &&
        typeof item.payment_status === "string" &&
        typeof item.security_decision === "string" &&
        (item.violated_rule === null ||
            typeof item.violated_rule === "string") &&
        (item.paypal_order_id === null ||
            typeof item.paypal_order_id === "string") &&
        (item.capture_id === null ||
            typeof item.capture_id === "string") &&
        typeof item.original_request === "string" &&
        typeof item.approval_status === "string" &&
        typeof item.integrity_status === "string"
    );
}

export async function loadTransactions(): Promise<Transaction[]> {
    if (DEMO_MODE) {
        return demoTransactions;
    }

    const response = await api.get<unknown>("/api/transactions");

    if (
        !Array.isArray(response.data) ||
        !response.data.every(isTransaction)
    ) {
        throw new Error(
            "Unexpected transaction API response. Check the backend contract."
        );
    }

    return response.data;
}
