"use client";
import { useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Plane } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, RotateCcw, Eye, EyeOff, Layers, Zap } from "lucide-react";
import { Anatomy3DQuestion } from "@/types/questions";
import * as THREE from "three";

interface Anatomy3DRendererProps {
	question: Anatomy3DQuestion;
	onAnswer: (answer: any) => void;
	isAnswered: boolean;
	userAnswer?: { identifiedParts: string[]; labeledParts: Record<string, string> };
	showFeedback?: boolean;
	disabled?: boolean;
}

interface BodyPartMeshProps {
	part: (typeof Anatomy3DRenderer.question.bodyParts)[0];
	isVisible: boolean;
	isSelected: boolean;
	isIdentified: boolean;
	onPartClick: (partId: string) => void;
	showLabels: boolean;
	userLabel?: string;
	showFeedback: boolean;
}

function BodyPartMesh({ part, isVisible, isSelected, isIdentified, onPartClick, showLabels, userLabel, showFeedback }: BodyPartMeshProps) {
	const meshRef = useRef<THREE.Mesh>(null);

	// Gentle floating animation for highlighted parts
	useFrame((state) => {
		if (!meshRef.current || !isSelected) return;
		meshRef.current.position.y = part.position.y + Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
	});

	const material = useMemo(() => {
		let color = part.color;
		let emissive = "hsl(var(--background))";
		let opacity = 0.8;

		if (isSelected) {
			color = "hsl(var(--primary))";
emissive = "hsl(var(--primary))";
			opacity = 1;
		} else if (isIdentified && showFeedback) {
			color = "hsl(var(--success))";
emissive = "hsl(var(--success))";
			opacity = 0.9;
		} else if (!isVisible) {
			opacity = 0.1;
		}

		return new THREE.MeshStandardMaterial({
			color,
			emissive,
			emissiveIntensity: isSelected ? 0.3 : 0.1,
			opacity,
			transparent: true,
			roughness: 0.6,
			metalness: 0.1,
		});
	}, [part.color, isSelected, isIdentified, isVisible, showFeedback]);

	const handleClick = (event: any) => {
		event.stopPropagation();
		onPartClick(part.id);
	};

	if (!isVisible && !isSelected) {
		return null;
	}

	return (
		<group>
			{/* Body part mesh - simplified as sphere for demo */}
			<mesh
				ref={meshRef}
				position={[part.position.x, part.position.y, part.position.z]}
				onClick={handleClick}
				onPointerOver={(e) => {
					e.stopPropagation();
					document.body.style.cursor = "pointer";
				}}
				onPointerOut={(e) => {
					e.stopPropagation();
					document.body.style.cursor = "default";
				}}
			>
				<sphereGeometry args={[0.5, 16, 16]} />
				<primitive object={material} />
			</mesh>

			{/* Connections to other parts */}
			{part.connectedTo?.map((connectedId) => {
				const connectedPart = part.connectedTo?.includes(connectedId);
				if (!connectedPart) return null;

				// Simplified connection line
				return (
					<line key={connectedId}>
						<bufferGeometry>
							<bufferAttribute attach="attributes-position" array={new Float32Array([part.position.x, part.position.y, part.position.z, part.position.x + 1, part.position.y, part.position.z])} count={2} itemSize={3} />
						</bufferGeometry>
						<lineBasicMaterial color="hsl(var(--muted-foreground))666" opacity={0.5} transparent />
					</line>
				);
			})}

			{/* Label */}
			{(showLabels || isSelected) && (
				<Html position={[part.position.x, part.position.y + 1, part.position.z]}>
					<div className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${isSelected ? "bg-primary text-white" : isIdentified && showFeedback ? "bg-success text-white" : "bg-card text-white"}`}>{userLabel || part.name}</div>
				</Html>
			)}

			{/* Identification indicator */}
			{isIdentified && showFeedback && (
				<Html position={[part.position.x + 0.7, part.position.y + 0.7, part.position.z]}>
					<CheckCircle className="w-4 h-4 text-success" />
				</Html>
			)}
		</group>
	);
}

function CrossSectionPlane({ question, crossSection }: { question: Anatomy3DQuestion; crossSection: any }) {
	const planeRef = useRef<THREE.Mesh>(null);

	useFrame((state) => {
		if (!planeRef.current || !crossSection.animated) return;

		const time = state.clock.getElapsedTime();
		const oscillation = Math.sin(time * 0.5) * 2;

		switch (crossSection.plane) {
			case "x":
				planeRef.current.position.x = crossSection.position + oscillation;
				break;
			case "y":
				planeRef.current.position.y = crossSection.position + oscillation;
				break;
			case "z":
				planeRef.current.position.z = crossSection.position + oscillation;
				break;
		}
	});

	const rotation = useMemo(() => {
		switch (crossSection.plane) {
			case "x":
				return [0, Math.PI / 2, 0];
			case "y":
				return [Math.PI / 2, 0, 0];
			case "z":
				return [0, 0, 0];
			default:
				return [0, 0, 0];
		}
	}, [crossSection.plane]);

	return (
		<Plane ref={planeRef} args={[10, 10]} rotation={rotation} position={[crossSection.plane === "x" ? crossSection.position : 0, crossSection.plane === "y" ? crossSection.position : 0, crossSection.plane === "z" ? crossSection.position : 0]}>
			<meshBasicMaterial color="hsl(var(--destructive))" opacity={0.3} transparent side={THREE.DoubleSide} />
		</Plane>
	);
}

function AnatomyScene({ question, selectedPart, onPartClick, visibleSystems, identifiedParts, showLabels, userLabels, showFeedback, showCrossSection }: any) {
	return (
		<>
			{/* Lighting */}
			<ambientLight intensity={0.6} />
			<directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
			<pointLight position={[-10, 0, 5]} intensity={0.4} />
			<pointLight position={[10, 0, -5]} intensity={0.4} />

			{/* Body parts */}
			{question.bodyParts.map((part: any) => {
				const isVisible = visibleSystems.includes(part.system) && part.isVisible;
				const isSelected = selectedPart === part.id;
				const isIdentified = identifiedParts.includes(part.id);

				return <BodyPartMesh key={part.id} part={part} isVisible={isVisible} isSelected={isSelected} isIdentified={isIdentified} onPartClick={onPartClick} showLabels={showLabels} userLabel={userLabels[part.id]} showFeedback={showFeedback} />;
			})}

			{/* Cross-section plane */}
			{showCrossSection && question.crossSection?.enabled && <CrossSectionPlane question={question} crossSection={question.crossSection} />}

			{/* Camera controls */}
			<OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
		</>
	);
}

export function Anatomy3DRenderer({ question, onAnswer, isAnswered, userAnswer, showFeedback = false, disabled = false }: Anatomy3DRendererProps) {
	const [selectedPart, setSelectedPart] = useState<string | null>(null);
	const [identifiedParts, setIdentifiedParts] = useState<string[]>(userAnswer?.identifiedParts || []);
	const [userLabels, setUserLabels] = useState<Record<string, string>>(userAnswer?.labeledParts || {});
	const [visibleSystems, setVisibleSystems] = useState<string[]>(question.showSystems);
	const [showLabels, setShowLabels] = useState(false);
	const [showCrossSection, setShowCrossSection] = useState(false);
	const [currentView, setCurrentView] = useState(question.model.defaultView);

	// Get unique body systems
	const availableSystems = useMemo(() => {
		const systems = [...new Set(question.bodyParts.map((part) => part.system))];
		return systems;
	}, [question.bodyParts]);

	const handlePartClick = (partId: string) => {
		if (isAnswered || disabled) return;

		setSelectedPart(partId);

		switch (question.interactionMode) {
			case "identify":
				if (!identifiedParts.includes(partId)) {
					setIdentifiedParts([...identifiedParts, partId]);
				}
				break;

			case "quiz":
				// For quiz mode, just select the part
				break;

			case "systems":
				// Toggle system visibility based on clicked part
				const part = question.bodyParts.find((p) => p.id === partId);
				if (part) {
					setVisibleSystems((prev) => (prev.includes(part.system) ? prev.filter((s) => s !== part.system) : [...prev, part.system]));
				}
				break;
		}
	};

	const handleLabelInput = (partId: string, label: string) => {
		if (isAnswered || disabled) return;
		setUserLabels((prev) => ({ ...prev, [partId]: label }));
	};

	const toggleSystem = (system: string) => {
		if (isAnswered || disabled) return;

		setVisibleSystems((prev) => (prev.includes(system) ? prev.filter((s) => s !== system) : [...prev, system]));
	};

	const handleSubmit = () => {
		if (isAnswered || disabled) return;

		let isCorrect = false;
		let score = 0;

		switch (question.interactionMode) {
			case "identify":
				const targetParts = question.bodyParts.filter((part) => part.isTarget);
				isCorrect = targetParts.every((part) => identifiedParts.includes(part.id));
				score = identifiedParts.filter((id) => question.bodyParts.find((p) => p.id === id)?.isTarget).length;
				break;

			case "quiz":
				// Check if correct parts are identified
				const correctIdentifications = identifiedParts.filter((id) => question.bodyParts.find((p) => p.id === id)?.isTarget);
				isCorrect = correctIdentifications.length === question.bodyParts.filter((p) => p.isTarget).length;
				score = correctIdentifications.length;
				break;
		}

		if (question.labelingRequired) {
			const labelScore = Object.keys(userLabels).filter((partId) => {
				const part = question.bodyParts.find((p) => p.id === partId);
				return part && userLabels[partId].toLowerCase() === part.name.toLowerCase();
			}).length;

			score += labelScore;
			isCorrect = isCorrect && labelScore === question.bodyParts.filter((p) => p.isTarget).length;
		}

		onAnswer({
			value: { identifiedParts, labeledParts: userLabels },
			__isCorrect: isCorrect,
			score,
			maxScore: question.bodyParts.filter((p) => p.isTarget).length * (question.labelingRequired ? 2 : 1),
		});
	};

	const resetView = () => {
		if (isAnswered || disabled) return;
		setSelectedPart(null);
		setIdentifiedParts([]);
		setUserLabels({});
		setVisibleSystems(question.showSystems);
		setCurrentView(question.model.defaultView);
	};

	const getSystemColor = (system: string) => {
		const colors = {
			skeletal: "hsl(var(--primary))",
muscular: "hsl(var(--destructive))",
nervous: "hsl(var(--warning))",
circulatory: "hsl(var(--destructive))",
respiratory: "hsl(var(--success))",
digestive: "hsl(var(--warning))",
endocrine: "hsl(var(--muted-foreground))",
immune: "hsl(var(--success))",
integumentary: "hsl(var(--muted))",
urinary: "hsl(var(--primary))",
		};
		return colors[system as keyof typeof colors] || "hsl(var(--muted))";
	};

	return (
		<div className="space-y-6">
			{/* Instructions and Controls */}
			<Card>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-muted-foreground mb-2">
								{question.interactionMode === "identify" && "Click on body parts to identify them."}
								{question.interactionMode === "quiz" && "Answer questions about the highlighted body parts."}
								{question.interactionMode === "systems" && "Explore different body systems by clicking parts."}
								{question.interactionMode === "assemble" && "Drag and drop body parts to assemble the model."}
							</p>
							<div className="flex items-center space-x-4 text-sm text-muted-foreground">
								<span>Type: {question.anatomyType}</span>
								<span>Identified: {identifiedParts.length}</span>
								{question.labelingRequired && <span>Labeled: {Object.keys(userLabels).length}</span>}
							</div>
						</div>

						<div className="flex space-x-2">
							<Button variant="outline" size="sm" onClick={() => setShowLabels(!showLabels)} disabled={disabled}>
								{showLabels ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
								<span className="ml-2">Labels</span>
							</Button>

							{question.crossSection?.enabled && (
								<Button variant="outline" size="sm" onClick={() => setShowCrossSection(!showCrossSection)} disabled={disabled}>
									<Layers className="w-4 h-4 mr-2" />
									X-Ray
								</Button>
							)}

							{!isAnswered && (
								<Button variant="outline" onClick={resetView} disabled={disabled}>
									<RotateCcw className="w-4 h-4 mr-2" />
									Reset
								</Button>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* 3D Anatomy Model */}
			<Card>
				<CardContent className="p-0">
					<div className="h-96 w-full">
						<Canvas shadows camera={{ position: [5, 5, 5], fov: 60 }} style={{ background: "hsl(var(--muted))" }}>
							<AnatomyScene question={question} selectedPart={selectedPart} onPartClick={handlePartClick} visibleSystems={visibleSystems} identifiedParts={identifiedParts} showLabels={showLabels} userLabels={userLabels} showFeedback={showFeedback} showCrossSection={showCrossSection} />
						</Canvas>
					</div>
				</CardContent>
			</Card>

			{/* Body Systems Control */}
			<Card>
				<CardContent className="p-4">
					<h3 className="text-lg font-semibold mb-3">Body Systems</h3>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
						{availableSystems.map((system) => (
							<Button
								key={system}
								variant={visibleSystems.includes(system) ? "default" : "outline"}
								size="sm"
								onClick={() => toggleSystem(system)}
								disabled={disabled}
								style={{
									backgroundColor: visibleSystems.includes(system) ? getSystemColor(system) : undefined,
									borderColor: getSystemColor(system),
								}}
							>
								<Zap className="w-3 h-3 mr-1" />
								{system}
							</Button>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Selected Part Info */}
			{selectedPart && (
				<Card>
					<CardContent className="p-4">
						{(() => {
							const part = question.bodyParts.find((p) => p.id === selectedPart);
							if (!part) return null;

							return (
								<div className="space-y-3">
									<h3 className="text-lg font-semibold">{part.name}</h3>
									<p className="text-muted-foreground">{part.description}</p>
									<div className="flex items-center space-x-4 text-sm text-muted-foreground">
										<span>
											System: <span className="font-medium">{part.system}</span>
										</span>
										<span>
											Position: ({part.position.x}, {part.position.y}, {part.position.z})
										</span>
									</div>

									{question.labelingRequired && !isAnswered && (
										<div className="flex items-center space-x-2">
											<label className="text-sm font-medium">Label:</label>
											<input type="text" value={userLabels[part.id] || ""} onChange={(e) => handleLabelInput(part.id, e.target.value)} className="flex-1 px-2 py-1 border rounded text-sm" placeholder="Enter part name..." disabled={disabled} />
										</div>
									)}
								</div>
							);
						})()}
					</CardContent>
				</Card>
			)}

			{/* Submit Button */}
			{!isAnswered && question.interactionMode !== "systems" && (
				<div className="flex justify-center">
					<Button onClick={handleSubmit} size="lg" disabled={disabled}>
						Submit {question.interactionMode === "identify" ? "Identification" : "Answers"}
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
									const targetParts = question.bodyParts.filter((part) => part.isTarget);
									const correctIdentifications = identifiedParts.filter((id) => question.bodyParts.find((p) => p.id === id)?.isTarget);
									const isCorrect = correctIdentifications.length === targetParts.length;

									return (
										<>
											{isCorrect ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />}
											<span className={`font-semibold ${isCorrect ? "text-success" : "text-destructive"}`}>{isCorrect ? "Excellent Anatomy Knowledge!" : "Some parts need review"}</span>
											<span className="text-sm text-muted-foreground">
												({correctIdentifications.length} / {targetParts.length} correct)
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

							{/* Detailed results */}
							<div className="p-4 rounded-lg bg-gray-50 border border-border">
								<p className="text-foreground font-medium mb-2">Results by System:</p>
								{availableSystems.map((system) => {
									const systemParts = question.bodyParts.filter((p) => p.system === system && p.isTarget);
									const correctSystemParts = systemParts.filter((p) => identifiedParts.includes(p.id));

									return (
										<div key={system} className="flex justify-between items-center py-1">
											<span className="text-muted-foreground capitalize">{system}:</span>
											<span className={`font-medium ${correctSystemParts.length === systemParts.length ? "text-success" : "text-destructive"}`}>
												{correctSystemParts.length} / {systemParts.length}
											</span>
										</div>
									);
								})}
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
