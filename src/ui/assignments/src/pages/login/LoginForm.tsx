import React, { useState } from "react";
import {
  Card,
  CardFooter,
  CardHeader,
  CardPreview,
  Field,
  Input,
} from "@fluentui/react-components";
import { useNavigate } from 'react-router-dom';
import { useAuthenticationService } from '../../services/authentication';

export const LoginForm = () => {
  const {login} = useAuthenticationService();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSubmit = () => {
    event.preventDefault();

    login(username, password).then(() => navigate('/'))
  };

  return (
    <Card style={{ width: "100%" }}>
      <CardHeader header={<h3>פורטל Restart לעמותות</h3>} />
      <CardPreview style={{ padding: "10px" }}>
        <form onSubmit={handleSubmit}>
          <Field label="שם משתמש" orientation="vertical">
            <Input
              type="text"
              value={username}
              onChange={handleUsernameChange}
            />
          </Field>
          <Field label="סיסמא" orientation="vertical">
            <Input
              type="password"
              value={password}
              onChange={handlePasswordChange}
            />
          </Field>
        </form>
      </CardPreview>
      <CardFooter>
        <button type="submit" onClick={handleSubmit}>כניסה</button>
      </CardFooter>
    </Card>
  );
};
