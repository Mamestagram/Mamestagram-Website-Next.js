import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import FontAwesome from "@/components/font-awesome";
import FormattedNumber from "@/components/formatted-number";
import DashboardSectionHeading from "@/components/home/dashboard-section-heading";
import ModeIcon from "@/components/mode-icon";
import type {
  HomePlayerCounts,
  HomeRecentActivity,
  HomeTopPlayer,
} from "@/database/home";
import HomeRecentActivityCard from "@/components/home/home-recent-activity-card";
import PlayerAvatar from "@/components/player-avatar";
import { ModeNum, OsuMode, type VnMode } from "@/lib/mode";
import styles from "@s/home.module.css";

type HomeHeroStyle = CSSProperties & {
  "--home-hero-image": string;
};

type HomeActivityStyle = CSSProperties & {
  "--activity-background-image": string;
};

const formatRelativeTime = (date: Date) => {
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return months < 12 ? `${months}mo ago` : `${Math.floor(days / 365)}y ago`;
};

const statCards = (counts: HomePlayerCounts | null) =>
  [
    {
      icon: "signal-stream",
      label: "Online now",
      value: counts?.online,
      tone: "live",
    },
    {
      icon: "users",
      label: "Registered players",
      value: counts?.total,
      tone: "players",
    },
    {
      icon: "computer-mouse",
      label: "Stable online",
      value: counts?.stable,
      tone: "stable",
    },
    {
      icon: "rocket-launch",
      label: "Lazer online",
      value: counts?.lazer,
      tone: "lazer",
    },
  ] as const;

const quickLinks = [
  {
    icon: "trophy",
    title: "Leaderboard",
    href: "/leaderboard/std/performance",
  },
  {
    icon: "book-open",
    title: "Documents",
    href: "/documents",
  },
  {
    icon: "rocket-launch",
    title: "Lazer",
    href: "/lazer",
  },
  {
    icon: "heart",
    title: "Support",
    href: "/support",
  },
] as const;

const topPlayerModes: Record<
  ModeNum,
  { iconMode: VnMode; label: string; profileMode: OsuMode }
> = {
  [ModeNum.std]: {
    iconMode: OsuMode.std,
    label: "vn!std",
    profileMode: OsuMode.std,
  },
  [ModeNum.taiko]: {
    iconMode: OsuMode.taiko,
    label: "vn!taiko",
    profileMode: OsuMode.taiko,
  },
  [ModeNum.ctb]: {
    iconMode: OsuMode.ctb,
    label: "vn!ctb",
    profileMode: OsuMode.ctb,
  },
  [ModeNum.mania]: {
    iconMode: OsuMode.mania,
    label: "vn!mania",
    profileMode: OsuMode.mania,
  },
  [ModeNum.rxstd]: {
    iconMode: OsuMode.std,
    label: "rx!std",
    profileMode: OsuMode.rxstd,
  },
  [ModeNum.rxtaiko]: {
    iconMode: OsuMode.taiko,
    label: "rx!taiko",
    profileMode: OsuMode.rxtaiko,
  },
  [ModeNum.rxctb]: {
    iconMode: OsuMode.ctb,
    label: "rx!ctb",
    profileMode: OsuMode.rxctb,
  },
  [ModeNum.apstd]: {
    iconMode: OsuMode.std,
    label: "ap!std",
    profileMode: OsuMode.apstd,
  },
};

