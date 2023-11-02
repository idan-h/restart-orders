import React, { useState } from "react";
import {
  Card,
  CardFooter,
  CardHeader,
  CardPreview,
  Field,
  Input,
} from "@fluentui/react-components";

export const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // handle login logic here
  };

  return (
    <Card style={{ width: "100%" }}>
      <CardHeader header={<h1>Login</h1>} />
      <CardPreview style={{ padding: "10px" }}>
        <form onSubmit={handleSubmit}>
          <Field label="Username" orientation="vertical">
            <Input
              type="text"
              value={username}
              onChange={handleUsernameChange}
            />
          </Field>
          <Field label="Password" orientation="vertical">
            <Input
              type="password"
              value={password}
              onChange={handlePasswordChange}
            />
          </Field>
        </form>
      </CardPreview>
      <CardFooter>
        <button type="submit">Login</button>
      </CardFooter>
    </Card>
  );
};
