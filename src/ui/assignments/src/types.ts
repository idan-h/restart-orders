export type Order = {
    id: string;
    region: string;
    unit: string;
    subItems: Array<SubItem>;
    comment: string
  };

export type SubItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  status: string | undefined; // if `undefined`, then the subitem is unassigned

  // Hack!
  requestedQuantity?: number;
};
