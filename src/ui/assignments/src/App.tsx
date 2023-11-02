import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import { LoginForm } from "./pages/login/LoginForm";
import { HomePage } from "./pages/home/HomePage";
import { EditOrder } from "./pages/edit-order/EditOrder";
import { Orders } from "./pages/catalog/Orders.tsx";
import { AssignedOrders } from "./pages/catalog/AssignedOrders.tsx";
import "./App.css";
import {
  AuthenticationService,
  makeFakeAuthenticationService,
  useAuthenticationService,
} from "./services/authentication.ts";
import { OrdersService, makeFakeOrdersService } from "./services/orders.ts";
import React from "react";

function App() {
  return (
    <AuthenticationService.Provider value={makeFakeAuthenticationService()}>
      <OrdersService.Provider
        value={makeFakeOrdersService("this-is-good-userid")}
      >
        <FluentProvider theme={webLightTheme} dir="rtl">
          <Router>
            <Routes>
              <Route path="/" Component={HomePage}></Route>
              <Route
                path="/my-orders"
                Component={OnlyIfAuthenticated(AssignedOrders)}
              ></Route>
              <Route
                path="/orders"
                Component={OnlyIfAuthenticated(Orders)}
              ></Route>
              <Route
                path="/login"
                Component={OnlyIfAuthenticated(LoginForm)}
              ></Route>
              <Route
                path="/edit-order/:orderId"
                // eslint-disable-next-line react-hooks/rules-of-hooks
                Component={OnlyIfAuthenticated(() => (
                  <EditOrder orderId={useParams().orderId ?? ""} />
                ))}
              ></Route>
            </Routes>
          </Router>
        </FluentProvider>
      </OrdersService.Provider>
    </AuthenticationService.Provider>
  );
}

function OnlyIfAuthenticated(originalComponent: React.FC) {
  return () => {
    const { userId } = useAuthenticationService();

    return userId() ? (
      React.createElement(originalComponent)
    ) : (
      <div>you are not authenticated</div>
    );
  };
}

export default App;
