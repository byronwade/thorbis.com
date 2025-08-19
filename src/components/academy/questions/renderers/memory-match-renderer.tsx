"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, RotateCcw, Eye } from "lucide-react";
import { MemoryMatchQuestion } from "@/types/questions";

interface MemoryMatchRendererProps {
	question: MemoryMatchQuestion;
	onAnswer: (answer: any) => void;
	isAnswered: boolean;
	userAnswer?: { matches: number; attempts: number };
	showFeedback?: boolean;
	disabled?: boolean;
}

export function MemoryMatchRenderer({ question, onAnswer, isAnswered, userAnswer, showFeedback = false, disabled = false }: MemoryMatchRendererProps) {
	const [flippedCards, setFlippedCards] = useState<string[]>([]);
	const [matchedCards, setMatchedCards] = useState<string[]>([]);
	const [attempts, setAttempts] = useState(0);
	const [gameStarted, setGameStarted] = useState(false);
	const [showPreview, setShowPreview] = useState(false);
	const [shuffledCards, setShuffledCards] = useState<typeof question.cards>([]);

	// Initialize game
	useEffect(() => {
		if (userAnswer) {
			// Restore previous state if available
			setAttempts(userAnswer.attempts);
		}
		shuffleCards();
	}, [question]);

	// Show preview effect
	useEffect(() => {
		if (question.showTime && gameStarted && !showPreview) {
			setShowPreview(true);
			const timer = setTimeout(() => {
				setShowPreview(false);
			}, question.showTime);

			return () => clearTimeout(timer);
		}
	}, [gameStarted, question.showTime]);

	const shuffleCards = () => {
		// Create pairs of cards
		const cardPairs: typeof question.cards = [];
		question.cards.forEach((card) => {
			// Add the card twice to create a pair
			cardPairs.push({ ...card, id: `${card.id}-1` });
			cardPairs.push({ ...card, id: `${card.id}-2` });
		});

		// Shuffle the cards
		const shuffled = [...cardPairs].sort(() => Math.random() - 0.5);
		setShuffledCards(shuffled);
	};

	const handleCardClick = (cardId: string) => {
		if (isAnswered || disabled || !gameStarted || flippedCards.length >= 2) return;
		if (flippedCards.includes(cardId) || matchedCards.includes(cardId)) return;

		const newFlippedCards = [...flippedCards, cardId];
		setFlippedCards(newFlippedCards);

		if (newFlippedCards.length === 2) {
			// Check for match
			const card1 = shuffledCards.find((c) => c.id === newFlippedCards[0]);
			const card2 = shuffledCards.find((c) => c.id === newFlippedCards[1]);

			if (card1 && card2 && card1.matchGroup === card2.matchGroup) {
				// Match found!
				setTimeout(() => {
					setMatchedCards((prev) => [...prev, ...newFlippedCards]);
					setFlippedCards([]);

					// Check if game is complete
					if (matchedCards.length + 2 === shuffledCards.length) {
						onAnswer({
							value: { matches: (matchedCards.length + 2) / 2, attempts: attempts + 1 },
							__isCorrect: true,
							totalAttempts: attempts + 1,
						});
					}
				}, 1000);
			} else {
				// No match
				setTimeout(() => {
					setFlippedCards([]);
				}, 1500);
			}

			setAttempts(attempts + 1);

			// Check max attempts
			if (question.maxAttempts && attempts + 1 >= question.maxAttempts) {
				onAnswer({
					value: { matches: matchedCards.length / 2, attempts: attempts + 1 },
					__isCorrect: matchedCards.length === shuffledCards.length,
					totalAttempts: attempts + 1,
				});
			}
		}
	};

	const startGame = () => {
		setGameStarted(true);
		setFlippedCards([]);
		setMatchedCards([]);
		setAttempts(0);
	};

	const resetGame = () => {
		if (isAnswered || disabled) return;
		setGameStarted(false);
		setShowPreview(false);
		setFlippedCards([]);
		setMatchedCards([]);
		setAttempts(0);
		shuffleCards();
	};

	const isCardVisible = (cardId: string) => {
		return showPreview || flippedCards.includes(cardId) || matchedCards.includes(cardId);
	};

	const getCardStyle = (cardId: string) => {
		if (matchedCards.includes(cardId)) {
			return "border-green-500 bg-success/10 transform scale-95";
		}
		if (flippedCards.includes(cardId)) {
			return "border-primary bg-primary/10";
		}
		return "border-border bg-white hover:border-border cursor-pointer";
	};

	return (
		<div className="space-y-6">
			{/* Instructions and Stats */}
			<Card>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-muted-foreground mb-2">Find matching pairs by flipping two cards at a time. Try to complete the game with as few attempts as possible!</p>
							<div className="flex items-center space-x-4 text-sm text-muted-foreground">
								<span>Attempts: {attempts}</span>
								{question.maxAttempts && <span>Max: {question.maxAttempts}</span>}
								<span>
									Matches: {matchedCards.length / 2} / {question.cards.length}
								</span>
							</div>
						</div>

						<div className="flex space-x-2">
							{!gameStarted ? (
								<Button onClick={startGame} disabled={disabled} className="flex items-center space-x-2">
									<Eye className="w-4 h-4" />
									<span>Start Game</span>
								</Button>
							) : (
								<Button variant="outline" onClick={resetGame} disabled={disabled || isAnswered}>
									<RotateCcw className="w-4 h-4 mr-2" />
									Reset
								</Button>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Game Status */}
			{question.showTime && gameStarted && showPreview && (
				<Card className="border-primary bg-blue-50">
					<CardContent className="p-4 text-center">
						<p className="text-primary font-medium">Study the cards! They will flip over soon...</p>
					</CardContent>
				</Card>
			)}

			{/* Memory Game Grid */}
			{gameStarted && (
				<Card>
					<CardContent className="p-6">
						<div
							className="grid gap-4 mx-auto max-w-4xl"
							style={{
								gridTemplateColumns: `repeat(${Math.min(6, Math.ceil(Math.sqrt(shuffledCards.length)))}, 1fr)`,
							}}
						>
							{shuffledCards.map((card) => (
								<div key={card.id} className={`aspect-square rounded-lg border-2 transition-all duration-300 flex items-center justify-center p-2 ${getCardStyle(card.id)}`} onClick={() => handleCardClick(card.id)}>
									{isCardVisible(card.id) ? (
										<div className="text-center">{card.type === "image" && card.src ? <img src={card.src} alt={card.content} className="w-full h-full object-cover rounded" /> : <span className="font-medium text-sm text-center break-words">{card.content}</span>}</div>
									) : (
										<div className="w-full h-full bg-muted rounded flex items-center justify-center">
											<span className="text-muted-foreground text-2xl">?</span>
										</div>
									)}
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Match Groups Reference */}
			{!gameStarted && (
				<Card>
					<CardContent className="p-4">
						<h3 className="text-lg font-semibold mb-3">Card Categories</h3>
						<div className="space-y-3">
							{Array.from(new Set(question.cards.map((card) => card.matchGroup))).map((group) => (
								<div key={group} className="flex items-center space-x-3">
									<div className="w-4 h-4 rounded-full bg-primary" />
									<span className="font-medium">{group}</span>
									<span className="text-sm text-muted-foreground">({question.cards.filter((card) => card.matchGroup === group).length} cards)</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Progress */}
			{gameStarted && (
				<Card>
					<CardContent className="p-4">
						<div className="space-y-2">
							<div className="flex justify-between items-center text-sm">
								<span>Progress</span>
								<span>
									{matchedCards.length / 2} / {question.cards.length} pairs
								</span>
							</div>
							<div className="w-full bg-muted rounded-full h-2">
								<div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${(matchedCards.length / (question.cards.length * 2)) * 100}%` }} />
							</div>
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
								{matchedCards.length === shuffledCards.length ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />}
								<span className={`font-semibold ${matchedCards.length === shuffledCards.length ? "text-success" : "text-destructive"}`}>{matchedCards.length === shuffledCards.length ? "Perfect Memory!" : "Game Incomplete"}</span>
								<span className="text-sm text-muted-foreground">
									({matchedCards.length / 2} matches in {attempts} attempts)
								</span>
							</div>

							{question.explanation && (
								<div className="p-4 rounded-lg bg-blue-50 border border-primary/30">
									<p className="text-primary font-medium">Explanation:</p>
									<p className="text-primary mt-1">{question.explanation}</p>
								</div>
							)}

							{/* Performance Rating */}
							<div className="p-4 rounded-lg bg-gray-50 border border-border">
								<p className="text-foreground font-medium mb-2">Performance:</p>
								<ul className="list-disc list-inside space-y-1 text-muted-foreground">
									<li>Total attempts: {attempts}</li>
									<li>Success rate: {((matchedCards.length / 2 / attempts) * 100).toFixed(1)}%</li>
									<li>Rating: {attempts <= question.cards.length ? "Excellent" : attempts <= question.cards.length * 1.5 ? "Good" : "Needs Practice"}</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
