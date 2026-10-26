"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import ReplayViewer from "@/components/replay-viewer";
import { parseReplayId } from "@/lib/replay-share";

export default function BeatmapSharedReplayViewer({ scoreId, beatmapHref, label, replayUrl }: Readonly<{
	scoreId: number;
	beatmapHref: string;
	label: string;
	replayUrl: string;
}>) {
	const searchParams = useSearchParams();
	const sharedParams = new URLSearchParams(searchParams.toString());
	sharedParams.set("replay", String(scoreId));
	const close = useCallback(() => {
		const url = new URL(window.location.href);
		if (url.pathname !== beatmapHref || parseReplayId(url.searchParams.get("replay")) !== scoreId) return;
		url.searchParams.delete("replay");
		window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
	}, [beatmapHref, scoreId]);
	return <ReplayViewer label={label} replayUrl={replayUrl} buttonLabel="Watch shared replay" hideTrigger
		autoOpen={parseReplayId(searchParams.get("replay")) === scoreId} onClose={close}
		shareHref={`${beatmapHref}?${sharedParams}`}>{null}</ReplayViewer>;
}
