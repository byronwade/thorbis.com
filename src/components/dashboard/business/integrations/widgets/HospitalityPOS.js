"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { ShoppingCart, DollarSign, TrendingUp, Clock, CreditCard } from "lucide-react";

/**
 * Hospitality POS Widget
 * Point of Sale system integration for restaurants and hospitality
 */
export default function HospitalityPOSWidget() {
	// Mock POS data
	const posData = {
		todaysSales: "$3,247",
		todaysOrders: 42,
		averageOrderValue: "$77.31",
		activeOrders: 8,
		paymentMethods: {
			card: 65,
			cash: 25,
			digital: 10
		},
		topItems: [
			{ name: "Signature Burger", quantity: 12, revenue: "$144" },
			{ name: "Caesar Salad", quantity: 8, revenue: "$96" },
			{ name: "Craft Beer", quantity: 15, revenue: "$105" }
		]
	};

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<div className="p-2 bg-emerald-100 dark:bg-emerald-950 rounded-lg">
							<ShoppingCart className="h-4 w-4 text-emerald-600" />
						</div>
						<div>
							<CardTitle className="text-sm">Hospitality POS</CardTitle>
							<CardDescription className="text-xs">Today's sales overview</CardDescription>
						</div>
					</div>
					<Button size="sm" variant="outline" className="text-xs h-7">
						Open POS
					</Button>
				</div>
			</CardHeader>
			<CardContent className="pt-0 space-y-4">
				{/* Key Metrics */}
				<div className="grid grid-cols-2 gap-3">
					<div className="space-y-1">
						<div className="flex items-center space-x-1">
							<DollarSign className="h-3 w-3 text-success" />
							<span className="text-xs text-muted-foreground">Sales</span>
						</div>
						<p className="font-semibold text-sm text-success">{posData.todaysSales}</p>
					</div>
					<div className="space-y-1">
						<div className="flex items-center space-x-1">
							<ShoppingCart className="h-3 w-3 text-primary" />
							<span className="text-xs text-muted-foreground">Orders</span>
						</div>
						<p className="font-semibold text-sm">{posData.todaysOrders}</p>
					</div>
					<div className="space-y-1">
						<div className="flex items-center space-x-1">
							<TrendingUp className="h-3 w-3 text-purple-600" />
							<span className="text-xs text-muted-foreground">Avg Order</span>
						</div>
						<p className="font-semibold text-sm">{posData.averageOrderValue}</p>
					</div>
					<div className="space-y-1">
						<div className="flex items-center space-x-1">
							<Clock className="h-3 w-3 text-warning" />
							<span className="text-xs text-muted-foreground">Active</span>
						</div>
						<p className="font-semibold text-sm">{posData.activeOrders}</p>
					</div>
				</div>

				{/* Payment Methods */}
				<div className="space-y-2">
					<h4 className="text-xs font-medium text-muted-foreground">Payment Methods</h4>
					<div className="space-y-1">
						<div className="flex items-center justify-between text-xs">
							<div className="flex items-center space-x-1">
								<CreditCard className="h-3 w-3" />
								<span>Card</span>
							</div>
							<span className="font-medium">{posData.paymentMethods.card}%</span>
						</div>
						<div className="flex items-center justify-between text-xs">
							<div className="flex items-center space-x-1">
								<DollarSign className="h-3 w-3" />
								<span>Cash</span>
							</div>
							<span className="font-medium">{posData.paymentMethods.cash}%</span>
						</div>
					</div>
				</div>

				{/* Top Items */}
				<div className="space-y-2">
					<h4 className="text-xs font-medium text-muted-foreground">Top Items Today</h4>
					<div className="space-y-1">
						{posData.topItems.slice(0, 2).map((item, index) => (
							<div key={index} className="flex items-center justify-between text-xs">
								<span className="flex-1 truncate">{item.name}</span>
								<span className="text-muted-foreground mx-1">×{item.quantity}</span>
								<span className="font-medium text-success">{item.revenue}</span>
							</div>
						))}
					</div>
				</div>

				<Button size="sm" variant="outline" className="w-full">
					View Full Dashboard
				</Button>
			</CardContent>
		</Card>
	);
}
