import React from "react";
import { notFound } from "next/navigation";
import { BusinessDataFetchers } from "@lib/database/supabase/server";
import BizProfileClient from "@/app/biz/[slug]/biz-profile-client";
import CategoryPage from "@components/site/categories/category-page";
import { buildBusinessUrl } from "@utils";

export const dynamic = "force-dynamic";

async function fetchBusiness(compound) {
  try {
    const { data: business } = await BusinessDataFetchers.getBusinessProfile(compound);
    return business;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { country, state, city, business: slug } = await params;
  const isBusiness = /-(\w{5,10})$/.test(slug);
  
  if (!isBusiness) {
    const title = `${slug.replace(/-/g, ' ')} in ${city}, ${state.toUpperCase()} | Thorbis`;
    const description = `Find the best ${slug.replace(/-/g, ' ')} in ${city}, ${state.toUpperCase()}.`;
    const canonical = `https://thorbis.com/${country}/${state}/${city}/${slug}`;
    return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical } };
  }
  
  const dataWrap = await fetchBusiness(slug);
  if (!dataWrap) return { title: "Business not found | Thorbis", robots: { index: false, follow: false } };
  
  const canonical = buildBusinessUrl({ country, state, city, name: dataWrap.name, shortId: dataWrap.short_id || dataWrap.shortId });
  return { 
    title: `${dataWrap.name} - ${dataWrap.city}, ${dataWrap.state} | Thorbis`, 
    description: dataWrap.description || `Find ${dataWrap.name} in ${dataWrap.city}, ${dataWrap.state}.`, 
    alternates: { canonical }, 
    openGraph: { title: dataWrap.name, description: dataWrap.description || "", url: canonical } 
  };
}

export default async function BusinessOrCategoryRoute({ params }) {
  const { country, state, city, business: slug } = await params;
  const isBusiness = /-(\w{5,10})$/.test(slug);
  
  if (!isBusiness) {
    const result = await BusinessDataFetchers.searchBusinesses({ category: slug, location: city, limit: 100 });
    const businesses = result?.businesses || [];
    const loc = { name: city, state: state.toUpperCase() };
    return <CategoryPage type="category" title={`${slug.replace(/-/g, ' ')} in ${city}, ${state.toUpperCase()}`} subtitle={`Top ${slug.replace(/-/g, ' ')} in ${city}`} businesses={businesses} category={slug} location={loc} requiresLocation={true} />;
  }
  
  const business = await fetchBusiness(slug);
  if (!business) notFound();
  return <BizProfileClient businessId={business.id} initialBusiness={business} />;
}
