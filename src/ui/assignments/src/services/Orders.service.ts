import { useMemo } from "react";
import { Order, Product } from "../types";
import { useAuthenticationService } from "./Authentication.service";

const baseUrl =
  "https://njdfolzzmvnaay5oxqife4tuwy.apigateway.il-jerusalem-1.oci.customer-oci.com/v1/";

// cache this data
let productDetails: Map<number, Product>;
let statusesList: string[];

export class OrdersService {
  constructor(private _userId: string) {}

  /** List of all items in the database. */
  public async fetchProductDetails(): Promise<Map<number, Product>> {
    console.debug("OrdersService:fetchProductNames");

    if (productDetails) {
      return productDetails;
    }

    const response = await fetch(
      new URL(
        "get-products?userId=" + encodeURIComponent(this._userId),
        baseUrl
      )
    );

    const backendProducts = await response.json();

    productDetails = new Map(
      backendProducts.map((product: Product) => [
        product.product_number,
        {
          name: product.name,
          product_number: product.product_number,
          type: product.type,
        },
      ])
    );

    return productDetails;
  }

  /** Get all orders for the orders page */
  public async fetchUnassignedOrders(): Promise<{ orders: Order[] }> {
    console.debug("OrdersService:fetchUnassignedOrders");

    if (!productDetails) await this.fetchProductDetails();

    const response = await fetch(
      new URL(
        `get-unassigned-orders?userId=${encodeURIComponent(this._userId)}`,
        baseUrl
      )
    );

    const backendOrders = ((await response.json()) as { orders: Order[] })
      .orders;

    return {
      orders: backendOrders
        .map((order) => ({
          ...order,
          subItems: order.subItems
            .filter(
              (item) => !item.userId && productDetails?.has(item.productId)
            )
            .map((subItem) => ({
              ...subItem,
              product: productDetails!.get(subItem.productId)!,
            })),
        }))
        .filter((order) => order.subItems.length),
    };
  }

  /** Get all orders for the my-orders page */
  public async fetchAssignedOrders(): Promise<{ orders: Order[] }> {
    console.debug("OrdersService:fetchAssignedOrders");

    if (!productDetails) await this.fetchProductDetails();

    const response = await fetch(
      new URL(
        `get-assigned-orders?userId=${encodeURIComponent(this._userId)}`,
        baseUrl
      )
    );

    const backendOrders = ((await response.json()) as { orders: Order[] })
      .orders;

    return {
      orders: backendOrders
        .map((order) => ({
          ...order,
          subItems: order.subItems
            .filter(
              (item) => item.userId && productDetails?.has(item.productId)
            )
            .map((subItem) => ({
              ...subItem,
              product: productDetails!.get(subItem.productId)!,
            })),
        }))
        .filter((order) => order.subItems.length),
    };
  }

  /** no in use */
  public async fetchOrder(orderId: string): Promise<Order> {
    console.debug("OrdersService:fetchOrder");

    if (!productDetails) await this.fetchProductDetails();

    const response = await fetch(
      new URL(
        `get-user-order/${encodeURIComponent(
          orderId
        )}?userId=${encodeURIComponent(this._userId)}`,
        baseUrl
      )
    );

    const backendOrder = (await response.json()).order as Order;

    return {
      ...backendOrder,
      subItems: backendOrder.subItems.map((subItem) => ({
        ...subItem,
        productName: productDetails!.get(subItem.productId)!,
      })),
    };
  }

  /** Move item from orders to my-orders  */
  public async assignSubItem(request: {
    orderId: number;
    subItemId: number;
    subItemBoardId: number;
  }) {
    console.debug("OrdersService:assignSubItem");

    const response = await fetch(
      new URL(`assign?userId=${encodeURIComponent(this._userId)}`, baseUrl),
      { method: "POST", body: JSON.stringify(request) }
    );

    await response.json();
  }

  /** (Delete) Move item from my-orders to orders  */
  public async unAssignSubItem(request: {
    orderId: number;
    subItemId: number;
    subItemBoardId: number;
  }) {
    console.debug("OrdersService:unAssignSubItem");

    const response = await fetch(
      new URL(`unassign?userId=${encodeURIComponent(this._userId)}`, baseUrl),
      { method: "POST", body: JSON.stringify(request) }
    );

    await response.json();
  }

  /** Get all statuses for the status dropdown  */
  public async fetchOrderStatusNames(): Promise<string[]> {
    console.debug("OrdersService:fetchOrderStatusNames");

    if (statusesList) return statusesList;

    const response = await fetch(
      new URL(
        `get-subitem-statuses?userId=${encodeURIComponent(this._userId)}`,
        baseUrl
      )
    );

    return (await response.json()).statuses.filter(
      (status: string) => Boolean(status) // filter empty
    );
  }

  /** Change item status  */
  public async changeStatus(request: {
    orderId: number;
    subItemId: number;
    subItemBoardId: number;
    status: string;
  }) {
    console.debug("OrdersService:changeStatus");

    const response = await fetch(
      new URL(
        `change-status?userId=${encodeURIComponent(this._userId)}`,
        baseUrl
      ),
      { method: "POST", body: JSON.stringify(request) }
    );

    await response.json();
  }
}

export function useOrdersService() {
  const { getUserId } = useAuthenticationService();
  const userId = getUserId();

  const ordersService = useMemo(() => {
    if (!userId) {
      console.error("OrdersService::Init: Not logged in");
      return undefined;
    }

    return new OrdersService(userId);
  }, [userId]);

  return ordersService;
}
