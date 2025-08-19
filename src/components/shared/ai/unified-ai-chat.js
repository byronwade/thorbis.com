"use client";

import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Bot, X, Send, Plus, Mic, Loader2, Copy, ThumbsUp, ThumbsDown, MoreVertical, Trash2, Image as ImageIcon, FileText, Camera, Upload } from "lucide-react";
import { Button } from "@components/ui/button";
import { ScrollArea } from "@components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@components/ui/dropdown-menu";
import { useChat } from "@hooks/use-chat";
import { useDragDrop } from "@hooks/use-drag-drop";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Helper function to format file size
const formatFileSize = (bytes) => {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Simple date formatting function
const formatTime = (date) => {
	return new Date(date).toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	});
};

// --- Sub-components for a cleaner structure ---

const ChatHeader = ({ onClear, onClose, mode = "sidebar" }) => (
	<div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-border bg-gray-50 dark:bg-card/50">
		<div className="flex items-center gap-3">
			<div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-sky-400 flex items-center justify-center">
				<Bot className="w-5 h-5 text-white" />
			</div>
			<div>
				<h2 className="font-semibold text-foreground dark:text-white">AI Assistant</h2>
				<p className="text-xs text-muted-foreground dark:text-muted-foreground">Your local business expert</p>
			</div>
		</div>
		<div className="flex items-center gap-2">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground dark:text-muted-foreground">
						<MoreVertical className="w-4 h-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={onClear}>
						<Trash2 className="w-4 h-4 mr-2" />
						Clear Chat
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground dark:text-muted-foreground">
				<X className="w-4 h-4" />
			</Button>
		</div>
	</div>
);

const MessageContent = ({ message }) => (
	<div className="prose prose-sm dark:prose-invert max-w-none text-foreground dark:text-muted-foreground">
		<ReactMarkdown
			components={{
				a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" />,
				p: ({ node, ...props }) => <p {...props} className="mb-3 last:mb-0" />,
			}}
		>
			{message.content}
		</ReactMarkdown>
	</div>
);

const FileAttachment = ({ file }) => (
	<div className="relative group bg-muted dark:bg-card border border-border dark:border-border rounded-lg p-2 flex items-center gap-2 mt-2">
		<Image src={file.preview} alt={file.name} width={48} height={48} className="w-12 h-12 rounded-md object-cover" />
		<div className="text-xs flex-1">
			<p className="font-medium text-foreground dark:text-muted-foreground truncate">{file.name}</p>
			<p className="text-muted-foreground dark:text-muted-foreground">{formatFileSize(file.file.size)}</p>
		</div>
	</div>
);

const MessageActions = ({ message }) => {
	const [feedback, setFeedback] = useState(null);
	return (
		<div className="absolute -top-4 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
			<Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigator.clipboard.writeText(message.content)}>
				<Copy className="w-3.5 h-3.5" />
			</Button>
			<Button variant="ghost" size="icon" className={`h-7 w-7 ${feedback === "up" ? "text-primary" : ""}`} onClick={() => setFeedback("up")}>
				<ThumbsUp className="w-3.5 h-3.5" />
			</Button>
			<Button variant="ghost" size="icon" className={`h-7 w-7 ${feedback === "down" ? "text-destructive" : ""}`} onClick={() => setFeedback("down")}>
				<ThumbsDown className="w-3.5 h-3.5" />
			</Button>
		</div>
	);
};

