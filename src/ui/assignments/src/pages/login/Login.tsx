import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Field, Input, tokens } from "@fluentui/react-components";

import { ROUTES } from "../../routes-const";
import { useAuthenticationService } from "../../services/Authentication";
import { AppHeader } from "../../components/AppHeader";
import { SubHeader } from "../../components/SubHeader";
import { Loading } from "../../components/Loading";

const loginCardStyle: React.CSSProperties = {
  position: "relative",
  maxWidth: "360px",
  top: "45%",
  transform: "translateY(-50%)",
  padding: "4px",
  margin: "0 auto",
  borderRadius: "5px",
  boxShadow: tokens.shadow8Brand,
};

const inputsContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  padding: "12px 12px 18px",
};

const buttonStyle: React.CSSProperties = {
  marginTop: "18px",
};

const spinnerStyle: React.CSSProperties = {
  margin: "42px 0",
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
      <div className="app-page">
        <div style={loginCardStyle}>
          <SubHeader>פורטל Restart לעמותות</SubHeader>
          <div style={inputsContainerStyle}>
            {isLoading ? (
              <Loading
                label="מתחבר..."
                size="extra-large"
                style={spinnerStyle}
              />
            ) : (
              <>
                <Field
                  label="שם משתמש"
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
                  validationMessage={loginError}
                  validationState={loginError ? "error" : undefined}
                >
                  <Input
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                  />
                </Field>
                <Button
                  appearance="primary"
                  style={buttonStyle}
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
          </div>
        </div>
      </div>
    </>
  );
};
