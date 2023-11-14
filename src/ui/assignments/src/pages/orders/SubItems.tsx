import React from "react";
import {
  Switch,
  TableCellLayout,
  TableColumnSizingOptions,
  createTableColumn,
  DataGridBody,
  DataGrid,
  DataGridRow,
  DataGridCell,
} from "@fluentui/react-components";

import { FilteredSubItem, isVisible } from "../../services/Filters.service.ts";

export interface SubItemsProps {
  items: FilteredSubItem[];
  onToggle: (subItem: FilteredSubItem, isChecked: boolean) => void;
}

export const SubItems: React.FunctionComponent<SubItemsProps> = ({
  items,
  onToggle,
}) => {
  const columns = [
    // Info
    createTableColumn<FilteredSubItem>({
      columnId: "file",
      renderCell: (item: FilteredSubItem) => {
        return <TableCellLayout>{item.product.name}</TableCellLayout>;
      },
    }),
    // Quantity
    createTableColumn<FilteredSubItem>({
      columnId: "quantity",
      renderCell: (item: FilteredSubItem) => {
        return <TableCellLayout>{item.quantity}</TableCellLayout>;
      },
    }),
    // Toggle status
    createTableColumn<FilteredSubItem>({
      columnId: "status",
      renderCell: (subItem: FilteredSubItem) => {
        return (
          <TableCellLayout style={{ flexDirection: "row-reverse" }}>
            <Switch
              onChange={(_, data) => onToggle(subItem, data.checked)}
              checked={Boolean(subItem.userId)}
            />
          </TableCellLayout>
        );
      },
    }),
  ];

  const columnSizing: TableColumnSizingOptions = {
    file: { minWidth: 200 },
    quantity: { defaultWidth: 80 },
    status: { defaultWidth: 100 },
  };

  return (
    <DataGrid
      items={items.filter(isVisible)}
      columns={columns}
      getRowId={(item) => item.id}
      columnSizingOptions={columnSizing}
    >
      <DataGridBody<FilteredSubItem>>
        {({ item, rowId }) => (
          <DataGridRow<FilteredSubItem>
            key={rowId}
            onClick={() => {
              const isPrevChecked = Boolean(item.userId);
              onToggle(item, !isPrevChecked);
            }}
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
