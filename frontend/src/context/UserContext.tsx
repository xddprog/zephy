import { createContext } from 'react';

import { UserStore } from '../stores/userStore';

interface UserContextType {
    userStore: UserStore;
}

export const UserContext = createContext<UserContextType | null>(null);
