import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Info24Regular, SignOut24Regular } from "@fluentui/react-icons";
import { Button, tokens } from "@fluentui/react-components";
import { useAuthenticationService } from "../services/authentication";
import { ROUTES } from "../routes-const";

const headerStyle: React.CSSProperties = {
  background: tokens.colorBrandBackground2Hover,
  display: "flex",
  justifyContent: "space-between",
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
      <div>
        {isLoggedIn() ? (
          <>
            <Button
              appearance="transparent"
              onClick={() => navigate(ROUTES.ORDER)}
              style={
                location.pathname === ROUTES.ORDER ? selectedRouteStyle : {}
              }
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
        ) : (
          <Button appearance="transparent" onClick={() => navigate("/")}>
            התחבר
          </Button>
        )}
      </div>
      <div>
        {location.pathname !== ROUTES.ABOUT && (
          <Button
            appearance="transparent"
            onClick={() => navigate(ROUTES.ABOUT)}
            style={location.pathname === ROUTES.ABOUT ? selectedRouteStyle : {}}
            icon={<Info24Regular />}
          />
        )}
        {isLoggedIn() && (
          <Button
            appearance="transparent"
            onClick={() => {
              logout();
              navigate("/");
            }}
            icon={<SignOut24Regular />}
          />
        )}
      </div>
    </div>
  );
};
