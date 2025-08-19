// components/site/biz/layout/comment/Comment.js

import React, { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@components/ui/popover";
import { User, PlusCircle, MapPin, CheckCircle, Eye } from "react-feather";
import { Textarea } from "@components/ui/textarea";
import Link from "next/link";
import Image from "next/image";
import Reactions from "./reactions";
import ReactionTrigger from "./reaction-trigger";
import { useReactionsContext } from "@context/posts/reactions-context";
import DateDisplay from "@components/site/biz/layout/shared/date-display";

const Comment = ({ comment, handleReplyClick, replyBox, replyText, setReplyText, handleAddReply }) => {
	const [showReplies, setShowReplies] = useState({});
	const { reactions } = useReactionsContext();

	const toggleReplies = (id) => {
		setShowReplies((prevShowReplies) => ({
			...prevShowReplies,
			[id]: !prevShowReplies[id],
		}));
	};

	const renderReplies = (replies, parentId) => {
		return replies.map((reply) => <Comment key={reply.id} comment={reply} handleReplyClick={handleReplyClick} replyBox={replyBox} replyText={replyText} setReplyText={setReplyText} handleAddReply={handleAddReply} toggleReplies={toggleReplies} showReplies={showReplies} />);
	};

	return (
		<div key={comment.id} className="flex flex-col space-y-4">
			<div className="flex items-center justify-between w-full space-x-4">
				<div className="flex items-center w-full space-x-4">
					<Popover>
						<PopoverTrigger asChild>
							<div className="relative flex self-start flex-shrink-0 cursor-pointer group">
								<Image width={100} height={100} src={comment.user.avatar} alt="" className="object-fill w-10 h-10 rounded-full" />
							</div>
						</PopoverTrigger>
						<PopoverContent className="px-4 py-4 bg-white rounded shadow w-72">
							<div className="flex space-x-3">
								<div className="flex flex-shrink-0">
									<Image width={100} height={100} src={comment.user.avatar} alt="" className="object-fill w-16 h-16 rounded-full" />
								</div>
								<div className="flex flex-col space-y-2">
									<div className="font-semibold">
										<a href="#" className="hover:underline">
											{comment.user.name}
										</a>
									</div>
									<div className="flex items-center justify-start space-x-2">
										<User className="w-4 h-6" />
										<div className="w-auto text-sm leading-none">
											<small>
												1 mutual friend including:{" "}
												<a href="#" className="font-semibold hover:underline">
													Mulyadi
												</a>
											</small>
										</div>
									</div>
									<div className="flex items-center justify-start space-x-2">
										<MapPin className="w-4 h-6" />
										<div className="w-auto text-sm leading-none">
											<small>
												From{" "}
												<a href="#" className="font-semibold">
													Bandung
												</a>
											</small>
										</div>
									</div>
								</div>
							</div>
							<div className="flex mt-2 space-x-1">
								<div className="w-1/2">
									<a href="#" className="flex items-center justify-center px-3 py-2 text-xs font-semibold text-primary bg-primary/30 bg-opacity-50 rounded-md hover:bg-opacity-60">
										<PlusCircle className="w-4 h-4 mr-1" />
										Add
									</a>
								</div>
								<div className="w-auto">
									<a href="#" className="flex items-center justify-center px-3 py-2 text-xs font-semibold text-foreground bg-muted rounded-lg hover:bg-muted">
										<CheckCircle className="w-4 h-4 mr-1" />
									</a>
								</div>
								<div className="w-auto">
									<a href="#" className="flex items-center justify-center px-3 py-2 text-xs font-semibold text-foreground bg-muted rounded-lg hover:bg-muted">
										<Eye className="w-4 h-4 mr-1" />
									</a>
								</div>
							</div>
						</PopoverContent>
					</Popover>

					<div className="block w-full">
						<div className="relative w-full p-2 bg-card rounded-md">
							<Link href="#" className="p-0 m-0 text-sm font-medium hover:underline">
								{comment.user.name}
							</Link>
							<div className="text-sm">{comment.comment}</div>
						</div>
						<div className="flex justify-between w-full pt-1 text-sm">
							<div className="space-x-6 text-muted-foreground">
								<DateDisplay date={comment.time} /> {/* Use DateDisplay component */}
								<ReactionTrigger commentId={comment.id}>
									<span className="cursor-pointer hover:underline">Like</span>
								</ReactionTrigger>
								<span className="cursor-pointer hover:underline" onClick={() => handleReplyClick(comment.id)}>
									Reply
								</span>
							</div>
							<Reactions reactions={reactions[comment.id]} />
						</div>
						{replyBox === comment.id && (
							<div className="mt-2">
								<Textarea className="w-full px-3 py-2 border rounded" placeholder="Write a reply..." value={replyText[comment.id] || ""} onChange={(e) => setReplyText({ ...replyText, [comment.id]: e.target.value })} />
								{replyText[comment.id] && (
									<button className="px-3 py-2 mt-2 text-white bg-primary rounded" onClick={() => handleAddReply(comment.id)}>
										Submit
									</button>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
			{comment.replies && comment.replies.length > 0 && (
				<div className="w-full pl-4 border-l-2 border-primary">
					{!showReplies[comment.id] && (
						<div className="flex items-center w-full space-x-4 cursor-pointer hover:underline" onClick={() => toggleReplies(comment.id)}>
							<Image width={100} height={100} src={comment.replies[0].user.avatar} alt="" className="object-fill w-6 h-6 rounded-full" />
							<div className="text-xs">
								<Link href="#" className="p-0 m-0 font-semibold">
									{comment.replies.length} more replies
								</Link>
							</div>
						</div>
					)}
					{showReplies[comment.id] && renderReplies(comment.replies, comment.id)}
				</div>
			)}
		</div>
	);
};

export default Comment;

