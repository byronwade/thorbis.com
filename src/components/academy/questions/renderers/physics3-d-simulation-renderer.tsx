"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Box, Sphere, Cylinder, Html } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Play, Pause, RotateCcw, Zap, Settings } from "lucide-react";
import { Physics3DSimulationQuestion } from "@/types/questions";
import * as THREE from "three";

interface Physics3DSimulationRendererProps {
	question: Physics3DSimulationQuestion;
	onAnswer: (answer: any) => void;
	isAnswered: boolean;
	userAnswer?: { success: boolean; attempts: number; finalState: any };
	showFeedback?: boolean;
	disabled?: boolean;
}

interface PhysicsObjectProps {
	object: (typeof Physics3DSimulationRenderer.question.objects)[0];
	isRunning: boolean;
	onObjectUpdate: (id: string, position: THREE.Vector3, velocity: THREE.Vector3) => void;
	appliedForce?: THREE.Vector3;
	showTrail: boolean;
}

function PhysicsObject({ object, isRunning, onObjectUpdate, appliedForce, showTrail }: PhysicsObjectProps) {
	const meshRef = useRef<THREE.Mesh>(null);
	const [position, setPosition] = useState(new THREE.Vector3().copy(object.physics.initialPosition as any));
	const [velocity, setVelocity] = useState(new THREE.Vector3().copy(object.physics.initialVelocity || ({ x: 0, y: 0, z: 0 } as any)));
	const [trail, setTrail] = useState<THREE.Vector3[]>([]);

	// Physics simulation
	useFrame((state, delta) => {
		if (!isRunning || !meshRef.current) return;

		const gravity = new THREE.Vector3(0, -9.81, 0); // Simplified gravity
		const force = new THREE.Vector3().copy(gravity).multiplyScalar(object.physics.mass);

		// Add applied force
		if (appliedForce) {
			force.add(appliedForce);
		}

		// Calculate acceleration (F = ma)
		const acceleration = force.divideScalar(object.physics.mass);

		// Update velocity
		const newVelocity = velocity.clone().add(acceleration.clone().multiplyScalar(delta));

		// Apply damping
		newVelocity.multiplyScalar(1 - object.physics.friction * delta);

		// Update position
		const newPosition = position.clone().add(newVelocity.clone().multiplyScalar(delta));

		// Collision with ground
		if (newPosition.y <= 0.5) {
			newPosition.y = 0.5;
			newVelocity.y = -newVelocity.y * object.physics.restitution; // Bounce
			newVelocity.x *= 1 - object.physics.friction; // Friction
			newVelocity.z *= 1 - object.physics.friction;
		}

		// Update state
		setPosition(newPosition);
		setVelocity(newVelocity);

		// Update mesh position
		meshRef.current.position.copy(newPosition);

		// Update trail
		if (showTrail) {
			setTrail((prev) => [...prev.slice(-20), newPosition.clone()]);
		}

		// Notify parent
		onObjectUpdate(object.id, newPosition, newVelocity);
	});

	const material = useMemo(() => {
		return new THREE.MeshStandardMaterial({
			color: object.material.color,
			roughness: object.material.roughness,
			metalness: object.material.metalness,
		});
	}, [object.material]);

	const renderGeometry = () => {
		const { width, height, depth } = object.dimensions;

		switch (object.geometry) {
			case "sphere":
				return <Sphere ref={meshRef} args={[width / 2, 32, 32]} material={material} />;
			case "cylinder":
				return <Cylinder ref={meshRef} args={[width / 2, width / 2, height, 32]} material={material} />;
			case "box":
			default:
				return <Box ref={meshRef} args={[width, height, depth]} material={material} />;
		}
	};

	return (
		<group>
			{/* Main object */}
			{renderGeometry()}

			{/* Object label */}
			<Html position={[position.x, position.y + object.dimensions.height / 2 + 1, position.z]}>
				<div className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">{object.name}</div>
			</Html>

			{/* Velocity vector */}
			{isRunning && velocity.length() > 0.1 && <arrowHelper args={[velocity.clone().normalize(), position, velocity.length() * 2, 0x00ff00, velocity.length() * 0.5, velocity.length() * 0.5]} />}

			{/* Trail */}
			{showTrail && trail.length > 1 && (
				<line>
					<bufferGeometry>
						<bufferAttribute attach="attributes-position" array={new Float32Array(trail.flatMap((p) => [p.x, p.y, p.z]))} count={trail.length} itemSize={3} />
					</bufferGeometry>
					<lineBasicMaterial color="hsl(var(--destructive))" opacity={0.6} transparent />
				</line>
			)}
		</group>
	);
}

