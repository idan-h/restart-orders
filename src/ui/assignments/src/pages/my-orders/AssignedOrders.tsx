import { useEffect, useState, useMemo, useRef } from "react";
import {
  Card,
  CardHeader,
  CardPreview,
  Body1Stronger,
  Divider,
  Subtitle1,
} from "@fluentui/react-components";
import {
  TextExpand24Regular,
  TextCollapse24Filled,
} from "@fluentui/react-icons";

import { useAuthenticationService } from "../../services/Authentication.ts";
import { OrdersService } from "../../services/Orders.service.ts";
import {
  DONE_STATUS,
  FilteredOrder,
  FilteredSubItem,
  isVisible,
  showOrder,
  filterOrdersByDone,
  filterOrdersByText,
  filterOrdersByType,
} from "../../services/Filters.service.ts";
import { Loading } from "../../components/Loading.tsx";
import { AppHeader } from "../../components/AppHeader.tsx";
import { SubHeader, SubHeader2 } from "../../components/SubHeader.tsx";
import {
  ConfirmDialog,
  ConfirmDialogProps,
} from "../../components/ConfirmDialog.tsx";
import { Pagination } from "../../components/Pagination.tsx";
import { Filters } from "../../components/filters/Filters.tsx";
import { AssignedSubItems } from "./AssignedSubItems.tsx";

const PAGE_SIZE = 10;

