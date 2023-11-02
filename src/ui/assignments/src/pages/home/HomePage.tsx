import React from "react";
import { Link } from "react-router-dom";

export const HomePage: React.FC = () => {
  return (
    <div>
      <h1>ברוכים הבאים!</h1>
      <ul>
        <li>
          <Link to="/login">כניסה</Link>
        </li>
        <li>
          <Link to="/logout">יציאה</Link>
        </li>
        <li>
          <Link to="/my-orders">ההזמנות שלי</Link>
        </li>
        <li>
          <Link to="/orders">הזמנות שאפשר לספק</Link>
        </li>
      </ul>
    </div>
  );
};
