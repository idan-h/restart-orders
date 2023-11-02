import {
  makeStyles,
  Body1,
  Button,
  shorthands,
} from "@fluentui/react-components";
import {
  Card,
  CardFooter,
  CardHeader,
  CardPreview,
} from "@fluentui/react-components";
import { assignTask, fetchTasks } from "../../api.ts";
import { useEffect, useState } from "react";
import { Order, SubItem } from "../../types.ts";
import { SubItems } from "./Products.tsx";

const useStyles = makeStyles({
  card: {
    ...shorthands.margin("auto"),
    textAlign: "left",
    width: "100%",
    marginBottom: "30px",
  },
});

export const Catalog = () => {
  const styles = useStyles();

  const [orders, setOrders] = useState<Order[] | undefined>();

  const handleAssign = (id: string) => {
    assignTask(id);
  };

  const handleSubItemsChange = (orderId: string, subItems: SubItem[]) => {
    debugger;
    setOrders(
      orders?.map((order) =>
        order.id === orderId ? { ...order, subItems } : order
      )
    );
  };

  useEffect(() => {
    fetchTasks().then((items) => setOrders(items));
  }, []);

  if (!orders) {
    return "Loading...";
  }

  return (
    <div style={{ margin: "auto" }}>
      <h2 style={{ textAlign: "center", margin: "20px auto" }}>בקשות</h2>
      {orders.map(({ id, unit, subItems }) => {
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
            </CardPreview>

            <CardFooter>
              <Button onClick={() => handleAssign(id)} disabled={subItems.every(subItem => !subItem?.requestedQuantity)}>שלח</Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};
