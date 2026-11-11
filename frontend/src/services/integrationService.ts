
import axios from "axios";
import { api } from "./api";
import type { IntegrationResult } from "../types/integration";

interface EndpointCheck {
    id: string;
    name: string;
    endpoint: string;
    validate: (data: unknown) => boolean;
}

const checks: EndpointCheck[] = [
    {
        id: "health",
        name: "Backend Health",
        endpoint: "/api/health",
        validate: () => true,
    },
    {
        id: "transactions",
        name: "Transaction API",
        endpoint: "/api/transactions",
        validate: (data) => Array.isArray(data),
    },
];

function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        if (error.response) {
            return `HTTP ${error.response.status}: Endpoint returned an error.`;
        }

        return "Cannot reach backend. Check server URL, network and CORS.";
    }

    return error instanceof Error
        ? error.message
        : "Unknown connection error.";
}

export async function runIntegrationChecks():
    Promise<IntegrationResult[]> {
    return Promise.all(
        checks.map(async (check) => {
            try {
                const response = await api.get<unknown>(
                    check.endpoint,
                    { timeout: 5000 }
                );

                if (!check.validate(response.data)) {
                    throw new Error(
                        "Response does not match the expected data format."
                    );
                }

                return {
                    id: check.id,
                    name: check.name,
                    endpoint: check.endpoint,
                    status: "success" as const,
                    message: "Endpoint responded successfully.",
                };
            } catch (error) {
                return {
                    id: check.id,
                    name: check.name,
                    endpoint: check.endpoint,
                    status: "failed" as const,
                    message: getErrorMessage(error),
                };
            }
        })
    );
}
