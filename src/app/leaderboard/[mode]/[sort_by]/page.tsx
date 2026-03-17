import { getLeaderboard, SortBy } from "@/database/leaderboard";
import { Mode, ModeNum } from "@/lib/mode";
import TableHeader from "@/components/leaderboard/table-header";

export default async function Leaderboard({ params, searchParams }: {
	params: Promise<{
		mode: Mode,
		sort_by: SortBy
	}>,
	searchParams: Promise<{
		page?: number,
		country?: string,
		clan?: null
	}>
}) {
	const { mode, sort_by } = await params;
	const { page = 1, country, clan } = await searchParams;
	const { countries, ranking, pages } = await getLeaderboard(ModeNum[mode], sort_by, page, clan !== undefined, country);
	
	return (
		<>
			<table>
				<tbody>
				<TableHeader sortBy={sort_by}/>
				
				</tbody>
			</table>
		</>
	);
}