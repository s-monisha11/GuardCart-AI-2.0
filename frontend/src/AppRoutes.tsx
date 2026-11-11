
import { Routes, Route, Navigate } from "react-router-dom";

import Overview from "./pages/Overview";
import AIShopping from "./pages/AIShopping";
import ProductCatalog from "./pages/ProductCatalog";
import PurchaseApprovals from "./pages/PurchaseApprovals";
import SecurityTestLab from "./pages/SecurityTestLab";
import Transactions from "./pages/Transactions";
import Analytics from "./pages/Analytics";
import Policies from "./pages/Policies";
import Settings from "./pages/Settings";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/shopping" element={<AIShopping />} />
            <Route path="/catalog" element={<ProductCatalog />} />
            <Route path="/approvals" element={<PurchaseApprovals />} />
            <Route path="/security-lab" element={<SecurityTestLab />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/settings" element={<Settings />} />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
