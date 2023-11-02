export type Order = {
  id: string;
  region: string;
  subItems: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    status: string | undefined; // if `undefined`, then the subitem is unassigned
  }>;
};

export async function fetchOrder(_orderId: string): Promise<Order> {
  return {
    id: "abc",
    region: "US",
    subItems: [
      {
        id: "abc",
        productId: "123",
        productName: "נעליים",
        quantity: 100,
        status: "מחכה",
      },
      {
        id: "def",
        productId: "456",
        productName: "גרביים",
        quantity: 200,
        status: undefined,
      },
    ],
  };
}
