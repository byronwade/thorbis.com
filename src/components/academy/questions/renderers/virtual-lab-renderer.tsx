"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, TestTube, Wrench, Beaker, Play, RotateCcw } from "lucide-react";
import { VirtualLabQuestion } from "@/types/questions";

interface VirtualLabRendererProps {
	question: VirtualLabQuestion;
	onAnswer: (answer: any) => void;
	isAnswered: boolean;
	userAnswer?: string[];
	showFeedback?: boolean;
	disabled?: boolean;
}

export function VirtualLabRenderer({ question, onAnswer, isAnswered, userAnswer, showFeedback = false, disabled = false }: VirtualLabRendererProps) {
	const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
	const [currentStep, setCurrentStep] = useState(0);
	const [completedSteps, setCompletedSteps] = useState<string[]>(userAnswer || []);
	const [labResults, setLabResults] = useState<string[]>([]);

	const getEquipmentIcon = (type: string) => {
		switch (type) {
			case "tool":
				return <Wrench className="w-5 h-5" />;
			case "material":
				return <TestTube className="w-5 h-5" />;
			case "container":
				return <Beaker className="w-5 h-5" />;
			default:
				return <TestTube className="w-5 h-5" />;
		}
	};

	const getLabTypeColor = () => {
		switch (question.labType) {
			case "chemistry":
				return "text-success bg-green-50 border-green-200";
			case "physics":
				return "text-primary bg-blue-50 border-primary/30";
			case "biology":
				return "text-purple-600 bg-purple-50 border-purple-200";
			case "plumbing":
				return "text-warning bg-orange-50 border-orange-200";
			default:
				return "text-muted-foreground bg-gray-50 border-border";
		}
	};

	const handleEquipmentSelect = (equipmentId: string) => {
		if (isAnswered || disabled) return;

		setSelectedEquipment((prev) => (prev.includes(equipmentId) ? prev.filter((id) => id !== equipmentId) : [...prev, equipmentId]));
	};

	const executeCurrentStep = () => {
		if (isAnswered || disabled || currentStep >= question.procedures.length) return;

		const procedure = question.procedures[currentStep];
		const hasRequiredEquipment = procedure.requiredEquipment.every((equipId) => selectedEquipment.includes(equipId));

		if (!hasRequiredEquipment) {
			alert("Please select all required equipment for this step.");
			return;
		}

		// Execute the step
		setCompletedSteps([...completedSteps, procedure.id]);
		if (procedure.result) {
			setLabResults([...labResults, procedure.result]);
		}

		// Move to next step
		setCurrentStep(currentStep + 1);

		// Check if all steps are completed
		if (currentStep + 1 >= question.procedures.length) {
			// Lab completed
			const isCorrect = question.expectedResults.every((expected) => labResults.includes(expected) || (procedure.result && procedure.result.includes(expected)));

			onAnswer({
				value: [...completedSteps, procedure.id],
				__isCorrect: isCorrect,
				results: [...labResults, procedure.result].filter(Boolean),
			});
		}
	};

	const resetLab = () => {
		if (isAnswered || disabled) return;
		setSelectedEquipment([]);
		setCurrentStep(0);
		setCompletedSteps([]);
		setLabResults([]);
	};

	const getCurrentProcedure = () => {
		return currentStep < question.procedures.length ? question.procedures[currentStep] : null;
	};

	const getEquipmentStyle = (equipmentId: string) => {
		const procedure = getCurrentProcedure();
		const isRequired = procedure?.requiredEquipment.includes(equipmentId);
		const isSelected = selectedEquipment.includes(equipmentId);

		if (isSelected && isRequired) {
			return "border-green-500 bg-success/10 text-success";
		} else if (isSelected) {
			return "border-primary bg-primary/10 text-primary";
		} else if (isRequired) {
			return "border-orange-500 bg-orange-50 text-warning animate-pulse";
		}

		return "border-border bg-white text-muted-foreground hover:border-border";
	};

	return (
		<div className="space-y-6">
			{/* Lab Instructions */}
			<Card className={`border-2 ${getLabTypeColor()}`}>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<TestTube className="w-6 h-6" />
						<span>{question.labType.charAt(0).toUpperCase() + question.labType.slice(1)} Virtual Lab</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground mb-4">Follow the laboratory procedures step by step. Select the required equipment and execute each step to complete the experiment.</p>
					<div className="flex items-center space-x-4 text-sm">
						<span>
							Step: {currentStep + 1} / {question.procedures.length}
						</span>
						<span>Completed: {completedSteps.length} steps</span>
					</div>
				</CardContent>
			</Card>

			{/* Equipment Selection */}
			<Card>
				<CardHeader>
					<CardTitle>Laboratory Equipment</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
						{question.equipment.map((equipment) => (
							<div key={equipment.id} className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${getEquipmentStyle(equipment.id)}`} onClick={() => handleEquipmentSelect(equipment.id)}>
								<div className="flex flex-col items-center space-y-2">
									{getEquipmentIcon(equipment.type)}
									<span className="text-sm font-medium text-center">{equipment.name}</span>
									<span className="text-xs opacity-75 capitalize">{equipment.type}</span>
								</div>
							</div>
						))}
					</div>

					{selectedEquipment.length > 0 && (
						<div className="mt-4 p-3 bg-blue-50 rounded-lg">
							<p className="text-sm font-medium text-primary mb-2">Selected Equipment:</p>
							<div className="flex flex-wrap gap-2">
								{selectedEquipment.map((equipId) => {
									const equipment = question.equipment.find((e) => e.id === equipId);
									return (
										<span key={equipId} className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">
											{equipment?.name}
										</span>
									);
								})}
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Current Procedure */}
			{getCurrentProcedure() && (
				<Card>
					<CardHeader>
						<CardTitle>Step {currentStep + 1}: Current Procedure</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<p className="text-foreground font-medium">{getCurrentProcedure()?.step}</p>

							<div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
								<p className="text-sm font-medium text-warning mb-2">Required Equipment:</p>
								<div className="flex flex-wrap gap-2">
									{getCurrentProcedure()?.requiredEquipment.map((equipId) => {
										const equipment = question.equipment.find((e) => e.id === equipId);
										const isSelected = selectedEquipment.includes(equipId);
										return (
											<span key={equipId} className={`px-2 py-1 rounded text-xs ${isSelected ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>
												{equipment?.name} {isSelected ? "✓" : ""}
											</span>
										);
									})}
								</div>
							</div>

							<div className="flex space-x-3">
								<Button onClick={executeCurrentStep} disabled={disabled || isAnswered || !getCurrentProcedure()?.requiredEquipment.every((equipId) => selectedEquipment.includes(equipId))} className="flex items-center space-x-2">
									<Play className="w-4 h-4" />
									<span>Execute Step</span>
								</Button>

								{!isAnswered && (
									<Button variant="outline" onClick={resetLab} disabled={disabled}>
										<RotateCcw className="w-4 h-4 mr-2" />
										Reset Lab
									</Button>
								)}
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Procedure Progress */}
			<Card>
				<CardHeader>
					<CardTitle>Procedure Progress</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{question.procedures.map((procedure, index) => (
							<div key={procedure.id} className={`p-3 rounded-lg border transition-all duration-200 ${completedSteps.includes(procedure.id) ? "border-green-300 bg-green-50" : index === currentStep ? "border-primary/40 bg-blue-50" : "border-border bg-gray-50"}`}>
								<div className="flex items-center space-x-3">
									<div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${completedSteps.includes(procedure.id) ? "bg-success text-white" : index === currentStep ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>{completedSteps.includes(procedure.id) ? "✓" : index + 1}</div>
									<span className={`${completedSteps.includes(procedure.id) ? "text-success" : index === currentStep ? "text-primary" : "text-muted-foreground"}`}>{procedure.step}</span>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Lab Results */}
			{labResults.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Lab Results</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{labResults.map((result, index) => (
								<div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
									<p className="text-success">{result}</p>
								</div>
							))}
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
								{completedSteps.length === question.procedures.length ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />}
								<span className={`font-semibold ${completedSteps.length === question.procedures.length ? "text-success" : "text-destructive"}`}>{completedSteps.length === question.procedures.length ? "Lab Experiment Complete!" : "Lab Experiment Incomplete"}</span>
							</div>

							{question.explanation && (
								<div className="p-4 rounded-lg bg-blue-50 border border-primary/30">
									<p className="text-primary font-medium">Explanation:</p>
									<p className="text-primary mt-1">{question.explanation}</p>
								</div>
							)}

							{/* Expected vs Actual Results */}
							<div className="p-4 rounded-lg bg-gray-50 border border-border">
								<p className="text-foreground font-medium mb-2">Expected Results:</p>
								<ul className="list-disc list-inside space-y-1">
									{question.expectedResults.map((expected, index) => (
										<li key={index} className="text-muted-foreground">
											{expected}
										</li>
									))}
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
