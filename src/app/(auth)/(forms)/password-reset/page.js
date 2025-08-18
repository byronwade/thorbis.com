import { PasswordReset } from "@features/auth";
import { generateStaticPageMetadata } from "@utils/server-seo";

// Generate dynamic metadata using server-side SEO generator
export async function generateMetadata() {
	return await generateStaticPageMetadata({
		title: "Reset Password - Thorbis",
		description: "Reset your Thorbis account password securely. Enter your email to receive password reset instructions.",
		path: "/password-reset",
		keywords: ["password reset", "forgot password", "account recovery", "security"],
	});
}

const jsonLdData = {
	"@context": "http://schema.org",
	"@type": "WebPage",
	url: "https://thorbis.com/password-reset",
	name: "Reset Password",
	description: "Reset your Thorbis account password securely. Enter your email to receive password reset instructions.",
	mainEntity: {
		"@type": "WebApplication",
		name: "Thorbis Password Reset",
		applicationCategory: "SecurityApplication",
	},
};

const PasswordResetComponent = () => {
	return (
		<>
			<PasswordReset />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }} />
		</>
	);
};

export default PasswordResetComponent;
