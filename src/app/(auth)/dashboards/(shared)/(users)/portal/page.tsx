/**
 * Customer Portal Home Page
 * Landing page for customer portal with quick actions and overview
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  Receipt, 
  Calendar, 
  Settings,
  ArrowRight,
  Shield,
  Clock,
  Star
} from 'lucide-react';

export default function PortalHomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to Your Customer Portal</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Manage your payments, view transaction history, and access receipts across all Thorbis services
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <CreditCard className="w-12 h-12 mx-auto text-blue-500" />
            <CardTitle className="text-lg">Payment Methods</CardTitle>
            <CardDescription>Manage your saved payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <a href="/portal/payments?tab=payment-methods">
                Manage Methods
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <Receipt className="w-12 h-12 mx-auto text-green-500" />
            <CardTitle className="text-lg">Transaction History</CardTitle>
            <CardDescription>View all your payment history</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <a href="/portal/payments?tab=transactions">
                View History
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <Calendar className="w-12 h-12 mx-auto text-purple-500" />
            <CardTitle className="text-lg">Subscriptions</CardTitle>
            <CardDescription>Manage recurring payments</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <a href="/portal/subscriptions">
                Manage Subscriptions
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <Settings className="w-12 h-12 mx-auto text-orange-500" />
            <CardTitle className="text-lg">Account Settings</CardTitle>
            <CardDescription>Update your preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">$1,247.50</p>
                <p className="text-xs text-muted-foreground">Across all services</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Receipt className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Transactions</p>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">In the last 30 days</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saved Methods</p>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">Payment methods</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest payments and transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Emergency pipe repair</p>
                  <p className="text-sm text-muted-foreground">Wade's Plumbing Services</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">$245.00</p>
                <p className="text-sm text-muted-foreground">Jan 20, 2024</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Brake pad replacement</p>
                  <p className="text-sm text-muted-foreground">Mike's Auto Repair</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">$321.50</p>
                <p className="text-sm text-muted-foreground">Jan 18, 2024</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">Dinner for 2</p>
                  <p className="text-sm text-muted-foreground">The Garden Bistro</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">$87.50</p>
                <p className="text-sm text-muted-foreground">Jan 15, 2024</p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Button variant="outline" asChild>
              <a href="/portal/payments?tab=transactions">View All Transactions</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security & Trust
          </CardTitle>
          <CardDescription>Your security is our top priority</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-green-500 mt-1" />
              <div>
                <h4 className="font-medium">256-bit SSL Encryption</h4>
                <p className="text-sm text-muted-foreground">All data transmitted securely</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Star className="w-6 h-6 text-green-500 mt-1" />
              <div>
                <h4 className="font-medium">PCI DSS Compliant</h4>
                <p className="text-sm text-muted-foreground">Industry standard security</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-green-500 mt-1" />
              <div>
                <h4 className="font-medium">24/7 Monitoring</h4>
                <p className="text-sm text-muted-foreground">Continuous fraud protection</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}