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
import React from "react";

export interface SubItemsProps {
  items: SubItem[];
  onToggle: (subItem: SubItem, isChecked: boolean) => void;
}

export const SubItems: React.FunctionComponent<SubItemsProps> = ({
  items,
  onToggle,
}) => {
  const columns = [
    // Info
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
    // Quantity
    createTableColumn<SubItem>({
      columnId: "quantity",
      renderCell: (item: SubItem) => {
        return <TableCellLayout>{item.quantity}</TableCellLayout>;
      },
    }),
    // Toggle status
    createTableColumn<SubItem>({
      columnId: "status",
      renderCell: (subItem: SubItem) => {
        return (
          <TableCellLayout>
            <Switch
              onChange={(_, data) => onToggle(subItem, data.checked)}
              checked={Boolean(subItem.userId)}
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
