import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthenticationService } from "../services/authentication";
import { ROUTES } from "../routes-const";

const headerStyle: React.CSSProperties = {
  height: "80px",
};

export const Header: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout, userId } = useAuthenticationService();
  const isLoggedIn = Boolean(userId());

  return (
    <div style={headerStyle}>
      {/* left side */}
      <div>
        {pathname === ROUTES.ABOUT ? (
          <button onClick={() => navigate("/")}>התחבר</button>
        ) : (
          <button onClick={() => navigate(ROUTES.ABOUT)}>אודות</button>
        )}

        {isLoggedIn && (
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            {/* show only if logged in */}
            התנתק
          </button>
        )}
      </div>
      {/* right side */}
      {isLoggedIn && (
        <div>
          <button onClick={() => navigate(ROUTES.ORDER)}>בקשות</button>
          <button onClick={() => navigate(ROUTES.MY_ORDERS)}>הזמנות שלי</button>
        </div>
      )}
    </div>
  );
};
