
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
}

export default function StatCard({
    title,
    value,
    icon: Icon,
}: StatCardProps) {
    return (
        <div className="panel flex items-center justify-between">
            <div>
                <p className="text-sm text-slate-500">
                    {title}
                </p>

                <h2 className="mt-3 text-3xl font-bold text-slate-900">
                    {value}
                </h2>
            </div>

            <div className="rounded-xl bg-teal-50 p-3 text-teal-700">
                <Icon size={26} />
            </div>
        </div>
    );
}
