import React from "react";
import { Combobox, Option } from "@fluentui/react-components";

const OPTIONS_LIST = [
  { value: "All", label: "הכל" },
  { value: "IDF", label: "צהל" },
  { value: "EMR", label: "כיתת כוננות" },
  { value: "SEW", label: "תיקוני מתפרה" },
  { value: "SEWMAN", label: "ייצור מתפרה" },
];

export interface TypeFilterProps {
  onChange: (value?: string) => void;
}

export const TypeFilter: React.FunctionComponent<TypeFilterProps> = ({
  onChange,
}) => {
  return (
    <Combobox
      defaultValue="All"
      onOptionSelect={(_event, data) => onChange(data.optionValue)}
    >
      {OPTIONS_LIST.map((option, index) => (
        <Option key={index} value={option.value}>
          {option.label}
        </Option>
      ))}
    </Combobox>
  );
};
