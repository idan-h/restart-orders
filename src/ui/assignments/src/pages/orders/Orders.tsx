import { useEffect, useRef, useState } from "react";
import {
  tokens,
  Card,
  CardHeader,
  CardPreview,
  Button,
  Subtitle1,
} from "@fluentui/react-components";

import { useAuthenticationService } from "../../services/Authentication.service.ts";
import { useOrdersService } from "../../services/Orders.srv.ts";
import {
  FilteredOrder,
  FilteredSubItem,
  isVisible,
  showOrder,
  filterOrdersByText,
  filterOrdersByType,
  filterOrdersByProduct,
} from "../../services/Filters.service.ts";
import { AppHeader } from "../../components/AppHeader.tsx";
import { Loading } from "../../components/Loading.tsx";
import { SubHeader, SubHeader2 } from "../../components/SubHeader.tsx";
import { Pagination } from "../../components/Pagination.tsx";
import {
  ConfirmDialog,
  ConfirmDialogProps,
} from "../../components/ConfirmDialog.tsx";
import { Filters } from "../../components/filters/Filters.tsx";
import { OrderComments, WithNote } from "../../components/OrderComments.tsx";
import { SubItems } from "./SubItems.tsx";

const PAGE_SIZE = 25;

export const Orders = () => {
  // all orders
  const [orders, setOrders] = useState<(FilteredOrder & WithNote)[] | null>(
    null
  );

  const [saving, setSaving] = useState(false); // saving state (used for saving spinner and block submit button)
  const [itemOffset, setItemOffset] = useState(0); // paging offset, display items from this index

  const [confirmOpen, setConfirmOpen] = useState<boolean | undefined>(false);
  const [confirmProps, setConfirmProps] = useState<
    Omit<ConfirmDialogProps, "openState"> | undefined
  >();

  const pageRef = useRef<HTMLDivElement>(null);

  const { getUserId } = useAuthenticationService();
  const userId = getUserId();

  const ordersService = useOrdersService();

  useEffect(() => {
    if (!ordersService) {
      console.error("Orders::Init: ordersService not ready");
      return;
    }

    if (!orders) {
      ordersService.fetchUnassignedOrders().then((items) => {
        setOrders(items.orders.map((order) => showOrder(order)));
      });
    }
  }, [ordersService]);

  const handleTilterByText = (searchText: string) => {
    const filteredOrders = filterOrdersByText(orders, searchText);
    if (filteredOrders !== null) {
      setOrders(filteredOrders);
      setItemOffset(0); // reset paging
    }
  };

  const handleFilterByType = (optionValue?: string) => {
    const filteredOrders = filterOrdersByType(orders, optionValue);
    if (filteredOrders !== null) {
      setOrders(filteredOrders);
      setItemOffset(0); // reset paging
    }
  };

  const handleFilterByProduct = (productNumbers: number[]) => {
    const filteredOrders = filterOrdersByProduct(orders, productNumbers);
    if (filteredOrders !== null) {
      setOrders(filteredOrders);
      setItemOffset(0); // reset paging
    }
  };

  const handleToggleSubItem = (
    orderId: number,
    subItem: FilteredSubItem,
    isChecked: boolean
  ) => {
    if (!orders) {
      console.error("Orders::handleToggleSubItem: orders empty");
      return;
    }

    const orderIndex = orders.findIndex((order) => order.id === orderId);
    if (orderIndex === -1) {
      console.error("Orders::handleToggleSubItem: order not found");
      return;
    }

    const subItemsIndex = orders[orderIndex].subItems.findIndex(
      (_subItem) => _subItem.id === subItem.id
    );
    if (subItemsIndex === -1) {
      console.error("Orders::handleToggleSubItem: subItem not found");
      return;
    }

    orders[orderIndex].subItems[subItemsIndex] = {
      ...subItem,
      userId: isChecked ? userId : undefined,
    };

    setOrders([...orders]);
  };

  const toggleOpenNote = (orderId: number) => {
    if (!orders) {
      console.error("Orders::toggleOpenNote: orders empty");
      return;
    }

    const orderIndex = orders.findIndex((order) => order.id === orderId);
    if (orderIndex === -1) {
      console.error("Orders::toggleOpenNote: order not found");
      return;
    }

    orders[orderIndex].noteOpen = !orders[orderIndex].noteOpen;

    orders.splice(orderIndex, 1, orders[orderIndex]);
    setOrders([...orders]);
  };

  const handlePageClick = (pageIndex: number) => {
    console.debug("Orders::handlePageClick", pageIndex);

    const newOffset = (pageIndex * PAGE_SIZE) % filteredOrders.length;
    setItemOffset(newOffset);

    // scroll to top
    pageRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!ordersService) {
      console.error("Orders::handleSubmit: ordersService not ready");
      return;
    }

    if (!orders) {
      console.error("Orders::handleSubmit: orders empty");
      return;
    }

    // The server is slow. We first call the assign method but we still.
    // The filter out the items that where assigned. All the assigned items and orders that don't have any un-assigned items left.
    let subItemsToAssign: FilteredSubItem[] = [];
    const ordersToKeep: FilteredOrder[] = [];

    try {
      setSaving(true);

      orders.forEach((order) => {
        const itemsToKeep: FilteredSubItem[] = []; // will be kept
        const itemsToRemove: FilteredSubItem[] = []; // will be assigned

        order.subItems.forEach((subItem: FilteredSubItem) =>
          subItem.userId
            ? itemsToRemove.push(subItem)
            : itemsToKeep.push(subItem)
        );

        subItemsToAssign = subItemsToAssign.concat(itemsToRemove);

        if (itemsToKeep.length) {
          // keep this order
          ordersToKeep.push({
            ...order,
            subItems: itemsToKeep,
          });
        }
      });

      await Promise.all(
        subItemsToAssign.map((subItem) =>
          ordersService.assignSubItem({
            orderId: subItem.order_id,
            subItemId: subItem.id,
            subItemBoardId: subItem.subItemBoardId,
          })
        )
      );
    } catch (e) {
      console.error("Orders::handleSubmit: failed to save all items");
      // reloading because some items may have succeeded
      window.location.reload();
      return;
    } finally {
      setOrders(ordersToKeep); // update the UI with the orders that were not assigned
      setSaving(false);

      setConfirmProps({
        title: "הזמנה נשלחה בהצלחה",
        subText: "הפריט שלך יופיע תחת לשונית הזמנות שלי",
        buttons: [
          {
            text: "אישור",
            appearance: "primary",
          },
        ],
      });
      setConfirmOpen(true);
    }
  };

  /** Orders match filter */
  const filteredOrders = orders?.filter(isVisible) ?? [];
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
      <div className="app-page" style={{ bottom: "44px" }} ref={pageRef}>
        {/* SUB-HEADER */}
        <SubHeader>בקשות{orders && ` (${orders?.length})`}</SubHeader>
        {saving ? (
          // SPINNER: ASSIGNING...
          <Loading label="מעדכן..." />
        ) : !orders ? (
          // SPINNER: LOADING...
          <Loading />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* FILTERS */}
            <Filters
              onTextFilter={handleTilterByText}
              onTypeFilter={handleFilterByType}
              onProductFilter={handleFilterByProduct}
            />
            {orders.length === 0 ? (
              // EMPTY STATE: NO DATA
              <SubHeader2>אין בקשות</SubHeader2>
            ) : (
              <>
                {/* ITEMS LIST */}
                {visibleOrders.map((order, index) => (
                  <Card key={index}>
                    <CardHeader
                      header={
                        <Subtitle1>{order.unit ?? "(ללא כותרת)"}</Subtitle1>
                      }
                      description={`(${order.subItems.length} פריטים)`}
                    />
                    <CardPreview>
                      <SubItems
                        items={order.subItems}
                        onToggle={(
                          subItem: FilteredSubItem,
                          isChecked: boolean
                        ) => handleToggleSubItem(order.id, subItem, isChecked)}
                      />
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
                  <SubHeader2>אין בקשות תואמת את הסינון</SubHeader2>
                )}
              </>
            )}
          </div>
        )}
      </div>
      {/* BUTTON: ASSIGN */}
      {orders?.length && (
        <div
          style={{
            position: "fixed",
            padding: "6px 24px",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: tokens.colorNeutralBackground1,
            boxShadow: tokens.shadow28,
          }}
        >
          <Button
            appearance="primary"
            style={{ width: "100%" }}
            onClick={handleSubmit}
            disabled={
              saving ||
              orders.every((order) =>
                order.subItems.every((subItem) => !subItem.userId)
              )
            }
          >
            הוסף להזמנות שלי
          </Button>
        </div>
      )}
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
