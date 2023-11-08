import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, tokens } from "@fluentui/react-components";
import { useAuthenticationService } from "../services/authentication";
import { ROUTES } from "../routes-const";

const headerStyle: React.CSSProperties = {
  background: tokens.colorBrandForegroundInvertedHover,
  padding: 8,
};

const selectedRouteStyle: React.CSSProperties = {
  borderBottom: `1px solid ${tokens.colorBrandForegroundLinkHover}`,
  borderRadius: "0px",
};
export const Header: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isLoggedIn } = useAuthenticationService();

  return (
    <div style={headerStyle}>
      {isLoggedIn() ? (
        <Button
          appearance="transparent"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          התנתק
        </Button>
      ) : (
        <Button appearance="transparent" onClick={() => navigate("/")}>
          התחבר
        </Button>
      )}

      {isLoggedIn() && (
        <>
          <Button
            appearance="transparent"
            onClick={() => navigate(ROUTES.ORDER)}
            style={location.pathname === ROUTES.ORDER ? selectedRouteStyle : {}}
          >
            בקשות
          </Button>
          <Button
            appearance="transparent"
            onClick={() => navigate(ROUTES.MY_ORDERS)}
            style={
              location.pathname === ROUTES.MY_ORDERS ? selectedRouteStyle : {}
            }
          >
            הזמנות שלי
          </Button>
        </>
      )}
    </div>
  );
};
