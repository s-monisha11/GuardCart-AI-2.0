
export interface Product {
    id: number;
    name: string;
    price: number;
    merchant: string;
    description: string;
    features: string[];
}

export const products: Product[] = [
    {
        id: 1,
        name: "Logitech K380 Wireless Keyboard",
        price: 39,
        merchant: "Demo Store 01",
        description:
            "Compact wireless keyboard with multi-device support.",
        features: [
            "Bluetooth",
            "Compact",
            "Multi-device",
        ],
    },
    {
        id: 2,
        name: "Wireless Keyboard Pro",
        price: 45,
        merchant: "Demo Store 01",
        description:
            "Comfortable wireless keyboard for programming.",
        features: [
            "Wireless",
            "Ergonomic",
            "Quiet Keys",
        ],
    },
    {
        id: 3,
        name: "Compact Bluetooth Keyboard",
        price: 29,
        merchant: "Demo Store 01",
        description:
            "Affordable portable keyboard for everyday work.",
        features: [
            "Bluetooth",
            "Portable",
            "Lightweight",
        ],
    },
];
