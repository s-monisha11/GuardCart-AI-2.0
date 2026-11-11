
import { useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";

import {
    AllCommunityModule,
    ModuleRegistry,
    themeQuartz,
} from "ag-grid-community";

import type {
    ColDef,
    ICellRendererParams,
} from "ag-grid-community";

import type {
    Transaction,
    PaymentStatus,
    SecurityDecision,
} from "../../types/transaction";

ModuleRegistry.registerModules([AllCommunityModule]);

const gridTheme = themeQuartz.withParams({
    accentColor: "#0F766E",
    headerBackgroundColor: "#F8FAFC",
    fontFamily: "Inter, Arial, sans-serif",
});

const badgeColors: Record<PaymentStatus, string> = {
    COMPLETED: "bg-green-100 text-green-800",
    BLOCKED: "bg-red-100 text-red-800",
    PENDING: "bg-amber-100 text-amber-800",
    FAILED: "bg-slate-100 text-slate-700",
    CANCELLED: "bg-slate-100 text-slate-700",
};

interface Props {
    transactions: Transaction[];
    search: string;
    onSelect: (transaction: Transaction) => void;
}

export default function TransactionGrid({
    transactions,
    search,
    onSelect,
}: Props) {
    const gridRef = useRef<AgGridReact<Transaction>>(null);

    const columns = useMemo<ColDef<Transaction>[]>(
        () => [
            { field: "id", headerName: "Transaction ID", minWidth: 160 },
            { field: "product_name", headerName: "Product", minWidth: 190 },
            { field: "merchant", headerName: "Merchant", minWidth: 160 },
            {
                field: "amount",
                headerName: "Amount",
                minWidth: 115,
                filter: "agNumberColumnFilter",
                valueFormatter: (p) =>
                    p.value == null
                        ? ""
                        : `${p.data?.currency ?? "USD"} ${Number(p.value).toFixed(2)}`,
            },
            {
                field: "created_at",
                headerName: "Date & Time",
                minWidth: 180,
                valueFormatter: (p) =>
                    p.value
                        ? new Date(p.value).toLocaleString("en-GB", {
                            timeZone: "Asia/Colombo",
                            dateStyle: "medium",
                            timeStyle: "short",
                        })
                        : "",
            },
            {
                field: "payment_status",
                headerName: "Payment Status",
                minWidth: 155,
                cellRenderer: (
                    p: ICellRendererParams<Transaction, PaymentStatus>
                ) =>
                    p.value ? (
                        <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeColors[p.value]
                                }`}
                        >
                            {p.value}
                        </span>
                    ) : null,
            },
            {
                field: "security_decision",
                headerName: "Security",
                minWidth: 130,
                cellRenderer: (
                    p: ICellRendererParams<Transaction, SecurityDecision>
                ) => {
                    const color =
                        p.value === "ALLOW"
                            ? "text-teal-700"
                            : p.value === "BLOCK"
                                ? "text-red-600"
                                : "text-amber-600";

                    return (
                        <span className={`font-semibold ${color}`}>
                            {p.value ?? "—"}
                        </span>
                    );
                },
            },
            {
                field: "violated_rule",
                headerName: "Risk Reason",
                minWidth: 190,
                valueFormatter: (p) => p.value || "None",
            },
            {
                field: "paypal_order_id",
                headerName: "PayPal Order ID",
                minWidth: 190,
                valueFormatter: (p) => p.value || "Not created",
            },
        ],
        []
    );

    return (
        <div className="panel">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold">Transaction Records</h2>
                    <p className="text-xs text-slate-500">
                        Click a row to inspect its security details.
                    </p>
                </div>

                <button
                    className="secondary-btn"
                    onClick={() =>
                        gridRef.current?.api.exportDataAsCsv({
                            fileName: "guardcart-transactions.csv",
                        })
                    }
                >
                    Export CSV
                </button>
            </div>

            <div className="w-full" style={{ height: 480 }}>
                <AgGridReact<Transaction>
                    ref={gridRef}
                    theme={gridTheme}
                    rowData={transactions}
                    columnDefs={columns}
                    defaultColDef={{
                        sortable: true,
                        filter: true,
                        resizable: true,
                    }}
                    quickFilterText={search}
                    pagination={true}
                    paginationPageSize={10}
                    paginationPageSizeSelector={[10, 25, 50]}
                    getRowId={(p) => p.data.id}
                    onRowClicked={(event) => {
                        if (event.data) onSelect(event.data);
                    }}
                />
            </div>
        </div>
    );
}
