"use client";

import { applyAccentColor, getAccentHue, hueToAccentColor } from "@/lib/accent-color";

import type { CustomAchievementSettings } from "@/lib/custom-achievements";

import { useState, useTransition } from "react";
import type { CSSProperties } from "react";
import FontAwesome from "@/components/font-awesome";
import ProfileUiSettings from "@/components/settings/profile-ui-settings";
import ScoreResetSettings from "@/components/settings/score-reset-settings";
import { readMutationResponse } from "@/lib/mutation-response";
import type { ProfileUiItem } from "@/lib/profile-ui";
import {
	DEFAULT_WEB_THEME,
	getWebThemeName,
	WebTheme,
	webThemeValues,
} from "@/lib/theme";
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
	"--settings-accent-preview": string;
};

type ProfileUiEditorConfig = {
	profileId: number;
	initialContents: ProfileUiItem[];
	customAchievements?: CustomAchievementSettings;
	canUseSupporterFeatures: boolean;
	bannerUrl: string;
	backgroundUrl: string;
};

export default function ThemeSettingsForm({
	initialTheme,
	initialHue,
	initialColor = null,
	initialCustomAppearance,
	initialIsPrivate,
	initialUseWebsiteAppearance,
	websiteTheme,
	websiteHue,
	websiteColor,
	canResetScores = false,
	scope = "website",
	profileUiEditor,
}: Readonly<{
	initialTheme: WebTheme;
	initialHue: number | null;
	initialColor?: string | null;
	initialCustomAppearance?: boolean;
	initialIsPrivate?: boolean;
	initialUseWebsiteAppearance?: boolean;
	websiteTheme?: WebTheme;
	websiteHue?: number | null;
	websiteColor?: string | null;
	canResetScores?: boolean;
	scope?: "website" | "personal" | "clan";
	profileUiEditor?: ProfileUiEditorConfig;
}>) {
	const [theme, setTheme] = useState(initialTheme);
	const [savedTheme, setSavedTheme] = useState(initialTheme);
	const [hue, setHue] = useState(initialHue);
	const [savedHue, setSavedHue] = useState(initialHue);
	const [color, setColor] = useState(initialColor);
	const [savedColor, setSavedColor] = useState(initialColor);
	const [customAppearance, setCustomAppearance] = useState(
		initialCustomAppearance ?? true,
	);
	const [savedCustomAppearance, setSavedCustomAppearance] = useState(
		initialCustomAppearance ?? true,
	);
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
	const [customColor, setCustomColor] = useState(
		initialColor ?? hueToAccentColor(initialHue ?? SETTINGS_DEFAULT_HUE),
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
	const isUsingWebsiteAppearance =
		isPersonalProfile && customAppearance && useWebsiteAppearance;
	const isAppearanceLocked = !customAppearance || isUsingWebsiteAppearance;
	const hasChanges =
		theme !== savedTheme ||
		hue !== savedHue ||
		color !== savedColor ||
		(initialCustomAppearance !== undefined &&
			customAppearance !== savedCustomAppearance) ||
		(initialIsPrivate !== undefined && isPrivate !== savedIsPrivate) ||
		(initialUseWebsiteAppearance !== undefined &&
			useWebsiteAppearance !== savedUseWebsiteAppearance);
	const huePreviewStyle: HuePreviewStyle = {
		"--settings-hue-preview": getAccentHue(customColor) ?? SETTINGS_DEFAULT_HUE,
		"--settings-accent-preview": customColor,
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
									color,
									isPrivate,
									...(!isClan && {
										useWebsiteAppearance,
										customAppearance,
									}),
								}
								: { theme, hue, color, customAppearance },
						),
					},
				);
				const result = await readMutationResponse(response);
				setStatus(result);
				if (!result.success) return;
				
				setSavedTheme(theme);
				setSavedHue(hue);
				setSavedColor(color);
				setSavedCustomAppearance(customAppearance);
				if (isProfileConfiguration) setSavedIsPrivate(isPrivate);
				if (isPersonalProfile)
					setSavedUseWebsiteAppearance(
						customAppearance ? useWebsiteAppearance : false,
					);
				if (!isProfileConfiguration) {
					document.documentElement.dataset.theme = getWebThemeName(
						customAppearance ? theme : DEFAULT_WEB_THEME,
					);
					applyAccentColor(document.documentElement, customAppearance ? color : null, customAppearance ? hue : null, SETTINGS_DEFAULT_HUE);
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
              <FontAwesome prefix="fad" name="lock"/>
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
            <span/>
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
				{isPersonalProfile && profileUiEditor && (
					<ProfileUiSettings
						profileId={profileUiEditor.profileId}
						initialContents={profileUiEditor.initialContents}
						customAchievements={profileUiEditor.customAchievements}
						canUseSupporterFeatures={profileUiEditor.canUseSupporterFeatures}
						bannerUrl={profileUiEditor.bannerUrl}
						backgroundUrl={profileUiEditor.backgroundUrl}
						profileTheme={theme}
						profileHue={customAppearance ? hue : null}
						profileColor={customAppearance ? color : null}
					/>
				)}
				{initialCustomAppearance !== undefined && !isClan && (
					<label className={styles.toggle_row}>
              <span className={styles.toggle_copy}>
                <span className={styles.toggle_icon}>
                  <FontAwesome prefix="fad" name="palette"/>
                </span>
                <span>
                  <strong>
                    {isPersonalProfile
	                    ? "Customize profile appearance"
	                    : "Customize website appearance"}
                  </strong>
                  <small>
                    {isPersonalProfile
	                    ? "Use your own theme and accent color on profile pages."
	                    : "Use your own theme and accent color instead of the defaults."}
                  </small>
                </span>
              </span>
						<input
							type="checkbox"
							checked={customAppearance}
							disabled={isPending}
							onChange={(event) => {
								const nextValue = event.currentTarget.checked;
								setCustomAppearance(nextValue);
								if (!nextValue && isPersonalProfile)
									setUseWebsiteAppearance(false);
								setStatus(null);
							}}
						/>
						<span className={styles.toggle} aria-hidden="true">
                <span/>
              </span>
					</label>
				)}
				{isPersonalProfile &&
					initialUseWebsiteAppearance !== undefined &&
					websiteTheme !== undefined &&
					websiteHue !== undefined && (
						<label
							className={styles.toggle_row}
							data-disabled={!customAppearance}
						>
              <span className={styles.toggle_copy}>
                <span className={styles.toggle_icon}>
                  <FontAwesome prefix="fad" name="link"/>
                </span>
                <span>
                  <strong>Use website appearance</strong>
                  <small>
                    Keep your profile theme and accent color synchronized with Website
                    Appearance.
                  </small>
                </span>
              </span>
							<input
								type="checkbox"
								checked={useWebsiteAppearance}
								disabled={isPending || !customAppearance}
								onChange={(event) => {
									const nextValue = event.currentTarget.checked;
									setUseWebsiteAppearance(nextValue);
									if (nextValue) {
										setTheme(websiteTheme);
										setHue(websiteHue);
										setColor(websiteColor ?? null);
										setCustomColor(websiteColor ?? hueToAccentColor(websiteHue ?? SETTINGS_DEFAULT_HUE));
									}
									setStatus(null);
								}}
							/>
							<span className={styles.toggle} aria-hidden="true">
                <span/>
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
								data-appearance-locked={isAppearanceLocked}
								role="radio"
								aria-checked={theme === value}
								disabled={isPending || isAppearanceLocked}
								onClick={() => {
									setTheme(value);
									setStatus(null);
								}}
							>
                <span className={styles.theme_preview} aria-hidden="true">
                  <span/>
                  <span/>
                  <span/>
                </span>
								<span className={styles.theme_option_copy}>
                  <span className={styles.theme_option_title}>
                    <FontAwesome prefix="fad" name={details.icon}/>
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
						<span className={styles.hue_swatch} aria-hidden="true"/>
						<span className={styles.hue_copy}>
              <strong>Accent color</strong>
              <small>{hue === null && color === null ? "Page default" : customColor.toUpperCase()}</small>
            </span>
						<label
							className={styles.hue_toggle}
							data-appearance-locked={isAppearanceLocked}
						>
							<input
								type="checkbox"
								checked={hue !== null || color !== null}
								disabled={isPending || isAppearanceLocked}
								onChange={(event) => {
									const enabled = event.currentTarget.checked;
									setHue(enabled ? getAccentHue(customColor) : null);
									setColor(enabled ? customColor : null);
									setStatus(null);
								}}
							/>
							<span className={styles.toggle} aria-hidden="true">
                <span/>
              </span>
							<span>Custom color</span>
						</label>
					</div>
					<label className={`${styles.hue_slider} ${styles.accent_color_picker}`}>
						<span>Accent color</span>
						<output>{customColor.toUpperCase()}</output>
						<input
							type="color"
							value={customColor}
							disabled={isPending || isAppearanceLocked || (hue === null && color === null)}
							onChange={(event) => {
								const nextColor = event.currentTarget.value.toLowerCase();
								setCustomColor(nextColor);
								setColor(nextColor);
								setHue(getAccentHue(nextColor));
								setStatus(null);
							}}
						/>
					</label>
				</div>
			</div>

			{isPersonalProfile && (
				<ScoreResetSettings canResetScores={canResetScores}/>
			)}
			
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
							setColor(savedColor);
							setCustomAppearance(savedCustomAppearance);
							setIsPrivate(savedIsPrivate);
							setUseWebsiteAppearance(savedUseWebsiteAppearance);
							setCustomColor(savedColor ?? hueToAccentColor(savedHue ?? SETTINGS_DEFAULT_HUE));
							setStatus(null);
						}}
					>
						<FontAwesome prefix="fas" name="rotate-left"/>
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
