import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Briefcase } from "lucide-react";

export default function CareersSection({ profile, setProfile, isEditing }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center space-x-2">
					<Briefcase className="w-5 h-5" />
					<span>Careers</span>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="mb-4 text-muted-foreground">{profile.careers.description}</p>
				<div className="space-y-4">
					{profile.careers.positions.map((position, index) => (
						<div key={index} className="p-4 border border-border rounded-lg">
							<h4 className="font-medium text-foreground">{position.title}</h4>
							<p className="text-sm text-muted-foreground mb-1">
								{position.type} • {position.location}
							</p>
							<p className="text-sm text-muted-foreground mb-1">{position.salary}</p>
							<p className="text-sm text-muted-foreground mb-2">{position.description}</p>
							<div className="text-xs text-muted-foreground mb-1">
								<strong>Requirements:</strong> {position.requirements.join(", ")}
							</div>
							<div className="text-xs text-muted-foreground mb-1">
								<strong>Benefits:</strong> {position.benefits.join(", ")}
							</div>
						</div>
					))}
				</div>
				<div className="mt-6">
					<h4 className="font-medium text-foreground mb-1">Contact</h4>
					<p className="text-sm text-muted-foreground">Email: {profile.careers.contact.email}</p>
					<p className="text-sm text-muted-foreground">Phone: {profile.careers.contact.phone}</p>
					<p className="text-sm text-muted-foreground">Address: {profile.careers.contact.address}</p>
				</div>
			</CardContent>
		</Card>
	);
}
