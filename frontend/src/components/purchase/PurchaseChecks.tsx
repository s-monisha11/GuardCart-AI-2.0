
import {
    CheckCircle2,
    XCircle,
    Clock3,
} from "lucide-react";

import type { PurchaseCheck } from "../../types/purchase";

export default function PurchaseChecks({
    checks,
}: {
    checks: PurchaseCheck[];
}) {
    return (
        <div className= "space-y-3" >
        {
            checks.map((check) => {
                const Icon =
                    check.status === "PASS"
                        ? CheckCircle2
                        : check.status === "FAIL"
                            ? XCircle
                            : Clock3;

                const color =
                    check.status === "PASS"
                        ? "text-green-700"
                        : check.status === "FAIL"
                            ? "text-red-600"
                            : "text-amber-600";

                return (
                    <div
            key= { check.name }
                className = "flex items-start gap-3 rounded-xl bg-slate-50 p-3"
                    >
                    <Icon className={ color } size = { 20} />

                        <div>
                        <p className="font-semibold" > { check.name } </p>
                            < p className = "text-sm text-slate-500" >
                                { check.reason }
                                </p>
                                < p className = {`text-xs font-bold ${color}`
            }>
            { check.status }
            </p>
            </div>
            </div>
            );
        })
}
</div>
  );
}
