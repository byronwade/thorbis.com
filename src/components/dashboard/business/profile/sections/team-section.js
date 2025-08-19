/**
 * TeamSection Component
 * Business profile team management section
 * Extracted from large profile page for better organization
 */

"use client";

import React from "react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Label } from "@components/ui/label";
import { Badge } from "@components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Plus, Trash2, Users, Mail, Phone } from "lucide-react";

// Import custom hook
import { useBusinessTeam } from "@lib/hooks/business/profile/use-business-team";

export const TeamSection = ({ 
	initialTeam = [], 
	onSave,
	showSocialLinks = false 
}) => {
	const {
		team,
		addTeamMember,
		removeTeamMember,
		updateTeamMember,
		updateTeamMemberSocial,
		validateAllTeamMembers,
		duplicateTeamMember,
		stats,
		hasMembers,
	} = useBusinessTeam(initialTeam);

	const handleSave = () => {
		if (validateAllTeamMembers()) {
			onSave?.(team);
		}
	};

	return (
		<div className="space-y-6">
			{/* Team Overview */}
			<Card suppressHydrationWarning>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Users className="w-5 h-5" />
						<span>Team Members ({stats.total})</span>
					</CardTitle>
					<CardDescription>
						Showcase your team members and their expertise to build trust with customers.
					</CardDescription>
				</CardHeader>
				
				{hasMembers && (
					<CardContent className="space-y-4">
						{team.map((member, index) => (
							<TeamMemberCard
								key={member.id}
								member={member}
								index={index}
								onUpdate={updateTeamMember}
								onRemove={removeTeamMember}
								onDuplicate={duplicateTeamMember}
								onUpdateSocial={updateTeamMemberSocial}
								showSocialLinks={showSocialLinks}
							/>
						))}
					</CardContent>
				)}

				<CardFooter className="border-t">
					<div className="flex justify-between items-center w-full">
						<Button variant="outline" onClick={addTeamMember} className="flex-1 mr-2">
							<Plus className="mr-2 w-4 h-4" />
							Add Team Member
						</Button>
						{hasMembers && (
							<Button onClick={handleSave}>
								Save Changes
							</Button>
						)}
					</div>
				</CardFooter>
			</Card>

			{/* Empty State */}
			{!hasMembers && (
				<TeamEmptyState onAddMember={addTeamMember} />
			)}

			{/* Team Statistics */}
			{hasMembers && (
				<Card>
					<CardContent className="pt-6">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
							<div>
								<div className="text-2xl font-bold text-primary">{stats.total}</div>
								<div className="text-sm text-muted-foreground">Total Members</div>
							</div>
							<div>
								<div className="text-2xl font-bold text-success">{stats.complete}</div>
								<div className="text-sm text-muted-foreground">Complete Profiles</div>
							</div>
							<div>
								<div className="text-2xl font-bold text-primary">{stats.active}</div>
								<div className="text-sm text-muted-foreground">Active Members</div>
							</div>
							<div>
								<div className="text-2xl font-bold text-purple-600">{stats.completionRate}%</div>
								<div className="text-sm text-muted-foreground">Completion Rate</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

// Individual Team Member Card Component
const TeamMemberCard = ({ 
	member, 
	index, 
	onUpdate, 
	onRemove, 
	onDuplicate,
	onUpdateSocial,
	showSocialLinks 
}) => {
	const isComplete = member.name && member.role;
	const initials = member.name ? member.name.split(" ").map(n => n[0]).join("").toUpperCase() : "TM";

	return (
		<div className="p-4 rounded-lg border transition-all duration-200 group hover:border-primary/50 bg-muted/20">
			{/* Member Header */}
			<div className="flex justify-between items-start mb-4">
				<div className="flex items-center space-x-3">
					<Avatar className="w-12 h-12">
						<AvatarImage src={member.avatar} alt={member.name} />
						<AvatarFallback className="bg-primary/10 text-primary">
							{initials}
						</AvatarFallback>
					</Avatar>
					<div>
						<h4 className="font-medium flex items-center space-x-2">
							<span>Team Member #{index + 1}</span>
							{isComplete ? (
								<Badge variant="secondary" className="text-xs bg-success/10 text-success">
									Complete
								</Badge>
							) : (
								<Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
									Incomplete
								</Badge>
							)}
						</h4>
						{member.joinedDate && (
							<p className="text-xs text-muted-foreground">
								Joined {new Date(member.joinedDate).toLocaleDateString()}
							</p>
						)}
					</div>
				</div>
				
				<div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
					<Button 
						variant="ghost" 
						size="sm" 
						onClick={() => onDuplicate(member.id)}
						className="text-muted-foreground hover:text-primary"
					>
						<Plus className="w-4 h-4" />
					</Button>
					<Button 
						variant="ghost" 
						size="sm" 
						onClick={() => onRemove(member.id)} 
						className="text-destructive hover:text-destructive hover:bg-destructive/10"
					>
						<Trash2 className="w-4 h-4" />
					</Button>
				</div>
			</div>

			{/* Member Details */}
			<div className="space-y-3">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<div>
						<Label className="text-sm text-muted-foreground">Name *</Label>
						<Input 
							value={member.name} 
							onChange={(e) => onUpdate(member.id, "name", e.target.value)} 
							placeholder="Team member name" 
							className="h-9"
						/>
					</div>
					<div>
						<Label className="text-sm text-muted-foreground">Role/Title *</Label>
						<Input 
							value={member.role} 
							onChange={(e) => onUpdate(member.id, "role", e.target.value)} 
							placeholder="Job title or role" 
							className="h-9"
						/>
					</div>
				</div>

				<div>
					<Label className="text-sm text-muted-foreground">Bio</Label>
					<Textarea 
						value={member.bio} 
						onChange={(e) => onUpdate(member.id, "bio", e.target.value)} 
						placeholder="Brief bio about this team member's expertise and background..." 
						rows={2} 
						className="resize-none"
					/>
				</div>

				{/* Contact Information */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<div>
						<Label className="text-sm text-muted-foreground flex items-center space-x-1">
							<Mail className="w-3 h-3" />
							<span>Email</span>
						</Label>
						<Input 
							type="email"
							value={member.email} 
							onChange={(e) => onUpdate(member.id, "email", e.target.value)} 
							placeholder="email@example.com" 
							className="h-9"
						/>
					</div>
					<div>
						<Label className="text-sm text-muted-foreground flex items-center space-x-1">
							<Phone className="w-3 h-3" />
							<span>Phone</span>
						</Label>
						<Input 
							type="tel"
							value={member.phone} 
							onChange={(e) => onUpdate(member.id, "phone", e.target.value)} 
							placeholder="(555) 123-4567" 
							className="h-9"
						/>
					</div>
				</div>

				{/* Social Links (Optional) */}
				{showSocialLinks && (
					<div className="pt-2 border-t">
						<Label className="text-sm text-muted-foreground mb-2 block">Social Links</Label>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-2">
							<Input 
								value={member.socialLinks?.linkedin || ""} 
								onChange={(e) => onUpdateSocial(member.id, "linkedin", e.target.value)} 
								placeholder="LinkedIn URL" 
								className="h-8 text-xs"
							/>
							<Input 
								value={member.socialLinks?.twitter || ""} 
								onChange={(e) => onUpdateSocial(member.id, "twitter", e.target.value)} 
								placeholder="Twitter URL" 
								className="h-8 text-xs"
							/>
							<Input 
								value={member.socialLinks?.website || ""} 
								onChange={(e) => onUpdateSocial(member.id, "website", e.target.value)} 
								placeholder="Personal website" 
								className="h-8 text-xs"
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

// Empty State Component
const TeamEmptyState = ({ onAddMember }) => (
	<Card suppressHydrationWarning>
		<CardContent className="py-12">
			<div className="space-y-4 text-center">
				<div className="flex justify-center items-center mx-auto w-16 h-16 rounded-full bg-primary/10">
					<Users className="w-8 h-8 text-primary" />
				</div>
				<div className="space-y-2">
					<h3 className="text-lg font-semibold">No team members added yet</h3>
					<p className="mx-auto max-w-sm text-muted-foreground">
						Showcase your team to build trust and credibility with potential customers. 
						Let them know who they'll be working with.
					</p>
				</div>
				<div className="flex flex-col gap-3 justify-center items-center sm:flex-row">
					<Button onClick={onAddMember} size="lg" className="min-w-[200px]">
						<Plus className="mr-2 w-5 h-5" />
						Add Your First Team Member
					</Button>
				</div>
				<div className="space-y-1 text-xs text-muted-foreground">
					<p>💡 <strong>Pro tip:</strong> Include key team members and their expertise</p>
					<p>🎯 Add photos and bios to make your team more personable</p>
					<p>⭐ Highlight certifications and experience to build credibility</p>
				</div>
			</div>
		</CardContent>
	</Card>
);