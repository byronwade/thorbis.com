import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Button } from "@components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form";
import { Input } from "@components/ui/input";

export default function UserAddress() {
	const { control } = useFormContext();
	const { fields, append, remove } = useFieldArray({
		control,
		name: "userAddress.additionalAddresses",
	});

	return (
		<>
			<h2 className="mb-1 text-2xl font-bold leading-9 text-left">User Address Information</h2>
			<p className="text-sm leading-6 text-left text-muted-foreground">Complete the form below to provide your address information.</p>
			<div className="flex flex-col mt-6 space-y-6">
				<FormField
					control={control}
					name="userAddress.street"
					render={({ field, fieldState }) => (
						<FormItem>
							<FormLabel>
								Street <span className="text-destructive">*</span>
							</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage>{fieldState.error?.message}</FormMessage>
						</FormItem>
					)}
				/>
				<FormField
					control={control}
					name="userAddress.city"
					render={({ field, fieldState }) => (
						<FormItem>
							<FormLabel>
								City <span className="text-destructive">*</span>
							</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage>{fieldState.error?.message}</FormMessage>
						</FormItem>
					)}
				/>
				<div className="flex space-x-4">
					<FormField
						control={control}
						name="userAddress.state"
						render={({ field, fieldState }) => (
							<FormItem className="flex-1">
								<FormLabel>
									State <span className="text-destructive">*</span>
								</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage>{fieldState.error?.message}</FormMessage>
							</FormItem>
						)}
					/>
					<FormField
						control={control}
						name="userAddress.zip"
						render={({ field, fieldState }) => (
							<FormItem className="flex-1">
								<FormLabel>
									ZIP Code <span className="text-destructive">*</span>
								</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage>{fieldState.error?.message}</FormMessage>
							</FormItem>
						)}
					/>
				</div>
				{fields.map((item, index) => (
					<div key={item.id} className="space-y-6">
						<h3 className="text-lg font-medium">Additional Address {index + 1}</h3>
						<FormField
							control={control}
							name={`userAddress.additionalAddresses.${index}.street`}
							render={({ field, fieldState }) => (
								<FormItem>
									<FormLabel>
										Street <span className="text-destructive">*</span>
									</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage>{fieldState.error?.message}</FormMessage>
								</FormItem>
							)}
						/>
						<FormField
							control={control}
							name={`userAddress.additionalAddresses.${index}.city`}
							render={({ field, fieldState }) => (
								<FormItem>
									<FormLabel>
										City <span className="text-destructive">*</span>
									</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage>{fieldState.error?.message}</FormMessage>
								</FormItem>
							)}
						/>
						<div className="flex space-x-4">
							<FormField
								control={control}
								name={`userAddress.additionalAddresses.${index}.state`}
								render={({ field, fieldState }) => (
									<FormItem className="flex-1">
										<FormLabel>
											State <span className="text-destructive">*</span>
										</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage>{fieldState.error?.message}</FormMessage>
									</FormItem>
								)}
							/>
							<FormField
								control={control}
								name={`userAddress.additionalAddresses.${index}.zip`}
								render={({ field, fieldState }) => (
									<FormItem className="flex-1">
										<FormLabel>
											ZIP Code <span className="text-destructive">*</span>
										</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage>{fieldState.error?.message}</FormMessage>
									</FormItem>
								)}
							/>
						</div>
						<div className="flex justify-between space-x-4">
							<Button variant="destructive" type="button" onClick={() => remove(index)} className="mt-2 ml-auto">
								Remove Address
							</Button>
						</div>
					</div>
				))}
				{fields.length < 1 && (
					<Button type="button" variant="outline" onClick={() => append({ street: "", city: "", state: "", zip: "" })} className="mt-2">
						Add Additional Address
					</Button>
				)}
			</div>
		</>
	);
}
