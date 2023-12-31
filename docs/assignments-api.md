# API

- All API calls, besides `/login`, receives a `userId` query parameter for authentication.
- All API calls receive and return JSON.

# `POST /login`

```ts
type Request = {
  username: string;
  password: string;
}

type: Response = {
  userId: string;
} | {
  error: string;
}
```

# `GET /get-unassigned-orders`

```ts
type Response = {
  orders: Array<{
    id: string;
    region: string;
    unit: string;
    subItems: Array<{
      id: string;
      subItemBoardId: number;
      productId: string;
      quantity: number;
      userId: string | null;
      status: string | null; // if `null`, then the subitem is unassigned
    }>;
  }>;
};
```

# `GET /get-assigned-orders`

```ts
type Response = {
  orders: Array<{
    id: string;
    region: string;
    unit: string;
    subItems: Array<{
      id: string;
      subItemBoardId: number;
      productId: string;
      quantity: number;
      userId: string | null;
      status: string | null; // if `null`, then the subitem is unassigned
    }>
}
```

# `POST /assign`

```ts
type Request = {
  orderId: string;
  subItemId: string;
  subItemBoardId: string;
};
```

# `POST /unassign`

```ts
type Request = {
  orderId: string;
  subItemId: string;
  subItemBoardId: string;
};
```

# `POST /change-status`

```ts
type Request = {
  orderId: string;
  subItemId: string;
  subItemBoardId: string;
  status: string;
};
```

# `GET /get-user-order/:orderId`

```ts
type Response = {
  order: {
    id: string;
    region: string;
    unit: string;
    subItems: Array<{
      id: string;
      subItemBoardId: string;
      productId: string;
      quantity: number;
      userId: string | null;
      status: string | null; // if `null`, then the subitem is unassigned
    }
}

```

# `GET /get-subitem-statuses`

```ts
type Response = {
  statuses: Array<string>;
};

```



# `GET /get-products`

```ts
type Response =
  Array<{
    name: string;
    product_number: number;
    type: string;
  }>;
```
