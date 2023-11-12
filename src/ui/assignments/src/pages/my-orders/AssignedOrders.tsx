import { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardPreview,
  Body1Stronger,
  Divider,
} from "@fluentui/react-components";
import {
  TextExpand24Regular,
  TextCollapse24Filled,
} from "@fluentui/react-icons";
import ReactPaginate from "react-paginate";

import { DONE_STATUS, FilteredOrder, FilteredSubItem } from "../../types.ts";
import { useAuthenticationService } from "../../services/authentication.ts";
import { OrdersService } from "../../services/Orders.service.ts";
import { Loading } from "../../components/Loading.tsx";
import { AppHeader } from "../../components/AppHeader.tsx";
import { SubHeader, SubHeader2 } from "../../components/SubHeader.tsx";
import {
  ConfirmDialog,
  ConfirmDialogProps,
} from "../../components/ConfirmDialog.tsx";
import { AssignedSubItems } from "./AssignedSubItems.tsx";
import { Filters } from "../../components/filters/Filters.tsx";
import {
  filterOrdersByDone,
  filterOrdersByText,
  filterOrdersByType,
  isVisible,
  showOrder,
} from "../../services/Filters.service.ts";

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

  const handlePageClick = ({ selected: pageIndex }: { selected: number }) => {
    console.debug("MyOrders::handlePageClick", pageIndex);

    const newOffset = (pageIndex * PAGE_SIZE) % filteredOrders.length;
    setItemOffset(newOffset);
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
      <AppHeader />
      <div className="app-page">
        <SubHeader>הזמנות{myOrders && ` (${myOrders?.length})`}</SubHeader>
        {!myOrders ? (
          <Loading />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Filters
              onTextFilter={handleTilterByText}
              onTypeFilter={handleFilterByType}
              onDoneFilter={handleFilterByDone}
            />
            {myOrders.length === 0 ? (
              <SubHeader2>אין הזמנות</SubHeader2>
            ) : (
              <>
                {visibleOrders.filter(isVisible).map((order, index) => (
                  <Card key={index} style={{ marginBottom: "30px" }}>
                    <CardHeader
                      header={
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            width: "-webkit-fill-available",
                          }}
                        >
                          <Body1Stronger>{order.unit}</Body1Stronger>
                          <Body1Stronger>
                            {order.region ?? "ללא איזור מוגדר"}
                          </Body1Stronger>
                          <Body1Stronger>{order.name}</Body1Stronger>
                          <Body1Stronger>
                            <a
                              href={`tel:${
                                (order.phone ?? "").startsWith("972") ? "+" : ""
                              }${order.phone}`}
                            >
                              {order.phone}
                            </a>
                          </Body1Stronger>
                          <Divider />
                          <Divider />
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
                          style={{
                            display: "flex",
                            alignItems: "center",
                            margin: 10,
                          }}
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
                      {openNoteIds.includes(order.id) ? (
                        <p style={{ margin: 10 }}>{order.comments}</p>
                      ) : null}
                    </CardPreview>
                  </Card>
                ))}
                {filteredOrders.length > PAGE_SIZE && (
                  <ReactPaginate
                    nextLabel="הבא >"
                    previousLabel="< הקודם"
                    pageCount={pageCount}
                    renderOnZeroPageCount={null}
                    onPageChange={handlePageClick}
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
                )}
                {filteredOrders.length === 0 && (
                  <SubHeader2>אין הזמנות תואמת את הסינון</SubHeader2>
                )}
              </>
            )}
          </div>
        )}
      </div>
      {confirmProps && (
        <ConfirmDialog
          openState={[confirmOpen, setConfirmOpen]}
          {...confirmProps}
        />
      )}
    </>
  );
};
