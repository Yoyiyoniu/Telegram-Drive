import { HardDrive, LayoutGrid } from "lucide-react";
import { Button, TextField, Input, Tooltip } from "@heroui/react";

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
		<div className="h-14 border-b border-white/10 flex items-center px-4 justify-between backdrop-blur-md bg-black/20 sticky top-0 z-10">
			<div className="flex items-center gap-4">
				<div className="flex items-center text-sm text-telegram-subtext select-none">
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
				<TextField name="search" type="text">
					<Input
						placeholder="Search files..."
						className="w-full rounded-lg px-3 py-1.5 text-sm text-telegram-text placeholder:text-telegram-subtext bg-black/20 border-white/10 backdrop-blur-sm"
						value={searchTerm}
						onChange={(e) => onSearchChange(e.target.value)}
					/>
				</TextField>
			</div>

			<div className="flex items-center gap-2">
				{selectedIds.length > 0 && (
					<div className="flex items-center gap-2 mr-4 animate-in fade-in slide-in-from-top-2">
						<span className="text-xs text-telegram-subtext mr-2">
							{selectedIds.length} Selected
						</span>
						<Button
							variant="primary"
							size="sm"
							onClick={onShowMoveModal}
							className="px-3 py-1.5 text-xs"
						>
							Move to...
						</Button>
						<Button
							variant="secondary"
							size="sm"
							onClick={onBulkDownload}
							className="px-3 py-1.5 text-xs"
						>
							Download Selected
						</Button>
						<Button
							variant="danger-soft"
							size="sm"
							onClick={onBulkDelete}
							className="px-3 py-1.5 text-xs"
						>
							Delete
						</Button>
					</div>
				)}

				<Tooltip delay={0}>
					<Tooltip.Trigger>
						<Button
							variant="ghost"
							isIconOnly
							onClick={onDownloadFolder}
							className="p-2 text-telegram-subtext hover:text-telegram-primary"
						>
							<HardDrive className="w-5 h-5" />
						</Button>
					</Tooltip.Trigger>
					<Tooltip.Content>
						<p>Download Folder</p>
					</Tooltip.Content>
				</Tooltip>

				<Tooltip delay={0}>
					<Tooltip.Trigger>
						<Button
							variant="ghost"
							isIconOnly
							onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
							className="p-2 text-telegram-subtext hover:text-telegram-primary"
						>
							<LayoutGrid className="w-5 h-5" />
						</Button>
					</Tooltip.Trigger>
					<Tooltip.Content>
						<p>{viewMode === "grid" ? "Switch to List" : "Switch to Grid"}</p>
					</Tooltip.Content>
				</Tooltip>
			</div>
		</div>
	);
}
