export const metadata = {
	robots: { index: false, follow: false },
};

import AuthFormsLayoutClient from "./layout.client.js";

export default function AuthFormsLayout({ children }) {
	return <AuthFormsLayoutClient>{children}</AuthFormsLayoutClient>;
}
