
import { useState } from "react";
import type { ReactNode } from "react";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

interface AppLayoutProps {
    children: ReactNode;
}

export default function AppLayout({
    children,
}: AppLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#F7F9FC]">
            {sidebarOpen && (
                <button
                    aria-label="Close navigation overlay"
                    className="fixed inset-0 z-30 bg-black/40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="min-h-screen lg:ml-64">
                <Navbar
                    onOpenMenu={() => setSidebarOpen(true)}
                />

                <main className="mx-auto max-w-7xl p-5 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
