import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
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
      <LoginServiceComponent>
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
                  <Route
                    path={ROUTES.ORDER}
                    Component={onlyIfAuthenticated(Orders)}
                  />
                  <Route
                    path={ROUTES.MY_ORDERS}
                    Component={onlyIfAuthenticated(AssignedOrders)}
                  />
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
      </LoginServiceComponent>
    </AuthenticationService.Provider>
  );
}

function onlyIfAuthenticated(originalComponent: React.FC) {
  return () => {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuthenticationService();

    return isLoggedIn() ? (
      React.createElement(originalComponent)
    ) : (
      <div
        style={{
          position: "relative",
          top: "30%",
          textAlign: "center",
        }}
      >
        <h3>לא מחובר!</h3>
        <button onClick={() => navigate("/")}>התחבר</button>
      </div>
    );
  };
}

const LoginServiceComponent: React.FunctionComponent<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const { getUserId } = useAuthenticationService();
  const userId = getUserId();

  if (!userId) {
    // Not logged in
    return children;
  } else {
    // Logged in
    return (
      <OrdersService.Provider value={makeOrdersService(userId!)}>
        {children}
      </OrdersService.Provider>
    );
  }
};

export default App;