function PhysicsEnvironment({ question, children }: { question: Physics3DSimulationQuestion; children: React.ReactNode }) {
	const { environment } = question;

	return (
		<group>
			{/* Floor */}
			{environment.floor && (
				<Box position={[0, -0.5, 0]} args={[environment.boundaries.width, 1, environment.boundaries.depth]}>
					<meshStandardMaterial color="hsl(var(--muted-foreground))" />
				</Box>
			)}

			{/* Walls */}
			{environment.walls?.front && (
<Box position={[0, environment.boundaries.height / 2, environment.boundaries.depth / 2]} args={[environment.boundaries.width, environment.boundaries.height, 0.5]}>
<meshStandardMaterial color="hsl(var(--muted-foreground))" transparent opacity={0.7} />
</Box>
)}

			{environment.walls?.back && (
<Box position={[0, environment.boundaries.height / 2, -environment.boundaries.depth / 2]} args={[environment.boundaries.width, environment.boundaries.height, 0.5]}>
<meshStandardMaterial color="hsl(var(--muted-foreground))" transparent opacity={0.7} />
</Box>
)}

			{environment.walls?.left && (
<Box position={[-environment.boundaries.width / 2, environment.boundaries.height / 2, 0]} args={[0.5, environment.boundaries.height, environment.boundaries.depth]}>
<meshStandardMaterial color="hsl(var(--muted-foreground))" transparent opacity={0.7} />
</Box>
)}

			{environment.walls?.right && (
<Box position={[environment.boundaries.width / 2, environment.boundaries.height / 2, 0]} args={[0.5, environment.boundaries.height, environment.boundaries.depth]}>
<meshStandardMaterial color="hsl(var(--muted-foreground))" transparent opacity={0.7} />
</Box>
)}

			{children}
		</group>
	);
}

function PhysicsScene({ question, isRunning, onObjectUpdate, appliedForces, showTrails }: any) {
	return (
		<>
			{/* Lighting */}
			<ambientLight intensity={0.4} />
			<directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
			<pointLight position={[-10, 0, 5]} intensity={0.3} />

			{/* Physics environment */}
			<PhysicsEnvironment question={question}>
				{/* Physics objects */}
				{question.objects.map((object: any) => (
					<PhysicsObject key={object.id} object={object} isRunning={isRunning} onObjectUpdate={onObjectUpdate} appliedForce={appliedForces[object.id]} showTrail={showTrails} />
				))}
			</PhysicsEnvironment>

			{/* Camera controls */}
			<OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
		</>
	);
}

