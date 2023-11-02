export type Product = {
    id: string;
    type: string;
    amount: number;
    requestedAmount: number;
}

export type Task = {
    id: string;
    unit: string;
    products: Product[]
}