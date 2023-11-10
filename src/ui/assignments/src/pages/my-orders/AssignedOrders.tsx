import { useEffect, useState, useMemo } from "react";
import {
  makeStyles,
  Card,
  CardHeader,
  CardPreview,
  Body1Stronger,
  Divider,
  Subtitle1,
  Subtitle2,
} from "@fluentui/react-components";
import {
  TextExpand24Regular,
  TextCollapse24Filled,
} from "@fluentui/react-icons";

import { DONE_STATUS, Order, SubItem } from "../../types.ts";
import { useAuthenticationService } from "../../services/authentication.ts";
import { OrdersService } from "../../services/Orders.service.ts";
import { Loading } from "../../components/Loading.tsx";
import { Header } from "../../components/header.tsx";

import {
  ConfirmDialog,
  ConfirmDialogProps,
} from "../../components/ConfirmDialog.tsx";
import { pageStyle, titleStyle } from "../sharedStyles.ts";
import { AssignedSubItems } from "./AssignedSubItems.tsx";

const useStyles = makeStyles({
  card: {
    textAlign: "left",
    width: "100%",
    marginBottom: "30px",
  },
});

export const AssignedOrders = () => {
  const styles = useStyles();

  const [myOrders, setMyOrders] = useState<Order[] | undefined>();
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

  const handleStatusChange = (
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
        <Subtitle1 style={titleStyle}>הזמנות</Subtitle1>
        {!myOrders ? (
          <Loading />
        ) : myOrders.length === 0 ? (
          <Subtitle2 style={titleStyle}>אין הזמנות</Subtitle2>
        ) : (
          myOrders.map((item, index) => {
            const { id, subItems, comments } = item;
            return (
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
                        {item.unit} {item.region}
                      </Body1Stronger>
                      <Body1Stronger>{item.name}</Body1Stronger>
                      <Body1Stronger>{item.phone}</Body1Stronger>
                      <Divider />
                      <Divider />
                    </div>
                  }
                />
                <CardPreview>
                  <AssignedSubItems
                    items={subItems}
                    statusesList={statusesList ?? []}
                    onStatusChange={(subItem: SubItem, status: string) => {
                      if (status === DONE_STATUS) {
                        setConfirmProps({
                          title: "האם אתה בטוח",
                          subText: `האם לסמן את ${subItem.product.name} כבוצע?`,
                          onConfirm: (result: boolean) => {
                            if (result) {
                              handleStatusChange(id, subItem, status);
                            } else {
                              // todo: reset status
                            }
                          },
                        });
                        setConfirmOpen(true);
                      } else {
                        handleStatusChange(id, subItem, status);
                      }
                    }}
                    onDelete={(subItem: SubItem) => {
                      setConfirmProps({
                        title: "האם אתה בטוח",
                        subText: `האם להסיר את ${subItem.product.name}?`,
                        onConfirm: (result: boolean) => {
                          if (result) {
                            handleSubItemRemove(id, subItem);
                          }
                        },
                      });
                      setConfirmOpen(true);
                    }}
                  />
                  {comments && (
                    <a
                      style={{
                        display: "flex",
                        alignItems: "center",
                        margin: 10,
                      }}
                      onClick={() => toggleOpenNote(id)}
                    >
                      הערות
                      {openNoteIds.includes(id) ? (
                        <TextCollapse24Filled />
                      ) : (
                        <TextExpand24Regular />
                      )}
                    </a>
                  )}
                  {openNoteIds.includes(id) ? (
                    <p style={{ margin: 10 }}>{comments}</p>
                  ) : null}
                </CardPreview>
              </Card>
            );
          })
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
