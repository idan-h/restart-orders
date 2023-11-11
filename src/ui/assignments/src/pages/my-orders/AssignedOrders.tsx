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

import { DONE_STATUS, FilteredOrder, FilteredSubItem } from "../../types.ts";
import { useAuthenticationService } from "../../services/authentication.ts";
import { OrdersService } from "../../services/orders.service.ts";
import { Loading } from "../../components/Loading.tsx";
import { AppHeader } from "../../components/AppHeader.tsx";
import { SubHeader, SubHeader2 } from "../../components/SubHeader.tsx";
import {
  ConfirmDialog,
  ConfirmDialogProps,
} from "../../components/ConfirmDialog.tsx";
import { pageStyle } from "../sharedStyles.ts";
import { AssignedSubItems } from "./AssignedSubItems.tsx";
import { Filters } from "../../components/filters/Filters.tsx";
import {
  filterOrdersByDone,
  filterOrdersByText,
  filterOrdersByType,
  isVisible,
  showOrder,
} from "../../services/Filters.service.ts";

export const AssignedOrders = () => {
  const [myOrders, setMyOrders] = useState<FilteredOrder[] | undefined>();
  const [statusesList, setStatusesList] = useState<string[] | undefined>();

  const [openNoteIds, setOpenNoteIds] = useState<number[]>([]);

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
    filterOrdersByText([myOrders, setMyOrders], searchText);
  };

  const handleFilterByType = (optionValue?: string) => {
    filterOrdersByType([myOrders, setMyOrders], optionValue);
  };

  const handleFilterByDone = (checked: boolean) => {
    filterOrdersByDone([myOrders, setMyOrders], checked);
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

  return (
    <>
      <AppHeader />
      <div style={pageStyle}>
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
                {myOrders.filter(isVisible).map((order, index) => (
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
                          <Body1Stronger>
                            {order.unit} {order.region}
                          </Body1Stronger>
                          <Body1Stronger>{order.name}</Body1Stronger>
                          <Body1Stronger>{order.phone}</Body1Stronger>
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
                {!myOrders.some(isVisible) && (
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
