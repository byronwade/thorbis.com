"use client";
import UnifiedHeader from "@components/shared/unified-header";
import { useAuth } from "@context/auth-context";

export default function AcademyRootLayout({ children }) {
	const { user, userRoles, loading, isAuthenticated } = useAuth();

	// Basic auth check - academy is open to all authenticated users
	// useEffect(() => {
	// 	if (!loading && !user) {
	// 		redirect("/login");
	// 	}
	// }, [user, loading]);

	// if (loading) {
	// 	return (
	// 		<div className="flex items-center justify-center w-full h-screen align-middle">
	// 			<Image src="/logos/ThorbisLogo.webp" alt="Thorbis Logo" width={200} height={100} className="w-[60px] h-[60px] animate-breathe" />
	// 		</div>
	// 	);
	// }

    return (
        <div className="bg-background min-h-screen">
            <UnifiedHeader dashboardType="academy" />
            <main className="flex flex-col">{children}</main>
        </div>
    );
}
