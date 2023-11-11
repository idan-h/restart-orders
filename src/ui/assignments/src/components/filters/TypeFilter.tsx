import React from "react";
import { Field, Dropdown, Option } from "@fluentui/react-components";

const OPTIONS_LIST = [
  { value: "All", label: "הכל" },
  { value: "IDF", label: "צהל" },
  { value: "EMR", label: "כיתת כוננות" },
  { value: "SEW", label: "תיקוני מתפרה" },
  { value: "SEWMAN", label: "ייצור מתפרה" },
];

export interface TypeFilterProps {
  onChange: (value?: string) => void;
  style?: React.CSSProperties;
}

export const TypeFilter: React.FunctionComponent<TypeFilterProps> = ({
  onChange,
  style = {},
}) => {
  return (
    <Field label="סינון לפי סוג" style={style}>
      <Dropdown
        defaultValue={OPTIONS_LIST[0].label}
        onOptionSelect={(_event, data) => onChange(data.optionValue)}
      >
        {OPTIONS_LIST.map((option, index) => (
          <Option key={index} value={option.value}>
            {option.label}
          </Option>
        ))}
      </Dropdown>
    </Field>
  );
};
