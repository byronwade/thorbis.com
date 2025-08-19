"use client";

export default function DevToolsActions() {
	return (
		<div className="rounded border p-3">
			<div className="font-semibold mb-2">Overlays</div>
			<button
				type="button"
				className="rounded border px-2 py-1 mr-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
				onClick={() => {
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
				}}
			>
				Toggle Grid
			</button>
			<a className="rounded border px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800" href="#dev-route-index">
				Jump to Routes
			</a>
		</div>
	);
}
