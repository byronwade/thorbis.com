/**
 * Customer Portal Layout
 * Secure layout for customer-facing portal pages
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customer Portal - Thorbis',
  description: 'Manage your payments, view transaction history, and access receipts',
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-semibold">Thorbis Customer Portal</h1>
              <nav className="hidden md:flex items-center gap-4">
                <a href="/portal" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Dashboard
                </a>
                <a href="/portal/payments" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Payments
                </a>
                <a href="/portal/subscriptions" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Subscriptions
                </a>
                <a href="/portal/support" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Support
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Welcome back!</span>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      
      <footer className="border-t bg-card mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Thorbis. All rights reserved.</p>
            <div className="flex justify-center gap-4 mt-2">
              <a href="/privacy" className="hover:text-foreground">Privacy Policy</a>
              <a href="/terms" className="hover:text-foreground">Terms of Service</a>
              <a href="/support" className="hover:text-foreground">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}