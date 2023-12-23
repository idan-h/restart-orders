import React, { useEffect, useState } from "react";

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
import { BasePage } from "../../components/BasePage.tsx";
import { SubItems } from "./SubItems.tsx";
import { OrdersFooter } from "./Footer.tsx";

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
    let assignResults = [];

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

      assignResults = await Promise.all(
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

      const failedAssigns = assignResults.filter(
        (result) => result.error?.length > 0
      ).length;

      if (failedAssigns > 0) {
        setConfirmProps({
          title: `${failedAssigns} הזמנות נכשלו`,
          subText: "בדוק את לשונית הזמנות שלי",
          buttons: [
            {
              text: "אישור",
              appearance: "primary",
            },
          ],
        });
      } else {
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
      }

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
          header: (order) => (
            <div
              style={{
                width: "100%",
                display: "flex",
                "justify-content": "space-between",
              }}
            >
              <div>איש קשר: {order.name}</div>
              <div>
                תאריך יצירה:{" "}
                {new Date(order.createdAt).toLocaleDateString("en-GB")}
              </div>
            </div>
          ),
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
      <OrdersFooter
        orders={orders}
        disabled={saving}
        onSubmit={handleSubmit}
        onReset={confirmReset}
      />
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
