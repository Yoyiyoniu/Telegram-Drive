import { Card } from "@heroui/react";
import type { BandwidthStats } from "../../types";
import { formatBytes } from "../../utils";

interface BandwidthWidgetProps {
	bandwidth: BandwidthStats | null;
}

export function BandwidthWidget({ bandwidth }: BandwidthWidgetProps) {
	if (!bandwidth) return null;

	const totalBytes = bandwidth.up_bytes + bandwidth.down_bytes;
	const limit = 250 * 1024 * 1024 * 1024; // 250GB
	const percent = Math.min((totalBytes / limit) * 100, 100);

	return (
		<Card className="mt-3 text-xs text-telegram-subtext space-y-1 px-3 py-2 bg-black/20 border-white/10">
			<div className="flex justify-between">
				<span>Used Today:</span>
			</div>
			<div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
				<div
					className="bg-gradient-to-r from-telegram-primary to-telegram-secondary h-full rounded-full transition-all duration-500"
					style={{ width: `${percent}%` }}
				></div>
			</div>
			<div className="flex justify-between text-[10px] opacity-70">
				<span>{formatBytes(totalBytes)}</span>
				<span>250 GB</span>
			</div>
		</Card>
	);
}
