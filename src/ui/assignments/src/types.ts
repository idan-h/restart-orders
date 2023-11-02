export type Task = {
    id: string;
    products: [
        {
            type: string,
            amount: number
        }
    ]
}