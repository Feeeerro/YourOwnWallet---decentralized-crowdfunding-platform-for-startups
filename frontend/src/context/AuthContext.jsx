import { createContext, useContext, useState } from 'react';
import api from '../api/axios';

// Create the context
const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    // Initialize state from localStorage so the user stays logged in after page refresh
    const [user, setUser]   = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('access_token'));

    const login = async (username, password) => {
        // Call the login endpoint
        const response = await api.post('/users/login/', { username, password });
        const { user, access, refresh } = response.data;

        // Save tokens and user to localStorage so they persist after page refresh
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('user', JSON.stringify(user));

        setUser(user);
        setToken(access);

        return user;
    };

    const logout = () => {
        // Clear everything from localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');

        setUser(null);
        setToken(null);
    };

    const register = async (data) => {
        // Call the register endpoint
        const response = await api.post('/users/register/', data);
        const { user, access, refresh } = response.data;

        // Automatically log in after registration
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('user', JSON.stringify(user));

        setUser(user);
        setToken(access);

        return user;
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use the auth context easily in any component
export function useAuth() {
    return useContext(AuthContext);
}