export function Physics3DSimulationRenderer({ question, onAnswer, isAnswered, userAnswer, showFeedback = false, disabled = false }: Physics3DSimulationRendererProps) {
	const [isRunning, setIsRunning] = useState(false);
	const [attempts, setAttempts] = useState(userAnswer?.attempts || 0);
	const [showTrails, setShowTrails] = useState(true);
	const [appliedForces, setAppliedForces] = useState<Record<string, THREE.Vector3>>({});
	const [objectStates, setObjectStates] = useState<Record<string, { position: THREE.Vector3; velocity: THREE.Vector3 }>>({});
	const [simulationTime, setSimulationTime] = useState(0);
	const [conditionMet, setConditionMet] = useState(false);
	const [conditionDuration, setConditionDuration] = useState(0);

	const simulationRef = useRef<NodeJS.Timeout>();

	// Simulation timer
	useEffect(() => {
		if (!isRunning) return;

		const timer = setInterval(() => {
			setSimulationTime((prev) => prev + 0.1);
		}, 100);

		return () => clearInterval(timer);
	}, [isRunning]);

	// Check success condition
	useEffect(() => {
		if (!isRunning || isAnswered) return;

		const targetObject = question.objects.find((obj) => obj.id === question.challenge.successCondition.targetObject);
		const objectState = objectStates[question.challenge.successCondition.targetObject];

		if (!targetObject || !objectState) return;

		let conditionCurrentlyMet = false;

		switch (question.challenge.successCondition.condition) {
			case "position":
				const targetPos = new THREE.Vector3().copy(targetObject.physics.initialPosition as any);
				const distance = objectState.position.distanceTo(targetPos);
				conditionCurrentlyMet = distance <= question.challenge.successCondition.threshold;
				break;

			case "velocity":
				conditionCurrentlyMet = objectState.velocity.length() <= question.challenge.successCondition.threshold;
				break;

			case "stability":
				conditionCurrentlyMet = objectState.velocity.length() <= 0.1; // Near zero velocity
				break;
		}

		if (conditionCurrentlyMet) {
			if (!conditionMet) {
				setConditionMet(true);
				setConditionDuration(0);
			} else {
				setConditionDuration((prev) => prev + 0.1);

				// Check if duration requirement is met
				const requiredDuration = question.challenge.successCondition.duration || 1;
				if (conditionDuration >= requiredDuration) {
					handleSuccess();
				}
			}
		} else {
			setConditionMet(false);
			setConditionDuration(0);
		}

		// Check time limit
		if (question.timeLimit && simulationTime >= question.timeLimit) {
			handleTimeUp();
		}
	}, [objectStates, isRunning, simulationTime, conditionMet, conditionDuration]);

	const handleObjectUpdate = (objectId: string, position: THREE.Vector3, velocity: THREE.Vector3) => {
		setObjectStates((prev) => ({
			...prev,
			[objectId]: { position: position.clone(), velocity: velocity.clone() },
		}));
	};

	const startSimulation = () => {
		setIsRunning(true);
		setSimulationTime(0);
		setConditionMet(false);
		setConditionDuration(0);
		setAttempts(attempts + 1);
	};

	const pauseSimulation = () => {
		setIsRunning(false);
	};

	const resetSimulation = () => {
		if (isAnswered || disabled) return;

		setIsRunning(false);
		setSimulationTime(0);
		setConditionMet(false);
		setConditionDuration(0);
		setAppliedForces({});
		setObjectStates({});
	};

	const applyForce = (objectId: string, force: THREE.Vector3) => {
		if (!isRunning || isAnswered || disabled) return;

		setAppliedForces((prev) => ({
			...prev,
			[objectId]: force.clone(),
		}));

		// Remove force after brief application
		setTimeout(() => {
			setAppliedForces((prev) => {
				const newForces = { ...prev };
				delete newForces[objectId];
				return newForces;
			});
		}, 200);
	};

	const handleSuccess = () => {
		setIsRunning(false);
		onAnswer({
			value: { success: true, attempts, finalState: objectStates },
			__isCorrect: true,
			attempts,
			simulationTime,
		});
	};

	const handleTimeUp = () => {
		setIsRunning(false);
		onAnswer({
			value: { success: false, attempts, finalState: objectStates },
			__isCorrect: false,
			attempts,
			simulationTime,
		});
	};

	const formatTime = (time: number) => {
		return `${time.toFixed(1)}s`;
	};

	return (
		<div className="space-y-6">
			{/* Instructions and Controls */}
			<Card>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-muted-foreground mb-2">{question.challenge.description}</p>
							<div className="flex items-center space-x-4 text-sm text-muted-foreground">
								<span>Time: {formatTime(simulationTime)}</span>
								{question.timeLimit && <span>Limit: {formatTime(question.timeLimit)}</span>}
								<span>Attempts: {attempts}</span>
								{question.maxAttempts && <span>Max: {question.maxAttempts}</span>}
							</div>
						</div>

						<div className="flex space-x-2">
							{!isRunning ? (
								<Button onClick={startSimulation} disabled={disabled || isAnswered}>
									<Play className="w-4 h-4 mr-2" />
									Start
								</Button>
							) : (
								<Button onClick={pauseSimulation} disabled={disabled}>
									<Pause className="w-4 h-4 mr-2" />
									Pause
								</Button>
							)}

							<Button variant="outline" onClick={resetSimulation} disabled={disabled || isAnswered}>
								<RotateCcw className="w-4 h-4 mr-2" />
								Reset
							</Button>

							<Button variant="outline" size="sm" onClick={() => setShowTrails(!showTrails)}>
								<Settings className="w-4 h-4 mr-2" />
								Trails
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Success Condition Status */}
			{isRunning && (
				<Card className={`border-2 ${conditionMet ? "border-green-500 bg-green-50" : "border-yellow-500 bg-yellow-50"}`}>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							{conditionMet ? <CheckCircle className="w-5 h-5 text-success" /> : <Settings className="w-5 h-5 text-warning" />}
							<span className={`font-medium ${conditionMet ? "text-success" : "text-warning"}`}>{conditionMet ? `Condition met! Duration: ${conditionDuration.toFixed(1)}s / ${question.challenge.successCondition.duration || 1}s` : `Working toward: ${question.challenge.successCondition.condition} ≤ ${question.challenge.successCondition.threshold}`}</span>
						</div>
					</CardContent>
				</Card>
			)}

			{/* 3D Physics Scene */}
			<Card>
				<CardContent className="p-0">
					<div className="h-96 w-full">
						<Canvas shadows camera={{ position: [15, 10, 15], fov: 60 }} style={{ background: "hsl(var(--primary))" }}>
							<PhysicsScene question={question} isRunning={isRunning} onObjectUpdate={handleObjectUpdate} appliedForces={appliedForces} showTrails={showTrails} />
						</Canvas>
					</div>
				</CardContent>
			</Card>

			{/* Force Controls */}
			{question.tools && isRunning && (
				<Card>
					<CardContent className="p-4">
						<h3 className="text-lg font-semibold mb-3">Physics Tools</h3>
						<div className="space-y-4">
							{question.objects.map((object) => (
								<div key={object.id} className="flex items-center space-x-4">
									<span className="font-medium min-w-24">{object.name}:</span>

									{question.tools?.addForce && (
										<div className="flex space-x-2">
											<Button size="sm" variant="outline" onClick={() => applyForce(object.id, new THREE.Vector3(5, 0, 0))} disabled={disabled}>
												<Zap className="w-3 h-3 mr-1" />→ Right
											</Button>
											<Button size="sm" variant="outline" onClick={() => applyForce(object.id, new THREE.Vector3(-5, 0, 0))} disabled={disabled}>
												<Zap className="w-3 h-3 mr-1" />← Left
											</Button>
											<Button size="sm" variant="outline" onClick={() => applyForce(object.id, new THREE.Vector3(0, 10, 0))} disabled={disabled}>
												<Zap className="w-3 h-3 mr-1" />↑ Up
											</Button>
										</div>
									)}
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Object Properties */}
			<Card>
				<CardContent className="p-4">
					<h3 className="text-lg font-semibold mb-3">Object Properties</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{question.objects.map((object) => (
							<div key={object.id} className="p-3 rounded-lg border bg-gray-50">
								<h4 className="font-medium mb-2">{object.name}</h4>
								<div className="space-y-1 text-sm text-muted-foreground">
									<div>Mass: {object.physics.mass} kg</div>
									<div>Friction: {object.physics.friction}</div>
									<div>Restitution: {object.physics.restitution}</div>
									{objectStates[object.id] && (
										<>
											<div>
												Position: ({objectStates[object.id].position.x.toFixed(1)}, {objectStates[object.id].position.y.toFixed(1)}, {objectStates[object.id].position.z.toFixed(1)})
											</div>
											<div>Velocity: {objectStates[object.id].velocity.length().toFixed(2)} m/s</div>
										</>
									)}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Feedback */}
			{showFeedback && isAnswered && (
				<Card className="mt-6">
					<CardContent className="p-6">
						<div className="space-y-4">
							<div className="flex items-center space-x-2">
								{userAnswer?.success ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />}
								<span className={`font-semibold ${userAnswer?.success ? "text-success" : "text-destructive"}`}>{userAnswer?.success ? "Physics Challenge Completed!" : "Challenge Not Completed"}</span>
								<span className="text-sm text-muted-foreground">
									({attempts} attempts in {formatTime(simulationTime)})
								</span>
							</div>

							{question.explanation && (
								<div className="p-4 rounded-lg bg-blue-50 border border-primary/30">
									<p className="text-primary font-medium">Physics Explanation:</p>
									<p className="text-primary mt-1">{question.explanation}</p>
								</div>
							)}

							{/* Performance analysis */}
							<div className="p-4 rounded-lg bg-gray-50 border border-border">
								<p className="text-foreground font-medium mb-2">Simulation Results:</p>
								<ul className="list-disc list-inside space-y-1 text-muted-foreground">
									<li>Challenge type: {question.challenge.type}</li>
									<li>Success condition: {question.challenge.successCondition.condition}</li>
									<li>Attempts used: {attempts}</li>
									<li>Final simulation time: {formatTime(simulationTime)}</li>
									<li>Efficiency: {attempts === 1 ? "Perfect" : attempts <= 3 ? "Good" : "Needs practice"}</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
