export type BaseOrder = {
  id: string;
  region: string;
  unit: string;
  comment: string;
};

export type Order = BaseOrder & {
  subItems: Array<SubItem>;
};

export type MondayOrder = BaseOrder & {
  subItems: Array<SubItem>;
};

export type BaseSubItem = {
  id: string;
  subItemBoardId: string;
  productId: string;
  quantity: number;
  userId: string | undefined; // if `undefined`, then the subitem is unassigned
  status: string | undefined; // if `undefined`, then the subitem is unassigned
};

export type MondaySubItem = BaseSubItem

export type SubItem = BaseSubItem & {
  productName: string;
  // Hack!
  //requestedQuantity?: number;
};
