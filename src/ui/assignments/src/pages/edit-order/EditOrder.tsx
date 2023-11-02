import {
  Card,
  CardHeader,
  CardPreview,
  DataGridCell,
  Spinner,
  Table,
  TableBody,
  TableRow,
} from "@fluentui/react-components";
import React, { useEffect } from "react";
import { fetchOrder } from "../../services/orders";
import { Order } from "../../types";

export const EditOrder: React.FC<{ orderId: string }> = ({ orderId }) => {
  const [order, setOrder] = React.useState<Order | undefined>(undefined);

  useEffect(() => void (async () => setOrder(await fetchOrder(orderId)))(), []);

  return order ? (
    <>
      <h2>עריכת הזמנה {orderId}</h2>
      <div>
        עבור יחידה <b>{order.unit}</b> ב-<b>{order.region}</b>
      </div>
      <h3>פריטים</h3>
      <Table>
        <TableBody>
          {order.subItems.map((subItem) => (
            <TableRow>
              <>
                <DataGridCell>{subItem.productName}</DataGridCell>
                <DataGridCell>{subItem.quantity}</DataGridCell>
                <DataGridCell>{subItem.status}</DataGridCell>
              </>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  ) : (
    <Spinner />
  );
};
