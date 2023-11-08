import { useEffect, useState } from "react";
import {
  makeStyles,
  Body1,
  Card,
  CardHeader,
  CardPreview,
} from "@fluentui/react-components";
import {
  TextExpand24Regular,
  TextCollapse24Filled,
} from "@fluentui/react-icons";

import { Order, SubItem } from "../../types.ts";
import { useOrdersService } from "../../services/orders.ts";

import { AssignedSubItems } from "./AssignedSubItems.tsx";
import { Header } from "../../components/header.tsx";
import { Loading } from "../../components/Loading.tsx";
import { pageStyle } from "../utils.ts";

const useStyles = makeStyles({
  card: {
    textAlign: "left",
    width: "100%",
    marginBottom: "30px",
  },
});

export const AssignedOrders = () => {
  const { fetchAssignedOrders } = useOrdersService();
  const styles = useStyles();

  const [orders, setOrders] = useState<Order[] | undefined>();
  const [openNoteIds, setOpenNoteIds] = useState<string[]>([]);

  const handleItemsChanges = (orderId: string, subItems: SubItem[]) => {
    setOrders(
      orders
        ?.map((order) =>
          order.id === orderId ? { ...order, subItems } : order
        )
        .filter((order) => order.subItems.length)
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
    fetchAssignedOrders().then((items) => setOrders(items.orders));
  }, []);

  if (!orders) {
    return <Loading />;
  }

  return (
    <>
      <Header />
      <div style={pageStyle}>
        <h2 style={{ textAlign: "center", margin: "20px auto" }}>הזמנות</h2>
        {orders.map(({ id, unit, subItems, phone, comment }) => {
          return (
            <Card key={id} className={styles.card}>
              <CardHeader
                header={
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Body1 style={{ textAlign: "left" }}>
                      <b>{unit}</b>
                    </Body1>
                    <Body1>
                      <b>{phone}</b>
                    </Body1>
                  </div>
                }
              />
              <CardPreview>
                <AssignedSubItems
                  items={subItems}
                  onChange={(subItems) => handleItemsChanges(id, subItems)}
                  orderId={id}
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
      </div>
    </>
  );
};
