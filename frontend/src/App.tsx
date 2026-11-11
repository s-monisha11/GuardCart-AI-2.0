
import { useState } from "react";
import {
  BrowserRouter,
  NavLink,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

import {
  ShieldCheck,
  LayoutDashboard,
  Bot,
  ShoppingBag,
  ClipboardCheck,
  FlaskConical,
  Receipt,
  ChartNoAxesCombined,
  Settings,
  SlidersHorizontal,
  Send,
  Menu,
  X,
  ArrowRight,
  CreditCard,
  ShieldAlert,
  Clock3,
  CheckCircle2,
} from "lucide-react";

// DEMO PRODUCT DATA
const products = [
  {
    id: 1,
    name: "Logitech K380 Wireless Keyboard",
    price: 39,
    merchant: "Demo Store 01",
    description: "Compact wireless keyboard with multi-device support.",
    features: ["Bluetooth", "Compact", "Multi-device"],
  },
  {
    id: 2,
    name: "Wireless Keyboard Pro",
    price: 45,
    merchant: "Demo Store 01",
    description: "Comfortable wireless keyboard for programming.",
    features: ["Wireless", "Ergonomic", "Quiet Keys"],
  },
  {
    id: 3,
    name: "Compact Bluetooth Keyboard",
    price: 29,
    merchant: "Demo Store 01",
    description: "Affordable portable keyboard for everyday work.",
    features: ["Bluetooth", "Portable", "Lightweight"],
  },
];

const navigation = [
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

// REUSABLE COMPONENTS
function PageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-slate-900">
        {title}
      </h1>
      <p className="mt-2 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: typeof ShieldCheck;
}) {
  return (
    <div className="panel flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <h2 className="mt-3 text-3xl font-bold">{value}</h2>
      </div>

      <div className="rounded-xl bg-teal-50 p-3 text-teal-700">
        <Icon size={26} />
      </div>
    </div>
  );
}

