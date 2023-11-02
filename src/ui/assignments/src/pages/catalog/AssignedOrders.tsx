import {
  makeStyles,
  Body1,
  Button,
  shorthands,
  Card,
  CardFooter,
  CardHeader,
  CardPreview,
} from "@fluentui/react-components";
import { TextExpand24Regular, TextCollapse24Filled } from "@fluentui/react-icons"
import {fetchAssignedOrders} from "../../api.ts";
import { useEffect, useState } from "react";
import { Order } from "../../types.ts";
import { SubItems } from "./SubItems.tsx";

const useStyles = makeStyles({
  card: {
    ...shorthands.margin("auto"),
    textAlign: "left",
    width: "100%",
    marginBottom: "30px",
  },
});

export const AssignedOrders = () => {
  const styles = useStyles();

  const [orders, setOrders] = useState<Order[] | undefined>();
  const [openNoteIds, setOpenNoteIds] = useState<string[]>([]);

  const toggleOpenNote = (id: string) => {
    setOpenNoteIds(openNoteIds => openNoteIds.includes(id)
        ? openNoteIds.filter(openNoteId => openNoteId !== id)
        : [...openNoteIds, id]
    );
  }

  useEffect(() => {
    fetchAssignedOrders().then((items) => setOrders(items));
  }, []);

  if (!orders) {
    return "Loading...";
  }

  return (
    <div style={{ margin: "auto" }}>
      <h2 style={{ textAlign: "center", margin: "20px auto" }}>הזמנות</h2>
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
                items={subItems}
              />
              {
                  comment && <a
                  style={{ display: 'flex', alignItems: 'center', margin: 10 }}
                    onClick={()=> toggleOpenNote(id)}>
                הערות
                    {
                    openNoteIds.includes(id)
                      ? <TextCollapse24Filled />
                      : <TextExpand24Regular />
                  }
                  </a>
              }
              {
                openNoteIds.includes(id)
                    ? <p style={{ margin: 10 }}>{comment}</p>
                    : null
              }
              </CardPreview>
            <CardFooter>
              <Button>עדכן</Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};
