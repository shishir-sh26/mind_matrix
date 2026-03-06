import React, { createContext, useContext, useState, ReactNode } from 'react';

type ThemeContextType = {
    isLightMode: boolean;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProviderWrapper({ children }: { children: ReactNode }) {
    const [isLightMode, setIsLightMode] = useState(false);

    const toggleTheme = () => setIsLightMode(prev => !prev);

    return (
        <ThemeContext.Provider value={{ isLightMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useAppTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useAppTheme must be used within a ThemeProviderWrapper');
    }
    return context;
}

// Default export required by Expo Router for files in the app/ directory
export default ThemeProviderWrapper;
