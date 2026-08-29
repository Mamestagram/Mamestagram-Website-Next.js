import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { isSameOriginMutation } from "@/lib/api-request";
import { writeError } from "@/lib/log";
import {
  type FriendAction,
  MamestagramApiError,
  mutateFriendRelationship,
  OAuthAuthorizationRequiredError,
} from "@/lib/mamestagram-oauth";
import type { MutationResponse } from "@/lib/mutation-response";
import { getCurrentUser } from "@/lib/session";

type RelationshipRouteContext = {
  params: Promise<{ user_id: string }>;
};

type AuthorizedRelationship = {
  currentUserId: number;
  targetUserId: number;
};

type RelationshipAuthorization =
  | { success: true; relationship: AuthorizedRelationship }
  | { success: false; response: NextResponse<MutationResponse> };

const authorizeRelationshipMutation = async (
  request: NextRequest,
  context: RelationshipRouteContext,
): Promise<RelationshipAuthorization> => {
  if (!request.headers.get("origin") || !isSameOriginMutation(request))
    return {
      success: false,
      response: NextResponse.json(
        { success: false, message: "This request was blocked." },
        { status: 403 },
      ),
    };

  const currentUser = await getCurrentUser();
  if (!currentUser.isLoggedIn || !currentUser.id)
    return {
      success: false,
      response: NextResponse.json(
        { success: false, message: "You must be signed in." },
        { status: 401 },
      ),
    };

  const { user_id } = await context.params;
  const targetUserId = Number(user_id);
  if (
    !/^\d+$/u.test(user_id) ||
    !Number.isSafeInteger(targetUserId) ||
    targetUserId < 3
  )
    return {
      success: false,
      response: NextResponse.json(
        { success: false, message: "The player could not be found." },
        { status: 404 },
      ),
    };
  if (currentUser.id === targetUserId)
    return {
      success: false,
      response: NextResponse.json(
        { success: false, message: "You cannot follow yourself." },
        { status: 400 },
      ),
    };

  return {
    success: true,
    relationship: { currentUserId: currentUser.id, targetUserId },
  };
};

const revalidateRelationshipProfiles = (
  currentUserId: number,
  targetUserId: number,
) => {
  revalidatePath(`/profile/${currentUserId}`, "layout");
  revalidatePath(`/profile/${targetUserId}`, "layout");
};

const getApiErrorResponse = (error: MamestagramApiError) => {
  const status = [400, 403, 404, 409, 422].includes(error.status)
    ? error.status
    : 502;
  return NextResponse.json<MutationResponse>(
    {
      success: false,
      message:
        status === 502
          ? "The relationship service is currently unavailable."
          : error.message,
    },
    { status },
  );
};

const updateRelationship = async (
  request: NextRequest,
  context: RelationshipRouteContext,
  action: FriendAction,
): Promise<NextResponse<MutationResponse>> => {
  const authorization = await authorizeRelationshipMutation(request, context);
  if (!authorization.success) return authorization.response;

  const { currentUserId, targetUserId } = authorization.relationship;
  try {
    await mutateFriendRelationship(currentUserId, targetUserId, action);
    revalidateRelationshipProfiles(currentUserId, targetUserId);
    return NextResponse.json({
      success: true,
      message: action === "follow" ? "Player followed." : "Player unfollowed.",
    });
  } catch (error: unknown) {
    if (error instanceof OAuthAuthorizationRequiredError) {
      return NextResponse.json(
        {
          success: false,
          message: "Please sign out and sign in again before updating follows.",
        },
        { status: 401 },
      );
    }
    if (error instanceof MamestagramApiError) {
      if (![400, 403, 404, 409, 422].includes(error.status))
        void writeError(error, {
          source: "server",
          method: request.method,
          pathname: `/api/profile/relationship/${targetUserId}`,
          routeType: "profile-relationship-api",
        });
      return getApiErrorResponse(error);
    }

    void writeError(error, {
      source: "server",
      method: request.method,
      pathname: `/api/profile/relationship/${targetUserId}`,
      routeType: "profile-relationship",
    });
    return NextResponse.json(
      {
        success: false,
        message: "The relationship could not be updated.",
      },
      { status: 500 },
    );
  }
};

export const POST = async (
  request: NextRequest,
  context: RelationshipRouteContext,
) => updateRelationship(request, context, "follow");

export const DELETE = async (
  request: NextRequest,
  context: RelationshipRouteContext,
) => updateRelationship(request, context, "unfollow");
