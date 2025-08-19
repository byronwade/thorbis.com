"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

export default function LocalHubClient() {
    const prefersReducedMotion = useReducedMotion();

	const fadeIn = {
		hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 12 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.35, ease: "easeOut" },
		},
	};

	const tap = { scale: prefersReducedMotion ? 1 : 0.98 };

    return (
		<div className="md:hidden w-full px-4 py-10 bg-white dark:bg-neutral-900">
			{/* Mobile: Quick CTA */}
			<motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeIn} className="text-center space-y-4">
				<h2 className="text-2xl font-semibold">Get started in minutes</h2>
				<p className="text-sm text-muted-foreground">Create your directory, invite businesses, and start monetizing.</p>
				<div className="flex items-center justify-center gap-3">
					<motion.a whileTap={tap} href="/signup" className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-white font-semibold">
						Start free
					</motion.a>
					<motion.a whileTap={tap} href="#pricing" className="inline-flex items-center rounded-md border px-4 py-2 font-semibold">
						View pricing
					</motion.a>
				</div>
			</motion.div>

			{/* Mobile: Feature chips */}
			<div className="mt-8 grid grid-cols-2 gap-3">
				{[{ label: "Featured listings" }, { label: "Category sponsors" }, { label: "Leads & caps" }, { label: "SEO pages" }].map((c) => (
					<motion.div key={c.label} initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.25 }} className="rounded-md border bg-card px-3 py-2 text-sm text-center">
						{c.label}
					</motion.div>
				))}
			</div>

			{/* Mobile: horizontally scrollable cards */}
			<div className="mt-10 overflow-x-auto scrollbar-none">
				<div className="flex gap-4 snap-x snap-mandatory px-1">
					{[1, 2, 3, 4].map((i) => (
						<motion.div key={i} whileTap={tap} className="min-w-[240px] snap-center rounded-xl border bg-card p-4">
							<div className="h-28 w-full overflow-hidden rounded-lg bg-white dark:bg-black flex items-center justify-center">
								<Image src={i % 2 ? "/placeholder-business.svg" : "/placeholder-auto.svg"} alt="preview" width={320} height={160} className="h-full w-auto object-contain" />
							</div>
							<div className="mt-3 font-medium">Module {i}</div>
							<div className="text-xs text-muted-foreground">Enable and customize to fit your brand.</div>
						</motion.div>
					))}
				</div>
			</div>

			{/* Mobile: compact pricing */}
			<motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeIn} className="mt-10 grid grid-cols-1 gap-4">
				{["$9/mo", "$17/mo", "$29/mo"].map((p, idx) => (
					<div key={p} className={`rounded-lg border p-4 ${idx === 1 ? "border-2" : ""}`}>
						<div className="text-xl font-semibold">{p}</div>
						<div className="mt-1 text-sm text-muted-foreground">{idx === 0 ? "Essential tools" : idx === 1 ? "Advanced features" : "Unlimited potential"}</div>
						<div className="mt-3 flex items-center gap-2">
							<span className="text-success">✓</span>
							<span className="text-sm">Premium listings & sponsors</span>
						</div>
						<motion.a whileTap={tap} href="/signup" className={`mt-4 inline-flex w-full items-center justify-center rounded-md ${idx === 1 ? "bg-primary text-white" : "border"} px-3 py-2 font-medium`}>
							Choose plan
						</motion.a>
					</div>
				))}
			</motion.div>
		</div>
	);
}
