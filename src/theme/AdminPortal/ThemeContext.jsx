import React, { createContext, useContext, useState, useEffect } from "react";
import { ThemeProvider as StyledThemeProvider } from "styled-components";

const ThemeContext = createContext(undefined);

// Light theme
const lightTheme = {
  mode: "light",
  colors: {
    primary: "rgba(237, 139, 0, 1)",
    primaryHover: "#0056b3",
    secondary: "#6c757d",
    success: "#28a745",
    danger: "#dc3545",
    dangerHover: "#c82333",
    warning: "#ffc107",
    info: "#17a2b8",
    light: "#f8f9fa",
    dark: "#343a40",
    white: "#ffffff",
    black: "#000000",

    // Background colors
    background: "#ffffff",
    backgroundSecondary: "#f8f9fa",
    backgroundTertiary: "#e9ecef",

    // Text colors
    textPrimary: "#212529",
    textSecondary: "#6c757d",
    textMuted: "#adb5bd",

    // Border colors
    border: "rgba(237, 139, 0, 1)",
    borderHover: "#007bff",

    // Shadow colors
    shadow: "rgba(0, 0, 0, 0.1)",
    shadowHover: "rgba(0, 0, 0, 0.15)",

    // Sidebar colors
    sidebarBackground: "#292828",
    sidebarText: "#ffffff",
    sidebarTextSecondary: "#b3b3b3",
    sidebarBorder: "#404040",
  },

  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    xxl: "3rem",
  },

  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    xxl: "1.5rem",
    xxxl: "2rem",
  },

  fontFamily: {
    primary: "'Decimal', 'Segoe UI'",
    secondary: "'Decimal', 'Segoe UI'",
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  borderRadius: {
    none: "0",
    sm: "0.125rem",
    md: "0.25rem",
    lg: "0.5rem",
    xl: "0.75rem",
    xxl: "1rem",
    full: "50%",
  },

  shadows: {
    none: "none",
    sm: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
    md: "0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)",
  },

  transitions: {
    fast: "0.15s ease-in-out",
    normal: "0.3s ease-in-out",
    slow: "0.5s ease-in-out",
  },

  breakpoints: {
    xs: "0px",
    sm: "576px",
    md: "768px",
    lg: "992px",
    xl: "1200px",
    xxl: "1400px",
  },

  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

// Dark theme
const darkTheme = {
  ...lightTheme,
  mode: "dark",
  colors: {
    ...lightTheme.colors,
    primary: "#0d6efd",
    primaryHover: "#0b5ed7",

    // Background colors
    background: "#121212",
    backgroundSecondary: "#1e1e1e",
    backgroundTertiary: "#2d2d2d",

    // Text colors
    textPrimary: "#ffffff",
    textSecondary: "#b3b3b3",
    textMuted: "#6c757d",

    // Border colors
    border: "#404040",
    borderHover: "#0d6efd",

    // Shadow colors
    shadow: "rgba(0, 0, 0, 0.3)",
    shadowHover: "rgba(0, 0, 0, 0.4)",

    // Sidebar colors
    sidebarBackground: "#ffffff",
    sidebarText: "#212529",
    sidebarTextSecondary: "#6c757d",
    sidebarBorder: "#dee2e6",
  },
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });

  useEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  const value = {
    theme,
    isDarkMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
