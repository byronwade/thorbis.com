"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { Button } from "@components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuItem } from "@components/ui/dropdown-menu";

export default function ThemeToggle() {
	const { theme, setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const [primaryColor, setPrimaryColor] = useState("theme-default");

	useEffect(() => {
		setMounted(true);
		// Load saved primary color from localStorage
		const savedColor = localStorage.getItem("theme-color");
		if (savedColor) {
			setPrimaryColor(savedColor);
		}
	}, []);

	if (!mounted) {
		return null;
	}

	const handleModeChange = (mode) => {
		setTheme(mode);
		// Remove manual class manipulation - let next-themes handle it
	};

	const handlePrimaryColorChange = (color) => {
		setPrimaryColor(color);
		// Store in localStorage for persistence if needed
		localStorage.setItem("theme-color", color);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button className="relative h-7 w-7 rounded-md p-0 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 transition-colors hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50">
					<SunIcon className="h-3.5 w-3.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-foreground" />
					<MoonIcon className="absolute h-3.5 w-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-foreground" />
					<span className="sr-only">Toggle theme</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="z-[10001]">
				<DropdownMenuLabel>Theme Mode</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={() => handleModeChange("dark")}>Dark (Default)</DropdownMenuItem>
				<DropdownMenuItem onClick={() => handleModeChange("light")}>Light</DropdownMenuItem>
				<DropdownMenuItem onClick={() => handleModeChange("system")}>System</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuLabel>Primary Color</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuRadioGroup value={primaryColor} onValueChange={handlePrimaryColorChange}>
					<DropdownMenuRadioItem value="theme-default">Default</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="theme-green">Green</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="theme-blue">Blue</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="theme-red">Red</DropdownMenuRadioItem>
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
