import React, { useContext } from "react";
import { Order } from "../types";
import FAKE_ORDERS from "../orders.json";

export function makeFakeOrdersService(userId: string) {
  const orders = new Map<string, Order>(FAKE_ORDERS.map((o) => [o.id, o]));

  if (userId !== "this-is-good-userid") throw new Error("bad login!");

  return {
    async fetchOrderStatusNames(): Promise<string[]> {
      return ["מחכה", "בהכנה", "בדרך", "נמסר"];
    },
    async fetchUnassignedOrders(): Promise<{ orders: Order[] }> {
      return { orders: Object.values(orders) };
    },
    async fetchAssignedOrders(): Promise<{ orders: Order[] }> {
      return { orders: Object.values(orders) };
    },
    async fetchOrder(orderId: string): Promise<Order | undefined> {
      return orders.get(orderId);
    },
    async assignSubItem(request: { orderId: string; subItemId: string }) {
      const order = orders.get(request.orderId);
      if (!order) throw new Error("order not found!!!!!");

      const subItem = order.subItems.find((si) => si.id === request.subItemId);
      if (!subItem) throw new Error("subItem not found!!!!!");

      subItem.status = "assigned";
    },
    async unAssignSubItem(request: { orderId: string; subItemId: string }) {
      const order = orders.get(request.orderId);
      if (!order) throw new Error("order not found!!!!!");

      const subItem = order.subItems.find((si) => si.id === request.subItemId);
      if (!subItem) throw new Error("subItem not found!!!!!");

      subItem.status = undefined;
    },
    async changeStatus(request: {
      orderId: string;
      subItemId: string;
      status: string;
    }) {
      const order = orders.get(request.orderId);
      if (!order) throw new Error("order not found!!!!!");

      const subItem = order.subItems.find((si) => si.id === request.subItemId);
      if (!subItem) throw new Error("subItem not found!!!!!");

      subItem.status = request.status;
    },
  };
}

export const OrdersService =
  //@ts-expect-error
  React.createContext<ReturnType<typeof makeFakeOrdersService>>(undefined);

export const useOrdersService = () => useContext(OrdersService);
