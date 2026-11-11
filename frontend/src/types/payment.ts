
export interface PayPalOrderResponse {
    order_id: string;
    approval_url: string;
}

export type CaptureStatus =
    | "COMPLETED"
    | "PENDING"
    | "FAILED";

export interface PayPalCaptureResponse {
    order_id: string;
    capture_id: string | null;
    status: CaptureStatus;
}
