import React from "react";

export interface ItemsCountProps {
  itemName: string;
  itemsCount: number;
  filteredItemsCount: number;
  pageNumber: number;
  pageCount: number;
}

export const ItemsCount: React.FunctionComponent<ItemsCountProps> = ({
  itemName,
  itemsCount,
  filteredItemsCount,
  pageNumber,
  pageCount,
}) => (
  <span>{`נמצאו ${
    itemsCount !== filteredItemsCount ? `${filteredItemsCount} מתוך` : ""
  } ${itemsCount} ${itemName}.${
    pageCount > 1 ? ` עמוד ${pageNumber} מתוך ${pageCount}.` : ""
  }`}</span>
);
