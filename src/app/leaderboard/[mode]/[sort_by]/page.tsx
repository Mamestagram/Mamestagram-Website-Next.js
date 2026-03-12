import type { SortBy } from "@/database/leaderboard";
import { Mode } from "@/lib/mode";
import TableHeader from "@/components/leaderboard/table-header";

export default async function Leaderboard({ params }: {
	params: Promise<{
		mode: Mode,
		sort_by: SortBy
	}>
}) {
	const { mode, sort_by } = await params;
	
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