export const AssignedOrders = () => {
  const [myOrders, setMyOrders] = useState<FilteredOrder[] | null>(null); // all assigned orders
  const [statusesList, setStatusesList] = useState<string[] | undefined>(); // static list of status from the server
  const [openNoteIds, setOpenNoteIds] = useState<number[]>([]); // open notes ids (used to toggle open notes)
  const [itemOffset, setItemOffset] = useState(0); // paging offset, display items from this index

  const [confirmOpen, setConfirmOpen] = useState<boolean | undefined>(false);
  const [confirmProps, setConfirmProps] = useState<
    Omit<ConfirmDialogProps, "openState"> | undefined
  >();

  const pageRef = useRef<HTMLDivElement>(null);

  const { getUserId } = useAuthenticationService();
  const userId = getUserId();

  const ordersService = useMemo(() => {
    if (!userId) {
      console.error("MyOrders::Init: Not logged in");
      return undefined;
    }

    return new OrdersService(userId);
  }, [userId]);

  useEffect(() => {
    if (!ordersService) {
      console.error("MyOrders::Init: ordersService not ready");
      return;
    }

    if (!myOrders) {
      ordersService
        .fetchAssignedOrders()
        .then((items) =>
          setMyOrders(items.orders.map((order) => showOrder(order)))
        );
    }

    if (!statusesList) {
      ordersService
        .fetchOrderStatusNames()
        .then((_statusesList) => setStatusesList(_statusesList));
    }
  }, []);

  const handleTilterByText = (searchText: string) => {
    const filteredOrders = filterOrdersByText(myOrders, searchText);
    if (filteredOrders != null) {
      setMyOrders(filteredOrders);
      setItemOffset(0); // reset paging
    }
  };

  const handleFilterByType = (optionValue?: string) => {
    const filteredOrders = filterOrdersByType(myOrders, optionValue);
    if (filteredOrders != null) {
      setMyOrders(filteredOrders);
      setItemOffset(0); // reset paging
    }
  };

  const handleFilterByDone = (checked: boolean) => {
    const filteredOrders = filterOrdersByDone(myOrders, checked);
    if (filteredOrders != null) {
      setMyOrders(filteredOrders);
      setItemOffset(0); // reset paging
    }
  };

  const handleSubItemStatusChange = (
    orderId: number,
    subItem: FilteredSubItem,
    status: string
  ) => {
    if (!ordersService) {
      console.error("MyOrders::handleStatusChange: ordersService not ready");
      return;
    }

    ordersService.changeStatus({
      orderId,
      subItemId: subItem.id,
      subItemBoardId: subItem.subItemBoardId,
      status,
    });
  };

  const confirmSubItemStatusChange = (
    orderId: number,
    subItem: FilteredSubItem,
    status: string
  ) => {
    if (status === DONE_STATUS) {
      setConfirmProps({
        title: "האם אתה בטוח",
        subText: `האם לסמן את ${subItem.product.name} כבוצע?`,
        buttons: [
          {
            text: "לא",
            appearance: "secondary",
            onClick: () => {
              //TODO: $G$ revert DONE status
            },
          },
          {
            text: "כן",
            appearance: "primary",
            onClick: () => {
              handleSubItemStatusChange(orderId, subItem, status);
            },
          },
        ],
      });
      setConfirmOpen(true);
    } else {
      handleSubItemStatusChange(orderId, subItem, status);
    }
  };

  const handleSubItemRemove = (orderId: number, subItem: FilteredSubItem) => {
    if (!ordersService) {
      console.error("MyOrders::handleSubItemRemove: ordersService not ready");
      return;
    }

    ordersService.unAssignSubItem({
      orderId,
      subItemId: subItem.id,
      subItemBoardId: subItem.subItemBoardId,
    });

    if (!myOrders) {
      console.error("MyOrders::handleSubItemRemove: myOrders not empty");
      return;
    }

    const orderIndex = myOrders.findIndex((order) => order.id === orderId);
    if (orderIndex === -1) {
      console.error("MyOrders::handleSubItemRemove: orderIndex not found");
      return;
    }

    myOrders[orderIndex].subItems = [
      ...myOrders[orderIndex].subItems.filter(
        (_subItem: FilteredSubItem) => _subItem.id !== subItem.id
      ),
    ];

    const isEmptyOrder = myOrders[orderIndex].subItems.length === 0;
    if (isEmptyOrder) {
      myOrders.splice(orderIndex, 1);
    }

    setMyOrders([...myOrders]);
  };

  const confirmSubItemRemove = (orderId: number, subItem: FilteredSubItem) => {
    setConfirmProps({
      title: "האם אתה בטוח",
      subText: `האם להסיר את ${subItem.product.name}?`,
      buttons: [
        {
          text: "לא",
          appearance: "secondary",
        },
        {
          text: "כן",
          appearance: "primary",
          onClick: () => {
            handleSubItemRemove(orderId, subItem);
          },
        },
      ],
    });
    setConfirmOpen(true);
  };

  const toggleOpenNote = (id: number) => {
    setOpenNoteIds((openNoteIds) =>
      openNoteIds.includes(id)
        ? openNoteIds.filter((openNoteId) => openNoteId !== id)
        : [...openNoteIds, id]
    );
  };

  const handlePageClick = (pageIndex: number) => {
    console.debug("MyOrders::handlePageClick", pageIndex);

    const newOffset = (pageIndex * PAGE_SIZE) % filteredOrders.length;
    setItemOffset(newOffset);

    // scroll to top
    pageRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** Orders match filter */
  const filteredOrders = myOrders?.filter(isVisible) ?? [];
  /** Orders to render on screen (based on paging) */
  const visibleOrders = filteredOrders.slice(
    itemOffset,
    itemOffset + PAGE_SIZE
  );

  const pageCount = Math.ceil(filteredOrders.length / PAGE_SIZE);

  return (
    <>
      {/* HEADER */}
      <AppHeader />
      {/* CONTENT */}
      <div className="app-page" ref={pageRef}>
        {/* SUB-HEADER */}
        <SubHeader>הזמנות{myOrders && ` (${myOrders?.length})`}</SubHeader>
        {!myOrders ? (
          // SPINNER: LOADING...
          <Loading />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* FILTERS */}
            <Filters
              onTextFilter={handleTilterByText}
              onTypeFilter={handleFilterByType}
              onDoneFilter={handleFilterByDone}
            />
            {myOrders.length === 0 ? (
              // EMPTY STATE: NO DATA
              <SubHeader2>אין הזמנות</SubHeader2>
            ) : (
              <>
                {/* ITEMS LIST */}
                {visibleOrders.filter(isVisible).map((order, index) => (
                  <Card key={index}>
                    <CardHeader
                      header={
                        <Subtitle1>{order.unit ?? "(ללא כותרת)"}</Subtitle1>
                      }
                      description={
                        <div style={{ width: "100%" }}>
                          <div>איזור: {order.region ?? "ללא איזור מוגדר"}</div>
                          <div>
                            איש קשר: {order.name}, טלפון:{" "}
                            <Body1Stronger>
                              <a
                                href={`tel:${
                                  (order.phone ?? "").startsWith("972")
                                    ? "+"
                                    : ""
                                }${order.phone}`}
                              >
                                {order.phone}
                              </a>
                            </Body1Stronger>
                          </div>
                          <Divider appearance="strong" />
                        </div>
                      }
                    />
                    <CardPreview>
                      <AssignedSubItems
                        items={order.subItems}
                        statusesList={statusesList ?? []}
                        onStatusChange={(item, status) =>
                          confirmSubItemStatusChange(order.id, item, status)
                        }
                        onDelete={(item) =>
                          confirmSubItemRemove(order.id, item)
                        }
                      />
                      {order.comments && (
                        <a
                          className="order-comments-button"
                          onClick={() => toggleOpenNote(order.id)}
                        >
                          הערות
                          {openNoteIds.includes(order.id) ? (
                            <TextCollapse24Filled />
                          ) : (
                            <TextExpand24Regular />
                          )}
                        </a>
                      )}
                      {openNoteIds.includes(order.id) && (
                        <p className="order-comments">{order.comments}</p>
                      )}
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
                  <SubHeader2>אין הזמנות תואמת את הסינון</SubHeader2>
                )}
              </>
            )}
          </div>
        )}
      </div>
      {/* POPUP */}
      {confirmProps && (
        <ConfirmDialog
          openState={[confirmOpen, setConfirmOpen]}
          {...confirmProps}
        />
      )}
    </>
  );
};
