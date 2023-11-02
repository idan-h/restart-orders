import {
  Combobox,
  Option,
  DataGridCell,
  Spinner,
  Table,
  TableBody,
  TableRow,
  Button,
} from "@fluentui/react-components";
import React, { useEffect } from "react";
import { useOrdersService } from "../../services/orders";
import { Order } from "../../types";
import { Link } from "react-router-dom";

export const EditOrder: React.FC<{ orderId: string }> = ({ orderId }) => {
  const { fetchOrder, fetchOrderStatusNames, unAssignSubItem, changeStatus } =
    useOrdersService();
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

  async function handleStatusChange(
    orderId: string,
    subItemId: string,
    subItemBoardId: string,
    newStatus: string
  ) {
    await changeStatus({ orderId, subItemId, subItemBoardId, status: newStatus });
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

  async function handleUnassign(orderId: string, subItemId: string, subItemBoardId: string) {
    await unAssignSubItem({ orderId, subItemId, subItemBoardId });
    setOrder(
      order && {
        ...order,
        subItems: [
          ...order.subItems.map((subItem) =>
            subItem.id === subItemId
              ? { ...subItem, status: undefined, userId: undefined }
              : subItem
          ),
        ],
      }
    );
  }

  return order ? (
    <>
      <p>
        <Link to="/my-orders">חזרה</Link>
      </p>
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
                    value={subItem.status ?? "לא מספק"}
                    onOptionSelect={(_, data) =>
                      handleStatusChange(
                        order.id,
                        subItem.id,
                        subItem.subItemBoardId,
                        data.optionValue ?? ""
                      )
                    }
                  >
                    {orderStatusNames?.map((status) => (
                      <Option key={status}>{status}</Option>
                    ))}
                  </Combobox>
                  <Button onClick={() => handleUnassign(order.id, subItem.id, subItem.subItemBoardId)}>
                    לא יכול לספק
                  </Button>
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
