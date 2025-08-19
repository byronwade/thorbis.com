import React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@components/ui/popover";
import { ThumbsUp, Heart, Smile, Frown, Meh, ThumbsDown } from "react-feather";

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

const ReactionPopover = ({ handleReactionClick }) => {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<button className="flex items-center text-muted-foreground dark:text-muted-foreground hover:text-primary">
					<ThumbsUp className="w-5 h-5 mr-1" /> Like
				</button>
			</PopoverTrigger>
			<PopoverContent className="w-auto px-2 py-2 bg-white rounded shadow">
				<div className="flex justify-around">
					{Object.keys(reactionsIcons).map((reaction) => {
						const Icon = reactionsIcons[reaction];
						return (
							<button key={reaction} onClick={() => handleReactionClick(reaction)} className={`p-1 rounded-full ${reactionColors[reaction]}`}>
								<Icon className="w-4 h-4" />
							</button>
						);
					})}
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default ReactionPopover;
