import React from "react";
import {
  Switch,
  TableCellLayout,
  TableColumnSizingOptions,
  createTableColumn,
} from "@fluentui/react-components";

import {
  DataGridBody,
  DataGrid,
  DataGridRow,
  DataGridCell,
  RowRenderer,
} from "@fluentui-contrib/react-data-grid-react-window";

import { FilteredSubItem } from "../../types.ts";
import { isVisible } from "../../services/Filters.service.ts";

export interface SubItemsProps {
  items: FilteredSubItem[];
  onToggle: (subItem: FilteredSubItem, isChecked: boolean) => void;
}

const renderRow: RowRenderer<FilteredSubItem> = ({ item, rowId }, style) => (
  <DataGridRow<FilteredSubItem> key={rowId} style={style}>
    {({ renderCell }) => <DataGridCell>{renderCell(item)}</DataGridCell>}
  </DataGridRow>
);

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
      {/* <DataGridBody<FilteredSubItem>>
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
      </DataGridBody> */}
      <DataGridBody<FilteredSubItem> itemSize={50} height={200}>
        {renderRow}
      </DataGridBody>
    </DataGrid>
  );
};
