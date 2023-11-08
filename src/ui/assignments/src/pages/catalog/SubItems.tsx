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

  // const handleSubItemChange = (id: string, value: number) => {
  //   onChange!(
  //     items.map((item) =>
  //       id === item.id
  //         ? {
  //             ...item,
  //             requestedQuantity: value,
  //           }
  //         : item
  //     )
  //   );
  // };

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
            {/*<TableCell>*/}
            {/*  <Input*/}
            {/*    style={{ width: "60px" }}*/}
            {/*    min={1}*/}
            {/*    max={quantity}*/}
            {/*    onChange={(_, data) =>*/}
            {/*      handleSubItemChange(id, parseInt(data.value))*/}
            {/*    }*/}
            {/*    value={requestedQuantity?.toString()}*/}
            {/*    type="number"*/}
            {/*    disabled={!requestedQuantity}*/}
            {/*  />*/}
            {/*</TableCell>*/}
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