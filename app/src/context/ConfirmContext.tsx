import { createContext, useContext, useState, type ReactNode } from "react";
import { Modal, Button } from "@heroui/react";

interface ConfirmOptions {
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	variant?: "danger" | "info";
}

interface ConfirmContextType {
	confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
	const [isOpen, setIsOpen] = useState(false);
	const [options, setOptions] = useState<ConfirmOptions>({
		title: "",
		message: "",
	});
	const [resolveRef, setResolveRef] = useState<
		((value: boolean) => void) | null
	>(null);

	const confirm = (opts: ConfirmOptions) => {
		setOptions(opts);
		setIsOpen(true);
		return new Promise<boolean>((resolve) => {
			setResolveRef(() => resolve);
		});
	};

	const handleConfirm = () => {
		setIsOpen(false);
		if (resolveRef) resolveRef(true);
	};

	const handleCancel = () => {
		setIsOpen(false);
		if (resolveRef) resolveRef(false);
	};

	return (
		<ConfirmContext.Provider value={{ confirm }}>
			{children}
			<Modal isOpen={isOpen} onOpenChange={setIsOpen}>
				<Modal.Backdrop variant="blur">
					<Modal.Container>
						<Modal.Dialog>
							<Modal.Header>
								<Modal.Heading className="text-lg font-medium text-white">
									{options.title}
								</Modal.Heading>
							</Modal.Header>
							<Modal.Body>
								<p className="text-telegram-subtext text-sm whitespace-pre-line">
									{options.message}
								</p>
							</Modal.Body>
							<Modal.Footer className="flex justify-end gap-3">
								<Button
									variant="ghost"
									onClick={handleCancel}
									className="px-4 py-2 text-sm font-medium text-telegram-subtext"
								>
									{options.cancelText || "Cancel"}
								</Button>
								<Button
									variant={options.variant === "danger" ? "danger" : "primary"}
									onClick={handleConfirm}
									className="px-4 py-2 text-sm font-medium"
								>
									{options.confirmText || "Confirm"}
								</Button>
							</Modal.Footer>
						</Modal.Dialog>
					</Modal.Container>
				</Modal.Backdrop>
			</Modal>
		</ConfirmContext.Provider>
	);
}

export const useConfirm = () => {
	const context = useContext(ConfirmContext);
	if (!context)
		throw new Error("useConfirm must be used within a ConfirmProvider");
	return context;
};
