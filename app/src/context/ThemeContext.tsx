import { createContext, useContext, ReactNode, useLayoutEffect } from "react";

interface ThemeContextType {
	theme: "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Apply dark theme to DOM immediately
function applyDarkTheme() {
	const root = document.documentElement;
	root.classList.add("dark");
	root.classList.remove("light");
}

// Apply theme immediately on script load
if (typeof window !== "undefined") {
	applyDarkTheme();
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	// Ensure dark theme is always applied
	useLayoutEffect(() => {
		applyDarkTheme();
	}, []);

	return (
		<ThemeContext.Provider value={{ theme: "dark" }}>
			{children}
		</ThemeContext.Provider>
	);
}

export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (!context) throw new Error("useTheme must be used within a ThemeProvider");
	return context;
};
