"use client";

import React from "react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { allProducts } from "@data/products";

// Import the RelatedProducts component logic
function TestRelatedProducts({ currentProduct }) {
	// Create deterministic shuffle based on product ID for SSR consistency
	const getDeterministicShuffle = (array, seed) => {
		const hash = seed?.split('').reduce((a, b) => {
			a = ((a << 5) - a) + b.charCodeAt(0);
			return a & a;
		}, 0) || 0;
		
		// Use hash to create a deterministic shuffle
		return array.sort((a, b) => {
			const aHash = a.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
			const bHash = b.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
			return (aHash + hash) % array.length - (bHash + hash) % array.length;
		});
	};

	// Get related products from the same category or similar categories
	const getRelatedProducts = () => {
		const sameCategory = allProducts.filter(p => 
			p.category === currentProduct.category && p.id !== currentProduct.id
		);
		
		const similarCategories = allProducts.filter(p => 
			p.id !== currentProduct.id && 
			p.category !== currentProduct.category && // Ensure no overlap with sameCategory
			(p.category.includes("Systems") || p.category.includes("Management"))
		);
		
		// Use Set to ensure absolute uniqueness by product ID
		const seenIds = new Set();
		const uniqueProducts = [];
		
		// Add same category products first (priority)
		sameCategory.forEach(product => {
			if (!seenIds.has(product.id)) {
				seenIds.add(product.id);
				uniqueProducts.push(product);
			}
		});
		
		// Add similar category products
		similarCategories.forEach(product => {
			if (!seenIds.has(product.id)) {
				seenIds.add(product.id);
				uniqueProducts.push(product);
			}
		});
		
		// Shuffle deterministically and take first 4
		const related = getDeterministicShuffle(uniqueProducts, currentProduct.id)
			.slice(0, 4);
		
		return related;
	};

	const relatedProducts = getRelatedProducts();
	
	// Debug logging for duplicate keys
	const productIds = relatedProducts.map(p => p.id);
	const duplicateIds = productIds.filter((id, index) => productIds.indexOf(id) !== index);
	const hasDuplicates = duplicateIds.length > 0;

	return (
		<div className="space-y-6">
							<Card className={`${hasDuplicates ? 'bg-destructive/20 border-destructive' : 'bg-primary/20 border-primary'}`}>
					<CardHeader>
						<CardTitle className={`flex items-center gap-2 ${hasDuplicates ? 'text-destructive' : 'text-primary'}`}>
						{hasDuplicates ? <AlertCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
						Duplicate Key Test Results
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="p-4 bg-muted rounded-lg">
							<div className="font-semibold text-white mb-2">Current Product:</div>
							<div className="text-sm text-muted-foreground">
								ID: {currentProduct.id} | Category: {currentProduct.category}
							</div>
						</div>
						
						<div className="p-4 bg-muted rounded-lg">
							<div className="font-semibold text-white mb-2">Related Products ({relatedProducts.length}):</div>
							<div className="text-sm text-muted-foreground space-y-1">
								{relatedProducts.map((product, index) => (
									<div key={`test-${currentProduct.id}-${product.id}-${index}`}>
										{index + 1}. {product.id} ({product.category})
									</div>
								))}
							</div>
						</div>
						
						{hasDuplicates ? (
												<div className="p-4 bg-destructive/20 border border-destructive rounded-lg">
						<div className="font-semibold text-destructive mb-2">❌ Duplicates Found:</div>
						<div className="text-sm text-destructive">
									{duplicateIds.join(', ')}
								</div>
							</div>
						) : (
												<div className="p-4 bg-primary/20 border border-primary rounded-lg">
						<div className="font-semibold text-primary mb-2">✅ No Duplicates Found</div>
						<div className="text-sm text-primary">
									All product IDs are unique
								</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default function TestRelatedProductsPage() {
	const testProducts = [
		allProducts.find(p => p.id === "thorbis-pay-brick-mini"),
		allProducts.find(p => p.id === "thorbis-pos-pro"),
		allProducts.find(p => p.id === "thorbis-aegis-360"),
		allProducts.find(p => p.id === "thorbis-doorsense")
	].filter(Boolean);

	return (
		<div className="min-h-screen bg-black p-6">
			<div className="max-w-4xl mx-auto">
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold text-white mb-4">
						Related Products Test
					</h1>
					<p className="text-muted-foreground text-lg">
						Testing for duplicate keys in RelatedProducts component
					</p>
				</div>

				<div className="space-y-8">
					{testProducts.map((product) => (
						<Card key={product.id} className="bg-background border-border">
							<CardHeader>
								<CardTitle className="text-white text-lg">{product.name}</CardTitle>
							</CardHeader>
							<CardContent>
								<TestRelatedProducts currentProduct={product} />
							</CardContent>
						</Card>
					))}
				</div>

				<div className="mt-8 text-center">
					<Button asChild variant="outline" className="text-white border-border">
						<Link href="/store">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Store
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
