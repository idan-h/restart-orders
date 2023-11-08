import {
  DataGridBody,
  DataGrid,
  DataGridRow,
  DataGridCell,
  createTableColumn,
  TableCellLayout,
  Button,
} from "@fluentui/react-components";
import { Delete24Regular } from "@fluentui/react-icons";
import { SubItem } from "../../types.ts";
import { useAuthenticationService } from "../../services/authentication.ts";
import { makeOrdersService } from "../../services/orders.service.ts";

type Props = {
  orderId: string;
  items: SubItem[];
  onChange: (products: SubItem[]) => void;
};

export const AssignedSubItems = ({ items, orderId, onChange }: Props) => {
  const { getUserId } = useAuthenticationService();
  const ordersService = makeOrdersService(getUserId());

  const handleProductUnassign = (subItemId: string, subItemBoardId: string) => {
    if (!ordersService) {
      console.error("ordersService not ready");
      return;
    }

    ordersService.unAssignSubItem({
      orderId,
      subItemId,
      subItemBoardId,
    });
    onChange(items.filter((item) => item.id !== subItemId));
  };

  const columns = [
    createTableColumn<SubItem>({
      columnId: "file",
      renderCell: (item) => {
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
      renderCell: (item) => {
        return <TableCellLayout>{item.quantity}</TableCellLayout>;
      },
    }),
    createTableColumn<SubItem>({
      columnId: "status",
      renderCell: (item) => {
        return <TableCellLayout>{item.status}</TableCellLayout>;
      },
    }),
    createTableColumn<SubItem>({
      columnId: "unassign",
      renderCell: (item) => {
        return (
          <TableCellLayout>
            {/* delete button */}
            <Button
              appearance="transparent"
              onClick={() =>
                handleProductUnassign(item.id, item.subItemBoardId)
              }
              icon={<Delete24Regular />}
            />
          </TableCellLayout>
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
