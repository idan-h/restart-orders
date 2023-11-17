import React, { useState } from "react";
import { Dropdown, Option } from "@fluentui/react-components";

import { DONE_STATUS, FilteredSubItem } from "../services/Filters.service";

export interface StatusDropdownProps {
  item: FilteredSubItem;
  statusesList: string[];
  onStatusChange: (
    subItem: FilteredSubItem,
    status: string,
    onCancel: () => void
  ) => void;
}

export const StatusDropdown: React.FunctionComponent<StatusDropdownProps> = ({
  item,
  onStatusChange,
  statusesList,
}) => {
  const [itemStatus, setItemStatus] = useState(item.status);

  const handleOptionChange = (
    _event: unknown,
    data: { optionValue?: string }
  ) => {
    if (data.optionValue) {
      console.debug("StatusDropdown::handleOptionChange");
      const prevState: string = itemStatus;

      setItemStatus(data.optionValue);

      onStatusChange(item, data.optionValue, () => {
        console.debug("StatusDropdown::onCancel");
        setItemStatus(prevState); // cancel/ undo
      });
    }
  };

  return (
    <Dropdown
      style={{ minWidth: "unset", width: "110px" }}
      value={itemStatus}
      disabled={item.status === DONE_STATUS}
      onOptionSelect={handleOptionChange}
    >
      {statusesList.map((status, index) => (
        <Option key={index}>{status}</Option>
      ))}
    </Dropdown>
  );
};
