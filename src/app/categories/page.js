import AllCategoriesPage from "@components/site/categories/all-categories-page";
import { generateStaticPageMetadata } from "@utils/server-seo";

// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Business Categories - Find Local Services & Businesses | Thorbis",
		description: "Browse all business categories on Thorbis. Find restaurants, home services, healthcare, automotive, shopping, and more local businesses in your area.",
		path: "/categories",
		keywords: ["business categories", "local services", "business directory", "find businesses", "restaurants", "home services", "healthcare", "automotive", "shopping"],
	});
}

export default function CategoriesPage() {
	return <AllCategoriesPage />;
}
