import { useEffect, useState } from "react";
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

import { pageStyle, titleStyle } from "../sharedStyles.ts";
import { DONE_STATUS, Order, SubItem } from "../../types.ts";
import { makeOrdersService } from "../../services/orders.service.ts";
import { LoginHeader } from "../../components/header.tsx";
import { Loading } from "../../components/Loading.tsx";
import { AssignedSubItems } from "./AssignedSubItems.tsx";
import { useAuthenticationService } from "../../services/authentication.ts";
import {
  ConfirmDialog,
  ConfirmDialogProps,
} from "../../components/ConfirmDialog.tsx";

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

  const [openNoteIds, setOpenNoteIds] = useState<string[]>([]);

  const [confirmOpen, setConfirmOpen] = useState<boolean | undefined>(false);
  const [confirmProps, setConfirmProps] = useState<
    Omit<ConfirmDialogProps, "openState"> | undefined
  >();

  const { getUserId } = useAuthenticationService();
  const ordersService = makeOrdersService(getUserId());

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
    orderId: string,
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

  const handleSubItemRemove = (orderId: string, subItem: SubItem) => {
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

  const toggleOpenNote = (id: string) => {
    setOpenNoteIds((openNoteIds) =>
      openNoteIds.includes(id)
        ? openNoteIds.filter((openNoteId) => openNoteId !== id)
        : [...openNoteIds, id]
    );
  };

  return (
    <>
      <LoginHeader />
      <div style={pageStyle}>
        <Subtitle1 style={titleStyle}>הזמנות</Subtitle1>
        {!myOrders ? (
          <Loading />
        ) : myOrders.length === 0 ? (
          <Subtitle2 style={titleStyle}>אין הזמנות</Subtitle2>
        ) : (
          myOrders.map((item, index) => {
            const { id, subItems, comment } = item;
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
                  {comment && (
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
                    <p style={{ margin: 10 }}>{comment}</p>
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
