import React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@components/ui/popover";
import { ThumbsUp, Heart, Smile, Frown, Meh, ThumbsDown } from "react-feather";
import { useReactionsContext } from "@context/posts/reactions-context";

const reactionsIcons = {
	thumbsUp: ThumbsUp,
	heart: Heart,
	smile: Smile,
	frown: Frown,
	meh: Meh,
	thumbsDown: ThumbsDown,
};

const reactionColors = {
	thumbsUp: "bg-primary text-white",
	heart: "bg-destructive text-white",
	smile: "bg-warning text-white",
	frown: "bg-muted text-white",
	meh: "bg-success text-white",
	thumbsDown: "bg-purple-500 text-white",
};

const ReactionTrigger = ({ children, postId, commentId }) => {
	const { handleReactionClick } = useReactionsContext();

	const handleClick = (reaction) => {
		if (postId) {
			handleReactionClick(postId, reaction);
		} else if (commentId) {
			handleReactionClick(commentId, reaction);
		}
	};

	return (
		<Popover>
			<PopoverTrigger asChild>{children}</PopoverTrigger>
			<PopoverContent className="w-auto px-2 py-2 bg-white rounded shadow">
				<div className="flex justify-around">
					{Object.keys(reactionsIcons).map((reaction) => {
						const Icon = reactionsIcons[reaction];
						return (
							<button key={reaction} onClick={() => handleClick(reaction)} className={`p-1 rounded-full ${reactionColors[reaction]}`}>
								<Icon className="w-4 h-4" />
							</button>
						);
					})}
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default ReactionTrigger;
