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
      productId: string;
      quantity: number;
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
      productId: string;
      quantity: number;
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
  status: string;
};
```

# `GET /get-order/:orderId`

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
      status: string | null; // if `null`, then the subitem is unassigned
    }
}

```
