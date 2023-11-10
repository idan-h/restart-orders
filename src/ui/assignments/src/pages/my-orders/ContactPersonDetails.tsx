import * as React from "react";
import {
  DataGridBody,
  DataGridRow,
  DataGrid,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridCell,
  TableCellLayout,
  TableColumnDefinition,
  createTableColumn,
} from "@fluentui/react-components";
import { ContactPersonDetails } from "../../types";

const columns: TableColumnDefinition<ContactPersonDetails>[] = [
  createTableColumn<ContactPersonDetails>({
    columnId: "name",
    renderHeaderCell: () => {
      return "שם";
    },
    renderCell: (item) => {
      return <TableCellLayout>{item.name}</TableCellLayout>;
    },
  }),
  createTableColumn<ContactPersonDetails>({
    columnId: "unit",
    renderHeaderCell: () => {
      return "יחידה";
    },
    renderCell: (item) => {
      return <TableCellLayout>{item.unit}</TableCellLayout>;
    },
  }),
  createTableColumn<ContactPersonDetails>({
    columnId: "region",

    renderHeaderCell: () => {
      return "אזור";
    },
    renderCell: (item) => {
      return <TableCellLayout>{item.region}</TableCellLayout>;
    },
  }),
  createTableColumn<ContactPersonDetails>({
    columnId: "phone",
    renderHeaderCell: () => {
      return "טלפון";
    },
    renderCell: (item) => {
      return <TableCellLayout>{item.phone}</TableCellLayout>;
    },
  }),
];

export const ContactPersonDetailsTable: React.FC<{
  items: ContactPersonDetails[];
}> = ({ items }) => {
  return (
    <DataGrid
      style={{ display: "block" }}
      items={items}
      columns={columns}
      sortable
      selectionMode="multiselect"
      getRowId={(item) => item.id}
      focusMode="composite"
    >
      <DataGridHeader>
        <DataGridRow selectionCell={{ style: { display: "none" } }}>
          {({ renderHeaderCell }) => (
            <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
          )}
        </DataGridRow>
      </DataGridHeader>
      <DataGridBody<ContactPersonDetails>>
        {({ item, rowId }) => (
          <DataGridRow<ContactPersonDetails>
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
