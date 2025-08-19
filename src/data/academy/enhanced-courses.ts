// Enhanced Course Data Using New Question System
import {
	MultipleChoiceQuestion,
	TextInputQuestion,
	SliderRangeQuestion,
	DragDropCanvasQuestion,
	FillInBlankQuestion,
	ImageHotspotQuestion,
	TimelineBuilderQuestion,
	WordMatchingQuestion,
	TrueFalseQuestion,
	SentenceOrderingQuestion,
	ImageAnnotationQuestion,
	DragDropCategorizeQuestion,
	DragDropSequenceQuestion,
	ColorPickerQuestion,
	ImageComparisonQuestion,
	FlowchartBuilderQuestion,
	Model3DInteractionQuestion,
	DiagramLabelingQuestion,
	PuzzleSliderQuestion,
	VirtualLabQuestion,
	MemoryMatchQuestion,
	SortingGameQuestion,
	CrosswordPuzzleQuestion,
	Model3DAssemblyQuestion,
	Scene3DExplorationQuestion,
	Anatomy3DQuestion,
	Physics3DSimulationQuestion,
	Architecture3DQuestion,
} from "@/types/questions";

export type EnhancedQuestion =
	| MultipleChoiceQuestion
	| TextInputQuestion
	| SliderRangeQuestion
	| DragDropCanvasQuestion
	| FillInBlankQuestion
	| ImageHotspotQuestion
	| TimelineBuilderQuestion
	| WordMatchingQuestion
	| TrueFalseQuestion
	| SentenceOrderingQuestion
	| ImageAnnotationQuestion
	| DragDropCategorizeQuestion
	| DragDropSequenceQuestion
	| ColorPickerQuestion
	| ImageComparisonQuestion
	| FlowchartBuilderQuestion
	| Model3DInteractionQuestion
	| DiagramLabelingQuestion
	| PuzzleSliderQuestion
	| VirtualLabQuestion
	| MemoryMatchQuestion
	| SortingGameQuestion
	| CrosswordPuzzleQuestion
	| Model3DAssemblyQuestion
	| Scene3DExplorationQuestion
	| Anatomy3DQuestion
	| Physics3DSimulationQuestion
	| Architecture3DQuestion;

export interface EnhancedChapter {
	id: string;
	title: string;
	description: string;
	questions: EnhancedQuestion[];
	estimatedTime: number; // in minutes
	prerequisites?: string[]; // chapter ids
}

export interface EnhancedCourse {
	id: string;
	title: string;
	description: string;
	price: number;
	details: string;
	chapters: EnhancedChapter[];
	totalQuestions: number;
	estimatedHours: number;
	skillLevel: "beginner" | "intermediate" | "advanced";
	category: string;
	tags: string[];
}

