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
      columnId: "file",
      renderCell: (item) => {
        return (
          <DataGridCell style={{ flex: 4 }}>
            <TableCellLayout>{item.productName}</TableCellLayout>
          </DataGridCell>
        );
      },
    }),
    createTableColumn<SubItem>({
      columnId: "quantity",
      renderCell: (item) => {
        return (
          <DataGridCell style={{ flex: 1 }}>
            <TableCellLayout>{item.quantity}</TableCellLayout>
          </DataGridCell>
        );
      },
    }),
    createTableColumn<SubItem>({
      columnId: "status",
      renderCell: (item) => {
        return (
          <DataGridCell style={{ flex: 4 }}>
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
      renderCell: (item) => {
        if (item.status === DONE_STATUS) {
          return <DataGridCell />;
        }

        return (
          <DataGridCell style={{ flex: 1 }}>
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
    file: {
      minWidth: 150,
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
