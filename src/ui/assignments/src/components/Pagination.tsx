import React, { CSSProperties } from "react";
import {
  NextFrame20Filled,
  PreviousFrame20Filled,
} from "@fluentui/react-icons/lib/fonts";
import ReactPaginate from "react-paginate";

const iconStyle: CSSProperties = {
  verticalAlign: "text-bottom",
};

export interface PaginationProps {
  pageCount: number;
  onPageClick: (pageIndex: number) => void;
}

export const Pagination: React.FunctionComponent<PaginationProps> = ({
  pageCount,
  onPageClick,
}) => (
  <ReactPaginate
    nextLabel={<PreviousFrame20Filled style={iconStyle} />}
    previousLabel={<NextFrame20Filled style={iconStyle} />}
    pageCount={pageCount}
    renderOnZeroPageCount={null}
    onPageChange={(data) => onPageClick(data.selected)}
    containerClassName="pagination-container"
    pageClassName="pagination-list-item"
    previousClassName="pagination-list-item"
    nextClassName="pagination-list-item"
    breakClassName="pagination-list-item"
    pageLinkClassName="pagination-button"
    previousLinkClassName="pagination-button"
    nextLinkClassName="pagination-button"
    breakLinkClassName="pagination-button"
    activeClassName="pagination-active"
    disabledClassName="pagination-disabled"
  />
);
