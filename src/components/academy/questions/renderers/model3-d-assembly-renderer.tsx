"use client";
import { useState, useRef, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Box, Sphere, Cylinder, Html } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, RotateCcw, Eye, EyeOff, Move3D } from "lucide-react";
import { Model3DAssemblyQuestion } from "@/types/questions";
import * as THREE from "three";

interface Model3DAssemblyRendererProps {
	question: Model3DAssemblyQuestion;
	onAnswer: (answer: any) => void;
	isAnswered: boolean;
	userAnswer?: { positions: Record<string, { position: THREE.Vector3; rotation: THREE.Vector3 }>; assemblyOrder: string[] };
	showFeedback?: boolean;
	disabled?: boolean;
}

interface DraggableComponentProps {
	component: (typeof Model3DAssemblyRenderer.question.components)[0];
	isSelected: boolean;
	onSelect: (id: string) => void;
	onPositionChange: (id: string, position: THREE.Vector3, rotation: THREE.Vector3) => void;
	showWireframe: boolean;
	showTargetPosition: boolean;
	isCorrectlyPlaced: boolean;
	disabled: boolean;
}

function DraggableComponent({ component, isSelected, onSelect, onPositionChange, showWireframe, showTargetPosition, isCorrectlyPlaced, disabled }: DraggableComponentProps) {
	const meshRef = useRef<THREE.Mesh>(null);
	const { camera, gl, size } = useThree();
	const [isDragging, setIsDragging] = useState(false);
	const [dragPlane] = useState(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
	const [intersection] = useState(new THREE.Vector3());

	const material = useMemo(() => {
		const materialProps = {
			color: isSelected ? "hsl(var(--primary))" : component.material.color,
			wireframe: showWireframe,
			transparent: isDragging,
			opacity: isDragging ? 0.7 : 1,
		};

		switch (component.material.type) {
			case "standard":
				return new THREE.MeshStandardMaterial({
					...materialProps,
					roughness: component.material.roughness || 0.5,
					metalness: component.material.metalness || 0.1,
				});
			case "physical":
				return new THREE.MeshPhysicalMaterial({
					...materialProps,
					roughness: component.material.roughness || 0.5,
					metalness: component.material.metalness || 0.1,
				});
			default:
				return new THREE.MeshBasicMaterial(materialProps);
		}
	}, [component.material, isSelected, showWireframe, isDragging]);

	const geometry = useMemo(() => {
		const { width, height, depth } = component.dimensions;
		switch (component.geometry) {
			case "sphere":
				return new THREE.SphereGeometry(width / 2, 32, 32);
			case "cylinder":
				return new THREE.CylinderGeometry(width / 2, width / 2, height, 32);
			case "box":
			default:
				return new THREE.BoxGeometry(width, height, depth);
		}
	}, [component.geometry, component.dimensions]);

	const handlePointerDown = (event: any) => {
		if (disabled) return;
		event.stopPropagation();
		setIsDragging(true);
		onSelect(component.id);

		// Update drag plane based on camera
		const cameraDirection = new THREE.Vector3();
		camera.getWorldDirection(cameraDirection);
		dragPlane.setFromNormalAndCoplanarPoint(cameraDirection, event.point);
	};

	const handlePointerMove = (event: any) => {
		if (!isDragging || disabled) return;

		const raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(event.pointer, camera);

		if (raycaster.ray.intersectPlane(dragPlane, intersection)) {
			if (meshRef.current) {
				meshRef.current.position.copy(intersection);
				onPositionChange(component.id, intersection.clone(), new THREE.Vector3().setFromEuler(meshRef.current.rotation));
			}
		}
	};

	const handlePointerUp = () => {
		setIsDragging(false);
	};

	const renderGeometry = () => {
		switch (component.geometry) {
			case "sphere":
				return <Sphere ref={meshRef} args={[component.dimensions.width / 2, 32, 32]} material={material} />;
			case "cylinder":
				return <Cylinder ref={meshRef} args={[component.dimensions.width / 2, component.dimensions.width / 2, component.dimensions.height, 32]} material={material} />;
			case "box":
			default:
				return <Box ref={meshRef} args={[component.dimensions.width, component.dimensions.height, component.dimensions.depth]} material={material} />;
		}
	};

	return (
		<group>
			{/* Target position indicator */}
			{showTargetPosition && (
				<Box position={[component.targetPosition.x, component.targetPosition.y, component.targetPosition.z]} args={[component.dimensions.width, component.dimensions.height, component.dimensions.depth]}>
					<meshBasicMaterial color="hsl(var(--success))" wireframe opacity={0.3} transparent />
				</Box>
			)}

			{/* Actual component */}
			<mesh ref={meshRef} position={[component.targetPosition.x, component.targetPosition.y, component.targetPosition.z]} rotation={[component.targetRotation.x, component.targetRotation.y, component.targetRotation.z]} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} geometry={geometry} material={material} />

			{/* Selection indicator */}
			{isSelected && (
				<Html position={[component.targetPosition.x, component.targetPosition.y + component.dimensions.height / 2 + 1, component.targetPosition.z]}>
					<div className="bg-primary text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">{component.name}</div>
				</Html>
			)}

			{/* Correctness indicator */}
			{showTargetPosition && isCorrectlyPlaced && (
				<Html position={[component.targetPosition.x, component.targetPosition.y + component.dimensions.height / 2 + 1.5, component.targetPosition.z]}>
					<CheckCircle className="w-6 h-6 text-success" />
				</Html>
			)}
		</group>
	);
}

