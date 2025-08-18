"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Star, ExternalLink } from "lucide-react";

type ReviewItem = {
    id: string;
    rating: number;
    text?: string | null;
    created_at?: string;
    business?: {
        id?: string;
        name?: string;
        slug?: string;
        city?: string;
        state?: string;
    } | null;
};

export default function MyReviewsSection({ reviews = [] as ReviewItem[] }: { reviews?: ReviewItem[] }) {
    const items = Array.isArray(reviews) ? reviews.slice(0, 5) : [];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Recent Reviews</CardTitle>
                <CardDescription>Latest reviews you wrote for local businesses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {items.length === 0 ? (
                    <div className="text-sm text-muted-foreground">You haven't written any reviews yet.</div>
                ) : (
                    <div className="space-y-4">
                        {items.map((rev) => (
                            <div key={rev.id} className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-card">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 text-yellow-500">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star key={s} className={`h-4 w-4 ${s <= (rev.rating || 0) ? "fill-yellow-500" : "text-muted-foreground"}`} />
                                            ))}
                                        </div>
                                        {rev.business?.name && <Badge variant="secondary" className="text-xs">{rev.business.name}</Badge>}
                                    </div>
                                    {rev.text && <p className="text-sm text-muted-foreground line-clamp-2">{rev.text}</p>}
                                    {rev.created_at && (
                                        <span className="text-xs text-muted-foreground">{new Date(rev.created_at).toLocaleDateString()}</span>
                                    )}
                                </div>
                                {rev.business?.slug && (
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/biz/${rev.business.slug}`}>
                                            View <ExternalLink className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full" asChild>
                        <Link href="/dashboard/user/reviews">View All Reviews</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}


