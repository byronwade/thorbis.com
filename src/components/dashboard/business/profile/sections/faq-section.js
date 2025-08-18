import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { FileText, Plus } from "lucide-react";
import { Button } from "@components/ui/button";

export default function FAQSection({ profile, setProfile, isEditing }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center space-x-2">
					<FileText className="w-5 h-5" />
					<span>FAQ</span>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{profile.faq.map((question, index) => (
						<div key={index} className="p-4 border border-border rounded-lg">
							<h4 className="font-medium mb-2 text-foreground">{question.question}</h4>
							<p className="text-sm text-muted-foreground">{question.answer}</p>
						</div>
					))}
					{isEditing && (
						<Button variant="outline" className="w-full">
							<Plus className="w-4 h-4 mr-2" />
							Add Question
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
