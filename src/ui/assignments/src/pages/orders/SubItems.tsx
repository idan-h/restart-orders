import {
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridRow,
  Switch,
  TableCellLayout,
  TableColumnSizingOptions,
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
          <DataGridCell style={{ flex: 4 }}>
            <TableCellLayout>{item.name}</TableCellLayout>
          </DataGridCell>
        );
      },
    }),
    // Quantity
    createTableColumn<SubItem>({
      columnId: "quantity",
      renderCell: (item: SubItem) => {
        return (
          <DataGridCell style={{ flex: 1 }}>
            <TableCellLayout>{item.quantity}</TableCellLayout>
          </DataGridCell>
        );
      },
    }),
    // Toggle status
    createTableColumn<SubItem>({
      columnId: "status",
      renderCell: (subItem: SubItem) => {
        return (
          <DataGridCell style={{ flex: 1 }}>
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

  const columnSizingOptions: TableColumnSizingOptions = {
    file: { minWidth: 200 },
    quantity: { minWidth: 50 },
    status: { minWidth: 80 },
  };
  return (
    <DataGrid
      items={items}
      columns={columns}
      getRowId={(item) => item.id}
      columnSizingOptions={columnSizingOptions}
    >
      <DataGridBody<SubItem>>
        {({ item, rowId }) => (
          <DataGridRow<SubItem>
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
