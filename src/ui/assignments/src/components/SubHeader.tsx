import React from "react";
import { Title3, Subtitle2 } from "@fluentui/react-components";

const subHeaderStyle: React.CSSProperties = {
  display: "block",
  textAlign: "center",
  margin: "20px auto",
};

export const SubHeader: React.FunctionComponent<{
  children: React.ReactNode;
}> = ({ children }) => <Title3 style={subHeaderStyle}>{children}</Title3>;

export const SubHeader2: React.FunctionComponent<{
  children: React.ReactNode;
}> = ({ children }) => <Subtitle2 style={subHeaderStyle}>{children}</Subtitle2>;
