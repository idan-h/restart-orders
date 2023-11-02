import React, { useContext } from "react";

export function makeFakeAuthenticationService() {
  let userId: string | undefined = undefined;
  return {
    async login(_userName: string, _password: string) {
      userId = "this-is-good-userid";
      return userId;
    },
    userId() {
      return userId;
    },
  };
}

export const AuthenticationService = React.createContext<
  ReturnType<typeof makeFakeAuthenticationService>
>(
  //@ts-expect-error
  undefined
);

export const useAuthenticationService = () => useContext(AuthenticationService);