export default function HomeDashboard({
  playerCounts,
  topPlayers,
  recentActivity,
  baseDomain,
  isLoggedIn,
}: Readonly<{
  playerCounts: HomePlayerCounts | null;
  topPlayers: HomeTopPlayer[];
  recentActivity: HomeRecentActivity[];
  baseDomain: string;
  isLoggedIn: boolean;
}>) {
  const heroStyle: HomeHeroStyle = {
    "--home-hero-image": `url("https://img.${baseDomain}/2")`,
  };

  return (
    <div className={styles.page}>
      <section
        className={styles.hero}
        data-page-enter="section"
        style={heroStyle}
      >
        <div className={styles.hero_inner}>
          <div className={styles.hero_copy}>
            <p className={styles.hero_kicker}>Welcome to</p>
            <h1>
              Mamestagram <span>Dashboard</span>
            </h1>
            <div className={styles.hero_actions}>
              <Link
                className={styles.primary_action}
                href={isLoggedIn ? "/documents#connect" : "/register"}
              >
                <FontAwesome prefix="fas" name="circle-play" />
                Join Mamestagram
              </Link>
              <Link
                className={styles.secondary_action}
                href="/leaderboard/std/performance"
              >
                View leaderboard
                <FontAwesome prefix="fas" name="arrow-right" />
              </Link>
            </div>
          </div>
          <div className={styles.hero_visual} aria-hidden="true">
            <div className={styles.logo_orbit}>
              <span></span>
              <span></span>
              <Image
                src="/images/logo.png"
                alt="Mamestagram logo"
                width={154}
                height={154}
                draggable={false}
                priority
              />
            </div>
            <div className={styles.hero_counter}>
              <span>
                <i></i>Online
              </span>
              <strong>{playerCounts ? <FormattedNumber value={playerCounts.online} /> : "—"}</strong>
            </div>
          </div>
        </div>
      </section>
      <div className={styles.dashboard}>
        <section className={styles.dashboard_section} data-page-enter="section">
          <DashboardSectionHeading
            icon="chart-mixed"
            title="Live Stats"
          />
          <div className={styles.stats_grid}>
            {statCards(playerCounts).map((stat) => (
              <article
                key={stat.label}
                className={styles.stat_card}
                data-tone={stat.tone}
                data-page-enter="box"
              >
                <span className={styles.stat_icon}>
                  <FontAwesome prefix="fad" name={stat.icon} />
                </span>
                <span className={styles.stat_copy}>
                  <small>{stat.label}</small>
                  <strong>{stat.value === undefined || stat.value === null
                    ? "—"
                    : <FormattedNumber value={stat.value} />}</strong>
                </span>
                <span className={styles.stat_signal}></span>
              </article>
            ))}
          </div>
        </section>

        <div className={styles.dashboard_grid}>
          <section className={styles.dashboard_panel} data-page-enter="section">
            <DashboardSectionHeading
              icon="crown"
              title="Top Players"
              href="/leaderboard/std/performance"
              action="Full ranking"
            />
            {topPlayers.length > 0 ? (
              <ol className={styles.top_players}>
                {topPlayers.map((player) => {
                  const mode = topPlayerModes[player.mode];
                  const profileHref = `/profile/${player.id}/${mode.profileMode}`;
                  return (
                    <li
                      key={`${player.mode}-${player.id}`}
                      data-page-enter="box"
                      data-rendering-item="large"
                    >
                      <Link className={styles.player_card} href={profileHref}>
                        <PlayerAvatar
                          userId={player.id}
                          name={player.name}
                          baseDomain={baseDomain}
                          cosmetics={player.cosmetics}
                          className={styles.player_avatar}
                          sizes="110px"
                        />
                        <span className={styles.player_identity}>
                          <strong>{player.name}</strong>
                          <small>
                            <ModeIcon mode={mode.iconMode} />
                            {mode.label}
                          </small>
                        </span>
                        <strong className={styles.player_pp}>
                          <FormattedNumber value={Math.round(player.pp)} />
                          <small>pp</small>
                        </strong>
                        <FontAwesome
                          className={styles.row_arrow}
                          prefix="fas"
                          name="chevron-right"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className={styles.panel_empty}>
                <FontAwesome prefix="fad" name="ranking-star" />
                <span>
                  <strong>Rankings unavailable</strong>
                  <small>Player rankings could not be loaded.</small>
                </span>
              </div>
            )}
          </section>

          <section className={styles.dashboard_panel} data-page-enter="section">
            <DashboardSectionHeading icon="link" title="Quick Links" />
            <div className={styles.quick_links}>
              {quickLinks.map((quickLink) => (
                <Link
                  key={quickLink.title}
                  href={quickLink.href}
                  data-page-enter="box"
                >
                  <span>
                    <FontAwesome prefix="fad" name={quickLink.icon} />
                  </span>
                  <span>
                    <strong>{quickLink.title}</strong>
                  </span>
                  <FontAwesome prefix="fas" name="chevron-right" />
                </Link>
              ))}
              <a
                href="https://discord.com/invite/xqncGVrHSf"
                target="_blank"
                rel="noopener noreferrer"
                data-page-enter="box"
              >
                <span>
                  <FontAwesome prefix="fab" name="discord" />
                </span>
                <span>
                  <strong>Community</strong>
                </span>
                <FontAwesome prefix="fas" name="arrow-up-right" />
              </a>
              <a
                href={`https://market.${baseDomain}`}
                target="_blank"
                rel="noopener noreferrer"
                data-page-enter="box"
              >
                <span>
                  <FontAwesome prefix="fad" name="bag-shopping" />
                </span>
                <span>
                  <strong>Badge Market</strong>
                </span>
                <FontAwesome prefix="fas" name="arrow-up-right" />
              </a>
            </div>
          </section>
        </div>

        <section className={styles.dashboard_panel} data-page-enter="section">
          <DashboardSectionHeading
            icon="bolt"
            title="Recent Activity"
          />
          {recentActivity.length > 0 ? (
            <ol className={styles.activity_list}>
              {recentActivity.map((activity) => {
                const activityStyle: HomeActivityStyle = {
                  "--activity-background-image": `url("https://assets.ppy.sh/beatmaps/${activity.setId}/covers/cover.jpg")`,
                };
                const activityLabel = `${activity.artist} — ${activity.title}`;
                return (
                  <HomeRecentActivityCard
                    key={activity.id}
                    label={activityLabel}
                    beatmapHref={`/beatmaps/${activity.setId}/${activity.mapId}`}
                    replayUrl={`https://render.${baseDomain}/embed/${activity.id}`}
                    style={activityStyle}
                  >
                    <span
                      className={styles.activity_grade}
                      data-grade={activity.grade.toLowerCase()}
                    >
                      {activity.grade.replace(/H$/, "")}
                    </span>
                    <span className={styles.activity_copy}>
                      <span className={styles.activity_summary}>
                        <strong>{activity.name}</strong>
                        <span>took #1 on</span>
                      </span>
                      <span className={styles.activity_map}>
                        {activityLabel}
                      </span>
                    </span>
                    <span className={styles.activity_value}>
                      <strong className={styles.activity_pp}>
                        <span><FormattedNumber value={Math.round(activity.pp)} /></span>
                        <small>pp</small>
                      </strong>
                      <time
                        className={styles.activity_time}
                        dateTime={activity.playTime.toISOString()}
                      >
                        {formatRelativeTime(activity.playTime)}
                      </time>
                    </span>
                  </HomeRecentActivityCard>
                );
              })}
            </ol>
          ) : (
            <div className={styles.panel_empty}>
              <FontAwesome prefix="fad" name="waveform" />
              <span>
                <strong>No recent activity</strong>
                <small>New scores will appear here.</small>
              </span>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
