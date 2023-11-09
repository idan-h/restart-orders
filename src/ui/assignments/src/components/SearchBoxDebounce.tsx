import React, { useState, useCallback } from "react";
import debounce from "lodash.debounce";

import { SearchRegular, DismissRegular } from "@fluentui/react-icons";
import {
  Button,
  ButtonProps,
  Input,
  InputOnChangeData,
  InputProps,
  mergeClasses,
} from "@fluentui/react-components";

import styles from "./SearchBoxDebounce.module.scss";

const DEBOUNCE_TIME = 500;

const debounceChange = debounce((onChange: ChangeFn, searchText = "") => {
  onChange(searchText);
}, DEBOUNCE_TIME);

const ClearButton: React.FunctionComponent<
  { icon?: React.JSX.Element } & ButtonProps
> = (props) => (
  <Button
    {...props}
    appearance="transparent"
    icon={props.icon ?? <DismissRegular />}
    size="small"
  />
);

export type ChangeFn = (searchText: string) => void;

export interface SearchBoxProps extends Omit<InputProps, "onChange"> {
  /** Default value */
  searchText?: string;
  /** Debounced event callback  */
  onChange: ChangeFn;
  /** Clear icon */
  clearIcon?: React.JSX.Element;
  /** indicates if the contentBefore should be hidden  */
  hideContentBefore?: boolean;
  /** indicates if the search is disabled  */
  disabled?: boolean;
}

/** Search box with debounced change event */
export const SearchBoxDebounce: React.FunctionComponent<SearchBoxProps> = (
  props: SearchBoxProps
) => {
  const {
    searchText: defaultValue,
    onChange: notifyChange,
    className,
    hideContentBefore,
  } = props;

  const [searchValue, setSearchValue] = useState<string>(defaultValue ?? "");

  const immediateChange = useCallback<(searchText: string) => void>(
    (searchText) => {
      debounceChange.cancel();
      setSearchValue(searchText);
      notifyChange(searchText);
    },
    [notifyChange]
  );

  const inputChange = useCallback<
    (
      event: React.ChangeEvent<HTMLInputElement>,
      data: InputOnChangeData
    ) => void
  >(
    (_event, data) => {
      const searchText = data.value;
      setSearchValue(searchText); // update the ui right away
      debounceChange(notifyChange, searchText); // debounce the change
    },
    [notifyChange]
  );

  return (
    <Input
      {...props}
      className={mergeClasses(styles.defaultStyle, className)}
      contentBefore={
        hideContentBefore ? undefined : props.contentBefore ?? <SearchRegular />
      }
      contentAfter={
        searchValue ? (
          <ClearButton
            icon={props.clearIcon}
            onClick={() => immediateChange("")}
          />
        ) : null
      }
      value={searchValue}
      onChange={inputChange}
      autoComplete="off"
    />
  );
};
