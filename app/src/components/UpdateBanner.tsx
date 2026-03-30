import { motion, AnimatePresence } from "framer-motion";
import { Download, X, RefreshCw, Sparkles } from "lucide-react";
import { Button, Card } from "@heroui/react";

interface UpdateBannerProps {
	available: boolean;
	version: string | null;
	downloading: boolean;
	progress: number;
	onUpdate: () => void;
	onDismiss: () => void;
}

export function UpdateBanner({
	available,
	version,
	downloading,
	progress,
	onUpdate,
	onDismiss,
}: UpdateBannerProps) {
	return (
		<AnimatePresence>
			{available && (
				<motion.div
					initial={{ opacity: 0, y: -50 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -50 }}
					className="fixed top-0 left-0 right-0 z-50 p-3"
				>
					<Card className="backdrop-blur-xl shadow-2xl border border-telegram-primary/30 bg-telegram-primary/10">
						<Card.Content className="flex items-center justify-center gap-4 max-w-screen-lg mx-auto p-4">
							<Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />

							<span className="text-white font-medium">
								{downloading ? (
									<>Downloading update... {progress}%</>
								) : (
									<>A new version ({version}) is available!</>
								)}
							</span>

							{downloading ? (
								<div className="flex items-center gap-2">
									<RefreshCw className="w-4 h-4 text-white animate-spin" />
									<div className="w-32 h-2 bg-white/30 rounded-full overflow-hidden">
										<motion.div
											className="h-full bg-white rounded-full"
											initial={{ width: 0 }}
											animate={{ width: `${progress}%` }}
										/>
									</div>
								</div>
							) : (
								<Button
									variant="primary"
									onClick={onUpdate}
									className="flex items-center gap-2 px-4 py-1.5 font-semibold rounded-full shadow-md hover:scale-105"
								>
									<Download className="w-4 h-4" />
									Update Now
								</Button>
							)}

							{!downloading && (
								<Button
									variant="ghost"
									isIconOnly
									onClick={onDismiss}
									className="p-1 text-white/70 hover:text-white min-w-0 w-8 h-8"
								>
									<X className="w-4 h-4" />
								</Button>
							)}
						</Card.Content>
					</Card>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
