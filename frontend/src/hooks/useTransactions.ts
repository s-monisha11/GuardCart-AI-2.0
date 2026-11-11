
import { useEffect, useState } from "react";

import { loadTransactions } from "../services/transactionService";
import type { Transaction } from "../types/transaction";

export function useTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let active = true;

        loadTransactions()
            .then((data) => {
                if (active) {
                    setTransactions(data);
                }
            })
            .catch((err: unknown) => {
                if (active) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load transactions."
                    );
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [reloadKey]);

    function refresh() {
        setError("");
        setLoading(true);
        setReloadKey((value) => value + 1);
    }

    return {
        transactions,
        loading,
        error,
        refresh,
    };
}
