"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Play, Square, Diamond, Circle } from "lucide-react";
import { FlowchartBuilderQuestion } from "@/types/questions";

interface NodePosition {
	nodeId: string;
	x: number;
	y: number;
}

interface FlowchartBuilderRendererProps {
	question: FlowchartBuilderQuestion;
	onAnswer: (answer: any) => void;
	isAnswered: boolean;
	userAnswer?: NodePosition[];
	showFeedback?: boolean;
	disabled?: boolean;
}

export function FlowchartBuilderRenderer({ question, onAnswer, isAnswered, userAnswer, showFeedback = false, disabled = false }: FlowchartBuilderRendererProps) {
	const [nodePositions, setNodePositions] = useState<NodePosition[]>(userAnswer || []);
	const [draggedNode, setDraggedNode] = useState<string | null>(null);
	const canvasRef = useRef<HTMLDivElement>(null);

	const getNodeIcon = (type: string) => {
		switch (type) {
			case "start":
				return <Circle className="w-4 h-4" />;
			case "process":
				return <Square className="w-4 h-4" />;
			case "decision":
				return <Diamond className="w-4 h-4" />;
			case "end":
				return <Play className="w-4 h-4 rotate-90" />;
			default:
				return <Square className="w-4 h-4" />;
		}
	};

	const getNodeColor = (type: string) => {
		switch (type) {
			case "start":
				return "bg-success/10 border-green-500 text-success";
			case "process":
				return "bg-primary/10 border-primary text-primary";
			case "decision":
				return "bg-warning/10 border-yellow-500 text-warning";
			case "end":
				return "bg-destructive/10 border-red-500 text-destructive";
			default:
				return "bg-muted border-border text-muted-foreground";
		}
	};

	const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!canvasRef.current || isAnswered || disabled) return;

		const rect = canvasRef.current.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * 100;
		const y = ((e.clientY - rect.top) / rect.height) * 100;

		// Only place nodes if we have unplaced nodes
		const unplacedNodes = question.nodes.filter((node) => !nodePositions.some((pos) => pos.nodeId === node.id));

		if (unplacedNodes.length > 0) {
			const nextNode = unplacedNodes[0];
			setNodePositions([...nodePositions, { nodeId: nextNode.id, x, y }]);
		}
	};

	const handleNodeDragStart = (nodeId: string) => {
		if (isAnswered || disabled) return;
		setDraggedNode(nodeId);
	};

	const handleNodeDrag = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
	};

	const handleNodeDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		if (!draggedNode || !canvasRef.current || isAnswered || disabled) return;

		const rect = canvasRef.current.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * 100;
		const y = ((e.clientY - rect.top) / rect.height) * 100;

		setNodePositions((positions) => positions.map((pos) => (pos.nodeId === draggedNode ? { ...pos, x, y } : pos)));

		setDraggedNode(null);
	};

	const removeNode = (nodeId: string) => {
		if (isAnswered || disabled) return;
		setNodePositions(nodePositions.filter((pos) => pos.nodeId !== nodeId));
	};

	const resetFlowchart = () => {
		if (isAnswered || disabled) return;
		setNodePositions([]);
	};

	const handleSubmit = () => {
		if (isAnswered || disabled) return;

		// Simple scoring - check if all nodes are placed
		const allNodesPlaced = question.nodes.every((node) => nodePositions.some((pos) => pos.nodeId === node.id));

		if (!allNodesPlaced) {
			alert("Please place all nodes before submitting.");
			return;
		}

		// More sophisticated scoring could check for logical flow, proximity to expected positions, etc.
		const isCorrect = allNodesPlaced; // Simplified for now

		onAnswer({
			value: nodePositions,
			__isCorrect: isCorrect,
		});
	};

	const getConnectionPath = (fromPos: NodePosition, toPos: NodePosition) => {
		const fromX = fromPos.x;
		const fromY = fromPos.y;
		const toX = toPos.x;
		const toY = toPos.y;

		// Simple straight line - could be enhanced with curved paths
		return `M ${fromX} ${fromY} L ${toX} ${toY}`;
	};

	const getNodePosition = (nodeId: string) => {
		return nodePositions.find((pos) => pos.nodeId === nodeId);
	};

	return (
		<div className="space-y-6">
			{/* Instructions */}
			<Card>
				<CardContent className="p-4">
					<div className="space-y-2">
						<p className="text-muted-foreground">Build the flowchart by clicking on the canvas to place nodes in the correct sequence.</p>
						<div className="flex items-center space-x-4 text-sm text-muted-foreground">
							<span>
								Placed: {nodePositions.length} / {question.nodes.length}
							</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Available Nodes */}
			{question.nodes.filter((node) => !nodePositions.some((pos) => pos.nodeId === node.id)).length > 0 && (
				<Card>
					<CardContent className="p-4">
						<h3 className="text-lg font-semibold mb-3">Available Nodes</h3>
						<div className="flex flex-wrap gap-3">
							{question.nodes
								.filter((node) => !nodePositions.some((pos) => pos.nodeId === node.id))
								.map((node) => (
									<div key={node.id} className={`px-4 py-2 rounded-lg border-2 cursor-pointer transition-all duration-200 ${getNodeColor(node.type)}`}>
										<div className="flex items-center space-x-2">
											{getNodeIcon(node.type)}
											<span className="font-medium">{node.content}</span>
										</div>
									</div>
								))}
						</div>
						<p className="text-sm text-muted-foreground mt-2">Click on the canvas below to place the next node.</p>
					</CardContent>
				</Card>
			)}

			{/* Controls */}
			{!isAnswered && (
				<Card>
					<CardContent className="p-4">
						<div className="flex justify-between items-center">
							<Button variant="outline" onClick={resetFlowchart} disabled={disabled || nodePositions.length === 0}>
								Reset Flowchart
							</Button>

							<Button onClick={handleSubmit} disabled={disabled || nodePositions.length !== question.nodes.length}>
								Submit Flowchart
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Flowchart Canvas */}
			<Card>
				<CardContent className="p-4">
					<div ref={canvasRef} className="relative w-full h-96 bg-gray-50 border-2 border-dashed border-border rounded-lg cursor-crosshair overflow-hidden" onClick={handleCanvasClick} onDragOver={handleNodeDrag} onDrop={handleNodeDrop}>
						{/* SVG for Connections */}
						<svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
							{question.connections.map((connection) => {
								const fromPos = getNodePosition(connection.fromId);
								const toPos = getNodePosition(connection.toId);

								if (!fromPos || !toPos) return null;

								return (
									<g key={`${connection.fromId}-${connection.toId}`}>
										<path d={getConnectionPath(fromPos, toPos)} stroke="hsl(var(--muted-foreground))" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
										{connection.label && (
											<text x={(fromPos.x + toPos.x) / 2} y={(fromPos.y + toPos.y) / 2} textAnchor="middle" className="text-xs fill-gray-600">
												{connection.label}
											</text>
										)}
									</g>
								);
							})}

							{/* Arrow marker definition */}
							<defs>
								<marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
									<polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--muted-foreground))" />
								</marker>
							</defs>
						</svg>

						{/* Placed Nodes */}
						{nodePositions.map((position) => {
							const node = question.nodes.find((n) => n.id === position.nodeId);
							if (!node) return null;

							return (
								<div
									key={position.nodeId}
									className={`absolute transform -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded-lg border-2 cursor-move transition-all duration-200 ${getNodeColor(node.type)}`}
									style={{
										left: `${position.x}%`,
										top: `${position.y}%`,
										zIndex: 2,
									}}
									draggable={!isAnswered && !disabled}
									onDragStart={() => handleNodeDragStart(position.nodeId)}
									onDoubleClick={() => removeNode(position.nodeId)}
								>
									<div className="flex items-center space-x-2">
										{getNodeIcon(node.type)}
										<span className="font-medium text-sm">{node.content}</span>
									</div>
								</div>
							);
						})}

						{/* Empty state */}
						{nodePositions.length === 0 && (
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="text-center text-muted-foreground">
									<p className="text-lg font-medium">Click to place nodes</p>
									<p className="text-sm">Build your flowchart by placing nodes in logical order</p>
								</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Flowchart Legend */}
			<Card>
				<CardContent className="p-4">
					<h3 className="text-lg font-semibold mb-3">Node Types</h3>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div className="flex items-center space-x-2">
							<div className={`p-2 rounded border-2 ${getNodeColor("start")}`}>{getNodeIcon("start")}</div>
							<span className="text-sm">Start</span>
						</div>
						<div className="flex items-center space-x-2">
							<div className={`p-2 rounded border-2 ${getNodeColor("process")}`}>{getNodeIcon("process")}</div>
							<span className="text-sm">Process</span>
						</div>
						<div className="flex items-center space-x-2">
							<div className={`p-2 rounded border-2 ${getNodeColor("decision")}`}>{getNodeIcon("decision")}</div>
							<span className="text-sm">Decision</span>
						</div>
						<div className="flex items-center space-x-2">
							<div className={`p-2 rounded border-2 ${getNodeColor("end")}`}>{getNodeIcon("end")}</div>
							<span className="text-sm">End</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Feedback */}
			{showFeedback && isAnswered && (
				<Card className="mt-6">
					<CardContent className="p-6">
						<div className="space-y-4">
							<div className="flex items-center space-x-2">
								{nodePositions.length === question.nodes.length ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />}
								<span className={`font-semibold ${nodePositions.length === question.nodes.length ? "text-success" : "text-destructive"}`}>{nodePositions.length === question.nodes.length ? "Flowchart Complete!" : "Flowchart Incomplete"}</span>
							</div>

							{question.explanation && (
								<div className="p-4 rounded-lg bg-blue-50 border border-primary/30">
									<p className="text-primary font-medium">Explanation:</p>
									<p className="text-primary mt-1">{question.explanation}</p>
								</div>
							)}

							{/* Show expected positions if available */}
							{question.correctFlowchart && question.correctFlowchart.length > 0 && (
								<div className="p-4 rounded-lg bg-green-50 border border-green-200">
									<p className="text-success font-medium">Expected Flow:</p>
									<div className="mt-2 space-y-1">
										{question.correctFlowchart.map((correct, index) => {
											const node = question.nodes.find((n) => n.id === correct.nodeId);
											return (
												<div key={correct.nodeId} className="flex items-center space-x-2 text-success">
													<span className="text-sm">{index + 1}.</span>
													{node && getNodeIcon(node.type)}
													<span className="text-sm">{node?.content}</span>
												</div>
											);
										})}
									</div>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
