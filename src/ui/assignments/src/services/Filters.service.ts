import { useState } from "react";
import {
  Filter,
  Filtered,
  Order,
  FilteredOrder,
  SubItem,
  FilteredSubItem,
} from "../types";

/** check if item is visible */
export const isVisible = (item: Filtered) =>
  item.filter.text && item.filter.type;

/** set sub item visibility filter */
export const showSubItem = (
  subItem: SubItem,
  filter: Filter = {
    text: true,
    type: true,
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
  }
): FilteredOrder => ({
  ...order,
  subItems: order.subItems.map((item) => showSubItem(item, filter)),
  filter,
});

export const filterOrdersByText = (
  [orders, setOrders]: ReturnType<typeof useState<FilteredOrder[]>>,
  searchText = ""
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
            text: true,
            type: order.filter.type,
          });
        } else {
          // title does not include search - check sub-items. if at least one sub-item includes search - show order.
          let isOrderVisible = false;
          const filteredSubItems: FilteredSubItem[] = order.subItems.map(
            (subItem: FilteredSubItem) => {
              const isItemVisible = subItem.product.name.includes(searchText);
              isOrderVisible = isOrderVisible || isItemVisible;

              return showSubItem(subItem, {
                text: isItemVisible,
                type: subItem.filter.type,
              });
            }
          );

          return {
            ...order,
            subItems: filteredSubItems,
            filter: {
              text: isOrderVisible,
              type: order.filter.type,
            },
          };
        }
      })
    );
  } else {
    // clear search - all items visible
    setOrders(
      orders.map((order) =>
        showOrder(order, {
          text: true,
          type: order.filter.type,
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
          text: order.filter.text,
          type: true,
        })
      )
    );
  } else {
    // $G$  BUG HERE! TODO - fix to work with new visible props
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
