import { HardDrive, LayoutGrid } from "lucide-react";

interface TopBarProps {
	currentFolderName: string;
	selectedIds: number[];
	onShowMoveModal: () => void;
	onBulkDownload: () => void;
	onBulkDelete: () => void;
	onDownloadFolder: () => void;
	viewMode: "grid" | "list";
	setViewMode: (mode: "grid" | "list") => void;
	searchTerm: string;
	onSearchChange: (term: string) => void;
}

export function TopBar({
	currentFolderName,
	selectedIds,
	onShowMoveModal,
	onBulkDownload,
	onBulkDelete,
	onDownloadFolder,
	viewMode,
	setViewMode,
	searchTerm,
	onSearchChange,
}: TopBarProps) {
	return (
		<div
			className="h-14 border-b border-telegram-border flex items-center px-4 justify-between glass-sidebar sticky top-0 z-10 glass-shimmer"
			onClick={(e) => e.stopPropagation()}
		>
			<div className="flex items-center gap-4">
				<div className="flex items-center text-sm breadcrumbs text-telegram-subtext select-none">
					<span className="hover:text-telegram-text cursor-pointer transition-colors">
						Start
					</span>
					<span className="mx-2">/</span>
					<span className="text-telegram-text font-medium">
						{currentFolderName}
					</span>
				</div>
			</div>

			<div className="flex-1 max-w-md mx-4">
				<input
					type="text"
					placeholder="Search files..."
					className="w-full glass-input rounded-lg px-3 py-1.5 text-sm text-telegram-text placeholder:text-telegram-subtext focus:outline-none transition-all"
					value={searchTerm}
					onChange={(e) => onSearchChange(e.target.value)}
				/>
			</div>

			<div className="flex items-center gap-2">
				{selectedIds.length > 0 && (
					<div className="flex items-center gap-2 mr-4 animate-in fade-in slide-in-from-top-2">
						<span className="text-xs text-telegram-subtext mr-2">
							{selectedIds.length} Selected
						</span>
						<button
							type="button"
							onClick={onShowMoveModal}
							className="px-3 py-1.5 glass-button rounded-lg text-xs transition font-medium text-telegram-primary"
						>
							Move to...
						</button>
						<button
							type="button"
							onClick={onBulkDownload}
							className="px-3 py-1.5 glass rounded-lg text-xs text-telegram-text transition hover:bg-white/10"
						>
							Download Selected
						</button>
						<button
							type="button"
							onClick={onBulkDelete}
							className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs transition backdrop-blur-sm border border-red-500/20"
						>
							Delete
						</button>
					</div>
				)}

				<button
					type="button"
					onClick={onDownloadFolder}
					className="p-2 hover:bg-telegram-hover rounded-lg text-telegram-subtext hover:text-telegram-primary transition group relative"
					title="Download Folder"
				>
					<HardDrive className="w-5 h-5" />
				</button>

				<button
					type="button"
					onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
					className="p-2 hover:bg-telegram-hover rounded-lg text-telegram-subtext hover:text-telegram-primary transition relative group"
					title="Toggle Layout"
				>
					<LayoutGrid className="w-5 h-5" />
					<span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] glass px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
						{viewMode === "grid" ? "Switch to List" : "Switch to Grid"}
					</span>
				</button>
			</div>
		</div>
	);
}
