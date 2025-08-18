"use client";
import React, { useState } from "react";
import { Button } from "@components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { useLanguageSwitcher } from "@lib/i18n/enhanced-client";
import { ChevronDown, Globe } from "lucide-react";

export default function LanguageSelector() {
	const { currentLanguage, locale, languages, switchLanguage, isChanging } = useLanguageSwitcher();
	const [open, setOpen] = useState(false);

	const handleLanguageChange = async (newLocale) => {
		await switchLanguage(newLocale);
		setOpen(false);
	};

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" className="text-white bg-white/10 border-white/30 hover:bg-blue-500/30 hover:border-blue-400 flex items-center gap-2" disabled={isChanging}>
					<Globe className="w-4 h-4" />
					<span className="hidden sm:inline">{currentLanguage?.flag}</span>
					<span className="hidden md:inline">{currentLanguage?.name}</span>
					<ChevronDown className="w-4 h-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl rounded-xl">
				{Object.entries(languages || {}).map(([code, lang]) => (
					<DropdownMenuItem key={code} onClick={() => handleLanguageChange(code)} className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${locale === code ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50 text-gray-700"}`}>
						<span className="text-lg">{lang.flag}</span>
						<span className="flex-1">{lang.name}</span>
						{locale === code && <span className="text-blue-600 text-sm">✓</span>}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
