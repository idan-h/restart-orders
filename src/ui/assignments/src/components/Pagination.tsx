import React from "react";
import ReactPaginate from "react-paginate";

export interface PaginationProps {
  pageCount: number;
  onPageClick: (pageIndex: number) => void;
}

export const Pagination: React.FunctionComponent<PaginationProps> = ({
  pageCount,
  onPageClick,
}) => (
  <ReactPaginate
    nextLabel="הבא >"
    previousLabel="< הקודם"
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
  />
);
