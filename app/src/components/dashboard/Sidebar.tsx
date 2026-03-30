import { useState } from "react";
import { HardDrive, Folder, Plus, RefreshCw, LogOut } from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import { BandwidthWidget } from "./BandwidthWidget";
import type { TelegramFolder, BandwidthStats } from "../../types";

interface SidebarProps {
	folders: TelegramFolder[];
	activeFolderId: number | null;
	setActiveFolderId: (id: number | null) => void;
	onDrop: (e: React.DragEvent, folderId: number | null) => void;
	onDelete: (id: number, name: string) => void;
	onCreate: (name: string) => Promise<void>;
	isSyncing: boolean;
	isConnected: boolean;
	onSync: () => void;
	onLogout: () => void;
	bandwidth: BandwidthStats | null;
}

export function Sidebar({
	folders,
	activeFolderId,
	setActiveFolderId,
	onDrop,
	onDelete,
	onCreate,
	isSyncing,
	isConnected,
	onSync,
	onLogout,
	bandwidth,
}: SidebarProps) {
	const [showNewFolderInput, setShowNewFolderInput] = useState(false);
	const [newFolderName, setNewFolderName] = useState("");

	const submitCreate = async () => {
		if (!newFolderName.trim()) return;
		try {
			await onCreate(newFolderName);
			setNewFolderName("");
			setShowNewFolderInput(false);
		} catch {
			// handled by parent
		}
	};

	return (
		<div className="w-64 glass-sidebar flex flex-col relative overflow-hidden">
			{/* Decorative gradient orbs */}
			<div className="absolute top-10 -left-10 w-32 h-32 bg-telegram-primary/10 rounded-full blur-3xl pointer-events-none"></div>
			<div className="absolute bottom-20 -right-10 w-40 h-40 bg-telegram-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

			<div className="p-4 flex items-center gap-2 relative z-10">
				<img src="/logo.svg" className="w-8 h-8 drop-shadow-lg" alt="Logo" />
				<span className="font-bold text-lg text-telegram-text tracking-tight">
					Penguin Drive
				</span>
			</div>

			<nav className="flex-1 px-2 py-4 space-y-1 relative z-10">
				<SidebarItem
					icon={HardDrive}
					label="Saved Messages"
					active={activeFolderId === null}
					onClick={() => setActiveFolderId(null)}
					onDrop={(e: React.DragEvent) => onDrop(e, null)}
					folderId={null}
				/>
				{folders.map((folder) => (
					<SidebarItem
						key={folder.id}
						icon={Folder}
						label={folder.name}
						active={activeFolderId === folder.id}
						onClick={() => setActiveFolderId(folder.id)}
						onDrop={(e: React.DragEvent) => onDrop(e, folder.id)}
						onDelete={() => onDelete(folder.id, folder.name)}
						folderId={folder.id}
					/>
				))}

				{showNewFolderInput ? (
					<div className="px-3 py-2">
						<input
							type="text"
							className="w-full glass-input rounded-lg px-2 py-1 text-sm text-white focus:outline-none transition-all"
							placeholder="Folder Name"
							value={newFolderName}
							onChange={(e) => setNewFolderName(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && submitCreate()}
							onBlur={() => !newFolderName && setShowNewFolderInput(false)}
						/>
					</div>
				) : (
					<button
						type="button"
						onClick={() => setShowNewFolderInput(true)}
						className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-telegram-subtext hover:bg-telegram-hover hover:text-telegram-text transition-colors border border-dashed border-telegram-border mt-2 backdrop-blur-sm"
					>
						<Plus className="w-4 h-4" />
						Create Folder
					</button>
				)}
			</nav>

			<div className="p-4 border-t border-telegram-border relative z-10">
				<div className="flex items-center gap-2 text-telegram-subtext text-xs glass px-3 py-2 rounded-lg">
					<div
						className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse glow-primary" : "bg-red-500"}`}
					></div>
					<span>
						{isConnected
							? "Connected to Telegram"
							: "Disconnected from Telegram"}
					</span>
				</div>

				<div className="flex gap-2 mt-4">
					<button
						type="button"
						onClick={onSync}
						disabled={isSyncing}
						className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-blue-400 bg-blue-500/15 hover:bg-blue-500/25 rounded-lg transition-all backdrop-blur-sm border border-blue-500/20 ${isSyncing ? "opacity-50 cursor-not-allowed" : "hover:glow-secondary"}`}
						title="Scan for existing folders"
					>
						<RefreshCw
							className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`}
						/>
						{isSyncing ? "Syncing..." : "Sync"}
					</button>
					<button
						type="button"
						onClick={onLogout}
						className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-400 bg-red-500/15 hover:bg-red-500/25 rounded-lg transition-all backdrop-blur-sm border border-red-500/20"
						title="Sign Out"
					>
						<LogOut className="w-3 h-3" />
						Logout
					</button>
				</div>

				{bandwidth && <BandwidthWidget bandwidth={bandwidth} />}
			</div>
		</div>
	);
}
