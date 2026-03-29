import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react";

export function DragDropOverlay() {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center pointer-events-none"
		>
			<motion.div
				initial={{ scale: 0.9, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0.9, opacity: 0 }}
				className="glass-card text-telegram-text rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl border-telegram-primary/50"
			>
				<div className="p-4 bg-telegram-primary/10 rounded-full animate-pulse">
					<UploadCloud className="w-12 h-12 text-telegram-primary animate-bounce" />
				</div>
				<div className="text-center">
					<h3 className="text-xl font-bold text-telegram-text">
						Drop files to upload
					</h3>
					<p className="text-telegram-subtext text-sm mt-1">
						Files will be uploaded to the current folder
					</p>
				</div>
			</motion.div>
		</motion.div>
	);
}
