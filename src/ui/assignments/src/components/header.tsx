import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Info24Regular, SignOut24Regular } from "@fluentui/react-icons";
import { Button, tokens } from "@fluentui/react-components";
import { useAuthenticationService } from "../services/authentication";
import { ROUTES } from "../routes-const";

const headerStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
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

  const loggedIn = isLoggedIn();
  const isAboutPage = location.pathname === ROUTES.ABOUT;

  return (
    <div style={headerStyle}>
      {/* Text buttons */}
      <div>
        {loggedIn ? (
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
        ) : isAboutPage ? (
          <Button appearance="transparent" onClick={() => navigate("/")}>
            התחבר
          </Button>
        ) : null}
      </div>
      {/* Icon buttons */}
      <div>
        {!isAboutPage && (
          <Button
            appearance="transparent"
            onClick={() => navigate(ROUTES.ABOUT)}
            icon={<Info24Regular />}
          />
        )}
        {loggedIn && (
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
