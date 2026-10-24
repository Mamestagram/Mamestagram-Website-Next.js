"use client";

import RollingNumber from "@/components/rolling-number";
import { useHomePlayerCounts } from "@/components/home/home-player-counts-provider";
import type { HomePlayerCounts } from "@/database/home";

export default function HomePlayerCount({ kind }: Readonly<{ kind: keyof HomePlayerCounts }>) {
	const counts = useHomePlayerCounts();
	return <RollingNumber value={counts?.[kind] ?? null}/>;
}
