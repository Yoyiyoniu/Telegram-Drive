import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { load } from "@tauri-apps/plugin-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthWizard } from "./components/AuthWizard";
import { Dashboard } from "./components/Dashboard";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { UpdateBanner } from "./components/UpdateBanner";
import { useUpdateCheck } from "./hooks/useUpdateCheck";
import "./App.css";

import { Toaster } from "sonner";
import { ConfirmProvider } from "./context/ConfirmContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { DropZoneProvider } from "./contexts/DropZoneContext";

const queryClient = new QueryClient();

function AppContent() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);
	const { theme } = useTheme();
	const {
		available,
		version,
		downloading,
		progress,
		downloadAndInstall,
		dismissUpdate,
	} = useUpdateCheck();

	// Check for existing session on app startup
	useEffect(() => {
		const checkExistingSession = async () => {
			try {
				const store = await load("config.json");
				const apiIdStr = await store.get<string>("api_id");

				if (apiIdStr) {
					const apiId = parseInt(apiIdStr);
					// Try to connect with saved credentials
					await invoke("cmd_connect", { apiId });
					// Verify connection is working
					const isConnected = await invoke<boolean>("cmd_check_connection");
					if (isConnected) {
						setIsAuthenticated(true);
					}
				}
			} catch (error) {
				console.log("No existing session found:", error);
			} finally {
				setIsCheckingAuth(false);
			}
		};

		checkExistingSession();
	}, []);

	if (isCheckingAuth) {
		return (
			<div className="h-screen w-screen flex items-center justify-center">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-gray-400">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<main className="h-screen w-screen text-telegram-text overflow-hidden selection:bg-telegram-primary/30 relative">
			<UpdateBanner
				available={available}
				version={version}
				downloading={downloading}
				progress={progress}
				onUpdate={downloadAndInstall}
				onDismiss={dismissUpdate}
			/>
			<Toaster theme={theme} position="bottom-center" />
			{isAuthenticated ? (
				<Dashboard onLogout={() => setIsAuthenticated(false)} />
			) : (
				<AuthWizard onLogin={() => setIsAuthenticated(true)} />
			)}
		</main>
	);
}

function App() {
	return (
		<ErrorBoundary>
			<ThemeProvider>
				<QueryClientProvider client={queryClient}>
					<ConfirmProvider>
						<DropZoneProvider>
							<AppContent />
						</DropZoneProvider>
					</ConfirmProvider>
				</QueryClientProvider>
			</ThemeProvider>
		</ErrorBoundary>
	);
}

export default App;
