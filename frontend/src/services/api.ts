
import axios from "axios";

export const DEMO_MODE =
    import.meta.env.VITE_DEMO_MODE !== "false";

export const api = axios.create({
    baseURL:
        import.meta.env.VITE_API_BASE_URL ||
        "http://localhost:8000",
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

export const shoppingService = {
    async chat(message: string) {
        const response = await api.post("/api/agent/chat", {
            message,
        });
        return response.data;
    },

    async getProducts() {
        const response = await api.get("/api/products");
        return response.data;
    },
};

export const transactionService = {
    async getTransactions() {
        const response = await api.get("/api/transactions");
        return response.data;
    },
};
