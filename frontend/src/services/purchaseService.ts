
import { api, DEMO_MODE } from "./api";

import type {
    PurchaseProposal,
    PurchaseApprovalResponse,
} from "../types/purchase";

export async function proposePurchase(
    productId: number,
    quantity: number
): Promise<PurchaseProposal> {
    if (DEMO_MODE) {
        throw new Error("Backend validation unavailable in demo mode.");
    }

    const response = await api.post<PurchaseProposal>(
        "/api/purchases/propose",
        {
            product_id: productId,
            quantity,
        }
    );

    const proposal = response.data;

    if (
        !proposal ||
        typeof proposal.id !== "string" ||
        proposal.product_id !== productId ||
        proposal.quantity !== quantity ||
        !["ALLOW", "BLOCK"].includes(proposal.decision) ||
        !Number.isFinite(proposal.total_amount) ||
        !Array.isArray(proposal.checks)
    ) {
        throw new Error("Unexpected purchase proposal response.");
    }

    return proposal;
}

export async function approvePurchase(
    proposalId: string
): Promise<PurchaseApprovalResponse> {
    if (DEMO_MODE) {
        throw new Error("Real approval is unavailable in demo mode.");
    }

    const response = await api.post<PurchaseApprovalResponse>(
        `/api/purchases/${encodeURIComponent(proposalId)}/approve`
    );

    if (
        response.data?.proposal_id !== proposalId ||
        !["APPROVED", "REJECTED"].includes(
            response.data?.approval_status
        )
    ) {
        throw new Error("Unexpected approval response.");
    }

    return response.data;
}
