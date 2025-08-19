import React from "react";
import { Source, Layer } from "react-map-gl";
import { useBusinessStore } from "@store/business";
import { point, featureCollection, buffer } from "@turf/turf";

// Function to generate GeoJSON for service areas
const generateServiceAreaGeoJSON = (business) => {
	const { lat, lng } = business.coordinates;
	const radius = business.serviceArea?.value || 0; // Assuming the radius is in kilometers

	// Create a point feature
	const center = point([lng, lat]);

	// Create a buffer around the point feature
	const buffered = buffer(center, radius, { units: "kilometers" });

	return featureCollection([buffered]);
};

const ServiceArea = () => {
	const { filteredBusinesses, activeBusinessId } = useBusinessStore();

	const activeBusiness = filteredBusinesses.find((business) => business.id === activeBusinessId);

	const geojson = React.useMemo(() => {
		if (activeBusiness) {
			return generateServiceAreaGeoJSON(activeBusiness);
		}
		return null;
	}, [activeBusiness]);

	if (!geojson) return null;

	return (
		<Source id="selected-service-area" type="geojson" data={geojson}>
			<Layer
				id="service-area-fill"
				type="fill"
				paint={{
					"fill-color": "hsl(var(--muted-foreground))", // red-500 equivalent
					"fill-opacity": 0.2,
				}}
			/>
			<Layer
				id="service-area-outline"
				type="line"
				paint={{
					"line-color": "hsl(var(--background))", // neutral-900 equivalent
					"line-width": 4,
				}}
			/>
		</Source>
	);
};

export default ServiceArea;
