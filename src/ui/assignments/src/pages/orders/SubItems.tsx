import {
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridRow,
  Switch,
  TableCellLayout,
  createTableColumn,
} from "@fluentui/react-components";

import { VisibleSubItem } from "../../types.ts";
import React from "react";

export interface SubItemsProps {
  items: VisibleSubItem[];
  onToggle: (subItem: VisibleSubItem, isChecked: boolean) => void;
}

export const SubItems: React.FunctionComponent<SubItemsProps> = ({
  items,
  onToggle,
}) => {
  const columns = [
    // Info
    createTableColumn<VisibleSubItem>({
      columnId: "file",
      renderCell: (item: VisibleSubItem) => {
        return (
          <DataGridCell>
            <TableCellLayout>{item.product.name}</TableCellLayout>
          </DataGridCell>
        );
      },
    }),
    // Quantity
    createTableColumn<VisibleSubItem>({
      columnId: "quantity",
      renderCell: (item: VisibleSubItem) => {
        return (
          <DataGridCell>
            <TableCellLayout>{item.quantity}</TableCellLayout>
          </DataGridCell>
        );
      },
    }),
    // Toggle status
    createTableColumn<VisibleSubItem>({
      columnId: "status",
      renderCell: (subItem: VisibleSubItem) => {
        return (
          <DataGridCell>
            <TableCellLayout style={{ flexDirection: "row-reverse" }}>
              <Switch
                onChange={(_, data) => onToggle(subItem, data.checked)}
                checked={Boolean(subItem.userId)}
              />
            </TableCellLayout>
          </DataGridCell>
        );
      },
    }),
  ];

  return (
    <DataGrid
      items={items.filter((item) => !item.hidden)}
      columns={columns}
      getRowId={(item) => item.id}
      columnSizingOptions={{
        file: { minWidth: 200 },
        status: { minWidth: 80 },
      }}
    >
      <DataGridBody<VisibleSubItem>>
        {({ item, rowId }) => (
          <DataGridRow<VisibleSubItem>
            key={rowId}
            onClick={() => {
              const isPrevChecked = Boolean(item.userId);
              onToggle(item, !isPrevChecked);
            }}
          >
            {({ renderCell }) => renderCell(item)}
          </DataGridRow>
        )}
      </DataGridBody>
    </DataGrid>
  );
};
