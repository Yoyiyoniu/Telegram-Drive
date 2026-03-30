import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { motion, AnimatePresence } from "framer-motion";
import {
	Phone,
	Key,
	Lock,
	ArrowRight,
	Settings,
	ShieldCheck,
	HelpCircle,
	ExternalLink,
} from "lucide-react";
import { load } from "@tauri-apps/plugin-store";
import {
	Button,
	Card,
	TextField,
	Label,
	Input,
	Modal,
	Spinner,
} from "@heroui/react";

type Step = "setup" | "phone" | "code" | "password";

export function AuthWizard({ onLogin }: { onLogin: () => void }) {
	const [step, setStep] = useState<Step>("setup");
	const [loading, setLoading] = useState(false);

	const [apiId, setApiId] = useState("");
	const [apiHash, setApiHash] = useState("");

	const [phone, setPhone] = useState("");
	const [code, setCode] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [floodWait, setFloodWait] = useState<number | null>(null);
	const [showHelp, setShowHelp] = useState(false);

	const isBrowser =
		typeof window !== "undefined" && !("__TAURI_INTERNALS__" in window);

	useEffect(() => {
		if (!floodWait) return;
		const interval = setInterval(() => {
			setFloodWait((prev) => {
				if (prev === null || prev <= 1) return null;
				return prev - 1;
			});
		}, 1000);
		return () => clearInterval(interval);
	}, [floodWait]);

	useEffect(() => {
		const initStore = async () => {
			try {
				const store = await load("config.json");
				const savedId = await store.get<string>("api_id");
				const savedHash = await store.get<string>("api_hash");

				if (savedId && savedHash) {
					setApiId(savedId);
					setApiHash(savedHash);
				}
			} catch {
				// config not found, starting fresh
			}
		};
		initStore();
	}, []);

	if (isBrowser) {
		return (
			<div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto p-8 text-center">
				<div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
					<ShieldCheck className="w-10 h-10 text-red-500" />
				</div>
				<h1 className="text-2xl font-bold text-white mb-4">
					Desktop App Required
				</h1>
				<p className="text-gray-400 mb-6 leading-relaxed">
					You are viewing the internal development server in a browser. This
					application cannot function here because it requires access to the
					system backend (Rust).
				</p>
				<Card className="p-4 text-sm text-gray-300">
					Please open the <strong>Penguin Drive</strong> window in your OS
					taskbar/dock to continue.
				</Card>
			</div>
		);
	}

	const saveCredentials = async () => {
		try {
			const store = await load("config.json");
			await store.set("api_id", apiId);
			await store.set("api_hash", apiHash);
			await store.save();
		} catch {
			// store write failure, non-critical
		}
	};

	const handleSetupSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!apiId || !apiHash) {
			setError("Both API ID and Hash are required.");
			return;
		}
		setError(null);
		await saveCredentials();
		setStep("phone");
	};

	const handlePhoneSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			const idInt = parseInt(apiId, 10);
			if (Number.isNaN(idInt)) throw new Error("API ID must be a number");

			await invoke("cmd_auth_request_code", {
				phone,
				apiId: idInt,
				apiHash: apiHash,
			});
			setStep("code");
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : JSON.stringify(err);
			if (msg.includes("FLOOD_WAIT_")) {
				const parts = msg.split("FLOOD_WAIT_");
				if (parts[1]) {
					const seconds = parseInt(parts[1]);
					if (!Number.isNaN(seconds)) {
						setFloodWait(seconds);
						return;
					}
				}
			}
			setError(msg);
		} finally {
			setLoading(false);
		}
	};

	const handleCodeSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			const res = await invoke<{ success: boolean; next_step?: string }>(
				"cmd_auth_sign_in",
				{ code },
			);
			if (res.success) {
				onLogin();
			} else if (res.next_step === "password") {
				setStep("password");
			} else {
				setError("Unknown error");
			}
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setLoading(false);
		}
	};

	const handlePasswordSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			const res = await invoke<{ success: boolean; next_step?: string }>(
				"cmd_auth_check_password",
				{ password },
			);
			if (res.success) {
				onLogin();
			} else {
				setError("Password verification failed.");
			}
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="h-full w-full bg-telegram-bg flex items-center justify-center p-6 relative overflow-hidden">
			{/* Circuit Board Pattern Background */}
			<div
				className="absolute inset-0 z-0 pointer-events-none circuit-pattern"
				style={{
					backgroundImage: `
                        repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255, 174, 0, 0.08) 19px, rgba(255, 174, 0, 0.08) 20px, transparent 20px, transparent 39px, rgba(255, 174, 0, 0.08) 39px, rgba(255, 174, 0, 0.08) 40px),
                        repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255, 174, 0, 0.08) 19px, rgba(255, 174, 0, 0.08) 20px, transparent 20px, transparent 39px, rgba(255, 174, 0, 0.08) 39px, rgba(255, 174, 0, 0.08) 40px),
                        radial-gradient(circle at 20px 20px, rgba(36, 129, 204, 0.12) 2px, transparent 2px),
                        radial-gradient(circle at 40px 40px, rgba(36, 129, 204, 0.12) 2px, transparent 2px)
                    `,
					backgroundSize: "40px 40px, 40px 40px, 40px 40px, 40px 40px",
				}}
			/>

			{/* Animated gradient orbs */}
			<div
				className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-telegram-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse"
				style={{ animationDuration: "8s" }}
			/>
			<div
				className="fixed bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-telegram-secondary/10 rounded-full blur-[100px] pointer-events-none animate-pulse"
				style={{ animationDuration: "10s" }}
			/>
			<div
				className="fixed top-[40%] right-[20%] w-[300px] h-[300px] bg-telegram-primary/8 rounded-full blur-[80px] pointer-events-none animate-pulse"
				style={{ animationDuration: "12s" }}
			/>

			<motion.div
				initial={{ opacity: 0, scale: 0.95, y: 20 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				className="relative z-10"
			>
				<Card className="p-8 w-full max-w-md backdrop-blur-md bg-black/20 border-white/10">
					<Card.Header className="text-center mb-8">
						<div className="w-20 h-20 mb-6 mx-auto flex items-center justify-center filter drop-shadow-lg">
							<img src="/logo.svg" alt="Logo" className="w-full h-full" />
						</div>
						<Card.Title className="text-2xl font-bold text-white mb-1 tracking-tight">
							Penguin Drive
						</Card.Title>
						<Card.Description className="text-sm text-white/60 font-medium">
							Self-Hosted Secure Storage
						</Card.Description>
					</Card.Header>

					<Card.Content>
						<AnimatePresence mode="wait">
							{floodWait ? (
								<motion.div
									key="flood"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className="text-center space-y-6"
								>
									<div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
										<span className="text-2xl">⏳</span>
									</div>
									<div>
										<h2 className="text-xl font-bold text-white mb-2">
											Too Many Requests
										</h2>
										<p className="text-sm text-gray-400">
											Telegram has temporarily limited your actions.
										</p>
										<p className="text-sm text-gray-400">
											Please wait before trying again.
										</p>
									</div>

									<div className="text-5xl font-mono items-center justify-center flex text-blue-400 font-bold">
										{Math.floor(floodWait / 60)}:
										{(floodWait % 60).toString().padStart(2, "0")}
									</div>

									<p className="text-xs text-red-400/60 mt-4">
										Do not restart the app. The timer will reset if you do.
									</p>
								</motion.div>
							) : (
								<>
									{step === "setup" && (
										<motion.form
											key="setup"
											initial={{ x: 20, opacity: 0 }}
											animate={{ x: 0, opacity: 1 }}
											exit={{ x: -20, opacity: 0 }}
											onSubmit={handleSetupSubmit}
											className="space-y-5"
										>
											<div className="space-y-4">
												<TextField name="apiId" type="text">
													<Label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
														API ID
													</Label>
													<div className="relative">
														<Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/80 z-10" />
														<Input
															value={apiId}
															onChange={(e) => setApiId(e.target.value)}
															placeholder="12345678"
															className="w-full rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-600 bg-black/20 border-white/10 backdrop-blur-sm"
														/>
													</div>
												</TextField>
												<TextField name="apiHash" type="text">
													<Label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
														API Hash
													</Label>
													<div className="relative">
														<Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/80 z-10" />
														<Input
															value={apiHash}
															onChange={(e) => setApiHash(e.target.value)}
															placeholder="abcdef123456..."
															className="w-full rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-600 bg-black/20 border-white/10 backdrop-blur-sm"
														/>
													</div>
												</TextField>
											</div>

											<Button
												type="submit"
												variant="primary"
												className="w-full py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
											>
												Configure <Settings className="w-4 h-4" />
											</Button>

											<Button
												type="button"
												variant="ghost"
												onClick={() => setShowHelp(true)}
												className="w-full text-xs text-blue-300 hover:text-telegram-primary transition-colors flex items-center justify-center gap-1.5 py-1"
											>
												<HelpCircle className="w-3 h-3" />
												How do I get my API credentials?
											</Button>

											{import.meta.env.DEV && (
												<Button
													type="button"
													variant="ghost"
													onClick={() => onLogin()}
													className="w-full text-xs text-red-400/60 hover:text-red-300 transition-colors py-1"
												>
													Dev Mode
												</Button>
											)}
										</motion.form>
									)}

									{step === "phone" && (
										<motion.form
											key="phone"
											initial={{ x: 20, opacity: 0 }}
											animate={{ x: 0, opacity: 1 }}
											exit={{ x: -20, opacity: 0 }}
											onSubmit={handlePhoneSubmit}
											className="space-y-6"
										>
											<TextField name="phone" type="tel">
												<Label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
													Phone Number
												</Label>
												<div className="relative">
													<Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/80 z-10" />
													<Input
														value={phone}
														onChange={(e) => setPhone(e.target.value)}
														placeholder="+1 234 567 8900"
														className="w-full rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-600 bg-black/20 border-white/10 backdrop-blur-sm text-lg tracking-wide"
													/>
												</div>
											</TextField>

											<div className="flex flex-col gap-3">
												<Button
													type="submit"
													variant="primary"
													isPending={loading}
													className="w-full py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
												>
													{({ isPending }) => (
														<>
															{isPending ? (
																<Spinner color="current" size="sm" />
															) : (
																<ArrowRight className="w-5 h-5" />
															)}
															{isPending ? "Connecting..." : "Continue"}
														</>
													)}
												</Button>
												<Button
													type="button"
													variant="ghost"
													onClick={() => setStep("setup")}
													className="text-xs text-gray-500 hover:text-white transition-colors py-2"
												>
													Back to Configuration
												</Button>
											</div>
										</motion.form>
									)}

									{step === "code" && (
										<motion.form
											key="code"
											initial={{ x: 20, opacity: 0 }}
											animate={{ x: 0, opacity: 1 }}
											exit={{ x: -20, opacity: 0 }}
											onSubmit={handleCodeSubmit}
											className="space-y-6"
										>
											<TextField name="code" type="text">
												<Label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
													Telegram Code
												</Label>
												<div className="relative">
													<Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/80 z-10" />
													<Input
														value={code}
														onChange={(e) => setCode(e.target.value)}
														placeholder="1 2 3 4 5"
														className="w-full rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-600 bg-black/20 border-white/10 backdrop-blur-sm text-2xl tracking-[0.5em] font-mono text-center"
													/>
												</div>
											</TextField>

											<div className="flex flex-col gap-3">
												<Button
													type="submit"
													variant="primary"
													isPending={loading}
													className="w-full py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
												>
													{({ isPending }) => (
														<>
															{isPending && (
																<Spinner color="current" size="sm" />
															)}
															{isPending ? "Verifying..." : "Sign In"}
														</>
													)}
												</Button>
												<Button
													type="button"
													variant="ghost"
													onClick={() => setStep("phone")}
													className="text-xs text-gray-500 hover:text-white transition-colors py-2"
												>
													Change Phone Number
												</Button>
											</div>
										</motion.form>
									)}

									{step === "password" && (
										<motion.form
											key="password"
											initial={{ x: 20, opacity: 0 }}
											animate={{ x: 0, opacity: 1 }}
											exit={{ x: -20, opacity: 0 }}
											onSubmit={handlePasswordSubmit}
											className="space-y-6"
										>
											<div className="space-y-2">
												<Card className="p-3 mb-4 border border-blue-500/20 bg-blue-500/10">
													<p className="text-xs text-blue-300 text-center">
														Your account has Two-Factor Authentication enabled.
														Please enter your cloud password to continue.
													</p>
												</Card>
												<TextField name="password" type="password">
													<Label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
														Cloud Password
													</Label>
													<div className="relative">
														<Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/80 z-10" />
														<Input
															value={password}
															onChange={(e) => setPassword(e.target.value)}
															placeholder="Enter your password"
															className="w-full rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-600 bg-black/20 border-white/10 backdrop-blur-sm text-lg"
														/>
													</div>
												</TextField>
											</div>

											<div className="flex flex-col gap-3">
												<Button
													type="submit"
													variant="primary"
													isPending={loading}
													isDisabled={!password}
													className="w-full py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
												>
													{({ isPending }) => (
														<>
															{isPending && (
																<Spinner color="current" size="sm" />
															)}
															{isPending ? "Verifying..." : "Unlock"}
														</>
													)}
												</Button>
												<Button
													type="button"
													variant="ghost"
													onClick={() => {
														setStep("code");
														setPassword("");
														setError(null);
													}}
													className="text-xs text-gray-500 hover:text-white transition-colors py-2"
												>
													Back to Code Entry
												</Button>
											</div>
										</motion.form>
									)}
								</>
							)}
						</AnimatePresence>

						{error && (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								className="mt-6"
							>
								<Card className="p-4 flex items-start gap-3 border border-red-500/20 bg-red-500/10">
									<div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
									<p className="text-red-400 text-sm leading-snug">{error}</p>
								</Card>
							</motion.div>
						)}
					</Card.Content>
				</Card>
			</motion.div>

			<Modal isOpen={showHelp} onOpenChange={setShowHelp}>
				<Modal.Backdrop variant="blur">
					<Modal.Container>
						<Modal.Dialog>
							<Modal.CloseTrigger />
							<Modal.Header>
								<Modal.Heading className="text-xl font-bold text-white">
									Getting Started
								</Modal.Heading>
							</Modal.Header>
							<Modal.Body className="space-y-6 text-white">
								<Card className="p-4 border border-telegram-primary/20 bg-telegram-primary/10">
									<p className="text-sm text-telegram-subtext">
										<strong className="text-telegram-primary">
											Penguin Drive
										</strong>{" "}
										uses your Telegram account as secure cloud storage. You'll
										need a Telegram account and API credentials to get started.
									</p>
								</Card>

								<div className="space-y-4">
									<h3 className="font-semibold flex items-center gap-2">
										<span className="w-6 h-6 bg-telegram-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
											1
										</span>
										Go to Telegram's Developer Portal
									</h3>
									<p className="text-sm text-telegram-subtext ml-8">
										Visit{" "}
										<a
											href="https://my.telegram.org"
											target="_blank"
											rel="noreferrer"
											className="text-telegram-primary underline hover:text-white"
										>
											my.telegram.org
										</a>{" "}
										and log in with your phone number.
									</p>
								</div>

								<div className="space-y-4">
									<h3 className="font-semibold flex items-center gap-2">
										<span className="w-6 h-6 bg-telegram-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
											2
										</span>
										Create a New Application
									</h3>
									<p className="text-sm text-telegram-subtext ml-8">
										Click on <strong>"API development tools"</strong> and create
										a new application. Use any name and description you like.
									</p>
								</div>

								<div className="space-y-4">
									<h3 className="font-semibold flex items-center gap-2">
										<span className="w-6 h-6 bg-telegram-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
											3
										</span>
										Copy Your Credentials
									</h3>
									<p className="text-sm text-telegram-subtext ml-8">
										After creating the app, you'll see your{" "}
										<strong>API ID</strong> (a number) and{" "}
										<strong>API Hash</strong> (a string). Copy both and paste
										them into the fields on the previous screen.
									</p>
								</div>

								<Card className="p-4 border border-white/10 bg-white/5">
									<p className="text-xs text-telegram-subtext">
										<strong>🔒 Privacy:</strong> Your credentials are stored
										locally on your device and are never sent to any third-party
										servers. All data goes directly between you and Telegram.
									</p>
								</Card>
							</Modal.Body>
							<Modal.Footer>
								<Button
									variant="primary"
									className="w-full py-3 rounded-xl flex items-center justify-center gap-2"
									onClick={() =>
										window.open("https://my.telegram.org", "_blank")
									}
								>
									<ExternalLink className="w-4 h-4" />
									Open my.telegram.org
								</Button>
							</Modal.Footer>
						</Modal.Dialog>
					</Modal.Container>
				</Modal.Backdrop>
			</Modal>
		</div>
	);
}
