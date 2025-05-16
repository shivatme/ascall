import { createContext } from "react";

type AuthContextType = {
  user: any;
  setUser: any;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext;
