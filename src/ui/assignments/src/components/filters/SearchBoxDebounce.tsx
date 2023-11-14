import React, { useState, useCallback } from "react";
import debounce from "lodash.debounce";

import { SearchRegular, DismissRegular } from "@fluentui/react-icons";
import {
  Button,
  ButtonProps,
  Field,
  Input,
  InputOnChangeData,
} from "@fluentui/react-components";

const DEBOUNCE_TIME = 400;

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
  style?: React.CSSProperties;
}

/** Search box with debounced change event */
export const SearchBoxDebounce: React.FunctionComponent<SearchBoxProps> = ({
  onChange: notifyChange,
  style = {},
}) => {
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
    <Field label="חיפוש" style={style}>
      <Input
        contentBefore={<SearchRegular />}
        contentAfter={
          searchValue ? (
            <ClearButton onClick={() => immediateChange("")} />
          ) : null
        }
        placeholder="חיפוש"
        value={searchValue}
        onChange={inputChange}
        autoComplete="off"
      />
    </Field>
  );
};
