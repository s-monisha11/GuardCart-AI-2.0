
import type { Product } from "../../data/products";

interface Props {
    products: Product[];
}

export default function ProductComparison({
    products,
}: Props) {
    if (products.length === 0) return null;

    return (
        <div className="panel mt-7">
            <h2 className="mb-5 text-xl font-bold">
                Product Comparison
            </h2>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-200">
                            <th className="p-3">Feature</th>
                            {products.map((p) => (
                                <th key={p.id} className="p-3">
                                    {p.name}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        <tr className="border-b border-slate-100">
                            <td className="p-3 font-semibold">Price</td>
                            {products.map((p) => (
                                <td key={p.id} className="p-3">
                                    ${p.price.toFixed(2)}
                                </td>
                            ))}
                        </tr>

                        <tr className="border-b border-slate-100">
                            <td className="p-3 font-semibold">Merchant</td>
                            {products.map((p) => (
                                <td key={p.id} className="p-3">
                                    {p.merchant}
                                </td>
                            ))}
                        </tr>

                        <tr>
                            <td className="p-3 font-semibold">Features</td>
                            {products.map((p) => (
                                <td key={p.id} className="p-3">
                                    {p.features.join(", ")}
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
