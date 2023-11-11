import React from "react";
import { Field } from "@fluentui/react-components";
import { SearchBoxDebounce } from "./SearchBoxDebounce";
import { TypeFilter } from "./TypeFilter";

export interface SubHeaderProps {
  onTextFilter: (text?: string) => void;
  onTypeFilter: (type?: string) => void;
}

export const Filters: React.FunctionComponent<SubHeaderProps> = ({
  onTextFilter,
  onTypeFilter,
}) => {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <Field label="חיפוש" style={{ flex: 1 }}>
        <SearchBoxDebounce onChange={onTextFilter} />
      </Field>
      <Field label="סינון לפי סוג" style={{ flex: 1 }}>
        <TypeFilter onChange={onTypeFilter} />
      </Field>
    </div>
  );
};
