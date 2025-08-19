// components/VideoPost.js

import React from "react";

const VideoPost = ({ media }) => {
	// Determine if media URL is valid
	const isValidUrl = (url) => {
		try {
			new URL(url);
			return true;
		} catch (_) {
			return false;
		}
	};

	return (
		<div className="w-full h-auto mt-2 rounded-lg">
			{media && isValidUrl(media) ? (
				<video controls className="w-full h-auto rounded-lg">
					<source src={media} type="video/mp4" />
					Your browser does not support the video tag.
				</video>
			) : (
				<p className="text-destructive">Invalid video URL or media not provided.</p>
			)}
		</div>
	);
};

export default VideoPost;
