"use client";
import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, CheckCircle, AlertCircle } from "lucide-react";
import { DragDropCanvasQuestion } from "@/types/questions";

interface DragDropCanvasRendererProps {
	question: DragDropCanvasQuestion;
	onAnswer: (answer: any) => void;
	isAnswered: boolean;
	userAnswer?: { itemId: string; zoneId: string; x: number; y: number }[];
	showFeedback?: boolean;
	disabled?: boolean;
}

interface DraggedItem {
	id: string;
	content: string;
	type: "text" | "image" | "icon";
	src?: string;
	x: number;
	y: number;
	zoneId?: string;
}

export function DragDropCanvasRenderer({ question, onAnswer, isAnswered, userAnswer, showFeedback = false, disabled = false }: DragDropCanvasRendererProps) {
	const canvasRef = useRef<HTMLDivElement>(null);
	const [draggedItems, setDraggedItems] = useState<DraggedItem[]>([]);
	const [dragging, setDragging] = useState<string | null>(null);
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

	// Initialize dragged items from user answer or set default positions
	useState(() => {
		if (userAnswer) {
			const initialItems = userAnswer
				.map((placement) => {
					const item = question.draggableItems.find((i) => i.id === placement.itemId);
					return item
						? {
								...item,
								x: placement.x,
								y: placement.y,
								zoneId: placement.zoneId,
						  }
						: null;
				})
				.filter(Boolean) as DraggedItem[];
			setDraggedItems(initialItems);
		} else {
			// Set initial positions for draggable items (outside canvas)
			const initialItems = question.draggableItems.map((item, index) => ({
				...item,
				x: 20,
				y: 50 + index * 70, // Stack items vertically
				zoneId: undefined,
			}));
			setDraggedItems(initialItems);
		}
	});

	const handleMouseDown = useCallback(
		(e: React.MouseEvent, itemId: string) => {
			if (disabled || isAnswered) return;

			const rect = e.currentTarget.getBoundingClientRect();
			setDragging(itemId);
			setDragOffset({
				x: e.clientX - rect.left,
				y: e.clientY - rect.top,
			});
			e.preventDefault();
		},
		[disabled, isAnswered]
	);

	const handleMouseMove = useCallback(
		(e: React.MouseEvent) => {
			if (!dragging || !canvasRef.current) return;

			const canvasRect = canvasRef.current.getBoundingClientRect();
			const x = e.clientX - canvasRect.left - dragOffset.x;
			const y = e.clientY - canvasRect.top - dragOffset.y;

			setDraggedItems((prev) => prev.map((item) => (item.id === dragging ? { ...item, x: Math.max(0, Math.min(x, question.canvas.width - 60)), y: Math.max(0, Math.min(y, question.canvas.height - 40)) } : item)));
		},
		[dragging, dragOffset, question.canvas.width, question.canvas.height]
	);

	const handleMouseUp = useCallback(() => {
		if (!dragging) return;

		const draggedItem = draggedItems.find((item) => item.id === dragging);
		if (!draggedItem) return;

		// Check if item is dropped in a drop zone
		const droppedZone = question.dropZones.find((zone) => draggedItem.x >= zone.x && draggedItem.x <= zone.x + zone.width && draggedItem.y >= zone.y && draggedItem.y <= zone.y + zone.height && zone.acceptsItems.includes(draggedItem.id));

		setDraggedItems((prev) =>
			prev.map((item) =>
				item.id === dragging
					? {
							...item,
							zoneId: droppedZone?.id,
							x: droppedZone ? droppedZone.x + 10 : item.x,
							y: droppedZone ? droppedZone.y + 10 : item.y,
					  }
					: item
			)
		);

		setDragging(null);

		// Update answer
		const placements = draggedItems.map((item) => ({
			itemId: item.id,
			zoneId: item.zoneId || "",
			x: item.x,
			y: item.y,
		}));
		onAnswer(placements);
	}, [dragging, draggedItems, question.dropZones, onAnswer]);

	const resetPositions = () => {
		const resetItems = question.draggableItems.map((item, index) => ({
			...item,
			x: 20,
			y: 50 + index * 70,
			zoneId: undefined,
		}));
		setDraggedItems(resetItems);
		onAnswer([]);
	};

	const getItemStatus = (item: DraggedItem) => {
		if (!isAnswered) return "default";

		const correctPlacement = question.correctPlacements.find((p) => p.itemId === item.id);
		const isCorrect = correctPlacement && item.zoneId === correctPlacement.zoneId;

		return isCorrect ? "correct" : "incorrect";
	};

	const getZoneStatus = (zone: any) => {
		if (!isAnswered) return "default";

		const itemsInZone = draggedItems.filter((item) => item.zoneId === zone.id);
		const correctItemsInZone = itemsInZone.filter((item) => {
			const correctPlacement = question.correctPlacements.find((p) => p.itemId === item.id);
			return correctPlacement && correctPlacement.zoneId === zone.id;
		});

		if (correctItemsInZone.length === itemsInZone.length && itemsInZone.length > 0) {
			return "correct";
		} else if (itemsInZone.length > 0) {
			return "incorrect";
		}
		return "empty";
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<Badge variant="secondary">Drag & Drop</Badge>
					<Badge variant="outline">{question.points} points</Badge>
				</div>
				{!isAnswered && (
					<Button variant="outline" size="sm" onClick={resetPositions} disabled={disabled}>
						<RotateCcw className="h-4 w-4 mr-2" />
						Reset
					</Button>
				)}
			</div>

			{/* Instructions */}
			<div className="p-4 bg-blue-50 border border-primary/30 rounded-lg">
				<p className="text-primary text-sm">Drag the items below onto the canvas and place them in the correct drop zones.</p>
			</div>

			{/* Canvas */}
			<Card className="overflow-hidden">
				<CardContent className="p-0">
					<div
						ref={canvasRef}
						className="relative bg-gray-50 border-2 border-dashed border-border"
						style={{
							width: question.canvas.width,
							height: question.canvas.height,
							backgroundImage: question.canvas.backgroundImage ? `url(${question.canvas.backgroundImage})` : undefined,
							backgroundSize: "cover",
							backgroundPosition: "center",
						}}
						onMouseMove={handleMouseMove}
						onMouseUp={handleMouseUp}
						onMouseLeave={handleMouseUp}
					>
						{/* Grid if enabled */}
						{question.canvas.gridSize && (
							<div
								className="absolute inset-0 opacity-20"
								style={{
									backgroundImage: `
                    linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
                  `,
									backgroundSize: `${question.canvas.gridSize}px ${question.canvas.gridSize}px`,
								}}
							/>
						)}

						{/* Drop zones */}
						{question.dropZones.map((zone) => {
							const status = getZoneStatus(zone);
							return (
								<div
									key={zone.id}
									className={`absolute border-2 border-dashed rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${status === "correct" ? "border-green-500 bg-green-50 text-success" : status === "incorrect" ? "border-red-500 bg-red-50 text-destructive" : "border-border bg-white/50 text-muted-foreground"}`}
									style={{
										left: zone.x,
										top: zone.y,
										width: zone.width,
										height: zone.height,
									}}
								>
									{zone.label && <span className="text-xs text-center px-2">{zone.label}</span>}
								</div>
							);
						})}

						{/* Draggable items */}
						{draggedItems.map((item) => {
							const status = getItemStatus(item);
							const isDragging = dragging === item.id;

							return (
								<div
									key={item.id}
									className={`absolute cursor-move select-none transition-transform ${isDragging ? "scale-110 z-50" : "z-10"} ${status === "correct" ? "shadow-green-500 shadow-lg" : status === "incorrect" ? "shadow-red-500 shadow-lg" : "shadow-md hover:shadow-lg"}`}
									style={{
										left: item.x,
										top: item.y,
										transform: isDragging ? "rotate(5deg)" : "rotate(0deg)",
									}}
									onMouseDown={(e) => handleMouseDown(e, item.id)}
								>
									<div className={`px-3 py-2 rounded-lg border-2 bg-white flex items-center space-x-2 ${status === "correct" ? "border-green-500" : status === "incorrect" ? "border-red-500" : "border-border hover:border-primary/50"}`}>
										{item.type === "image" && item.src ? <img src={item.src} alt={item.content} className="w-8 h-8 object-cover rounded" draggable={false} /> : <span className="text-sm font-medium">{item.content}</span>}
										{isAnswered && <div className="ml-2">{status === "correct" ? <CheckCircle className="h-4 w-4 text-success" /> : <AlertCircle className="h-4 w-4 text-destructive" />}</div>}
									</div>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>

			{/* Feedback */}
			{showFeedback && isAnswered && (
				<div className="p-4 bg-gray-50 border border-border rounded-lg">
					<div className="flex items-start space-x-3">
						<div className="flex-shrink-0 mt-0.5">
							<AlertCircle className="h-5 w-5 text-muted-foreground" />
						</div>
						<div>
							<p className="font-medium text-foreground mb-1">Explanation:</p>
							<p className="text-muted-foreground text-sm">{question.explanation}</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
