// Order - a collection of subitems
export type BaseOrder = {
  id: string;
  region: string;
  phone: string;
  name: string;
  unit: string | undefined; // may be undefined - invalid data, missing unit name
  comment: string;
};

export type ContactPersonDetails = BaseOrder;
export type Order = BaseOrder & {
  subItems: Array<SubItem>;
};

export type MondayOrder = BaseOrder & {
  subItems: Array<SubItem>;
};

// Single item to deliver
export type BaseSubItem = {
  id: string;
  subItemBoardId: string;
  productId: string;
  quantity: number;
  userId: string | undefined; // if `undefined`, then the subitem is unassigned
  status: string | undefined; // if `undefined`, then the subitem is unassigned
};

export type MondaySubItem = BaseSubItem;

export type SubItem = BaseSubItem & {
  product: {
    name: string;
    type: string;
    product_number: string;
  };
};

export const DONE_STATUS = "בוצע";
