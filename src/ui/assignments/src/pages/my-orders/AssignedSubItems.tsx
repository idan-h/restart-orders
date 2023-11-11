import {
  DataGridBody,
  DataGrid,
  DataGridRow,
  DataGridCell,
  createTableColumn,
  TableCellLayout,
  Button,
  Option,
  TableColumnSizingOptions,
  DataGridHeader,
  DataGridHeaderCell,
  Combobox,
} from "@fluentui/react-components";
import { Delete24Regular } from "@fluentui/react-icons";

import { DONE_STATUS, FilteredSubItem } from "../../types.ts";
import { isVisible } from "../../services/Filters.service.ts";

export interface AssignedSubItemsProps {
  items: FilteredSubItem[];
  statusesList: string[];
  onStatusChange: (subItem: FilteredSubItem, status: string) => void;
  onDelete: (subItem: FilteredSubItem) => void;
}

export const AssignedSubItems: React.FunctionComponent<
  AssignedSubItemsProps
> = ({ items, statusesList, onStatusChange, onDelete }) => {
  const columns = [
    createTableColumn<FilteredSubItem>({
      columnId: "itemDescription",
      renderHeaderCell: () => {
        return "פריט";
      },
      renderCell: (item: FilteredSubItem) => {
        return <TableCellLayout>{item.product.name}</TableCellLayout>;
      },
    }),
    createTableColumn<FilteredSubItem>({
      columnId: "quantity",
      renderHeaderCell: () => {
        return "כמות";
      },
      renderCell: (item) => {
        return <TableCellLayout>{item.quantity}</TableCellLayout>;
      },
    }),
    createTableColumn<FilteredSubItem>({
      columnId: "status",
      renderHeaderCell: () => {
        return "סטטוס";
      },
      renderCell: (item) => {
        return (
          <TableCellLayout>
            <Combobox
              style={{ minWidth: "unset", width: "110px" }}
              defaultValue={item.status}
              disabled={item.status === DONE_STATUS}
              onOptionSelect={(_event, data) => {
                if (data.optionValue) {
                  onStatusChange(item, data.optionValue);
                }
              }}
            >
              {statusesList.map((status, index) => (
                <Option key={index}>{status}</Option>
              ))}
            </Combobox>
          </TableCellLayout>
        );
      },
    }),
    createTableColumn<FilteredSubItem>({
      columnId: "delete",
      renderHeaderCell: () => {
        return "";
      },
      renderCell: (item) => {
        if (item.status === DONE_STATUS) {
          return;
        }

        return (
          <TableCellLayout style={{ flexDirection: "row-reverse" }}>
            <Button
              appearance="transparent"
              onClick={() => onDelete(item)}
              icon={<Delete24Regular />}
            />
          </TableCellLayout>
        );
      },
    }),
  ];

  const columnSizing: TableColumnSizingOptions = {
    itemDescription: {
      minWidth: 50,
      defaultWidth: 50,
    },
    quantity: {},
    status: {},
    delete: {
      minWidth: 50,
    },
  };
  return (
    <DataGrid
      items={items.filter(isVisible)}
      columns={columns}
      getRowId={(item) => item.id}
      columnSizingOptions={columnSizing}
    >
      <DataGridHeader>
        <DataGridRow selectionCell={{ style: { display: "none" } }}>
          {({ renderHeaderCell }) => (
            <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
          )}
        </DataGridRow>
      </DataGridHeader>
      <DataGridBody<FilteredSubItem>>
        {({ item, rowId }) => (
          <DataGridRow<FilteredSubItem> key={rowId}>
            {({ renderCell }) => (
              <DataGridCell>{renderCell(item)}</DataGridCell>
            )}
          </DataGridRow>
        )}
      </DataGridBody>
    </DataGrid>
  );
};
