import { makeAuthenticationService } from "./authentication";

export function makeFakeAuthenticationService(): ReturnType<
  typeof makeAuthenticationService
> {
  let userId: string | undefined =
    localStorage.getItem("fakeUserId") ?? undefined;

  return {
    async login(_userName: string, _password: string): Promise<void> {
      userId = "this-is-good-userid";
      localStorage.setItem("fakeUserId", userId);
    },
    getUserId() {
      return userId;
    },
    logout() {
      userId = undefined;
      localStorage.removeItem("fakeUserId");
    },
    isLoggedIn() {
      return Boolean(userId);
    },
  };
}
