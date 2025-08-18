import React from "react";
import { useFormContext } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form";
import { Input } from "@components/ui/input";

export default function UserProfile() {
	const { control } = useFormContext();

	return (
		<>
			<h2 className="mb-1 text-2xl font-bold leading-9 text-left">User Profile</h2>
			<p className="text-sm leading-6 text-left text-muted-foreground">Complete the form below to add your profile picture and username.</p>
			<div className="flex flex-col mt-6 space-y-6">
				<FormField
					control={control}
					name="userProfile.image"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Profile Picture</FormLabel>
							<FormControl>
								<div className="flex items-center space-x-4">
									<Avatar className="w-16 h-16">
										<AvatarImage src={field.value ? URL.createObjectURL(field.value) : "https://github.com/shadcn.png"} alt="Profile" />
										<AvatarFallback className="text-2xl rounded-md">CN</AvatarFallback>
									</Avatar>
									<label htmlFor="image-upload" className="p-2 text-sm">
										<span className="text-primary">Click here to add image</span>
										<input id="image-upload" type="file" accept="image/*" className="hidden" onChange={(e) => field.onChange(e.target.files[0])} />
									</label>
								</div>
							</FormControl>
							<FormMessage>{field.error?.message}</FormMessage>
						</FormItem>
					)}
				/>
				<FormField
					control={control}
					name="userProfile.username"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
																	Username <span className="text-destructive">*</span>
							</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage>{field.error?.message}</FormMessage>
						</FormItem>
					)}
				/>
			</div>
		</>
	);
}
