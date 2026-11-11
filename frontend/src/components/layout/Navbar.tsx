
import { Menu, ShieldCheck } from "lucide-react";
import { DEMO_MODE } from "../../services/api";

interface NavbarProps {
    onOpenMenu: () => void;
}

export default function Navbar({
    onOpenMenu,
}: NavbarProps) {
    return (
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={onOpenMenu}
                    className="lg:hidden"
                    aria-label="Open navigation"
                >
                    <Menu size={24} />
                </button>

                <div>
                    <h2 className="font-bold text-slate-900">
                        GuardCart AI 2.0
                    </h2>

                    <p className="text-xs text-slate-500">
                        Let AI Shop. Keep Humans in Control.
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <span
                    className={`rounded-full px-3 py-2 text-xs font-semibold ${DEMO_MODE
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                >
                    {DEMO_MODE ? "Demo Mode" : "API Mode"}
                </span>

                <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-700 sm:flex">
                    <ShieldCheck size={20} />
                </div>
            </div>
        </header>
    );
}
