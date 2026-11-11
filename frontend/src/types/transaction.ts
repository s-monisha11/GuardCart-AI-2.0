
export type PaymentStatus =
    | "COMPLETED"
    | "BLOCKED"
    | "PENDING"
    | "FAILED"
    | "CANCELLED";

export type SecurityDecision =
    | "ALLOW"
    | "BLOCK"
    | "PENDING";

export interface Transaction {
    id: string;
    product_name: string;
    merchant: string;
    amount: number;
    currency: string;
    created_at: string;
    payment_status: PaymentStatus;
    security_decision: SecurityDecision;
    violated_rule: string | null;
    paypal_order_id: string | null;
    capture_id: string | null;
    original_request: string;
    approval_status: string;
    integrity_status: string;
}
