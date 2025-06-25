import { useContext } from 'react';
import { UserContext } from '../context/UserContext';


export const useUserStore = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserStore должен использоваться внутри UserProvider');
  }
  return context.userStore;
};