// components/FilterDropdown.js
import React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from "@components/ui/dropdown-menu";
import { ChevronRight, ChevronDown, X, Star, Clock, DollarSign } from "react-feather";
import { Button } from "@components/ui/button";
import { FunnelIcon } from "@heroicons/react/24/solid";

const FilterDropdown = () => {
	return (
		<DropdownMenu>
			<div className="relative flex items-center">
				<DropdownMenuTrigger asChild>
					<Button className="relative flex items-center justify-center h-8 gap-2 px-2 py-2 text-sm font-medium transition-colors bg-card rounded-md select-none shrink-0 whitespace-nowrap focus-visible:outline-none focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 focus-visible:bg-card focus-visible:ring-0 hover:bg-muted/70 text-white/70 focus-within:bg-muted hover:text-white sm:px-3" type="button">
						<FunnelIcon className="w-4 h-4" />
						<span className="hidden sm:block">Filters</span>
						<ChevronDown className="w-4 h-4" />
					</Button>
				</DropdownMenuTrigger>
				<div className="absolute right-0 flex items-center justify-center h-full pr-1.5">
					<Button size="icon" className="w-5 h-5">
						<X className="w-4 h-4" />
					</Button>
				</div>
			</div>
			<DropdownMenuContent className="w-80">
				<DropdownMenuLabel>Filter Options</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem asChild>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<DropdownMenuItem className="flex items-center gap-3 py-2.5">
									<div className="w-8 h-8 rounded-lg bg-warning/10 dark:bg-warning/30 flex items-center justify-center">
										<Star className="w-4 h-4 text-warning dark:text-warning" />
									</div>
									<div className="flex flex-col">
										<span className="text-sm font-medium">Ratings</span>
										<span className="text-xs text-muted-foreground">Filter by star rating</span>
									</div>
									<ChevronRight className="w-4 h-4 ml-auto opacity-60" />
								</DropdownMenuItem>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-64">
								<DropdownMenuLabel>Star Ratings</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuGroup>
									<DropdownMenuCheckboxItem>1 Star & Above</DropdownMenuCheckboxItem>
									<DropdownMenuCheckboxItem>2 Stars & Above</DropdownMenuCheckboxItem>
									<DropdownMenuCheckboxItem>3 Stars & Above</DropdownMenuCheckboxItem>
									<DropdownMenuCheckboxItem>4 Stars & Above</DropdownMenuCheckboxItem>
									<DropdownMenuCheckboxItem>5 Stars</DropdownMenuCheckboxItem>
								</DropdownMenuGroup>
							</DropdownMenuContent>
						</DropdownMenu>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<DropdownMenuItem className="flex items-center gap-3 py-2.5">
									<div className="w-8 h-8 rounded-lg bg-success/10 dark:bg-success/30 flex items-center justify-center">
										<Clock className="w-4 h-4 text-success dark:text-success" />
									</div>
									<div className="flex flex-col">
										<span className="text-sm font-medium">Hours Open</span>
										<span className="text-xs text-muted-foreground">Filter by availability</span>
									</div>
									<ChevronRight className="w-4 h-4 ml-auto opacity-60" />
								</DropdownMenuItem>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-64">
								<DropdownMenuLabel>Availability</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuGroup>
									<DropdownMenuCheckboxItem>Open Now</DropdownMenuCheckboxItem>
									<DropdownMenuCheckboxItem>Open 24/7</DropdownMenuCheckboxItem>
								</DropdownMenuGroup>
							</DropdownMenuContent>
						</DropdownMenu>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<DropdownMenuItem className="flex items-center gap-3 py-2.5">
									<div className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/30 flex items-center justify-center">
										<DollarSign className="w-4 h-4 text-primary dark:text-primary" />
									</div>
									<div className="flex flex-col">
										<span className="text-sm font-medium">Price</span>
										<span className="text-xs text-muted-foreground">Filter by price range</span>
									</div>
									<ChevronRight className="w-4 h-4 ml-auto opacity-60" />
								</DropdownMenuItem>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-64">
								<DropdownMenuLabel>Price Range</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuGroup>
									<DropdownMenuCheckboxItem>$</DropdownMenuCheckboxItem>
									<DropdownMenuCheckboxItem>$$</DropdownMenuCheckboxItem>
									<DropdownMenuCheckboxItem>$$$</DropdownMenuCheckboxItem>
									<DropdownMenuCheckboxItem>$$$$</DropdownMenuCheckboxItem>
								</DropdownMenuGroup>
							</DropdownMenuContent>
						</DropdownMenu>
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default FilterDropdown;
