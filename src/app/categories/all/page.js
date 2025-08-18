import React from "react";
import AllCategoriesPage from "@components/site/categories/all-categories-page";

import { generateStaticPageMetadata } from "@utils/server-seo";

// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "All Business Categories - Complete Directory | Thorbis",
		description: "Browse our complete directory of business categories. Search and filter through thousands of business types to find exactly what you need.",
		path: "/categories/all",
		keywords: ["all business categories", "complete directory", "business types", "local services", "business search"],
	});
}

export default function AllCategories() {
	return <AllCategoriesPage />;
}
