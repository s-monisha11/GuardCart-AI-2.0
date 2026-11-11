
import { useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

import type { Product } from "../../data/products";

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({
    product,
}: ProductCardProps) {
    const navigate = useNavigate();

    return (
        <div className="panel flex flex-col gap-4">
            <div className="flex h-36 items-center justify-center rounded-xl bg-slate-100">
                <ShoppingBag
                    size={48}
                    className="text-slate-400"
                />
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

            <div className="mt-auto flex items-center justify-between gap-3">
                <span className="text-2xl font-bold">
                    ${product.price.toFixed(2)}
                </span>

                <button
                    className="primary-btn"
                    onClick={() =>
                        navigate(`/approvals?product=${product.id}`)
                    }
                >
                    Review Purchase
                </button>
            </div>
        </div>
    );
}
