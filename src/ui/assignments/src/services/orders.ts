import React, { useContext } from "react";
import { Order, SubItem } from "../types";
import FAKE_ORDERS from "../orders.json";

export function makeFakeOrdersService(userId: string) {
  const ordersFromStorage = JSON.parse(
    localStorage.getItem("orders") ?? "null"
  );

  const orders = ordersFromStorage
    ? ordersFromStorage
    : new Map<string, Order>(FAKE_ORDERS.map((o) => [o.id, o]));

  localStorage.setItem("orders", JSON.stringify(orders));

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

      const subItem = order.subItems.find(
        (si: SubItem) => si.id === request.subItemId
      );
      if (!subItem) throw new Error("subItem not found!!!!!");

      subItem.status = "assigned";

      localStorage.setItem("orders", JSON.stringify(orders));
    },
    async unAssignSubItem(request: { orderId: string; subItemId: string }) {
      const order = orders.get(request.orderId);
      if (!order) throw new Error("order not found!!!!!");

      const subItem = order.subItems.find(
        (si: SubItem) => si.id === request.subItemId
      );
      if (!subItem) throw new Error("subItem not found!!!!!");

      subItem.status = undefined;

      localStorage.setItem("orders", JSON.stringify(orders));
    },
    async changeStatus(request: {
      orderId: string;
      subItemId: string;
      status: string;
    }) {
      const order = orders.get(request.orderId);
      if (!order) throw new Error("order not found!!!!!");

      const subItem = order.subItems.find(
        (si: SubItem) => si.id === request.subItemId
      );
      if (!subItem) throw new Error("subItem not found!!!!!");

      subItem.status = request.status;

      localStorage.setItem("orders", JSON.stringify(orders));
    },
  };
}

export const OrdersService =
  //@ts-expect-error
  React.createContext<ReturnType<typeof makeFakeOrdersService>>(undefined);

export const useOrdersService = () => useContext(OrdersService);
