import React, { useRef, useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardPreview,
  Subtitle1,
} from "@fluentui/react-components";

import {
  Filter,
  FilteredOrder,
  filterOrdersByDone,
  filterOrdersByProduct,
  filterOrdersByText,
  filterOrdersByType,
  isVisible,
} from "../services/Filters.service";
import { AppHeader } from "./AppHeader";
import { SubHeader, SubHeader2 } from "./SubHeader";
import { OrderComments, WithNote } from "./OrderComments";
import { Loading } from "./Loading";
import { Filters } from "./filters/Filters";
import { ItemsCount } from "./ItemsCount";
import { Pagination } from "./Pagination";

const PAGE_SIZE = 25;

export interface BasePageProps {
  /** Initial orders list - from server */
  defaultOrders: FilteredOrder[] | null;
  /** Page title */
  title: string;
  /** Loading spinner */
  loading?: string;
  /** Page filters */
  filters: Partial<Filter>;
  /** Order item render */
  itemRender: {
    /** Order item header */
    header: (item: FilteredOrder) => string | JSX.Element;
    /** Order item content */
    content: (item: FilteredOrder) => JSX.Element;
  };
  /** Page content style */
  style?: React.CSSProperties;
}

export const BasePage: React.FunctionComponent<BasePageProps> = ({
  defaultOrders,
  title,
  loading,
  filters,
  itemRender,
  style = {},
}) => {
  const [orders, setOrders] = useState<(FilteredOrder & WithNote)[] | null>(
    defaultOrders
  );

  useEffect(() => {
    if (defaultOrders !== null && defaultOrders !== orders) {
      setOrders(defaultOrders);
    }
  }, [defaultOrders]);

  const [itemOffset, setItemOffset] = useState(0); // paging offset, display items from this index

  const pageRef = useRef<HTMLDivElement>(null); // for scrolling

  const _applyFilter = (filteredOrders: FilteredOrder[] | null) => {
    if (filteredOrders !== null) {
      setOrders(filteredOrders);
      setItemOffset(0); // reset paging
    }
  };

  const handleTilterByText = (searchText: string) => {
    _applyFilter(filterOrdersByText(orders, searchText));
  };

  const handleFilterByType = (optionValue?: string) => {
    _applyFilter(filterOrdersByType(orders, optionValue));
  };

  const handleFilterByProduct = (productsNames: string[]) => {
    _applyFilter(filterOrdersByProduct(orders, productsNames));
  };

  const handleFilterByDone = (checked: boolean) => {
    _applyFilter(filterOrdersByDone(orders, checked));
  };

  const toggleOpenNote = (orderId: number) => {
    if (!orders) {
      console.error("BasePage::toggleOpenNote: orders empty");
      return;
    }

    const orderIndex = orders.findIndex((order) => order.id === orderId);
    if (orderIndex === -1) {
      console.error("BasePage::toggleOpenNote: order not found");
      return;
    }

    orders[orderIndex].noteOpen = !orders[orderIndex].noteOpen;

    orders.splice(orderIndex, 1, orders[orderIndex]);
    setOrders([...orders]);
  };

  const handlePageClick = (pageIndex: number) => {
    console.debug("BasePage::handlePageClick", pageIndex);

    const newOffset = (pageIndex * PAGE_SIZE) % filteredOrders.length;
    setItemOffset(newOffset);

    // scroll to top
    pageRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** Orders match filter */
  const filteredOrders = orders?.filter(isVisible) ?? [];

  /** Orders to render on screen (based on paging) */
  const visibleOrders = filteredOrders.slice(
    itemOffset,
    itemOffset + PAGE_SIZE
  );

  const pageNumber = Math.floor(itemOffset / PAGE_SIZE) + 1;
  const pageCount = Math.ceil(filteredOrders.length / PAGE_SIZE);

  return (
    <>
      {/* HEADER */}
      <AppHeader />
      {/* CONTENT */}
      <div className="app-page" style={style} ref={pageRef}>
        {/* SUB-HEADER */}
        <SubHeader>{title}</SubHeader>
        {loading ? (
          // SPINNER: EXTERNAL LOADING...
          <Loading label={loading} />
        ) : !orders ? (
          // SPINNER: LOADING DATA...
          <Loading />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* FILTERS */}
            <Filters
              onTextFilter={filters.text ? handleTilterByText : undefined}
              onTypeFilter={filters.type ? handleFilterByType : undefined}
              onProductFilter={
                filters.product ? handleFilterByProduct : undefined
              }
              onDoneFilter={filters.done ? handleFilterByDone : undefined}
            />
            {orders.length === 0 ? (
              // EMPTY STATE: NO DATA
              <SubHeader2>{`אין ${title}`}</SubHeader2>
            ) : (
              <>
                {/* ITEMS COUNT */}
                <ItemsCount
                  itemName={title}
                  itemsCount={orders.length}
                  filteredItemsCount={filteredOrders.length}
                  pageNumber={pageNumber}
                  pageCount={pageCount}
                />
                {/* ITEMS LIST */}
                {visibleOrders.map((order, index) => (
                  <Card key={index}>
                    <CardHeader
                      header={
                        <Subtitle1>{order.unit ?? "(ללא כותרת)"}</Subtitle1>
                      }
                      description={itemRender.header(order)}
                    />
                    <CardPreview>
                      {/* ITEM RENDER */}
                      {itemRender.content(order)}
                      <OrderComments
                        order={order}
                        onToggleNote={toggleOpenNote}
                      />
                    </CardPreview>
                  </Card>
                ))}
                {/* PAGINATION */}
                {filteredOrders.length > PAGE_SIZE && (
                  <Pagination
                    pageCount={pageCount}
                    onPageClick={handlePageClick}
                  />
                )}
                {/* EMPTY STATE: NO FILTER RESULTS */}
                {filteredOrders.length === 0 && (
                  <SubHeader2>{`אין ${title} תואמת את הסינון`}</SubHeader2>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};
