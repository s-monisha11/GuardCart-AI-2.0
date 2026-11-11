
import { useNavigate } from "react-router-dom";
import {
    ShoppingBag,
    CreditCard,
    ShieldAlert,
    Clock3,
    Bot,
    ShieldCheck,
    ArrowRight,
} from "lucide-react";

import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";

export default function Overview() {
    const navigate = useNavigate();

    return (
        <>
            <PageHeader
                title="Overview"
                description="Monitor your AI-powered commerce platform."
            />

            <div className="mb-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
                DEMO MODE — Statistics are illustrative, not real payments.
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Purchase Proposals" value="12" icon={ShoppingBag} />
                <StatCard title="Demo Completed" value="5" icon={CreditCard} />
                <StatCard title="Demo Blocked" value="4" icon={ShieldAlert} />
                <StatCard title="Pending Approvals" value="3" icon={Clock3} />
            </div>

            <div className="mt-7 grid gap-6 lg:grid-cols-2">
                {[
                    {
                        title: "AI Shopping",
                        description: "Discover products using intelligent recommendations.",
                        icon: Bot,
                        path: "/shopping",
                        button: "Start Shopping",
                    },
                    {
                        title: "Security Test Lab",
                        description: "Explore how financial safety checks protect purchases.",
                        icon: ShieldCheck,
                        path: "/security-lab",
                        button: "Open Security Lab",
                    },
                ].map((item) => {
                    const Icon = item.icon;

                    return (
                        <div className="panel" key={item.title}>
                            <Icon size={30} className="mb-4 text-teal-700" />
                            <h2 className="text-xl font-bold">{item.title}</h2>
                            <p className="my-5 text-slate-500">{item.description}</p>

                            <button
                                className="primary-btn flex items-center gap-2"
                                onClick={() => navigate(item.path)}
                            >
                                {item.button}
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="panel mt-7">
                <h2 className="text-lg font-bold">How GuardCart Works</h2>

                <div className="mt-5 grid gap-4 md:grid-cols-4">
                    {[
                        "AI Recommends",
                        "Gateway Validates",
                        "Human Approves",
                        "PayPal Processes",
                    ].map((step, index) => (
                        <div key={step} className="rounded-xl bg-slate-50 p-4">
                            <p className="text-sm font-bold text-teal-700">
                                STEP {index + 1}
                            </p>
                            <p className="mt-2 font-medium">{step}</p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
