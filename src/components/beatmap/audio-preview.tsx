"use client";

import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import FontAwesome from "@/components/font-awesome";
import styles from "@s/beatmap.module.css";

const PREVIEW_VOLUME_STORAGE_KEY = "beatmap-preview-volume";
const MAX_PREVIEW_VOLUME = 0.5;
const FADE_IN_DURATION_MS = 900;

const getSavedPreviewVolume = () => {
	if (typeof window === "undefined") return 1;
	try {
		const storedVolume = window.localStorage.getItem(PREVIEW_VOLUME_STORAGE_KEY);
		if (storedVolume === null) return 1;
		const savedVolume = Number(storedVolume);
		return Number.isFinite(savedVolume) ? Math.min(1, Math.max(0, savedVolume)) : 1;
	}
	catch {
		return 1;
	}
};

const formatTime = (seconds: number) => {
	if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
	const minutes = Math.floor(seconds / 60);
	return `${minutes}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
};

export default function AudioPreview({ setId }: Readonly<{ setId: number }>) {
	const audioRef = useRef<HTMLAudioElement>(null);
	const fadeFrameRef = useRef<number | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [showControls, setShowControls] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [volume, setVolume] = useState(getSavedPreviewVolume);
	const previousVolumeRef = useRef(volume > 0 ? volume : 1);
	const [isMuted, setIsMuted] = useState(volume === 0);

	useEffect(() => {
		const audio = audioRef.current;
		if (audio) {
			audio.volume = volume * MAX_PREVIEW_VOLUME;
			audio.muted = isMuted;
		}
	}, [isMuted, volume]);

	useEffect(() => () => {
		if (fadeFrameRef.current !== null) window.cancelAnimationFrame(fadeFrameRef.current);
	}, []);

	const cancelFadeIn = () => {
		if (fadeFrameRef.current === null) return;
		window.cancelAnimationFrame(fadeFrameRef.current);
		fadeFrameRef.current = null;
	};

	const startFadeIn = () => {
		const audio = audioRef.current;
		if (!audio) return;
		cancelFadeIn();
		const targetVolume = volume * MAX_PREVIEW_VOLUME;
		if (audio.currentTime > 0.1) {
			audio.volume = targetVolume;
			return;
		}
		if (audio.muted || targetVolume === 0) {
			audio.volume = targetVolume;
			return;
		}

		audio.volume = 0;
		const startedAt = window.performance.now();
		const updateVolume = (now: number) => {
			if (audio.paused || audio.muted) {
				fadeFrameRef.current = null;
				return;
			}
			const progress = Math.min(1, (now - startedAt) / FADE_IN_DURATION_MS);
			const easedProgress = 1 - (1 - progress) ** 2;
			audio.volume = targetVolume * easedProgress;
			if (progress < 1) fadeFrameRef.current = window.requestAnimationFrame(updateVolume);
			else fadeFrameRef.current = null;
		};
		fadeFrameRef.current = window.requestAnimationFrame(updateVolume);
	};

	const togglePreview = async () => {
		const audio = audioRef.current;
		if (!audio) return;
		if (audio.paused) {
			setShowControls(true);
			if (!audio.muted && audio.currentTime <= 0.1) audio.volume = 0;
			try {
				await audio.play();
			}
			catch {
				setIsPlaying(false);
			}
		}
		else {
			cancelFadeIn();
			audio.pause();
		}
	};

	const stopPreview = () => {
		const audio = audioRef.current;
		if (!audio) return;
		cancelFadeIn();
		audio.pause();
		audio.currentTime = 0;
		setCurrentTime(0);
		setIsPlaying(false);
	};

	const seekPreview = (event: ChangeEvent<HTMLInputElement>) => {
		const audio = audioRef.current;
		if (!audio) return;
		const nextTime = Number(event.target.value);
		audio.currentTime = nextTime;
		setCurrentTime(nextTime);
	};

	const changeVolume = (event: ChangeEvent<HTMLInputElement>) => {
		const audio = audioRef.current;
		if (!audio) return;
		cancelFadeIn();
		const nextVolume = Number(event.target.value);
		audio.volume = nextVolume * MAX_PREVIEW_VOLUME;
		audio.muted = nextVolume === 0;
		setVolume(nextVolume);
		setIsMuted(nextVolume === 0);
		if (nextVolume > 0) previousVolumeRef.current = nextVolume;
		try {
			window.localStorage.setItem(PREVIEW_VOLUME_STORAGE_KEY, nextVolume.toString());
		}
		catch {
			// Playback still works when storage is unavailable.
		}
	};

	const toggleMute = () => {
		const audio = audioRef.current;
		if (!audio) return;
		cancelFadeIn();
		if (audio.muted) {
			const restoredVolume = previousVolumeRef.current;
			audio.muted = false;
			audio.volume = restoredVolume * MAX_PREVIEW_VOLUME;
			setVolume(restoredVolume);
			setIsMuted(false);
		}
		else {
			if (volume > 0) previousVolumeRef.current = volume;
			audio.muted = true;
			setVolume(0);
			setIsMuted(true);
		}
	};

	const progress = duration > 0 ? currentTime / duration * 100 : 0;

	return (
		<div className={styles.preview_player}>
			<audio ref={audioRef}
			       preload="none"
			       src={`https://b.ppy.sh/preview/${setId}.mp3`}
			       onLoadedMetadata={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
			       onDurationChange={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
			       onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
			       onPlay={() => {
				       setIsPlaying(true);
				       startFadeIn();
			       }}
			       onPause={() => {
				       cancelFadeIn();
				       setIsPlaying(false);
			       }}
			       onEnded={() => {
				       cancelFadeIn();
				       setIsPlaying(false);
				       setCurrentTime(0);
			       }}/>
			<button className={styles.preview_button}
			        type="button"
			        aria-label={isPlaying ? "Pause beatmap preview" : "Play beatmap preview"}
			        aria-pressed={isPlaying}
			        onClick={togglePreview}>
				<FontAwesome prefix="fas" name={isPlaying ? "pause" : "play"}/>
				<span>{isPlaying ? "Pause preview" : "Play preview"}</span>
			</button>
			{showControls && typeof document !== "undefined" && createPortal(
				<div className={styles.preview_controls} aria-label="Preview controls">
					<button className={styles.preview_transport}
					        type="button"
					        aria-label={isPlaying ? "Pause beatmap preview" : "Play beatmap preview"}
					        aria-pressed={isPlaying}
					        onClick={togglePreview}>
						<FontAwesome prefix="fas" name={isPlaying ? "pause" : "play"}/>
					</button>
					<button className={styles.preview_transport}
					        type="button"
					        aria-label="Stop beatmap preview"
					        onClick={stopPreview}>
						<FontAwesome prefix="fas" name="stop"/>
					</button>
					<input className={styles.preview_seek}
					       type="range"
					       min="0"
					       max={duration || 0}
					       step="0.1"
					       value={Math.min(currentTime, duration || 0)}
					       aria-label="Preview playback position"
					       style={{ "--preview-progress": `${progress}%` } as CSSProperties}
					       onChange={seekPreview}/>
					<output className={styles.preview_time} aria-live="off">
						{formatTime(currentTime)} / {formatTime(duration)}
					</output>
					<button className={styles.preview_mute}
					        type="button"
					        aria-label={isMuted ? "Unmute preview" : "Mute preview"}
					        aria-pressed={isMuted}
					        onClick={toggleMute}>
						<FontAwesome prefix="fas" name={isMuted || volume === 0 ? "volume-xmark" : "volume-high"}/>
					</button>
					<input className={styles.preview_volume}
					       type="range"
					       min="0"
					       max="1"
					       step="0.05"
					       value={volume}
					       aria-label="Preview volume"
					       aria-valuetext={`${Math.round(volume * 100)}%`}
					       style={{ "--preview-progress": `${volume * 100}%` } as CSSProperties}
					       onChange={changeVolume}/>
				</div>,
				document.body)}
		</div>
	);
}
