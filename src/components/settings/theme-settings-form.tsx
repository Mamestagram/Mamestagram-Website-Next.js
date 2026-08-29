"use client";

import { useState, useTransition } from "react";
import type { CSSProperties } from "react";
import FontAwesome from "@/components/font-awesome";
import { readMutationResponse } from "@/lib/mutation-response";
import { getWebThemeName, WebTheme, webThemeValues } from "@/lib/theme";
import styles from "@s/settings.module.css";

const themeDetails = {
  [WebTheme.glass]: {
    name: "Glass",
    description:
      "The current layered glass interface with blur, gradients, and depth.",
    icon: "sparkles",
  },
  [WebTheme.legacy]: {
    name: "Legacy",
    description:
      "A flatter classic Mamestagram look based on each page's accent color.",
    icon: "clock-rotate-left",
  },
} satisfies Record<
  WebTheme,
  { name: string; description: string; icon: string }
>;

const SETTINGS_DEFAULT_HUE = 18;

type HuePreviewStyle = CSSProperties & {
  "--settings-hue-preview": number;
};

const applyDocumentHue = (hue: number | null) => {
  if (hue === null) {
    delete document.documentElement.dataset.userHue;
    document.documentElement.style.setProperty(
      "--user-hue",
      String(SETTINGS_DEFAULT_HUE),
    );
    return;
  }
  document.documentElement.dataset.userHue = String(hue);
  document.documentElement.style.setProperty("--user-hue", String(hue));
};

