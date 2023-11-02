import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import { LoginForm } from "./pages/login/LoginForm";
import { Logout } from "./pages/login/Logout";
import { HomePage } from "./pages/home/HomePage";
import { EditOrder } from "./pages/edit-order/EditOrder";
import { Orders } from "./pages/catalog/Orders.tsx";
import { AssignedOrders } from "./pages/catalog/AssignedOrders.tsx";
import { AboutUs } from "./pages/about/AboutUs.tsx";
import "./App.css";
// import { makeFakeAuthenticationService } from "./services/fake-authentication.ts";
// import { makeFakeOrdersService } from "./services/fake-orders.ts";
import React from "react";
import {
  AuthenticationService,
  makeAuthenticationService,
  useAuthenticationService,
} from "./services/authentication.ts";
import { OrdersService, makeOrdersService } from "./services/orders.ts";

function App() {
  return (
    <AuthenticationService.Provider value={makeAuthenticationService()}>
      <OrdersServiceComponent>
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
              ></Route>
            </Routes>
          </Router>
        </FluentProvider>
      </OrdersServiceComponent>
    </AuthenticationService.Provider>
  );
}

function OnlyIfAuthenticated(originalComponent: React.FC) {
  return () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { userId } = useAuthenticationService();

    return userId() ? (
      React.createElement(originalComponent)
    ) : (
      <div>you are not authenticated</div>
    );
  };
}

const OrdersServiceComponent: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const { userId } = useAuthenticationService();

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
