import React, { useContext } from "react";

export function makeFakeAuthenticationService() {
  let userId: string | undefined = localStorage.getItem("userId") ?? undefined;

  return {
    async login(_userName: string, _password: string) {
      userId = "this-is-good-userid";
      localStorage.setItem("userId", userId);
      return userId;
    },
    userId() {
      return userId;
    },
    logout() {
      userId = undefined;
      localStorage.removeItem("userId");
    },
  };
}

export const AuthenticationService = React.createContext<
  ReturnType<typeof makeFakeAuthenticationService>
>(
  //@ts-expect-error error
  undefined
);

export const useAuthenticationService = () => useContext(AuthenticationService);
