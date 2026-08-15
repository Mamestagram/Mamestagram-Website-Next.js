"use client";

import Link from "next/link";
import {
  useId,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import FontAwesome from "@/components/font-awesome";
import ReplayViewer from "@/components/replay-viewer";
import styles from "@s/home.module.css";

export default function HomeRecentActivityCard({
  label,
  beatmapHref,
  replayUrl,
  style,
  children,
}: Readonly<{
  label: string;
  beatmapHref: string;
  replayUrl: string;
  style: CSSProperties;
  children: ReactNode;
}>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelId = useId();

  const toggleExpanded = () => setIsExpanded((expanded) => !expanded);
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggleExpanded();
  };

  return (
    <li style={style} data-expanded={isExpanded} data-page-enter="box">
      <div
        className={styles.activity_card}
        role="button"
        tabIndex={0}
        aria-label={`${label}. ${isExpanded ? "Hide" : "Show"} score actions.`}
        aria-expanded={isExpanded}
        aria-controls={panelId}
        onClick={toggleExpanded}
        onKeyDown={handleKeyDown}
      >
        {children}
        <FontAwesome
          className={styles.activity_expand_icon}
          prefix="fas"
          name="chevron-down"
        />
      </div>
      <div
        id={panelId}
        className={styles.activity_action_reveal}
        aria-hidden={!isExpanded}
        inert={!isExpanded}
      >
        <div className={styles.activity_action_inner}>
          <div className={styles.activity_actions}>
            <Link href={beatmapHref}>
              <FontAwesome prefix="fad" name="circle-info" />
              <span>Beatmap info</span>
              <FontAwesome prefix="fas" name="arrow-up-right" />
            </Link>
            <ReplayViewer
              label={label}
              replayUrl={replayUrl}
              buttonLabel="Watch replay"
            >
              <FontAwesome prefix="fad" name="circle-play" />
              <span>Watch replay</span>
              <FontAwesome prefix="fas" name="window-maximize" />
            </ReplayViewer>
          </div>
        </div>
      </div>
    </li>
  );
}
