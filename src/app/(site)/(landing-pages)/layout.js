import { isEnabled } from "@/lib/flags/server";
import { notFound } from "next/navigation";

export default async function LandingPagesLayout({ children }) {
        const on = await isEnabled("landingPages");
        if (!on) {
                notFound();
        }
        
        return (
                <>
                        {children}
                </>
        );
}
