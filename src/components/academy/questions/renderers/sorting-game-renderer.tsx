"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, ArrowUp, ArrowDown, RotateCcw, Shuffle } from "lucide-react";
import { SortingGameQuestion } from "@/types/questions";

interface SortingGameRendererProps {
	question: SortingGameQuestion;
	onAnswer: (answer: any) => void;
	isAnswered: boolean;
	userAnswer?: string[];
	showFeedback?: boolean;
	disabled?: boolean;
}

export function SortingGameRenderer({ question, onAnswer, isAnswered, userAnswer, showFeedback = false, disabled = false }: SortingGameRendererProps) {
	const [sortedItems, setSortedItems] = useState<typeof question.items>([]);
	const [moves, setMoves] = useState(0);

	useEffect(() => {
		if (userAnswer) {
			// Restore previous order
			const restoredItems = userAnswer.map((id) => question.items.find((item) => item.id === id)).filter(Boolean) as typeof question.items;
			setSortedItems(restoredItems);
		} else {
			// Start with shuffled items
			setSortedItems([...question.items].sort(() => Math.random() - 0.5));
			setMoves(0);
		}
	}, [question, userAnswer]);

	const moveItem = (fromIndex: number, toIndex: number) => {
		if (isAnswered || disabled) return;

		const newItems = [...sortedItems];
		const [movedItem] = newItems.splice(fromIndex, 1);
		newItems.splice(toIndex, 0, movedItem);

		setSortedItems(newItems);
		setMoves(moves + 1);
	};

	const moveUp = (index: number) => {
		if (index > 0) {
			moveItem(index, index - 1);
		}
	};

	const moveDown = (index: number) => {
		if (index < sortedItems.length - 1) {
			moveItem(index, index + 1);
		}
	};

	const shuffleItems = () => {
		if (isAnswered || disabled) return;
		setSortedItems([...sortedItems].sort(() => Math.random() - 0.5));
		setMoves(0);
	};

	const resetSorting = () => {
		if (isAnswered || disabled) return;
		setSortedItems([...question.items].sort(() => Math.random() - 0.5));
		setMoves(0);
	};

	const handleSubmit = () => {
		if (isAnswered || disabled) return;

		const isCorrect = checkSortingCorrectness();

		onAnswer({
			value: sortedItems.map((item) => item.id),
			__isCorrect: isCorrect,
			moves,
		});
	};

	const checkSortingCorrectness = () => {
		const currentOrder = sortedItems.map((item) => item.value);

		switch (question.sortCriteria) {
			case "numerical":
				const numericSorted = [...currentOrder].sort((a, b) => {
					const numA = typeof a === "number" ? a : parseFloat(a as string);
					const numB = typeof b === "number" ? b : parseFloat(b as string);
					return question.sortOrder === "ascending" ? numA - numB : numB - numA;
				});
				return JSON.stringify(currentOrder) === JSON.stringify(numericSorted);

			case "alphabetical":
				const alphaSorted = [...currentOrder].sort((a, b) => {
					const strA = a.toString().toLowerCase();
					const strB = b.toString().toLowerCase();
					return question.sortOrder === "ascending" ? strA.localeCompare(strB) : strB.localeCompare(strA);
				});
				return JSON.stringify(currentOrder) === JSON.stringify(alphaSorted);

			case "chronological":
				// Assume values are dates or can be parsed as dates
				const dateSorted = [...currentOrder].sort((a, b) => {
					const dateA = new Date(a as string).getTime();
					const dateB = new Date(b as string).getTime();
					return question.sortOrder === "ascending" ? dateA - dateB : dateB - dateA;
				});
				return JSON.stringify(currentOrder) === JSON.stringify(dateSorted);

			case "size":
				// Assume values represent sizes (could be file sizes, dimensions, etc.)
				const sizeSorted = [...currentOrder].sort((a, b) => {
					const sizeA = parseFloat(a.toString());
					const sizeB = parseFloat(b.toString());
					return question.sortOrder === "ascending" ? sizeA - sizeB : sizeB - sizeA;
				});
				return JSON.stringify(currentOrder) === JSON.stringify(sizeSorted);

			case "custom":
				if (!question.customOrder) return false;
				const customSorted = question.sortOrder === "ascending" ? question.customOrder : [...question.customOrder].reverse();
				return JSON.stringify(sortedItems.map((item) => item.id)) === JSON.stringify(customSorted);

			default:
				return false;
		}
	};

	const getCorrectOrder = () => {
		switch (question.sortCriteria) {
			case "numerical":
				return [...question.items].sort((a, b) => {
					const numA = typeof a.value === "number" ? a.value : parseFloat(a.value as string);
					const numB = typeof b.value === "number" ? b.value : parseFloat(b.value as string);
					return question.sortOrder === "ascending" ? numA - numB : numB - numA;
				});

			case "alphabetical":
				return [...question.items].sort((a, b) => {
					const strA = a.value.toString().toLowerCase();
					const strB = b.value.toString().toLowerCase();
					return question.sortOrder === "ascending" ? strA.localeCompare(strB) : strB.localeCompare(strA);
				});

			case "custom":
				if (!question.customOrder) return question.items;
				const orderedIds = question.sortOrder === "ascending" ? question.customOrder : [...question.customOrder].reverse();
				return orderedIds.map((id) => question.items.find((item) => item.id === id)).filter(Boolean) as typeof question.items;

			default:
				return question.items;
		}
	};

	const getSortDescription = () => {
		const order = question.sortOrder === "ascending" ? "lowest to highest" : "highest to lowest";
		switch (question.sortCriteria) {
			case "numerical":
				return `Sort numbers from ${order}`;
			case "alphabetical":
				return `Sort alphabetically from ${question.sortOrder === "ascending" ? "A to Z" : "Z to A"}`;
			case "chronological":
				return `Sort chronologically from ${question.sortOrder === "ascending" ? "earliest to latest" : "latest to earliest"}`;
			case "size":
				return `Sort by size from ${order}`;
			case "custom":
				return `Sort in the specified custom order`;
			default:
				return "Sort the items correctly";
		}
	};

	const getItemPosition = (itemId: string) => {
		const correctOrder = getCorrectOrder();
		const currentIndex = sortedItems.findIndex((item) => item.id === itemId);
		const correctIndex = correctOrder.findIndex((item) => item.id === itemId);
		return {
			current: currentIndex + 1,
			correct: correctIndex + 1,
			isCorrect: currentIndex === correctIndex,
		};
	};

	return (
		<div className="space-y-6">
			{/* Instructions */}
			<Card>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-muted-foreground mb-2">{getSortDescription()}</p>
							<div className="flex items-center space-x-4 text-sm text-muted-foreground">
								<span>Items: {sortedItems.length}</span>
								<span>Moves: {moves}</span>
							</div>
						</div>

						{!isAnswered && (
							<div className="flex space-x-2">
								<Button variant="outline" size="sm" onClick={shuffleItems} disabled={disabled}>
									<Shuffle className="w-4 h-4 mr-2" />
									Shuffle
								</Button>
								<Button variant="outline" size="sm" onClick={resetSorting} disabled={disabled}>
									<RotateCcw className="w-4 h-4 mr-2" />
									Reset
								</Button>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Sorting List */}
			<Card>
				<CardContent className="p-6">
					<div className="space-y-3">
						{sortedItems.map((item, index) => {
							const position = getItemPosition(item.id);
							return (
								<div key={item.id} className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 ${showFeedback && isAnswered ? (position.isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50") : "border-border bg-white"}`}>
									{/* Position Number */}
									<div className="flex items-center space-x-4">
										<div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-sm">{index + 1}</div>

										{/* Item Content */}
										<div className="flex items-center space-x-3">
											{item.type === "image" && item.src ? <img src={item.src} alt={item.content} className="w-12 h-12 object-cover rounded" /> : null}
											<div>
												<span className="font-medium">{item.content}</span>
												<div className="text-sm text-muted-foreground">Value: {item.value}</div>
											</div>
										</div>
									</div>

									{/* Controls and Feedback */}
									<div className="flex items-center space-x-2">
										{showFeedback && isAnswered && <div className="text-sm text-muted-foreground mr-3">{position.isCorrect ? <span className="text-success">✓ Correct position</span> : <span className="text-destructive">Should be position {position.correct}</span>}</div>}

										{!isAnswered && !disabled && (
											<div className="flex space-x-1">
												<Button variant="outline" size="sm" onClick={() => moveUp(index)} disabled={index === 0}>
													<ArrowUp className="w-4 h-4" />
												</Button>
												<Button variant="outline" size="sm" onClick={() => moveDown(index)} disabled={index === sortedItems.length - 1}>
													<ArrowDown className="w-4 h-4" />
												</Button>
											</div>
										)}

										{showFeedback && isAnswered && <div className="flex-shrink-0">{position.isCorrect ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />}</div>}
									</div>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>

			{/* Submit Button */}
			{!isAnswered && (
				<div className="flex justify-center">
					<Button onClick={handleSubmit} size="lg" disabled={disabled}>
						Check Sorting
					</Button>
				</div>
			)}

			{/* Feedback */}
			{showFeedback && isAnswered && (
				<Card className="mt-6">
					<CardContent className="p-6">
						<div className="space-y-4">
							<div className="flex items-center space-x-2">
								{checkSortingCorrectness() ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />}
								<span className={`font-semibold ${checkSortingCorrectness() ? "text-success" : "text-destructive"}`}>{checkSortingCorrectness() ? "Perfect Sorting!" : "Sorting Needs Correction"}</span>
								<span className="text-sm text-muted-foreground">({moves} moves)</span>
							</div>

							{question.explanation && (
								<div className="p-4 rounded-lg bg-blue-50 border border-primary/30">
									<p className="text-primary font-medium">Explanation:</p>
									<p className="text-primary mt-1">{question.explanation}</p>
								</div>
							)}

							{/* Show correct order if incorrect */}
							{!checkSortingCorrectness() && (
								<div className="p-4 rounded-lg bg-green-50 border border-green-200">
									<p className="text-success font-medium">Correct Order:</p>
									<ol className="list-decimal list-inside space-y-1 mt-2">
										{getCorrectOrder().map((item, index) => (
											<li key={item.id} className="text-success">
												{item.content} (Value: {item.value})
											</li>
										))}
									</ol>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
