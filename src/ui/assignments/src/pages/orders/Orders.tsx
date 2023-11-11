import { useEffect, useMemo, useState } from "react";
import {
  Body1,
  Button,
  Card,
  CardHeader,
  CardPreview,
  Field,
  tokens,
} from "@fluentui/react-components";
import {
  TextExpand24Regular,
  TextCollapse24Filled,
} from "@fluentui/react-icons";

import { SubItem, VisibleOrder, VisibleSubItem } from "../../types.ts";
import { useAuthenticationService } from "../../services/authentication.ts";
import { OrdersService } from "../../services/orders.service.ts";
import {
  filterOrdersByText,
  filterOrdersByType,
} from "../../services/filterOrders.ts";
import { Header } from "../../components/header.tsx";
import { Loading } from "../../components/Loading.tsx";
import { SearchBoxDebounce } from "../../components/SearchBoxDebounce.tsx";
import { SubHeader, SubHeader2 } from "../../components/SubHeader.tsx";
import { TypeFilter } from "../../components/TypeFilter.tsx";
import {
  ConfirmDialog,
  ConfirmDialogProps,
} from "../../components/ConfirmDialog.tsx";
import { SubItems } from "./SubItems.tsx";
import { pageStyle } from "../sharedStyles.ts";

export const Orders = () => {
  const [orders, setOrders] = useState<VisibleOrder[] | undefined>(); // all orders
  const [openNoteIds, setOpenNoteIds] = useState<number[]>([]); // open notes ids (used to toggle open notes)
  const [saving, setSaving] = useState(false); // saving state (used for saving spinner and block submit button)

  const [confirmOpen, setConfirmOpen] = useState<boolean | undefined>(false);
  const [confirmProps, setConfirmProps] = useState<
    Omit<ConfirmDialogProps, "openState"> | undefined
  >();

  const { getUserId } = useAuthenticationService();
  const userId = getUserId();

  const ordersService = useMemo(() => {
    if (!userId) {
      console.error("Orders::Init: Not logged in");
      return undefined;
    }

    return new OrdersService(userId);
  }, [userId]);

  useEffect(() => {
    if (!ordersService) {
      console.error("Orders::Init: ordersService not ready");
      return;
    }

    if (!orders) {
      ordersService.fetchUnassignedOrders().then((items) => {
        setOrders(items.orders);
      });
    }
  }, [ordersService]);

  const handleTilterByText = (searchText?: string) => {
    filterOrdersByText([orders, setOrders], searchText);
  };

  const handleFilterByType = (optionValue?: string) => {
    filterOrdersByType([orders, setOrders], optionValue);
  };

  const handleToggleSubItem = (
    orderId: number,
    subItem: SubItem,
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

  const toggleOpenNote = (id: number) => {
    setOpenNoteIds((openNoteIds) =>
      openNoteIds.includes(id)
        ? openNoteIds.filter((openNoteId) => openNoteId !== id)
        : [...openNoteIds, id]
    );
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
    let subItemsToAssign: VisibleSubItem[] = [];
    const ordersToKeep: VisibleOrder[] = [];

    try {
      setSaving(true);

      orders.forEach((order) => {
        const itemsToKeep: VisibleSubItem[] = []; // will be kept
        const itemsToRemove: VisibleSubItem[] = []; // will be assigned

        order.subItems.forEach((subItem) =>
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

  return (
    <>
      <Header />
      <div style={pageStyle}>
        <SubHeader>בקשות{orders && ` (${orders?.length})`}</SubHeader>
        {saving ? (
          <Loading label="מעדכן..." />
        ) : !orders ? (
          <Loading />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* filters */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Field label="חיפוש" style={{ flex: 1 }}>
                <SearchBoxDebounce onChange={handleTilterByText} />
              </Field>
              <Field label="סינון לפי סוג" style={{ flex: 1 }}>
                <TypeFilter onChange={handleFilterByType} />
              </Field>
            </div>

            {orders.length === 0 ? (
              // $G$ TODO - also show if filter has no results
              <SubHeader2>אין בקשות</SubHeader2>
            ) : (
              orders
                .filter((order) => !order.hidden)
                .map(({ id, unit, subItems, comments }) => (
                  <Card
                    key={id}
                    style={{
                      textAlign: "right",
                      width: "100%",
                      marginBottom: "30px",
                    }}
                  >
                    <CardHeader
                      header={
                        <Body1 style={{ textAlign: "left" }}>
                          <b>{unit ?? "no name"}</b>
                        </Body1>
                      }
                    />
                    <CardPreview>
                      <SubItems
                        items={subItems}
                        onToggle={(subItem: SubItem, isChecked: boolean) =>
                          handleToggleSubItem(id, subItem, isChecked)
                        }
                      />
                      {comments && (
                        <a
                          style={{
                            display: "flex",
                            alignItems: "center",
                            margin: 10,
                          }}
                          onClick={() => toggleOpenNote(id)}
                        >
                          הערות
                          {openNoteIds.includes(id) ? (
                            <TextCollapse24Filled />
                          ) : (
                            <TextExpand24Regular />
                          )}
                        </a>
                      )}
                      {openNoteIds.includes(id) ? (
                        <p style={{ margin: 10 }}>{comments}</p>
                      ) : null}
                    </CardPreview>
                  </Card>
                ))
            )}
          </div>
        )}
      </div>
      {orders?.length && (
        <div
          style={{
            position: "fixed",
            padding: "6px 24px",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: tokens.colorNeutralBackground1,
          }}
        >
          <Button
            appearance="primary"
            style={{ width: "100%" }}
            onClick={handleSubmit}
            disabled={
              saving ||
              orders.every((order) =>
                order.subItems.every((subItem) => !subItem.userId)
              )
            }
          >
            הוסף להזמנות שלי
          </Button>
        </div>
      )}
      {confirmProps && (
        <ConfirmDialog
          openState={[confirmOpen, setConfirmOpen]}
          {...confirmProps}
        />
      )}
    </>
  );
};
