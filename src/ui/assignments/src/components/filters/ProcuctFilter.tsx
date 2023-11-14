import React from "react";
import { Field, Dropdown, Option } from "@fluentui/react-components";
import { productDetails } from "../../services/Orders.service";

export interface ProductFilterProps {
  onChange: (value?: string[]) => void;
  style?: React.CSSProperties;
}

export const ProductFilter: React.FunctionComponent<ProductFilterProps> = ({
  onChange,
  style = {},
}) => {
  return (
    <Field label="סינון לפי שם פריט" style={style}>
      <Dropdown
        multiselect
        onOptionSelect={(_event, data) => onChange(data.selectedOptions)}
      >
        {Array.from(productDetails.values()).map((option, index) => (
          <Option key={index} value={option.name}>
            {option.name}
          </Option>
        ))}
      </Dropdown>
    </Field>
  );
};
