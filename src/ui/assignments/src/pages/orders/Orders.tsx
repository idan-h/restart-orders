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
  tokens,
} from "@fluentui/react-components";
import {
  TextExpand24Regular,
  TextCollapse24Filled,
} from "@fluentui/react-icons";
import { useEffect, useState } from "react";
import { Order, SubItem } from "../../types.ts";
import { SubItems } from "./SubItems.tsx";
import { LoginHeader } from "../../components/header.tsx";
import { Loading } from "../../components/Loading.tsx";

import { ROUTES } from "../../routes-const.ts";
import { pageStyle, titleStyle } from "../sharedStyles.ts";
import { makeOrdersService } from "../../services/orders.service.ts";
import { useAuthenticationService } from "../../services/authentication.ts";
import { SearchBoxDebounce } from "../../components/SearchBoxDebounce.tsx";

export const Orders = () => {
  const navigate = useNavigate();

  const { getUserId } = useAuthenticationService();
  const ordersService = makeOrdersService(getUserId());

  const [orders, setOrders] = useState<Order[] | undefined>(); // all orders
  const [displayedOrders, setDisplayedOrders] = useState<Order[] | undefined>(); // filtered orders
  const [search, setSearch] = useState(""); // search text (used to re-calculate displayedOrders after item state change - toggle)
  const [openNoteIds, setOpenNoteIds] = useState<string[]>([]); // open notes ids (used to toggle open notes)
  const [saving, setSaving] = useState(false); // saving state (used for saving spinner and block submit button)

  useEffect(() => {
    if (!ordersService) {
      console.error("Orders::Init: ordersService not ready");
      return;
    }

    if (!orders) {
      ordersService.fetchUnassignedOrders().then((items) => {
        setOrders(items.orders);
        setDisplayedOrders(items.orders);
      });
    }
  }, [ordersService]);

  const handleToggleSubItem = (
    orderId: string,
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
      userId: isChecked ? getUserId() : undefined,
    };

    setOrders([...orders]);
    handleSearch(search); // update displayedOrders with the new toggle state
  };

  const handleSearch = (searchText: string) => {
    console.debug("Orders::handleSearch", searchText);

    setSearch(searchText);

    if (!orders) {
      console.error("Orders::handleSearch: orders empty");
      return;
    }

    if (searchText) {
      const filteredOrders: Order[] = [];

      orders.forEach((order) => {
        if (order.unit?.includes(searchText)) {
          // group title includes search text - add all sub items
          filteredOrders.push(order);
        } else {
          // group title does not include search text - filter sub items
          const filteredSubItems = order.subItems.filter((subItem) =>
            subItem.productName.includes(searchText)
          );
          if (filteredSubItems.length) {
            // add only the sub items that match the search text
            filteredOrders.push({ ...order, subItems: filteredSubItems });
          }
        }
      });

      setDisplayedOrders(filteredOrders);
    } else {
      setDisplayedOrders(orders); // clear search
    }
  };

  const toggleOpenNote = (id: string) => {
    setOpenNoteIds((openNoteIds) =>
      openNoteIds.includes(id)
        ? openNoteIds.filter((openNoteId) => openNoteId !== id)
        : [...openNoteIds, id]
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
        <h2 style={titleStyle}>
          בקשות{displayedOrders && ` (${displayedOrders?.length})`}
        </h2>
        {saving ? (
          <Loading label="מעדכן..." />
        ) : !displayedOrders ? (
          <Loading />
        ) : (
          <>
            <div style={{ display: "flex", gap: 12 }}>
              <Field label="חיפוש">
                <SearchBoxDebounce onChange={handleSearch} />
              </Field>
              <Field label="סינון לפי סוג">
                <Combobox
                  onOptionSelect={(_, data) => {
                    data.optionValue === "All"
                      ? setDisplayedOrders(orders)
                      : setDisplayedOrders((_) =>
                          orders?.filter(
                            (unit) =>
                              unit.subItems.filter((subItem) =>
                                data.optionValue
                                  ? subItem.type
                                      .split(",")
                                      .includes(data.optionValue)
                                  : true
                              ).length > 0
                          )
                        );
                  }}
                >
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
            {displayedOrders.length === 0 ? (
              <h3 style={titleStyle}>אין בקשות</h3>
            ) : (
              displayedOrders.map(({ id, unit, subItems, comment }) => {
                return (
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
          </>
        )}
      </div>
      {displayedOrders?.length && (
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
              displayedOrders.every((order) =>
                order.subItems.every((subItem) => !subItem.userId)
              )
            }
          >
            הוסף לבקשות שלי
          </Button>
        </div>
      )}
    </>
  );
};
