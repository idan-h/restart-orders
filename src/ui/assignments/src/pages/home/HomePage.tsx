import React from "react";
import { Link } from "react-router-dom";
import { useAuthenticationService } from "../../services/authentication";

export const HomePage: React.FC = () => {
  const { userId } = useAuthenticationService();
  return (
    <div>
      <h1>ברוכים הבאים!</h1>
      <ul>
        <li>
          <Link to="/login">כניסה</Link>
        </li>
        <li>
          <Link to="/about-us">אודותנו</Link>
        </li>
        {userId() && (
          <>
            <li>
              <Link to="/logout">יציאה</Link>
            </li>
            <li>
              <Link to="/my-orders">ההזמנות שלי</Link>
            </li>
            <li>
              <Link to="/orders">הזמנות שאפשר לספק</Link>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};
