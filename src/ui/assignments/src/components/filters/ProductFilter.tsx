import React, { useEffect, useState } from "react";
import {
  Field,
  Option,
  Combobox,
  ComboboxProps,
  makeStyles,
  Button,
  useId,
  shorthands,
  tokens,
} from "@fluentui/react-components";

import { useOrdersService } from "../../services/Orders.srv";
import { Dismiss12Regular } from "@fluentui/react-icons";

interface ProductOption {
  value: string;
  label: string;
}

export interface ProductFilterProps {
  onChange: (value: number[]) => void;
  style?: React.CSSProperties;
}

const useStyles = makeStyles({
  root: {
    // Stack the label above the field with a gap
    display: "flex",
    flexDirection: "column",
    flexWrap: "wrap",
    ...shorthands.flex(1),
    justifyItems: "start",
    ...shorthands.gap("8px"),
  },
  tagsList: {
    listStyleType: "none",
    marginBottom: tokens.spacingVerticalXXS,
    marginTop: 0,
    paddingLeft: 0,
    display: "flex",
    gridGap: tokens.spacingHorizontalXXS,
    flexWrap: "wrap",
  },
  listbox: {
    maxHeight: "240px",
  },
});

export const ProductFilter: React.FunctionComponent<ProductFilterProps> = ({
  onChange,
  style = {},
}) => {
  // generate ids for handling labelling
  const comboId = useId("combo-multi");
  const selectedListId = `${comboId}-selection`;
  // refs for managing focus when removing tags
  const selectedListRef = React.useRef<HTMLUListElement>(null);
  const comboboxInputRef = React.useRef<HTMLInputElement>(null);

  const ordersService = useOrdersService();
  // Handle selectedOptions both when an option is selected or deselected in the Combobox,
  // and when an option is removed by clicking on a tag
  const [selectedOptions, setSelectedOptions] = React.useState<
    { text: string; value: string }[]
  >([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const onSelect: ComboboxProps["onOptionSelect"] = (_, data) => {
    onChange(data.selectedOptions.map((option) => Number(option)));
    if (data.optionText && data.optionValue) {
      setSelectedOptions((prev) => {
        if (selectedOptions.length === 0) {
          return [{ text: data.optionText!, value: data.optionValue! }];
        }

        if (!prev.find((option) => option.value === data.optionValue)) {
          return [
            ...prev,
            { text: data.optionText!, value: data.optionValue! },
          ];
        }
        return prev.filter((option) => option.value !== data.optionValue);
      });
    }
  };

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

  const onTagClick = (option: string, index: number) => {
    onChange(
      selectedOptions
        .filter((o) => o.text !== option)
        .map((option) => Number(option.value))
    );

    // remove selected option
    setSelectedOptions(selectedOptions.filter((o) => o.text !== option));

    // focus previous or next option, defaulting to focusing back to the combo input
    const indexToFocus = index === 0 ? 1 : index - 1;
    const optionToFocus = selectedListRef.current?.querySelector(
      `#${comboId}-remove-${indexToFocus}`
    );
    if (optionToFocus) {
      (optionToFocus as HTMLButtonElement).focus();
    } else {
      comboboxInputRef.current?.focus();
    }
  };

  const styles = useStyles();
  const selectedOptionsList = selectedOptions.map((option) => option.value);

  return (
    <div className={styles.root}>
      <Field label="סינון לפי שם פריט" style={style}>
        <Combobox
          ref={comboboxInputRef}
          autoComplete="off"
          multiselect
          listbox={{ className: styles.listbox }}
          selectedOptions={selectedOptionsList}
          onOptionSelect={onSelect}
        >
          {products.map((option, index) => (
            <Option key={index} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Combobox>
      </Field>
      {selectedOptions.length ? (
        <ul
          id={selectedListId}
          className={styles.tagsList}
          ref={selectedListRef}
        >
          {/* The "Remove" span is used for naming the buttons without affecting the Combobox name */}
          <span id={`${comboId}-remove`} hidden>
            Remove
          </span>
          {selectedOptions.map((option, i) => (
            <li key={option.value}>
              <Button
                size="small"
                shape="circular"
                appearance="primary"
                icon={<Dismiss12Regular />}
                iconPosition="after"
                onClick={() => onTagClick(option.text, i)}
                id={`${comboId}-remove-${i}`}
                aria-labelledby={`${comboId}-remove ${comboId}-remove-${i}`}
              >
                {option.text}
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};
