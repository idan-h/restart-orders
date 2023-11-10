import { useEffect, useState, useMemo } from "react";
import {
  makeStyles,
  Card,
  CardHeader,
  CardPreview,
  Body1Stronger,
  Divider,
  Field,
} from "@fluentui/react-components";
import {
  TextExpand24Regular,
  TextCollapse24Filled,
} from "@fluentui/react-icons";

import { DONE_STATUS, VisibleOrder, SubItem } from "../../types.ts";
import { useAuthenticationService } from "../../services/authentication.ts";
import { OrdersService } from "../../services/Orders.service.ts";
import { Loading } from "../../components/Loading.tsx";
import { Header } from "../../components/header.tsx";
import { SubHeader, SubHeader2 } from "../../components/SubHeader.tsx";
import {
  ConfirmDialog,
  ConfirmDialogProps,
} from "../../components/ConfirmDialog.tsx";
import { pageStyle } from "../sharedStyles.ts";
import { AssignedSubItems } from "./AssignedSubItems.tsx";
import { SearchBoxDebounce } from "../../components/SearchBoxDebounce.tsx";
import { TypeFilter } from "../../components/TypeFilter.tsx";
import {
  filterOrdersByText,
  filterOrdersByType,
} from "../../services/filterOrders.ts";

const useStyles = makeStyles({
  card: {
    textAlign: "left",
    width: "100%",
    marginBottom: "30px",
  },
});

export const AssignedOrders = () => {
  const styles = useStyles();

  const [myOrders, setMyOrders] = useState<VisibleOrder[] | undefined>();
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
        .then((items) => setMyOrders(items.orders));
    }

    if (!statusesList) {
      ordersService
        .fetchOrderStatusNames()
        .then((_statusesList) => setStatusesList(_statusesList));
    }
  }, []);

  const handleTilterByText = (searchText?: string) => {
    filterOrdersByText([myOrders, setMyOrders], searchText);
  };

  const handleFilterByType = (optionValue?: string) => {
    filterOrdersByType([myOrders, setMyOrders], optionValue);
  };

  const handleSubItemStatusChange = (
    orderId: number,
    subItem: SubItem,
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
    subItem: SubItem,
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
              // todo: revert DONE status
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

  const handleSubItemRemove = (orderId: number, subItem: SubItem) => {
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
        (_subItem) => _subItem.id !== subItem.id
      ),
    ];

    const isEmptyOrder = myOrders[orderIndex].subItems.length === 0;
    if (isEmptyOrder) {
      myOrders.splice(orderIndex, 1);
    }

    setMyOrders([...myOrders]);
  };

  const confirmSubItemRemove = (orderId: number, subItem: SubItem) => {
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
      <Header />
      <div style={pageStyle}>
        <SubHeader>הזמנות{myOrders && ` (${myOrders?.length})`}</SubHeader>
        {!myOrders ? (
          <Loading />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* filters */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Field label="חיפוש" style={{ flex: 1 }}>
                <SearchBoxDebounce onChange={handleTilterByText} />
              </Field>
              <Field label="סינון לפי סוג" style={{ flex: 1 }}>
                <TypeFilter onChange={handleFilterByType} />
              </Field>
            </div>
            {myOrders.length === 0 ? (
              <SubHeader2>אין הזמנות</SubHeader2>
            ) : (
              myOrders
                .filter((order) => !order.hidden)
                .map((order, index) => (
                  <Card key={index} className={styles.card}>
                    <CardHeader
                      header={
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            width: "-webkit-fill-available",
                          }}
                        >
                          {/* <ContactPersonDetailsTable items={[item]} /> */}
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
                ))
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
