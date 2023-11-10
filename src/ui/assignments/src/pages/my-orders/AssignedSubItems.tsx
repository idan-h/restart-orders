import {
  DataGridBody,
  DataGrid,
  DataGridRow,
  DataGridCell,
  createTableColumn,
  TableCellLayout,
  Button,
  Dropdown,
  Option,
  TableColumnSizingOptions,
  DataGridHeader,
  DataGridHeaderCell,
} from "@fluentui/react-components";
import { Delete24Regular } from "@fluentui/react-icons";

import { DONE_STATUS, SubItem } from "../../types.ts";

export interface AssignedSubItemsProps {
  items: SubItem[];
  statusesList: string[];
  onStatusChange: (subItem: SubItem, status: string) => void;
  onDelete: (subItem: SubItem) => void;
}

export const AssignedSubItems: React.FunctionComponent<
  AssignedSubItemsProps
> = ({ items, statusesList, onStatusChange, onDelete }) => {
  const columns = [
    createTableColumn<SubItem>({
      columnId: "itemDescription",
      renderHeaderCell: () => {
        return "פריט";
      },
      renderCell: (item: SubItem) => {
        return (
          <DataGridCell>
            <TableCellLayout>{item.product.name}</TableCellLayout>
          </DataGridCell>
        );
      },
    }),
    createTableColumn<SubItem>({
      columnId: "quantity",
      renderHeaderCell: () => {
        return "כמות";
      },
      renderCell: (item) => {
        return (
          <DataGridCell>
            <TableCellLayout>{item.quantity}</TableCellLayout>
          </DataGridCell>
        );
      },
    }),
    createTableColumn<SubItem>({
      columnId: "status",
      renderHeaderCell: () => {
        return "סטטוס";
      },
      renderCell: (item) => {
        return (
          <DataGridCell>
            <TableCellLayout>
              <Dropdown
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
              </Dropdown>
            </TableCellLayout>
          </DataGridCell>
        );
      },
    }),
    createTableColumn<SubItem>({
      columnId: "delete",
      renderHeaderCell: () => {
        return "";
      },
      renderCell: (item) => {
        if (item.status === DONE_STATUS) {
          return <DataGridCell />;
        }

        return (
          <DataGridCell>
            <TableCellLayout style={{ flexDirection: "row-reverse" }}>
              <Button
                appearance="transparent"
                onClick={() => onDelete(item)}
                icon={<Delete24Regular />}
              />
            </TableCellLayout>
          </DataGridCell>
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
      items={items}
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
      <DataGridBody<SubItem>>
        {({ item, rowId }) => (
          <DataGridRow<SubItem> key={rowId}>
            {({ renderCell }) => renderCell(item)}
          </DataGridRow>
        )}
      </DataGridBody>
    </DataGrid>
  );
};
