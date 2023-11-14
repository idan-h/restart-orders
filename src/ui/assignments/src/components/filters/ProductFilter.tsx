import React, { useEffect, useState } from "react";
import { Field, Dropdown, Option } from "@fluentui/react-components";

import { useOrdersService } from "../../services/Orders.srv";

interface ProductOption {
  value: string;
  label: string;
}

export interface ProductFilterProps {
  onChange: (value: number[]) => void;
  style?: React.CSSProperties;
}

export const ProductFilter: React.FunctionComponent<ProductFilterProps> = ({
  onChange,
  style = {},
}) => {
  const ordersService = useOrdersService();

  const [products, setProducts] = useState<ProductOption[]>([]);
  useEffect(() => {
    if (!ordersService) {
      console.error("ProductFilter::Init: ordersService not ready");
      return;
    }

    ordersService.fetchProductDetails().then((productDetails) =>
      setProducts(
        Array.from(productDetails.values()).map((product) => ({
          value: product.product_number.toString(), // Need to stringify, then convert back to number to support Dropdown type
          label: product.name,
        }))
      )
    );
  }, [ordersService]);

  return (
    <Field label="סינון לפי שם פריט" style={style}>
      <Dropdown
        multiselect
        placeholder="הכל"
        onOptionSelect={(_event, data) =>
          onChange(data.selectedOptions.map((option) => Number(option)))
        }
      >
        {products.map((option, index) => (
          <Option key={index} value={option.value}>
            {option.label}
          </Option>
        ))}
      </Dropdown>
    </Field>
  );
};
