import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthenticationService } from "../services/authentication";
import { ROUTES } from "../routes-const";

export const Header: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout, userId } = useAuthenticationService();
  const isLoggedIn = Boolean(userId());

  return (
    <div>
      {/* left side */}
      <div>
        {pathname === ROUTES.ABOUT ? (
          <button onClick={() => navigate("/")}>Connect</button>
        ) : (
          <button onClick={() => navigate(ROUTES.ABOUT)}>About</button>
        )}

        {isLoggedIn && (
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            {/* show only if logged in */}
            Logout
          </button>
        )}
      </div>
      {/* right side */}
      {isLoggedIn && (
        <div>
          <button onClick={() => navigate(ROUTES.ORDER)}>
            Available items
          </button>
          <button onClick={() => navigate(ROUTES.MY_ORDERS)}>My orders</button>
        </div>
      )}
    </div>
  );
};
