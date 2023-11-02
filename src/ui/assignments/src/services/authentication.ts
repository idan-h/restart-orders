import React, { useContext } from "react";

const baseUrl =
  "https://njdfolzzmvnaay5oxqife4tuwy.apigateway.il-jerusalem-1.oci.customer-oci.com/v1/";

export function makeAuthenticationService() {
  let userId: string | undefined = localStorage.getItem("userId") ?? undefined;

  return {
    async login(userName: string, password: string): Promise<void> {
      const response = await fetch(new URL("login", baseUrl), {
        method: "POST",
        body: JSON.stringify({ username: userName, password }),
      });

      const { userId: newUserId } = await response.json();

      userId = newUserId;

      localStorage.setItem("userId", newUserId);
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
  ReturnType<typeof makeAuthenticationService>
>(
  //@ts-expect-error error
  undefined
);

export const useAuthenticationService = () => useContext(AuthenticationService);
