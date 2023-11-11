import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardHeader,
  CardPreview,
  Field,
  Input,
} from "@fluentui/react-components";
import { ROUTES } from "../../routes-const";
import { useAuthenticationService } from "../../services/authentication";
import { AppHeader } from "../../components/Header";
import { pageStyle } from "../sharedStyles";
import { SubHeader } from "../../components/SubHeader";
import { Loading } from "../../components/Loading";

const loginCardStyle: React.CSSProperties = {
  top: "45%",
  transform: "translateY(-50%)",
  margin: "0 auto",
  maxWidth: "360px",
};

const cardContentStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  padding: "12px 12px 18px",
};

const inputStyle: React.CSSProperties = {
  display: "block",
};

export const LoginPage = () => {
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
      <AppHeader />
      <div style={pageStyle}>
        <Card style={loginCardStyle}>
          <CardHeader header={<SubHeader>פורטל Restart לעמותות</SubHeader>} />
          <CardPreview style={cardContentStyle}>
            {isLoading ? (
              <Loading
                label="מתחבר..."
                size="extra-large"
                style={{ margin: "42px 0" }}
              />
            ) : (
              <>
                <Field
                  label="שם משתמש"
                  orientation="vertical"
                  validationState={loginError ? "error" : undefined}
                >
                  <Input
                    type="text"
                    value={username}
                    style={inputStyle}
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
                    style={inputStyle}
                    onChange={handlePasswordChange}
                  />
                </Field>
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
              </>
            )}
          </CardPreview>
        </Card>
      </div>
    </>
  );
};
