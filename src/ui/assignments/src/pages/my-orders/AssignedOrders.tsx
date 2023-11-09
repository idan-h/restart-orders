import { useEffect, useState } from "react";
import {
  makeStyles,
  Body1,
  Card,
  CardHeader,
  CardPreview,
} from "@fluentui/react-components";
import {
  TextExpand24Regular,
  TextCollapse24Filled,
} from "@fluentui/react-icons";

import { pageStyle, titleStyle } from "../sharedStyles.ts";
import { DONE_STATUS, Order, SubItem } from "../../types.ts";
import { makeOrdersService } from "../../services/orders.service.ts";
import { Header } from "../../components/Header.tsx";
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
      <Header />
      <div style={pageStyle}>
        <h2 style={titleStyle}>הזמנות</h2>
        {!myOrders ? (
          <Loading />
        ) : myOrders.length === 0 ? (
          <h3 style={titleStyle}>אין הזמנות</h3>
        ) : (
          myOrders.map(({ id, unit, subItems, phone, comment }, index) => (
            <Card key={index} className={styles.card}>
              <CardHeader
                header={
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Body1 style={{ textAlign: "left" }}>
                      <b>{unit}</b>
                    </Body1>
                    <Body1>
                      <b>{phone}</b>
                    </Body1>
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
                        subText: `האם לסמן את ${subItem.productName} כבוצע?`,
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
                      subText: `האם להסיר את ${subItem.productName}?`,
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
          ))
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