function Scene3D({ question, selectedComponent, onComponentSelect, onComponentMove, showWireframe, showTargetPositions, isAnswered, disabled, componentPositions }: any) {
	const { camera } = useThree();

	// Set up camera position
	useMemo(() => {
		camera.position.set(10, 10, 10);
		camera.lookAt(0, 0, 0);
	}, [camera]);

	const isComponentCorrectlyPlaced = (componentId: string) => {
		const component = question.components.find((c: any) => c.id === componentId);
		const currentPos = componentPositions[componentId];
		if (!component || !currentPos) return false;

		const targetPos = new THREE.Vector3(component.targetPosition.x, component.targetPosition.y, component.targetPosition.z);
		const distance = currentPos.position.distanceTo(targetPos);
		return distance <= question.tolerance;
	};

	return (
		<>
			{/* Lighting */}
			<ambientLight intensity={0.4} />
			<directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
			<pointLight position={[-10, -10, -5]} intensity={0.3} />

			{/* Ground plane */}
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
				<planeGeometry args={[20, 20]} />
				<meshStandardMaterial color="hsl(var(--muted))" />
			</mesh>

			{/* Components */}
			{question.components.map((component: any) => (
				<DraggableComponent key={component.id} component={component} isSelected={selectedComponent === component.id} onSelect={onComponentSelect} onPositionChange={onComponentMove} showWireframe={showWireframe} showTargetPosition={showTargetPositions} isCorrectlyPlaced={isComponentCorrectlyPlaced(component.id)} disabled={disabled || isAnswered} />
			))}

			{/* Orbit controls */}
			<OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
		</>
	);
}

