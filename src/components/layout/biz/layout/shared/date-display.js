import { formatDistanceToNow, format, parse, isValid } from "date-fns";
import { enGB } from "date-fns/locale";

// Convert custom date format to ISO string
const convertToISO = (customDate) => {
	// Regular expression to match the custom date format
	const regex = /(\d{1,2}) (\w+) at (\d{2}:\d{2})/;
	const match = customDate.match(regex);

	if (!match) {
		return null;
	}

	const [_, day, month, time] = match;
	const year = new Date().getFullYear(); // Assuming current year

	// Map month names to numbers
	const months = {
		January: 1,
		February: 2,
		March: 3,
		April: 4,
		May: 5,
		June: 6,
		July: 7,
		August: 8,
		September: 9,
		October: 10,
		November: 11,
		December: 12,
	};

	const monthIndex = months[month];

	if (!monthIndex) {
		return null;
	}

	return `${year}-${monthIndex.toString().padStart(2, "0")}-${day.padStart(2, "0")}T${time}:00Z`;
};

// Map units to their abbreviations
const timeUnits = {
	years: "y",
	months: "m",
	weeks: "w",
	days: "d",
	hours: "h",
	minutes: "m",
	seconds: "s",
};

const formatDate = (dateString) => {
	const now = new Date();
	const isoDateString = convertToISO(dateString);

	if (!isoDateString) {
		return "Invalid date";
	}

	const date = parse(isoDateString, "yyyy-MM-dd'T'HH:mm:ssX", new Date());

	// Check if the date is valid
	if (!isValid(date)) {
		return "Invalid date";
	}

	// Calculate the distance to now
	const distance = formatDistanceToNow(date, { addSuffix: true, locale: enGB });

	// Extract time unit and value
	const match = distance.match(/(\d+)\s*(\w+)/);
	if (match) {
		const [_, value, unit] = match;
		return `${value}${timeUnits[unit] || unit}`;
	}

	// Fallback to default formatting
	return format(date, "d MMMM yyyy", { locale: enGB });
};

const DateDisplay = ({ date }) => {
	return <span className="text-sm leading-snug text-muted-foreground dark:text-muted-foreground">{formatDate(date)}</span>;
};

export default DateDisplay;
