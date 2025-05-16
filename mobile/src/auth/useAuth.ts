import { useContext } from "react";
import AuthContext from "./authContext";
import authStorage from "./authStorage";

type User = any;

const useAuth = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const { user, setUser } = authContext;

  const login = async (user: User) => {
    await authStorage.storeUser(user);
    setUser(user);
  };

  const logout = async () => {
    await authStorage.removeUser();
    setUser(null);
  };

  return { user, login, logout };
};

export default useAuth;
