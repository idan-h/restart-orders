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
    containerClassName="pagination"
    pageClassName="page-item"
    previousClassName="page-item"
    nextClassName="page-item"
    breakClassName="page-item"
    pageLinkClassName="page-link"
    previousLinkClassName="page-link"
    nextLinkClassName="page-link"
    breakLinkClassName="page-link"
    activeClassName="page-active"
  />
);
