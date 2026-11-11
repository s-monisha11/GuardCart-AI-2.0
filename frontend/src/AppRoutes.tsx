
import { Routes, Route, Navigate } from "react-router-dom";

// Main Pages
import Overview from "./pages/Overview";
import AIShopping from "./pages/AIShopping";
import ProductCatalog from "./pages/ProductCatalog";
import PurchaseApprovals from "./pages/PurchaseApprovals";

// Security and Transactions
import SecurityTestLab from "./pages/SecurityTestLab";
import Transactions from "./pages/Transactions";
import Analytics from "./pages/Analytics";

// Configuration
import Policies from "./pages/Policies";
import Settings from "./pages/Settings";

// PayPal Payment Return
import PaymentReturn from "./pages/PaymentReturn";

export default function AppRoutes() {
    return (
        <Routes>
            {/* Dashboard */}
            <Route path="/" element={<Overview />} />

            {/* AI Shopping */}
            <Route path="/shopping" element={<AIShopping />} />

            {/* Product Catalog */}
            <Route path="/catalog" element={<ProductCatalog />} />

            {/* Purchase Approval */}
            <Route
                path="/approvals"
                element={<PurchaseApprovals />}
            />

            {/* Security Test Lab */}
            <Route
                path="/security-lab"
                element={<SecurityTestLab />}
            />

            {/* Transaction History */}
            <Route
                path="/transactions"
                element={<Transactions />}
            />

            {/* Security Analytics */}
            <Route
                path="/analytics"
                element={<Analytics />}
            />

            {/* Spending Policies */}
            <Route
                path="/policies"
                element={<Policies />}
            />

            {/* Application Settings */}
            <Route
                path="/settings"
                element={<Settings />}
            />

            {/* PayPal Sandbox Return */}
            <Route
                path="/payment-return"
                element={<PaymentReturn />}
            />

            {/* Unknown URLs */}
            <Route
                path="*"
                element={<Navigate to="/" replace />}
            />
        </Routes>
    );
}
