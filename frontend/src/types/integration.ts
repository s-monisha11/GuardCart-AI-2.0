
export type IntegrationStatus = "success" | "failed";

export interface IntegrationResult {
    id: string;
    name: string;
    endpoint: string;
    status: IntegrationStatus;
    message: string;
}
