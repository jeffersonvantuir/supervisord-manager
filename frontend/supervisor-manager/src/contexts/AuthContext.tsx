import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { SessionStorageKeys } from "@/interface/SessionStorageKeys";
import { setItemToStorage } from "@/helpers/sessionStorage/setItemToStorage";
import { removeItemFromStorage } from "@/helpers/sessionStorage/removeItemFromStorage";
import api from "@/services/api";
import { getItemFromStorage } from "@/helpers/sessionStorage/getItemFromStorage";
import { message } from "antd";

interface IUser {
    id: number;
    name: string;
    email: string;
    roles: string[];
}

interface AuthContextType {
    user: IUser | null;
    isAuthenticated: boolean;
    hasPermission: (requiredRoles: string[]) => boolean;
    login: (token: string, userData: IUser) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<IUser | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('authUser');
        if (token && userData) {
            setUser(JSON.stringify(userData));
            setIsAuthenticated(true);
        }
    }, []);

    async function loadUser() {
        const token = getItemFromStorage(SessionStorageKeys.JwtToken);

        if (token) {
            try {
                const responseProfile = await api.get('/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setItemToStorage(SessionStorageKeys.UserData, JSON.stringify(responseProfile.data))

                setIsAuthenticated(true);
                setUser(JSON.stringify(responseProfile.data));
            } catch (error) {
                if (error.status == 401) {
                    logout();
                }
                message.error('Erro ao realizar a ação no servidor.');
                console.error(error);
            }
        } else {
            setIsAuthenticated(false);
            router.push('/login');
        }

        setLoading(false);
    }

    const logout = () => {
        removeItemFromStorage(SessionStorageKeys.JwtToken);
        removeItemFromStorage(SessionStorageKeys.UserData);
        setUser(null);
        setIsAuthenticated(false);
        router.push('/login');
    };

    useEffect(() => {
        loadUser();
    }, []);

    const hasPermission = (requiredRoles: string[]) => {
        if (user && user.roles) {
            return requiredRoles.some(value => user.roles.includes(value));
        }

        return false;
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                hasPermission,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);

export { AuthContext, AuthProvider, useAuth };
