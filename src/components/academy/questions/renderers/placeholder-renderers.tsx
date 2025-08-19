// Placeholder renderers for question types that haven't been fully implemented yet
"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const createPlaceholderRenderer = (type: string, description: string) => {
	const PlaceholderComponent = ({ question }: { question: any }) => (
		<div className="space-y-6">
			<div className="flex items-center space-x-2">
				<Badge variant="secondary">{type}</Badge>
				<Badge variant="outline">{question.points} points</Badge>
			</div>
			<Card>
				<CardContent className="p-6 text-center">
					<p className="text-muted-foreground">{type} - Coming Soon</p>
					<p className="text-sm text-muted-foreground mt-2">{description}</p>
				</CardContent>
			</Card>
		</div>
	);
	PlaceholderComponent.displayName = `${type}Renderer`;
	return PlaceholderComponent;
};

export const DrawingWhiteboardRenderer = createPlaceholderRenderer("Drawing Whiteboard", "Interactive canvas for drawing diagrams, sketches, and annotations with multiple tools.");

export const CodeEditorRenderer = createPlaceholderRenderer("Code Editor", "Full-featured code editor with syntax highlighting and test case validation.");

export const AudioIdentificationRenderer = createPlaceholderRenderer("Audio Identification", "Listen to audio clips and identify sounds, music, or spoken content.");

export const VideoTimestampRenderer = createPlaceholderRenderer("Video Timestamp", "Mark specific moments in videos to answer time-based questions.");

export const DiagramLabelingRenderer = createPlaceholderRenderer("Diagram Labeling", "Label parts of diagrams by dragging text to correct locations.");

export const FormulaBuilderRenderer = createPlaceholderRenderer("Formula Builder", "Build mathematical formulas using drag-and-drop components and LaTeX rendering.");
