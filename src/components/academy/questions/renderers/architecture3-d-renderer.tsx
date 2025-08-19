"use client";
import { useState, useRef, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Box, Cylinder, Html } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, RotateCcw, Eye, EyeOff, Layers, DollarSign, Clock } from "lucide-react";
import { Architecture3DQuestion } from "@/types/questions";
import * as THREE from "three";

interface Architecture3DRendererProps {
	question: Architecture3DQuestion;
	onAnswer: (answer: any) => void;
	isAnswered: boolean;
	userAnswer?: { placedComponents: string[]; currentPhase: string; totalCost: number; errors: string[] };
	showFeedback?: boolean;
	disabled?: boolean;
}

interface BuildingComponentProps {
	component: (typeof Architecture3DRenderer.question.components)[0];
	isPlaced: boolean;
	isSelected: boolean;
	isCorrectlyPlaced: boolean;
	onComponentClick: (componentId: string) => void;
	showBlueprint: boolean;
	showFeedback: boolean;
}

function BuildingComponent({ component, isPlaced, isSelected, isCorrectlyPlaced, onComponentClick, showBlueprint, showFeedback }: BuildingComponentProps) {
	const meshRef = useRef<THREE.Mesh>(null);

	const material = useMemo(() => {
		const getMaterialColor = () => {
			if (isSelected) return "hsl(var(--primary))";
if (showFeedback && isCorrectlyPlaced) return "hsl(var(--success))";
if (showFeedback && isPlaced && !isCorrectlyPlaced) return "hsl(var(--destructive))";

			// Material-based colors
			switch (component.material.type) {
				case "wood":
return "hsl(var(--muted-foreground))";
case "steel":
return "hsl(var(--muted-foreground))";
case "concrete":
return "hsl(var(--muted-foreground))";
case "brick":
return "hsl(var(--destructive))";
case "pipe":
return "hsl(var(--primary))";
case "wire":
return "hsl(var(--warning))";
				default:
					return component.material.color;
			}
		};

		return new THREE.MeshStandardMaterial({
			color: getMaterialColor(),
			roughness: 0.6,
			metalness: component.material.type === "steel" ? 0.8 : 0.1,
			transparent: !isPlaced && showBlueprint,
			opacity: !isPlaced && showBlueprint ? 0.3 : 1,
		});
	}, [component.material, isSelected, isPlaced, isCorrectlyPlaced, showBlueprint, showFeedback]);

	const handleClick = (event: any) => {
		event.stopPropagation();
		onComponentClick(component.id);
	};

	const renderGeometry = () => {
		const { width, height, depth } = component.dimensions;

		switch (component.geometry) {
			case "cylinder":
				return <Cylinder ref={meshRef} args={[width / 2, width / 2, height, 16]} position={[component.requiredPosition.x, component.requiredPosition.y, component.requiredPosition.z]} rotation={[component.requiredRotation.x, component.requiredRotation.y, component.requiredRotation.z]} material={material} onClick={handleClick} />;
			case "box":
			default:
				return <Box ref={meshRef} args={[width, height, depth]} position={[component.requiredPosition.x, component.requiredPosition.y, component.requiredPosition.z]} rotation={[component.requiredRotation.x, component.requiredRotation.y, component.requiredRotation.z]} material={material} onClick={handleClick} />;
		}
	};

	return (
		<group>
			{/* Blueprint outline */}
			{showBlueprint && (
				<Box args={[component.dimensions.width, component.dimensions.height, component.dimensions.depth]} position={[component.requiredPosition.x, component.requiredPosition.y, component.requiredPosition.z]} rotation={[component.requiredRotation.x, component.requiredRotation.y, component.requiredRotation.z]}>
					<meshBasicMaterial color="hsl(var(--primary))" wireframe />
				</Box>
			)}

			{/* Actual component */}
			{isPlaced && renderGeometry()}

			{/* Component label */}
			{(isSelected || (showFeedback && isPlaced)) && (
				<Html position={[component.requiredPosition.x, component.requiredPosition.y + component.dimensions.height / 2 + 1, component.requiredPosition.z]}>
					<div className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${isSelected ? "bg-primary text-white" : isCorrectlyPlaced ? "bg-success text-white" : "bg-destructive text-white"}`}>
						{component.name}
						{component.cost && <span className="ml-1">${component.cost}</span>}
					</div>
				</Html>
			)}

			{/* Status indicator */}
			{showFeedback && isPlaced && <Html position={[component.requiredPosition.x + component.dimensions.width / 2 + 0.5, component.requiredPosition.y + component.dimensions.height / 2, component.requiredPosition.z]}>{isCorrectlyPlaced ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />}</Html>}
		</group>
	);
}

function BuildingScene({ question, placedComponents, selectedComponent, onComponentClick, showBlueprint, showXray, visibleLayers, showFeedback }: any) {
	const getCurrentPhase = () => {
		return question.buildingPhases.find((phase: any) => phase.phaseId === question.currentPhase);
	};

	const isComponentCorrectlyPlaced = (componentId: string) => {
		const component = question.components.find((c: any) => c.id === componentId);
		if (!component) return false;

		// Check prerequisites
		if (component.prerequisites) {
			const prerequisitesMet = component.prerequisites.every((prereqId: string) => placedComponents.includes(prereqId));
			if (!prerequisitesMet) return false;
		}

		// Check if in current phase
		const currentPhase = getCurrentPhase();
		if (currentPhase && !currentPhase.allowedComponents.includes(componentId)) {
			return false;
		}

		return placedComponents.includes(componentId);
	};

	return (
		<>
			{/* Lighting */}
			<ambientLight intensity={0.5} />
			<directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
			<pointLight position={[-10, 5, 5]} intensity={0.4} />
			<pointLight position={[10, 5, -5]} intensity={0.4} />

			{/* Foundation/Ground */}
			<Box position={[0, -1, 0]} args={[question.blueprint.dimensions.width + 2, 0.5, question.blueprint.dimensions.depth + 2]}>
				<meshStandardMaterial color="hsl(var(--muted-foreground))" />
			</Box>

			{/* Building components */}
			{question.components.map((component: any) => {
				const isPlaced = placedComponents.includes(component.id);
				const isSelected = selectedComponent === component.id;
				const isCorrectlyPlaced = isComponentCorrectlyPlaced(component.id);
				const isInVisibleLayer = visibleLayers.includes(component.category);

				// Hide if not in visible layer (unless selected)
				if (!isInVisibleLayer && !isSelected) {
					return null;
				}

				return <BuildingComponent key={component.id} component={component} isPlaced={isPlaced} isSelected={isSelected} isCorrectlyPlaced={isCorrectlyPlaced} onComponentClick={onComponentClick} showBlueprint={showBlueprint} showFeedback={showFeedback} />;
			})}

			{/* X-ray grid */}
			{showXray && <gridHelper args={[question.blueprint.dimensions.width, 10, "hsl(var(--muted-foreground))666", "hsl(var(--foreground))333"]} position={[0, 0, 0]} />}

			{/* Camera controls */}
			<OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
		</>
	);
}

export function Architecture3DRenderer({ question, onAnswer, isAnswered, userAnswer, showFeedback = false, disabled = false }: Architecture3DRendererProps) {
	const [placedComponents, setPlacedComponents] = useState<string[]>(userAnswer?.placedComponents || []);
	const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
	const [currentPhase, setCurrentPhase] = useState(userAnswer?.currentPhase || question.currentPhase);
	const [totalCost, setTotalCost] = useState(userAnswer?.totalCost || 0);
	const [showBlueprint, setShowBlueprint] = useState(true);
	const [showXray, setShowXray] = useState(false);
	const [visibleLayers, setVisibleLayers] = useState<string[]>(["structural", "plumbing", "electrical", "hvac", "finishing"]);
	const [buildingErrors, setBuildingErrors] = useState<string[]>([]);

	// Get current phase info
	const getCurrentPhase = () => {
		return question.buildingPhases.find((phase) => phase.phaseId === currentPhase);
	};

	// Get available categories
	const availableCategories = useMemo(() => {
		return [...new Set(question.components.map((comp) => comp.category))];
	}, [question.components]);

	const handleComponentClick = (componentId: string) => {
		if (isAnswered || disabled) return;

		setSelectedComponent(componentId);
	};

	const placeComponent = (componentId: string) => {
		if (isAnswered || disabled || placedComponents.includes(componentId)) return;

		const component = question.components.find((c) => c.id === componentId);
		if (!component) return;

		const currentPhaseInfo = getCurrentPhase();
		if (!currentPhaseInfo) return;

		// Validation checks
		const errors: string[] = [];

		// Check if component is allowed in current phase
		if (!currentPhaseInfo.allowedComponents.includes(componentId)) {
			errors.push(`${component.name} cannot be placed in ${currentPhaseInfo.name} phase`);
		}

		// Check prerequisites
		if (component.prerequisites) {
			const missingPrereqs = component.prerequisites.filter((prereqId) => !placedComponents.includes(prereqId));
			if (missingPrereqs.length > 0) {
				const prereqNames = missingPrereqs.map((id) => question.components.find((c: any) => c.id === id)?.name).join(", ");
				errors.push(`Prerequisites missing: ${prereqNames}`);
			}
		}

		// Check budget
		const newCost = totalCost + (component.cost || 0);
		if (currentPhaseInfo.constraints?.budgetLimit && newCost > currentPhaseInfo.constraints.budgetLimit) {
			errors.push(`Budget exceeded: $${newCost} > $${currentPhaseInfo.constraints.budgetLimit}`);
		}

		// Check component limit
		if (currentPhaseInfo.constraints?.maxComponents) {
			const phaseComponents = placedComponents.filter((id) => currentPhaseInfo.allowedComponents.includes(id));
			if (phaseComponents.length >= currentPhaseInfo.constraints.maxComponents) {
				errors.push(`Component limit reached for this phase`);
			}
		}

		setBuildingErrors(errors);

		if (errors.length === 0) {
			setPlacedComponents([...placedComponents, componentId]);
			setTotalCost(newCost);

			// Check if phase is complete
			const requiredComponents = currentPhaseInfo.requiredComponents.filter((id) => currentPhaseInfo.allowedComponents.includes(id));
			const newPlacedComponents = [...placedComponents, componentId];
			const phaseCompleteComponents = requiredComponents.filter((id) => newPlacedComponents.includes(id));

			if (phaseCompleteComponents.length === requiredComponents.length) {
				// Move to next phase
				const currentPhaseIndex = question.buildingPhases.findIndex((phase) => phase.phaseId === currentPhase);
				if (currentPhaseIndex < question.buildingPhases.length - 1) {
					setCurrentPhase(question.buildingPhases[currentPhaseIndex + 1].phaseId);
				}
			}
		}
	};

	const removeComponent = (componentId: string) => {
		if (isAnswered || disabled) return;

		const component = question.components.find((c) => c.id === componentId);
		if (!component) return;

		setPlacedComponents(placedComponents.filter((id) => id !== componentId));
		setTotalCost(totalCost - (component.cost || 0));
		setBuildingErrors([]);
	};

	const handleSubmit = () => {
		if (isAnswered || disabled) return;

		// Validation
		const errors: string[] = [];
		let score = 0;

		// Check structural integrity
		if (question.validationRules.structural) {
			const structuralComponents = question.components.filter((c) => c.category === "structural");
			const placedStructural = structuralComponents.filter((c) => placedComponents.includes(c.id));
			if (placedStructural.length < structuralComponents.length * 0.8) {
				errors.push("Insufficient structural components");
			} else {
				score += 25;
			}
		}

		// Check code compliance
		if (question.validationRules.codeCompliance) {
			const requiredSystems = ["plumbing", "electrical"];
			const hasAllSystems = requiredSystems.every((system) => question.components.some((c) => c.category === system && placedComponents.includes(c.id)));
			if (hasAllSystems) {
				score += 25;
			} else {
				errors.push("Building code violations detected");
			}
		}

		// Check functionality
		if (question.validationRules.functionality) {
			const functionalCategories = ["plumbing", "electrical", "hvac"];
			const completedCategories = functionalCategories.filter((category) => question.components.filter((c) => c.category === category).length > 0 && question.components.filter((c) => c.category === category).every((c) => placedComponents.includes(c.id)));
			score += (completedCategories.length / functionalCategories.length) * 25;
		}

		// Bonus for completing all phases
		const allPhasesComplete = question.buildingPhases.every((phase) => phase.requiredComponents.every((compId) => placedComponents.includes(compId)));
		if (allPhasesComplete) {
			score += 25;
		}

		const isCorrect = errors.length === 0 && score >= 75;

		onAnswer({
			value: { placedComponents, currentPhase, totalCost, errors },
			__isCorrect: isCorrect,
			score,
			totalComponents: placedComponents.length,
			errors,
		});
	};

	const resetBuilding = () => {
		if (isAnswered || disabled) return;
		setPlacedComponents([]);
		setSelectedComponent(null);
		setCurrentPhase(question.currentPhase);
		setTotalCost(0);
		setBuildingErrors([]);
	};

	const toggleLayer = (category: string) => {
		setVisibleLayers((prev) => (prev.includes(category) ? prev.filter((l) => l !== category) : [...prev, category]));
	};

	const getCategoryColor = (category: string) => {
		const colors = {
			structural: "hsl(var(--muted-foreground))",
plumbing: "hsl(var(--primary))",
electrical: "hsl(var(--warning))",
hvac: "hsl(var(--success))",
finishing: "hsl(var(--muted-foreground))",
		};
		return colors[category as keyof typeof colors] || "hsl(var(--muted-foreground))";
	};

	return (
		<div className="space-y-6">
			{/* Project Info and Controls */}
			<Card>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold mb-1">{question.buildingType.charAt(0).toUpperCase() + question.buildingType.slice(1)} Construction</h3>
							<p className="text-muted-foreground mb-2">Place building components according to construction phases and building codes.</p>
							<div className="flex items-center space-x-4 text-sm text-muted-foreground">
								<span>Phase: {getCurrentPhase()?.name}</span>
								<span>
									Placed: {placedComponents.length} / {question.components.length}
								</span>
								<span>Cost: ${totalCost.toLocaleString()}</span>
							</div>
						</div>

						<div className="flex space-x-2">
							<Button variant="outline" size="sm" onClick={() => setShowBlueprint(!showBlueprint)}>
								{showBlueprint ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
								<span className="ml-2">Blueprint</span>
							</Button>
							<Button variant="outline" size="sm" onClick={() => setShowXray(!showXray)}>
								<Layers className="w-4 h-4 mr-2" />
								X-Ray
							</Button>
							{!isAnswered && (
								<Button variant="outline" onClick={resetBuilding} disabled={disabled}>
									<RotateCcw className="w-4 h-4 mr-2" />
									Reset
								</Button>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Building Errors */}
			{buildingErrors.length > 0 && (
				<Card className="border-destructive bg-destructive">
					<CardContent className="p-4">
						<div className="space-y-2">
							<div className="flex items-center space-x-2">
								<XCircle className="w-5 h-5 text-destructive" />
								<span className="font-medium text-destructive">Building Violations</span>
							</div>
							<ul className="list-disc list-inside space-y-1">
								{buildingErrors.map((error, index) => (
									<li key={index} className="text-destructive text-sm">
										{error}
									</li>
								))}
							</ul>
						</div>
					</CardContent>
				</Card>
			)}

			{/* 3D Building View */}
			<Card>
				<CardContent className="p-0">
					<div className="h-96 w-full">
						<Canvas shadows camera={{ position: [15, 10, 15], fov: 60 }} style={{ background: "hsl(var(--primary))" }}>
							<BuildingScene question={question} placedComponents={placedComponents} selectedComponent={selectedComponent} onComponentClick={handleComponentClick} showBlueprint={showBlueprint} showXray={showXray} visibleLayers={visibleLayers} showFeedback={showFeedback} />
						</Canvas>
					</div>
				</CardContent>
			</Card>

			{/* Layer Controls */}
			<Card>
				<CardContent className="p-4">
					<h3 className="text-lg font-semibold mb-3">Building Layers</h3>
					<div className="flex flex-wrap gap-2">
						{availableCategories.map((category) => (
							<Button
								key={category}
								variant={visibleLayers.includes(category) ? "default" : "outline"}
								size="sm"
								onClick={() => toggleLayer(category)}
								disabled={disabled}
								style={{
									backgroundColor: visibleLayers.includes(category) ? getCategoryColor(category) : undefined,
									color: visibleLayers.includes(category) ? "white" : undefined,
								}}
							>
								<Layers className="w-3 h-3 mr-1" />
								{category}
							</Button>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Component Inventory */}
			<Card>
				<CardContent className="p-4">
					<h3 className="text-lg font-semibold mb-3">Component Inventory</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
						{question.components.map((component) => {
							const isPlaced = placedComponents.includes(component.id);
							const isSelected = selectedComponent === component.id;
							const currentPhaseInfo = getCurrentPhase();
							const isAllowedInPhase = currentPhaseInfo?.allowedComponents.includes(component.id);

							return (
								<div
									key={component.id}
									className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${isSelected ? "border-primary bg-primary" : isPlaced ? "border-success bg-success" : isAllowedInPhase ? "border-border hover:border-border" : "border-border bg-gray-50 opacity-50"}`}
									onClick={() => {
										if (!isPlaced && isAllowedInPhase) {
											setSelectedComponent(component.id);
										}
									}}
								>
									<div className="flex items-center justify-between">
										<div>
											<p className="font-medium">{component.name}</p>
											<p className="text-sm text-muted-foreground capitalize">{component.category}</p>
											{component.cost && (
												<p className="text-sm text-success">
													<DollarSign className="w-3 h-3 inline mr-1" />
													{component.cost.toLocaleString()}
												</p>
											)}
										</div>

										<div className="flex flex-col space-y-1">
											{isPlaced ? (
												<CheckCircle className="w-5 h-5 text-success" />
											) : (
												<div className="space-y-1">
													{isAllowedInPhase && (
														<Button
															size="sm"
															onClick={(e) => {
																e.stopPropagation();
																placeComponent(component.id);
															}}
															disabled={disabled}
														>
															Place
														</Button>
													)}
													{isPlaced && (
														<Button
															size="sm"
															variant="outline"
															onClick={(e) => {
																e.stopPropagation();
																removeComponent(component.id);
															}}
															disabled={disabled}
														>
															Remove
														</Button>
													)}
												</div>
											)}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>

			{/* Construction Phases */}
			<Card>
				<CardContent className="p-4">
					<h3 className="text-lg font-semibold mb-3">Construction Phases</h3>
					<div className="space-y-3">
						{question.buildingPhases.map((phase, index) => {
							const isCurrentPhase = phase.phaseId === currentPhase;
							const isCompleted = phase.requiredComponents.every((compId) => placedComponents.includes(compId));

							return (
								<div key={phase.phaseId} className={`p-3 rounded-lg border-2 transition-all duration-200 ${isCurrentPhase ? "border-primary bg-primary" : isCompleted ? "border-success bg-success" : "border-border"}`}>
									<div className="flex items-center justify-between">
										<div>
											<h4 className="font-medium">{phase.name}</h4>
											<p className="text-sm text-muted-foreground">{phase.description}</p>
											<div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
												<span>Required: {phase.requiredComponents.length}</span>
												<span>Allowed: {phase.allowedComponents.length}</span>
												{phase.constraints?.budgetLimit && <span>Budget: ${phase.constraints.budgetLimit.toLocaleString()}</span>}
											</div>
										</div>

										{isCompleted ? <CheckCircle className="w-6 h-6 text-success" /> : isCurrentPhase ? <Clock className="w-6 h-6 text-primary" /> : <div className="w-6 h-6 rounded-full border-2 border-border" />}
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
						Complete Construction
					</Button>
				</div>
			)}

			{/* Feedback */}
			{showFeedback && isAnswered && (
				<Card className="mt-6">
					<CardContent className="p-6">
						<div className="space-y-4">
							<div className="flex items-center space-x-2">
								{userAnswer?.errors?.length === 0 ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />}
								<span className={`font-semibold ${userAnswer?.errors?.length === 0 ? "text-success" : "text-destructive"}`}>{userAnswer?.errors?.length === 0 ? "Construction Completed Successfully!" : "Construction Issues Found"}</span>
								<span className="text-sm text-muted-foreground">
									({userAnswer?.totalComponents || 0} components, ${userAnswer?.totalCost?.toLocaleString() || 0})
								</span>
							</div>

							{question.explanation && (
								<div className="p-4 rounded-lg bg-primary border border-primary/30">
									<p className="text-primary font-medium">Construction Notes:</p>
									<p className="text-primary mt-1">{question.explanation}</p>
								</div>
							)}

							{/* Construction errors */}
							{userAnswer?.errors && userAnswer.errors.length > 0 && (
								<div className="p-4 rounded-lg bg-destructive border border-destructive">
									<p className="text-destructive font-medium">Issues to Address:</p>
									<ul className="list-disc list-inside space-y-1 mt-2">
										{userAnswer.errors.map((error, index) => (
											<li key={index} className="text-destructive">
												{error}
											</li>
										))}
									</ul>
								</div>
							)}

							{/* Project summary */}
							<div className="p-4 rounded-lg bg-gray-50 border border-border">
								<p className="text-foreground font-medium mb-2">Project Summary:</p>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
									<div>
										<span className="text-muted-foreground">Building Type:</span>
										<p className="font-medium capitalize">{question.buildingType}</p>
									</div>
									<div>
										<span className="text-muted-foreground">Total Cost:</span>
										<p className="font-medium">${userAnswer?.totalCost?.toLocaleString() || 0}</p>
									</div>
									<div>
										<span className="text-muted-foreground">Components:</span>
										<p className="font-medium">
											{userAnswer?.totalComponents || 0} / {question.components.length}
										</p>
									</div>
									<div>
										<span className="text-muted-foreground">Phases:</span>
										<p className="font-medium">
											{question.buildingPhases.findIndex((p) => p.phaseId === userAnswer?.currentPhase) + 1} / {question.buildingPhases.length}
										</p>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
