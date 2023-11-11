import { Order, SubItem } from "../types";
// import FAKE_ORDERS from "../fake-orders";

export function makeFakeOrdersService(userId: string) {
  const ordersFromStorage = JSON.parse(
    localStorage.getItem("orders") ?? "null"
  );

 
  const orders = new Map<string, Order>(ordersFromStorage)
 // const orders = ordersFromStorage ? new Map<string, Order>(ordersFromStorage)
 //   : new Map<string, Order>(FAKE_ORDERS.map((o) => [o.id, o]));

  saveOrders(orders);

  if (userId !== "this-is-good-userid") throw new Error("bad login!");

  return {
    async fetchOrderStatusNames(): Promise<string[]> {
      return ["מחכה", "בהכנה", "בדרך", "נמסר"];
    },
    async fetchUnassignedOrders(): Promise<{ orders: Order[] }> {
      return {
        orders: [...orders.values()].filter((order) =>
          order.subItems.some((si) => !si.status)
        ),
      };
    },
    async fetchAssignedOrders(): Promise<{ orders: Order[] }> {
      return {
        orders: [...orders.values()].filter((order) =>
          order.subItems.some((si) => si.userId === userId)
        ),
      };
    },
    async fetchOrder(orderId: string): Promise<Order | undefined> {
      return orders.get(orderId);
    },
    async assignSubItem(request: {
      orderId: string;
      subItemId: string | number;
      subItemBoardId: string;
    }) {
      const order = orders.get(request.orderId);
      if (!order) throw new Error("order not found!!!!!");

      const subItem = order.subItems.find(
        (si: SubItem) => si.id === request.subItemId
      );
      if (!subItem) throw new Error("subItem not found!!!!!");

      subItem.status = "assigned";
      subItem.userId = userId;

      saveOrders(orders);
    },
    async unAssignSubItem(request: {
      orderId: string;
      subItemId: string | number;
      subItemBoardId: string;
    }) {
      const order = orders.get(request.orderId);
      if (!order) throw new Error("order not found!!!!!");

      const subItem = order.subItems.find(
        (si: SubItem) => si.id === request.subItemId
      );
      if (!subItem) throw new Error("subItem not found!!!!!");

      // subItem.status = undefined;
      subItem.userId = undefined;

      saveOrders(orders);
    },
    async changeStatus(request: {
      orderId: string;
      subItemId: string | number ;
      subItemBoardId: string;
      status: string;
    }) {
      const order = orders.get(request.orderId);
      if (!order) throw new Error("order not found!!!!!");

      const subItem = order.subItems.find(
        (si: SubItem) => si.id === request.subItemId
      );
      if (!subItem) throw new Error("subItem not found!!!!!");

      subItem.status = request.status;

      saveOrders(orders);
    },
  };
}

function saveOrders(orders: Map<string, Order>) {
  localStorage.setItem("orders", JSON.stringify([...orders.entries()]));
}
