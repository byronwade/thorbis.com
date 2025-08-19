"use client";
import React, { useState } from "react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { Progress } from "@components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Copy, Mail, Twitter, Facebook, Linkedin, Share2, Gift, Users, TrendingUp, Award, CheckCircle, ArrowRight, ExternalLink, Star, Zap, Target, BarChart3 } from "lucide-react";
import { toast } from "@components/ui/use-toast";

// Mock data
const mockReferralData = {
	referralCode: "THORBIS-1234",
	referralLink: "https://thorbis.com/ref/THORBIS-1234",
	totalReferrals: 12,
	successfulReferrals: 8,
	rewardsEarned: 200,
	conversionRate: 67,
	nextMilestone: 15,
	currentTier: "Silver",
	nextTier: "Gold",
	recentReferrals: [
		{
			id: 1,
			name: "Sarah Johnson",
			email: "sarah@example.com",
			status: "completed",
			date: "2024-01-15",
			reward: 25,
			avatar: null,
		},
		{
			id: 2,
			name: "Mike Chen",
			email: "mike@example.com",
			status: "pending",
			date: "2024-01-20",
			reward: 25,
			avatar: null,
		},
		{
			id: 3,
			name: "Emily Rodriguez",
			email: "emily@example.com",
			status: "completed",
			date: "2024-01-18",
			reward: 25,
			avatar: null,
		},
	],
	leaderboard: [
		{ rank: 1, name: "Alex Thompson", referrals: 45, rewards: 1125 },
		{ rank: 2, name: "Maria Garcia", referrals: 32, rewards: 800 },
		{ rank: 3, name: "David Kim", referrals: 28, rewards: 700 },
		{ rank: 4, name: "Lisa Wang", referrals: 25, rewards: 625 },
		{ rank: 5, name: "You", referrals: 12, rewards: 200 },
	],
};

const referralTiers = [
	{
		name: "Bronze",
		referrals: 0,
		rewards: 25,
		features: ["$25 per referral", "Basic analytics", "Email support"],
	},
	{
		name: "Silver",
		referrals: 10,
		rewards: 30,
		features: ["$30 per referral", "Advanced analytics", "Priority support", "Custom referral link"],
	},
	{
		name: "Gold",
		referrals: 25,
		rewards: 40,
		features: ["$40 per referral", "Premium analytics", "Dedicated support", "Early access features", "Exclusive rewards"],
	},
	{
		name: "Platinum",
		referrals: 50,
		rewards: 50,
		features: ["$50 per referral", "VIP analytics", "Personal account manager", "Beta features", "Special events access"],
	},
];

