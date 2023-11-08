import React, { useContext } from "react";
import { MondayOrder, Order } from "../types";

const baseUrl =
  "https://njdfolzzmvnaay5oxqife4tuwy.apigateway.il-jerusalem-1.oci.customer-oci.com/v1/";

export function makeOrdersService(userId: string) {
  if (userId == null) throw new Error("bad login!");

  let productNames: Map<string, string> | undefined = undefined;

  return {
    async fetchOrderStatusNames(): Promise<string[]> {
      const response = await fetch(
        new URL(
          `get-subitem-statuses?userId=${encodeURIComponent(userId)}`,
          baseUrl
        )
      );

      return (await response.json()).statuses;
    },
    async fetchUnassignedOrders(): Promise<{ orders: Order[] }> {
      if (!productNames) productNames = await fetchProductNames();

      const response = await fetch(
        new URL(
          `get-unassigned-orders?userId=${encodeURIComponent(userId)}`,
          baseUrl
        )
      );

      const mondayOrders = ((await response.json()) as { orders: MondayOrder[] }).orders;

      return {
        orders: mondayOrders.map((mondayOrders) => ({
          ...mondayOrders,
          subItems: mondayOrders.subItems
            .filter(item => !item.userId && productNames?.has(item.productId))
            .map((subItem) => ({
            ...subItem,
            productName: productNames!.get(subItem.productId)!,
          })),
        })).filter(order => order.subItems.length),
      };
    },
    async fetchAssignedOrders(): Promise<{ orders: Order[] }> {
      if (!productNames) productNames = await fetchProductNames();

      const response = await fetch(
        new URL(
          `get-assigned-orders?userId=${encodeURIComponent(userId)}`,
          baseUrl
        )
      );

      const mondayOrders = (await response.json()) as { orders: MondayOrder[] };

      return {
        orders: mondayOrders.orders.map((mondayOrders) => ({
          ...mondayOrders,
          subItems: mondayOrders.subItems.map((subItem) => ({
            ...subItem,
            productName: productNames!.get(subItem.productId)!,
          })),
        })),
      };
    },
    async fetchOrder(orderId: string): Promise<Order | undefined> {
      if (!productNames) productNames = await fetchProductNames();
      const response = await fetch(
        new URL(
          `get-user-order/${encodeURIComponent(orderId)}?userId=${encodeURIComponent(
            userId
          )}`,
          baseUrl
        )
      );

      const mondayOrder = (await response.json()).order as MondayOrder;

      return {
        ...mondayOrder,
        subItems: mondayOrder.subItems.map((subItem) => ({
          ...subItem,
          productName: productNames!.get(subItem.productId)!,
        })),
      } as Order;
    },
    async assignSubItem(request: {
      orderId: string;
      subItemId: string;
      subItemBoardId: string;
    }) {
      const response = await fetch(
        new URL(`assign?userId=${encodeURIComponent(userId)}`, baseUrl),
        { method: "POST", body: JSON.stringify(request) }
      );

      await response.json();
    },
    async unAssignSubItem(request: {
      orderId: string;
        subItemId: string;
        subItemBoardId: string;
    }) {
      const response = await fetch(
        new URL(`unassign?userId=${encodeURIComponent(userId)}`, baseUrl),
        { method: "POST", body: JSON.stringify(request) }
      );

      await response.json();
    },
    async changeStatus(request: {
      orderId: string;
      subItemId: string;
      subItemBoardId: string;
      status: string;
    }) {
      const response = await fetch(
        new URL(`change-status?userId=${encodeURIComponent(userId)}`, baseUrl),
        { method: "POST", body: JSON.stringify(request) }
      );

      await response.json();
    },
  };

  async function fetchProductNames(): Promise<Map<string, string>> {
    const response = await fetch(
      new URL("get-products?userId=" + encodeURIComponent(userId), baseUrl)
    );

    const mondayProducts = await response.json();

    return new Map<string, string>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mondayProducts.map((mp: any) => [mp.product_number, mp.name])
    );
  }
}

export const OrdersService =
  //@ts-expect-error error
  React.createContext<ReturnType<typeof makeOrdersService>>(undefined);

export const useOrdersService = () => useContext(OrdersService);
