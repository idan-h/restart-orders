import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@fluentui/react-components";
import { useAuthenticationService } from "../services/authentication";
import { ROUTES } from "../routes-const";

const headerStyle: React.CSSProperties = {
  background: "gray",
};

export const Header: React.FunctionComponent = () => {
  const navigate = useNavigate();
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
          >
            בקשות
          </Button>
          <Button
            appearance="transparent"
            onClick={() => navigate(ROUTES.MY_ORDERS)}
          >
            הזמנות שלי
          </Button>
        </>
      )}
    </div>
  );
};
