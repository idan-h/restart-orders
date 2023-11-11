import React from "react";
import { Spinner, SpinnerProps } from "@fluentui/react-components";

export interface LoadingProps {
  label?: string;
  size?: SpinnerProps["size"];
  style?: React.CSSProperties;
}

export const Loading: React.FunctionComponent<LoadingProps> = ({
  label = "טוען...",
  size,
  style = {},
}) => (
  <div style={{ position: "relative", top: "30%", ...style }}>
    <Spinner label={label} size={size} labelPosition="below" />
  </div>
);
