import { NextResponse, type NextRequest } from "next/server";
import { searchBeatmapsPage, searchClansPage, searchUsersPage } from "@/database/search";
import { writeError } from "@/lib/log";
import type { SearchResponse } from "@/lib/search";

const emptyResults: SearchResponse = {
	users: [],
	clans: [],
	beatmaps: [],
	totals: { users: 0, clans: 0, beatmaps: 0 }
};

export const GET = async (request: NextRequest): Promise<NextResponse<SearchResponse>> => {
	const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

	if (!query) return NextResponse.json(emptyResults);
	if (query.length > 64)
		return NextResponse.json({ ...emptyResults, error: "Search query is too long." }, { status: 400 });

	try {
		const [usersPage, clansPage, beatmapsPage] = await Promise.all([
			searchUsersPage(query, 1, 12),
			searchClansPage(query, 1, 12),
			searchBeatmapsPage(query, 1, 12)
		]);
		return NextResponse.json({
			users: usersPage.items,
			clans: clansPage.items,
			beatmaps: beatmapsPage.items,
			totals: {
				users: usersPage.total,
				clans: clansPage.total,
				beatmaps: beatmapsPage.total
			}
		});
	}
	catch (error: unknown) {
		void writeError(error);
		return NextResponse.json(
			{ ...emptyResults, error: "Search is temporarily unavailable." },
			{ status: 500 }
		);
	}
};
