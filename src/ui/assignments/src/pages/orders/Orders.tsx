import React, { useEffect, useState } from "react";
import { tokens, Button } from "@fluentui/react-components";

import { useAuthenticationService } from "../../services/Authentication.service.ts";
import { useOrdersService } from "../../services/Orders.service.ts";
import {
  FilteredOrder,
  FilteredSubItem,
  showOrder,
} from "../../services/Filters.service.ts";
import {
  ConfirmDialog,
  ConfirmDialogProps,
} from "../../components/ConfirmDialog.tsx";
import { SubItems } from "./SubItems.tsx";
import { BasePage } from "../../components/BasePage.tsx";

export const Orders: React.FunctionComponent = () => {
  const [orders, setOrders] = useState<FilteredOrder[] | null>(null); // orders list from the server

  const [confirmOpen, setConfirmOpen] = useState<boolean | undefined>(false);
  const [confirmProps, setConfirmProps] = useState<
    Omit<ConfirmDialogProps, "openState"> | undefined
  >();

  const [saving, setSaving] = useState(false); // saving state (used for saving spinner and block submit button)

  const { getUserId } = useAuthenticationService();
  const userId = getUserId();

  const ordersService = useOrdersService();

  useEffect(() => {
    if (!ordersService) {
      console.error("Orders::Init: ordersService not ready");
      return;
    }

    if (!orders) {
      ordersService.fetchUnassignedOrders().then((items) => {
        setOrders(items.orders.map((order) => showOrder(order)));
      });
    }
  }, [ordersService]);

  const handleToggleSubItem = (
    orderId: number,
    subItem: FilteredSubItem,
    isChecked: boolean
  ) => {
    if (!orders) {
      console.error("Orders::handleToggleSubItem: orders empty");
      return;
    }

    const orderIndex = orders.findIndex((order) => order.id === orderId);
    if (orderIndex === -1) {
      console.error("Orders::handleToggleSubItem: order not found");
      return;
    }

    const subItemsIndex = orders[orderIndex].subItems.findIndex(
      (_subItem) => _subItem.id === subItem.id
    );
    if (subItemsIndex === -1) {
      console.error("Orders::handleToggleSubItem: subItem not found");
      return;
    }

    orders[orderIndex].subItems[subItemsIndex] = {
      ...subItem,
      userId: isChecked ? userId : undefined,
    };

    setOrders([...orders]);
  };

  const handleSubmit = async () => {
    if (!ordersService) {
      console.error("Orders::handleSubmit: ordersService not ready");
      return;
    }

    if (!orders) {
      console.error("Orders::handleSubmit: orders empty");
      return;
    }

    // The server is slow. We first call the assign method but we still.
    // The filter out the items that where assigned. All the assigned items and orders that don't have any un-assigned items left.
    let subItemsToAssign: FilteredSubItem[] = [];
    const ordersToKeep: FilteredOrder[] = [];

    try {
      setSaving(true);

      orders.forEach((order) => {
        const itemsToKeep: FilteredSubItem[] = []; // will be kept
        const itemsToRemove: FilteredSubItem[] = []; // will be assigned

        order.subItems.forEach((subItem: FilteredSubItem) =>
          subItem.userId
            ? itemsToRemove.push(subItem)
            : itemsToKeep.push(subItem)
        );

        subItemsToAssign = subItemsToAssign.concat(itemsToRemove);

        if (itemsToKeep.length) {
          // keep this order
          ordersToKeep.push({
            ...order,
            subItems: itemsToKeep,
          });
        }
      });

      await Promise.all(
        subItemsToAssign.map((subItem) =>
          ordersService.assignSubItem({
            orderId: subItem.order_id,
            subItemId: subItem.id,
            subItemBoardId: subItem.subItemBoardId,
          })
        )
      );
    } catch (e) {
      console.error("Orders::handleSubmit: failed to save all items");
      // reloading because some items may have succeeded
      window.location.reload();
      return;
    } finally {
      setOrders(ordersToKeep); // update the UI with the orders that were not assigned
      setSaving(false);

      setConfirmProps({
        title: "הזמנה נשלחה בהצלחה",
        subText: "הפריט שלך יופיע תחת לשונית הזמנות שלי",
        buttons: [
          {
            text: "אישור",
            appearance: "primary",
          },
        ],
      });
      setConfirmOpen(true);
    }
  };

  const handleReset = () => {
    if (!orders) {
      console.error("Orders::handleReset: orders empty");
      return;
    }

    orders.forEach((order) => {
      order.subItems.forEach((subItem) => {
        subItem.userId = undefined;
      });
    });

    setOrders([...orders]);
  };

  const confirmReset = () => {
    setConfirmProps({
      title: "איפוס בחירה",
      subText: "האם אתה בטוח שברצונך לאפס את הבחירה?",
      buttons: [
        {
          text: "ביטול",
          appearance: "outline",
        },
        {
          text: "אישור",
          appearance: "primary",
          onClick: () => {
            handleReset();
          },
        },
      ],
    });
    setConfirmOpen(true);
  };

  const selectedItems = orders?.reduce((acc, order) => {
    const selectedSubItems = order.subItems.filter(
      (subItem) => subItem.userId
    ).length;
    return acc + selectedSubItems;
  }, 0);

  return (
    <>
      <BasePage
        defaultOrders={orders}
        title="בקשות"
        loading={saving ? "מעדכן..." : undefined}
        filters={{
          text: true,
          type: true,
          product: true,
        }}
        itemRender={{
          header: (order) => `איש קשר: ${order.name}`,
          content: (order) => (
            <SubItems
              items={order.subItems}
              onToggle={(subItem: FilteredSubItem, isChecked: boolean) =>
                handleToggleSubItem(order.id, subItem, isChecked)
              }
            />
          ),
        }}
        style={{ bottom: "44px" }}
      />
      {/* BUTTON: ASSIGN */}
      {orders?.length && (
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
          <Button
            appearance="primary"
            style={{ flex: 3, whiteSpace: "nowrap" }}
            onClick={handleSubmit}
            disabled={!selectedItems || saving}
          >
            {`הוסף להזמנות שלי ${selectedItems ? `(${selectedItems})` : ""}`}
          </Button>
          <Button
            appearance="outline"
            style={{ flex: 1, whiteSpace: "nowrap" }}
            onClick={confirmReset}
            disabled={!selectedItems || saving}
          >
            אפס בחירה
          </Button>
        </div>
      )}
      {/* POPUP */}
      {confirmProps && (
        <ConfirmDialog
          openState={[confirmOpen, setConfirmOpen]}
          {...confirmProps}
        />
      )}
    </>
  );
};
