/**
 * Partnership Card Component
 * Displays individual partnership information and actions
 */

import React from "react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Progress } from "@components/ui/progress";
import { Edit, Trash2, ExternalLink, Building, Shield, MapPin, Phone, Mail, Link, Eye, CheckCircle, Clock, XCircle, Circle } from "lucide-react";
import { motion } from "framer-motion";
import { getStatusBadge, getVerificationProgress, canStartVerification } from "@lib/business/partnerships/utils";

const PartnershipCard = ({ partnership, onEdit, onRemove, onStartVerification, onViewDetails, onHover, onLeave, isHovered = false }) => {
	const statusConfig = getStatusBadge(partnership.verification?.status);
	const verificationProgress = getVerificationProgress(partnership.verification);
	const canVerify = canStartVerification(partnership);
	const StatusIcon = statusConfig.icon === "CheckCircle" ? CheckCircle : statusConfig.icon === "Clock" ? Clock : statusConfig.icon === "XCircle" ? XCircle : Circle;

	return (
		<motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }} onMouseEnter={() => onHover?.(partnership)} onMouseLeave={() => onLeave?.(partnership)}>
			<Card className={`transition-all duration-200 ${isHovered ? "shadow-md border-primary/20" : "hover:shadow-sm"}`}>
				<CardHeader className="pb-4">
					<div className="flex items-start justify-between">
						<div className="flex items-center space-x-3">
							<Avatar className="w-12 h-12">
								<AvatarImage src={partnership.logo} alt={partnership.name} />
								<AvatarFallback>
									<Building className="w-6 h-6" />
								</AvatarFallback>
							</Avatar>
							<div className="flex-1 min-w-0">
								<CardTitle className="text-lg truncate">{partnership.name}</CardTitle>
								<div className="flex items-center space-x-2 mt-1">
									<Badge variant="secondary" className="text-xs">
										{partnership.type}
									</Badge>
									<Badge variant={statusConfig.variant} className="flex items-center space-x-1">
										<StatusIcon className="w-3 h-3" />
										<span>{statusConfig.text}</span>
									</Badge>
								</div>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex items-center space-x-1">
							<Button variant="ghost" size="sm" onClick={() => onViewDetails?.(partnership)} className="opacity-0 group-hover:opacity-100 transition-opacity">
								<Eye className="w-4 h-4" />
							</Button>
							<Button variant="ghost" size="sm" onClick={() => onEdit?.(partnership)} className="opacity-0 group-hover:opacity-100 transition-opacity">
								<Edit className="w-4 h-4" />
							</Button>
							<Button variant="ghost" size="sm" onClick={() => onRemove?.(partnership.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive">
								<Trash2 className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-4">
					{/* Description */}
					{partnership.description && <p className="text-sm text-muted-foreground line-clamp-2">{partnership.description}</p>}

					{/* Contact Information */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
						{partnership.email && (
							<div className="flex items-center space-x-1 truncate">
								<Mail className="w-3 h-3 flex-shrink-0" />
								<span className="truncate">{partnership.email}</span>
							</div>
						)}
						{partnership.phone && (
							<div className="flex items-center space-x-1 truncate">
								<Phone className="w-3 h-3 flex-shrink-0" />
								<span className="truncate">{partnership.phone}</span>
							</div>
						)}
						{partnership.website && (
							<div className="flex items-center space-x-1 truncate">
								<Link className="w-3 h-3 flex-shrink-0" />
								<a href={partnership.website} target="_blank" rel="noopener noreferrer" className="truncate hover:text-primary transition-colors">
									Visit Website
								</a>
							</div>
						)}
						{partnership.address && (
							<div className="flex items-center space-x-1 truncate">
								<MapPin className="w-3 h-3 flex-shrink-0" />
								<span className="truncate">{partnership.address}</span>
							</div>
						)}
					</div>

					{/* Verification Progress */}
					{partnership.verification && (
						<div className="space-y-2">
							<div className="flex items-center justify-between text-xs">
								<span className="text-muted-foreground">Verification Progress</span>
								<span className="font-medium">{verificationProgress}%</span>
							</div>
							<Progress value={verificationProgress} className="h-2" />
							{partnership.verification.steps && (
								<div className="flex items-center justify-between text-xs text-muted-foreground">
									<span>
										{partnership.verification.steps.filter((s) => s.status === "verified").length} of {partnership.verification.steps.length} steps completed
									</span>
									{partnership.verification.verificationId && <span className="font-mono">ID: {partnership.verification.verificationId}</span>}
								</div>
							)}
						</div>
					)}

					{/* Partnership Details */}
					<div className="grid grid-cols-2 gap-4 text-xs">
						<div>
							<span className="text-muted-foreground">Start Date:</span>
							<div className="font-medium">{new Date(partnership.startDate).toLocaleDateString()}</div>
						</div>
						<div>
							<span className="text-muted-foreground">Status:</span>
							<div className="font-medium capitalize">{partnership.status.replace("_", " ")}</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex items-center justify-between pt-2 border-t">
						<div className="flex items-center space-x-2">
							{partnership.website && (
								<Button variant="outline" size="sm" onClick={() => window.open(partnership.website, "_blank")}>
									<ExternalLink className="w-3 h-3 mr-1" />
									Website
								</Button>
							)}
							<Button variant="outline" size="sm" onClick={() => onViewDetails?.(partnership)}>
								<Eye className="w-3 h-3 mr-1" />
								View Details
							</Button>
						</div>

						{/* Verification Button */}
						{partnership.verification?.status !== "verified" && (
							<Button variant={canVerify ? "default" : "outline"} size="sm" onClick={() => onStartVerification?.(partnership)} disabled={!canVerify}>
								<Shield className="w-3 h-3 mr-1" />
								{partnership.verification?.status === "in_progress" ? "Continue" : "Verify"}
							</Button>
						)}

						{partnership.verification?.status === "verified" && (
							<div className="flex items-center space-x-1 text-success">
								<CheckCircle className="w-4 h-4" />
								<span className="text-sm font-medium">Verified</span>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
};

export default PartnershipCard;
