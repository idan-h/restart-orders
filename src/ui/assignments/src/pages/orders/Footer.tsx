import React from "react";
import { Button, tokens } from "@fluentui/react-components";

import { Order } from "../../types";

export interface OrdersFooterProps {
  orders: Order[] | null;
  disabled?: boolean;
  onSubmit: () => void;
  onReset: () => void;
}

export const OrdersFooter: React.FunctionComponent<OrdersFooterProps> = ({
  orders,
  disabled,
  onSubmit,
  onReset,
}) => {
  const selectedItems = orders?.reduce((acc, order) => {
    const selectedSubItems = order.subItems.filter(
      (subItem) => subItem.userId
    ).length;
    return acc + selectedSubItems;
  }, 0);

  return (
    orders?.length && (
      <div
        style={{
          backgroundColor: tokens.colorNeutralBackground1,
          position: "fixed",
          padding: "6px 24px",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          gap: "8px",
          boxShadow: tokens.shadow28,
        }}
      >
        {/* BUTTON: ASSIGN */}
        <Button
          appearance="primary"
          style={{ flex: 3, whiteSpace: "nowrap" }}
          onClick={onSubmit}
          disabled={!selectedItems || disabled}
        >
          {`הוסף להזמנות שלי ${selectedItems ? `(${selectedItems})` : ""}`}
        </Button>
        {/* BUTTON: RESET */}
        <Button
          appearance="outline"
          style={{ flex: 1, whiteSpace: "nowrap" }}
          onClick={onReset}
          disabled={!selectedItems || disabled}
        >
          אפס בחירה
        </Button>
      </div>
    )
  );
};
