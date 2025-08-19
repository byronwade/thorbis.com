"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { PuzzleSliderQuestion } from "@/types/questions";

interface PuzzleSliderRendererProps {
	question: PuzzleSliderQuestion;
	onAnswer: (answer: any) => void;
	isAnswered: boolean;
	userAnswer?: number[][];
	showFeedback?: boolean;
	disabled?: boolean;
}

export function PuzzleSliderRenderer({ question, onAnswer, isAnswered, userAnswer, showFeedback = false, disabled = false }: PuzzleSliderRendererProps) {
	const [puzzleState, setPuzzleState] = useState<number[][]>([]);
	const [moves, setMoves] = useState(0);
	const [timeElapsed, setTimeElapsed] = useState(0);
	const [emptyPosition, setEmptyPosition] = useState({ row: 0, col: 0 });

	// Initialize puzzle
	useEffect(() => {
		if (userAnswer) {
			setPuzzleState(userAnswer);
			// Find empty position
			for (let row = 0; row < question.puzzle.rows; row++) {
				for (let col = 0; col < question.puzzle.cols; col++) {
					if (userAnswer[row][col] === 0) {
						setEmptyPosition({ row, col });
						break;
					}
				}
			}
		} else {
			initializePuzzle();
		}
	}, [question, userAnswer]);

	// Timer effect
	useEffect(() => {
		if (isAnswered || disabled) return;

		const timer = setInterval(() => {
			setTimeElapsed((prev) => prev + 1);
		}, 1000);

		return () => clearInterval(timer);
	}, [isAnswered, disabled]);

	const initializePuzzle = () => {
		const { rows, cols } = question.puzzle;
		const totalPieces = rows * cols;

		// Create solved state first
		const solvedState: number[][] = [];
		let pieceNumber = 1;

		for (let row = 0; row < rows; row++) {
			solvedState[row] = [];
			for (let col = 0; col < cols; col++) {
				if (row === rows - 1 && col === cols - 1) {
					solvedState[row][col] = 0; // Empty space
				} else {
					solvedState[row][col] = pieceNumber++;
				}
			}
		}

		// Shuffle the puzzle
		const shuffledState = shufflePuzzle(solvedState);
		setPuzzleState(shuffledState);

		// Find empty position
		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				if (shuffledState[row][col] === 0) {
					setEmptyPosition({ row, col });
					break;
				}
			}
		}

		setMoves(0);
		setTimeElapsed(0);
	};

	const shufflePuzzle = (state: number[][]): number[][] => {
		const shuffled = state.map((row) => [...row]);
		const { rows, cols } = question.puzzle;

		// Perform random valid moves to shuffle
		let emptyRow = rows - 1;
		let emptyCol = cols - 1;

		for (let i = 0; i < 1000; i++) {
			const validMoves = getValidMoves(emptyRow, emptyCol);
			if (validMoves.length > 0) {
				const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
				// Swap empty space with selected piece
				shuffled[emptyRow][emptyCol] = shuffled[randomMove.row][randomMove.col];
				shuffled[randomMove.row][randomMove.col] = 0;
				emptyRow = randomMove.row;
				emptyCol = randomMove.col;
			}
		}

		return shuffled;
	};

	const getValidMoves = (emptyRow: number, emptyCol: number) => {
		const { rows, cols } = question.puzzle;
		const validMoves = [];

		// Check all four directions
		const directions = [
			{ row: -1, col: 0 }, // Up
			{ row: 1, col: 0 }, // Down
			{ row: 0, col: -1 }, // Left
			{ row: 0, col: 1 }, // Right
		];

		for (const dir of directions) {
			const newRow = emptyRow + dir.row;
			const newCol = emptyCol + dir.col;

			if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
				validMoves.push({ row: newRow, col: newCol });
			}
		}

		return validMoves;
	};

	const handleTileClick = (clickedRow: number, clickedCol: number) => {
		if (isAnswered || disabled) return;

		// Check if clicked tile is adjacent to empty space
		const rowDiff = Math.abs(clickedRow - emptyPosition.row);
		const colDiff = Math.abs(clickedCol - emptyPosition.col);

		if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
			// Valid move - swap clicked tile with empty space
			const newState = puzzleState.map((row) => [...row]);
			newState[emptyPosition.row][emptyPosition.col] = newState[clickedRow][clickedCol];
			newState[clickedRow][clickedCol] = 0;

			setPuzzleState(newState);
			setEmptyPosition({ row: clickedRow, col: clickedCol });
			setMoves(moves + 1);

			// Check if puzzle is solved
			if (isPuzzleSolved(newState)) {
				onAnswer({
					value: newState,
					__isCorrect: true,
					moves,
					timeElapsed,
				});
			}
		}
	};

	const isPuzzleSolved = (state: number[][]) => {
		const { rows, cols } = question.puzzle;
		let expectedNumber = 1;

		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				if (row === rows - 1 && col === cols - 1) {
					// Last position should be empty (0)
					if (state[row][col] !== 0) return false;
				} else {
					if (state[row][col] !== expectedNumber) return false;
					expectedNumber++;
				}
			}
		}

		return true;
	};

	const resetPuzzle = () => {
		if (isAnswered || disabled) return;
		initializePuzzle();
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const getTileStyle = (row: number, col: number) => {
		const piece = puzzleState[row]?.[col];
		if (piece === 0) return "invisible"; // Empty space

		const validMoves = getValidMoves(emptyPosition.row, emptyPosition.col);
		const isMovable = validMoves.some((move) => move.row === row && move.col === col);

		return `
			bg-white border-2 border-border rounded-lg shadow-sm flex items-center justify-center
			cursor-pointer transition-all duration-200 font-bold text-lg
			${isMovable ? "hover:border-primary hover:shadow-md" : "cursor-not-allowed opacity-75"}
		`;
	};

	return (
		<div className="space-y-6">
			{/* Instructions and Stats */}
			<Card>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-muted-foreground mb-2">Arrange the puzzle pieces in numerical order by clicking adjacent tiles to the empty space.</p>
							<div className="flex items-center space-x-4 text-sm text-muted-foreground">
								<span>Moves: {moves}</span>
								{question.maxMoves && <span>Max: {question.maxMoves}</span>}
								<span>Time: {formatTime(timeElapsed)}</span>
								{question.timeLimit && <span>Limit: {formatTime(question.timeLimit)}</span>}
							</div>
						</div>

						{!isAnswered && (
							<div className="flex space-x-2">
								<Button variant="outline" size="sm" onClick={resetPuzzle} disabled={disabled}>
									<RotateCcw className="w-4 h-4 mr-2" />
									Reset
								</Button>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Puzzle Grid */}
			<Card>
				<CardContent className="p-6">
					<div className="flex justify-center">
						<div
							className="grid gap-2 p-4 bg-muted rounded-lg"
							style={{
								gridTemplateColumns: `repeat(${question.puzzle.cols}, 1fr)`,
								gridTemplateRows: `repeat(${question.puzzle.rows}, 1fr)`,
								width: "min(400px, 90vw)",
								height: "min(400px, 90vw)",
							}}
						>
							{puzzleState.map((row, rowIndex) =>
								row.map((piece, colIndex) => (
									<div
										key={`${rowIndex}-${colIndex}`}
										className={getTileStyle(rowIndex, colIndex)}
										onClick={() => handleTileClick(rowIndex, colIndex)}
										style={{
											aspectRatio: "1",
											minHeight: "40px",
										}}
									>
										{piece !== 0 && <span>{piece}</span>}
									</div>
								))
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Reference Image */}
			{question.puzzle.imageSrc && (
				<Card>
					<CardContent className="p-4">
						<h3 className="text-lg font-semibold mb-3">Reference Image</h3>
						<div className="flex justify-center">
							<img src={question.puzzle.imageSrc} alt="Puzzle reference" className="max-w-xs rounded-lg border-2 border-border" style={{ maxHeight: "200px" }} />
						</div>
					</CardContent>
				</Card>
			)}

			{/* Feedback */}
			{showFeedback && isAnswered && (
				<Card className="mt-6">
					<CardContent className="p-6">
						<div className="space-y-4">
							<div className="flex items-center space-x-2">
								{isPuzzleSolved(puzzleState) ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />}
								<span className={`font-semibold ${isPuzzleSolved(puzzleState) ? "text-success" : "text-destructive"}`}>{isPuzzleSolved(puzzleState) ? "Puzzle Solved!" : "Puzzle Incomplete"}</span>
								<span className="text-sm text-muted-foreground">
									({moves} moves in {formatTime(timeElapsed)})
								</span>
							</div>

							{question.explanation && (
								<div className="p-4 rounded-lg bg-blue-50 border border-primary/30">
									<p className="text-primary font-medium">Explanation:</p>
									<p className="text-primary mt-1">{question.explanation}</p>
								</div>
							)}

							{moves > 0 && (
								<div className="p-4 rounded-lg bg-gray-50 border border-border">
									<p className="text-foreground font-medium">Performance:</p>
									<ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground">
										<li>Total moves: {moves}</li>
										<li>Time taken: {formatTime(timeElapsed)}</li>
										{question.maxMoves && <li>Efficiency: {moves <= question.maxMoves ? "Excellent" : "Could be improved"}</li>}
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
