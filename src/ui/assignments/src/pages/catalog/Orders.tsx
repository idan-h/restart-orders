import { useNavigate } from "react-router-dom";

import {
  makeStyles,
  Body1,
  Button,
  shorthands,
  Card,
  CardHeader,
  CardPreview,
} from "@fluentui/react-components";
import {
  TextExpand24Regular,
  TextCollapse24Filled,
} from "@fluentui/react-icons";
import { useEffect, useState } from "react";
import { Order, SubItem } from "../../types.ts";
import { SubItems } from "./SubItems.tsx";
import { useOrdersService } from "../../services/orders.ts";
import { Header } from "../../components/header.tsx";
import { Loading } from "../../components/Loading.tsx";

import { ROUTES } from "../../routes-const.ts";
import { pageStyle } from "../utils.ts";

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

  const [orders, setOrders] = useState<Order[] | undefined>();
  const [openNoteIds, setOpenNoteIds] = useState<string[]>([]);
  const { fetchUnassignedOrders, assignSubItem } = useOrdersService();

  const submit = () => {
    Promise.all(
      orders?.flatMap((order) =>
        order.subItems
          .filter((subItem) => !!subItem.userId)
          .map((subItem) =>
            assignSubItem({
              orderId: order.id,
              subItemId: subItem.id,
              subItemBoardId: subItem.subItemBoardId,
            })
          )
      ) ?? []
    ).then(() => navigate(ROUTES.MY_ORDERS));
  };

  const handleSubItemsChange = (orderId: string, subItems: SubItem[]) => {
    setOrders(
      orders?.map((order) =>
        order.id === orderId ? { ...order, subItems } : order
      )
    );
  };

  const toggleOpenNote = (id: string) => {
    setOpenNoteIds((openNoteIds) =>
      openNoteIds.includes(id)
        ? openNoteIds.filter((openNoteId) => openNoteId !== id)
        : [...openNoteIds, id]
    );
  };

  useEffect(() => {
    fetchUnassignedOrders().then((items) => setOrders(items.orders));
  }, []);

  if (!orders) {
    return <Loading />;
  }

  return (
    <>
      <Header />
      <div style={pageStyle}>
        <h2 style={{ textAlign: "center", margin: "20px auto" }}>בקשות</h2>
        {orders.map(({ id, unit, subItems, comment }) => {
          return (
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
                  onChange={(subItems) => handleSubItemsChange(id, subItems)}
                  items={subItems}
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
          );
        })}

        <div>
          <Button
            onClick={() => submit()}
            disabled={orders.every((order) =>
              order.subItems.every((subItem) => !subItem.userId)
            )}
          >
            שלח
          </Button>
        </div>
      </div>
    </>
  );
};
