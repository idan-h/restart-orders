import {
  TableBody,
  TableCell,
  TableRow,
  Table,
  TableCellLayout,
  Switch,
  Input,
} from "@fluentui/react-components";
import { SubItem } from "../../types.ts";

type Props = {
  items: SubItem[];
  onChange: (products: SubItem[]) => void;
};

export const SubItems = ({ items, onChange }: Props) => {
  const handleProductToggle = (id: string, checked: boolean) => {
    onChange(
      items.map((item) =>
        id === item.id
          ? {
              ...item,
              requestedQuantity: checked ? item.quantity : 0,
            }
          : item
      )
    );
  };

  const handleSubItemChange = (id: string, value: number) => {
    onChange(
      items.map((item) =>
        id === item.id
          ? {
              ...item,
                requestedQuantity: value,
            }
          : item
      )
    );
  };

  console.log(items);

  return (
    <Table arial-label="Default table">
      <TableBody>
        {items.map(({ id, productName, quantity, requestedQuantity }) => (
          <TableRow key={id}>
            <TableCell>
              <TableCellLayout>{productName}</TableCellLayout>
            </TableCell>
            <TableCell>
              <TableCellLayout>{quantity}</TableCellLayout>
            </TableCell>
            <TableCell>
              <Input
                style={{ width: "80px" }}
                min={1}
                max={quantity}
                onChange={(_, data) =>
                  handleSubItemChange(id, parseInt(data.value))
                }
                value={requestedQuantity?.toString()}
                type="number"
                disabled={!requestedQuantity}
              />
            </TableCell>
            <TableCell>
              <TableCellLayout>
                <Switch
                  onChange={(_, data) => handleProductToggle(id, data.checked)}
                />
              </TableCellLayout>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
