import { useNavigate } from "react-router-dom";

import {
  makeStyles,
  Body1,
  Button,
  Card,
  CardHeader,
  CardPreview,
  tokens,
} from "@fluentui/react-components";
import {
  TextExpand24Regular,
  TextCollapse24Filled,
} from "@fluentui/react-icons";
import { useEffect, useState } from "react";
import { Order, SubItem } from "../../types.ts";
import { SubItems } from "./SubItems.tsx";
import { Header } from "../../components/header.tsx";
import { Loading } from "../../components/Loading.tsx";

import { ROUTES } from "../../routes-const.ts";
import { pageStyle, titleStyle } from "../sharedStyles.ts";
import { makeOrdersService } from "../../services/orders.service.ts";
import { useAuthenticationService } from "../../services/authentication.ts";

const useStyles = makeStyles({
  card: {
    textAlign: "left",
    width: "100%",
    marginBottom: "30px",
  },
});

export const Orders = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState<Order[] | undefined>();
  const [openNoteIds, setOpenNoteIds] = useState<string[]>([]);

  const { getUserId } = useAuthenticationService();
  const ordersService = makeOrdersService(getUserId());

  useEffect(() => {
    if (!ordersService) {
      console.error("Orders::Init: ordersService not ready");
      return;
    }

    if (!orders) {
      ordersService
        .fetchUnassignedOrders()
        .then((items) => setOrders(items.orders));
    }
  }, [ordersService]);

  const handleSubmit = async () => {
    if (!ordersService) {
      console.error("Orders::handleSubmit: ordersService not ready");
      return;
    }

    try {
      setSaving(true);
      await Promise.all(
        orders?.flatMap((order) =>
          order.subItems
            .filter((subItem) => !!subItem.userId)
            .map((subItem) =>
              ordersService.assignSubItem({
                orderId: order.id,
                subItemId: subItem.id,
                subItemBoardId: subItem.subItemBoardId,
              })
            )
        ) ?? []
      );
    } catch (e) {
      console.error("Orders::handleSubmit: failed to save all items");
      // reloading because some items may have succeeded
      window.location.reload();
      return;
    } finally {
      setSaving(false);
    }

    navigate(ROUTES.MY_ORDERS);
  };

  const handleToggleSubItem = (
    orderIndex: number,
    subItem: SubItem,
    isChecked: boolean
  ) => {
    if (!orders) {
      console.error("Orders::handleToggleSubItem: orders empty");
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
      userId: isChecked ? getUserId() : undefined,
    };

    setOrders([...orders]);
  };

  const toggleOpenNote = (id: string) => {
    setOpenNoteIds((openNoteIds) =>
      openNoteIds.includes(id)
        ? openNoteIds.filter((openNoteId) => openNoteId !== id)
        : [...openNoteIds, id]
    );
  };

  return (
    <>
      <Header />
      <div style={pageStyle}>
        <h2 style={titleStyle}>בקשות</h2>
        {saving ? (
          <Loading label="...מעדכן" />
        ) : !orders ? (
          <Loading />
        ) : orders.length === 0 ? (
          <h3 style={titleStyle}>אין בקשות</h3>
        ) : (
          orders.map(({ id, unit, subItems, comment }, orderIndex) => (
            <Card key={id} className={styles.card}>
              <CardHeader
                header={
                  <Body1 style={{ textAlign: "left" }}>
                    <b>{unit}</b>
                  </Body1>
                }
              />

              <CardPreview>
                <SubItems
                  items={subItems}
                  onToggle={(subItem: SubItem, isChecked: boolean) =>
                    handleToggleSubItem(orderIndex, subItem, isChecked)
                  }
                />
                {comment && (
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
                  <p style={{ margin: 10 }}>{comment}</p>
                ) : null}
              </CardPreview>
            </Card>
          ))
        )}
      </div>
      {orders && (
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
            הוסף לבקשות שלי
          </Button>
        </div>
      )}
    </>
  );
};
