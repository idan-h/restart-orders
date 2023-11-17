import React, { CSSProperties } from "react";
import {
  TextCollapse24Filled,
  TextExpand24Regular,
} from "@fluentui/react-icons";

import { FilteredOrder } from "../services/Filters.service";

const commentsButtonStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  margin: "10px",
};

const commentsStyle: CSSProperties = {
  width: "unset",
  padding: "0 10px",
};

export interface WithNote {
  noteOpen?: boolean;
}

export interface OrderCommentsProps {
  order: FilteredOrder & WithNote;
  onToggleNote: (orderId: number) => void;
}

export const OrderComments: React.FunctionComponent<OrderCommentsProps> = ({
  order,
  onToggleNote,
}) => {
  const { id, comments, noteOpen } = order;

  return (
    <>
      {comments && (
        <a style={commentsButtonStyle} onClick={() => onToggleNote(id)}>
          הערות
          {noteOpen ? <TextCollapse24Filled /> : <TextExpand24Regular />}
        </a>
      )}
      {noteOpen && <p style={commentsStyle}>{comments}</p>}
    </>
  );
};
