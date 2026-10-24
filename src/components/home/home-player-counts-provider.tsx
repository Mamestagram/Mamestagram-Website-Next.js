"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { HomePlayerCounts } from "@/database/home";
import { isHomePlayerCounts } from "@/lib/home-player-counts";

const PlayerCountsContext = createContext<HomePlayerCounts | null>(null);
const REFRESH_INTERVAL = 30_000;

export const useHomePlayerCounts = () => useContext(PlayerCountsContext);

export default function HomePlayerCountsProvider({ initialCounts, children }: Readonly<{
	initialCounts: HomePlayerCounts | null;
	children: ReactNode;
}>) {
	const [counts, setCounts] = useState(initialCounts);

	useEffect(() => {
		let request: AbortController | null = null;
		let lastRequestedAt = Date.now();
		const refresh = async () => {
			if (document.visibilityState !== "visible" || request
				|| Date.now() - lastRequestedAt < REFRESH_INTERVAL) return;
			lastRequestedAt = Date.now();
			const controller = new AbortController();
			request = controller;
			const timeout = window.setTimeout(() => controller.abort(), 8000);
			try {
				const response = await fetch("/api/player-counts", {
					cache: "no-store",
					headers: { Accept: "application/json" },
					signal: controller.signal
				});
				if (!response.ok) return;
				const data: unknown = await response.json();
				if (!controller.signal.aborted && typeof data === "object" && data !== null
					&& "counts" in data && isHomePlayerCounts(data.counts)) setCounts(data.counts);
			} catch {
				// Keep the last successful counts when the connection is unavailable.
			} finally {
				window.clearTimeout(timeout);
				request = null;
			}
		};
		const onVisibilityChange = () => { void refresh(); };
		const interval = window.setInterval(() => { void refresh(); }, REFRESH_INTERVAL);
		document.addEventListener("visibilitychange", onVisibilityChange);
		return () => {
			window.clearInterval(interval);
			document.removeEventListener("visibilitychange", onVisibilityChange);
			request?.abort();
		};
	}, []);

	return <PlayerCountsContext.Provider value={counts}>{children}</PlayerCountsContext.Provider>;
}
