import { MondayOrder, Order } from "../types";

const baseUrl =
  "https://njdfolzzmvnaay5oxqife4tuwy.apigateway.il-jerusalem-1.oci.customer-oci.com/v1/";

let productDetails: Map<
  string,
  { name: string; product_number: number; type: string }
>;
let statusesList: string[];

export function makeOrdersService(userId?: string) {
  if (!userId) {
    console.error("ordersService - failed to load, not logged in");
    return null;
  }

  return {
    /** Get all orders for the orders page */
    async fetchUnassignedOrders(): Promise<{ orders: Order[] }> {
      console.debug("OrdersService:fetchUnassignedOrders");

      if (!productDetails) {
        productDetails = await fetchProductDetails();
      }

      const response = await fetch(
        new URL(
          `get-unassigned-orders?userId=${encodeURIComponent(userId)}`,
          baseUrl
        )
      );

      const mondayOrders = (
        (await response.json()) as { orders: MondayOrder[] }
      ).orders;

      return {
        orders: mondayOrders
          .map((mondayOrders) => ({
            ...mondayOrders,
            subItems: mondayOrders.subItems
              .filter(
                (item) => !item.userId && productDetails?.has(item.productId)
              )
              .map((subItem) => ({
                ...subItem,
                productName: productDetails!.get(subItem.productId)!.name,
                type: productDetails!.get(subItem.productId)!.type,
              })),
          }))
          .filter((order) => order.subItems.length),
      };
    },
    /** Get all orders for the my-orders page */
    async fetchAssignedOrders(): Promise<{ orders: Order[] }> {
      console.debug("OrdersService:fetchAssignedOrders");

      if (!productDetails) productDetails = await fetchProductDetails();

      const response = await fetch(
        new URL(
          `get-assigned-orders?userId=${encodeURIComponent(userId)}`,
          baseUrl
        )
      );

      const mondayOrders = (
        (await response.json()) as { orders: MondayOrder[] }
      ).orders;

      return {
        orders: mondayOrders
          .map((mondayOrders) => ({
            ...mondayOrders,
            subItems: mondayOrders.subItems
              .filter(
                (item) => item.userId && productDetails?.has(item.productId)
              )
              .map((subItem) => ({
                ...subItem,
                productName: productDetails!.get(subItem.productId)!,
              })),
          }))
          .filter((order) => order.subItems.length),
      };
    },
    /** no in use */
    async fetchOrder(orderId: string): Promise<Order | undefined> {
      console.debug("OrdersService:fetchOrder");

      if (!productDetails) productDetails = await fetchProductDetails();

      const response = await fetch(
        new URL(
          `get-user-order/${encodeURIComponent(
            orderId
          )}?userId=${encodeURIComponent(userId)}`,
          baseUrl
        )
      );

      const mondayOrder = (await response.json()).order as MondayOrder;

      return {
        ...mondayOrder,
        subItems: mondayOrder.subItems.map((subItem) => ({
          ...subItem,
          productName: productDetails!.get(subItem.productId)!,
        })),
      } as Order;
    },
    /** Move item from orders to my-orders  */
    async assignSubItem(request: {
      orderId: string;
      subItemId: string;
      subItemBoardId: string;
    }) {
      console.debug("OrdersService:assignSubItem");

      const response = await fetch(
        new URL(`assign?userId=${encodeURIComponent(userId)}`, baseUrl),
        { method: "POST", body: JSON.stringify(request) }
      );

      await response.json();
    },
    /** (Delete) Move item from my-orders to orders  */
    async unAssignSubItem(request: {
      orderId: string;
      subItemId: string;
      subItemBoardId: string;
    }) {
      console.debug("OrdersService:unAssignSubItem");

      const response = await fetch(
        new URL(`unassign?userId=${encodeURIComponent(userId)}`, baseUrl),
        { method: "POST", body: JSON.stringify(request) }
      );

      await response.json();
    },
    /** Get all statuses for the status dropdown  */
    async fetchOrderStatusNames(): Promise<string[]> {
      console.debug("OrdersService:fetchOrderStatusNames");

      if (statusesList) return statusesList;

      const response = await fetch(
        new URL(
          `get-subitem-statuses?userId=${encodeURIComponent(userId)}`,
          baseUrl
        )
      );

      return (await response.json()).statuses.filter(
        (status: string) => Boolean(status) // filter empty
      );
    },
    /** Change item status  */
    async changeStatus(request: {
      orderId: string;
      subItemId: string;
      subItemBoardId: string;
      status: string;
    }) {
      console.debug("OrdersService:changeStatus");

      const response = await fetch(
        new URL(`change-status?userId=${encodeURIComponent(userId)}`, baseUrl),
        { method: "POST", body: JSON.stringify(request) }
      );

      await response.json();
    },
  };

  /** List of all items in the database. */
  async function fetchProductDetails(): Promise<
    Map<string, { name: string; product_number: number; type: string }>
  > {
    if (!userId) {
      console.error("ordersService - failed to load, not logged in");
      return Promise.reject();
    }

    console.debug("OrdersService:fetchProductNames");

    const response = await fetch(
      new URL("get-products?userId=" + encodeURIComponent(userId), baseUrl)
    );

    const mondayProducts = await response.json();

    // map of number -> key = "product_number", value = "product_number", "name", "type"}
    return new Map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mondayProducts.map((product: any) => [
        product.product_number,
        {
          name: product.name,
          product_number: product.product_number,
          type: product.type,
        },
      ])
    );
  }
}
