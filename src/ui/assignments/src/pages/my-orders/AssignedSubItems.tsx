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
    // Info
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
    // Quantity
    createTableColumn<SubItem>({
      columnId: "quantity",
      renderCell: (item) => {
        return <TableCellLayout>{item.quantity}</TableCellLayout>;
      },
    }),
    // Status
    createTableColumn<SubItem>({
      columnId: "status",
      renderCell: (item) => {
        return (
          <TableCellLayout>
            <Dropdown
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
        );
      },
    }),
    // Delete button
    createTableColumn<SubItem>({
      columnId: "unassign",
      renderCell: (item) => {
        if (item.status === DONE_STATUS) {
          return null;
        }

        return (
          <TableCellLayout>
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
