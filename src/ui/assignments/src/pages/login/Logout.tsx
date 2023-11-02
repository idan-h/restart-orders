import { useNavigate } from "react-router-dom";
import { useAuthenticationService } from "../../services/authentication";
import { useEffect } from "react";

export function Logout() {
  const { logout } = useAuthenticationService();
  const navigate = useNavigate();

  useEffect(() => {
    logout();

    navigate("/");
  }, []);

  return <div>logging out...</div>;
}
