"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Package } from "lucide-react";
import { DragDropCategorizeQuestion } from "@/types/questions";

interface DragDropCategorizeRendererProps {
	question: DragDropCategorizeQuestion;
	onAnswer: (answer: any) => void;
	isAnswered: boolean;
	userAnswer?: { [itemId: string]: string };
	showFeedback?: boolean;
	disabled?: boolean;
}

export function DragDropCategorizeRenderer({ question, onAnswer, isAnswered, userAnswer, showFeedback = false, disabled = false }: DragDropCategorizeRendererProps) {
	const [itemCategorization, setItemCategorization] = useState<{ [itemId: string]: string }>({});
	const [draggedItem, setDraggedItem] = useState<string | null>(null);

	useEffect(() => {
		if (userAnswer) {
			setItemCategorization(userAnswer);
		}
	}, [userAnswer]);

	const handleDragStart = (itemId: string) => {
		if (isAnswered || disabled) return;
		setDraggedItem(itemId);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
	};

	const handleDrop = (e: React.DragEvent, categoryId: string) => {
		e.preventDefault();
		if (!draggedItem || isAnswered || disabled) return;

		setItemCategorization((prev) => ({
			...prev,
			[draggedItem]: categoryId,
		}));
		setDraggedItem(null);
	};

	const handleItemClick = (itemId: string, categoryId: string) => {
		if (isAnswered || disabled) return;

		setItemCategorization((prev) => ({
			...prev,
			[itemId]: categoryId,
		}));
	};

	const removeFromCategory = (itemId: string) => {
		if (isAnswered || disabled) return;

		setItemCategorization((prev) => {
			const newCategorization = { ...prev };
			delete newCategorization[itemId];
			return newCategorization;
		});
	};

	const handleSubmit = () => {
		if (isAnswered || disabled) return;

		// Check if all items are categorized
		const allItemsCategorized = question.items.every((item) => itemCategorization[item.id]);

		if (!allItemsCategorized) {
			alert("Please categorize all items before submitting.");
			return;
		}

		// Check correctness
		const isCorrect = question.correctCategorization.every((correct) => itemCategorization[correct.itemId] === correct.categoryId);

		onAnswer({
			value: itemCategorization,
			__isCorrect: isCorrect,
		});
	};

	const getItemsInCategory = (categoryId: string) => {
		return Object.entries(itemCategorization)
			.filter(([_, catId]) => catId === categoryId)
			.map(([itemId]) => itemId);
	};

	const getUncategorizedItems = () => {
		return question.items.filter((item) => !itemCategorization[item.id]);
	};

	const getItemCorrectCategory = (itemId: string) => {
		return question.correctCategorization.find((c) => c.itemId === itemId)?.categoryId;
	};

	const isItemCorrectlyPlaced = (itemId: string) => {
		const correctCategoryId = getItemCorrectCategory(itemId);
		return itemCategorization[itemId] === correctCategoryId;
	};

	const getCategoryStyle = (categoryId: string) => {
		if (!showFeedback || !isAnswered) {
			return "border-border bg-gray-50";
		}

		const itemsInCategory = getItemsInCategory(categoryId);
		const allCorrect = itemsInCategory.every((itemId) => isItemCorrectlyPlaced(itemId));
		const hasIncorrect = itemsInCategory.some((itemId) => !isItemCorrectlyPlaced(itemId));

		if (hasIncorrect) {
			return "border-red-300 bg-red-50";
		} else if (allCorrect && itemsInCategory.length > 0) {
			return "border-green-300 bg-green-50";
		}

		return "border-border bg-gray-50";
	};

	const getItemStyle = (itemId: string) => {
		if (!showFeedback || !isAnswered) {
			return "border-primary/30 bg-blue-50 hover:bg-primary/10";
		}

		if (isItemCorrectlyPlaced(itemId)) {
			return "border-green-300 bg-success/10";
		} else {
			return "border-red-300 bg-destructive/10";
		}
	};

	return (
		<div className="space-y-6">
			{/* Instructions */}
			<Card>
				<CardContent className="p-4">
					<p className="text-muted-foreground">Drag and drop the items below into the correct categories, or click on items and then click on a category.</p>
				</CardContent>
			</Card>

			{/* Uncategorized Items */}
			{getUncategorizedItems().length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg flex items-center space-x-2">
							<Package className="w-5 h-5" />
							<span>Items to Categorize</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-3">
							{getUncategorizedItems().map((item) => (
								<div key={item.id} className={`p-3 rounded-lg border-2 cursor-move transition-all duration-200 ${getItemStyle(item.id)}`} draggable={!isAnswered && !disabled} onDragStart={() => handleDragStart(item.id)}>
									{item.type === "image" && item.src ? (
										<div className="flex flex-col items-center space-y-2">
											<img src={item.src} alt={item.content} className="w-16 h-16 object-cover rounded" />
											<span className="text-sm text-center">{item.content}</span>
										</div>
									) : (
										<span className="font-medium">{item.content}</span>
									)}
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Categories */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{question.categories.map((category) => (
					<Card key={category.id} className={`min-h-40 transition-all duration-200 ${getCategoryStyle(category.id)}`}>
						<CardHeader className="pb-3" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, category.id)} style={{ backgroundColor: category.color || undefined }}>
							<CardTitle className="text-lg">{category.name}</CardTitle>
							{category.description && <p className="text-sm text-muted-foreground">{category.description}</p>}
						</CardHeader>
						<CardContent className="space-y-2" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, category.id)}>
							{getItemsInCategory(category.id).map((itemId) => {
								const item = question.items.find((i) => i.id === itemId);
								if (!item) return null;

								return (
									<div key={itemId} className={`p-2 rounded border-2 cursor-pointer transition-all duration-200 ${getItemStyle(itemId)}`} onClick={() => removeFromCategory(itemId)}>
										<div className="flex items-center justify-between">
											{item.type === "image" && item.src ? (
												<div className="flex items-center space-x-2">
													<img src={item.src} alt={item.content} className="w-8 h-8 object-cover rounded" />
													<span className="text-sm">{item.content}</span>
												</div>
											) : (
												<span className="text-sm font-medium">{item.content}</span>
											)}

											{showFeedback && isAnswered && <div className="flex-shrink-0">{isItemCorrectlyPlaced(itemId) ? <CheckCircle className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-destructive" />}</div>}
										</div>
									</div>
								);
							})}

							{getItemsInCategory(category.id).length === 0 && <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg">Drop items here</div>}
						</CardContent>
					</Card>
				))}
			</div>

			{/* Submit Button */}
			{!isAnswered && (
				<div className="flex justify-center">
					<Button onClick={handleSubmit} size="lg" disabled={disabled || getUncategorizedItems().length > 0}>
						Check Categorization
					</Button>
				</div>
			)}

			{/* Feedback */}
			{showFeedback && isAnswered && (
				<Card className="mt-6">
					<CardContent className="p-6">
						<div className="space-y-4">
							<div className="flex items-center space-x-2">
								{question.correctCategorization.every((correct) => itemCategorization[correct.itemId] === correct.categoryId) ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />}
								<span className={`font-semibold ${question.correctCategorization.every((correct) => itemCategorization[correct.itemId] === correct.categoryId) ? "text-success" : "text-destructive"}`}>{question.correctCategorization.every((correct) => itemCategorization[correct.itemId] === correct.categoryId) ? "Perfect Categorization!" : "Some items are misplaced"}</span>
							</div>

							{question.explanation && (
								<div className="p-4 rounded-lg bg-blue-50 border border-primary/30">
									<p className="text-primary font-medium">Explanation:</p>
									<p className="text-primary mt-1">{question.explanation}</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
