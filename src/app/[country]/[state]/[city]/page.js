import React from "react";
import { BusinessDataFetchers } from "@lib/database/supabase/server";
import CategoryPage from "@components/site/categories/category-page";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { country, state, city } = await params;
  const title = `Local Businesses in ${city}, ${state.toUpperCase()} | Thorbis`;
  const description = `Discover top-rated local businesses in ${city}, ${state.toUpperCase()}. Find services with verified reviews.`;
  const canonical = `https://thorbis.com/${country}/${state}/${city}`;
  return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical } };
}

export default async function CityHubPage({ params }) {
  const { country, state, city } = await params;
  const result = await BusinessDataFetchers.searchBusinesses({ location: city, limit: 100 });
  const businesses = result?.businesses || [];
  const loc = { name: city, state: state.toUpperCase() };
  return <CategoryPage type="location" title={`Local Businesses in ${city}, ${state.toUpperCase()}`} subtitle={`Explore top services in ${city}`} businesses={businesses} category={null} location={loc} requiresLocation={false} />;
}
