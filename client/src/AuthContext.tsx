import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    username: string;
    role: 'admin' | 'user';
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // Restore session
        const storedToken = localStorage.getItem('imagyne_token');
        const storedUser = localStorage.getItem('imagyne_user');
        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser && parsedUser.username) {
                    setToken(storedToken);
                    setUser(parsedUser);
                } else {
                    throw new Error("Invalid user data");
                }
            } catch (e) {
                console.error("Auth restore error", e);
                localStorage.removeItem('imagyne_token');
                localStorage.removeItem('imagyne_user');
            }
        }
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('imagyne_token', newToken);
        localStorage.setItem('imagyne_user', JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('imagyne_token');
        localStorage.removeItem('imagyne_user');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
