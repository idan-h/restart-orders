import React, { useState, useEffect } from "react";
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
import { Header } from "../../components/header";
import { ROUTES } from "../../routes-const";

const loginPageStyle: React.CSSProperties = {
  flex: 1,
  padding: "0 24px",
};

const loginCardStyle: React.CSSProperties = {
  top: "35%",
  transform: "translateY(-50%)",
};

const cardContentStyle: React.CSSProperties = {
  padding: "10px",
  width: "min-content",
};

export const LoginForm = () => {
  const { login, isLoggedIn } = useAuthenticationService();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Redirect if already logged in
    if (isLoggedIn()) {
      navigate(ROUTES.MAIN);
    }
  }, [isLoggedIn, navigate]);

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSubmit = () => {
    login(username, password)
      .then(
        () => navigate(ROUTES.MAIN),
        (error) => {
          setLoginError(error);
        }
      )
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      <Header />
      <div style={loginPageStyle}>
        <Card style={loginCardStyle}>
          <CardHeader header={<h3>פורטל Restart לעמותות</h3>} />
          <CardPreview style={cardContentStyle}>
            <Field
              label="שם משתמש"
              orientation="vertical"
              validationState={loginError ? "error" : undefined}
            >
              <Input
                type="text"
                value={username}
                onChange={handleUsernameChange}
              />
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
      </div>
    </>
  );
};
