import React, { useState } from "react";
import {
  Button,
  Card,
  CardFooter,
  CardHeader,
  CardPreview,
  Field,
  Input,
} from "@fluentui/react-components";
import { useNavigate } from "react-router-dom";
import { useAuthenticationService } from "../../services/authentication";

export const LoginForm = () => {
  const { login } = useAuthenticationService();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginState, setLoginState] = useState<string | undefined>();
  const navigate = useNavigate();

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSubmit = () => {
    login(username, password).then(
      () => navigate("/"),
      (error) => {
        setLoginState(error);
      }
    );
  };

  return (
    <Card style={{ width: "100%" }}>
      <CardHeader header={<h3>פורטל Restart לעמותות</h3>} />
      <CardPreview style={{ padding: "10px", width: "min-content" }}>
        <Field
          label="שם משתמש"
          orientation="vertical"
          validationState={loginState ? "error" : undefined}
        >
          <Input type="text" value={username} onChange={handleUsernameChange} />
        </Field>
        <Field
          label="סיסמא"
          orientation="vertical"
          validationMessage={loginState}
          validationState={loginState ? "error" : undefined}
        >
          <Input
            type="password"
            value={password}
            onChange={handlePasswordChange}
          />
        </Field>
      </CardPreview>
      <CardFooter>
        <Button appearance="primary" onClick={handleSubmit}>
          כניסה
        </Button>
      </CardFooter>
    </Card>
  );
};
