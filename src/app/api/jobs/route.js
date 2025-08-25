/**
 * Jobs API Route
 * Provides job listings and search functionality
 */

import { NextResponse } from "next/server";
import { serviceSupabase } from "@lib/database/supabase/client";
import logger from "@lib/utils/logger";

// Mock jobs data for development/testing
const mockJobs = [
  {
    id: "1",
    title: "Software Engineer",
    company: "Tech Corp",
    location: "San Francisco, CA",
    type: "Full-time",
    salary_min: 80000,
    salary_max: 120000,
    remote_ok: true,
    description: "We're looking for a talented software engineer...",
    created_at: new Date().toISOString(),
    skills_required: ["JavaScript", "React", "Node.js"],
    experience_level: "Mid-level",
    benefits: ["Health Insurance", "401k", "Remote Work"],
    application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    title: "Product Manager",
    company: "Startup Inc",
    location: "New York, NY",
    type: "Full-time",
    salary_min: 90000,
    salary_max: 140000,
    remote_ok: false,
    description: "Join our growing team as a product manager...",
    created_at: new Date().toISOString(),
    skills_required: ["Product Management", "Agile", "Analytics"],
    experience_level: "Senior",
    benefits: ["Health Insurance", "Stock Options", "Flexible Hours"],
    application_deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Environment validation
function validateEnvironment() {
  const requiredEnvVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  const missing = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key, _]) => key);

  if (missing.length > 0) {
    logger.warn(`Missing environment variables for jobs API (will use mock data): ${missing.join(", ")}`);
    return null;
  }

  return requiredEnvVars;
}

// Get Supabase client with error handling
function getSupabaseClient() {
  try {
    	return serviceSupabase();
  } catch (error) {
    logger.error("Failed to get Supabase client for jobs:", error);
    return null;
  }
}

export async function GET(request) {
  const startTime = performance.now();

  try {
    logger.debug("Fetching jobs");

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || searchParams.get("q") || "";
    const location = searchParams.get("location") || "";
    const jobType = searchParams.get("type") || "";
    const remote = searchParams.get("remote");
    const salaryMin = searchParams.get("salary_min");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const useMock = searchParams.get("mock") === "true";

    // If explicitly requested or if environment is not set up, use mock data
    if (useMock) {
      logger.debug("Using mock jobs data");
      
      return NextResponse.json(
        {
          success: true,
          jobs: mockJobs,
          total: mockJobs.length,
          hasMore: false,
          metadata: {
            responseTime: `${(performance.now() - startTime).toFixed(2)}ms`,
            source: "mock",
          },
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
          },
        }
      );
    }

    // Try to get Supabase client
    const supabase = getSupabaseClient();
    if (!supabase) {
      logger.warn("Supabase client not available for jobs, falling back to mock data");
      
      return NextResponse.json(
        {
          success: true,
          jobs: mockJobs,
          total: mockJobs.length,
          hasMore: false,
          metadata: {
            responseTime: `${(performance.now() - startTime).toFixed(2)}ms`,
            source: "fallback",
          },
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
          },
        }
      );
    }

    // Build query
    let query = supabase
      .from("jobs")
      .select(`
        *,
        companies (
          id,
          name,
          logo_url,
          industry,
          company_size,
          website
        )
      `)
      .order("created_at", { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (location) {
      query = query.ilike("location", `%${location}%`);
    }

    if (jobType) {
      query = query.eq("job_type", jobType);
    }

    if (remote === "true") {
      query = query.eq("remote_ok", true);
    } else if (remote === "false") {
      query = query.eq("remote_ok", false);
    }

    if (salaryMin) {
      query = query.gte("salary_min", parseInt(salaryMin));
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: jobs, error } = await query;

    if (error) {
      logger.error("Supabase jobs query error:", error);
      logger.warn("Jobs database query failed, falling back to mock data");

      return NextResponse.json(
        {
          success: true,
          jobs: mockJobs,
          total: mockJobs.length,
          hasMore: false,
          metadata: {
            responseTime: `${(performance.now() - startTime).toFixed(2)}ms`,
            source: "fallback",
            error: error.message,
          },
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
          },
        }
      );
    }

    // Transform data for client consumption
    const transformedJobs = (jobs || []).map(transformJobData);

    // If no jobs found, use mock data as fallback
    if (transformedJobs.length === 0) {
      logger.debug("No jobs found in database, using mock data");
      
      return NextResponse.json(
        {
          success: true,
          jobs: mockJobs,
          total: mockJobs.length,
          hasMore: false,
          metadata: {
            responseTime: `${(performance.now() - startTime).toFixed(2)}ms`,
            source: "fallback",
          },
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
          },
        }
      );
    }

    const duration = performance.now() - startTime;
    logger.performance(`Jobs API completed in ${duration.toFixed(2)}ms`);
    logger.debug(`Returned ${transformedJobs.length} jobs`);

    return NextResponse.json(
      {
        success: true,
        jobs: transformedJobs,
        total: transformedJobs.length,
        hasMore: transformedJobs.length === limit,
        metadata: {
          responseTime: `${duration.toFixed(2)}ms`,
          source: "database",
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=1800, stale-while-revalidate=3600", // 30 minutes cache
        },
      }
    );
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error("Error in jobs API:", {
      error: error.message,
      stack: error.stack,
      duration: `${duration.toFixed(2)}ms`,
    });

    // Even on error, provide mock data as a last resort
    logger.warn("Critical error occurred in jobs API, falling back to mock data");

    return NextResponse.json(
      {
        success: true,
        jobs: mockJobs,
        total: mockJobs.length,
        hasMore: false,
        metadata: {
          responseTime: `${duration.toFixed(2)}ms`,
          source: "emergency_fallback",
          error: error.message,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        },
      }
    );
  }
}

// Helper function to transform job data consistently
function transformJobData(job) {
  const formatSalary = (min, max) => {
    if (!min && !max) return "Salary not specified";
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    return `Up to $${max.toLocaleString()}`;
  };

  const formatPostedDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1d ago";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)}w ago`;
    return `${Math.ceil(diffDays / 30)}m ago`;
  };

  return {
    id: job.id,
    title: job.title,
    company: job.companies?.name || "Company",
    logo: job.companies?.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.companies?.name || "Company")}&background=0ea5e9&color=fff`,
    location: job.location,
    isRemote: job.remote_ok,
    type: job.job_type || "Full-time",
    posted: formatPostedDate(job.created_at),
    description: job.description?.substring(0, 200) + "..." || "No description available",
    salary: formatSalary(job.salary_min, job.salary_max),
    skills: job.skills_required || [],
    experienceLevel: job.experience_level,
    benefits: job.benefits || [],
    applicationDeadline: job.application_deadline,
    companyInfo: {
      id: job.companies?.id,
      industry: job.companies?.industry,
      size: job.companies?.company_size,
      website: job.companies?.website,
    },
  };
}
