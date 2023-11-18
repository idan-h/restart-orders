import React, { useEffect, useState } from "react";
import {
  Field,
  Option,
  Combobox,
  ComboboxProps,
  TagGroup,
  Tag,
  TagGroupProps,
} from "@fluentui/react-components";

import { useOrdersService } from "../../services/Orders.srv";
import { Dismiss12Regular } from "@fluentui/react-icons";

export interface ProductFilterProps {
  onChange: (productsNames: string[]) => void;
  style?: React.CSSProperties;
}

export const ProductFilter: React.FunctionComponent<ProductFilterProps> = ({
  onChange,
  style = {},
}) => {
  const ordersService = useOrdersService();
  const [allProducts, setAllProducts] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  useEffect(() => {
    if (!ordersService) {
      console.error("ProductFilter::Init: ordersService not ready");
      return;
    }

    ordersService
      .fetchProductDetails()
      .then((productDetails) =>
        setAllProducts(
          Array.from(productDetails.values()).map((product) => product.name)
        )
      );
  }, [ordersService]);

  const _setSelectedProducts = (productsNames: string[]) => {
    setSelectedProducts(productsNames); // update state
    onChange(productsNames); // notify parent
  };

  const handleDropdownSelect: ComboboxProps["onOptionSelect"] = (_e, data) => {
    console.debug("ProductFilter::handleDropdownSelect", data);

    _setSelectedProducts(data.selectedOptions);
  };

  const handleTagDismiss: TagGroupProps["onDismiss"] = (_e, { value }) => {
    console.debug("ProductFilter::handleTagDismiss", value);

    const newSelectedProducts = selectedProducts.filter(
      (product) => product !== value
    );

    _setSelectedProducts(newSelectedProducts);
  };

  return (
    <div style={style}>
      <Field label="סינון לפי שם פריט">
        <Combobox
          placeholder="בחר פריטים"
          multiselect
          selectedOptions={selectedProducts}
          onOptionSelect={handleDropdownSelect}
          autoComplete="off"
          listbox={{ style: { maxHeight: "240px" } }}
        >
          {allProducts.map((product, index) => (
            <Option key={index} value={product}>
              {product}
            </Option>
          ))}
        </Combobox>
      </Field>
      {selectedProducts.length !== 0 && (
        <TagGroup
          onDismiss={handleTagDismiss}
          style={{ flexWrap: "wrap", gap: "4px", marginTop: "6px" }}
        >
          {selectedProducts.map((product, index) => (
            <Tag
              key={index}
              value={product}
              shape="circular"
              size="small"
              appearance="brand"
              dismissible
              dismissIcon={<Dismiss12Regular />}
            >
              {product}
            </Tag>
          ))}
        </TagGroup>
      )}
    </div>
  );
};