export function Model3DAssemblyRenderer({ question, onAnswer, isAnswered, userAnswer, showFeedback = false, disabled = false }: Model3DAssemblyRendererProps) {
	const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
	const [showWireframe, setShowWireframe] = useState(question.showWireframe || false);
	const [showTargetPositions, setShowTargetPositions] = useState(false);
	const [assemblyOrder, setAssemblyOrder] = useState<string[]>([]);
	const [componentPositions, setComponentPositions] = useState<Record<string, { position: THREE.Vector3; rotation: THREE.Vector3 }>>(() => {
		const positions: Record<string, { position: THREE.Vector3; rotation: THREE.Vector3 }> = {};
		question.components.forEach((component) => {
			positions[component.id] = {
				position: new THREE.Vector3(component.targetPosition.x, component.targetPosition.y, component.targetPosition.z),
				rotation: new THREE.Vector3(component.targetRotation.x, component.targetRotation.y, component.targetRotation.z),
			};
		});
		return positions;
	});

	const handleComponentMove = (componentId: string, position: THREE.Vector3, rotation: THREE.Vector3) => {
		setComponentPositions((prev) => ({
			...prev,
			[componentId]: { position: position.clone(), rotation: rotation.clone() },
		}));

		// Add to assembly order if not already included
		if (!assemblyOrder.includes(componentId)) {
			setAssemblyOrder((prev) => [...prev, componentId]);
		}
	};

	const checkAssembly = () => {
		const correctPositions = question.components.every((component) => {
			const currentPos = componentPositions[component.id];
			if (!currentPos) return false;

			const targetPos = new THREE.Vector3(component.targetPosition.x, component.targetPosition.y, component.targetPosition.z);
			const distance = currentPos.position.distanceTo(targetPos);
			return distance <= question.tolerance;
		});

		const correctOrder = JSON.stringify(assemblyOrder.slice(0, question.assemblyOrder.length)) === JSON.stringify(question.assemblyOrder);

		return { correctPositions, correctOrder, isCorrect: correctPositions && correctOrder };
	};

	const handleSubmit = () => {
		if (isAnswered || disabled) return;

		const result = checkAssembly();

		onAnswer({
			value: { positions: componentPositions, assemblyOrder },
			__isCorrect: result.isCorrect,
			correctPositions: result.correctPositions,
			correctOrder: result.correctOrder,
		});
	};

	const resetAssembly = () => {
		if (isAnswered || disabled) return;

		// Scatter components randomly
		const newPositions: Record<string, { position: THREE.Vector3; rotation: THREE.Vector3 }> = {};
		question.components.forEach((component) => {
			newPositions[component.id] = {
				position: new THREE.Vector3((Math.random() - 0.5) * 10, Math.random() * 5, (Math.random() - 0.5) * 10),
				rotation: new THREE.Vector3(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
			};
		});

		setComponentPositions(newPositions);
		setAssemblyOrder([]);
		setSelectedComponent(null);
	};

	return (
		<div className="space-y-6">
			{/* Instructions */}
			<Card>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-muted-foreground mb-2">Assemble the 3D model by dragging components to their correct positions in the proper order.</p>
							<div className="flex items-center space-x-4 text-sm text-muted-foreground">
								<span>Components: {question.components.length}</span>
								<span>Assembled: {assemblyOrder.length}</span>
								<span>Tolerance: ±{question.tolerance}</span>
							</div>
						</div>

						<div className="flex space-x-2">
							<Button variant="outline" size="sm" onClick={() => setShowWireframe(!showWireframe)} disabled={disabled}>
								{showWireframe ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
								<span className="ml-2">Wireframe</span>
							</Button>
							<Button variant="outline" size="sm" onClick={() => setShowTargetPositions(!showTargetPositions)} disabled={disabled}>
								<Move3D className="w-4 h-4 mr-2" />
								Targets
							</Button>
							{!isAnswered && (
								<Button variant="outline" size="sm" onClick={resetAssembly} disabled={disabled}>
									<RotateCcw className="w-4 h-4 mr-2" />
									Reset
								</Button>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* 3D Canvas */}
			<Card>
				<CardContent className="p-0">
					<div className="h-96 w-full">
						<Canvas shadows camera={{ position: [10, 10, 10], fov: 60 }} style={{ background: question.scene.backgroundColor }} gl={{ preserveDrawingBuffer: true }}>
							<Scene3D question={question} selectedComponent={selectedComponent} onComponentSelect={setSelectedComponent} onComponentMove={handleComponentMove} showWireframe={showWireframe} showTargetPositions={showTargetPositions} isAnswered={isAnswered} disabled={disabled} componentPositions={componentPositions} />
						</Canvas>
					</div>
				</CardContent>
			</Card>

			{/* Component List */}
			<Card>
				<CardContent className="p-4">
					<h3 className="text-lg font-semibold mb-3">Components</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						{question.components.map((component, index) => (
							<div key={component.id} className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${selectedComponent === component.id ? "border-primary bg-blue-50" : assemblyOrder.includes(component.id) ? "border-green-500 bg-green-50" : "border-border hover:border-border"}`} onClick={() => setSelectedComponent(component.id)}>
								<div className="flex items-center space-x-3">
									<div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-semibold">{assemblyOrder.indexOf(component.id) + 1 || index + 1}</div>
									<div>
										<p className="font-medium">{component.name}</p>
										<p className="text-sm text-muted-foreground capitalize">{component.geometry}</p>
									</div>
									{assemblyOrder.includes(component.id) && (
										<div className="ml-auto">
											<CheckCircle className="w-5 h-5 text-success" />
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Assembly Order */}
			{question.assemblyOrder.length > 0 && (
				<Card>
					<CardContent className="p-4">
						<h3 className="text-lg font-semibold mb-3">Required Assembly Order</h3>
						<div className="flex flex-wrap gap-2">
							{question.assemblyOrder.map((componentId, index) => {
								const component = question.components.find((c) => c.id === componentId);
								const isCompleted = assemblyOrder.slice(0, index + 1).includes(componentId);
								return (
									<div key={componentId} className={`px-3 py-2 rounded-lg border-2 transition-all duration-200 ${isCompleted ? "border-green-500 bg-green-50 text-success" : "border-border bg-gray-50 text-muted-foreground"}`}>
										<span className="font-medium">
											{index + 1}. {component?.name}
										</span>
									</div>
								);
							})}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Submit Button */}
			{!isAnswered && (
				<div className="flex justify-center">
					<Button onClick={handleSubmit} size="lg" disabled={disabled}>
						Check Assembly
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
									const result = checkAssembly();
									return (
										<>
											{result.isCorrect ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />}
											<span className={`font-semibold ${result.isCorrect ? "text-success" : "text-destructive"}`}>{result.isCorrect ? "Perfect Assembly!" : "Assembly needs correction"}</span>
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

							{/* Performance breakdown */}
							<div className="p-4 rounded-lg bg-gray-50 border border-border">
								<p className="text-foreground font-medium mb-2">Assembly Results:</p>
								<ul className="list-disc list-inside space-y-1 text-muted-foreground">
									<li>Position accuracy: {checkAssembly().correctPositions ? "Perfect" : "Needs adjustment"}</li>
									<li>Assembly order: {checkAssembly().correctOrder ? "Correct" : "Incorrect sequence"}</li>
									<li>
										Components placed: {assemblyOrder.length} / {question.components.length}
									</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
