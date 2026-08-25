import { NextResponse, type NextRequest } from "next/server";
import { searchUsers, type UserSearchResult } from "@/database/search";
import { writeError } from "@/lib/log";

type UserSearchResponse = {
	users: UserSearchResult[],
	error?: string
};

export const GET = async (request: NextRequest): Promise<NextResponse<UserSearchResponse>> => {
	const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
	
	if (!query) return NextResponse.json({ users: [] });
	if (query.length > 64)
		return NextResponse.json({ users: [], error: "Search query is too long." }, { status: 400 });
	
	try {
		return NextResponse.json({ users: await searchUsers(query) });
	} catch (error: unknown) {
		void writeError(error);
		return NextResponse.json(
			{ users: [], error: "Player search is temporarily unavailable." },
			{ status: 500 }
		);
	}
};
