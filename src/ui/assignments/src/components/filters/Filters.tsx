import React from "react";

import { SearchBoxDebounce } from "./SearchBoxDebounce";
import { TypeFilter } from "./TypeFilter";
import { ProductFilter } from "./ProductFilter";
import { DoneCheckbox } from "./DoneCheckbox";

export interface SubHeaderProps {
  onTextFilter?: (text: string) => void;
  onTypeFilter?: (type?: string) => void;
  onProductFilter?: (productNumbers: number[]) => void;
  onDoneFilter?: (checked: boolean) => void;
}

export const Filters: React.FunctionComponent<SubHeaderProps> = ({
  onTextFilter,
  onTypeFilter,
  onProductFilter,
  onDoneFilter,
}) => {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        alignItems: "flex-start",
      }}
    >
      {onTextFilter && (
        <SearchBoxDebounce onChange={onTextFilter} style={{ flex: 1 }} />
      )}
      {onTypeFilter && (
        <TypeFilter onChange={onTypeFilter} style={{ flex: 1 }} />
      )}
      {onProductFilter && (
        <ProductFilter onChange={onProductFilter} style={{ flex: 1 }} />
      )}
      {onDoneFilter && (
        <DoneCheckbox
          onChange={onDoneFilter}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column-reverse",
            whiteSpace: "nowrap",
          }}
        />
      )}
    </div>
  );
};
