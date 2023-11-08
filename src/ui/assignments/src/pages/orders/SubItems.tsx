import {
  TableBody,
  TableCell,
  TableRow,
  Table,
  TableCellLayout,
  Switch,
} from "@fluentui/react-components";

import { SubItem } from "../../types.ts";
import { useAuthenticationService } from "../../services/authentication.ts";

type Props = {
  items: SubItem[];
  onChange?: (products: SubItem[]) => void;
};

export const SubItems = ({ items, onChange }: Props) => {
  const { getUserId } = useAuthenticationService();

  const handleProductToggle = (id: string, checked: boolean) => {
    onChange!(
      items.map((item) =>
        id === item.id
          ? {
              ...item,
              userId: checked ? getUserId() : undefined,
            }
          : item
      )
    );
  };

  return (
    <Table>
      <TableBody>
        {items.map(({ id, productName, quantity, userId }) => (
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
            {onChange && (
              <TableCell>
                <TableCellLayout>
                  <Switch
                    onChange={(_, data) =>
                      handleProductToggle(id, data.checked)
                    }
                    checked={!!userId}
                  />
                </TableCellLayout>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
