export const MEDIA_PLAYBACK_EVENT = "mamestagram:media-playback";
export const REPLAY_PLAY_MESSAGE = "mamestagram:replay-play";
export const REPLAY_PAUSE_MESSAGE = "mamestagram:replay-pause";

export type MediaPlaybackSource = "preview" | "replay";

type MediaPlaybackDetail = {
	source: MediaPlaybackSource
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null;

export const announceMediaPlayback = (source: MediaPlaybackSource) => {
	window.dispatchEvent(new CustomEvent<MediaPlaybackDetail>(MEDIA_PLAYBACK_EVENT, {
		detail: { source }
	}));
};

export const getMediaPlaybackSource = (event: Event): MediaPlaybackSource | null => {
	if (!(event instanceof CustomEvent) || !isRecord(event.detail)) return null;
	const source = event.detail.source;
	return source === "preview" || source === "replay" ? source : null;
};

export const isReplayPlayMessage = (value: unknown) =>
	isRecord(value) && value.type === REPLAY_PLAY_MESSAGE;
