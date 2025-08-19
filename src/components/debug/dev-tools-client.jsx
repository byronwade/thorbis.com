"use client";

import React, { useEffect, useMemo, useState } from "react";
import RequestToolsClient from "@components/debug/request-tools-client";
import AxeAuditClient from "@components/debug/axe-audit-client";

export default function DevToolsClient() {
	const [isOnline, setIsOnline] = useState(true);
	const [viewport, setViewport] = useState({ w: 0, h: 0 });
	const [navTiming, setNavTiming] = useState(null);
	const [flags, setFlags] = useState({});
	const [flagEdits, setFlagEdits] = useState({});
	const [webVitals, setWebVitals] = useState(null);
	const [reactScanOn, setReactScanOn] = useState(false);
	const [profilerOn, setProfilerOn] = useState(() => {
		if (typeof window === "undefined") return false;
		return window.localStorage?.getItem("profiler") === "1";
	});
	useEffect(() => {
		const handler = () => {
			const wv = window.__webVitals;
			if (wv && (wv.LCP || wv.CLS || wv.FID || wv.INP || wv.TTFB)) {
				setWebVitals({ LCP: wv.LCP, CLS: wv.CLS, FID: wv.FID, INP: wv.INP, TTFB: wv.TTFB });
			}
		};
		window.addEventListener("web-vitals-update", handler);
		return () => window.removeEventListener("web-vitals-update", handler);
	}, []);

	useEffect(() => {
		setIsOnline(navigator.onLine);
		const handleOnline = () => setIsOnline(true);
		const handleOffline = () => setIsOnline(false);
		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);
		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);

	useEffect(() => {
		const updateViewport = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
		updateViewport();
		window.addEventListener("resize", updateViewport);
		return () => window.removeEventListener("resize", updateViewport);
	}, []);

	// React Scan toggle helpers
	useEffect(() => {
		const current = typeof window !== "undefined" && window.__REACT_SCAN__ && window.__REACT_SCAN__.enabled === true;
		if (current) setReactScanOn(true);
	}, []);

	const loadReactScan = () => {
		return new Promise((resolve) => {
			if (typeof window === "undefined") return resolve(false);
			if (window.__REACT_SCAN__) return resolve(true);
			const id = "react-scan-script";
			if (document.getElementById(id)) {
				setTimeout(() => resolve(!!window.__REACT_SCAN__), 300);
				return;
			}
			const s = document.createElement("script");
			s.id = id;
			s.src = "https://unpkg.com/react-scan/dist/auto.global.js";
			s.async = true;
			s.onload = () => resolve(!!window.__REACT_SCAN__);
			s.onerror = () => resolve(false);
			document.head.appendChild(s);
		});
	};

	const toggleReactScan = async () => {
		if (reactScanOn) {
			try {
				window.__REACT_SCAN__?.disable?.();
			} catch {}
			setReactScanOn(false);
			return;
		}
		const ok = await loadReactScan();
		if (ok) {
			try {
				window.__REACT_SCAN__?.enable?.();
			} catch {}
			setReactScanOn(true);
		}
	};

	const toggleProfiler = () => {
		const next = !profilerOn;
		setProfilerOn(next);
		try {
			window.localStorage?.setItem("profiler", next ? "1" : "0");
		} catch {}
		window.dispatchEvent(new CustomEvent("dev-profiler-toggle", { detail: { on: next } }));
	};

	useEffect(() => {
		try {
			const nav = performance.getEntriesByType("navigation")[0];
			if (nav) {
				setNavTiming({
					ttfb: Math.max(0, nav.responseStart - nav.requestStart),
					domContentLoaded: Math.max(0, nav.domContentLoadedEventEnd - nav.startTime),
					loadEvent: Math.max(0, nav.loadEventEnd - nav.startTime),
				});
			}
		} catch {}
	}, []);

	// Optional Core Web Vitals if exposed on window.__webVitals
	useEffect(() => {
		if (typeof window === "undefined") return;
		const wv = window.__webVitals;
		if (wv && (wv.LCP || wv.CLS || wv.FID || wv.INP || wv.TTFB)) {
			setWebVitals({ LCP: wv.LCP, CLS: wv.CLS, FID: wv.FID, INP: wv.INP, TTFB: wv.TTFB });
		}
	}, []);

	useEffect(() => {
		const el = document.querySelector("[data-flags]");
		try {
			const json = el?.getAttribute("data-flags");
			if (json) setFlags(JSON.parse(json));
			else {
				setFlags({
					newNavigation: document.querySelector("[data-flag-new-navigation]")?.getAttribute("data-flag-new-navigation") === "1",
					linkedinClone: document.querySelector("[data-flag-linkedin-clone]")?.getAttribute("data-flag-linkedin-clone") === "1",
					jobsApp: document.querySelector("[data-flag-jobs-app]")?.getAttribute("data-flag-jobs-app") === "1",
					affiliates: document.querySelector("[data-flag-affiliates]")?.getAttribute("data-flag-affiliates") === "1",
					landingPages: document.querySelector("[data-flag-landing-pages]")?.getAttribute("data-flag-landing-pages") === "1",
					businessCertification: document.querySelector("[data-flag-business-certification]")?.getAttribute("data-flag-business-certification") === "1",
					investorRelations: document.querySelector("[data-flag-investor-relations]")?.getAttribute("data-flag-investor-relations") === "1",
					aboutUs: document.querySelector("[data-flag-about-us]")?.getAttribute("data-flag-about-us") === "1",
				});
			}
		} catch {
			// ignore
		}
	}, []);

	const persistFlagOverrides = (next) => {
		try {
			const value = encodeURIComponent(JSON.stringify(next));
			document.cookie = `dev_flag_overrides=${value}; path=/; SameSite=Lax`;
		} catch {}
	};

	const toggleFlag = (key) => {
		const nextVal = !flags[key];
		const next = { ...(flags || {}), [key]: nextVal };
		setFlags(next);
		persistFlagOverrides(next);
		// soft reload client view
		setTimeout(() => window.location.reload(), 50);
	};

	const breakpoint = useMemo(() => {
		const w = viewport.w;
		if (w >= 1536) return "2xl";
		if (w >= 1280) return "xl";
		if (w >= 1024) return "lg";
		if (w >= 768) return "md";
		return "base";
	}, [viewport.w]);

	// Early return after all hooks are defined
	if (process.env.NODE_ENV === "production") return null;

	const toggleGrid = () => {
		const id = "dev-grid-overlay";
		const existing = document.getElementById(id);
		if (existing) {
			existing.remove();
			return;
		}
		const overlay = document.createElement("div");
		overlay.id = id;
		overlay.style.position = "fixed";
		overlay.style.inset = "0";
		overlay.style.pointerEvents = "none";
		overlay.style.zIndex = "99999";
		overlay.style.backgroundImage = "linear-gradient(hsl(var(--muted-foreground) / 0.15) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--muted-foreground) / 0.15) 1px, transparent 1px)";
		overlay.style.backgroundSize = "8px 8px, 8px 8px";
		document.body.appendChild(overlay);
	};

	const toggleFocusOutlines = () => {
		const id = "dev-focus-overlay";
		const existing = document.getElementById(id);
		if (existing) {
			existing.remove();
			return;
		}
		const style = document.createElement("style");
		style.id = id;
		style.innerHTML = `
      *:focus { outline: 2px solid hsl(var(--primary)) !important; outline-offset: 2px !important; }
      a, button { outline: 1px dashed hsl(var(--primary) / 0.7) !important; }
    `;
		document.head.appendChild(style);
	};

	const toggleNoMotion = () => {
		const id = "dev-no-motion";
		const existing = document.getElementById(id);
		if (existing) {
			existing.remove();
			return;
		}
		const style = document.createElement("style");
		style.id = id;
		style.innerHTML = `* { transition: none !important; animation: none !important; scroll-behavior: auto !important; }`;
		document.head.appendChild(style);
	};

	return (
		<div id="dev-tools" className="w-full border-t bg-zinc-50 dark:bg-zinc-900/40">
			<div className="container mx-auto px-4 py-3 text-xs text-zinc-700 dark:text-zinc-300">
				<details>
					<summary className="cursor-pointer font-semibold">Developer Tools</summary>
					<div className="mt-2 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
						<div className="rounded border p-3">
							<div className="font-semibold mb-1">Environment</div>
							<div>NODE_ENV: {process.env.NODE_ENV}</div>
						</div>
						<div className="rounded border p-3">
							<div className="font-semibold mb-1">Connection</div>
							<div>online: {String(isOnline)}</div>
						</div>
						<div className="rounded border p-3">
							<div className="font-semibold mb-1">Viewport</div>
							<div>
								size: {viewport.w}×{viewport.h}
							</div>
							<div>
								breakpoint: <span className="inline-block rounded bg-zinc-200 px-1 dark:bg-zinc-800">{breakpoint}</span>
							</div>
						</div>
						<div className="rounded border p-3">
							<div className="font-semibold mb-1">Flags</div>
							<div className="grid grid-cols-2 gap-1">
								{Object.keys(flags || {}).length > 0 ? (
									Object.entries(flags).map(([k, v]) => (
										<div key={k} className="flex items-center justify-between gap-2">
											<span className="truncate mr-2" title={k}>
												{k}
											</span>
											<button type="button" onClick={() => toggleFlag(k)} className={`rounded border px-2 py-0.5 text-[10px] ${v ? "bg-success/20 text-success dark:bg-success/40 dark:text-success/90" : "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"}`}>
												{v ? "on" : "off"}
											</button>
										</div>
									))
								) : (
									<span>no flags</span>
								)}
							</div>
							<div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">Toggles set a dev cookie and reload to apply on SSR.</div>
						</div>
						<div className="rounded border p-3">
							<div className="font-semibold mb-1">Navigation Timing</div>
							{navTiming ? (
								<div className="grid grid-cols-3 gap-2">
									<div>TTFB: {Math.round(navTiming.ttfb)}ms</div>
									<div>DCL: {Math.round(navTiming.domContentLoaded)}ms</div>
									<div>Load: {Math.round(navTiming.loadEvent)}ms</div>
								</div>
							) : (
								<div>no data</div>
							)}
						</div>
						<div className="rounded border p-3">
							<div className="font-semibold mb-1">Core Web Vitals</div>
							{webVitals ? (
								<div className="grid grid-cols-5 gap-2">
									<div>LCP: {webVitals.LCP ?? "n/a"}</div>
									<div>CLS: {webVitals.CLS ?? "n/a"}</div>
									<div>FID: {webVitals.FID ?? "n/a"}</div>
									<div>INP: {webVitals.INP ?? "n/a"}</div>
									<div>TTFB: {webVitals.TTFB ?? "n/a"}</div>
								</div>
							) : (
								<div>no data</div>
							)}
						</div>
						<div className="rounded border p-3">
							<div className="font-semibold mb-2">Overlays</div>
							<button type="button" className="rounded border px-2 py-1 mr-2 hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={toggleGrid}>
								Toggle Grid
							</button>
							<button type="button" className="rounded border px-2 py-1 mr-2 hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={toggleFocusOutlines}>
								Focus Outlines
							</button>
							<button type="button" className="rounded border px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={toggleNoMotion}>
								No Motion
							</button>
							<a className="ml-2 inline-block rounded border px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800" href="#dev-route-index">
								Routes
							</a>
						</div>
						<div className="rounded border p-3">
							<div className="font-semibold mb-2">React Profiler</div>
							<div className="flex items-center gap-2">
								<button type="button" className={`rounded border px-2 py-1 ${profilerOn ? "bg-primary/10 dark:bg-primary/30" : ""} hover:bg-zinc-100 dark:hover:bg-zinc-800`} onClick={toggleProfiler}>
									{profilerOn ? "Disable" : "Enable"} Profiler
								</button>
								<span className={`inline-flex h-4 min-w-10 items-center justify-center rounded px-1 text-[10px] ${profilerOn ? "bg-primary/20 text-primary dark:bg-primary/40 dark:text-primary/90" : "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"}`}>{profilerOn ? "on" : "off"}</span>
							</div>
							<div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">Wraps app subtree and logs render timings.</div>
						</div>
						<RequestToolsClient />
						<div className="rounded border p-3">
							<div className="font-semibold mb-2">Accessibility</div>
							<AxeAuditClient />
						</div>
						<div className="rounded border p-3">
							<div className="font-semibold mb-2">React Re-renders (React Scan)</div>
							<div className="flex items-center gap-2">
								<button type="button" className={`rounded border px-2 py-1 ${reactScanOn ? "bg-success/10 dark:bg-success/30" : ""} hover:bg-zinc-100 dark:hover:bg-zinc-800`} onClick={toggleReactScan}>
									{reactScanOn ? "Disable" : "Enable"} React Scan
								</button>
								<span className={`inline-flex h-4 min-w-10 items-center justify-center rounded px-1 text-[10px] ${reactScanOn ? "bg-success/20 text-success dark:bg-success/40 dark:text-success/90" : "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"}`}>{reactScanOn ? "on" : "off"}</span>
							</div>
							<div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">Loads from unpkg in development only.</div>
						</div>
					</div>
				</details>
			</div>
		</div>
	);
}
