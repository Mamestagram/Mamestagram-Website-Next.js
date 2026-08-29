import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import {
  updateClanProfileConfiguration,
  updateProfileConfiguration,
} from "@/database/settings";
import { isSameOriginMutation } from "@/lib/api-request";
import { writeError } from "@/lib/log";
import type { MutationResponse } from "@/lib/mutation-response";
import { getCurrentUser } from "@/lib/session";
import { isWebHue, isWebTheme } from "@/lib/theme";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const PATCH = async (
  request: NextRequest,
): Promise<NextResponse<MutationResponse>> => {
  if (!isSameOriginMutation(request))
    return NextResponse.json(
      { success: false, message: "This request was blocked." },
      { status: 403 },
    );

  const currentUser = await getCurrentUser();
  if (!currentUser.isLoggedIn || !currentUser.id)
    return NextResponse.json(
      { success: false, message: "You must be signed in." },
      { status: 401 },
    );

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "The profile appearance request is invalid." },
      { status: 400 },
    );
  }
  const scope = request.nextUrl.searchParams.get("scope");
  if (scope !== null && scope !== "clan")
    return NextResponse.json(
      { success: false, message: "The profile scope is invalid." },
      { status: 400 },
    );
  const isClan = scope === "clan";
  if (
    !isRecord(body) ||
    typeof body.isPrivate !== "boolean" ||
    !isWebTheme(body.theme) ||
    (body.hue !== null && !isWebHue(body.hue)) ||
    (!isClan && typeof body.useWebsiteAppearance !== "boolean")
  )
    return NextResponse.json(
      { success: false, message: "The selected appearance is invalid." },
      { status: 400 },
    );
  const useWebsiteAppearance =
    !isClan && typeof body.useWebsiteAppearance === "boolean"
      ? body.useWebsiteAppearance
      : false;

  try {
    const profileId = isClan
      ? await updateClanProfileConfiguration(
          currentUser.id,
          body.isPrivate,
          body.theme,
          body.hue,
        )
      : (await updateProfileConfiguration(
            currentUser.id,
            body.isPrivate,
            body.theme,
            body.hue,
            useWebsiteAppearance,
          ))
        ? currentUser.id
        : null;
    if (profileId === null)
      return NextResponse.json(
        {
          success: false,
          message: isClan
            ? "Only the clan owner can update the clan profile configuration."
            : "This account could not be found.",
        },
        { status: isClan ? 403 : 404 },
      );

    revalidatePath(`/profile/${profileId}`, "layout");
    revalidatePath("/settings");
    return NextResponse.json({
      success: true,
      message: `${isClan ? "Clan profile" : "Profile"} configuration updated.`,
    });
  } catch (error: unknown) {
    void writeError(error, {
      source: "server",
      method: "PATCH",
      pathname: "/api/settings/profile-appearance",
      routeType: isClan
        ? "clan-profile-configuration-settings"
        : "profile-configuration-settings",
    });
    return NextResponse.json(
      {
        success: false,
        message: `${isClan ? "Clan profile" : "Profile"} configuration could not be updated.`,
      },
      { status: 500 },
    );
  }
};
