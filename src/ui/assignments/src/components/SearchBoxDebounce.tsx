import React, { useState, useCallback } from "react";
import debounce from "lodash.debounce";

import { SearchRegular, DismissRegular } from "@fluentui/react-icons";
import {
  Button,
  ButtonProps,
  Input,
  InputOnChangeData,
} from "@fluentui/react-components";

const defaultStyle: React.CSSProperties = {
  margin: "6px 0",
};

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

export interface SearchBoxProps {
  /** Debounced event callback  */
  onChange: ChangeFn;
}

/** Search box with debounced change event */
export const SearchBoxDebounce: React.FunctionComponent<SearchBoxProps> = ({
  onChange: notifyChange,
}) => {
  // const { searchText: defaultValue, onChange: notifyChange, className } = props;

  const [searchValue, setSearchValue] = useState<string>("");

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
      style={defaultStyle}
      contentBefore={<SearchRegular />}
      contentAfter={
        searchValue ? <ClearButton onClick={() => immediateChange("")} /> : null
      }
      value={searchValue}
      onChange={inputChange}
      autoComplete="off"
    />
  );
};
