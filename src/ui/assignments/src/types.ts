export const DONE_STATUS = "בוצע";

interface Visible {
  /** hidden due to user filter */
  hidden?: boolean;
}

// ---------------------------------------------------

// Single item to deliver
export type BaseSubItem = {
  /** unique id */
  id: number;
  /** parent id */
  order_id: number;
  /** product id, get the product details by this id */
  productId: number;
  subItemBoardId: number;
  /** How many to deliver */
  quantity: number;
  /** subItems status */
  status: string;
  /** `undefined` if subitem is unassigned  */
  userId: string | undefined;
};

export interface Product {
  name: string;
  type: string;
  /** unique id */
  product_number: number;
}

export type SubItem = BaseSubItem & {
  product: Product;
};

export type VisibleSubItem = SubItem & Visible;

// ---------------------------------------------------

// Order - a collection of subitems

/** Order data, as returned from the server */
export type Order = {
  /** unique id */
  id: number;
  board_id: number;

  /** order status */
  orderStatus: string;
  /** order validation, is the order ok */
  orderValidationStatus: string;
  /** date/time string */
  createdAt: string;
  /** date/time string */
  lastUpdated: string;

  /** contact person */
  name: string;
  /** contact phone number */
  phone: string;
  /** contact email */
  email: string | null;
  /** location */
  region: string;

  /** military unit name */
  unit: string | undefined; // >>> may be undefined - invalid data, missing unit name
  /** additional text to show below the order */
  comments: string;

  priority: null; // >>> always getting null, need to ask backend what its for
  role: null; // >>> always getting null, need to ask backend what its for

  /** Array of sub-items */
  subItems: SubItem[];
};

export type ContactPersonDetails = Order;

export type VisibleOrder = Order &
  Visible & {
    subItems: Array<VisibleSubItem>;
  };

// ---------------------------------------------------
