"use client";
import { Question } from "@types/academy/questions";
import { MultipleChoiceRenderer } from "./renderers/multiple-choice-renderer";
import { TextInputRenderer } from "./renderers/text-input-renderer";
import { EssayRenderer } from "./renderers/essay-renderer";
import { FillInBlankRenderer } from "./renderers/fill-in-blank-renderer";
import { DragDropCanvasRenderer } from "./renderers/drag-drop-canvas-renderer";
import { SliderRangeRenderer } from "./renderers/slider-range-renderer";
import { ImageHotspotRenderer } from "./renderers/image-hotspot-renderer";
import { TimelineBuilderRenderer } from "./renderers/timeline-builder-renderer";
import { WordMatchingRenderer } from "./renderers/word-matching-renderer";
import { TrueFalseRenderer } from "./renderers/true-false-renderer";
import { SentenceOrderingRenderer } from "./renderers/sentence-ordering-renderer";
import { DragDropCategorizeRenderer } from "./renderers/drag-drop-categorize-renderer";
import { DragDropSequenceRenderer } from "./renderers/drag-drop-sequence-renderer";
import { ColorPickerRenderer } from "./renderers/color-picker-renderer";
import { ImageAnnotationRenderer } from "./renderers/image-annotation-renderer";
import { ImageComparisonRenderer } from "./renderers/image-comparison-renderer";
import { FlowchartBuilderRenderer } from "./renderers/flowchart-builder-renderer";
import { Model3DInteractionRenderer } from "./renderers/model3-d-interaction-renderer";
import { DiagramLabelingRenderer } from "./renderers/diagram-labeling-renderer";
import { DrawingWhiteboardRenderer, CodeEditorRenderer, AudioIdentificationRenderer, VideoTimestampRenderer, FormulaBuilderRenderer } from "./renderers/placeholder-renderers";
import { PuzzleSliderRenderer } from "./renderers/puzzle-slider-renderer";
import { VirtualLabRenderer } from "./renderers/virtual-lab-renderer";
import { MemoryMatchRenderer } from "./renderers/memory-match-renderer";
import { SortingGameRenderer } from "./renderers/sorting-game-renderer";
import { CrosswordPuzzleRenderer } from "./renderers/crossword-puzzle-renderer";
import { Model3DAssemblyRenderer } from "./renderers/model3-d-assembly-renderer";
import { Scene3DExplorationRenderer } from "./renderers/scene3-d-exploration-renderer";
import { Anatomy3DRenderer } from "./renderers/anatomy3-d-renderer";
import { Physics3DSimulationRenderer } from "./renderers/physics3-d-simulation-renderer";
import { Architecture3DRenderer } from "./renderers/architecture3-d-renderer";

interface QuestionRendererProps {
	question: Question;
	onAnswer: (answer: any) => void;
	isAnswered: boolean;
	userAnswer?: any;
	showFeedback?: boolean;
	disabled?: boolean;
}

export default function QuestionRenderer({ question, onAnswer, isAnswered, userAnswer, showFeedback = false, disabled = false }: QuestionRendererProps) {
	const commonProps = {
		question,
		onAnswer,
		isAnswered,
		userAnswer,
		showFeedback,
		disabled,
	};

	// Render different question types based on the type field
	switch (question.type) {
		case "multiple-choice":
			return <MultipleChoiceRenderer {...commonProps} question={question} />;

		case "true-false":
			return <TrueFalseRenderer {...commonProps} question={question} />;

		case "text-input":
			return <TextInputRenderer {...commonProps} question={question} />;

		case "essay":
			return <EssayRenderer {...commonProps} question={question} />;

		case "fill-in-blank":
			return <FillInBlankRenderer {...commonProps} question={question} />;

		case "sentence-ordering":
			return <SentenceOrderingRenderer {...commonProps} question={question} />;

		case "word-matching":
			return <WordMatchingRenderer {...commonProps} question={question} />;

		case "image-hotspot":
			return <ImageHotspotRenderer {...commonProps} question={question} />;

		case "image-annotation":
			return <ImageAnnotationRenderer {...commonProps} question={question} />;

		case "image-comparison":
			return <ImageComparisonRenderer {...commonProps} question={question} />;

		case "drag-drop-canvas":
			return <DragDropCanvasRenderer {...commonProps} question={question} />;

		case "drag-drop-categorize":
			return <DragDropCategorizeRenderer {...commonProps} question={question} />;

		case "drag-drop-sequence":
			return <DragDropSequenceRenderer {...commonProps} question={question} />;

		case "drawing-whiteboard":
			return <DrawingWhiteboardRenderer {...commonProps} question={question} />;

		case "diagram-labeling":
			return <DiagramLabelingRenderer {...commonProps} question={question} />;

		case "slider-range":
			return <SliderRangeRenderer {...commonProps} question={question} />;

		case "color-picker":
			return <ColorPickerRenderer {...commonProps} question={question} />;

		case "audio-identification":
			return <AudioIdentificationRenderer {...commonProps} question={question} />;

		case "video-timestamp":
			return <VideoTimestampRenderer {...commonProps} question={question} />;

		case "code-editor":
			return <CodeEditorRenderer {...commonProps} question={question} />;

		case "formula-builder":
			return <FormulaBuilderRenderer {...commonProps} question={question} />;

		case "timeline-builder":
			return <TimelineBuilderRenderer {...commonProps} question={question} />;

		case "flowchart-builder":
			return <FlowchartBuilderRenderer {...commonProps} question={question} />;

		case "3d-model-interaction":
			return <Model3DInteractionRenderer {...commonProps} question={question} />;

		case "puzzle-slider":
			return <PuzzleSliderRenderer {...commonProps} question={question} />;

		case "virtual-lab":
			return <VirtualLabRenderer {...commonProps} question={question} />;

		case "memory-match":
			return <MemoryMatchRenderer {...commonProps} question={question} />;

		case "sorting-game":
			return <SortingGameRenderer {...commonProps} question={question} />;

		case "crossword-puzzle":
			return <CrosswordPuzzleRenderer {...commonProps} question={question} />;

		case "3d-model-assembly":
			return <Model3DAssemblyRenderer {...commonProps} question={question} />;

		case "3d-scene-exploration":
			return <Scene3DExplorationRenderer {...commonProps} question={question} />;

		case "3d-anatomy":
			return <Anatomy3DRenderer {...commonProps} question={question} />;

		case "3d-physics-simulation":
			return <Physics3DSimulationRenderer {...commonProps} question={question} />;

		case "3d-architecture":
			return <Architecture3DRenderer {...commonProps} question={question} />;

		// Add more cases as we implement more question types
		default:
			return (
				<div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
					<p className="text-destructive font-medium">Question type &quot;{(question as any).type}&quot; not yet implemented</p>
					<p className="text-destructive text-sm mt-2">This question type is supported but the renderer component needs to be created.</p>
				</div>
			);
	}
}
