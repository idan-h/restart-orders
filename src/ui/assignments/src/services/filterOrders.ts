import { Dispatch, SetStateAction } from "react";
import { VisibleOrder } from "../types";

/** show order and all sub items */
const showOrder = (order: VisibleOrder): VisibleOrder => ({
  ...order,
  subItems: order.subItems.map((subItem) => ({
    ...subItem,
    hidden: false,
  })),
  hidden: false,
});

export const filterOrdersByText = (
  searchText: string,
  [orders, setOrders]: [
    VisibleOrder[] | undefined,
    Dispatch<SetStateAction<VisibleOrder[] | undefined>>
  ]
) => {
  console.debug("filterOrders::filterOrdersByText", searchText);

  if (!orders) {
    console.error("filterOrders::filterOrdersByText: orders empty");
    return;
  }

  if (searchText) {
    setOrders(
      orders.map((order) => {
        if (order.unit?.includes(searchText)) {
          // title includes search - show order and all sub-items
          return showOrder(order);
        } else {
          let isOrderVisible = false;

          const filteredSubItems = order.subItems.map((subItem) => {
            const isItemVisible = subItem.product.name.includes(searchText);

            isOrderVisible = isOrderVisible || isItemVisible; // the order is visible if at least one sub-item is visible

            return {
              ...subItem,
              hidden: !isItemVisible,
            };
          });

          return {
            ...order,
            subItems: filteredSubItems,
            hidden: !isOrderVisible,
          };
        }
      })
    );
  } else {
    // clear search - all items visible
    setOrders(orders.map(showOrder));
  }
};
