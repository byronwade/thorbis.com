"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { CrosswordPuzzleQuestion } from "@/types/questions";

interface CrosswordPuzzleRendererProps {
	question: CrosswordPuzzleQuestion;
	onAnswer: (answer: any) => void;
	isAnswered: boolean;
	userAnswer?: { [key: string]: string };
	showFeedback?: boolean;
	disabled?: boolean;
}

export function CrosswordPuzzleRenderer({ question, onAnswer, isAnswered, userAnswer, showFeedback = false, disabled = false }: CrosswordPuzzleRendererProps) {
	const [cellInputs, setCellInputs] = useState<{ [key: string]: string }>({});
	const [selectedClue, setSelectedClue] = useState<string | null>(null);
	const [focusedCell, setFocusedCell] = useState<{ x: number; y: number } | null>(null);
	const cellRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

	useEffect(() => {
		if (userAnswer) {
			setCellInputs(userAnswer);
		}
	}, [userAnswer]);

	const getCellKey = (x: number, y: number) => `${x}-${y}`;

	const getCellData = (x: number, y: number) => {
		return question.grid.cells.find((cell) => cell.x === x && cell.y === y);
	};

	const isPartOfClue = (x: number, y: number, clueId: string) => {
		const clue = question.clues.find((c) => c.id === clueId);
		if (!clue) return false;

		if (clue.direction === "across") {
			return y === clue.startY && x >= clue.startX && x < clue.startX + clue.answer.length;
		} else {
			return x === clue.startX && y >= clue.startY && y < clue.startY + clue.answer.length;
		}
	};

	const handleCellChange = (x: number, y: number, value: string) => {
		if (isAnswered || disabled) return;

		const newValue = value.toUpperCase().slice(-1); // Only last character, uppercase
		const cellKey = getCellKey(x, y);

		setCellInputs((prev) => ({
			...prev,
			[cellKey]: newValue,
		}));

		// Auto-advance to next cell
		if (newValue && selectedClue) {
			const clue = question.clues.find((c) => c.id === selectedClue);
			if (clue) {
				let nextX = x;
				let nextY = y;

				if (clue.direction === "across") {
					nextX = x + 1;
				} else {
					nextY = y + 1;
				}

				const nextCellKey = getCellKey(nextX, nextY);
				const nextRef = cellRefs.current[nextCellKey];
				if (nextRef && isPartOfClue(nextX, nextY, selectedClue)) {
					nextRef.focus();
					setFocusedCell({ x: nextX, y: nextY });
				}
			}
		}
	};

	const handleCellClick = (x: number, y: number) => {
		if (isAnswered || disabled) return;

		setFocusedCell({ x, y });

		// Find clues that include this cell
		const relevantClues = question.clues.filter((clue) => isPartOfClue(x, y, clue.id));

		if (relevantClues.length > 0) {
			// If there's a selected clue and this cell is part of it, keep it
			// Otherwise, select the first relevant clue
			if (!selectedClue || !relevantClues.find((c) => c.id === selectedClue)) {
				setSelectedClue(relevantClues[0].id);
			}
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent, x: number, y: number) => {
		if (isAnswered || disabled) return;

		switch (e.key) {
			case "Backspace":
				if (!cellInputs[getCellKey(x, y)]) {
					// Move to previous cell if current is empty
					const clue = selectedClue ? question.clues.find((c) => c.id === selectedClue) : null;
					if (clue) {
						let prevX = x;
						let prevY = y;

						if (clue.direction === "across") {
							prevX = x - 1;
						} else {
							prevY = y - 1;
						}

						const prevCellKey = getCellKey(prevX, prevY);
						const prevRef = cellRefs.current[prevCellKey];
						if (prevRef && isPartOfClue(prevX, prevY, selectedClue)) {
							prevRef.focus();
							setFocusedCell({ x: prevX, y: prevY });
						}
					}
				}
				break;

			case "ArrowRight":
				e.preventDefault();
				moveFocus(x + 1, y);
				break;

			case "ArrowLeft":
				e.preventDefault();
				moveFocus(x - 1, y);
				break;

			case "ArrowDown":
				e.preventDefault();
				moveFocus(x, y + 1);
				break;

			case "ArrowUp":
				e.preventDefault();
				moveFocus(x, y - 1);
				break;
		}
	};

	const moveFocus = (newX: number, newY: number) => {
		const cellData = getCellData(newX, newY);
		if (cellData && !cellData.isBlocked) {
			const cellKey = getCellKey(newX, newY);
			const cellRef = cellRefs.current[cellKey];
			if (cellRef) {
				cellRef.focus();
				setFocusedCell({ x: newX, y: newY });
			}
		}
	};

	const handleClueClick = (clueId: string) => {
		setSelectedClue(clueId);
		const clue = question.clues.find((c) => c.id === clueId);
		if (clue) {
			const cellKey = getCellKey(clue.startX, clue.startY);
			const cellRef = cellRefs.current[cellKey];
			if (cellRef) {
				cellRef.focus();
				setFocusedCell({ x: clue.startX, y: clue.startY });
			}
		}
	};

	const checkAnswer = (clue: (typeof question.clues)[0]) => {
		let userWord = "";
		for (let i = 0; i < clue.answer.length; i++) {
			let x = clue.startX;
			let y = clue.startY;

			if (clue.direction === "across") {
				x += i;
			} else {
				y += i;
			}

			const cellKey = getCellKey(x, y);
			userWord += cellInputs[cellKey] || "";
		}
		return userWord.toUpperCase() === clue.answer.toUpperCase();
	};

	const handleSubmit = () => {
		if (isAnswered || disabled) return;

		const correctAnswers = question.clues.filter((clue) => checkAnswer(clue)).length;
		const isCorrect = correctAnswers === question.clues.length;

		onAnswer({
			value: cellInputs,
			__isCorrect: isCorrect,
			correctAnswers,
			totalClues: question.clues.length,
		});
	};

	const resetPuzzle = () => {
		if (isAnswered || disabled) return;
		setCellInputs({});
		setSelectedClue(null);
		setFocusedCell(null);
	};

	const getCellStyle = (x: number, y: number) => {
		const cellData = getCellData(x, y);
		if (!cellData || cellData.isBlocked) {
			return "bg-card";
		}

		let style = "bg-white border border-border ";

		// Highlight if part of selected clue
		if (selectedClue && isPartOfClue(x, y, selectedClue)) {
			style += "bg-primary/10 border-primary ";
		}

		// Highlight if focused
		if (focusedCell && focusedCell.x === x && focusedCell.y === y) {
			style += "ring-2 ring-blue-500 ";
		}

		// Feedback coloring
		if (showFeedback && isAnswered) {
			const relevantClues = question.clues.filter((clue) => isPartOfClue(x, y, clue.id));
			const allCorrect = relevantClues.every((clue) => checkAnswer(clue));
			if (allCorrect && relevantClues.length > 0) {
				style += "bg-success/10 ";
			} else if (relevantClues.length > 0) {
				style += "bg-destructive/10 ";
			}
		}

		return style;
	};

	return (
		<div className="space-y-6">
			{/* Instructions */}
			<Card>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-muted-foreground mb-2">Fill in the crossword puzzle using the clues provided. Click on a clue to highlight the corresponding word in the grid.</p>
							<div className="flex items-center space-x-4 text-sm text-muted-foreground">
								<span>Clues: {question.clues.length}</span>
								<span>
									Grid: {question.grid.width} × {question.grid.height}
								</span>
							</div>
						</div>

						{!isAnswered && (
							<Button variant="outline" onClick={resetPuzzle} disabled={disabled}>
								<RotateCcw className="w-4 h-4 mr-2" />
								Clear
							</Button>
						)}
					</div>
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Crossword Grid */}
				<Card>
					<CardContent className="p-4">
						<div className="overflow-auto">
							<div
								className="grid gap-0 mx-auto border-2 border-border"
								style={{
									gridTemplateColumns: `repeat(${question.grid.width}, 1fr)`,
									gridTemplateRows: `repeat(${question.grid.height}, 1fr)`,
									maxWidth: "400px",
								}}
							>
								{Array.from({ length: question.grid.height }, (_, y) =>
									Array.from({ length: question.grid.width }, (_, x) => {
										const cellData = getCellData(x, y);
										const cellKey = getCellKey(x, y);

										if (!cellData || cellData.isBlocked) {
											return <div key={cellKey} className={getCellStyle(x, y)} style={{ aspectRatio: "1" }} />;
										}

										return (
											<div key={cellKey} className="relative" style={{ aspectRatio: "1" }}>
												<input ref={(el) => (cellRefs.current[cellKey] = el)} type="text" value={cellInputs[cellKey] || ""} onChange={(e) => handleCellChange(x, y, e.target.value)} onClick={() => handleCellClick(x, y)} onKeyDown={(e) => handleKeyDown(e, x, y)} className={`w-full h-full text-center font-bold text-sm uppercase focus:outline-none ${getCellStyle(x, y)}`} maxLength={1} disabled={isAnswered || disabled} />
												{cellData.number && <span className="absolute top-0 left-0 text-xs font-bold text-muted-foreground leading-none p-0.5">{cellData.number}</span>}
											</div>
										);
									})
								)}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Clues */}
				<Card>
					<CardContent className="p-4">
						<div className="space-y-4">
							{/* Across Clues */}
							<div>
								<h3 className="font-semibold text-lg mb-2">Across</h3>
								<div className="space-y-2">
									{question.clues
										.filter((clue) => clue.direction === "across")
										.map((clue) => (
											<div key={clue.id} className={`p-2 rounded cursor-pointer transition-all duration-200 ${selectedClue === clue.id ? "bg-primary/10 border border-primary/40" : showFeedback && isAnswered ? (checkAnswer(clue) ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200") : "hover:bg-muted"}`} onClick={() => handleClueClick(clue.id)}>
												<div className="flex items-start space-x-2">
													<span className="font-semibold text-sm">{clue.number}.</span>
													<span className="text-sm">{clue.clue}</span>
													{showFeedback && isAnswered && <div className="ml-auto flex-shrink-0">{checkAnswer(clue) ? <CheckCircle className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-destructive" />}</div>}
												</div>
											</div>
										))}
								</div>
							</div>

							{/* Down Clues */}
							<div>
								<h3 className="font-semibold text-lg mb-2">Down</h3>
								<div className="space-y-2">
									{question.clues
										.filter((clue) => clue.direction === "down")
										.map((clue) => (
											<div key={clue.id} className={`p-2 rounded cursor-pointer transition-all duration-200 ${selectedClue === clue.id ? "bg-primary/10 border border-primary/40" : showFeedback && isAnswered ? (checkAnswer(clue) ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200") : "hover:bg-muted"}`} onClick={() => handleClueClick(clue.id)}>
												<div className="flex items-start space-x-2">
													<span className="font-semibold text-sm">{clue.number}.</span>
													<span className="text-sm">{clue.clue}</span>
													{showFeedback && isAnswered && <div className="ml-auto flex-shrink-0">{checkAnswer(clue) ? <CheckCircle className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-destructive" />}</div>}
												</div>
											</div>
										))}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Submit Button */}
			{!isAnswered && (
				<div className="flex justify-center">
					<Button onClick={handleSubmit} size="lg" disabled={disabled}>
						Check Crossword
					</Button>
				</div>
			)}

			{/* Feedback */}
			{showFeedback && isAnswered && (
				<Card className="mt-6">
					<CardContent className="p-6">
						<div className="space-y-4">
							<div className="flex items-center space-x-2">
								{(() => {
									const correctAnswers = question.clues.filter((clue) => checkAnswer(clue)).length;
									const isComplete = correctAnswers === question.clues.length;
									return (
										<>
											{isComplete ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />}
											<span className={`font-semibold ${isComplete ? "text-success" : "text-destructive"}`}>{isComplete ? "Crossword Complete!" : "Some answers need correction"}</span>
											<span className="text-sm text-muted-foreground">
												({correctAnswers} / {question.clues.length} correct)
											</span>
										</>
									);
								})()}
							</div>

							{question.explanation && (
								<div className="p-4 rounded-lg bg-blue-50 border border-primary/30">
									<p className="text-primary font-medium">Explanation:</p>
									<p className="text-primary mt-1">{question.explanation}</p>
								</div>
							)}

							{/* Show incorrect answers */}
							{question.clues.some((clue) => !checkAnswer(clue)) && (
								<div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
									<p className="text-warning font-medium">Answers to review:</p>
									<ul className="list-disc list-inside space-y-1 mt-2">
										{question.clues
											.filter((clue) => !checkAnswer(clue))
											.map((clue) => (
												<li key={clue.id} className="text-warning">
													{clue.number} {clue.direction}: {clue.answer}
												</li>
											))}
									</ul>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