const Message = ({ message }) => {
	const isAssistant = message.role === "assistant";
	return (
		<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="group relative flex items-start space-x-3 py-4">
			<div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isAssistant ? "bg-muted dark:bg-card" : "bg-primary"}`}>{isAssistant ? <Bot className="w-5 h-5 text-white" /> : <span className="text-sm font-bold text-white">U</span>}</div>
			<div className="flex-1 space-y-2">
				<div className="font-semibold text-sm">
					{isAssistant ? "AI Assistant" : "You"} <span className="text-xs text-muted-foreground ml-2">{formatTime(message.createdAt)}</span>
				</div>
				<MessageContent message={message} />
				{message.files && message.files.map((file) => <FileAttachment key={file.id} file={file} />)}
			</div>
			{isAssistant && <MessageActions message={message} />}
		</motion.div>
	);
};

const ChatInput = ({ input, setInput, handleSubmit, handleFileUpload, isLoading, stopGenerating, mode = "sidebar", uploadedFiles = [], removeFile }) => {
	const textareaRef = useRef(null);
	const fileInputRef = useRef(null);

	// Use the reliable useDragDrop hook
	const { isDraggingOver, dragHandlers } = useDragDrop(
		(files) => {
			handleFileUpload(files);
		},
		["image/", "text/", "application/"]
	);

	const handleKeyPress = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
		}
	}, [input]);

	const handleFileSelect = (e) => {
		if (e.target.files && e.target.files.length > 0) {
			handleFileUpload(Array.from(e.target.files));
		}
	};

	const triggerFileUpload = () => {
		fileInputRef.current?.click();
	};

	const handlePaste = (e) => {
		const items = e.clipboardData.items;
		const files = [];
		for (let i = 0; i < items.length; i++) {
			if (items[i].kind === "file" && items[i].type.startsWith("image/")) {
				const file = items[i].getAsFile();
				files.push(file);
			}
		}
		if (files.length > 0) {
			e.preventDefault();
			handleFileUpload(files);
		}
	};

	// Compact File Preview component
	const FilePreviewCompact = ({ file }) => (
		<motion.div layout initial={{ opacity: 0, y: -10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: -20, scale: 0.9 }} transition={{ duration: 0.2 }} className="relative group bg-muted dark:bg-card border border-border dark:border-border rounded-lg p-1.5 flex items-center gap-2">
			{file.type.startsWith("image/") ? (
				<Image src={file.preview} alt={file.name} width={32} height={32} className="w-8 h-8 rounded-md object-cover" />
			) : (
				<div className="w-8 h-8 rounded-md bg-primary/10 dark:bg-primary/30 flex items-center justify-center">
					<FileText className="w-5 h-5 text-primary dark:text-primary" />
				</div>
			)}
			<p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground truncate flex-1">{file.name}</p>
			<Button variant="ghost" size="icon" onClick={() => removeFile(file.id)} className="h-6 w-6 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/50 flex-shrink-0" aria-label="Remove file">
				<X className="w-4 h-4" />
			</Button>
		</motion.div>
	);

	const ChatInputWrapper = mode === "dropdown" ? "div" : "form";
	const wrapperProps = mode === "dropdown" ? {} : { onSubmit: handleSubmit };

	return (
		<div className="border-t border-border dark:border-border p-2 sm:p-3 bg-white dark:bg-neutral-900">
			<ChatInputWrapper {...wrapperProps} className="relative block" {...dragHandlers}>
				<div className={`border rounded-xl p-3 transition-all duration-200 ${isDraggingOver ? "border-dashed border-primary bg-primary/10 dark:bg-primary/20 shadow-blue-500/20 shadow-xl scale-105" : "border-border dark:border-border"} focus-within:ring-2 focus-within:ring-blue-500`}>
					{/* Drag overlay indicator */}
					{isDraggingOver && (
						<div className="absolute inset-0 bg-primary/10 dark:bg-primary/40/10 rounded-xl pointer-events-none z-10 flex items-center justify-center">
							<div className="bg-primary dark:bg-primary text-white px-3 py-1.5 rounded-md shadow-lg text-sm">
								<Upload className="w-4 h-4 mr-1.5 inline" />
								Drop files here
							</div>
						</div>
					)}

					{/* File Previews */}
					<AnimatePresence>
						{uploadedFiles.length > 0 && (
							<div className="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
								{uploadedFiles.map((file) => (
									<FilePreviewCompact key={file.id} file={file} />
								))}
							</div>
						)}
					</AnimatePresence>

					{/* Textarea */}
					<textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyPress} onPaste={handlePaste} placeholder={isDraggingOver ? "Drop files here" : "Ask a question, or paste an image..."} disabled={isLoading} className="w-full resize-none bg-transparent !border-0 text-base p-0 !outline-none !ring-0 disabled:opacity-60 placeholder:text-muted-foreground dark:placeholder:text-muted-foreground" rows={1} />

					{/* Action Buttons */}
					<div className="flex items-center justify-between mt-2">
						<div className="flex items-center gap-1">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground dark:text-muted-foreground hover:text-primary hover:bg-blue-50 dark:hover:bg-primary/20 transition-all duration-200" aria-label="Attach file">
										<Plus className="w-5 h-5" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="start" className="w-56">
									<DropdownMenuLabel>Upload Files</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={triggerFileUpload} className="flex items-center gap-3 py-2.5">
										<div className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/30 flex items-center justify-center">
											<Upload className="w-4 h-4 text-primary dark:text-primary" />
										</div>
										<div className="flex flex-col">
											<span className="text-sm font-medium">Upload Files</span>
											<span className="text-xs text-muted-foreground">Images, documents, etc.</span>
										</div>
									</DropdownMenuItem>
									<DropdownMenuItem onClick={triggerFileUpload} className="flex items-center gap-3 py-2.5">
										<div className="w-8 h-8 rounded-lg bg-success/10 dark:bg-success/30 flex items-center justify-center">
											<ImageIcon className="w-4 h-4 text-success dark:text-success" />
										</div>
										<div className="flex flex-col">
											<span className="text-sm font-medium">Upload Image</span>
											<span className="text-xs text-muted-foreground">Photos and graphics</span>
										</div>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem className="flex items-center gap-3 py-2.5">
										<div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
											<Camera className="w-4 h-4 text-purple-600 dark:text-purple-400" />
										</div>
										<div className="flex flex-col">
											<span className="text-sm font-medium">Take Photo</span>
											<span className="text-xs text-muted-foreground">Use camera</span>
										</div>
									</DropdownMenuItem>
									<DropdownMenuItem className="flex items-center gap-3 py-2.5">
										<div className="w-8 h-8 rounded-lg bg-warning/10 dark:bg-warning/30 flex items-center justify-center">
											<FileText className="w-4 h-4 text-warning dark:text-warning" />
										</div>
										<div className="flex flex-col">
											<span className="text-sm font-medium">Scan Document</span>
											<span className="text-xs text-muted-foreground">OCR scanning</span>
										</div>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
							<Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground dark:text-muted-foreground hover:text-primary hover:bg-blue-50 dark:hover:bg-primary/20 transition-all duration-200" aria-label="Use microphone">
								<Mic className="w-5 h-5" />
							</Button>
							<input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" />
						</div>
						<div className="flex items-center">
							<Button type={mode === "dropdown" ? "button" : "submit"} onClick={mode === "dropdown" ? handleSubmit : undefined} size="icon" className="h-9 w-9 rounded-full bg-primary text-white hover:bg-primary disabled:bg-muted dark:disabled:bg-muted" disabled={(!input.trim() && uploadedFiles.length === 0) || isLoading} aria-label="Send message">
								{isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
							</Button>
						</div>
					</div>
				</div>
			</ChatInputWrapper>
		</div>
	);
};

// --- Main Chat Component ---

const UnifiedAIChat = forwardRef(({ isOpen, onClose, mode = "sidebar" }, ref) => {
	const { messages, input, setInput, handleSubmit, clearChat, handleFileUpload, isLoading, stopGenerating, error, uploadedFiles, removeFile } = useChat([]);
	const scrollAreaRef = useRef(null);

	// Use the reliable useDragDrop hook for the main container
	const { isDraggingOver, dragHandlers } = useDragDrop(
		(files) => {
			handleFileUpload(files);
		},
		["image/", "text/", "application/"]
	);

	// Expose methods to parent component
	useImperativeHandle(ref, () => ({
		handleFileUpload,
		clearChat,
		uploadedFiles,
	}));

	useEffect(() => {
		// Auto-scroll to bottom
		const scrollViewport = scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]");
		if (scrollViewport) {
			scrollViewport.scrollTop = scrollViewport.scrollHeight;
		}
	}, [messages]);

	if (!isOpen) return null;

	// In dropdown mode, render a simplified version without input
	if (mode === "dropdown") {
		return (
			<div className={`flex flex-col h-full bg-white dark:bg-neutral-900 border border-border dark:border-border rounded-lg shadow-lg overflow-hidden transition-all duration-200 ${isDraggingOver ? "border-dashed border-primary bg-blue-50/50 dark:bg-primary/10 shadow-blue-500/20 shadow-xl" : ""}`} {...dragHandlers}>
				{/* Drag overlay indicator */}
				{isDraggingOver && (
					<div className="absolute inset-0 bg-primary/10 dark:bg-primary/40/10 rounded-lg pointer-events-none z-20 flex items-center justify-center">
						<div className="bg-primary dark:bg-primary text-white px-4 py-2 rounded-lg shadow-lg">
							<Upload className="w-5 h-5 mr-2 inline" />
							Drop files here
						</div>
					</div>
				)}

				<ChatHeader onClear={clearChat} onClose={onClose} mode={mode} />

				{/* File Preview Section for Dropdown Mode */}
				{uploadedFiles.length > 0 && (
					<div className="border-b border-border dark:border-border p-3 bg-gray-50 dark:bg-card">
						<div className="flex items-center justify-between mb-2">
							<h4 className="text-sm font-medium text-foreground dark:text-white">Attached Files</h4>
							<Button variant="ghost" size="sm" onClick={() => uploadedFiles.forEach((file) => removeFile(file.id))} className="text-xs text-muted-foreground hover:text-destructive">
								Clear All
							</Button>
						</div>
						<div className="grid grid-cols-2 gap-2">
							{uploadedFiles.map((file) => (
								<div key={file.id} className="relative group bg-white dark:bg-card border border-border dark:border-border rounded-lg p-2 flex items-center gap-2">
									{file.type.startsWith("image/") ? (
										<Image src={file.preview} alt={file.name} width={32} height={32} className="w-8 h-8 rounded-md object-cover" />
									) : (
										<div className="w-8 h-8 rounded-md bg-primary/10 dark:bg-primary/30 flex items-center justify-center">
											<FileText className="w-5 h-5 text-primary dark:text-primary" />
										</div>
									)}
									<div className="flex-1 min-w-0">
										<p className="text-xs font-medium text-muted-foreground dark:text-muted-foreground truncate">{file.name}</p>
										<p className="text-xs text-muted-foreground dark:text-muted-foreground">{formatFileSize(file.size)}</p>
									</div>
									<Button variant="ghost" size="icon" onClick={() => removeFile(file.id)} className="h-5 w-5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/50 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove file">
										<X className="w-3 h-3" />
									</Button>
								</div>
							))}
						</div>
					</div>
				)}

				<ScrollArea className="flex-1" ref={scrollAreaRef}>
					<div className="px-4 py-2">
						<AnimatePresence>
							{messages.map((msg) => (
								<Message key={msg.id} message={msg} />
							))}
						</AnimatePresence>
						{isLoading && (
							<div className="flex items-center justify-center p-4">
								<Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
							</div>
						)}
						{error && <div className="text-center text-destructive p-4">{error}</div>}
					</div>
				</ScrollArea>

				{/* Chat Input for Dropdown Mode */}
				<ChatInput input={input} setInput={setInput} handleSubmit={handleSubmit} handleFileUpload={handleFileUpload} isLoading={isLoading} stopGenerating={stopGenerating} mode={mode} uploadedFiles={uploadedFiles} removeFile={removeFile} />
			</div>
		);
	}

	// In sidebar mode, render the full version with input
	return (
		<div className={`flex flex-col h-full bg-white dark:bg-neutral-900 border-l border-border dark:border-border shadow-2xl transition-all duration-200 ${isDraggingOver ? "border-l-blue-500 bg-blue-50/50 dark:bg-primary/10 shadow-blue-500/20 shadow-xl" : ""}`} {...dragHandlers}>
			{/* Drag overlay indicator */}
			{isDraggingOver && (
				<div className="absolute inset-0 bg-primary/10 dark:bg-primary/40/10 pointer-events-none z-20 flex items-center justify-center">
					<div className="bg-primary dark:bg-primary text-white px-4 py-2 rounded-lg shadow-lg">
						<Upload className="w-5 h-5 mr-2 inline" />
						Drop files here
					</div>
				</div>
			)}

			<ChatHeader onClear={clearChat} onClose={onClose} mode={mode} />

			<ScrollArea className="flex-1" ref={scrollAreaRef}>
				<div className="px-4 py-2">
					<AnimatePresence>
						{messages.map((msg) => (
							<Message key={msg.id} message={msg} />
						))}
					</AnimatePresence>
					{isLoading && (
						<div className="flex items-center justify-center p-4">
							<Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
						</div>
					)}
					{error && <div className="text-center text-destructive p-4">{error}</div>}
				</div>
			</ScrollArea>

			<ChatInput input={input} setInput={setInput} handleSubmit={handleSubmit} handleFileUpload={handleFileUpload} isLoading={isLoading} stopGenerating={stopGenerating} mode={mode} uploadedFiles={uploadedFiles} removeFile={removeFile} />
		</div>
	);
});

UnifiedAIChat.displayName = "UnifiedAIChat";

export default UnifiedAIChat;
