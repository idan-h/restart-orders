import React from "react";
import { Combobox, Option } from "@fluentui/react-components";

const OPTIONS_LIST = [
  { key: "All", value: "הכל" },
  { key: "IDF", value: "צהל" },
  { key: "EMR", value: "כיתת כוננות" },
  { key: "SEW", value: "תיקוני מתפרה" },
  { key: "SEWMAN", value: "ייצור מתפרה" },
];

export interface TypeFilterProps {
  onChange: (value?: string) => void;
}

export const TypeFilter: React.FunctionComponent<TypeFilterProps> = ({
  onChange,
}) => {
  return (
    <Combobox onOptionSelect={(_event, data) => onChange(data.optionValue)}>
      {OPTIONS_LIST.map((option) => (
        <Option key={option.key} value={option.key}>
          {option.value}
        </Option>
      ))}
    </Combobox>
  );
};
