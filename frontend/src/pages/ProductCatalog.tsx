
import { useState } from "react";
import { Search } from "lucide-react";

import PageHeader from "../components/common/PageHeader";
import ProductCard from "../components/shopping/ProductCard";
import { products } from "../data/products";

export default function ProductCatalog() {
    const [search, setSearch] = useState("");

    const filteredProducts = products.filter((product) =>
        `${product.name} ${product.merchant} ${product.description}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <>
            <PageHeader
                title="Product Catalog"
                description="Browse products in the GuardCart demo catalog."
            />

            <div className="mb-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                <Search className="text-slate-400" size={20} />

                <input
                    className="w-full outline-none"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search products..."
                    aria-label="Search products"
                />
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="panel text-center text-slate-500">
                    No matching products found.
                </div>
            )}
        </>
    );
}
