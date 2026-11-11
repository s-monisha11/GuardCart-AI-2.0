
export type CheckStatus = "PASS" | "FAIL" | "PENDING";

export interface PurchaseCheck {
    name: string;
    status: CheckStatus;
    reason: string;
}

export interface PurchaseProposal {
    id: string;
    product_id: number;
    quantity: number;
    total_amount: number;
    currency: string;
    decision: "ALLOW" | "BLOCK";
    checks: PurchaseCheck[];
    snapshot_sha256: string | null;
}

export interface PurchaseApprovalResponse {
    proposal_id: string;
    approval_status: "APPROVED" | "REJECTED";
}
