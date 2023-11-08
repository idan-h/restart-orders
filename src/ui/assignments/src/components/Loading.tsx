import React from "react";
import { Spinner } from "@fluentui/react-components";

export const Loading: React.FunctionComponent = () => (
  <div style={{ position: "relative", top: "30%" }}>
    <Spinner label="טוען..." labelPosition="below" />
  </div>
);
