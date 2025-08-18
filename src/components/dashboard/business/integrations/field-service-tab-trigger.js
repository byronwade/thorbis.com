"use client";
import { TabsTrigger } from "@components/ui/tabs";
import { Wrench } from "lucide-react";

/**
 * Field Service tab trigger component
 * Conditional tab trigger for field service management features
 */
export default function FieldServiceTabTrigger() {
	// Mock visibility check - in production would check business integrations
	const hasFieldServiceIntegration = true;

	if (!hasFieldServiceIntegration) {
		return null;
	}

	return (
		<TabsTrigger value="field-service" className="flex items-center gap-2">
			<Wrench className="h-4 w-4" />
			Field Service
		</TabsTrigger>
	);
}
