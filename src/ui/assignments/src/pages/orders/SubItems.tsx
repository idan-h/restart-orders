import {
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridRow,
  Switch,
  TableCellLayout,
  createTableColumn,
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

  const columns = [
    createTableColumn<SubItem>({
      columnId: "file",
      renderCell: (item: SubItem) => {
        return (
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
              {item.productName}
            </div>
          </TableCellLayout>
        );
      },
    }),
    createTableColumn<SubItem>({
      columnId: "quantity",
      renderCell: (item: SubItem) => {
        return <TableCellLayout>{item.quantity}</TableCellLayout>;
      },
    }),

    createTableColumn<SubItem>({
      columnId: "status",
      renderCell: (item: SubItem) => {
        return (
          onChange && (
            <TableCellLayout>
              <Switch
                onChange={(_, data) =>
                  handleProductToggle(item.id, data.checked)
                }
                checked={!!item.userId}
              />
            </TableCellLayout>
          )
        );
      },
    }),
  ];
  return (
    <DataGrid items={items} columns={columns} getRowId={(item) => item.id}>
      <DataGridBody<SubItem>>
        {({ item, rowId }) => (
          <DataGridRow<SubItem>
            key={rowId}
            selectionCell={{ style: { display: "none" } }}
          >
            {({ renderCell }) => (
              <DataGridCell>{renderCell(item)}</DataGridCell>
            )}
          </DataGridRow>
        )}
      </DataGridBody>
    </DataGrid>
  );
};

/**
 * {items.map(({ id, productName, quantity, userId }) => (
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
 */
