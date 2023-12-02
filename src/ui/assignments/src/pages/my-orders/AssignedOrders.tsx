import React, { useEffect, useState } from "react";
import { Body1Stronger, Divider } from "@fluentui/react-components";

import { useOrdersService } from "../../services/Orders.service.ts";
import {
  DONE_STATUS,
  FilteredOrder,
  FilteredSubItem,
  showOrder,
} from "../../services/Filters.service.ts";
import {
  ConfirmDialog,
  ConfirmDialogProps,
} from "../../components/ConfirmDialog.tsx";
import { AssignedSubItems } from "./AssignedSubItems.tsx";
import { BasePage } from "../../components/BasePage.tsx";

export const AssignedOrders: React.FunctionComponent = () => {
  const [myOrders, setMyOrders] = useState<FilteredOrder[] | null>(null); // assigned-orders list from the server
  const [statusesList, setStatusesList] = useState<string[] | undefined>(); // static list of status from the server

  const [confirmOpen, setConfirmOpen] = useState<boolean | undefined>(false);
  const [confirmProps, setConfirmProps] = useState<
    Omit<ConfirmDialogProps, "openState"> | undefined
  >();

  const ordersService = useOrdersService();

  useEffect(() => {
    if (!ordersService) {
      console.error("MyOrders::Init: ordersService not ready");
      return;
    }

    if (!myOrders) {
      ordersService
        .fetchAssignedOrders()
        .then((items) =>
          setMyOrders(items.orders.map((order) => showOrder(order)))
        );
    }

    if (!statusesList) {
      ordersService
        .fetchOrderStatusNames()
        .then((_statusesList) => setStatusesList(_statusesList));
    }
  }, []);

  const handleSubItemStatusChange = (
    orderId: number,
    subItem: FilteredSubItem,
    status: string
  ) => {
    if (!ordersService) {
      console.error("MyOrders::handleStatusChange: ordersService not ready");
      return;
    }

    ordersService.changeStatus({
      orderId,
      subItemId: subItem.id,
      subItemBoardId: subItem.subItemBoardId,
      status,
    });
  };

  const confirmSubItemStatusChange = (
    orderId: number,
    subItem: FilteredSubItem,
    status: string,
    onCancel: () => void
  ) => {
    if (status === DONE_STATUS) {
      setConfirmProps({
        title: "האם אתה בטוח",
        subText: `האם לסמן את ${subItem.product.name} כבוצע?`,
        buttons: [
          {
            text: "ביטול",
            appearance: "outline",
            onClick: onCancel,
          },
          {
            text: "אישור",
            appearance: "primary",
            onClick: () => {
              handleSubItemStatusChange(orderId, subItem, status);
            },
          },
        ],
      });
      setConfirmOpen(true);
    } else {
      handleSubItemStatusChange(orderId, subItem, status);
    }
  };

  const handleSubItemRemove = (orderId: number, subItem: FilteredSubItem) => {
    if (!ordersService) {
      console.error("MyOrders::handleSubItemRemove: ordersService not ready");
      return;
    }

    ordersService.unAssignSubItem({
      orderId,
      subItemId: subItem.id,
      subItemBoardId: subItem.subItemBoardId,
    });

    if (!myOrders) {
      console.error("MyOrders::handleSubItemRemove: myOrders not empty");
      return;
    }

    const orderIndex = myOrders.findIndex((order) => order.id === orderId);
    if (orderIndex === -1) {
      console.error("MyOrders::handleSubItemRemove: orderIndex not found");
      return;
    }

    myOrders[orderIndex].subItems = [
      ...myOrders[orderIndex].subItems.filter(
        (_subItem: FilteredSubItem) => _subItem.id !== subItem.id
      ),
    ];

    const isEmptyOrder = myOrders[orderIndex].subItems.length === 0;
    if (isEmptyOrder) {
      myOrders.splice(orderIndex, 1);
    }

    setMyOrders([...myOrders]);
  };

  const confirmSubItemRemove = (orderId: number, subItem: FilteredSubItem) => {
    setConfirmProps({
      title: "האם אתה בטוח",
      subText: `האם להסיר את ${subItem.product.name}?`,
      buttons: [
        {
          text: "ביטול",
          appearance: "outline",
        },
        {
          text: "אישור",
          appearance: "primary",
          onClick: () => {
            handleSubItemRemove(orderId, subItem);
          },
        },
      ],
    });
    setConfirmOpen(true);
  };

  return (
    <>
      <BasePage
        defaultOrders={myOrders}
        title="הזמנות"
        filters={{
          text: true,
          type: true,
          product: true,
          done: true,
        }}
        itemRender={{
          header: (order) => (
            <div style={{ width: "100%" }}>
              <div>איזור: {order.region ?? "ללא איזור מוגדר"}</div>
              <div>
                איש קשר: {order.name}, טלפון:{" "}
                <Body1Stronger>
                  <a
                    href={`tel:${
                      (order.phone ?? "").startsWith("972") ? "+" : ""
                    }${order.phone}`}
                  >
                    {order.phone}
                  </a>
                </Body1Stronger>
              </div>
              <Divider appearance="strong" />
            </div>
          ),
          content: (order) => (
            <AssignedSubItems
              items={order.subItems}
              statusesList={statusesList ?? []}
              onStatusChange={(subItem, status, onCancel) =>
                confirmSubItemStatusChange(order.id, subItem, status, onCancel)
              }
              onDelete={(item) => confirmSubItemRemove(order.id, item)}
            />
          ),
        }}
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
