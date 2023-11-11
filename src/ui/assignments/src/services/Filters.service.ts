import { Dispatch, SetStateAction } from "react";
import { Filtered, FilteredOrder, Order } from "../types";

export const isVisible = (item: Filtered) =>
  item.filter.text && item.filter.type;

/** show order and all sub items */
export const showOrder = (order: Order): FilteredOrder => ({
  ...order,
  subItems: order.subItems.map((subItem) => ({
    ...subItem,
    filter: {
      text: true,
      type: true,
    },
  })),
  filter: {
    text: true,
    type: true,
  },
});

export const filterOrdersByText = (
  [orders, setOrders]: [
    VisibleOrder[] | undefined,
    Dispatch<SetStateAction<VisibleOrder[] | undefined>>
  ],
  searchText = ""
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

export const filterOrdersByType = (
  [orders, setOrders]: [
    VisibleOrder[] | undefined,
    Dispatch<SetStateAction<VisibleOrder[] | undefined>>
  ],
  optionValue = "All"
) => {
  console.debug("filterOrders::filterOrdersByType", optionValue);

  if (!orders) {
    console.error("filterOrders::filterOrdersByType: orders empty");
    return;
  }

  // $G$  BUG HERE! TODO - fix to work with new visible props
  if (optionValue === "All") {
    // clear search - all items visible
    setOrders([...orders]);
  } else {
    setOrders((_) =>
      orders?.filter(
        (unit) =>
          unit.subItems.filter((subItem) =>
            optionValue
              ? subItem.product.type.split(",").includes(optionValue)
              : true
          ).length > 0
      )
    );
  }
};
