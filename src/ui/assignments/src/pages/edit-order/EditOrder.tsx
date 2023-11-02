import {
  Card,
  CardHeader,
  CardPreview,
  DataGridCell,
  Table,
  TableBody,
  TableRow,
} from "@fluentui/react-components";
import React, { useEffect } from "react";
import { fetchOrder } from "../../services/orders";
import { Order } from '../../types';

export const EditOrder: React.FC<{ orderId: string }> = ({ orderId }) => {
  const [order, setOrder] = React.useState<Order | undefined>(undefined);

  useEffect(() => void (async () => setOrder(await fetchOrder(orderId)))(), []);

  return order ? (
    <Card>
      <CardHeader>
        <h3>הזמנה {orderId}</h3>
      </CardHeader>
      <CardPreview>
        <div>
          עבור יחידה {order.unit} ב-{order.region}
        </div>
        <h4>פריטים</h4>
        <Table>
          <TableBody>
            <TableRow>
              {order.subItems.map((subItem) => (
                <>
                  <DataGridCell>{subItem.productName}</DataGridCell>
                  <DataGridCell>{subItem.quantity}</DataGridCell>
                  <DataGridCell>{subItem.status}</DataGridCell>
                </>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </CardPreview>
    </Card>
  ) : null;
};
