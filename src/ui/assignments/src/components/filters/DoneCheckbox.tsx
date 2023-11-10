import React from "react";
import { Checkbox, Field } from "@fluentui/react-components";

export interface DoneCheckboxProps {
  onChange: (checked: boolean) => void;
  style?: React.CSSProperties;
}

export const DoneCheckbox: React.FunctionComponent<DoneCheckboxProps> = ({
  onChange,
  style = {},
}) => {
  return (
    <Field style={style}>
      <Checkbox
        label="הצג פריטים שבוצעו"
        defaultChecked
        size="large"
        onChange={(_event, data) => onChange(data.checked as boolean)}
      />
    </Field>
  );
};