export default function ThemeSettingsForm({
  initialTheme,
  initialHue,
  initialIsPrivate,
  initialUseWebsiteAppearance,
  websiteTheme,
  websiteHue,
  scope = "website",
}: Readonly<{
  initialTheme: WebTheme;
  initialHue: number | null;
  initialIsPrivate?: boolean;
  initialUseWebsiteAppearance?: boolean;
  websiteTheme?: WebTheme;
  websiteHue?: number | null;
  scope?: "website" | "personal" | "clan";
}>) {
  const [theme, setTheme] = useState(initialTheme);
  const [savedTheme, setSavedTheme] = useState(initialTheme);
  const [hue, setHue] = useState(initialHue);
  const [savedHue, setSavedHue] = useState(initialHue);
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate ?? false);
  const [savedIsPrivate, setSavedIsPrivate] = useState(
    initialIsPrivate ?? false,
  );
  const [useWebsiteAppearance, setUseWebsiteAppearance] = useState(
    initialUseWebsiteAppearance ?? false,
  );
  const [savedUseWebsiteAppearance, setSavedUseWebsiteAppearance] = useState(
    initialUseWebsiteAppearance ?? false,
  );
  const [customHue, setCustomHue] = useState(
    initialHue ?? SETTINGS_DEFAULT_HUE,
  );
  const [status, setStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const isProfileConfiguration = scope !== "website";
  const isClan = scope === "clan";
  const isPersonalProfile = scope === "personal";
  const profileLabel = isClan ? "Clan profile" : "Profile";
  const isUsingWebsiteAppearance = isPersonalProfile && useWebsiteAppearance;
  const hasChanges =
    theme !== savedTheme ||
    hue !== savedHue ||
    (initialIsPrivate !== undefined && isPrivate !== savedIsPrivate) ||
    (initialUseWebsiteAppearance !== undefined &&
      useWebsiteAppearance !== savedUseWebsiteAppearance);
  const huePreviewStyle: HuePreviewStyle = {
    "--settings-hue-preview": customHue,
  };

  const saveSettings = () => {
    setStatus(null);
    startTransition(async () => {
      try {
        const response = await fetch(
          isProfileConfiguration
            ? `/api/settings/profile-appearance${isClan ? "?scope=clan" : ""}`
            : "/api/settings/theme",
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              isProfileConfiguration
                ? {
                    theme,
                    hue,
                    isPrivate,
                    ...(!isClan && { useWebsiteAppearance }),
                  }
                : { theme, hue },
            ),
          },
        );
        const result = await readMutationResponse(response);
        setStatus(result);
        if (!result.success) return;

        setSavedTheme(theme);
        setSavedHue(hue);
        if (isProfileConfiguration) setSavedIsPrivate(isPrivate);
        if (isPersonalProfile)
          setSavedUseWebsiteAppearance(useWebsiteAppearance);
        if (!isProfileConfiguration) {
          document.documentElement.dataset.theme = getWebThemeName(theme);
          applyDocumentHue(hue);
        }
      } catch {
        setStatus({
          success: false,
          message: `${isProfileConfiguration ? `${profileLabel} configuration` : "Appearance"} could not be updated.`,
        });
      }
    });
  };

  return (
    <div
      className={
        isProfileConfiguration
          ? `${styles.theme_settings} ${styles.profile_configuration}`
          : styles.theme_settings
      }
    >
      {isProfileConfiguration && initialIsPrivate !== undefined && (
        <label className={styles.toggle_row}>
          <span className={styles.toggle_copy}>
            <span className={styles.toggle_icon}>
              <FontAwesome prefix="fad" name="lock" />
            </span>
            <span>
              <strong>
                {isClan ? "Private clan profile" : "Private profile"}
              </strong>
              <small>
                {isClan
                  ? "Only the clan owner and moderators can view the clan profile when this is enabled."
                  : "Only you and moderators can view your profile when this is enabled."}
              </small>
            </span>
          </span>
          <input
            type="checkbox"
            checked={isPrivate}
            disabled={isPending}
            onChange={(event) => {
              setIsPrivate(event.currentTarget.checked);
              setStatus(null);
            }}
          />
          <span className={styles.toggle} aria-hidden="true">
            <span />
          </span>
        </label>
      )}

      <div
        className={
          isProfileConfiguration
            ? styles.profile_appearance_settings
            : styles.appearance_controls
        }
      >
        {isProfileConfiguration && (
          <div className={styles.profile_appearance_heading}>
            <h3>Profile appearance</h3>
          </div>
        )}
        {isPersonalProfile &&
          initialUseWebsiteAppearance !== undefined &&
          websiteTheme !== undefined &&
          websiteHue !== undefined && (
            <label className={styles.toggle_row}>
              <span className={styles.toggle_copy}>
                <span className={styles.toggle_icon}>
                  <FontAwesome prefix="fad" name="link" />
                </span>
                <span>
                  <strong>Use website appearance</strong>
                  <small>
                    Keep your profile theme and hue synchronized with Website
                    Appearance.
                  </small>
                </span>
              </span>
              <input
                type="checkbox"
                checked={useWebsiteAppearance}
                disabled={isPending}
                onChange={(event) => {
                  const nextValue = event.currentTarget.checked;
                  setUseWebsiteAppearance(nextValue);
                  if (nextValue) {
                    setTheme(websiteTheme);
                    setHue(websiteHue);
                    setCustomHue(websiteHue ?? SETTINGS_DEFAULT_HUE);
                  }
                  setStatus(null);
                }}
              />
              <span className={styles.toggle} aria-hidden="true">
                <span />
              </span>
            </label>
          )}
        <div
          className={styles.theme_options}
          role="radiogroup"
          aria-label={
            isProfileConfiguration ? `${profileLabel} theme` : "Website theme"
          }
        >
          {webThemeValues.map((value) => {
            const details = themeDetails[value];
            return (
              <button
                key={value}
                type="button"
                className={styles.theme_option}
                data-theme-preview={getWebThemeName(value)}
                data-selected={theme === value}
                data-appearance-locked={isUsingWebsiteAppearance}
                role="radio"
                aria-checked={theme === value}
                disabled={isPending || isUsingWebsiteAppearance}
                onClick={() => {
                  setTheme(value);
                  setStatus(null);
                }}
              >
                <span className={styles.theme_preview} aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                <span className={styles.theme_option_copy}>
                  <span className={styles.theme_option_title}>
                    <FontAwesome prefix="fad" name={details.icon} />
                    <strong>{details.name}</strong>
                    {theme === value && (
                      <FontAwesome
                        className={styles.theme_selected_check}
                        prefix="fas"
                        name="circle-check"
                      />
                    )}
                  </span>
                  <small>{details.description}</small>
                </span>
              </button>
            );
          })}
        </div>

        <div className={styles.hue_control} style={huePreviewStyle}>
          <div className={styles.hue_control_heading}>
            <span className={styles.hue_swatch} aria-hidden="true" />
            <span className={styles.hue_copy}>
              <strong>Color hue</strong>
              <small>{hue === null ? "Page default" : `${hue}°`}</small>
            </span>
            <label
              className={styles.hue_toggle}
              data-appearance-locked={isUsingWebsiteAppearance}
            >
              <input
                type="checkbox"
                checked={hue !== null}
                disabled={isPending || isUsingWebsiteAppearance}
                onChange={(event) => {
                  setHue(event.currentTarget.checked ? customHue : null);
                  setStatus(null);
                }}
              />
              <span className={styles.toggle} aria-hidden="true">
                <span />
              </span>
              <span>Custom hue</span>
            </label>
          </div>
          <label className={styles.hue_slider}>
            <span>Hue value</span>
            <output>{customHue}°</output>
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={customHue}
              disabled={isPending || isUsingWebsiteAppearance || hue === null}
              onChange={(event) => {
                const nextHue = Number(event.currentTarget.value);
                setCustomHue(nextHue);
                setHue(nextHue);
                setStatus(null);
              }}
            />
          </label>
        </div>
      </div>

      <div className={styles.form_footer}>
        <span
          className={styles.status}
          data-success={status?.success}
          role="status"
        >
          {status?.message}
        </span>
        <div className={styles.form_actions}>
          <button
            type="button"
            className={styles.danger_button}
            disabled={isPending || !hasChanges}
            onClick={() => {
              setTheme(savedTheme);
              setHue(savedHue);
              setIsPrivate(savedIsPrivate);
              setUseWebsiteAppearance(savedUseWebsiteAppearance);
              setCustomHue(savedHue ?? SETTINGS_DEFAULT_HUE);
              setStatus(null);
            }}
          >
            <FontAwesome prefix="fas" name="rotate-left" />
            Reset
          </button>
          <button
            type="button"
            className={styles.primary_button}
            disabled={isPending || !hasChanges}
            onClick={saveSettings}
          >
            <FontAwesome
              className={isPending ? styles.spinner : undefined}
              prefix="fas"
              name={isPending ? "spinner" : "check"}
            />
            {isPending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
