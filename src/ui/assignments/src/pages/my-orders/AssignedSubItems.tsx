import {
  TableBody,
  TableCell,
  TableRow,
  Table,
  TableCellLayout,
  Button,
} from "@fluentui/react-components";
import { SubItem } from "../../types.ts";
import {useOrdersService} from "../../services/orders.ts";

type Props = {
  orderId: string
  items: SubItem[];
  onChange: (products: SubItem[]) => void;
};

export const AssignedSubItems = ({ items, orderId, onChange }: Props) => {
  const { unAssignSubItem } = useOrdersService();
  const handleProductUnassign = (subItemId: string, subItemBoardId: string) => {
    unAssignSubItem({
      orderId,
      subItemId,
      subItemBoardId
    })
    onChange(items.filter(item => item.id !== subItemId));
  };

  return (
    <Table>
      <TableBody>
        {items.map(({ id, subItemBoardId, productName, quantity }) => (
          <TableRow key={id}>
            <TableCell>
              <TableCellLayout>
                <div
                  style={{
                    maxWidth: 200,
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    wordWrap: "break-word",
                    whiteSpace: "nowrap",
                  }}
                >
                  {productName}
                </div>
              </TableCellLayout>
            </TableCell>
            <TableCell>
              <TableCellLayout>{quantity}</TableCellLayout>
            </TableCell>
            <TableCell>
              <TableCellLayout>
                <Button onClick={() => handleProductUnassign(id, subItemBoardId)}>בטל שיוך</Button>
              </TableCellLayout>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
