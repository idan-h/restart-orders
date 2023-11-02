import React from 'react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <p>Please login to access your account</p>
      <Link to="/login">Login</Link>
    </div>
  );
};
