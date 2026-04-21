import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const [theme, setThemeState] = useState(() =>
        localStorage.getItem('focusFlowTheme') || 'midnight'
    );
    const [wallpaper, setWallpaperState] = useState(() =>
        localStorage.getItem('focusFlowWallpaper') || ''
    );

    const setTheme = (t) => {
        setThemeState(t);
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('focusFlowTheme', t);
    };

    const setWallpaper = (w) => {
        setWallpaperState(w);
        localStorage.setItem('focusFlowWallpaper', w);
    };

    // Apply theme on initial load
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, []); // eslint-disable-line

    return (
        <ThemeContext.Provider value={{ theme, setTheme, wallpaper, setWallpaper }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
    return ctx;
};
