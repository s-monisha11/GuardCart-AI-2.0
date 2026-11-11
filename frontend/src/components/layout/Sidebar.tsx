
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Bot,
    ShoppingBag,
    ClipboardCheck,
    FlaskConical,
    Receipt,
    ChartNoAxesCombined,
    SlidersHorizontal,
    Settings,
    ShieldCheck,
    X,
} from "lucide-react";

const menuItems = [
    { name: "Overview", path: "/", icon: LayoutDashboard },
    { name: "AI Shopping", path: "/shopping", icon: Bot },
    { name: "Product Catalog", path: "/catalog", icon: ShoppingBag },
    { name: "Purchase Approvals", path: "/approvals", icon: ClipboardCheck },
    { name: "Security Test Lab", path: "/security-lab", icon: FlaskConical },
    { name: "Transaction History", path: "/transactions", icon: Receipt },
    { name: "Security Analytics", path: "/analytics", icon: ChartNoAxesCombined },
    { name: "Spending Policies", path: "/policies", icon: SlidersHorizontal },
    { name: "Settings", path: "/settings", icon: Settings },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({
    isOpen,
    onClose,
}: SidebarProps) {
    return (
        <aside
            className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col
        bg-[#0B1220] text-white transition-transform
        lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
        >
            <div className="flex h-20 items-center gap-3 border-b border-slate-700 px-6">
                <ShieldCheck size={30} className="text-teal-400" />

                <div>
                    <h1 className="text-lg font-bold">GuardCart AI</h1>
                    <p className="text-xs text-slate-400">
                        Secure Agentic Commerce
                    </p>
                </div>

                <button
                    onClick={onClose}
                    aria-label="Close navigation"
                    className="ml-auto lg:hidden"
                >
                    <X size={20} />
                </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === "/"}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm
                transition-colors ${isActive
                                    ? "bg-teal-700 text-white"
                                    : "text-slate-300 hover:bg-slate-800"
                                }`
                            }
                        >
                            <Icon size={19} />
                            <span>{item.name}</span>
                        </NavLink>
                    );
                })}
            </nav>

            <div className="m-4 rounded-xl bg-slate-800 p-4">
                <p className="text-xs font-semibold text-teal-400">
                    GUARD CART SECURITY
                </p>
                <p className="mt-2 text-xs text-slate-300">
                    PayPal AI Hackathon 2026
                </p>
            </div>
        </aside>
    );
}
