"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Plane, Html, Environment } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, RotateCcw, Search, HelpCircle } from "lucide-react";
import { Scene3DExplorationQuestion } from "@/types/questions";
import * as THREE from "three";

interface Scene3DExplorationRendererProps {
	question: Scene3DExplorationQuestion;
	onAnswer: (answer: any) => void;
	isAnswered: boolean;
	userAnswer?: { foundTargets: string[]; timeSpent: number; hintsUsed: number };
	showFeedback?: boolean;
	disabled?: boolean;
}

interface Interactive3DObjectProps {
	object: (typeof Scene3DExplorationRenderer.question.objects)[0];
	onClick: (objectId: string) => void;
	isFound: boolean;
	isHighlighted: boolean;
	showFeedback: boolean;
}

function Interactive3DObject({ object, onClick, isFound, isHighlighted, showFeedback }: Interactive3DObjectProps) {
	const meshRef = useRef<THREE.Mesh>(null);

	// Animation
	useFrame((state) => {
		if (!meshRef.current || !object.animation) return;

		const { animation } = object;
		const time = state.clock.getElapsedTime();

		switch (animation.type) {
			case "rotation":
				meshRef.current.rotation.y = time * (Math.PI / animation.duration);
				break;
			case "position":
				meshRef.current.position.y = object.position.y + Math.sin(time * (Math.PI / animation.duration)) * 0.5;
				break;
			case "scale":
				const scale = 1 + Math.sin(time * (Math.PI / animation.duration)) * 0.1;
				meshRef.current.scale.setScalar(scale);
				break;
		}
	});

	const material = useMemo(() => {
		const baseColor = object.material.color || "hsl(var(--background))";
		const emissive = object.material.emissive || "hsl(var(--background))";

		if (isHighlighted) {
			return new THREE.MeshStandardMaterial({
				color: "hsl(var(--primary))",
emissive: "hsl(var(--primary))",
				emissiveIntensity: 0.3,
			});
		}

		if (isFound && showFeedback) {
			return new THREE.MeshStandardMaterial({
				color: "hsl(var(--success))",
emissive: "hsl(var(--success))",
				emissiveIntensity: 0.2,
			});
		}

		return new THREE.MeshStandardMaterial({
			color: baseColor,
			emissive: emissive,
			map: object.material.texture ? new THREE.TextureLoader().load(object.material.texture) : undefined,
		});
	}, [object.material, isHighlighted, isFound, showFeedback]);

	const geometry = useMemo(() => {
		switch (object.geometry) {
			case "sphere":
				return new THREE.SphereGeometry(1, 32, 32);
			case "cylinder":
				return new THREE.CylinderGeometry(1, 1, 2, 32);
			case "plane":
				return new THREE.PlaneGeometry(2, 2);
			case "box":
			default:
				return new THREE.BoxGeometry(1, 1, 1);
		}
	}, [object.geometry]);

	const handleClick = (event: any) => {
		event.stopPropagation();
		onClick(object.id);
	};

	if (object.hidden && !isFound) {
		return null;
	}

	return (
		<group>
			<mesh
				ref={meshRef}
				position={[object.position.x, object.position.y, object.position.z]}
				geometry={geometry}
				material={material}
				onClick={handleClick}
				onPointerOver={(e) => {
					e.stopPropagation();
					document.body.style.cursor = "pointer";
				}}
				onPointerOut={(e) => {
					e.stopPropagation();
					document.body.style.cursor = "default";
				}}
			/>

			{/* Object label */}
			{(isFound || isHighlighted) && (
				<Html position={[object.position.x, object.position.y + 2, object.position.z]}>
					<div className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${isFound ? "bg-success text-white" : "bg-primary text-white"}`}>{object.name}</div>
				</Html>
			)}

			{/* Found indicator */}
			{isFound && showFeedback && (
				<Html position={[object.position.x, object.position.y + 1.5, object.position.z]}>
					<CheckCircle className="w-6 h-6 text-success" />
				</Html>
			)}
		</group>
	);
}

function ExplorationScene({ question, onObjectClick, foundTargets, highlightedObject, showFeedback }: any) {
	return (
		<>
			{/* Environment */}
			{question.scene.environmentUrl && <Environment files={question.scene.environmentUrl} />}

			{/* Lighting */}
			<ambientLight intensity={0.6} />
			<directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
			<pointLight position={[-10, 0, -5]} intensity={0.4} />

			{/* Fog */}
			{question.scene.fog && <fog attach="fog" args={[question.scene.fog.color, question.scene.fog.near, question.scene.fog.far]} />}

			{/* Ground */}
			<Plane rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} args={[50, 50]}>
				<meshStandardMaterial color="hsl(var(--muted))" />
			</Plane>

			{/* Objects */}
			{question.objects.map((object) => (
				<Interactive3DObject key={object.id} object={object} onClick={onObjectClick} isFound={foundTargets.includes(object.id)} isHighlighted={highlightedObject === object.id} showFeedback={showFeedback} />
			))}

			{/* Camera controls */}
			<OrbitControls enablePan={true} enableZoom={true} enableRotate={true} minDistance={question.camera.restrictions?.minDistance || 5} maxDistance={question.camera.restrictions?.maxDistance || 50} minPolarAngle={question.camera.restrictions?.minPolarAngle || 0} maxPolarAngle={question.camera.restrictions?.maxPolarAngle || Math.PI} />
		</>
	);
}

export function Scene3DExplorationRenderer({ question, onAnswer, isAnswered, userAnswer, showFeedback = false, disabled = false }: Scene3DExplorationRendererProps) {
	const [foundTargets, setFoundTargets] = useState<string[]>(userAnswer?.foundTargets || []);
	const [timeElapsed, setTimeElapsed] = useState(userAnswer?.timeSpent || 0);
	const [hintsUsed, setHintsUsed] = useState(userAnswer?.hintsUsed || 0);
	const [highlightedObject, setHighlightedObject] = useState<string | null>(null);
	const [showHint, setShowHint] = useState(false);
	const [hintCooldown, setHintCooldown] = useState(0);
	const [gameStarted, setGameStarted] = useState(false);

	// Timer
	useEffect(() => {
		if (!gameStarted || isAnswered || disabled) return;

		const timer = setInterval(() => {
			setTimeElapsed((prev) => {
				const newTime = prev + 1;

				// Check time limit
				if (question.timeLimit && newTime >= question.timeLimit) {
					handleTimeUp();
				}

				return newTime;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [gameStarted, isAnswered, disabled, question.timeLimit]);

	// Hint cooldown timer
	useEffect(() => {
		if (hintCooldown <= 0) return;

		const timer = setInterval(() => {
			setHintCooldown((prev) => Math.max(0, prev - 1));
		}, 1000);

		return () => clearInterval(timer);
	}, [hintCooldown]);

	const handleObjectClick = (objectId: string) => {
		if (isAnswered || disabled || !gameStarted) return;

		const object = question.objects.find((obj) => obj.id === objectId);
		if (!object) return;

		if (object.isTarget && !foundTargets.includes(objectId)) {
			const newFoundTargets = [...foundTargets, objectId];
			setFoundTargets(newFoundTargets);

			// Check if all targets are found
			if (newFoundTargets.length === question.findTargets.length) {
				onAnswer({
					value: { foundTargets: newFoundTargets, timeSpent: timeElapsed, hintsUsed },
					__isCorrect: true,
					completionTime: timeElapsed,
					hintsUsed,
				});
			}
		} else {
			// Wrong object - show brief highlight
			setHighlightedObject(objectId);
			setTimeout(() => setHighlightedObject(null), 1000);
		}
	};

	const handleTimeUp = () => {
		onAnswer({
			value: { foundTargets, timeSpent: timeElapsed, hintsUsed },
			__isCorrect: foundTargets.length === question.findTargets.length,
			completionTime: timeElapsed,
			hintsUsed,
		});
	};

	const startExploration = () => {
		setGameStarted(true);
		setTimeElapsed(0);
		setFoundTargets([]);
		setHintsUsed(0);
	};

	const useHint = () => {
		if (!question.hintSystem?.enabled || hintCooldown > 0 || hintsUsed >= (question.hintSystem.maxHints || 3)) return;

		// Find next target not yet found
		const remainingTargets = question.findTargets.filter((targetId) => !foundTargets.includes(targetId));
		if (remainingTargets.length === 0) return;

		const nextTarget = remainingTargets[0];
		const targetObject = question.objects.find((obj) => obj.id === nextTarget);

		if (targetObject) {
			setHighlightedObject(nextTarget);
			setShowHint(true);
			setHintsUsed(hintsUsed + 1);
			setHintCooldown(question.hintSystem.hintCooldown || 30);

			// Clear hint after 5 seconds
			setTimeout(() => {
				setShowHint(false);
				setHighlightedObject(null);
			}, 5000);
		}
	};

	const resetExploration = () => {
		if (isAnswered || disabled) return;
		setGameStarted(false);
		setFoundTargets([]);
		setTimeElapsed(0);
		setHintsUsed(0);
		setHighlightedObject(null);
		setShowHint(false);
		setHintCooldown(0);
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const getRemainingTime = () => {
		if (!question.timeLimit) return null;
		return Math.max(0, question.timeLimit - timeElapsed);
	};

	return (
		<div className="space-y-6">
			{/* Instructions and Stats */}
			<Card>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-muted-foreground mb-2">Explore the 3D scene and find all {question.findTargets.length} target objects. Click on objects to interact with them.</p>
							<div className="flex items-center space-x-4 text-sm text-muted-foreground">
								<span>
									Found: {foundTargets.length} / {question.findTargets.length}
								</span>
								<span>Time: {formatTime(timeElapsed)}</span>
								{question.timeLimit && <span className={getRemainingTime()! < 30 ? "text-destructive font-bold" : ""}>Remaining: {formatTime(getRemainingTime()!)}</span>}
								{question.hintSystem?.enabled && (
									<span>
										Hints: {hintsUsed} / {question.hintSystem.maxHints}
									</span>
								)}
							</div>
						</div>

						<div className="flex space-x-2">
							{!gameStarted ? (
								<Button onClick={startExploration} disabled={disabled} className="flex items-center space-x-2">
									<Search className="w-4 h-4" />
									<span>Start Exploration</span>
								</Button>
							) : (
								<>
									{question.hintSystem?.enabled && (
										<Button variant="outline" size="sm" onClick={useHint} disabled={disabled || hintCooldown > 0 || hintsUsed >= (question.hintSystem.maxHints || 3)}>
											<HelpCircle className="w-4 h-4 mr-2" />
											{hintCooldown > 0 ? `Hint (${hintCooldown}s)` : "Hint"}
										</Button>
									)}
									<Button variant="outline" onClick={resetExploration} disabled={disabled || isAnswered}>
										<RotateCcw className="w-4 h-4 mr-2" />
										Reset
									</Button>
								</>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Hint Display */}
			{showHint && highlightedObject && (
				<Card className="border-yellow-500 bg-yellow-50">
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<HelpCircle className="w-5 h-5 text-warning" />
							<span className="text-warning font-medium">Hint: Look for "{question.objects.find((obj) => obj.id === highlightedObject)?.name}" - it's highlighted in blue!</span>
						</div>
					</CardContent>
				</Card>
			)}

			{/* 3D Scene */}
			{gameStarted && (
				<Card>
					<CardContent className="p-0">
						<div className="h-96 w-full">
							<Canvas
								shadows
								camera={{
									position: [question.camera.position.x, question.camera.position.y, question.camera.position.z],
									fov: 75,
								}}
								style={{ background: question.scene.backgroundColor }}
							>
								<ExplorationScene question={question} onObjectClick={handleObjectClick} foundTargets={foundTargets} highlightedObject={highlightedObject} showFeedback={showFeedback} />
							</Canvas>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Target Objects List */}
			<Card>
				<CardContent className="p-4">
					<h3 className="text-lg font-semibold mb-3">Target Objects to Find</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
						{question.findTargets.map((targetId) => {
							const targetObject = question.objects.find((obj) => obj.id === targetId);
							const isFound = foundTargets.includes(targetId);

							return (
								<div key={targetId} className={`p-3 rounded-lg border-2 transition-all duration-200 ${isFound ? "border-green-500 bg-green-50" : "border-border bg-gray-50"}`}>
									<div className="flex items-center space-x-3">
										{isFound ? <CheckCircle className="w-5 h-5 text-success" /> : <div className="w-5 h-5 rounded-full border-2 border-border" />}
										<div>
											<p className="font-medium">{targetObject?.name}</p>
											<p className="text-sm text-muted-foreground">{targetObject?.description}</p>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>

			{/* Progress */}
			{gameStarted && (
				<Card>
					<CardContent className="p-4">
						<div className="space-y-2">
							<div className="flex justify-between items-center text-sm">
								<span>Progress</span>
								<span>
									{foundTargets.length} / {question.findTargets.length} found
								</span>
							</div>
							<div className="w-full bg-muted rounded-full h-2">
								<div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${(foundTargets.length / question.findTargets.length) * 100}%` }} />
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
								{foundTargets.length === question.findTargets.length ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />}
								<span className={`font-semibold ${foundTargets.length === question.findTargets.length ? "text-success" : "text-destructive"}`}>{foundTargets.length === question.findTargets.length ? "Excellent Exploration!" : "Exploration Incomplete"}</span>
								<span className="text-sm text-muted-foreground">
									({foundTargets.length} / {question.findTargets.length} found in {formatTime(timeElapsed)})
								</span>
							</div>

							{question.explanation && (
								<div className="p-4 rounded-lg bg-blue-50 border border-primary/30">
									<p className="text-primary font-medium">Explanation:</p>
									<p className="text-primary mt-1">{question.explanation}</p>
								</div>
							)}

							{/* Performance metrics */}
							<div className="p-4 rounded-lg bg-gray-50 border border-border">
								<p className="text-foreground font-medium mb-2">Exploration Results:</p>
								<ul className="list-disc list-inside space-y-1 text-muted-foreground">
									<li>
										Objects found: {foundTargets.length} / {question.findTargets.length}
									</li>
									<li>Time taken: {formatTime(timeElapsed)}</li>
									<li>Hints used: {hintsUsed}</li>
									<li>Efficiency: {question.timeLimit && timeElapsed <= question.timeLimit * 0.5 ? "Excellent" : question.timeLimit && timeElapsed <= question.timeLimit * 0.75 ? "Good" : "Could be improved"}</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
