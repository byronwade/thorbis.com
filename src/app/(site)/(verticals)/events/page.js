import EventsClient from "./events-client";
// import { EventDataFetchers } from "@/lib/database/supabase/server";

// Transform Supabase event data to match client component expectations
function transformEventData(event) {
	const formatPrice = (price) => {
		if (!price) return "Free";
		return `$${price.toLocaleString()}`;
	};

	const formatEventDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const formatEventTime = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		});
	};

	return {
		id: event.id,
		title: event.title,
		description: event.description?.substring(0, 200) + "..." || "No description available",
		date: formatEventDate(event.start_date),
		time: formatEventTime(event.start_date),
		endDate: event.end_date ? formatEventDate(event.end_date) : null,
		price: formatPrice(event.price),
		venue: event.venue_name,
		address: event.venue_address,
		city: event.city,
		state: event.state,
		zip: event.zip_code,
		category: event.category || "General",
		tags: event.tags || [],
		capacity: event.capacity,
		attendees: event.attendee_count || 0,
		images: event.images || [],
		isOnline: event.is_online || false,
		organizer: {
			id: event.organizers?.id,
			name: event.organizers?.name,
			email: event.organizers?.email,
			phone: event.organizers?.phone,
		},
	};
}

async function getEventsData(searchParams) {
	const params = {
		search: searchParams.search || searchParams.q || "",
		location: searchParams.location || "",
		category: searchParams.category || "",
		startDate: searchParams.start_date || "",
		endDate: searchParams.end_date || "",
		minPrice: searchParams.min_price ? parseInt(searchParams.min_price) : undefined,
		maxPrice: searchParams.max_price ? parseInt(searchParams.max_price) : undefined,
		isOnline: searchParams.online === "true" ? true : searchParams.online === "false" ? false : undefined,
		limit: parseInt(searchParams.limit || "20"),
		offset: parseInt(searchParams.offset || "0"),
	};

	// Temporary mock data until EventDataFetchers is implemented
	// const { data: eventsResult, error } = await EventDataFetchers.getEvents(params);

	// if (error) {
	// 	console.error("Failed to fetch events: `, error);
	// 	return { events: [], total: 0, hasMore: false };
	// }

	return {
		events: [],
		total: 0,
		hasMore: false,
	};
}

export async function generateMetadata({ searchParams }) {
	const awaitedSearchParams = await searchParams;
	const query = awaitedSearchParams.search || awaitedSearchParams.q || "";
	const location = awaitedSearchParams.location || "";

	let title = "Find Events Near You - Thorbis";
	let description = "Discover local events, concerts, workshops, and activities. Find exciting things to do in your area.";

	if (query && location) {
		title = `${query} Events in ${location} - Thorbis`;
		description = `Find ${query} events in ${location}. Discover concerts, workshops, and activities happening near you.`;
	} else if (query) {
		title = `${query} Events - Thorbis`;
		description = `Find ${query} events across various locations. Discover exciting activities and entertainment.`;
	} else if (location) {
		title = `Events in ${location} - Thorbis`;
		description = `Find events in ${location}. Discover concerts, workshops, and activities happening in your area.`;
	}

	return {
		title,
		description,
		keywords: ["events", "concerts", "workshops", "activities", "entertainment", query, location].filter(Boolean),
		openGraph: {
			title,
			description,
			type: "website",
			url: "https://thorbis.com/events",
			images: [`https://thorbis.com/opengraph-image?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [`https://thorbis.com/twitter-image?title=${encodeURIComponent(title)}`],
		},
		robots: { index: true, follow: true },
		alternates: { canonical: "https://thorbis.com/events" },
	};
}

async function EventsList({ searchParams }) {
	const eventsData = await getEventsData(searchParams);

	return <EventsClient events={eventsData.events} searchMetadata={eventsData} searchParams={searchParams} />;
}

export default async function EventsPage({ searchParams }) {
	const awaitedSearchParams = await searchParams;

	return (
		<EventsList searchParams={awaitedSearchParams} />
	);
}