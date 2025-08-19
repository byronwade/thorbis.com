"use client";

import { useCallback, useMemo, useState } from "react";

const impactColor = (impact) => {
	switch (impact) {
		case "critical":
			return "bg-destructive/20 text-destructive dark:bg-destructive/40 dark:text-destructive/90";
		case "serious":
			return "bg-warning/20 text-warning dark:bg-warning/40 dark:text-warning/90";
		case "moderate":
			return "bg-warning/20 text-warning dark:bg-warning/40 dark:text-warning/90";
		case "minor":
			return "bg-primary/20 text-primary dark:bg-primary/40 dark:text-primary/90";
		default:
			return "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300";
	}
};

export default function AxeAuditClient() {
	const [status, setStatus] = useState("idle");
	const [results, setResults] = useState(null);
	const [filterImpact, setFilterImpact] = useState("all");

	const runAudit = useCallback(async () => {
		try {
			setStatus("running");
			setResults(null);
			
			// Safe dynamic import with fallback
			let axe;
			try {
				const axeModule = await import("axe-core");
				axe = axeModule.default || axeModule;
			} catch (importError) {
				console.warn("axe-core not available:", importError);
				setStatus("error");
				setResults({ error: "axe-core module not available" });
				return;
			}
			
			if (!axe || typeof axe.run !== 'function') {
				console.warn("axe-core not properly loaded");
				setStatus("error");
				setResults({ error: "axe-core not properly loaded" });
				return;
			}
			
			const res = await axe.run(document, { resultTypes: ["violations", "incomplete"] });
			setResults(res);
			setStatus("done");
			console.info("[axe] violations:", res.violations);
		} catch (e) {
			console.warn("[axe] failed:", e);
			setStatus("error");
		}
	}, []);

	const filteredViolations = useMemo(() => {
		if (!results?.violations) return [];
		if (filterImpact === "all") return results.violations;
		return results.violations.filter((v) => v.impact === filterImpact);
	}, [results, filterImpact]);

	// Early return after all hooks are defined
	if (process.env.NODE_ENV === "production") return null;

	const copyJson = () => {
		try {
			navigator.clipboard.writeText(JSON.stringify(results, null, 2));
		} catch {}
	};

	return (
		<div className="mt-2 text-[11px] text-zinc-700 dark:text-zinc-300">
			<div className="flex flex-wrap items-center gap-2">
				<button type="button" className="rounded border px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={runAudit}>
					{status === "running" ? "Running a11y audit…" : "Run a11y audit (axe-core)"}
				</button>
				{results && (
					<>
						<span className="ml-1">Violations: {results.violations?.length ?? 0}</span>
						<span>Incomplete: {results.incomplete?.length ?? 0}</span>
						<label className="ml-2 inline-flex items-center gap-1">
							Impact
							<select className="rounded border bg-transparent px-1 py-0.5" value={filterImpact} onChange={(e) => setFilterImpact(e.target.value)}>
								<option value="all">all</option>
								<option value="critical">critical</option>
								<option value="serious">serious</option>
								<option value="moderate">moderate</option>
								<option value="minor">minor</option>
							</select>
						</label>
						<button type="button" className="rounded border px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={copyJson}>
							Copy JSON
						</button>
					</>
				)}
			</div>

			{filteredViolations.length > 0 && (
				<div className="mt-2 space-y-2">
					{filteredViolations.map((v) => (
						<details key={v.id} className="rounded border p-2">
							<summary className="cursor-pointer">
								<span className={`mr-2 inline-flex items-center rounded px-1 ${impactColor(v.impact)}`}>{v.impact || "n/a"}</span>
								<span className="font-semibold">{v.id}</span>
								<span className="ml-2 text-zinc-500">{v.description}</span>
								{v.helpUrl && (
									<a className="ml-2 underline text-primary dark:text-primary" href={v.helpUrl} target="_blank" rel="noreferrer">
										docs
									</a>
								)}
								<span className="ml-2 text-zinc-500">nodes: {v.nodes?.length || 0}</span>
							</summary>
							{v.nodes?.length > 0 && (
								<div className="mt-2 space-y-2">
									{v.nodes.map((n, i) => (
										<div key={i} className="rounded border p-2">
											{n.target?.length > 0 && (
												<div className="text-zinc-500">
													target: <span className="text-zinc-700 dark:text-zinc-200">{n.target.join(" ")}</span>
												</div>
											)}
											{n.html && <pre className="mt-1 max-h-24 overflow-auto rounded bg-zinc-100 p-2 dark:bg-zinc-800 whitespace-pre-wrap break-all">{n.html}</pre>}
											{n.failureSummary && <div className="mt-1 text-zinc-500">{n.failureSummary}</div>}
										</div>
									))}
								</div>
							)}
						</details>
					))}
				</div>
			)}

			{results?.incomplete?.length > 0 && (
				<details className="mt-3 rounded border p-2">
					<summary className="cursor-pointer font-semibold">Incomplete checks ({results.incomplete.length})</summary>
					<div className="mt-2 space-y-2">
						{results.incomplete.map((v) => (
							<details key={v.id} className="rounded border p-2">
								<summary className="cursor-pointer">
									<span className="mr-2 inline-flex items-center rounded bg-zinc-200 px-1 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">incomplete</span>
									<span className="font-semibold">{v.id}</span>
									<span className="ml-2 text-zinc-500">{v.description}</span>
									{v.helpUrl && (
										<a className="ml-2 underline text-primary dark:text-primary" href={v.helpUrl} target="_blank" rel="noreferrer">
											docs
										</a>
									)}
									<span className="ml-2 text-zinc-500">nodes: {v.nodes?.length || 0}</span>
								</summary>
								{v.nodes?.length > 0 && (
									<div className="mt-2 space-y-2">
										{v.nodes.map((n, i) => (
											<div key={i} className="rounded border p-2">
												{n.target?.length > 0 && (
													<div className="text-zinc-500">
														target: <span className="text-zinc-700 dark:text-zinc-200">{n.target.join(" ")}</span>
													</div>
												)}
												{n.html && <pre className="mt-1 max-h-24 overflow-auto rounded bg-zinc-100 p-2 dark:bg-zinc-800 whitespace-pre-wrap break-all">{n.html}</pre>}
												{n.failureSummary && <div className="mt-1 text-zinc-500">{n.failureSummary}</div>}
											</div>
										))}
									</div>
								)}
							</details>
						))}
					</div>
				</details>
			)}
		</div>
	);
}