// Example enhanced course with multiple question types
export const enhancedCourses: EnhancedCourse[] = [
	{
		id: "plumbing-enhanced",
		title: "Interactive Plumbing Mastery",
		description: "Master plumbing with interactive questions, simulations, and hands-on exercises.",
		price: 79,
		details: "Comprehensive plumbing course featuring 20+ different question types including drag-and-drop simulations, interactive diagrams, and real-world scenarios.",
		skillLevel: "beginner",
		category: "Plumbing",
		tags: ["plumbing", "interactive", "hands-on", "certification"],
		totalQuestions: 0, // calculated from chapters
		estimatedHours: 8,
		chapters: [
			{
				id: "tools-and-safety",
				title: "Tools and Safety",
				description: "Learn essential plumbing tools and safety procedures through interactive exercises.",
				estimatedTime: 45,
				questions: [
					// Multiple Choice with Rich Features
					{
						id: "tool-selection-001",
						type: "multiple-choice" as const,
						title: "Essential Pipe Cutting Tool",
						description: "Which tool provides the cleanest cut for copper pipes?",
						points: 10,
						difficulty: "easy" as const,
						explanation: "A pipe cutter provides clean, precise cuts for copper pipes and prevents burrs that can restrict flow or cause leaks.",
						hints: ["Look for a tool that rotates around the pipe", "Consider tools that create smooth edges"],
						tags: ["tools", "copper", "cutting"],
						options: [
							{
								id: "hacksaw",
								text: "Hacksaw",
								isCorrect: false,
								explanation: "Hacksaws can leave rough edges and burrs that affect pipe performance.",
							},
							{
								id: "pipe-cutter",
								text: "Pipe cutter",
								isCorrect: true,
								explanation: "Pipe cutters create clean, straight cuts without burrs.",
							},
							{
								id: "angle-grinder",
								text: "Angle grinder",
								isCorrect: false,
								explanation: "Angle grinders are too aggressive and can damage thin pipe walls.",
							},
							{
								id: "reciprocating-saw",
								text: "Reciprocating saw",
								isCorrect: false,
								explanation: "Reciprocating saws create rough cuts and are hard to control on round pipes.",
							},
						],
						allowMultiple: false,
						randomizeOrder: true,
						timeLimit: 120,
					},

					// Text Input with Validation
					{
						id: "safety-gear-001",
						type: "text-input" as const,
						title: "Eye Protection",
						description: "What type of personal protective equipment should always be worn when cutting or soldering pipes?",
						points: 5,
						difficulty: "easy" as const,
						explanation: "Safety glasses or goggles protect eyes from metal shavings, flux, and hot solder splatter.",
						placeholder: "Enter the PPE type...",
						maxLength: 30,
						validation: {
							correctAnswer: "safety glasses",
							caseSensitive: false,
							acceptableVariations: ["goggles", "eye protection", "safety goggles", "protective glasses"],
							partialCredit: true,
						},
						hints: ["Think about protecting your vision from debris and sparks"],
					},

					// Slider Range for Measurements
					{
						id: "pipe-pressure-001",
						type: "slider-range" as const,
						title: "Optimal Water Pressure",
						description: "Set the ideal water pressure for a residential plumbing system.",
						points: 10,
						difficulty: "medium" as const,
						explanation: "Residential water pressure should be 40-60 PSI, with 50 PSI being optimal. Too low pressure affects fixtures, too high pressure can damage pipes and waste water.",
						slider: {
							min: 10,
							max: 100,
							step: 5,
							unit: "PSI",
							correctValue: 50,
							tolerance: 10,
						},
					},

					// Drag and Drop Canvas
					{
						id: "pipe-layout-001",
						type: "drag-drop-canvas" as const,
						title: "Pipe Layout Design",
						description: "Arrange the plumbing components in the correct layout for a bathroom installation.",
						points: 25,
						difficulty: "hard" as const,
						explanation: "Proper pipe layout minimizes joints, maintains proper slope for drainage, and provides easy access for maintenance.",
						canvas: {
							width: 600,
							height: 400,
							backgroundImage: "/images/bathroom-floor-plan.png",
							gridSize: 20,
						},
						draggableItems: [
							{
								id: "supply-line",
								content: "Hot Water Supply",
								type: "text",
							},
							{
								id: "cold-supply",
								content: "Cold Water Supply",
								type: "text",
							},
							{
								id: "drain-line",
								content: "Drain Line",
								type: "text",
							},
							{
								id: "vent-pipe",
								content: "Vent Pipe",
								type: "text",
							},
						],
						dropZones: [
							{
								id: "hot-zone",
								x: 100,
								y: 100,
								width: 120,
								height: 60,
								acceptsItems: ["supply-line"],
								label: "Hot Water Path",
							},
							{
								id: "cold-zone",
								x: 100,
								y: 200,
								width: 120,
								height: 60,
								acceptsItems: ["cold-supply"],
								label: "Cold Water Path",
							},
							{
								id: "drain-zone",
								x: 300,
								y: 250,
								width: 120,
								height: 60,
								acceptsItems: ["drain-line"],
								label: "Drainage",
							},
							{
								id: "vent-zone",
								x: 450,
								y: 50,
								width: 100,
								height: 150,
								acceptsItems: ["vent-pipe"],
								label: "Ventilation",
							},
						],
						correctPlacements: [
							{ itemId: "supply-line", zoneId: "hot-zone" },
							{ itemId: "cold-supply", zoneId: "cold-zone" },
							{ itemId: "drain-line", zoneId: "drain-zone" },
							{ itemId: "vent-pipe", zoneId: "vent-zone" },
						],
					},
				],
			},

			{
				id: "pipe-installation",
				title: "Pipe Installation Techniques",
				description: "Master different pipe installation methods through interactive simulations.",
				estimatedTime: 60,
				prerequisites: ["tools-and-safety"],
				questions: [
					// Advanced Multiple Choice
					{
						id: "joint-selection-001",
						type: "multiple-choice" as const,
						title: "Pipe Joint Selection",
						description: "You need to connect a copper pipe to a steel pipe. Which method should you use to prevent galvanic corrosion?",
						points: 15,
						difficulty: "hard" as const,
						explanation: "Dielectric unions prevent galvanic corrosion by electrically isolating dissimilar metals while maintaining a watertight seal.",
						hints: ["Think about preventing electrical contact between different metals"],
						tags: ["corrosion", "joints", "materials"],
						options: [
							{
								id: "direct-solder",
								text: "Direct solder connection",
								isCorrect: false,
								explanation: "Direct connection of dissimilar metals causes galvanic corrosion.",
							},
							{
								id: "dielectric-union",
								text: "Dielectric union",
								isCorrect: true,
								explanation: "Dielectric unions prevent galvanic corrosion by isolating dissimilar metals.",
							},
							{
								id: "threaded-coupling",
								text: "Threaded coupling",
								isCorrect: false,
								explanation: "Threaded couplings still allow electrical contact between metals.",
							},
							{
								id: "compression-fitting",
								text: "Compression fitting",
								isCorrect: false,
								explanation: "Standard compression fittings don't prevent galvanic corrosion.",
							},
						],
						allowMultiple: false,
						randomizeOrder: false,
						timeLimit: 180,
					},

					// Text Input with Technical Terms
					{
						id: "slope-calculation-001",
						type: "text-input" as const,
						title: "Drain Pipe Slope",
						description: "What is the standard slope requirement for drain pipes (in inches per foot)?",
						points: 10,
						difficulty: "medium" as const,
						explanation: "Standard drain pipe slope is 1/4 inch per foot (2% grade) to ensure proper drainage flow without being too steep.",
						placeholder: "Enter slope in inches per foot...",
						maxLength: 20,
						validation: {
							correctAnswer: "1/4 inch per foot",
							caseSensitive: false,
							acceptableVariations: ["1/4", "0.25", "quarter inch per foot", "2%", "2 percent"],
							partialCredit: true,
						},
						hints: ["Think about the minimum slope needed for gravity flow"],
					},
				],
			},

			// New Chapter: Advanced Interactive Learning
			{
				id: "advanced-interactive",
				title: "Advanced Interactive Learning",
				description: "Experience all types of interactive questions with plumbing scenarios.",
				estimatedTime: 90,
				prerequisites: ["pipe-installation"],
				questions: [
					// Fill in the Blank Question
					{
						id: "code-requirements-001",
						type: "fill-in-blank" as const,
						title: "Plumbing Code Requirements",
						description: "Complete the sentences about plumbing code requirements.",
						points: 15,
						difficulty: "medium" as const,
						explanation: "GFCI protection is required in wet areas to prevent electrical shock, and proper venting prevents sewer gas from entering buildings.",
						template: "In residential bathrooms, outlets within {{blank1}} feet of water sources must be {{blank2}} protected. All plumbing fixtures require proper {{blank3}} to prevent sewer gas infiltration.",
						blanks: [
							{
								id: "blank1",
								correctAnswers: ["6", "six"],
								placeholder: "distance...",
							},
							{
								id: "blank2",
								correctAnswers: ["GFCI", "Ground Fault Circuit Interrupter"],
								placeholder: "protection type...",
							},
							{
								id: "blank3",
								correctAnswers: ["venting", "ventilation", "vents"],
								placeholder: "system type...",
							},
						],
						hints: ["Think about electrical safety near water", "Consider distances in building codes"],
					},

					// Image Hotspot Question
					{
						id: "system-diagram-001",
						type: "image-hotspot" as const,
						title: "Plumbing System Components",
						description: "Click on the water heater and main shut-off valve in this home plumbing diagram.",
						points: 20,
						difficulty: "medium" as const,
						explanation: "The water heater provides hot water throughout the home, while the main shut-off valve controls water flow to the entire house and should be easily accessible.",
						image: {
							src: "/images/plumbing-system-diagram.jpg",
							width: 800,
							height: 600,
							alt: "Home plumbing system diagram showing various components",
						},
						hotspots: [
							{
								id: "water-heater",
								x: 200,
								y: 300,
								radius: 40,
								isCorrect: true,
								feedback: "Correct! The water heater heats water for the entire home's hot water system.",
							},
							{
								id: "main-shutoff",
								x: 100,
								y: 150,
								radius: 30,
								isCorrect: true,
								feedback: "Correct! The main shut-off valve controls water flow to the entire house.",
							},
							{
								id: "water-meter",
								x: 50,
								y: 100,
								radius: 25,
								isCorrect: false,
								feedback: "This is the water meter, which measures water usage but doesn't control flow.",
							},
							{
								id: "pressure-tank",
								x: 300,
								y: 200,
								radius: 35,
								isCorrect: false,
								feedback: "This is a pressure tank for well water systems, not what we're looking for.",
							},
						],
						maxSelections: 2,
						hints: ["Look for cylindrical tanks and valve symbols"],
					},

					// Timeline Builder Question
					{
						id: "installation-sequence-001",
						type: "timeline-builder" as const,
						title: "Bathroom Installation Sequence",
						description: "Arrange the bathroom installation steps in the correct order.",
						points: 20,
						difficulty: "hard" as const,
						explanation: "Proper installation sequence prevents damage and rework. Rough-in work must be completed and inspected before finishing work begins.",
						events: [
							{
								id: "rough-plumbing",
								title: "Install Rough Plumbing",
								description: "Install water supply lines and drain pipes in walls and floor",
							},
							{
								id: "frame-walls",
								title: "Frame Walls",
								description: "Build wall framing around plumbing rough-in",
							},
							{
								id: "install-fixtures",
								title: "Install Fixtures",
								description: "Mount toilet, sink, tub, and shower fixtures",
							},
							{
								id: "drywall",
								title: "Install Drywall",
								description: "Cover walls with drywall and finish surfaces",
							},
							{
								id: "tile-work",
								title: "Install Tile",
								description: "Install floor and wall tiles in wet areas",
							},
							{
								id: "final-connections",
								title: "Final Connections",
								description: "Connect fixtures to supply lines and test system",
							},
						],
						correctOrder: ["frame-walls", "rough-plumbing", "drywall", "tile-work", "install-fixtures", "final-connections"],
						hints: ["Start with structural work, then utilities, then finishes"],
					},

					// Word Matching Question
					{
						id: "plumbing-terminology-001",
						type: "word-matching" as const,
						title: "Plumbing Terminology",
						description: "Match the plumbing terms with their correct definitions.",
						points: 15,
						difficulty: "easy" as const,
						explanation: "Understanding plumbing terminology is essential for effective communication with suppliers, inspectors, and customers.",
						leftColumn: [
							{ id: "pex", text: "PEX" },
							{ id: "trap", text: "P-Trap" },
							{ id: "shutoff", text: "Shut-off Valve" },
							{ id: "gfci", text: "GFCI" },
							{ id: "vent", text: "Vent Stack" },
						],
						rightColumn: [
							{ id: "def1", text: "Cross-linked polyethylene flexible piping material" },
							{ id: "def2", text: "Curved pipe section that holds water to prevent sewer gas" },
							{ id: "def3", text: "Device that stops water flow to a fixture or area" },
							{ id: "def4", text: "Safety device that protects against electrical shock near water" },
							{ id: "def5", text: "Vertical pipe that allows air into the drain system" },
						],
						correctMatches: [
							{ leftId: "pex", rightId: "def1" },
							{ leftId: "trap", rightId: "def2" },
							{ leftId: "shutoff", rightId: "def3" },
							{ leftId: "gfci", rightId: "def4" },
							{ leftId: "vent", rightId: "def5" },
						],
						hints: ["Think about the function of each component"],
					},
				],
			},

			// New Chapter: Advanced Question Types
			{
				id: "advanced-question-types",
				title: "Advanced Question Types Showcase",
				description: "Experience all the different interactive question types available in our system.",
				estimatedTime: 120,
				prerequisites: ["advanced-interactive"],
				questions: [
					// True/False Question
					{
						id: "pipe-safety-true-false",
						type: "true-false" as const,
						title: "PEX Pipe Safety Statement",
						description: "Evaluate the truth of this plumbing safety statement.",
						points: 10,
						difficulty: "easy" as const,
						explanation: "Understanding PEX pipe properties is crucial for safe installation.",
						statement: "PEX pipe is safe for both hot and cold water applications and can withstand freezing better than copper pipes.",
						correctAnswer: true,
						trueExplanation: "Correct! PEX is rated for both hot and cold water and its flexibility allows it to expand during freezing, making it less likely to burst than rigid copper pipes.",
						falseExplanation: "PEX pipe is indeed safe for both applications and is more freeze-resistant than copper due to its flexibility.",
						hints: ["Think about PEX's flexibility properties", "Consider temperature ratings"],
					},

					// Sentence Ordering Question
					{
						id: "pipe-repair-sequence",
						type: "sentence-ordering" as const,
						title: "Pipe Repair Procedure",
						description: "Arrange the steps for repairing a burst pipe in the correct order.",
						points: 15,
						difficulty: "medium" as const,
						explanation: "Following the correct sequence ensures safety and prevents further damage during pipe repairs.",
						sentences: [
							{
								id: "shut-off-water",
								text: "Shut off the main water supply to prevent flooding",
								order: 1,
							},
							{
								id: "drain-lines",
								text: "Open faucets to drain remaining water from the lines",
								order: 2,
							},
							{
								id: "assess-damage",
								text: "Assess the extent of damage and determine repair method",
								order: 3,
							},
							{
								id: "cut-damaged-section",
								text: "Cut out the damaged section of pipe with appropriate tools",
								order: 4,
							},
							{
								id: "install-replacement",
								text: "Install the replacement pipe section with proper fittings",
								order: 5,
							},
							{
								id: "test-system",
								text: "Turn water back on and test the system for leaks",
								order: 6,
							},
						],
						correctOrder: ["shut-off-water", "drain-lines", "assess-damage", "cut-damaged-section", "install-replacement", "test-system"],
						hints: ["Safety first - prevent flooding", "Always test your work"],
					},

					// Drag and Drop Categorize Question
					{
						id: "pipe-material-categorization",
						type: "drag-drop-categorize" as const,
						title: "Pipe Material Categories",
						description: "Categorize these plumbing materials by their primary application.",
						points: 20,
						difficulty: "medium" as const,
						explanation: "Different pipe materials are designed for specific applications based on pressure, temperature, and chemical compatibility requirements.",
						categories: [
							{
								id: "water-supply",
								name: "Water Supply",
								description: "Materials used for delivering clean water",
								color: "hsl(var(--primary))",
							},
							{
								id: "drainage",
								name: "Drainage & Waste",
								description: "Materials used for waste water removal",
								color: "hsl(var(--muted-foreground))",
							},
							{
								id: "gas-lines",
								name: "Gas Lines",
								description: "Materials used for natural gas distribution",
								color: "hsl(var(--accent))",
							},
						],
						items: [
							{
								id: "copper-pipe",
								content: "Copper Pipe",
								category: "water-supply",
								type: "text",
							},
							{
								id: "pex-tubing",
								content: "PEX Tubing",
								category: "water-supply",
								type: "text",
							},
							{
								id: "pvc-pipe",
								content: "PVC Pipe",
								category: "drainage",
								type: "text",
							},
							{
								id: "abs-pipe",
								content: "ABS Pipe",
								category: "drainage",
								type: "text",
							},
							{
								id: "csst-tubing",
								content: "CSST Tubing",
								category: "gas-lines",
								type: "text",
							},
							{
								id: "black-iron-pipe",
								content: "Black Iron Pipe",
								category: "gas-lines",
								type: "text",
							},
						],
						correctCategorization: [
							{ itemId: "copper-pipe", categoryId: "water-supply" },
							{ itemId: "pex-tubing", categoryId: "water-supply" },
							{ itemId: "pvc-pipe", categoryId: "drainage" },
							{ itemId: "abs-pipe", categoryId: "drainage" },
							{ itemId: "csst-tubing", categoryId: "gas-lines" },
							{ itemId: "black-iron-pipe", categoryId: "gas-lines" },
						],
						hints: ["Consider what each material is designed to handle", "Think about pressure and chemical compatibility"],
					},

					// Drag and Drop Sequence Question
					{
						id: "tool-usage-sequence",
						type: "drag-drop-sequence" as const,
						title: "Tool Usage Sequence",
						description: "Arrange these plumbing tools in order of typical usage during a faucet installation.",
						points: 15,
						difficulty: "medium" as const,
						explanation: "Using tools in the correct sequence ensures efficiency and prevents damage to components.",
						items: [
							{
								id: "measuring-tape",
								content: "Measuring Tape",
								type: "text",
							},
							{
								id: "pipe-wrench",
								content: "Pipe Wrench",
								type: "text",
							},
							{
								id: "drill",
								content: "Drill",
								type: "text",
							},
							{
								id: "adjustable-wrench",
								content: "Adjustable Wrench",
								type: "text",
							},
							{
								id: "level",
								content: "Level",
								type: "text",
							},
						],
						correctSequence: ["measuring-tape", "drill", "level", "pipe-wrench", "adjustable-wrench"],
						sequenceType: "procedural",
						hints: ["Start with planning and measurement", "End with final connections"],
					},

					// Color Picker Question
					{
						id: "pipe-marking-color",
						type: "color-picker" as const,
						title: "Pipe Marking Color Code",
						description: "Select the correct color used to mark natural gas pipes according to ANSI standards.",
						points: 10,
						difficulty: "easy" as const,
						explanation: "ANSI A13.1 standards specify yellow as the color for natural gas pipe marking to ensure safety and easy identification.",
						scenario: "You need to mark a natural gas supply line according to ANSI A13.1 color coding standards.",
						targetColor: "hsl(var(--primary))",
						tolerance: 30,
						colorSpace: "hex",
						hints: ["Think about warning colors", "Consider the color associated with caution"],
					},

					// Image Annotation Question
					{
						id: "bathroom-fixture-annotation",
						type: "image-annotation" as const,
						title: "Bathroom Fixture Identification",
						description: "Click to identify and label the main plumbing fixtures in this bathroom.",
						points: 20,
						difficulty: "medium" as const,
						explanation: "Proper identification of plumbing fixtures is essential for planning renovations and understanding system layouts.",
						image: {
							src: "/images/bathroom-fixtures.jpg",
							width: 800,
							height: 600,
							alt: "Bathroom with various plumbing fixtures",
						},
						annotations: [
							{
								id: "toilet",
								x: 25,
								y: 60,
								label: "Toilet",
								description: "Main waste disposal fixture",
							},
							{
								id: "sink",
								x: 70,
								y: 40,
								label: "Bathroom Sink",
								description: "Hand washing and grooming fixture",
							},
							{
								id: "shower",
								x: 15,
								y: 25,
								label: "Shower",
								description: "Personal hygiene fixture",
							},
							{
								id: "bathtub",
								x: 50,
								y: 80,
								label: "Bathtub",
								description: "Bathing fixture",
							},
						],
						userCanAddAnnotations: true,
						maxAnnotations: 4,
						hints: ["Look for water supply and drainage fixtures", "Consider both supply and waste functions"],
					},

					// Image Comparison Question
					{
						id: "pipe-joint-comparison",
						type: "image-comparison" as const,
						title: "Pipe Joint Differences",
						description: "Find the differences between these two pipe joint configurations.",
						points: 25,
						difficulty: "hard" as const,
						explanation: "Identifying differences in pipe joint configurations helps diagnose installation errors and ensure proper connections.",
						images: [
							{
								id: "joint-correct",
								src: "/images/pipe-joint-correct.jpg",
								alt: "Correctly installed pipe joint",
							},
							{
								id: "joint-incorrect",
								src: "/images/pipe-joint-incorrect.jpg",
								alt: "Incorrectly installed pipe joint",
							},
						],
						differences: [
							{
								id: "missing-sealant",
								imageId: "joint-incorrect",
								x: 45,
								y: 35,
								radius: 8,
								description: "Missing pipe thread sealant",
							},
							{
								id: "wrong-angle",
								imageId: "joint-incorrect",
								x: 60,
								y: 50,
								radius: 10,
								description: "Pipe installed at wrong angle",
							},
							{
								id: "loose-connection",
								imageId: "joint-incorrect",
								x: 30,
								y: 65,
								radius: 6,
								description: "Loose threaded connection",
							},
						],
						maxFinds: 3,
						timeLimit: 180,
						hints: ["Look for missing components", "Check connection tightness", "Examine joint angles"],
					},

					// Flowchart Builder Question
					{
						id: "leak-diagnosis-flowchart",
						type: "flowchart-builder" as const,
						title: "Leak Diagnosis Process",
						description: "Build a flowchart showing the logical process for diagnosing a water leak.",
						points: 30,
						difficulty: "hard" as const,
						explanation: "A systematic approach to leak diagnosis saves time and ensures all potential sources are checked methodically.",
						nodes: [
							{
								id: "start",
								type: "start",
								content: "Water Leak Detected",
							},
							{
								id: "shut-off-main",
								type: "process",
								content: "Shut Off Main Water",
							},
							{
								id: "meter-check",
								type: "decision",
								content: "Meter Still Running?",
							},
							{
								id: "service-line-leak",
								type: "process",
								content: "Check Service Line",
							},
							{
								id: "internal-inspection",
								type: "process",
								content: "Inspect Internal Plumbing",
							},
							{
								id: "repair-needed",
								type: "end",
								content: "Schedule Repair",
							},
						],
						connections: [
							{
								fromId: "start",
								toId: "shut-off-main",
							},
							{
								fromId: "shut-off-main",
								toId: "meter-check",
							},
							{
								fromId: "meter-check",
								toId: "service-line-leak",
								label: "Yes",
							},
							{
								fromId: "meter-check",
								toId: "internal-inspection",
								label: "No",
							},
							{
								fromId: "service-line-leak",
								toId: "repair-needed",
							},
							{
								fromId: "internal-inspection",
								toId: "repair-needed",
							},
						],
						correctFlowchart: [
							{ nodeId: "start", x: 50, y: 10 },
							{ nodeId: "shut-off-main", x: 50, y: 25 },
							{ nodeId: "meter-check", x: 50, y: 45 },
							{ nodeId: "service-line-leak", x: 25, y: 65 },
							{ nodeId: "internal-inspection", x: 75, y: 65 },
							{ nodeId: "repair-needed", x: 50, y: 85 },
						],
						hints: ["Start with safety measures", "Use logical decision points", "End with action items"],
					},

					// 3D Model Interaction Question
					{
						id: "pipe-assembly-3d",
						type: "3d-model-interaction" as const,
						title: "3D Pipe Assembly",
						description: "Identify the components that need attention in this pipe assembly.",
						points: 25,
						difficulty: "hard" as const,
						explanation: "3D visualization helps understand complex pipe assemblies and identify components that require maintenance or adjustment.",
						modelSrc: "/images/pipe-assembly-3d.jpg",
						interactionType: "highlight",
						targets: [
							{
								id: "valve-a",
								name: "Main Shut-off Valve",
								description: "Primary water control valve",
							},
							{
								id: "pressure-gauge",
								name: "Pressure Gauge",
								description: "System pressure monitoring device",
							},
							{
								id: "relief-valve",
								name: "Pressure Relief Valve",
								description: "Safety pressure release mechanism",
							},
							{
								id: "union-joint",
								name: "Union Joint",
								description: "Removable pipe connection",
							},
						],
						correctInteractions: ["valve-a", "pressure-gauge", "relief-valve"],
						hints: ["Look for safety components", "Identify control mechanisms", "Find monitoring devices"],
					},

					// Diagram Labeling Question
					{
						id: "water-heater-diagram",
						type: "diagram-labeling" as const,
						title: "Water Heater Component Labeling",
						description: "Label the key components of this water heater diagram.",
						points: 25,
						difficulty: "medium" as const,
						explanation: "Understanding water heater components is essential for maintenance, troubleshooting, and safety inspections.",
						diagram: {
							src: "/images/water-heater-diagram.jpg",
							width: 600,
							height: 800,
						},
						labels: [
							{
								id: "cold-inlet",
								text: "Cold Water Inlet",
							},
							{
								id: "hot-outlet",
								text: "Hot Water Outlet",
							},
							{
								id: "heating-element",
								text: "Heating Element",
							},
							{
								id: "thermostat",
								text: "Thermostat",
							},
							{
								id: "relief-valve",
								text: "Temperature Relief Valve",
							},
							{
								id: "drain-valve",
								text: "Drain Valve",
							},
						],
						labelPoints: [
							{
								id: "point-1",
								x: 25,
								y: 15,
								correctLabelId: "cold-inlet",
							},
							{
								id: "point-2",
								x: 75,
								y: 15,
								correctLabelId: "hot-outlet",
							},
							{
								id: "point-3",
								x: 20,
								y: 45,
								correctLabelId: "heating-element",
							},
							{
								id: "point-4",
								x: 80,
								y: 40,
								correctLabelId: "thermostat",
							},
							{
								id: "point-5",
								x: 50,
								y: 25,
								correctLabelId: "relief-valve",
							},
							{
								id: "point-6",
								x: 50,
								y: 85,
								correctLabelId: "drain-valve",
							},
						],
						hints: ["Hot water rises to the top", "Safety components are crucial", "Maintenance access points are typically at the bottom"],
					},
				],
			},
			{
				id: "3d-immersive-learning",
				title: "3D Immersive Learning Experience",
				description: "Explore plumbing concepts in fully immersive 3D environments using Three.js technology.",
				estimatedTime: 180,
				prerequisites: ["advanced-interactive"],
				questions: [
					// 3D Model Assembly Question
					{
						id: "pipe-assembly-3d",
						type: "3d-model-assembly" as const,
						title: "3D Pipe Joint Assembly",
						description: "Learn to properly assemble a complex pipe joint in 3D space. Drag and position each component in the correct order.",
						points: 25,
						difficulty: "advanced",
						scene: {
							backgroundColor: "hsl(var(--muted))",
							lighting: "mixed",
						},
						components: [
							{
								id: "main-pipe",
								name: "Main Pipe",
								geometry: "cylinder",
								material: {
									color: "hsl(var(--primary))",
									type: "standard",
									roughness: 0.3,
									metalness: 0.7,
								},
								dimensions: { width: 2, height: 8, depth: 2 },
								targetPosition: { x: 0, y: 0, z: 0 },
								targetRotation: { x: 0, y: 0, z: 0 },
							},
							{
								id: "elbow-joint",
								name: "90° Elbow Joint",
								geometry: "box",
								material: {
									color: "hsl(var(--muted-foreground))",
									type: "standard",
									roughness: 0.4,
									metalness: 0.5,
								},
								dimensions: { width: 2.2, height: 2.2, depth: 2.2 },
								targetPosition: { x: 0, y: 4, z: 0 },
								targetRotation: { x: 0, y: Math.PI / 4, z: 0 },
							},
						],
						assemblyOrder: ["main-pipe", "elbow-joint"],
						tolerance: 1.0,
						showWireframe: false,
						allowFreeRotation: true,
						explanation: "Proper pipe assembly requires precise alignment and correct sequencing to ensure leak-free joints.",
					},
				],
			},
		],
	},
];

// Calculate total questions for each course
enhancedCourses.forEach((course) => {
	course.totalQuestions = course.chapters.reduce((total, chapter) => total + chapter.questions.length, 0);
});
