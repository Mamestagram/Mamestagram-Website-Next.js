import { NextResponse, type NextRequest } from "next/server";
import { isSameOriginMutation } from "@/lib/api-request";
import { writeError } from "@/lib/log";
import {
	MamestagramApiError,
	OAuthAuthorizationRequiredError,
	resetMamestagramModeScores,
} from "@/lib/mamestagram-oauth";
import type { MutationResponse } from "@/lib/mutation-response";
import { Priv } from "@/lib/priv";
import { isScoreResetMode } from "@/lib/score-reset";
import { getCurrentUser } from "@/lib/session";

const getApiErrorResponse = (error: MamestagramApiError) => {
	if (error.status === 503)
		return NextResponse.json<MutationResponse>(
			{
				success: false,
				message:
					"Your scores may already be hidden, but statistics synchronization failed. It is safe to retry.",
			},
			{ status: 503 },
		);

	if (
		error.status === 403 &&
		`${error.code} ${error.hint}`.toLowerCase().includes("scope")
	)
		return NextResponse.json<MutationResponse>(
			{
				success: false,
				message:
					"Please sign out and sign in again to authorize score resets.",
			},
			{ status: 401 },
		);

	if (error.status === 403)
		return NextResponse.json<MutationResponse>(
			{
				success: false,
				message:
					error.hint ||
					"Score resets are available to active or lifetime supporters.",
			},
			{ status: 403 },
		);

	const status = [400, 404, 409, 422].includes(error.status)
		? error.status
		: 502;
	return NextResponse.json<MutationResponse>(
		{
			success: false,
			message:
				status === 502
					? "The score reset service is currently unavailable."
					: error.hint || "The selected scores could not be reset.",
		},
		{ status },
	);
};

export const DELETE = async (
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
	if (
		currentUser.priv === undefined ||
		(currentUser.priv & Priv.supporter) === 0
	)
		return NextResponse.json(
			{
				success: false,
				message:
					"Supporter only",
			},
			{ status: 403 },
		);

	const mode = request.nextUrl.searchParams.get("mode");
	if (!isScoreResetMode(mode))
		return NextResponse.json(
			{ success: false, message: "The selected score mode is invalid." },
			{ status: 400 },
		);

	try {
		await resetMamestagramModeScores(currentUser.id, mode);
		return NextResponse.json({
			success: true,
			message: "Scores hidden and player statistics rebuilt.",
		});
	} catch (error: unknown) {
		if (error instanceof OAuthAuthorizationRequiredError)
			return NextResponse.json(
				{
					success: false,
					message:
						"Please sign out and sign in again to authorize score resets.",
				},
				{ status: 401 },
			);

		if (error instanceof MamestagramApiError) {
			if (![400, 403, 404, 409, 422].includes(error.status))
				void writeError(error, {
					source: "server",
					method: request.method,
					pathname: "/api/settings/score-reset",
					routeType: "self-score-reset-api",
				});
			return getApiErrorResponse(error);
		}

		void writeError(error, {
			source: "server",
			method: request.method,
			pathname: "/api/settings/score-reset",
			routeType: "self-score-reset",
		});
		return NextResponse.json(
			{
				success: false,
				message: "The selected scores could not be reset.",
			},
			{ status: 500 },
		);
	}
};