function ProductCard({
  product,
}: {
  product: (typeof products)[number];
}) {
  const navigate = useNavigate();

  return (
    <div className="panel flex flex-col gap-4">
      <div className="flex h-32 items-center justify-center rounded-xl bg-slate-100">
        <ShoppingBag size={45} className="text-slate-400" />
      </div>

      <div>
        <h3 className="font-semibold text-slate-900">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {product.merchant}
        </p>
      </div>

      <p className="text-sm text-slate-600">
        {product.description}
      </p>

      <div className="flex flex-wrap gap-2">
        {product.features.map((feature) => (
          <span
            key={feature}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
          >
            {feature}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between">
        <span className="text-2xl font-bold">
          ${product.price}
        </span>

        <button
          className="primary-btn"
          onClick={() => navigate(`/approvals?product=${product.id}`)}
        >
          Review Purchase
        </button>
      </div>
    </div>
  );
}

// OVERVIEW DASHBOARD
function Overview() {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title="Overview"
        description="Welcome to your AI-powered commerce security platform."
      />

      <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        DEMO MODE — Dashboard statistics are illustrative, not real payments.
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Purchase Proposals"
          value="12"
          icon={ShoppingBag}
        />
        <StatCard
          title="Demo Completed"
          value="5"
          icon={CreditCard}
        />
        <StatCard
          title="Demo Blocked"
          value="4"
          icon={ShieldAlert}
        />
        <StatCard
          title="Pending Approvals"
          value="3"
          icon={Clock3}
        />
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <div className="mb-4 flex items-center gap-3">
            <Bot className="text-teal-700" size={28} />
            <h2 className="text-xl font-bold">AI Shopping</h2>
          </div>

          <p className="mb-6 text-slate-500">
            Discover products with AI-powered recommendations
            while keeping your spending under control.
          </p>

          <button
            className="primary-btn flex items-center gap-2"
            onClick={() => navigate("/shopping")}
          >
            Start Shopping
            <ArrowRight size={18} />
          </button>
        </div>

        <div className="panel">
          <div className="mb-4 flex items-center gap-3">
            <ShieldCheck className="text-teal-700" size={28} />
            <h2 className="text-xl font-bold">Security Test Lab</h2>
          </div>

          <p className="mb-6 text-slate-500">
            Explore how the independent security gateway
            protects against unsafe AI purchase requests.
          </p>

          <button
            className="primary-btn flex items-center gap-2"
            onClick={() => navigate("/security-lab")}
          >
            Open Security Lab
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div className="panel mt-7">
        <h2 className="text-lg font-bold">How GuardCart Works</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {[
            "AI recommends",
            "Gateway validates",
            "Human approves",
            "PayPal processes",
          ].map((step, index) => (
            <div key={step} className="rounded-xl bg-slate-50 p-4">
              <span className="text-sm font-bold text-teal-700">
                STEP {index + 1}
              </span>
              <p className="mt-2 font-medium">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// AI SHOPPING PAGE
function AIShopping() {
  const [message, setMessage] = useState("");
  const [submittedMessage, setSubmittedMessage] = useState("");

  function handleSend() {
    if (!message.trim()) return;

    setSubmittedMessage(message.trim());
    setMessage("");
  }

  return (
    <>
      <PageHeader
        title="AI Shopping Assistant"
        description="Discover and compare products using natural language."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="panel lg:col-span-2">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <Bot className="text-teal-700" />
            <div>
              <h2 className="font-bold">GuardCart AI</h2>
              <p className="text-xs text-slate-500">
                Demo Shopping Assistant
              </p>
            </div>
          </div>

          <div className="min-h-72 space-y-4 py-6">
            <div className="max-w-md rounded-xl bg-slate-100 p-4 text-sm">
              Hello! I'm GuardCart AI. What would you like
              to shop for today?
            </div>

            {submittedMessage && (
              <>
                <div className="ml-auto max-w-md rounded-xl bg-teal-700 p-4 text-sm text-white">
                  {submittedMessage}
                </div>

                <div className="max-w-md rounded-xl bg-slate-100 p-4 text-sm">
                  Demo preview: Here are three sample keyboards.
                  Live AI recommendations will be available
                  after backend integration.
                </div>
              </>
            )}
          </div>

          <form
            className="flex gap-3 border-t border-slate-200 pt-4"
            onSubmit={(event) => {
              event.preventDefault();
              handleSend();
            }}
          >
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="field"
              placeholder="Find a wireless keyboard under $50..."
            />

            <button type="submit" className="primary-btn">
              <Send size={19} />
            </button>
          </form>
        </div>

        <div className="panel">
          <h2 className="mb-4 font-bold">Your Spending Policy</h2>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span>Maximum transaction</span>
              <strong>$50</strong>
            </div>

            <div className="flex justify-between">
              <span>Daily spending limit</span>
              <strong>$100</strong>
            </div>

            <div className="flex justify-between">
              <span>Approval required</span>
              <span className="text-teal-700">Yes</span>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-teal-50 p-3 text-teal-800">
              <CheckCircle2 size={18} />
              Demo policy settings
            </div>
          </div>
        </div>
      </div>

      <h2 className="mb-5 mt-9 text-xl font-bold">
        Sample Product Recommendations
      </h2>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}

// PRODUCT CATALOG
function ProductCatalog() {
  return (
    <>
      <PageHeader
        title="Product Catalog"
        description="Browse products in the demo shopping catalog."
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}

// PURCHASE REVIEW
function PurchaseApprovals() {
  return (
    <>
      <PageHeader
        title="Purchase Approvals"
        description="Review proposed purchases before payment authorization."
      />

      <div className="panel max-w-2xl">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="text-teal-700" />
          <h2 className="text-xl font-bold">Purchase Review</h2>
        </div>

        <p className="text-slate-600">
          This is the demo purchase review interface.
          The actual security validation and user authorization
          will be handled by the FastAPI backend.
        </p>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          No live purchase proposal is currently loaded.
          Payment actions are disabled until backend integration.
        </div>

        <button className="primary-btn mt-5" disabled>
          Awaiting Backend Validation
        </button>
      </div>
    </>
  );
}

// SECURITY LAB
function SecurityTestLab() {
  const scenarios = [
    ["Normal Purchase", "$39 keyboard with a $50 budget"],
    ["Budget Violation", "$299 keyboard with a $50 limit"],
    ["Prompt Injection", "Malicious product instructions"],
    ["Unauthorized Merchant", "Product from an unapproved seller"],
    ["Duplicate Payment", "An already processed order is submitted again"],
  ];

  return (
    <>
      <PageHeader
        title="Security Test Lab"
        description="Evaluate financial safety with five security scenarios."
      />

      <div className="mb-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
        Demo interface only. Live security tests will run
        through your FastAPI security gateway after integration.
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {scenarios.map(([title, description], index) => (
          <div key={title} className="panel">
            <ShieldAlert className="mb-4 text-teal-700" size={30} />

            <p className="text-xs font-semibold text-slate-400">
              SCENARIO 0{index + 1}
            </p>

            <h2 className="mt-2 text-lg font-bold">{title}</h2>

            <p className="my-4 text-sm text-slate-500">
              {description}
            </p>

            <button className="secondary-btn w-full" disabled>
              Connect Backend to Run
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function PlaceholderPage({
  title,
}: {
  title: string;
}) {
  return (
    <>
      <PageHeader
        title={title}
        description="GuardCart AI 2.0 application module."
      />

      <div className="panel">
        <h2 className="font-semibold">Module Ready for Development</h2>
        <p className="mt-3 text-slate-500">
          This page is created and routing is working.
          We will implement its features in the next development stage.
        </p>
      </div>
    </>
  );
}

// MAIN APPLICATION LAYOUT
function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      {sidebarOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0B1220] text-white transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-slate-700 px-6">
          <ShieldCheck className="text-teal-400" size={32} />
          <div>
            <h1 className="text-lg font-bold">GuardCart AI</h1>
            <p className="text-xs text-slate-400">
              Secure Agentic Commerce
            </p>
          </div>

          <button
            className="ml-auto lg:hidden"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-1 p-3">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${isActive
                    ? "bg-teal-700 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                  }`
                }
              >
                <Icon size={19} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-5 right-5 rounded-xl bg-slate-800 p-4 text-xs text-slate-300">
          <p className="font-semibold text-teal-400">
            DEMO ENVIRONMENT
          </p>
          <p className="mt-2">
            PayPal AI Hackathon 2026
          </p>
        </div>
      </aside>

      <div className="lg:ml-64">
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-8">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden"
              aria-label="Open menu"
              onClick={() => setSidebarOpen(true)}
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

          <span className="rounded-full bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-800">
            Demo Mode
          </span>
        </header>

        <main className="mx-auto max-w-7xl p-5 md:p-8">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/shopping" element={<AIShopping />} />
            <Route path="/catalog" element={<ProductCatalog />} />
            <Route path="/approvals" element={<PurchaseApprovals />} />
            <Route path="/security-lab" element={<SecurityTestLab />} />
            <Route
              path="/transactions"
              element={<PlaceholderPage title="Transaction History" />}
            />
            <Route
              path="/analytics"
              element={<PlaceholderPage title="Security Analytics" />}
            />
            <Route
              path="/policies"
              element={<PlaceholderPage title="Spending Policies" />}
            />
            <Route
              path="/settings"
              element={<PlaceholderPage title="Settings" />}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
