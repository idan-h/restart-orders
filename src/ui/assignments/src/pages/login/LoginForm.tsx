import React, { useState } from "react";
import {
  Button,
  Card,
  CardFooter,
  CardHeader,
  CardPreview,
  Field,
  Input,
  Spinner,
} from "@fluentui/react-components";
import { useNavigate } from "react-router-dom";
import { useAuthenticationService } from "../../services/authentication";

export const LoginForm = () => {
  const { login } = useAuthenticationService();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSubmit = () => {
    login(username, password)
      .then(
        () => navigate("/"),
        (error) => {
          setLoginError(error);
        }
      )
      .finally(() => setIsLoading(false));
  };

  return (
    <Card style={{ width: "100%" }}>
      <CardHeader header={<h3>פורטל Restart לעמותות</h3>} />
      <CardPreview style={{ padding: "10px", width: "min-content" }}>
        <Field
          label="שם משתמש"
          orientation="vertical"
          validationState={loginError ? "error" : undefined}
        >
          <Input type="text" value={username} onChange={handleUsernameChange} />
        </Field>
        <Field
          label="סיסמא"
          orientation="vertical"
          validationMessage={loginError}
          validationState={loginError ? "error" : undefined}
        >
          <Input
            type="password"
            value={password}
            onChange={handlePasswordChange}
          />
        </Field>
      </CardPreview>
      <CardFooter>
        <Button
          appearance="primary"
          onClick={() => {
            setLoginError(undefined);
            setIsLoading(true);
            handleSubmit();
          }}
        >
          כניסה
        </Button>
        {isLoading && <Spinner />}
      </CardFooter>
    </Card>
  );
};
