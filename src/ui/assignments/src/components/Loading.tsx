import React from "react";
import { Spinner } from "@fluentui/react-components";

export const Loading: React.FunctionComponent< { label?: string }> = ({ label = 'טוען...'  }) => (
  <div style={{ position: "relative", top: "30%" }}>
    <Spinner label={label} labelPosition="below" />
  </div>
);
