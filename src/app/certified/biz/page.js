import React from "react";

export const metadata = {
	title: "Certified Business Profile – Duncan Plumbing Ent., Inc. | Thorbis",
	description: "Diamond-certified business profile. View credentials, ratings dashboard, researched articles, services, and contact information.",
	openGraph: {
		title: "Certified Business Profile – Duncan Plumbing Ent., Inc.",
		description: "Diamond-certified profile with credentials, ratings, services, and contact info.",
		url: "https://thorbis.com/certified/biz",
		type: "profile",
	},
	alternates: { canonical: "https://thorbis.com/certified/biz" },
};

export default function Categories() {
	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "LocalBusiness",
						name: "Duncan Plumbing Ent., Inc.",
						url: "https://thorbis.com/certified/biz",
						aggregateRating: {
							"@type": "AggregateRating",
							ratingValue: "4.9",
							reviewCount: "335",
						},
						breadcrumb: {
							"@type": "BreadcrumbList",
							itemListElement: [
								{ "@type": "ListItem", position: 1, name: "Home", item: "https://thorbis.com/" },
								{ "@type": "ListItem", position: 2, name: "Certified", item: "https://thorbis.com/certified" },
								{ "@type": "ListItem", position: 3, name: "Duncan Plumbing Ent., Inc.", item: "https://thorbis.com/certified/biz" },
							],
						},
					}),
				}}
			/>
			<div className="flex items-center justify-between w-full gap-6 p-4 mx-auto sm:px-12 lg:px-24">
				<div className="font-sans text-foreground bg-background">
					{/* Header */}
					<header className="py-12 text-center bg-muted/30">
						<h1 className="text-5xl font-bold">Duncan Plumbing Ent., Inc.</h1>
						<p className="mt-4 text-2xl">Diamond Certified Company Report</p>
						<img src="diamondcertified_logo.png" alt="Diamond Certified Logo" className="w-24 h-24 mx-auto mt-6" />
					</header>

					{/* Main Content */}
					<main className="max-w-6xl p-8 mx-auto">
						{/* Performance Section */}
						<section className="my-16 text-center">
							<h2 className="text-3xl font-semibold">Rated Highest in Quality and Helpful Expertise</h2>
							<p className="mt-4 text-lg">PERFORMANCE GUARANTEED</p>
							<div className="flex items-center justify-center mt-12">
								<span className="mr-8 text-5xl font-bold">335</span>
								<div>
									<div className="flex space-x-2">
										{[...Array(5)].map((_, index) => (
											<img key={index} src="star.png" alt="Star" className="w-8 h-8" />
										))}
									</div>
									<p className="text-lg">10 CONSECUTIVE YEARS</p>
									<p className="text-lg">SINCE DECEMBER 2014</p>
									<p className="text-lg">CERT 2213</p>
								</div>
							</div>
						</section>

						{/* Ratings Dashboard */}
						<section className="p-12 my-16 bg-muted/30 rounded-lg">
							<h2 className="mb-8 text-2xl font-bold">Diamond Certified Ratings Dashboard</h2>
							<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
								<div className="text-center">
									<span className="block text-5xl font-bold">335</span>
									<span>Verified Customers Surveyed</span>
								</div>
								<div className="text-center">
									<span className="block text-5xl font-bold">Customer Loyalty</span>
								</div>
								<div className="text-center">
									<span className="block text-5xl font-bold">Customer Satisfaction</span>
								</div>
								<div className="text-center">
									<span className="block text-5xl font-bold">Helpful Expertise</span>
								</div>
							</div>
							<a href="#surveyResponses" className="block mt-8 text-center text-blue-500">
								READ ALL 335 SURVEY RESPONSES
							</a>
						</section>

						{/* Company Credentials */}
						<section className="my-16">
							<h2 className="mb-8 text-3xl font-bold">Company Credentials</h2>
							<ul className="pl-8 space-y-2 text-lg list-disc">
								<li>Liability Insurance</li>
								<li>Business Practices</li>
								<li>Current Complaint File</li>
								<li>Workers Compensation</li>
								<li>License Verification</li>
								<li>Legal & Finance</li>
							</ul>
						</section>

						{/* Video Player and Articles */}
						<section className="my-16">
							<h2 className="mb-8 text-3xl font-bold">Diamond Certified Video Reports on Duncan Plumbing Ent., Inc.</h2>
							<div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
								<div className="space-y-4">
									<iframe src="https://www.youtube.com/embed/video1" className="w-full h-56 rounded-lg" title="Diamond Certified Company Profile" />
									<p className="text-center">Diamond Certified Company Profile</p>
								</div>
								<div className="space-y-4">
									<iframe src="https://www.youtube.com/embed/video2" className="w-full h-56 rounded-lg" title="Company Story" />
									<p className="text-center">Company Story</p>
								</div>
								<div className="space-y-4">
									<iframe src="https://www.youtube.com/embed/video3" className="w-full h-56 rounded-lg" title="Expert Contributions" />
									<p className="text-center">Expert Contributions</p>
								</div>
							</div>
						</section>

						{/* Researched Articles */}
						<section className="my-16">
							<h2 className="mb-8 text-3xl font-bold">Diamond Certified Researched Articles on Duncan Plumbing Ent., Inc.</h2>
							<div className="grid grid-cols-1 gap-12 md:grid-cols-2">
								<div className="space-y-4">
									<img src="owner.jpg" alt="Owner Scott Duncan works on a custom boiler" className="object-cover w-full h-48 rounded-lg" />
									<h3 className="text-2xl font-bold">Company Profile</h3>
									<p className="text-lg">Duncan Plumbing Ent., Inc. provides a wide range of plumbing services for residential and commercial clients throughout Santa Cruz County...</p>
									<a href="#readMore" className="block text-blue-500">
										Read More
									</a>
								</div>
								<div className="space-y-4">
									<img src="team.jpg" alt="Duncan Plumbing Team" className="object-cover w-full h-48 rounded-lg" />
									<h3 className="text-2xl font-bold">Company Philosophy</h3>
									<p className="text-lg">Owner Scott Duncan says Duncan Plumbing’s customer-oriented business approach has been a crucial aspect of its success...</p>
									<a href="#readMore" className="block text-blue-500">
										Read More
									</a>
								</div>
							</div>
						</section>

						{/* Capabilities */}
						<section className="my-16">
							<h2 className="mb-8 text-3xl font-bold">Service Area</h2>
							<p className="text-lg">Serving Santa Cruz County</p>
						</section>

						{/* Additional Services */}
						<section className="my-16">
							<h2 className="mb-8 text-3xl font-bold">Main Services</h2>
							<ul className="pl-8 space-y-2 text-lg list-disc">
								<li>Plumbing</li>
								<li>Commercial Plumbing</li>
								<li>Drain Cleaning</li>
								<li>Emergency Plumber</li>
								<li>Gas Pipe Repair</li>
								<li>Leak Detection</li>
								<li>Plumbing Services</li>
								<li>Sewer Pipe</li>
								<li>Toilet Repair</li>
								<li>Water Heater Installation</li>
								<li>Water Heater Repair</li>
								<li>Water Heater Replacement</li>
								<li>Water Lines</li>
								<li>Sewer Line Contractor</li>
								<li>Hydro Jetting</li>
								<li>Sewer Clean Outs</li>
								<li>Sewer Drain Cleaning</li>
								<li>Sewer Inspection</li>
								<li>Sewer Line Cleaning</li>
								<li>Sewer Line Repair</li>
								<li>Sewer Line Replacement</li>
								<li>Sewer Pipe Lining</li>
								<li>Trenchless Sewer Line Replacement</li>
								<li>Underground Plumbing</li>
							</ul>
						</section>

						{/* Contact Info */}
						<section className="my-16">
							<h2 className="mb-8 text-3xl font-bold">Contact Info</h2>
							<p className="text-lg">Duncan Plumbing Ent., Inc.</p>
							<p className="text-lg">(831) 708-8909</p>
							<p className="text-lg">
								Website:{" "}
								<a href="https://www.duncanplumbing.us" className="text-blue-500">
									www.duncanplumbing.us
								</a>
							</p>
						</section>

						{/* Hours */}
						<section className="my-16">
							<h2 className="mb-8 text-3xl font-bold">Hours</h2>
							<ul className="pl-8 space-y-2 text-lg list-disc">
								<li>Mon-Sat: 08:00 am - 09:00 pm</li>
								<li>Sun: Closed</li>
								<li>Available by Phone 24/7</li>
							</ul>
						</section>
					</main>

					{/* Footer */}
					<footer className="py-12 text-center bg-muted/30">
						<p className="text-sm">&copy; 2024 Duncan Plumbing Ent., Inc. All rights reserved.</p>
					</footer>
				</div>
			</div>
		</>
	);
}
