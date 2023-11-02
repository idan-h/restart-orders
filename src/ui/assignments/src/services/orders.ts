import { Order } from "../types";

export async function fetchOrder(_orderId: string): Promise<Order> {
  return {
    id: "abc",
    region: "US",
    unit: "מורן",
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

export async function fetchOrderStatuses(): Promise<string[]> {
  return ["מחכה", "בהכנה", "בדרך", "נמסר"];
}
