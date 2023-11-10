import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Body1,
  Button,
  Card,
  CardHeader,
  CardPreview,
  Combobox,
  Field,
  Option,
  Subtitle1,
  Subtitle2,
  tokens,
} from "@fluentui/react-components";
import {
  TextExpand24Regular,
  TextCollapse24Filled,
} from "@fluentui/react-icons";

import { ROUTES } from "../../routes-const.ts";
import { SubItem, VisibleOrder } from "../../types.ts";
import { useAuthenticationService } from "../../services/authentication.ts";
import { OrdersService } from "../../services/Orders.service.ts";
import { SubItems } from "./SubItems.tsx";
import { LoginHeader } from "../../components/header.tsx";
import { Loading } from "../../components/Loading.tsx";
import { SearchBoxDebounce } from "../../components/SearchBoxDebounce.tsx";
import { pageStyle, titleStyle } from "../sharedStyles.ts";

/** show order and all sub items */
const showOrder = (order: VisibleOrder): VisibleOrder => ({
  ...order,
  subItems: order.subItems.map((subItem) => ({
    ...subItem,
    hidden: false,
  })),
  hidden: false,
});

export const Orders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<VisibleOrder[] | undefined>(); // all orders
  const [openNoteIds, setOpenNoteIds] = useState<number[]>([]); // open notes ids (used to toggle open notes)
  const [saving, setSaving] = useState(false); // saving state (used for saving spinner and block submit button)

  const { getUserId } = useAuthenticationService();
  const userId = getUserId();

  const ordersService = useMemo(() => {
    if (!userId) {
      console.error("Orders::Init: Not logged in");
      return undefined;
    }

    return new OrdersService(userId);
  }, [userId]);

  useEffect(() => {
    if (!ordersService) {
      console.error("Orders::Init: ordersService not ready");
      return;
    }

    if (!orders) {
      ordersService.fetchUnassignedOrders().then((items) => {
        setOrders(items.orders);
      });
    }
  }, [ordersService]);

  const handleToggleSubItem = (
    orderId: number,
    subItem: SubItem,
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

  const handleSearch = (searchText: string) => {
    console.debug("Orders::handleSearch", searchText);

    if (!orders) {
      console.error("Orders::handleSearch: orders empty");
      return;
    }

    if (searchText) {
      setOrders(
        orders.map((order) => {
          if (order.unit?.includes(searchText)) {
            // title includes search - show order and all sub-items
            return showOrder(order);
          } else {
            let isOrderVisible = false;

            const filteredSubItems = order.subItems.map((subItem) => {
              const isItemVisible = !subItem.product.name.includes(searchText);

              isOrderVisible = isOrderVisible || isItemVisible; // the order is visible if at least one sub-item is visible

              return {
                ...subItem,
                hidden: isItemVisible,
              };
            });

            return {
              ...order,
              subItems: filteredSubItems,
              hidden: !isOrderVisible,
            };
          }
        })
      );
    } else {
      // clear search - all items visible
      setOrders(orders.map(showOrder));
    }
  };

  const toggleOpenNote = (id: number) => {
    setOpenNoteIds((openNoteIds) =>
      openNoteIds.includes(id)
        ? openNoteIds.filter((openNoteId) => openNoteId !== id)
        : [...openNoteIds, id]
    );
  };

  const handleFilterByTypeChange = (
    _: unknown,
    data: {
      optionValue: string | undefined;
      optionText: string | undefined;
      selectedOptions: string[];
    }
  ) => {
    data.optionValue === "All"
      ? setOrders(orders)
      : setOrders((_) =>
          orders?.filter(
            (unit) =>
              unit.subItems.filter((subItem) =>
                data.optionValue
                  ? subItem.product.type.split(",").includes(data.optionValue)
                  : true
              ).length > 0
          )
        );
  };

  const handleSubmit = async () => {
    if (!ordersService) {
      console.error("Orders::handleSubmit: ordersService not ready");
      return;
    }

    try {
      setSaving(true);
      await Promise.all(
        orders?.flatMap((order) =>
          order.subItems
            .filter((subItem) => !!subItem.userId)
            .map((subItem) =>
              ordersService.assignSubItem({
                orderId: order.id,
                subItemId: subItem.id,
                subItemBoardId: subItem.subItemBoardId,
              })
            )
        ) ?? []
      );
    } catch (e) {
      console.error("Orders::handleSubmit: failed to save all items");
      // reloading because some items may have succeeded
      window.location.reload();
      return;
    } finally {
      setSaving(false);
    }

    navigate(ROUTES.MY_ORDERS);
  };

  return (
    <>
      <LoginHeader />
      <div style={pageStyle}>
        <Subtitle1 style={titleStyle}>
          בקשות{orders && ` (${orders?.length})`}
        </Subtitle1>
        {saving ? (
          <Loading label="מעדכן..." />
        ) : !orders ? (
          <Loading />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Field label="חיפוש">
                <SearchBoxDebounce onChange={handleSearch} />
              </Field>
              <Field label="סינון לפי סוג">
                <Combobox onOptionSelect={handleFilterByTypeChange}>
                  {[
                    { key: "All", value: "הכל" },
                    { key: "IDF", value: "צהל" },
                    { key: "EMR", value: "כיתת כוננות" },
                    { key: "SEW", value: "תיקוני מתפרה" },
                    { key: "SEWMAN", value: "ייצור מתפרה" },
                  ].map((option) => (
                    <Option key={option.key} value={option.key}>
                      {option.value}
                    </Option>
                  ))}
                </Combobox>
              </Field>
            </div>
            {orders.length === 0 ? (
              // $G$ TODO - also show if filter has no results
              <Subtitle2 style={titleStyle}>אין בקשות</Subtitle2>
            ) : (
              orders
                .filter((order) => !order.hidden)
                .map(({ id, unit, subItems, comments }) => (
                  <Card
                    key={id}
                    style={{
                      textAlign: "right",
                      width: "100%",
                      marginBottom: "30px",
                    }}
                  >
                    <CardHeader
                      header={
                        <Body1 style={{ textAlign: "left" }}>
                          <b>{unit ?? "no name"}</b>
                        </Body1>
                      }
                    />
                    <CardPreview>
                      <SubItems
                        items={subItems}
                        onToggle={(subItem: SubItem, isChecked: boolean) =>
                          handleToggleSubItem(id, subItem, isChecked)
                        }
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
                ))
            )}
          </div>
        )}
      </div>
      {orders?.length && (
        <div
          style={{
            position: "fixed",
            padding: "6px 24px",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: tokens.colorNeutralBackground1,
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
    </>
  );
};
