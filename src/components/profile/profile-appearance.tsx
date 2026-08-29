"use client";

import { useLayoutEffect } from "react";
import { getWebThemeName, type WebTheme } from "@/lib/theme";

const PROFILE_DEFAULT_HUE = 210;

export default function ProfileAppearance({
  theme,
  hue,
}: Readonly<{ theme: WebTheme; hue: number | null }>) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const previousTheme = root.getAttribute("data-theme");
    const previousUserHue = root.getAttribute("data-user-hue");
    const previousInlineHue = root.style.getPropertyValue("--user-hue");
    const previousInlineHuePriority =
      root.style.getPropertyPriority("--user-hue");

    root.dataset.profileAppearance = "true";
    root.dataset.theme = getWebThemeName(theme);
    if (hue === null) {
      delete root.dataset.userHue;
      root.style.setProperty("--user-hue", String(PROFILE_DEFAULT_HUE));
    } else {
      root.dataset.userHue = String(hue);
      root.style.setProperty("--user-hue", String(hue));
    }

    return () => {
      delete root.dataset.profileAppearance;
      if (previousTheme === null) delete root.dataset.theme;
      else root.setAttribute("data-theme", previousTheme);
      if (previousUserHue === null) delete root.dataset.userHue;
      else root.setAttribute("data-user-hue", previousUserHue);
      if (previousInlineHue === "") root.style.removeProperty("--user-hue");
      else
        root.style.setProperty(
          "--user-hue",
          previousInlineHue,
          previousInlineHuePriority,
        );
    };
  }, [hue, theme]);

  return <span data-profile-appearance hidden aria-hidden="true" />;
}
