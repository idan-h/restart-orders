import { Order, SubItem } from "../types";

// ---------------------------------------------------
// Types

export const DONE_STATUS = "בוצע";

export interface Filter {
  /** match text filter */
  text: boolean;
  /** match status filter */
  type: boolean;
  /** match product filter */
  product: boolean;
  /** match done filter */
  done: boolean;
}

export interface Filtered {
  filter: Filter;
}

export type FilteredSubItem = SubItem & Filtered;

export type FilteredOrder = Order &
  Filtered & {
    subItems: Array<FilteredSubItem>;
  };

// ---------------------------------------------------
// Helpers

/** check if item is visible */
export const isVisible = (item: Filtered) =>
  item.filter.text &&
  item.filter.type &&
  item.filter.product &&
  item.filter.done;

/** set sub item visibility filter */
export const showSubItem = (
  subItem: SubItem,
  filter: Filter = {
    text: true,
    type: true,
    product: true,
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
    product: true,
    done: true,
  }
): FilteredOrder => ({
  ...order,
  subItems: order.subItems.map((item) => showSubItem(item, filter)),
  filter,
});

function _filterOrderBySubItem(
  order: FilteredOrder,
  filterField: keyof Filter,
  predict: (subItem: SubItem) => boolean
): FilteredOrder {
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
}

// ---------------------------------------------------
// Filters

export function filterOrdersByText(
  orders: FilteredOrder[] | null,
  searchText: string
): FilteredOrder[] | null {
  console.debug("Filter.service::filterOrdersByText", searchText);

  if (!orders) {
    console.error("Filter.service::filterOrdersByText: orders empty");
    return null;
  }

  if (searchText) {
    return orders.map((order) => {
      if (
        order.unit?.includes(searchText) ||
        order.name?.includes(searchText)
      ) {
        // title includes search - show order and all sub-items.
        return showOrder(order, {
          ...order.filter,
          text: true,
        });
      } else {
        // if at least one sub-item match filter - show order.
        return _filterOrderBySubItem(order, "text", (subItem) =>
          subItem.product.name.includes(searchText)
        );
      }
    });
  } else {
    // clear search - all items visible
    return orders.map((order) =>
      showOrder(order, {
        ...order.filter,
        text: true,
      })
    );
  }
}

export function filterOrdersByType(
  orders: FilteredOrder[] | null,
  optionValue = "All"
): FilteredOrder[] | null {
  console.debug("Filter.service::filterOrdersByType", optionValue);

  if (!orders) {
    console.error("Filter.service::filterOrdersByType: orders empty");
    return null;
  }

  if (optionValue === "All") {
    // clear search - all items visible
    return orders.map((order) =>
      showOrder(order, {
        ...order.filter,
        type: true,
      })
    );
  } else {
    return (
      // if at least one sub-item match filter - show order.
      orders.map((order) =>
        _filterOrderBySubItem(order, "type", (subItem) =>
          subItem.product.type.split(",").includes(optionValue)
        )
      )
    );
  }
}

export function filterOrdersByProduct(
  orders: FilteredOrder[] | null,
  productsNames: string[]
): FilteredOrder[] | null {
  console.debug("Filter.service::filterOrdersByProduct", productsNames);

  if (!orders) {
    console.error("Filter.service::filterOrdersByProduct: orders empty");
    return null;
  }

  if (productsNames.length === 0) {
    // clear search - all items visible
    return orders.map((order) =>
      showOrder(order, {
        ...order.filter,
        product: true,
      })
    );
  } else {
    // if at least one sub-item match filter - show order.
    return orders.map((order) =>
      _filterOrderBySubItem(order, "product", (subItem) =>
        productsNames.includes(subItem.product.name)
      )
    );
  }
}

export function filterOrdersByDone(
  orders: FilteredOrder[] | null,
  checked: boolean
): FilteredOrder[] | null {
  console.debug("Filter.service::filterOrdersByDone", checked);

  if (!orders) {
    console.error("Filter.service::filterOrdersByDone: orders empty");
    return null;
  }

  if (checked) {
    // clear search - all items visible
    return orders.map((order) =>
      showOrder(order, {
        ...order.filter,
        done: true,
      })
    );
  } else {
    return (
      // if at least one sub-item match filter - show order.
      orders.map((order) =>
        _filterOrderBySubItem(
          order,
          "done",
          (subItem) => checked || subItem.status !== DONE_STATUS
        )
      )
    );
  }
}
