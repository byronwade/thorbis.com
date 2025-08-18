/**
 * Refactored Partnerships Section Component
 * Orchestrates partnership management using modular components and hooks
 */

import React from "react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@components/ui/card";
import { Handshake, Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { usePartnerships } from "@lib/hooks/business/partnerships";
import { BusinessSearchSection, PartnershipCard, VerificationSection, PartnershipsOverview } from "@components/dashboard/business/partnerships";

const PartnershipsSection = ({ profile, setProfile }) => {
	const {
		// State
		selectedPartnership,
		setSelectedPartnership,
		isAddingPartnership,
		setIsAddingPartnership,
		isSearching,
		searchQuery,
		setSearchQuery,
		searchResults,
		hasSearched,
		showNoResults,
		editingPartnership,
		setEditingPartnership,
		hoveredPartnership,
		setHoveredPartnership,
		showVerificationSteps,
		setShowVerificationSteps,

		// Refs
		fileInputRef,

		// Actions
		handleBusinessSelect,
		addPartnership,
		removePartnership,
		updatePartnership,
		startVerification,
		handleDocumentUpload,
		completeVerification,
		updateVerificationStep,
	} = usePartnerships(profile, setProfile);

	const partnerships = profile.partnerships || [];

	return (
		<div className="space-y-6">
			{/* Partnerships Overview */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<Handshake className="w-5 h-5" />
							<span>Partnerships ({partnerships.length})</span>
						</div>
						{!isAddingPartnership && (
							<Button onClick={addPartnership}>
								<Plus className="mr-2 w-4 h-4" />
								Add Partnership
							</Button>
						)}
					</CardTitle>
					<CardDescription>Manage your business partnerships and strategic alliances</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Add Partnership Section */}
					<AnimatePresence>{isAddingPartnership && <BusinessSearchSection isSearching={isSearching} searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchResults={searchResults} hasSearched={hasSearched} showNoResults={showNoResults} onBusinessSelect={handleBusinessSelect} onClose={() => setIsAddingPartnership(false)} />}</AnimatePresence>

					{/* Partnerships Overview Stats */}
					{partnerships.length > 0 && !isAddingPartnership && <PartnershipsOverview partnerships={partnerships} />}

					{/* Partnerships List */}
					{partnerships.length > 0 && (
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Your Partnerships</h3>
							<div className="grid gap-4">
								<AnimatePresence>
									{partnerships.map((partnership) => (
										<PartnershipCard
											key={partnership.id}
											partnership={partnership}
											onEdit={setEditingPartnership}
											onRemove={removePartnership}
											onStartVerification={() => {
												setSelectedPartnership(partnership);
												setShowVerificationSteps(partnership.id);
											}}
											onViewDetails={(p) => {
												// Handle view details - could open a modal or navigate
												console.log("View details for:", p.name);
											}}
											onHover={setHoveredPartnership}
											onLeave={() => setHoveredPartnership(null)}
											isHovered={hoveredPartnership?.id === partnership.id}
										/>
									))}
								</AnimatePresence>
							</div>
						</div>
					)}

					{/* Empty State */}
					{partnerships.length === 0 && !isAddingPartnership && (
						<div className="text-center py-12">
							<Handshake className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
							<h3 className="text-lg font-semibold mb-2">No Partnerships Yet</h3>
							<p className="text-muted-foreground mb-4">Start building valuable business relationships by adding your first partnership.</p>
							<Button onClick={addPartnership}>
								<Plus className="mr-2 w-4 h-4" />
								Add Your First Partnership
							</Button>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Verification Modal */}
			<AnimatePresence>
				{showVerificationSteps && selectedPartnership && (
					<VerificationSection
						partnership={selectedPartnership}
						onClose={() => {
							setShowVerificationSteps(null);
							setSelectedPartnership(null);
						}}
						onCompleteVerification={completeVerification}
						onUpdateStep={updateVerificationStep}
						onDocumentUpload={handleDocumentUpload}
						fileInputRef={fileInputRef}
					/>
				)}
			</AnimatePresence>
		</div>
	);
};

export default PartnershipsSection;
