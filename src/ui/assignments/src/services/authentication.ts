import { createContext, useContext } from "react";

const baseUrl =
  "https://njdfolzzmvnaay5oxqife4tuwy.apigateway.il-jerusalem-1.oci.customer-oci.com/v1/";

export function makeAuthenticationService() {
  let userId: string | undefined = localStorage.getItem("userId") ?? undefined;

  return {
    async login(userName: string, password: string) {
      const response = await fetch(new URL("login", baseUrl), {
        method: "POST",
        body: JSON.stringify({ username: userName, password }),
      }).catch((error) => {
        console.log(error);
      });

      const responseJson = response
        ? await response.json()
        : { userId: undefined };
      const error = responseJson.error;
      if (error) {
        console.log(error);
        return Promise.reject(error);
      } else {
        const newUserId = responseJson.userId;
        userId = newUserId;
        localStorage.setItem("userId", newUserId);
      }
    },
    logout() {
      userId = undefined;
      localStorage.removeItem("userId");
    },
    getUserId() {
      return userId;
    },
    isLoggedIn() {
      return Boolean(userId);
    },
  };
}

export const AuthenticationService = createContext<
  ReturnType<typeof makeAuthenticationService>
>(
  //@ts-expect-error error
  undefined
);

export const useAuthenticationService = () => useContext(AuthenticationService);
