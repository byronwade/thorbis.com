import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@components/ui/accordion";
import Link from "next/link";

// FAQs data
const faqs = [
	{
		question: "What&apos;s the best thing about Switzerland?",
		answer: "I don&apos;t know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
	},
	{
		question: "What&apos;s the best thing about Switzerland?",
		answer: "I don&apos;t know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
	},
	{
		question: "What&apos;s the best thing about Switzerland?",
		answer: "I don&apos;t know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
	},
	{
		question: "What&apos;s the best thing about Switzerland?",
		answer: "I don&apos;t know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
	},
	// More questions...
];

export function FAQs() {
	return (
		<section id="faqs" className="py-4">
			<div className="mb-6">
				<h2 className="mb-2 text-3xl font-bold md:text-4xl">Frequently Asked Questions</h2>
				<p className="text-lg text-muted-foreground">
					Can’t find the answer you’re looking for? Reach out to our{" "}
					<Link href="/support" className="font-bold hover:underline text-primary">
						customer support
					</Link>{" "}
					team.
				</p>
			</div>
			<Accordion type="single" collapsible>
				{faqs.map((faq, index) => (
					<AccordionItem key={index} value={`item-${index + 1}`}>
						<AccordionTrigger className="flex items-start justify-between w-full text-left text-white group">
							<span className="text-base font-semibold leading-7">{faq.question}</span>
						</AccordionTrigger>
						<AccordionContent className="pr-12 mt-2">
							<p className="text-base leading-7 text-muted-foreground">{faq.answer}</p>
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>
		</section>
	);
}