export default function Referral() {
	const [referralData] = useState(mockReferralData);
	const [copied, setCopied] = useState(false);

	React.useEffect(() => {
		document.title = "Referral Program - User Dashboard - Thorbis";
	}, []);

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(referralData.referralLink);
			setCopied(true);
			toast({
				title: "Link copied!",
				description: "Your referral link has been copied to clipboard.",
			});
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			toast({
				title: "Failed to copy",
				description: "Please try again or copy manually.",
				variant: "destructive",
			});
		}
	};

	const shareViaEmail = () => {
		const subject = encodeURIComponent("Join me on Thorbis - Find trusted local professionals!");
		const body = encodeURIComponent(`Hi there!

I've been using Thorbis to find amazing local professionals for my projects, and I think you'd love it too!

Use my referral link to get started: ${referralData.referralLink}

Thorbis connects you with pre-screened, verified professionals in your area. Whether you need a plumber, designer, or any other service, they make it super easy to find the right person.

Check it out and let me know what you think!

Best regards`);

		window.open(`mailto:?subject=${subject}&body=${body}`);
	};

	const shareViaSocial = (platform) => {
		const text = encodeURIComponent("Join me on Thorbis - Find trusted local professionals! Use my referral link:");
		const url = encodeURIComponent(referralData.referralLink);

		const urls = {
			twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
			facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
			linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
		};

		window.open(urls[platform], "_blank", "width=600,height=400");
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "completed":
				return "bg-success/10 text-success dark:bg-success dark:text-success/90";
			case "pending":
				return "bg-warning/10 text-warning dark:bg-warning dark:text-warning/90";
			default:
				return "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground";
		}
	};

	const currentTier = referralTiers.find((tier) => tier.referrals <= referralData.totalReferrals);
	const nextTier = referralTiers.find((tier) => tier.referrals > referralData.totalReferrals);
	const progressToNext = nextTier ? ((referralData.totalReferrals - currentTier.referrals) / (nextTier.referrals - currentTier.referrals)) * 100 : 100;

	return (
		<div className="w-full px-4 py-16 space-y-8 lg:px-24">
			{/* Header */}
			<div className="space-y-4">
				<div className="flex items-center gap-3">
					<div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10">
						<Gift className="w-6 h-6 text-purple-600 dark:text-purple-400" />
					</div>
					<div>
						<h1 className="text-4xl font-bold tracking-tight">Referral Program</h1>
						<p className="text-lg text-muted-foreground mt-1">Share Thorbis with friends and earn rewards for every successful referral</p>
					</div>
				</div>
			</div>

			{/* Stats Overview */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				<Card className="relative overflow-hidden">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Total Referrals</p>
								<p className="text-3xl font-bold">{referralData.totalReferrals}</p>
							</div>
							<Users className="w-8 h-8 text-primary dark:text-primary" />
						</div>
						<div className="mt-4 flex items-center gap-2 text-sm text-success dark:text-success">
							<TrendingUp className="w-4 h-4" />
							<span>+3 this month</span>
						</div>
					</CardContent>
					<div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
				</Card>

				<Card className="relative overflow-hidden">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Rewards Earned</p>
								<p className="text-3xl font-bold">${referralData.rewardsEarned}</p>
							</div>
							<Award className="w-8 h-8 text-warning dark:text-warning" />
						</div>
						<div className="mt-4 flex items-center gap-2 text-sm text-success dark:text-success">
							<Zap className="w-4 h-4" />
							<span>${currentTier.rewards} per referral</span>
						</div>
					</CardContent>
					<div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5" />
				</Card>

				<Card className="relative overflow-hidden">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
								<p className="text-3xl font-bold">{referralData.conversionRate}%</p>
							</div>
							<Target className="w-8 h-8 text-success dark:text-success" />
						</div>
						<div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
							<BarChart3 className="w-4 h-4" />
							<span>{referralData.successfulReferrals} successful</span>
						</div>
					</CardContent>
					<div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5" />
				</Card>

				<Card className="relative overflow-hidden">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Current Tier</p>
								<p className="text-3xl font-bold">{currentTier.name}</p>
							</div>
							<Star className="w-8 h-8 text-purple-600 dark:text-purple-400" />
						</div>
						<div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
							<ArrowRight className="w-4 h-4" />
							<span>{nextTier ? `${nextTier.referrals - referralData.totalReferrals} to ${nextTier.name}` : "Max tier reached"}</span>
						</div>
					</CardContent>
					<div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5" />
				</Card>
			</div>

			<div className="grid gap-8 lg:grid-cols-3">
				{/* Main Content */}
				<div className="lg:col-span-2 space-y-8">
					{/* Share Your Link */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Share2 className="w-5 h-5" />
								Share Your Referral Link
							</CardTitle>
							<CardDescription>Copy your unique referral link and share it with friends to start earning rewards</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-4">
								<div className="flex items-center gap-3">
									<Input value={referralData.referralLink} readOnly className="font-mono text-sm" />
									<Button onClick={copyToClipboard} variant={copied ? "default" : "outline"} className="shrink-0">
										<Copy className="w-4 h-4 mr-2" />
										{copied ? "Copied!" : "Copy"}
									</Button>
								</div>

								<div className="flex flex-wrap gap-3">
									<Button variant="outline" onClick={shareViaEmail} className="flex items-center gap-2">
										<Mail className="w-4 h-4" />
										Email
									</Button>
									<Button variant="outline" onClick={() => shareViaSocial("twitter")} className="flex items-center gap-2">
										<Twitter className="w-4 h-4" />
										Twitter
									</Button>
									<Button variant="outline" onClick={() => shareViaSocial("facebook")} className="flex items-center gap-2">
										<Facebook className="w-4 h-4" />
										Facebook
									</Button>
									<Button variant="outline" onClick={() => shareViaSocial("linkedin")} className="flex items-center gap-2">
										<Linkedin className="w-4 h-4" />
										LinkedIn
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Recent Referrals */}
					<Card>
						<CardHeader>
							<CardTitle>Recent Referrals</CardTitle>
							<CardDescription>Track your latest referrals and their status</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{referralData.recentReferrals.map((referral) => (
									<div key={referral.id} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
										<div className="flex items-center gap-3">
											<Avatar className="w-10 h-10">
												<AvatarImage src={referral.avatar} />
												<AvatarFallback>
													{referral.name
														.split(" ")
														.map((n) => n[0])
														.join("")}
												</AvatarFallback>
											</Avatar>
											<div>
												<p className="font-medium">{referral.name}</p>
												<p className="text-sm text-muted-foreground">{referral.email}</p>
											</div>
										</div>
										<div className="flex items-center gap-3">
											<Badge className={getStatusColor(referral.status)}>
												{referral.status === "completed" ? <CheckCircle className="w-3 h-3 mr-1" /> : null}
												{referral.status}
											</Badge>
											<div className="text-right">
												<p className="font-medium">${referral.reward}</p>
												<p className="text-sm text-muted-foreground">{new Date(referral.date).toLocaleDateString()}</p>
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Tier Progress */}
					<Card>
						<CardHeader>
							<CardTitle>Progress to Next Tier</CardTitle>
							<CardDescription>Earn more rewards by reaching the next tier</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">{currentTier.name}</span>
									<span className="text-sm font-medium">{nextTier?.name || "Max Tier"}</span>
								</div>
								<Progress value={progressToNext} className="h-2" />
								<div className="flex items-center justify-between text-sm text-muted-foreground">
									<span>{referralData.totalReferrals} referrals</span>
									<span>{nextTier ? `${nextTier.referrals} needed` : "Tier complete"}</span>
								</div>
							</div>

							{nextTier && (
								<div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
									<h4 className="font-semibold mb-2">Unlock {nextTier.name} Tier</h4>
									<div className="space-y-2 text-sm">
										{nextTier.features.map((feature, index) => (
											<div key={index} className="flex items-center gap-2">
												<CheckCircle className="w-4 h-4 text-success" />
												<span>{feature}</span>
											</div>
										))}
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Leaderboard */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Award className="w-5 h-5" />
								Top Referrers
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{referralData.leaderboard.slice(0, 5).map((user, index) => (
									<div key={user.rank} className={`flex items-center justify-between p-3 rounded-lg ${user.name === "You" ? "bg-primary/10 border border-primary/20" : "bg-muted/30"}`}>
										<div className="flex items-center gap-3">
											<div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? "bg-warning text-white" : index === 1 ? "bg-muted-foreground text-white" : index === 2 ? "bg-warning text-white" : "bg-muted text-muted-foreground"}`}>{user.rank}</div>
											<div>
												<p className="font-medium">{user.name}</p>
												<p className="text-sm text-muted-foreground">{user.referrals} referrals</p>
											</div>
										</div>
										<div className="text-right">
											<p className="font-medium">${user.rewards}</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* How It Works */}
					<Card>
						<CardHeader>
							<CardTitle>How It Works</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-3">
								<div className="flex gap-3">
									<div className="flex justify-center items-center w-6 h-6 text-sm font-semibold rounded-full bg-primary/5 text-primary border border-primary/20">1</div>
									<div>
										<p className="text-sm font-medium">Share your link</p>
										<p className="text-xs text-muted-foreground">Send your unique referral link to friends</p>
									</div>
								</div>
								<div className="flex gap-3">
									<div className="flex justify-center items-center w-6 h-6 text-sm font-semibold rounded-full bg-primary/5 text-primary border border-primary/20">2</div>
									<div>
										<p className="text-sm font-medium">They sign up</p>
										<p className="text-xs text-muted-foreground">Your friend creates an account using your link</p>
									</div>
								</div>
								<div className="flex gap-3">
									<div className="flex justify-center items-center w-6 h-6 text-sm font-semibold rounded-full bg-primary/5 text-primary border border-primary/20">3</div>
									<div>
										<p className="text-sm font-medium">You earn rewards</p>
										<p className="text-xs text-muted-foreground">Get ${currentTier.rewards} credit when they complete their first job</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Program Details */}
					<Card>
						<CardHeader>
							<CardTitle>Program Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-sm">
							<div className="space-y-2">
								<p className="text-muted-foreground">Earn rewards for every successful referral. Rewards are automatically credited to your account when your referral completes their first job.</p>
								<div className="space-y-1">
									<p>
										<strong>Reward Amount:</strong> ${currentTier.rewards} per successful referral
									</p>
									<p>
										<strong>Reward Type:</strong> Account credit (usable for job posts and boosts)
									</p>
									<p>
										<strong>Expiration:</strong> Rewards never expire
									</p>
								</div>
							</div>
							<Button variant="outline" className="w-full" asChild>
								<a href="/support" target="_blank" rel="noopener noreferrer">
									Learn More
									<ExternalLink className="w-4 h-4 ml-2" />
								</a>
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
