"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { MapPin, ExternalLink } from "lucide-react";

type SavedBusiness = {
    id: string;
    name: string;
    slug: string;
    city?: string | null;
    state?: string | null;
    rating?: number | null;
    review_count?: number | null;
};

export default function SavedBusinessesSection({ items = [] as SavedBusiness[] }: { items?: SavedBusiness[] }) {
    const businesses = Array.isArray(items) ? items.slice(0, 6) : [];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Saved Businesses</CardTitle>
                <CardDescription>Quick access to businesses you've saved</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {businesses.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No saved businesses yet.</div>
                ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                        {businesses.map((b) => (
                            <div key={b.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-card">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-medium truncate">{b.name}</h4>
                                        {b.rating != null && (
                                            <Badge variant="secondary" className="text-xs">{b.rating?.toFixed(1)}★</Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <MapPin className="h-3 w-3" />
                                        <span className="truncate">{[b.city, b.state].filter(Boolean).join(", ")}</span>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/biz/${b.slug}`}>
                                        Open <ExternalLink className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full" asChild>
                        <Link href="/categories">Find More Businesses</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}


