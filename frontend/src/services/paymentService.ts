
import { api, DEMO_MODE } from "./api";

import type {
    PayPalOrderResponse,
    PayPalCaptureResponse,
} from "../types/payment";

export async function createPayPalOrder(
    proposalId: string
): Promise<PayPalOrderResponse> {
    if (DEMO_MODE) {
        throw new Error("PayPal checkout is disabled in demo mode.");
    }

    const response = await api.post<PayPalOrderResponse>(
        "/api/paypal/orders",
        { proposal_id: proposalId }
    );

    const data = response.data;

    if (
        !data ||
        typeof data.order_id !== "string" ||
        typeof data.approval_url !== "string"
    ) {
        throw new Error("Invalid PayPal order response.");
    }

    const url = new URL(data.approval_url);

    if (
        url.protocol !== "https:" ||
        ![
            "www.sandbox.paypal.com",
            "sandbox.paypal.com",
        ].includes(url.hostname)
    ) {
        throw new Error("Invalid PayPal Sandbox approval URL.");
    }

    return data;
}

export async function capturePayPalOrder(
    orderId: string
): Promise<PayPalCaptureResponse> {
    if (DEMO_MODE) {
        throw new Error("Payment capture unavailable in demo mode.");
    }

    const response = await api.post<PayPalCaptureResponse>(
        `/api/paypal/orders/${encodeURIComponent(orderId)}/capture`
    );

    const data = response.data;

    if (
        !data ||
        data.order_id !== orderId ||
        !["COMPLETED", "PENDING", "FAILED"].includes(data.status) ||
        (data.capture_id !== null &&
            typeof data.capture_id !== "string")
    ) {
        throw new Error("Invalid PayPal capture response.");
    }

    return data;
}
