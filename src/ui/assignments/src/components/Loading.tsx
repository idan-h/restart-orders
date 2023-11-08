import { Spinner } from "@fluentui/react-components";
import React from "react";

export const Loading: React.FunctionComponent = () => (
  <div style={{ position: "relative", top: "30%" }}>
    <Spinner label="טוען..." labelPosition="below" />
  </div>
);
