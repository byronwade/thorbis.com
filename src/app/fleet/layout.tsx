import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Fleet Tracker - Luxury Fleet Management",
  description: "Experience fleet management like never before with real-time tracking and visualization",
}

export default function FleetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
