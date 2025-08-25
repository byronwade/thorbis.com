// import { SignupPage } from "@features/auth";
import { generateStaticPageMetadata } from "@utils/server-seo";
import SimpleSignup from '@components/auth/SimpleSignup';

// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Sign Up - Thorbis",
		description: "Create your Thorbis account to connect with local businesses and service providers.",
		path: "/signup",
		keywords: ["Thorbis", "signup", "sign up", "create account", "register", "find business", "contractors", "home improvement"],
	});
}

const jsonLdData = {
	"@context": "http://schema.org",
	"@type": "WebSite",
	url: "https://thorbis.com/signup",
	name: "Thorbis",
	description: "Create your Thorbis account to connect with local businesses and service providers.",
	publisher: {
		"@type": "Organization",
		name: "Thorbis",
		logo: {
			"@type": "ImageObject",
			url: "https://thorbis.com/logo.png",
		},
	},
	potentialAction: {
		"@type": "RegisterAction",
		target: "https://thorbis.com/signup",
		name: "Sign up for Thorbis",
	},
};

export default function Signup() {
	return (
		<>
			<SimpleSignup />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }} />
		</>
	);
}
