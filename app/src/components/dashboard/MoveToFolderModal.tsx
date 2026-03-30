import { HardDrive, Folder } from "lucide-react";
import { Modal, Button } from "@heroui/react";
import type { TelegramFolder } from "../../types";

interface MoveToFolderModalProps {
	folders: TelegramFolder[];
	onClose: () => void;
	onSelect: (id: number | null) => void;
	activeFolderId: number | null;
}

export function MoveToFolderModal({
	folders,
	onClose,
	onSelect,
	activeFolderId,
}: MoveToFolderModalProps) {
	return (
		<Modal isOpen={true} onOpenChange={onClose}>
			<Modal.Backdrop variant="blur">
				<Modal.Container>
					<Modal.Dialog>
						<Modal.CloseTrigger />
						<Modal.Header>
							<Modal.Heading className="text-telegram-text font-medium">
								Move to Folder
							</Modal.Heading>
						</Modal.Header>
						<Modal.Body className="flex-1 overflow-y-auto space-y-1 max-h-[60vh]">
							{activeFolderId !== null && (
								<Button
									variant="ghost"
									onClick={() => onSelect(null)}
									className="w-full flex items-center gap-3 px-3 py-3 text-sm text-left justify-start"
								>
									<div className="w-8 h-8 rounded bg-telegram-primary/20 flex items-center justify-center text-telegram-primary">
										<HardDrive className="w-4 h-4" />
									</div>
									<span className="font-medium">Saved Messages</span>
								</Button>
							)}

							{folders.map((f) => {
								if (f.id === activeFolderId) return null;
								return (
									<Button
										key={f.id}
										variant="ghost"
										onClick={() => onSelect(f.id)}
										className="w-full flex items-center gap-3 px-3 py-3 text-sm text-left justify-start"
									>
										<div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-telegram-text">
											<Folder className="w-4 h-4" />
										</div>
										<span className="font-medium">{f.name}</span>
									</Button>
								);
							})}

							{folders.length === 0 && activeFolderId === null && (
								<div className="p-4 text-center text-xs text-telegram-subtext">
									No other folders available. Create one first!
								</div>
							)}
						</Modal.Body>
					</Modal.Dialog>
				</Modal.Container>
			</Modal.Backdrop>
		</Modal>
	);
}
