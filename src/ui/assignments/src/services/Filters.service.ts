import { useState } from "react";
import {
  Filter,
  Filtered,
  Order,
  FilteredOrder,
  SubItem,
  FilteredSubItem,
  DONE_STATUS,
} from "../types";

/** check if item is visible */
export const isVisible = (item: Filtered) =>
  item.filter.text && item.filter.type && item.filter.done;

/** set sub item visibility filter */
export const showSubItem = (
  subItem: SubItem,
  filter: Filter = {
    text: true,
    type: true,
    done: true,
  }
): FilteredSubItem => ({
  ...subItem,
  filter,
});

/** set order and all sub items visibility filter */
export const showOrder = (
  order: Order,
  filter: Filter = {
    text: true,
    type: true,
    done: true,
  }
): FilteredOrder => ({
  ...order,
  subItems: order.subItems.map((item) => showSubItem(item, filter)),
  filter,
});

const filterOrderBySubItem = (
  order: FilteredOrder,
  filterField: keyof Filter,
  predict: (subItem: SubItem) => boolean
): FilteredOrder => {
  // Check sub-items, if at least one sub-item match predict - show order.
  let isOrderVisible = false;
  const filteredSubItems: FilteredSubItem[] = order.subItems.map(
    (subItem: FilteredSubItem) => {
      const isItemVisible = predict(subItem);
      isOrderVisible = isOrderVisible || isItemVisible;

      return showSubItem(subItem, {
        ...subItem.filter,
        [filterField]: isItemVisible,
      });
    }
  );

  return {
    ...order,
    subItems: filteredSubItems,
    filter: {
      ...order.filter,
      [filterField]: isOrderVisible,
    },
  };
};

export const filterOrdersByText = (
  [orders, setOrders]: ReturnType<typeof useState<FilteredOrder[]>>,
  searchText: string
) => {
  console.debug("Filter.service::filterOrdersByText", searchText);

  if (!orders) {
    console.error("Filter.service::filterOrdersByText: orders empty");
    return;
  }

  if (searchText) {
    setOrders(
      orders.map((order) => {
        if (order.unit?.includes(searchText)) {
          // title includes search - show order and all sub-items.
          return showOrder(order, {
            ...order.filter,
            text: true,
          });
        } else {
          // if at least one sub-item match filter - show order.
          return filterOrderBySubItem(order, "text", (subItem) =>
            subItem.product.name.includes(searchText)
          );
        }
      })
    );
  } else {
    // clear search - all items visible
    setOrders(
      orders.map((order) =>
        showOrder(order, {
          ...order.filter,
          text: true,
        })
      )
    );
  }
};

export const filterOrdersByType = (
  [orders, setOrders]: ReturnType<typeof useState<FilteredOrder[]>>,
  optionValue = "All"
) => {
  console.debug("Filter.service::filterOrdersByType", optionValue);

  if (!orders) {
    console.error("Filter.service::filterOrdersByType: orders empty");
    return;
  }

  if (optionValue === "All") {
    // clear search - all items visible
    setOrders(
      orders.map((order) =>
        showOrder(order, {
          ...order.filter,
          type: true,
        })
      )
    );
  } else {
    setOrders(
      // if at least one sub-item match filter - show order.
      orders.map((order) =>
        filterOrderBySubItem(order, "type", (subItem) =>
          subItem.product.type.split(",").includes(optionValue)
        )
      )
    );
  }
};

export const filterOrdersByDone = (
  [orders, setOrders]: ReturnType<typeof useState<FilteredOrder[]>>,
  checked: boolean
) => {
  console.debug("Filter.service::filterOrdersByDone", checked);

  if (!orders) {
    console.error("Filter.service::filterOrdersByDone: orders empty");
    return;
  }

  if (checked) {
    // clear search - all items visible
    setOrders(
      orders.map((order) =>
        showOrder(order, {
          ...order.filter,
          done: true,
        })
      )
    );
  } else {
    setOrders(
      // if at least one sub-item match filter - show order.
      orders.map((order) =>
        filterOrderBySubItem(
          order,
          "done",
          (subItem) => checked || subItem.status !== DONE_STATUS
        )
      )
    );
  }
};
