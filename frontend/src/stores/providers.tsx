import { UserContext } from "../context/UserContext";
import { UserStore } from "./userStore";

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const userStore = new UserStore(); // Автоматическая загрузка
  return <UserContext.Provider value={{ userStore }}>{children}</UserContext.Provider>;
};