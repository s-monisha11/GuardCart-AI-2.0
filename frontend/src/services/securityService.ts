
import { api, DEMO_MODE } from "./api";

import type {
    ScenarioId,
    SecurityResult,
} from "../data/securityScenarios";

type GatewayResponse =
    Omit<SecurityResult, "source">;

const demoResults: Record<
    ScenarioId,
    Omit<GatewayResponse, "reference">
> = {
    normal_purchase: {
        decision: "ALLOW",
        rule: "ALL_CHECKS_PASSED",
        reason: "Simulated policy check passed. User approval is still required.",
        payment_executed: false,
    },

    budget_violation: {
        decision: "BLOCK",
        rule: "TRANSACTION_LIMIT",
        reason: "$299 exceeds the permitted $50 budget.",
        payment_executed: false,
    },

    prompt_injection: {
        decision: "BLOCK",
        rule: "UNSAFE_PURCHASE_PROPOSAL",
        reason: "Simulated unsafe proposal violates the budget policy.",
        payment_executed: false,
    },

    unauthorized_merchant: {
        decision: "BLOCK",
        rule: "MERCHANT_NOT_ALLOWED",
        reason: "Merchant is not on the approved list.",
        payment_executed: false,
    },

    duplicate_payment: {
        decision: "BLOCK",
        rule: "DUPLICATE_CAPTURE",
        reason: "Simulated duplicate payment request rejected.",
        payment_executed: false,
    },
};

function isGatewayResponse(
    value: unknown
): value is GatewayResponse {
    if (!value || typeof value !== "object") {
        return false;
    }

    const r = value as Record<string, unknown>;

    return (
        (r.decision === "ALLOW" ||
            r.decision === "BLOCK") &&
        typeof r.reason === "string" &&
        typeof r.rule === "string" &&
        typeof r.reference === "string" &&
        typeof r.payment_executed === "boolean"
    );
}

export async function runSecurityTest(
    scenario: ScenarioId
): Promise<SecurityResult> {
    if (DEMO_MODE) {
        return {
            ...demoResults[scenario],
            reference: `DEMO-${scenario}`,
            source: "demo",
        };
    }

    const response = await api.post<unknown>(
        "/api/security-tests/run",
        { scenario }
    );

    if (!isGatewayResponse(response.data)) {
        throw new Error("Invalid backend response");
    }

    return {
        ...response.data,
        source: "backend",
    };
}
