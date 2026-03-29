import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Folder, Eye, Trash2, Download } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import type { TelegramFile } from "../../types";
import { FileTypeIcon } from "../FileTypeIcon";

interface FileCardProps {
	file: TelegramFile;
	onDelete: () => void;
	onDownload: () => void;
	onPreview?: () => void;
	isSelected: boolean;
	onClick?: (e: React.MouseEvent) => void;
	onContextMenu?: (e: React.MouseEvent) => void;
	onDrop?: (e: React.DragEvent, folderId: number) => void;
	onDragStart?: (fileId: number) => void;
	onDragEnd?: () => void;
	activeFolderId?: number | null;
	height?: number;
}

// Check if file is an image type that can have a thumbnail
function isImageFile(filename: string): boolean {
	const ext = filename.split(".").pop()?.toLowerCase() || "";
	return ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext);
}

export function FileCard({
	file,
	onDelete,
	onDownload,
	onPreview,
	isSelected,
	onClick,
	onContextMenu,
	onDrop,
	onDragStart,
	onDragEnd,
	activeFolderId,
	height,
}: FileCardProps) {
	const isFolder = file.type === "folder";
	const [isDragOver, setIsDragOver] = useState(false);
	const [thumbnail, setThumbnail] = useState<string | null>(null);
	const [thumbnailLoading, setThumbnailLoading] = useState(false);

	// Lazy load thumbnail for image files
	useEffect(() => {
		if (isFolder || !isImageFile(file.name)) return;

		let cancelled = false;
		setThumbnailLoading(true);

		invoke<string>("cmd_get_thumbnail", {
			messageId: file.id,
			folderId: activeFolderId,
		})
			.then((result) => {
				if (!cancelled && result) {
					setThumbnail(result);
				}
			})
			.catch(() => {
				// Silently fail - will show icon instead
			})
			.finally(() => {
				if (!cancelled) setThumbnailLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [file.id, file.name, activeFolderId, isFolder]);

	return (
		<div
			className="relative"
			onContextMenu={onContextMenu}
			onClick={onClick}
			onDragOver={(e) => {
				if (isFolder) {
					e.preventDefault();
					e.stopPropagation();
					if (!isDragOver) setIsDragOver(true);
				}
			}}
			onDragLeave={(e) => {
				if (isFolder) {
					e.preventDefault();
					e.stopPropagation();
					setIsDragOver(false);
				}
			}}
			onDrop={(e) => {
				if (isFolder && onDrop) {
					e.preventDefault();
					e.stopPropagation();
					setIsDragOver(false);
					onDrop(e, file.id);
				}
			}}
		>
			<motion.div
				layout
				draggable={!isFolder}
				onDragStart={(e: React.DragEvent) => {
					if (onDragStart) onDragStart(file.id);
					e.dataTransfer.setData(
						"application/x-telegram-file-id",
						file.id.toString(),
					);
					e.dataTransfer.effectAllowed = "move";
				}}
				onDragEnd={() => {
					if (onDragEnd) onDragEnd();
				}}
				whileHover={{ y: -4, scale: 1.02 }}
				className={`group cursor-pointer glass-card rounded-xl overflow-hidden transition-all relative
                ${isSelected ? "border-telegram-primary bg-telegram-primary/10 ring-2 ring-telegram-primary/50 glow-primary" : "hover:border-telegram-primary/30"}
                ${isDragOver ? "ring-2 ring-telegram-primary bg-telegram-primary/20 scale-105 glow-primary" : ""}`}
				style={height ? { height: `${height}px` } : { aspectRatio: "4/3" }}
			>
				{/* Thumbnail or Icon */}
				{thumbnail ? (
					<div className="absolute inset-0">
						<img
							src={thumbnail}
							alt={file.name}
							className="w-full h-full object-cover"
						/>
						{/* Gradient overlay for text readability */}
						<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
					</div>
				) : (
					<div className="absolute inset-0 flex items-center justify-center p-4">
						{isFolder ? (
							<Folder className="w-12 h-12 text-telegram-primary drop-shadow-lg" />
						) : thumbnailLoading && isImageFile(file.name) ? (
							<div className="w-8 h-8 border-2 border-telegram-primary/30 border-t-telegram-primary rounded-full animate-spin" />
						) : (
							<FileTypeIcon filename={file.name} size="lg" />
						)}
					</div>
				)}

				{/* Selection Checkmark */}
				<div
					className={`absolute top-2 left-2 w-5 h-5 rounded-full border flex items-center justify-center transition-all z-10 backdrop-blur-sm ${isSelected ? "bg-telegram-primary border-telegram-primary shadow-lg shadow-telegram-primary/50" : "border-white/30 bg-black/20 opacity-0 group-hover:opacity-100"}`}
				>
					{isSelected && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
				</div>

				{/* File info overlay at bottom */}
				<div
					className={`absolute bottom-0 left-0 right-0 p-3 ${thumbnail ? "text-white" : "text-telegram-text"}`}
				>
					<h3 className="text-sm font-medium truncate w-full" title={file.name}>
						{file.name}
					</h3>
					<p
						className={`text-xs mt-0.5 ${thumbnail ? "text-white/70" : "text-telegram-subtext"}`}
					>
						{file.sizeStr}
					</p>
				</div>

				{/* Quick actions on hover */}
				<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all flex gap-1 z-10">
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							if (onPreview) onPreview();
						}}
						className="p-1.5 glass rounded-full hover:bg-telegram-primary/30 hover:text-telegram-primary text-white/80 transition-all hover:scale-110"
						title="Preview"
					>
						<Eye className="w-3.5 h-3.5" />
					</button>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onDownload();
						}}
						className="p-1.5 glass rounded-full hover:bg-green-500/30 hover:text-green-400 text-white/80 transition-all hover:scale-110"
						title="Download"
					>
						<Download className="w-3.5 h-3.5" />
					</button>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onDelete();
						}}
						className="p-1.5 glass rounded-full hover:bg-red-500/30 hover:text-red-400 text-white/80 transition-all hover:scale-110"
						title="Delete"
					>
						<Trash2 className="w-3.5 h-3.5" />
					</button>
				</div>
			</motion.div>
		</div>
	);
}
