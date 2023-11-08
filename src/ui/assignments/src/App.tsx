import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import {
  FluentProvider,
  webDarkTheme,
  webLightTheme,
} from "@fluentui/react-components";

// import { makeFakeAuthenticationService } from "./services/fake-authentication.ts";
// import { makeFakeOrdersService } from "./services/fake-orders.ts";

import "./App.css";

import {
  AuthenticationService,
  makeAuthenticationService,
  useAuthenticationService,
} from "./services/authentication.ts";
import { OrdersService, makeOrdersService } from "./services/orders.ts";

import { LoginForm } from "./pages/login/LoginForm";
import { Orders } from "./pages/catalog/Orders.tsx";
import { AssignedOrders } from "./pages/catalog/AssignedOrders.tsx";
import { AboutUs } from "./pages/about/AboutUs.tsx";
import { ROUTES } from "./routes-const.ts";

const appStyle: React.CSSProperties = {
  height: "100vh",
  width: "100vw",
  display: "flex",
  flexDirection: "column",
};

function isDarkMode() {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch (e) {
    return false;
  }
}

function App() {
  return (
    <AuthenticationService.Provider value={makeAuthenticationService()}>
      <OrdersServiceComponent>
        <FluentProvider
          theme={isDarkMode() ? webDarkTheme : webLightTheme}
          dir="rtl"
        >
          <div style={appStyle}>
            <Router>
              <Routes>
                <Route path={ROUTES.LOGIN} Component={LoginForm} />
                <Route path={ROUTES.ABOUT} Component={AboutUs} />
                <Route path={ROUTES.MAIN}>
                  <Route path={ROUTES.ORDER} Component={Orders} />
                  <Route path={ROUTES.MY_ORDERS} Component={AssignedOrders} />
                  <Route
                    path={ROUTES.MAIN}
                    element={<Navigate to={ROUTES.ORDER} replace />}
                  />
                </Route>
                <Route
                  path="/"
                  element={<Navigate to={ROUTES.LOGIN} replace />}
                />
                {/* <Route path="/" Component={HomePage}></Route>
              <Route
                path="/my-orders"
                Component={OnlyIfAuthenticated(AssignedOrders)}
              ></Route>
              <Route
                path="/orders"
                Component={OnlyIfAuthenticated(Orders)}
              ></Route>
              <Route path="/login" Component={LoginForm}></Route>
              <Route path="/logout" Component={Logout}></Route>
              <Route path="/about-us" Component={AboutUs}></Route>
              <Route
                path="/edit-order/:orderId"
                Component={OnlyIfAuthenticated(() => {
                  // eslint-disable-next-line react-hooks/rules-of-hooks
                  const { orderId } = useParams();

                  return <EditOrder orderId={orderId ?? ""} />;
                })}
              ></Route> */}
              </Routes>
            </Router>
          </div>
        </FluentProvider>
      </OrdersServiceComponent>
    </AuthenticationService.Provider>
  );
}

// function OnlyIfAuthenticated(originalComponent: React.FC) {
//   return () => {
//     // eslint-disable-next-line react-hooks/rules-of-hooks
//     const { userId } = useAuthenticationService();

//     return userId() ? (
//       React.createElement(originalComponent)
//     ) : (
//       <div>you are not authenticated</div>
//     );
//   };
// }

const OrdersServiceComponent: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const { userId } = useAuthenticationService();
  // const isLoggedIn = Boolean(userId());

  if (!userId()) {
    return children;
  } else {
    return (
      <OrdersService.Provider value={makeOrdersService(userId()!)}>
        {children}
      </OrdersService.Provider>
    );
  }
};

export default App;
