import { Card, CardHeader, CardPreview, DataGridCell, Table, TableBody, TableRow } from "@fluentui/react-components";
import React, { useEffect } from "react";
import { type Order, fetchOrder } from "../../services/orders";

export const EditOrder: React.FC<{ orderId: string }> = ({ orderId }) => {
  const [order, setOrder] = React.useState<Order | undefined>(undefined);

  useEffect(() => void (async () => setOrder(await fetchOrder(orderId)))(), []);

  return order ? (
    <Card>
      <CardHeader>
        <h3>הזמנה {orderId}</h3>
      </CardHeader>
      <CardPreview>
        <div>מיקום: {order?.region}</div>
        <h4>פריטים</h4>
        <Table>
          <TableBody>
            <TableRow>
              <DataGridCell>1</DataGridCell>
              <DataGridCell>1</DataGridCell>
            </TableRow>
            <TableRow>
              <DataGridCell>3</DataGridCell>
              <DataGridCell>4</DataGridCell>
            </TableRow>
          </TableBody>
>        </Table>
      </CardPreview>
    </Card>
  ) : null;
};
