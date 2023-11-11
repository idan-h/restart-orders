import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  Button,
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

import { LoginPage } from "./pages/login/Login.tsx";
import { Orders } from "./pages/orders/Orders.tsx";
import { AssignedOrders } from "./pages/my-orders/AssignedOrders.tsx";
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
      <FluentProvider
        theme={isDarkMode() ? webDarkTheme : webLightTheme}
        dir="rtl"
      >
        <div style={appStyle}>
          <Router>
            <Routes>
              <Route path={ROUTES.LOGIN} Component={LoginPage} />
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
            </Routes>
          </Router>
        </div>
      </FluentProvider>
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
        <Button appearance="primary" onClick={() => navigate("/")}>
          התחבר
        </Button>
      </div>
    );
  };
}

export default App;
