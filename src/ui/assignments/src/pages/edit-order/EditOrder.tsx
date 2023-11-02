import {
  Combobox,
  Option,
  DataGridCell,
  Spinner,
  Table,
  TableBody,
  TableRow,
} from "@fluentui/react-components";
import React, { useEffect } from "react";
import {
  useOrdersService,
} from "../../services/orders";
import { Order } from "../../types";
import { Link } from 'react-router-dom';

export const EditOrder: React.FC<{ orderId: string }> = ({ orderId }) => {
  const {fetchOrder, fetchOrderStatusNames} = useOrdersService()
  const [order, setOrder] = React.useState<Order | undefined>(undefined);
  const [orderStatusNames, setOrderStatusNames] = React.useState<
    string[] | undefined
  >(undefined);

  useEffect(() => void (async () => setOrder(await fetchOrder(orderId)))(), []);
  useEffect(
    () =>
      void (async () => setOrderStatusNames(await fetchOrderStatusNames()))(),
    []
  );

  function handleStatusChange(subItemId: string, newStatus: string) {
    setOrder(
      order && {
        ...order,
        subItems: [
          ...order.subItems.map((subItem) =>
            subItem.id === subItemId
              ? { ...subItem, status: newStatus }
              : subItem
          ),
        ],
      }
    );
  }

  return order ? (
    <>
      <p><Link to="/my-orders">חזרה</Link></p>
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
                <DataGridCell>
                  <Combobox
                    value={subItem.status}
                    onOptionSelect={(_, data) =>
                      handleStatusChange(subItem.id, data.optionValue ?? "")
                    }
                  >
                    {orderStatusNames?.map((status) => (
                      <Option key={status}>{status}</Option>
                    ))}
                  </Combobox>
                </DataGridCell>
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
